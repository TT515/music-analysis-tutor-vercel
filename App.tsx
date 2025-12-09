
import React, { useState, useCallback, useEffect } from 'react';
import { AudioUploader } from './components/AudioUploader';
import { ChatDisplay } from './components/ChatDisplay';
import { Spinner } from './components/Spinner';
import { ConfigModal, ApiKeys } from './components/ConfigModal';
import { fileToGenerativePart } from './utils/fileUtils';
import type { ChatMessage } from './types';
import { runAgent } from './services/geminiService';

const App: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Initialize keys: Check Environment Variables first, then LocalStorage
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    const savedKeysStr = localStorage.getItem('music_agent_keys');
    const savedKeys = savedKeysStr ? JSON.parse(savedKeysStr) : {};

    // Safely access env vars using type casting for Vite
    const envGemini = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    const envReplicate = (import.meta as any).env?.VITE_REPLICATE_API_KEY;
    const envHF = (import.meta as any).env?.VITE_HF_API_KEY;
    const envEndpoint = (import.meta as any).env?.VITE_CHAT_MUSICIAN_ENDPOINT;

    // Priority: Env Var > LocalStorage > Default
    return {
      gemini: envGemini || savedKeys.gemini || '',
      replicate: envReplicate || savedKeys.replicate || '',
      huggingFace: envHF || savedKeys.huggingFace || '',
      endpointUrl: envEndpoint || savedKeys.endpointUrl || ''
    };
  });

  useEffect(() => {
    // Open settings only if we are missing essential keys
    const missingGemini = !apiKeys.gemini;
    if (missingGemini) {
      setIsConfigOpen(true);
    }
  }, []);

  const handleSaveKeys = (keys: ApiKeys) => {
    setApiKeys(keys);
    localStorage.setItem('music_agent_keys', JSON.stringify(keys));
  };

  const handleFileUpload = useCallback((file: File | null) => {
    setAudioFile(file);
    setMessages([]);
  }, []);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError('Please enter a text prompt.');
      return;
    }

    if (!apiKeys.gemini) {
      setError('Gemini API Key is missing. Please click Settings to configure.');
      setIsConfigOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStatus("Agent: Thinking...");

    const currentPrompt = prompt;
    const currentHistory = [...messages];
    setMessages(prev => [...prev, { role: 'user', content: currentPrompt }]);
    setPrompt('');

    try {
      const audioPart = audioFile
        ? await fileToGenerativePart(audioFile)
        : undefined;

      const finalResponse = await runAgent(
        currentPrompt,
        currentHistory,
        audioPart,
        apiKeys, // Pass the dynamic keys
        (status) => setLoadingStatus(status)
      );

      setMessages(prev => [...prev, { role: 'model', content: finalResponse }]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setError(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const isButtonDisabled = isLoading || !prompt.trim();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSave={handleSaveKeys}
        initialKeys={apiKeys}
      />

      <div className="max-w-6xl w-full mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Music Analysis Tutor</h1>
            <p className="mt-2 text-md text-gray-600 hidden sm:block">
              An agentic system powered by Gemini 2.5 Flash, Audio Flamingo 3 (listening), and ChatMusician (music reasoning).
            </p>
          </div>
          <button
            onClick={() => setIsConfigOpen(true)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
          >
            ⚙️ Settings
          </button>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Inputs */}
          <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-6 self-start">
             <section aria-labelledby="audio-upload-heading">
                <h2 id="audio-upload-heading" className="text-xl font-semibold text-gray-800 mb-2">1. Upload Audio </h2>
                <AudioUploader file={audioFile} onFileUpload={handleFileUpload} />
             </section>
             <section aria-labelledby="chat-input-heading">
                <h2 id="chat-input-heading" className="text-xl font-semibold text-gray-800 mb-2">2. Chat</h2>
                <textarea
                  id="prompt-input"
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-50"
                  placeholder={
                    !audioFile && messages.length === 0
                      ? "Upload an audio and ask anything about it."
                      : "Enter your request..."
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!isButtonDisabled) handleSubmit();
                    }
                  }}
                  disabled={isLoading}
                />
             </section>
              {error && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-md text-sm whitespace-pre-wrap" role="alert">
                  {error}
                </div>
              )}
             <div>
                <button
                  onClick={handleSubmit}
                  disabled={isButtonDisabled}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? <><Spinner /> {loadingStatus || 'Processing...'}</> : 'Send Message'}
                </button>
             </div>
          </div>

          {/* Right Column: Chat Display */}
          <div className="h-[80vh]">
            <ChatDisplay messages={messages} isLoading={isLoading} />
          </div>
        </main>

        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by Gemini 2.5, Audio Flamingo, and ChatMusician</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
