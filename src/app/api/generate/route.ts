import { NextRequest, userAgent } from "next/server";
import { VOICES } from "@/lib/library";
import {
  getClientIP,
  canUseAPI,
  recordSuccess,
} from "@/lib/rateLimitDb";

export const MAX_INPUT_LENGTH = 1000;
export const MAX_PROMPT_LENGTH = 1000;

/* =========================
   GET HANDLER
========================= */
export async function GET(req: NextRequest) {
  const ip = getClientIP(req);

  if (!canUseAPI(ip)) {
    return new Response(
      "Daily limit reached (5 requests per IP). Try again after 24 hours.",
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const ua = userAgent(req);
  const response_format = ua.engine?.name === "Blink" ? "wav" : "mp3";

  let input = searchParams.get("input") || "";
  let prompt = searchParams.get("prompt") || "";
  const voice = searchParams.get("voice") || "";
  const vibe = searchParams.get("vibe") || "audio";

  input = input.slice(0, MAX_INPUT_LENGTH);
  prompt = prompt.slice(0, MAX_PROMPT_LENGTH);

  if (!VOICES.includes(voice)) {
    return new Response("Invalid voice", { status: 400 });
  }

  try {
    const apiResponse = await fetch(
      "https://api.openai.com/v1/audio/speech",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-tts",
          input,
          response_format,
          voice,
          ...(prompt && { instructions: prompt }),
        }),
      }
    );

    if (!apiResponse.ok) {
      return new Response(
        "Error generating audio (OpenAI failure).",
        { status: 500 }
      );
    }

    // ✅ COUNT ONLY SUCCESSFUL GENERATIONS
    recordSuccess(ip, input, prompt);

    const filename = `openai-fm-${voice}-${vibe}.${response_format}`;

    return new Response(apiResponse.body, {
      headers: {
        "Content-Type":
          response_format === "wav" ? "audio/wav" : "audio/mpeg",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("TTS error:", err);
    return new Response("Internal error", { status: 500 });
  }
}

/* =========================
   POST HANDLER
========================= */
export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  if (!canUseAPI(ip)) {
    return new Response(
      "Daily limit reached (5 requests per IP). Try again after 24 hours.",
      { status: 429 }
    );
  }

  const ua = userAgent(req);
  const response_format = ua.engine?.name === "Blink" ? "wav" : "mp3";

  const formData = await req.formData();
  let input = formData.get("input")?.toString() || "";
  let prompt = formData.get("prompt")?.toString() || "";
  const voice = formData.get("voice")?.toString() || "";
  const vibe = formData.get("vibe") || "audio";

  input = input.slice(0, MAX_INPUT_LENGTH);
  prompt = prompt.slice(0, MAX_PROMPT_LENGTH);

  if (!VOICES.includes(voice)) {
    return new Response("Invalid voice", { status: 400 });
  }

  try {
    const apiResponse = await fetch(
      "https://api.openai.com/v1/audio/speech",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-tts",
          input,
          response_format,
          voice,
          ...(prompt && { instructions: prompt }),
        }),
      }
    );

    if (!apiResponse.ok) {
      return new Response(
        "Error generating audio (OpenAI failure).",
        { status: 500 }
      );
    }

    // ✅ COUNT ONLY SUCCESSFUL GENERATIONS
    recordSuccess(ip, input, prompt);

    const filename = `openai-fm-${voice}-${vibe}.${response_format}`;

    return new Response(apiResponse.body, {
      headers: {
        "Content-Type":
          response_format === "wav" ? "audio/wav" : "audio/mpeg",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("TTS error:", err);
    return new Response("Internal error", { status: 500 });
  }
}
