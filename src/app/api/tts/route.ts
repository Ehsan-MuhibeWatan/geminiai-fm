import { NextResponse } from "next/server";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { vibes } from "@/lib/library";
import { buildGoogleTTSRequest } from "@/lib/ttsAdapter";
import { GOOGLE_VOICE_MAP } from "@/lib/googleVoiceMap";
import { logActivity } from "@/lib/activity-logger";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Force dynamic execution to prevent caching of audio results
export const fetchCache = "force-no-store";

// Google TTS client & Gemini Client
const client = new TextToSpeechClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// 🌍 NATIVE VOICE MAP (The Automatic Switch List)
const NATIVE_MAP: Record<string, { male: string; female: string }> = {
  'ur': { female: 'ur-IN-Neural2-A', male: 'ur-IN-Neural2-D' }, // Urdu (India Neural is best)
  'hi': { female: 'hi-IN-Neural2-A', male: 'hi-IN-Neural2-B' }, // Hindi
  'ar': { female: 'ar-XA-Wavenet-A', male: 'ar-XA-Wavenet-B' }, // Arabic
  'es': { female: 'es-US-Neural2-A', male: 'es-US-Neural2-B' }, // Spanish
  'fr': { female: 'fr-FR-Neural2-A', male: 'fr-FR-Neural2-B' }, // French
};

// Heuristic to guess gender based on Vibe/Voice Name (to keep gender consistent when switching)
const MALE_VIBES = ['deep', 'authoritative', 'news', 'santa', 'ghost', 'detective', 'ash', 'echo', 'onyx'];

export async function POST(request: Request) {
  try {
    // --------------------------------------------------
    // 1️⃣ Parse request body
    // --------------------------------------------------
    const { vibeName, text, voice } = await request.json();

    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "::1";

    const safeText = typeof text === "string" ? text : "";
    const safeVoice = voice || "default";

    // --------------------------------------------------
    // 2️⃣ Log activity EARLY (never break request)
    // --------------------------------------------------
    try {
      logActivity(ip, safeText, safeVoice);
    } catch (e) {
      console.error("Logger failed:", e);
    }

    // --------------------------------------------------
    // 3️⃣ Pretty developer logs (PM2 / terminal)
    // --------------------------------------------------
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

    // --------------------------------------------------
    // 4️⃣ Lookup vibe
    // --------------------------------------------------
    const entry = vibes.find((v) => v.name === vibeName);

    if (!entry) {
      return NextResponse.json(
        { error: `Vibe '${vibeName}' not found.` },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 5️⃣ Resolve Google voice (UI override → vibe default)
    // --------------------------------------------------
    let effectiveGoogleVoice =
      safeVoice && GOOGLE_VOICE_MAP[safeVoice]
        ? GOOGLE_VOICE_MAP[safeVoice]
        : entry.vibeConfig.googleVoice;

    // ==================================================
    // 🧠 5.5 GEMINI INTERCEPTOR (Language Detection)
    // ==================================================
    if (safeText.length > 3) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const langPrompt = `Detect language ISO code (e.g. en, ur, hi) for: "${safeText.slice(0, 50)}"`;
            
            const result = await model.generateContent(langPrompt);
            const rawLang = result.response.text().toLowerCase().trim();
            
            // 🛠️ Normalize Detection (Handle 'ud', 'urdu', etc.)
            let detectedLang = rawLang.slice(0, 2);
            if (rawLang.includes('ur') || rawLang.includes('ud')) {
                detectedLang = 'ur';
            }

            // If we detect a non-English language that we support:
            if (detectedLang !== 'en' && NATIVE_MAP[detectedLang]) {
                console.log(`🌍 Detected Language [${detectedLang}]: Switching Voice...`);
                
                // Keep the gender intention (e.g., if user picked 'Ash', give them Hindi Male)
                const isMale = effectiveGoogleVoice.includes('Male') || 
                               effectiveGoogleVoice.includes('D') || 
                               effectiveGoogleVoice.includes('B') ||
                               MALE_VIBES.some(mv => vibeName.toLowerCase().includes(mv)) ||
                               MALE_VIBES.includes(safeVoice);

                // OVERRIDE the voice variable
                effectiveGoogleVoice = isMale 
                    ? NATIVE_MAP[detectedLang].male 
                    : NATIVE_MAP[detectedLang].female;
                
                console.log(`🔀 Switched to: ${effectiveGoogleVoice}`);
            }
        } catch (err) {
            console.error("Language Detection Warning (Using default):", err);
        }
    }
    // ==================================================

    // --------------------------------------------------
    // 6️⃣ Build effective entry
    // --------------------------------------------------
    const effectiveEntry = {
      ...entry,
      input:
        safeText.trim().length > 0
          ? safeText
          : entry.input,
      vibeConfig: {
        ...entry.vibeConfig,
        googleVoice: effectiveGoogleVoice, // 👈 Now contains the Switched Voice
      },
    };

    // --------------------------------------------------
    // 7️⃣ Build Google TTS request (SSML / text)
    // --------------------------------------------------
    const googleRequest = buildGoogleTTSRequest(effectiveEntry);

    let audioContent: Uint8Array | string | null | undefined = null;

    // --------------------------------------------------
    // 8️⃣ Primary TTS attempt
    // --------------------------------------------------
    try {
      console.log(`🎧 VIBE : ${entry.name}`);
      console.log(`🎙️ VOICE: ${googleRequest.voice?.name}`);
      console.log(`📝 TEXT : ${effectiveEntry.input.substring(0, 50)}...`);

      const [response] = await client.synthesizeSpeech(googleRequest);
      audioContent = response.audioContent;

    } catch (primaryError: any) {
      // --------------------------------------------------
      // 9️⃣ Fallback voice logic
      // --------------------------------------------------
      const fallbackVoice = entry.vibeConfig.fallbackVoice;

      const isVoiceError =
        primaryError?.code === 400 ||
        primaryError?.code === 404 ||
        primaryError?.message?.toLowerCase().includes("voice") ||
        primaryError?.message?.toLowerCase().includes("invalid_argument");

      if (fallbackVoice && isVoiceError && googleRequest.voice) {
        console.warn(`⚠️ Primary voice failed. Falling back to: ${fallbackVoice}`);

        googleRequest.voice.name = fallbackVoice;
        googleRequest.voice.languageCode =
          fallbackVoice.split("-").slice(0, 2).join("-");

        const [fallbackResponse] = await client.synthesizeSpeech(googleRequest);
        audioContent = fallbackResponse.audioContent;
      } else {
        throw primaryError;
      }
    }

    // --------------------------------------------------
    // 🔟 Final validation
    // --------------------------------------------------
    if (!audioContent) {
      throw new Error("No audio content received from Google TTS.");
    }

    // --------------------------------------------------
    // 1️⃣1️⃣ Stream audio response
    // --------------------------------------------------
    return new NextResponse(audioContent, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioContent.length.toString(),
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
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
