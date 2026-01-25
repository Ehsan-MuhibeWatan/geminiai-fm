import { normalizeUrduToHindiPhonetic } from "@/lib/urduNormalizer";
import { NextResponse } from "next/server";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { vibes } from "@/lib/library";
import { buildGoogleTTSRequest } from "@/lib/ttsAdapter";
import { GOOGLE_VOICE_MAP } from "@/lib/googleVoiceMap";
import { logActivity } from "@/lib/activity-logger";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { VOICE_REGISTRY } from "@/lib/voiceRegistry";

// Force dynamic execution
export const fetchCache = "force-no-store";

const client = new TextToSpeechClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// Heuristic for male intent
const MALE_VIBES = [
  "deep",
  "authoritative",
  "news",
  "santa",
  "ghost",
  "detective",
  "ash",
  "echo",
  "onyx",
];

export async function POST(request: Request) {
  try {
    const { vibeName, text, voice } = await request.json();

    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "::1";

    const safeText = typeof text === "string" ? text : "";
    const safeVoice = voice || "default";

    try {
      logActivity(ip, safeText, safeVoice);
    } catch {}

    console.log(`
🎧  TTS REQUEST
────────────────────────────────
🕒 Time   : ${new Date().toLocaleTimeString()}
🌐 IP     : ${ip}
🎙️ Voice  : ${safeVoice}
🔢 Chars  : ${safeText.length}
📝 Text   : "${safeText.slice(0, 60)}"
────────────────────────────────
`.trim());

    const entry = vibes.find(v => v.name === vibeName);
    if (!entry) {
      return NextResponse.json(
        { error: `Vibe '${vibeName}' not found.` },
        { status: 404 }
      );
    }

    let effectiveGoogleVoice =
      safeVoice && GOOGLE_VOICE_MAP[safeVoice]
        ? GOOGLE_VOICE_MAP[safeVoice]
        : entry.vibeConfig.googleVoice;

    let finalText = safeText;
    let detectedLang = "en";

    // ==================================================
    // 🧠 LANGUAGE DETECTION
    // ==================================================
    if (safeText.length > 3) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const langPrompt = `Detect language ISO code (e.g. en, ur, hi) for: "${safeText.slice(0, 50)}"`;
        const result = await model.generateContent(langPrompt);

        const rawLang = result.response.text().toLowerCase();
        detectedLang = rawLang.includes("ur") || rawLang.includes("ud")
          ? "ur"
          : rawLang.slice(0, 2);

        // 🔥 URDU → HINDI PHONETIC
        if (detectedLang === "ur") {
          console.log("🌍 Detected Urdu → Hindi phonetic");

          finalText = await normalizeUrduToHindiPhonetic(safeText);

          const isMale = MALE_VIBES.some(v =>
            vibeName.toLowerCase().includes(v)
          );

          effectiveGoogleVoice = isMale
            ? "hi-IN-Wavenet-B"
            : "hi-IN-Wavenet-A";

          console.log(`📝 Normalized Text: ${finalText}`);
        }

        // 🌍 OTHER SUPPORTED LANGUAGES
        else if (detectedLang !== "en" && VOICE_REGISTRY[detectedLang]) {
          const isMale = MALE_VIBES.some(v =>
            vibeName.toLowerCase().includes(v)
          );

          effectiveGoogleVoice = isMale
            ? VOICE_REGISTRY[detectedLang].male
            : VOICE_REGISTRY[detectedLang].female;
        }
      } catch (err) {
        console.error("Language Detection Warning:", err);
      }
    }

    const effectiveEntry = {
      ...entry,
      input: finalText,
      vibeConfig: {
        ...entry.vibeConfig,
        googleVoice: effectiveGoogleVoice,
      },
    };

    const googleRequest = buildGoogleTTSRequest(effectiveEntry);

    // 🛑 HARD SAFETY: Studio voices never get SSML
    if (
      googleRequest.input?.ssml &&
      googleRequest.voice?.name?.includes("Studio")
    ) {
      console.warn("⚠️ Removing SSML for Studio voice");
      googleRequest.input = { text: finalText };
    }

    const [response] = await client.synthesizeSpeech(googleRequest);
    if (!response.audioContent) {
      throw new Error("No audio content received from Google TTS.");
    }

    return new NextResponse(response.audioContent, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": response.audioContent.length.toString(),
        "Cache-Control": "no-store",
      },
    });

  } catch (error: any) {
    console.error("🔥 TTS API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
