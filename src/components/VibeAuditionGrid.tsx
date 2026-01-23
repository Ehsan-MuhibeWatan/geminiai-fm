import React, { useState } from "react";
import { vibes } from "./library";

// Assumes you have an API route like /api/tts that
// accepts { vibeName } and returns an MP3 audio stream

// Global tracker to ensure singleton playback
let currentAudio: HTMLAudioElement | null = null;

export default function VibeAuditionGrid() {
  const [loadingVibe, setLoadingVibe] = useState<string | null>(null);

  async function playVibe(vibeName: string) {
    try {
      // 1. Stop any currently playing audio immediately
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }

      setLoadingVibe(vibeName);

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibeName }),
      });

      if (!response.ok) {
        throw new Error("TTS request failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      
      // 2. Assign as current audio and play
      currentAudio = audio;
      audio.play();

      audio.onended = () => {
        URL.revokeObjectURL(url);
        // Clear global ref if this specific audio finished naturally
        if (currentAudio === audio) {
            currentAudio = null;
        }
      };
    } catch (err) {
      console.error("Error playing vibe", err);
      alert("Failed to play vibe. Check console/logs.");
    } finally {
      setLoadingVibe(null);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {vibes.map((vibe) => (
        <div
          key={vibe.name}
          className="rounded-2xl shadow-md border p-4 flex flex-col gap-3"
        >
          <h3 className="text-lg font-semibold">{vibe.name}</h3>

          <p className="text-sm text-gray-600 line-clamp-4">
            {vibe.input}
          </p>

          <button
            onClick={() => playVibe(vibe.name)}
            disabled={loadingVibe === vibe.name}
            className={`mt-auto rounded-xl px-4 py-2 text-white transition ${
              loadingVibe === vibe.name
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            {loadingVibe === vibe.name ? "Playing…" : "▶ Play"}
          </button>
        </div>
      ))}
    </div>
  );
}
