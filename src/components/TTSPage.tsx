"use client";
import React, { useState } from "react";
import {
  getRandomLibrarySet,
  getRandomVoice,
  LIBRARY,
  VOICES,
} from "../lib/library";
import { Block } from "./ui/Block";
import { Footer } from "./ui/Footer";
import { Header } from "./ui/Header";
import { DevMode } from "./ui/DevMode";
import { Regenerate, Shuffle, Star } from "./ui/Icons";
import { useBodyScrollable } from "@/hooks/useBodyScrollable";
import { Button, ButtonLED } from "./ui/Button";
import { appStore } from "@/lib/store";
import BrowserNotSupported from "./ui/BrowserNotSupported";

const isTutorial = process.env.NEXT_PUBLIC_APP_MODE === "tutorial";
const EXPRESSIVE_VOICES = ["ash", "ballad", "coral", "sage", "verse"];

export default function TtsPage() {
  const [devMode] = useState(false);
  const isScrollable = useBodyScrollable();

  return (
    <div
      data-scrollable={isScrollable}
      className="flex flex-col gap-x-3 min-h-screen px-5 pt-6 pb-32 md:pb-24 selection:bg-primary/20"
    >
      <Header />
      {devMode ? <DevMode /> : <Board />}
      <Footer devMode={devMode} />
    </div>
  );
}

const Board = () => {
  const voice = appStore.useState((state) => state.voice);
  const input = appStore.useState((state) => state.input);
  const inputDirty = appStore.useState((state) => state.inputDirty);
  const prompt = appStore.useState((state) => state.prompt);
  const selectedEntry = appStore.useState((state) => state.selectedEntry);
  const librarySet = appStore.useState((state) => state.librarySet);
  const browserNotSupported = appStore.useState(
    () => !("serviceWorker" in navigator) && !isTutorial
  );

  const handleRefreshLibrarySet = () => {
    const nextSet = getRandomLibrarySet();
    appStore.setState((draft) => {
      draft.librarySet = nextSet;
      if (!draft.inputDirty) {
        draft.input = nextSet[0].input;
      }
      draft.prompt = nextSet[0].prompt;
      draft.selectedEntry = nextSet[0];
      draft.latestAudioUrl = null;
    });
  };

  const handlePresetSelect = (name: string) => {
    const entry = LIBRARY[name];
    appStore.setState((draft) => {
      if (!inputDirty) {
        draft.input = entry.input;
      }
      draft.prompt = entry.prompt;
      draft.selectedEntry = entry;
      draft.latestAudioUrl = null;
    });
  };

  // --- STYLES ---
  const getButtonStyle = (isSelected: boolean) => ({
    backgroundColor: isSelected ? '#2563eb' : '#1f2937',
    color: '#ffffff',
    border: '1px solid #374151',
  });

  const inputStyle = {
    backgroundColor: '#111827',
    color: '#ffffff',
    border: '1px solid #374151',
  };

  return (
    <main className="flex-1 flex flex-col gap-x-3 w-full max-w-(--page-max-width) mx-auto">
      {browserNotSupported && (
        <BrowserNotSupported open={browserNotSupported} onOpenChange={() => {}} />
      )}
      
      {/* --- VOICE SECTION --- */}
      <div className="flex flex-row">
        <Block title="Voice">
          {/* GRID FIX: 
             Old: xl:col-span-1 (Too small, 12 per row)
             New: lg:col-span-2 (Wider, 6 per row -> Creates 2 lines comfortably)
          */}
          <div className="grid grid-cols-12 gap-3">
            {VOICES.map((newVoice) => (
              <div
                key={newVoice}
                className="col-span-4 sm:col-span-3 md:col-span-3 lg:col-span-2 relative"
              >
                <Button
                  block
                  color="default"
                  onClick={() => {
                    appStore.setState((draft) => {
                      draft.voice = newVoice;
                      draft.latestAudioUrl = null;
                    });
                  }}
                  selected={newVoice === voice}
                  // Aspect Ratio relaxed to allow 2 lines
                  className="aspect-4/3 sm:aspect-3/2 flex-col items-start justify-between relative min-h-[70px]"
                  style={getButtonStyle(newVoice === voice)}
                >
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {newVoice[0].toUpperCase()}
                    {newVoice.substring(1)}
                  </span>
                  <div className="absolute left-[0.9rem] bottom-[0.8rem]">
                    <ButtonLED />
                  </div>
                  {EXPRESSIVE_VOICES.includes(newVoice) && (
                    <div className="absolute right-[10px] bottom-[8px]">
                      <Star className="w-[12px] h-[12px]" />
                    </div>
                  )}
                </Button>
              </div>
            ))}
            
            {/* Shuffle Button (Same Grid Logic) */}
            <div className="col-span-4 sm:col-span-3 md:col-span-3 lg:col-span-2">
              <Button
                block
                color="neutral"
                onClick={() => {
                  const randomVoice = getRandomVoice(voice);
                  appStore.setState((draft) => {
                    draft.voice = randomVoice;
                    draft.latestAudioUrl = null;
                  });
                }}
                className="aspect-4/3 sm:aspect-3/2 min-h-[70px]"
                aria-label="Select random voice"
                style={{ backgroundColor: '#1f2937', color: 'white', border: '1px solid #374151' }}
              >
                <Shuffle />
              </Button>
            </div>
          </div>
        </Block>
      </div>

      {/* --- VIBE & SCRIPT SECTION --- */}
      <div className="flex flex-col md:flex-row gap-3">
        <Block title="Vibe">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {librarySet.map((entry) => (
                <Button
                  key={entry.name}
                  block
                  color="default"
                  onClick={() => handlePresetSelect(entry.name)}
                  selected={selectedEntry?.name === entry.name}
                  // Added 'leading-tight' and dynamic font sizing for long text
                  className="aspect-4/3 sm:aspect-2/1 min-h-[60px] flex-col items-start justify-between relative p-3"
                  style={getButtonStyle(selectedEntry?.name === entry.name)}
                >
                  <span 
                    className="break-words pr-1 text-left leading-tight" 
                    style={{ 
                      color: 'white', 
                      // Agar text lamba hai (True Crime Buff) to font chota karo
                      fontSize: entry.name.length > 12 ? '0.8rem' : '0.95rem' 
                    }}
                  >
                    {entry.name}
                  </span>
                  <div className="absolute left-[0.93rem] bottom-[0.93rem]">
                    <ButtonLED />
                  </div>
                </Button>
              ))}
              
              {/* Regenerate Button */}
              <Button
                block
                color="neutral"
                onClick={handleRefreshLibrarySet}
                className="aspect-4/3 sm:aspect-2/1 min-h-[60px]"
                aria-label="Generate new list of vibes"
                style={{ backgroundColor: '#1f2937', color: 'white', border: '1px solid #374151' }}
              >
                <Regenerate />
              </Button>
            </div>
            
            {/* Prompt Text Area */}
            <textarea
              id="input"
              rows={8}
              maxLength={999}
              className="w-full resize-none outline-none focus:outline-none p-4 rounded-lg shadow-textarea text-[16px] md:text-[14px]"
              style={inputStyle}
              value={prompt}
              onChange={({ target }) => {
                appStore.setState((draft) => {
                  draft.selectedEntry = null;
                  draft.prompt = target.value;
                  draft.latestAudioUrl = null;
                });
              }}
              required
            />
          </div>
        </Block>

        <Block title="Script">
          <div className="relative flex flex-col h-full w-full">
            <textarea
              id="prompt"
              rows={8}
              maxLength={999}
              className="w-full h-full min-h-[220px] resize-none outline-none focus:outline-none p-4 rounded-lg shadow-textarea text-[16px] md:text-[14px]"
              style={inputStyle}
              value={input}
              onChange={({ target }) => {
                const nextValue = target.value;
                appStore.setState((draft) => {
                  draft.inputDirty = !!nextValue && selectedEntry?.input !== nextValue;
                  draft.input = nextValue;
                  draft.latestAudioUrl = null;
                });
              }}
            />
            {inputDirty && (
              <span
                className="absolute bottom-[-27px] sm:bottom-3 left-4 z-10 cursor-pointer uppercase hover:text-current/70 transition-colors"
                style={{ color: '#9ca3af' }}
                onClick={() => {
                  appStore.setState((draft) => {
                    draft.inputDirty = false;
                    draft.input = selectedEntry?.input ?? input;
                    draft.latestAudioUrl = null;
                  });
                }}
              >
                Reset
              </span>
            )}
            <span className="absolute bottom-3 right-4 z-10 opacity-30 hidden sm:block text-white">
              {input.length}
            </span>
          </div>
        </Block>
      </div>
    </main>
  );
};
