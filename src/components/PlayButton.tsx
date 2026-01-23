"use client";
import React, { useState, useRef } from "react";
import { Button } from "./ui/Button";
import { Play } from "./ui/Icons";
import { appStore } from "@/lib/store";
import s from "./ui/Footer.module.css";

const IS_SAFARI = typeof navigator !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const IS_IOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

/* =======================
   Waveform Component
   ======================= */
const PlayingWaveform = ({
  audioLoaded,
  amplitudeLevels,
}: {
  audioLoaded: boolean;
  amplitudeLevels: number[];
}) => (
  <div className="w-[36px] h-[16px] relative left-[4px]">
    {amplitudeLevels.map((level, idx) => {
      const height = `${Math.min(Math.max(level * 30, 0.2), 1.9) * 100}%`;
      return (
        <div
          key={idx}
          className={`w-[2px] bg-white transition-all duration-150 rounded-[2px] absolute top-1/2 -translate-y-1/2 ${
            audioLoaded ? "opacity-100" : s["animate-wave"]
          }`}
          style={{ height, animationDelay: `${idx * 0.15}s`, left: `${idx * 6}px` }}
        />
      );
    })}
  </div>
);

export default function PlayButton() {
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Use state for amplitudes to drive the visualization
  const [amplitudeLevels, setAmplitudeLevels] = useState<number[]>(new Array(5).fill(0));
  const amplitudeIntervalRef = useRef<number | null>(null);

  const useStaticAnimation = IS_SAFARI || IS_IOS;

  const generateRandomAmplitudes = () =>
    Array(5).fill(0).map(() => Math.random() * 0.06);

  const handlePlay = async () => {
    // 1. Retrieve State Safely
    const state = appStore.getState();
    const selectedEntry = state.selectedEntry;
    
    // Explicitly cast to string to prevent "Converting circular structure to JSON"
    const userText = typeof state.input === 'string' ? state.input : "";
    const uiVoice = state.voice; // Retrieve selected UI voice

    if (audioLoading) return;

    // Stop if already playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setAudioLoaded(false);
      if (amplitudeIntervalRef.current) {
        clearInterval(amplitudeIntervalRef.current);
        amplitudeIntervalRef.current = null;
      }
      return;
    }

    setAudioLoading(true);

    try {
      /* =======================
         GOOGLE TTS CALL
         ======================= */
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          // Use selected vibe or fallback to 'Calm' if null
          vibeName: selectedEntry?.name || "Calm",
          // Pass the user's text script
          text: userText,
          // Pass the selected voice from UI
          voice: uiVoice,
        }),
      });

      if (!res.ok) throw new Error("Google TTS failed");

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);

      const audio = new Audio(audioUrl);
      audio.preload = "none";
      audioRef.current = audio;

      // --- Audio Context & Analysis (Visuals) ---
      if (!useStaticAnimation) {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        const ctx = audioContextRef.current;
        try {
            const source = ctx.createMediaElementSource(audio);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyser.connect(ctx.destination);
            analyserRef.current = analyser;
        } catch(e) {
            console.warn("Visualizer setup failed", e);
        }
      }

      const sample = () => {
        if (useStaticAnimation) {
          setAmplitudeLevels(generateRandomAmplitudes());
          return;
        }
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.fftSize);
        analyserRef.current.getByteTimeDomainData(data);
        const avg =
          data.reduce((sum, v) => sum + Math.abs(v - 128), 0) /
          analyserRef.current.fftSize;
        setAmplitudeLevels((prev) => [...prev.slice(1), avg / 128]);
      };

      const clearSampling = () => {
        audioRef.current = null;
        if (amplitudeIntervalRef.current) {
          clearInterval(amplitudeIntervalRef.current);
          amplitudeIntervalRef.current = null;
        }
        setIsPlaying(false);
      };

      audio.onplay = () => {
        amplitudeIntervalRef.current = window.setInterval(sample, 100);
        setIsPlaying(true);
        setAudioLoaded(true);
        setAudioLoading(false);
      };

      audio.onpause = clearSampling;
      audio.onended = clearSampling;
      audio.onerror = () => {
          clearSampling();
          setAudioLoading(false);
          alert("Error playing audio");
      };

      audio.autoplay = true;

    } catch (err) {
      console.error("Error generating speech:", err);
      setAudioLoading(false);
      setAudioLoaded(false);
      setIsPlaying(false);
      alert("Failed to generate audio. Check console.");
    }
  };

  return (
    <Button
      color="primary"
      onClick={handlePlay}
      selected={audioLoading || isPlaying}
      className="relative"
      style={{ color: "#ffffff" }}
    >
      {isPlaying ? (
        <PlayingWaveform audioLoaded={audioLoaded} amplitudeLevels={amplitudeLevels} />
      ) : audioLoading ? (
        <PlayingWaveform audioLoaded={false} amplitudeLevels={[0.03, 0.03, 0.03, 0.03, 0.03]} />
      ) : (
        <span><Play /></span>
      )}
      <span className="uppercase inline pr-3 font-bold">
        {isPlaying ? "Stop" : audioLoading ? "Busy" : "Play"}
      </span>
    </Button>
  );
}
