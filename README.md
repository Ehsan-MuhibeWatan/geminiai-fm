# 🎙️ GeminiAI-FM (The "Dirty" Fast Engine)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![NextJS](https://img.shields.io/badge/Built_with-NextJS-blue)
![Google Cloud](https://img.shields.io/badge/Powered_by-Google_Gemini_%26_Neural2-orange)

> **Unlimited Free Text-to-Speech. Zero Cost. Pure Vibe.** > *Forked from OpenAI-FM, re-engineered to run on Google Cloud's Free Tier.*

![App Screenshot](./screenshot.png)

## ⚡ What is this?
**GeminiAI-FM** is a "Growth-Hacking" optimized text-to-speech engine.

The original OpenAI version is amazing but costs money per request. We ripped out the paid engine and replaced it with **Google Gemini 2.0 Flash** (for text processing) and **Google Cloud Neural2 TTS** (for audio).

**The Result?** A high-quality, human-like voice engine that runs effectively **FREE** for personal use and scaling.

### 🔥 Key Features ("The Dirty Bits")
- **💰 Zero Cost Engine:** Switched from OpenAI API to Google Cloud (Free Tier friendly).
- **🇵🇰 Urdu/Hindi Optimized:** Fixed crashes with Asian languages by enforcing specific Neural2 voice mapping.
- **🌑 Dark Mode Only:** Because light mode attracts bugs.
- **🎣 Growth Hooks:** Pre-built "Scarcity Banners" and "Affiliate Slots" (Mic, Hosting, Support) to help you monetize traffic immediately.
- **📱 Responsive:** Fixed button sizing and layout issues for mobile devices.

---

## 🛠️ How to Run (The Setup)

### 1. Clone the Repository
```bash
git clone [https://github.com/Ehsan-MuhibeWatan/geminiai-fm.git](https://github.com/Ehsan-MuhibeWatan/geminiai-fm.git)
cd geminiai-fm

2. Install Dependencies
npm install

3. Setup Google Cloud (The Engine)
This app requires a Google Cloud Service Account key to talk to Gemini and TTS APIs.

Go to the Google Cloud Console.

Create a new project.

Enable APIs: Search for and enable "Cloud Text-to-Speech API" and "Vertex AI API".

Create Credentials:

Go to "IAM & Admin" > "Service Accounts".

Create a Service Account and give it "Owner" or "Editor" permissions (for simplicity).

Go to the "Keys" tab > "Add Key" > "Create new key" > JSON.

Download & Move:

A .json file will download. Rename it to service-account-key.json.

Move this file to the root folder of this project.

⚠️ IMPORTANT: Ensure this file is in your .gitignore so you don't leak it!

4. Environment Variables
Create a .env.local file in the root directory (or rename .env.example):

# Get this from Google AI Studio or use Vertex AI default
GOOGLE_API_KEY=your_gemini_api_key_here

# (Optional) For the sharing feature
POSTGRES_URL="postgresql://username:password@host:port/database_name"

5. Run the App
npm run dev

⚠️ "The Trap" & Customization
This engine comes with a "Live Demo" warning banner in the header and Affiliate Links in the footer by default.

You can edit the text in src/components/ui/Header.tsx.

You can change affiliate links in src/components/TTSPage.tsx.

🤝 Credits
Original Architecture: OpenAI-FM Team (Huge respect for the base UI).

Re-Engineered by: Muhib-e-Watan Initiative.

📄 License
This project is licensed under the MIT License. Feel free to fork, modify, and monetize.
