
# 🎵 Music Analysis Tutor

Welcome to **Music Analysis Tutor**! This is an interactive AI tool designed to help composers and music producers get feedback for their music.

Website: https://music-analysis-tutor-vercel.vercel.app

Youtube Demo: https://youtu.be/-a5aqc0YBQw

## 🔗 To use website

You will be prompted to enter a **huggingface key** and an **inference endpoint url to ChatMusician** in the **Settings** menu. 

To get an inference endpoint to ChatMusician, go to: https://endpoints.huggingface.co/new?repository=m-a-p/ChatMusician

**The key is stored safely in your browser's Local Storage.** The developer provides API keys for Gemini and Replicate (Audio Flamingo 3) in the server environment.

Once you enter the key and url, upload an audio file and start the conversation! The website will analyze the audio and offer advice based on your needs.

---

## 🛠️ Tech Stack
*   **Frontend**: React, Vite, TailwindCSS
*   **Backend**: Vercel Serverless Functions (Node.js)
*   **AI Models**:
    *   Google Gemini 2.5 Flash (Agent/Reasoning)
    *   Audio Flamingo 3 (via Replicate)
    *   ChatMusician (via Hugging Face)
