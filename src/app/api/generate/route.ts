import { NextRequest, userAgent, NextResponse } from "next/server";
import { VOICES } from "@/lib/library";
import {
  getClientIP,
  canUseAPI,
  recordSuccess,
} from "@/lib/rateLimitDb";

import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const MAX_INPUT_LENGTH = 1000; 
export const MAX_PROMPT_LENGTH = 1000;

const ttsClient = new TextToSpeechClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// --- 🌍 CORRECTED LANGUAGE MAP (Safe Voices) ---
// Note: Urdu (PK) and Arabic (XA) only support 'Standard' currently, not 'Neural2'.
// --- 🌍 CORRECTED LANGUAGE MAP (Robust Edition) ---
const LANGUAGE_VOICE_MAP: Record<string, { male: string; female: string }> = {
  // ✅ URDU FIX: Switched to 'ur-IN' (India) because 'ur-PK' lacks Male voice.
  // Bonus: We get Neural2 quality instead of Standard!
  'ur': { female: 'ur-IN-Neural2-A', male: 'ur-IN-Neural2-D' }, 
  
  // ✅ HINDI: Neural2 is perfect.
  'hi': { female: 'hi-IN-Neural2-A', male: 'hi-IN-Neural2-B' }, 
  
  // ✅ ARABIC FIX: Switched to 'Wavenet' (Higher quality than Standard, safer than Neural)
  'ar': { female: 'ar-XA-Wavenet-A', male: 'ar-XA-Wavenet-B' }, 
  
  // OTHERS
  'es': { female: 'es-US-Neural2-A', male: 'es-US-Neural2-B' }, 
  'fr': { female: 'fr-FR-Neural2-A', male: 'fr-FR-Neural2-B' }, 
};
// --- 🇺🇸 ENGLISH VOICE MAP ---
const US_VOICE_MAP: Record<string, string> = {
  // Female
  'alloy': 'en-US-Neural2-F',    
  'nova': 'en-US-Neural2-H',     
  'shimmer': 'en-US-Journey-O',  
  'coral': 'en-US-Studio-O', // Studio (No Pitch Tags allowed)
  'sage': 'en-US-Neural2-C',     

  // Male
  'ash': 'en-US-Polyglot-1', // Heavy Male    
  'echo': 'en-US-Studio-M',  // Studio (No Pitch Tags allowed)    
  'onyx': 'en-US-Neural2-J',     
  'fable': 'en-GB-Neural2-D',    
  'ballad': 'en-US-Journey-D',   

  // Fallback
  'default': 'en-US-Neural2-F'
};

const MALE_PRESETS = ['ash', 'echo', 'onyx', 'fable', 'ballad'];

// Helper to remove illegal tags for Studio voices
function sanitizeSSML(ssml: string, voiceName: string): string {
    // Studio voices crash if they see <prosody pitch="...">
    if (voiceName.includes("Studio")) {
        // Remove pitch and rate attributes but keep the tag structure if possible, 
        // or just accept that Studio ignores vibe instructions.
        return ssml.replace(/pitch="[^"]*"/g, "").replace(/rate="[^"]*"/g, "");
    }
    return ssml;
}

async function handleRequest(req: NextRequest, method: 'GET' | 'POST') {
  const ip = getClientIP(req);

  if (!canUseAPI(ip)) return new Response("Daily limit reached.", { status: 429 });

  let input = "";
  let prompt = "";
  let voice = "";

  const ua = userAgent(req);
  const isWav = ua.engine?.name === "Blink"; 
  const response_format = isWav ? "LINEAR16" : "MP3";
  const contentType = isWav ? "audio/wav" : "audio/mpeg";

  if (method === 'GET') {
    const params = new URL(req.url).searchParams;
    input = params.get("input") || "";
    prompt = params.get("prompt") || "";
    voice = params.get("voice") || "";
  } else {
    const fd = await req.formData();
    input = fd.get("input")?.toString() || "";
    prompt = fd.get("prompt")?.toString() || "";
    voice = fd.get("voice")?.toString() || "";
  }

  input = input.slice(0, MAX_INPUT_LENGTH);
  if (!VOICES.includes(voice)) return new Response("Invalid voice", { status: 400 });

  try {
    let finalInput: any = { text: input };
    let targetLanguage = 'en-US';
    let selectedGoogleVoice = US_VOICE_MAP[voice] || US_VOICE_MAP['default'];
    let detectedLang = 'en';

    // --- STEP 1: DETECTION & LOGIC ---
    if (input.length > 2) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            
            // 1. Detect Language First
            const langPrompt = `Detect language ISO code (e.g. en, ur, hi) for: "${input.slice(0, 50)}"`;
            const langResult = await model.generateContent(langPrompt);
            const langCode = langResult.response.text().toLowerCase().trim().slice(0, 2);
            detectedLang = langCode;

            // 2. Branching
            if (detectedLang !== 'en') {
                 // 🛑 NON-ENGLISH (Native Safe Mode)
                 const nativeMap = LANGUAGE_VOICE_MAP[detectedLang];
                 if (nativeMap) {
                     const isMale = MALE_PRESETS.includes(voice);
                     selectedGoogleVoice = isMale ? nativeMap.male : nativeMap.female;
                     targetLanguage = selectedGoogleVoice.split('-').slice(0,2).join('-');
                     
                     // Urdu/Hindi: Send raw text (No SSML) to avoid RTL/Tag crashes
                     finalInput = { text: input };
                 }
            } else {
                 // 🇺🇸 ENGLISH (Vibe Mode)
                 if (prompt && prompt.length > 2 && !prompt.includes('neutral')) {
                     // Generate SSML
                     const ssmlPrompt = `
                     Convert text to SSML for vibe "${prompt}".
                     Rules: Return <speak> tags only. No markdown.
                     Input: "${input}"
                     `;
                     const result = await model.generateContent(ssmlPrompt);
                     let ssml = result.response.text().replace(/```xml/g, '').replace(/```/g, '').trim();
                     if (ssml.startsWith('<speak>')) {
                         // 🛡️ SANITIZE FOR STUDIO VOICES
                         ssml = sanitizeSSML(ssml, selectedGoogleVoice);
                         finalInput = { ssml: ssml };
                     }
                 }
            }

        } catch (err) {
            console.error("Gemini/Logic Error (Using fallback):", err);
        }
    }

    // --- STEP 2: GENERATE AUDIO ---
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
    // User friendly error
    return new Response("TTS Error: " + (err as Error).message, { status: 500 });
  }
}

export async function GET(req) { return handleRequest(req, 'GET'); }
export async function POST(req) { return handleRequest(req, 'POST'); }
