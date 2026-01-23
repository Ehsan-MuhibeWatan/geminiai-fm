import { LibraryEntry } from "./types";

/**
 * Google TTS–specific vibe physics
 */
export interface GoogleVibeConfig {
  speakingRate: number;
  pitch: number;               // semitones
  volumeGainDb: number;
  googleVoice: string;
  fallbackVoice?: string;

  // Macro-prosody (this is where Google reacts)
  pauseMs?: number;
  emphasisLevel?: "none" | "moderate" | "strong";
}

export interface MechanicalLibraryEntry extends LibraryEntry {
  vibeConfig: GoogleVibeConfig;
}

export const LIBRARY: Record<string, MechanicalLibraryEntry> = {
  Calm: {
    name: "Calm",
    input:
      "Thank you for contacting us. I completely understand your frustration with the canceled flight, and I'm here to help you get rebooked quickly.\n\nI just need a few details from your original reservation, like your booking confirmation number or passenger info. Once I have those, I'll find the next available flight and make sure you reach your destination smoothly.",
    voice: "sage",
    vibeConfig: {
      speakingRate: 0.88,
      pitch: -1.5,
      volumeGainDb: -1.0,
      googleVoice: "en-US-Neural2-D",
      pauseMs: 500,
      emphasisLevel: "none",
    },
  },

  "True Crime Buff": {
    name: "True Crime Buff",
    input:
      "The night was heavy with secrets. The air, thick with the scent of rain, carried whispers that did not belong to the wind.\n\nShe stepped cautiously into the alley, her breath slow and measured. Footsteps echoed behind her. A shadow flickered, gone before she could turn.\n\nThe note in her pocket burned against her palm. Meet me at midnight. Alone.\n\nShe was not alone. Not anymore.",
    voice: "ash",
    vibeConfig: {
      speakingRate: 0.82,
      pitch: -2.5,
      volumeGainDb: -1.0,
      googleVoice: "en-US-News-K",
      pauseMs: 420,
      emphasisLevel: "moderate",
    },
  },

  Santa: {
    name: "Santa",
    input:
      "Ho ho ho! Merry Christmas! You've reached Santa's workshop.\n\nFor toy requests, press one.\n\nIf you're on the nice list, press two.\n\nIf you're on the naughty list, press three.\n\nTo speak to an elf, press four.\n\nDon't worry, we're here to make sure every wish is granted. Ho ho ho!",
    voice: "ash",
    vibeConfig: {
      speakingRate: 1.1,
      pitch: -4.5,
      volumeGainDb: 2.0,
      googleVoice: "en-US-Polyglot-1",
      fallbackVoice: "en-US-Neural2-D",
      pauseMs: 350,
      emphasisLevel: "strong",
    },
  },

  Professional: {
    name: "Professional",
    input:
      "Good afternoon, team. Here are the key takeaways from today's meeting.\n\nDepartmental budgets were reviewed, with adjustments proposed to support growth initiatives.\n\nCost-saving measures were identified, and action items have been assigned.\n\nThank you all for your contributions.",
    voice: "coral",
    vibeConfig: {
      speakingRate: 1.0,
      pitch: 0.0,
      volumeGainDb: 0.0,
      googleVoice: "en-US-News-N",
    },
  },

  Friendly: {
    name: "Friendly",
    input:
      "Hello! I'm happy to help you today.\n\nJust let me know what you're looking for, and we'll take it step by step.\n\nI'm right here if you need anything else!",
    voice: "sage",
    vibeConfig: {
      speakingRate: 1.05,
      pitch: 1.0,
      volumeGainDb: 0.0,
      googleVoice: "en-US-Neural2-F",
    },
  },
};

// ---- Helpers / exports ----

export const vibes = Object.values(LIBRARY);

export const getLibraryByPrompt = (
  maybeName: string
): MechanicalLibraryEntry | null => {
  const found = Object.keys(LIBRARY).find(
    (key) => LIBRARY[key].name === maybeName
  );
  return found ? LIBRARY[found] : null;
};

export function getRandomLibrarySet(count = 5): MechanicalLibraryEntry[] {
  return [...vibes].sort(() => Math.random() - 0.5).slice(0, count);
}

export const DEFAULT_LIBRARY = LIBRARY.Calm;

// UI-only voice names (OpenAI compatibility)
export const VOICES = [
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "sage",
  "shimmer",
  "verse",
];

export const DEFAULT_VOICE = "coral";

export const getRandomVoice = (currentVoice: string): string => {
  const availableVoices = VOICES.filter((voice) => voice !== currentVoice);
  return availableVoices[Math.floor(Math.random() * availableVoices.length)];
};
