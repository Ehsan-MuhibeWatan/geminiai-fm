import { MechanicalLibraryEntry } from "./library";

/**
 * Escapes characters that break XML/SSML
 */
function escapeForSSML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildGoogleSSML(
  text: string,
  vibe: MechanicalLibraryEntry["vibeConfig"]
): string {
  const ratePercent = Math.round(vibe.speakingRate * 100);
  const pitchValue = `${vibe.pitch}st`;

  const pauseTag = vibe.pauseMs
    ? `<break time="${vibe.pauseMs}ms"/>`
    : "";

  const structuredText = escapeForSSML(text).replace(/\n\n+/g, pauseTag);

  const emphasisOpen =
    vibe.emphasisLevel && vibe.emphasisLevel !== "none"
      ? `<emphasis level="${vibe.emphasisLevel}">`
      : "";

  const emphasisClose =
    vibe.emphasisLevel && vibe.emphasisLevel !== "none"
      ? `</emphasis>`
      : "";

  return `
<speak>
  <prosody rate="${ratePercent}%" pitch="${pitchValue}">
    ${emphasisOpen}
    ${structuredText}
    ${emphasisClose}
  </prosody>
</speak>
`.trim();
}


/**
 * The Request Builder: Splits Physics (SSML) from Signal (AudioConfig)
 */
export function buildGoogleTTSRequest(entry: MechanicalLibraryEntry) {
  const { vibeConfig, input } = entry;

  // Infer language code from the voice name (e.g., "en-US-Neural2-D" -> "en-US")
  // This handles the cross-lingual cases (e.g. French voice reading English text)
  const languageCode = vibeConfig.googleVoice.split("-").slice(0, 2).join("-");

  return {
    input: {
      ssml: buildGoogleSSML(input, vibeConfig),
    },
    voice: {
      name: vibeConfig.googleVoice,
      languageCode: languageCode,
    },
    audioConfig: {
      audioEncoding: "MP3" as const,
      // Volume gain lives here, NOT in SSML
      volumeGainDb: vibeConfig.volumeGainDb, 
    },
    // Optional: Add logic here to switch to vibeConfig.fallbackVoice on error
  };
}
