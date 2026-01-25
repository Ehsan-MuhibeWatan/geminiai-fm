import fs from "fs";
import { normalizeUrduToHindiPhonetic } from "@/lib/urduNormalizer";
import { NextRequest, userAgent, NextResponse } from "next/server";
import { VOICES } from "@/lib/library";
import { getClientIP, canUseAPI, recordSuccess } from "@/lib/rateLimitDb";
import { logActivity } from "@/lib/activity-logger";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { VOICE_REGISTRY } from "@/lib/voiceRegistry";

export const MAX_INPUT_LENGTH = 1000;

const ttsClient = new TextToSpeechClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const US_VOICE_MAP: Record<string, string> = {
  alloy: "en-US-Neural2-F",
  nova: "en-US-Neural2-H",
  shimmer: "en-US-Journey-O",
  coral: "en-US-Studio-O",
  sage: "en-US-Neural2-C",
  ash: "en-US-Polyglot-1",
  echo: "en-US-Studio-M",
  onyx: "en-US-Neural2-J",
  fable: "en-GB-Neural2-D",
  ballad: "en-US-Journey-D",
  default: "en-US-Neural2-F",
};

const MALE_PRESETS = ["ash", "echo", "onyx", "fable", "ballad"];

function isStudioVoice(name: string) {
  return name.includes("Studio");
}

async function handleRequest(req: NextRequest, method: "GET" | "POST") {
  fs.appendFileSync("/tmp/ROUTE_PROOF.txt", "ROUTE HIT\n");

  const ip = getClientIP(req);
  if (!canUseAPI(ip)) {
    return new Response("Daily limit reached.", { status: 429 });
  }

  let input = "", prompt = "", voice = "";

  if (method === "GET") {
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
  if (!VOICES.includes(voice)) {
    return new Response("Invalid voice", { status: 400 });
  }

  logActivity(ip, input, voice);

  let finalInput: any = { text: input };
  let targetLanguage = "en-US";
  let selectedGoogleVoice = US_VOICE_MAP[voice] || US_VOICE_MAP.default;
  let detectedLang = "en";

  if (input.length > 2) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const langPrompt = `Detect language ISO code (e.g. en, ur, hi) for: "${input.slice(0, 50)}"`;
      const langResult = await model.generateContent(langPrompt);
      detectedLang = langResult.response.text().toLowerCase().slice(0, 2);

      // 🔥 URDU → HINDI PHONETIC
      if (detectedLang === "ur") {
        finalInput = {
          text: await normalizeUrduToHindiPhonetic(input),
        };

        targetLanguage = "hi-IN";
        selectedGoogleVoice = MALE_PRESETS.includes(voice)
          ? "hi-IN-Wavenet-B"
          : "hi-IN-Wavenet-A";
      }

      // 🌍 OTHER LANGUAGES
      else if (detectedLang !== "en" && VOICE_REGISTRY[detectedLang]) {
        const entry = VOICE_REGISTRY[detectedLang];
        selectedGoogleVoice = MALE_PRESETS.includes(voice)
          ? entry.male
          : entry.female;
        targetLanguage = entry.languageCode;
      }

      // 🇺🇸 ENGLISH + SSML
      else if (
        prompt &&
        prompt.length > 2 &&
        !prompt.includes("neutral") &&
        !isStudioVoice(selectedGoogleVoice)
      ) {
        const ssmlPrompt = `Convert text to SSML for vibe "${prompt}". Rules: Return <speak> only. Input: "${input}"`;
        const result = await model.generateContent(ssmlPrompt);
        const ssml = result.response.text().replace(/```xml|```/g, "").trim();
        if (ssml.startsWith("<speak>")) {
          finalInput = { ssml };
        }
      }
    } catch (err) {
      console.error("Gemini Logic Error:", err);
    }
  }

  const ttsRequest = {
    input: finalInput,
    voice: { languageCode: targetLanguage, name: selectedGoogleVoice },
    audioConfig: {
      audioEncoding: userAgent(req).engine?.name === "Blink"
        ? "LINEAR16"
        : "MP3",
    },
  };

  const [response] = await ttsClient.synthesizeSpeech(ttsRequest);
  if (!response.audioContent) {
    throw new Error("No audio from Google");
  }

  recordSuccess(ip, input, prompt);

  return new Response(response.audioContent as Uint8Array, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}

export async function GET(req: NextRequest) {
  return handleRequest(req, "GET");
}

export async function POST(req: NextRequest) {
  return handleRequest(req, "POST");
}
