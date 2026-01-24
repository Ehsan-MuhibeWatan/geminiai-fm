import { NextRequest, userAgent, NextResponse } from "next/server";
import { VOICES } from "@/lib/library";
import { getClientIP, canUseAPI, recordSuccess } from "@/lib/rateLimitDb";
import { logActivity } from "@/lib/activity-logger";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const MAX_INPUT_LENGTH = 1000;
export const MAX_PROMPT_LENGTH = 1000;

const ttsClient = new TextToSpeechClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const LANGUAGE_VOICE_MAP: Record<string, { male: string; female: string }> = {
  // Switched Urdu to Wavenet because Neural2-D is currently invalid
  'ur': { female: 'ur-IN-Wavenet-A', male: 'ur-IN-Wavenet-B' }, 
  
  // Hindi Neural2-A/B are usually fine, but Wavenet is more stable across regions
  'hi': { female: 'hi-IN-Wavenet-A', male: 'hi-IN-Wavenet-B' }, 
  
  'ar': { female: 'ar-XA-Wavenet-A', male: 'ar-XA-Wavenet-B' },
  'es': { female: 'es-US-Neural2-A', male: 'es-US-Neural2-B' },
  'fr': { female: 'fr-FR-Neural2-A', male: 'fr-FR-Neural2-B' },
};

const US_VOICE_MAP: Record<string, string> = {
  'alloy': 'en-US-Neural2-F', 'nova': 'en-US-Neural2-H', 'shimmer': 'en-US-Journey-O',
  'coral': 'en-US-Studio-O', 'sage': 'en-US-Neural2-C', 'ash': 'en-US-Polyglot-1',
  'echo': 'en-US-Studio-M', 'onyx': 'en-US-Neural2-J', 'fable': 'en-GB-Neural2-D',
  'ballad': 'en-US-Journey-D', 'default': 'en-US-Neural2-F'
};

const MALE_PRESETS = ['ash', 'echo', 'onyx', 'fable', 'ballad'];

// Helper to detect Studio voices
function isStudioVoice(voiceName: string): string | boolean {
    return voiceName.includes("Studio");
}

async function handleRequest(req: NextRequest, method: 'GET' | 'POST') {
  fs.appendFileSync(
    '/tmp/ROUTE_PROOF.txt',
    'ROUTE HIT\n',
    { encoding: 'utf8' }
  );

  const ip = getClientIP(req);
  if (!canUseAPI(ip)) return new Response("Daily limit reached.", { status: 429 });

  let input = "", prompt = "", voice = "";
  const ua = userAgent(req);
  const isWav = ua.engine?.name === "Blink";
  const response_format = isWav ? "LINEAR16" : "MP3";
  const contentType = isWav ? "audio/wav" : "audio/mpeg";

  if (method === 'GET') {
    const params = new URL(req.url).searchParams;
    input = params.get("input") || ""; prompt = params.get("prompt") || ""; voice = params.get("voice") || "";
  } else {
    const fd = await req.formData();
    input = fd.get("input")?.toString() || ""; prompt = fd.get("prompt")?.toString() || ""; voice = fd.get("voice")?.toString() || "";
  }

  input = input.slice(0, MAX_INPUT_LENGTH);
  if (!VOICES.includes(voice)) return new Response("Invalid voice", { status: 400 });

  try {
    // ----------------------------------------------------
    // 👇 LOGGER IS HERE (Safest Place - Before Google Call)
    logActivity(ip, input, voice);
    // ----------------------------------------------------

    let finalInput: any = { text: input };
    let targetLanguage = 'en-US';
    let selectedGoogleVoice = US_VOICE_MAP[voice] || US_VOICE_MAP['default'];
    let detectedLang = 'en';

    if (input.length > 2) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            
            // Fixed Syntax: Added backticks (` `)
            const langPrompt = `Detect language ISO code (e.g. en, ur, hi) for: "${input.slice(0, 50)}"`;
            const langResult = await model.generateContent(langPrompt);
            const langCode = langResult.response.text().toLowerCase().trim().slice(0, 2);
            detectedLang = langCode;

            if (detectedLang !== 'en') {
                 // Native Logic
                 const nativeMap = LANGUAGE_VOICE_MAP[detectedLang];
                 if (nativeMap) {
                     const isMale = MALE_PRESETS.includes(voice);
                     selectedGoogleVoice = isMale ? nativeMap.male : nativeMap.female;
                     targetLanguage = selectedGoogleVoice.split('-').slice(0,2).join('-');
                     finalInput = { text: input };
                 }
            } else {
                 // 🇺🇸 ENGLISH LOGIC
                 // CRITICAL FIX: We BLOCK Studio voices from entering the SSML generator
                 if (prompt && prompt.length > 2 && !prompt.includes('neutral') && !isStudioVoice(selectedGoogleVoice)) {
                     
                     // Fixed Syntax: Added backticks (` `)
                     const ssmlPrompt = `Convert text to SSML for vibe "${prompt}". Rules: Return <speak> tags only. Input: "${input}"`;
                     
                     const result = await model.generateContent(ssmlPrompt);
                     let ssml = result.response.text().replace(/```xml/g, '').replace(/```/g, '').trim();
                     
                     if (ssml.startsWith('<speak>')) {
                         finalInput = { ssml: ssml };
                     }
                 } else {
                     // Fallback for Studio or Neutral prompts
                     finalInput = { text: input };
                 }
            }
        } catch (err) { console.error("Gemini Logic Error:", err); }
    }

    const ttsRequest = {
        input: finalInput,
        voice: { languageCode: targetLanguage, name: selectedGoogleVoice },
        audioConfig: { audioEncoding: response_format as any },
    };

    const [response] = await ttsClient.synthesizeSpeech(ttsRequest);
    if (!response.audioContent) throw new Error("No audio from Google");

    recordSuccess(ip, input, prompt);

    return new Response(response.audioContent as Uint8Array, {
      headers: { "Content-Type": contentType, "Cache-Control": "no-cache" },
    });

  } catch (err) {
    console.error("TTS Critical Error:", err);
    return new Response("TTS Error: " + (err as Error).message, { status: 500 });
  }
}

export async function GET(req: NextRequest) { return handleRequest(req, 'GET'); }
export async function POST(req: NextRequest) { return handleRequest(req, 'POST'); }
