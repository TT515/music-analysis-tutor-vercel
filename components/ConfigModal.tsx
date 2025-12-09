
import React, { useState, useEffect } from 'react';

export interface ApiKeys {
  gemini: string;
  replicate: string;
  huggingFace: string;
  endpointUrl: string;
}

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: ApiKeys) => void;
  initialKeys: ApiKeys;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, onSave, initialKeys }) => {
  const [keys, setKeys] = useState<ApiKeys>(initialKeys);

  // Sync state if props change (e.g. from localStorage load)
  useEffect(() => {
    setKeys(initialKeys);
  }, [initialKeys]);

  const isGeminiProvided = !!(import.meta as any).env?.VITE_GEMINI_API_KEY;
  const isReplicateProvided = !!(import.meta as any).env?.VITE_REPLICATE_API_KEY;
  const isHFProvided = !!(import.meta as any).env?.VITE_HF_API_KEY;

  if (!isOpen) return null;

  const handleChange = (field: keyof ApiKeys, value: string) => {
    setKeys(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(keys);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Settings</h2>
        <p className="text-sm text-gray-600 mb-4">
          Configure your API keys. Keys are stored in your browser's Local Storage.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Gemini API Key</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 disabled:bg-gray-100 disabled:text-gray-500"
              value={isGeminiProvided ? "Provided via Environment" : keys.gemini}
              onChange={(e) => handleChange('gemini', e.target.value)}
              placeholder="AIza..."
              disabled={isGeminiProvided}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Replicate API Token</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 disabled:bg-gray-100 disabled:text-gray-500"
              value={isReplicateProvided ? "Provided via Environment" : keys.replicate}
              onChange={(e) => handleChange('replicate', e.target.value)}
              placeholder="r8_..."
              disabled={isReplicateProvided}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Hugging Face Token</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 disabled:bg-gray-100 disabled:text-gray-500"
              value={isHFProvided ? "Provided via Environment" : keys.huggingFace}
              onChange={(e) => handleChange('huggingFace', e.target.value)}
              placeholder="hf_..."
              disabled={isHFProvided}
            />
          </div>

           <div>
            <label className="block text-sm font-medium text-gray-700">ChatMusician Endpoint (Optional)</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              value={keys.endpointUrl}
              onChange={(e) => handleChange('endpointUrl', e.target.value)}
              placeholder="https://api-inference.huggingface.co/models/m-a-p/ChatMusician"
            />
             <p className="text-xs text-gray-500 mt-1">Leave empty to use default inference API.</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Save Keys
          </button>
        </div>
      </div>
    </div>
  );
};
