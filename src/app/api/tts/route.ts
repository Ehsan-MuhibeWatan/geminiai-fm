import { NextResponse } from "next/server";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { vibes } from "@/lib/library";
import { buildGoogleTTSRequest } from "@/lib/ttsAdapter";
import { GOOGLE_VOICE_MAP } from "@/lib/googleVoiceMap";

// Force dynamic execution to prevent caching of audio results
export const fetchCache = "force-no-store";

// Ensure GOOGLE_APPLICATION_CREDENTIALS is set in environment
const client = new TextToSpeechClient();

export async function POST(request: Request) {
  try {
    const { vibeName, text, voice } = await request.json();

    // 1. Lookup the Vibe from Library
    const entry = vibes.find((v) => v.name === vibeName);

    if (!entry) {
      return NextResponse.json(
        { error: `Vibe '${vibeName}' not found.` },
        { status: 404 }
      );
    }

    // 2. Resolve Google Voice ID (Hybrid Logic)
    // If UI voice is provided and exists in map, use it. Otherwise, use vibe default.
    const effectiveGoogleVoice = (voice && GOOGLE_VOICE_MAP[voice]) 
        ? GOOGLE_VOICE_MAP[voice] 
        : entry.vibeConfig.googleVoice;

    // 3. Prepare the Effective Entry
    // Merge user text and resolved voice
    const effectiveEntry = {
      ...entry,
      input: text && typeof text === 'string' && text.trim().length > 0 
        ? text 
        : entry.input,
      vibeConfig: {
          ...entry.vibeConfig,
          googleVoice: effectiveGoogleVoice,
      }
    };

    // 4. Build Request (Physics -> SSML)
    const googleRequest = buildGoogleTTSRequest(effectiveEntry);
    let audioContent: string | Uint8Array | null | undefined = null;

    try {
      console.log(`🎧 VIBE: ${entry.name}`);
      console.log(`🎙️ VOICE: ${googleRequest.voice?.name} (UI: ${voice || 'None'})`);
      console.log(`📝 TEXT: ${effectiveEntry.input.substring(0, 50)}...`);

      const [response] = await client.synthesizeSpeech(googleRequest);
      audioContent = response.audioContent;

    } catch (primaryError: any) {
      // 5. Fallback Logic for Voice Availability
      const fallbackVoice = entry.vibeConfig.fallbackVoice;
      
      const isVoiceError = 
        primaryError.code === 400 || 
        primaryError.code === 404 || 
        primaryError.message?.toLowerCase().includes("voice") ||
        primaryError.message?.toLowerCase().includes("invalid_argument");

      if (fallbackVoice && isVoiceError && googleRequest.voice) {
        console.warn(`⚠️ Primary voice failed. Switching to Fallback: ${fallbackVoice}`);
        
        // Swap voice to fallback
        googleRequest.voice.name = fallbackVoice;
        googleRequest.voice.languageCode = fallbackVoice.split("-").slice(0, 2).join("-");

        const [fallbackResponse] = await client.synthesizeSpeech(googleRequest);
        audioContent = fallbackResponse.audioContent;
      } else {
        throw primaryError;
      }
    }

    if (!audioContent) {
      throw new Error("No audio content received from Google TTS.");
    }

    // 6. Stream Audio
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
