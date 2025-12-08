
# 🎵 Gemini Music Agent

Welcome to **Gemini Music Agent**! This is an interactive AI tool designed to help musicians, students, and enthusiasts analyze audio files and explore complex music theory concepts.

## ✨ What Can It Do?

*   **🎧 Analyze Audio**: Upload a track (MP3, WAV, etc.) and ask questions about instruments, key, mood, or melody.
*   **📚 Music Theory Chat**: Ask deep theoretical questions without needing an audio file.

---

## 🚀 Deployment on Vercel

This app is designed to be hosted on **Vercel**. It uses a Serverless Function (`/api/proxy`) to securely communicate with the Audio Analysis tools (Replicate), removing the need for external proxies like `cors-anywhere`.

### 1. Prerequisites
*   A GitHub account.
*   A Vercel account.
*   API Keys for Gemini, Replicate, and Hugging Face.

### 2. Deploy
1.  Push this code to a GitHub repository.
2.  Go to [Vercel](https://vercel.com) and "Add New Project".
3.  Import your GitHub repository.
4.  **Environment Variables**: In the Vercel Project Settings, add the following variables if you want to pre-configure the app for users (Optional but recommended):
    *   `VITE_GEMINI_API_KEY`
    *   `VITE_REPLICATE_API_KEY`
    *   `VITE_HF_API_KEY`
5.  Click **Deploy**.

### 3. Running Locally
To run the app locally with the backend proxy enabled, you must use the Vercel CLI.

1.  **Install Vercel CLI**:
    ```bash
    npm i -g vercel
    ```
2.  **Login**:
    ```bash
    vercel login
    ```
3.  **Start Development Server**:
    ```bash
    vercel dev
    ```
    This command starts both the Vite frontend (port 5173 or similar) and the API proxy (port 3000). Use the URL provided by Vercel (usually `http://localhost:3000`) to access the app.

---

## 🔑 Configuration (Bring Your Own Key)

If you do not set the Environment Variables in Step 2 above, the application runs in "Bring Your Own Key" mode.

1.  Open the deployed website.
2.  You will be prompted to enter your API Keys in the **Settings** menu.
3.  The keys are stored safely in your browser's Local Storage.

---

## 🛠️ Tech Stack
*   **Frontend**: React, Vite, TailwindCSS
*   **Backend**: Vercel Serverless Functions (Node.js)
*   **AI Models**:
    *   Google Gemini 2.5 Flash (Agent/Reasoning)
    *   Audio Flamingo 3 (via Replicate)
    *   ChatMusician (via Hugging Face)
