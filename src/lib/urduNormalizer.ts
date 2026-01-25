import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

/**
 * Converts Urdu / Roman-Urdu into phonetic Devanagari Hindi.
 * IMPORTANT:
 * - Preserve Urdu phonetics (ख़, क़, ग़, ज़)
 * - Do NOT translate meanings
 */
export async function normalizeUrduToHindiPhonetic(text: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
Convert the following Urdu or Roman-Urdu text into Devanagari Hindi
while preserving Urdu phonetics.

Rules:
- Keep phonetic words like: ख़्वाब, क़, ग़, ज़
- DO NOT translate meaning
- DO NOT simplify to pure Hindi
- Output ONLY the converted text

Text:
"${text}"
`;

    const result = await model.generateContent(prompt);
    const output = result.response.text().trim();

    return output.length > 0 ? output : text;
  } catch (err) {
    console.error("Urdu Normalization Failed:", err);
    return text; // SAFE FALLBACK
  }
}
