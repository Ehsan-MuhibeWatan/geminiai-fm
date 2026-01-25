export type Gender = 'male' | 'female';

export const VOICE_REGISTRY: Record<string, { male: string; female: string; languageCode: string }> = {
  // 🇺🇸 English
  en: {
    male: 'en-US-Neural2-J',
    female: 'en-US-Neural2-F',
    languageCode: 'en-US',
  },

  // 🇮🇳 Hindi
  hi: {
    male: 'hi-IN-Wavenet-B',
    female: 'hi-IN-Wavenet-A',
    languageCode: 'hi-IN',
  },

  // 🇵🇰 Urdu → Arabic fallback (INTENTIONAL)
// 🇵🇰 Urdu (Native, Correct)

  // 🇸🇦 Arabic
  ar: {
    male: 'ar-XA-Wavenet-B',
    female: 'ar-XA-Wavenet-A',
    languageCode: 'ar-XA',
  },
};

export function sanitizeVoice(voice: string, lang: string) {
  if (lang === 'ur' && voice.includes('ar-')) {
    return VOICE_REGISTRY.ur.male;
  }
  return voice;
}
