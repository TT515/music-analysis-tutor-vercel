
import type { GenerativePart, ChatMessage } from '../types';

const MODEL_OWNER = "zsxkib";
const MODEL_NAME = "audio-flamingo-3";

/**
 * Calls the Replicate API for Audio Flamingo to get technical analysis.
 */
export async function callCustomModelApi(
  apiKey: string,
  proxyUrl: string,
  prompt: string,
  history: ChatMessage[],
  audioPart?: GenerativePart
): Promise<string> {
  
  // Default to the Vercel API route if no proxy is provided
  // We ensure we don't have trailing slashes for cleaner URL building
  const baseUrl = (proxyUrl || "/api/proxy").replace(/\/$/, "");
  
  const cleanKey = apiKey.trim();

  // Common Headers - Replicate supports both Token and Bearer, but Bearer is standard.
  const headers = {
    'Authorization': `Bearer ${cleanKey}`,
    'Content-Type': 'application/json',
    "X-Requested-With": "XMLHttpRequest"
  };

  /**
   * Helper to construct the proxy URL.
   * We exclusively use the query param format: /api/proxy?url=...
   */
  const getProxyUrl = (target: string) => {
      const encodedTarget = encodeURIComponent(target);
      return `${baseUrl}?url=${encodedTarget}`;
  };

  // 1. Fetch the latest model version ID
  let versionId: string;
  try {
    const replicateTarget = `https://api.replicate.com/v1/models/${MODEL_OWNER}/${MODEL_NAME}`;
    const modelUrl = getProxyUrl(replicateTarget);
    
    const modelResponse = await fetch(modelUrl, { 
        method: 'GET', 
        headers 
    });
    
    if (modelResponse.status === 401) {
        throw new Error("Unauthorized (401): Invalid Replicate API Key. Please check your settings.");
    }

    if (!modelResponse.ok) {
        const text = await modelResponse.text();
        handleProxyError(modelResponse.status, text);
        throw new Error(`Failed to fetch model info: ${modelResponse.statusText} (${modelResponse.status})`);
    }

    const modelData = await modelResponse.json();
    versionId = modelData.latest_version?.id;
    
    if (!versionId) {
        throw new Error("Could not retrieve the latest version ID for Audio Flamingo.");
    }
  } catch (error: any) {
     if (error.message.includes("Unauthorized")) {
         throw error;
     }
     if (error.message.includes("Network Error") || error.message.includes("Failed to fetch")) {
         throw new Error(`Network Error. Ensure your Proxy URL (${baseUrl}) is correct and reachable.`);
     }
     console.error("Model version fetch failed:", error);
     throw error;
  }

  // 2. Construct the prompt for analysis
  const analysisPrompt = `Analyze the audio to answer this user request: "${prompt}". Provide detailed acoustic and musical observations.`;

  let fullPrompt = "";
  history.slice(-4).forEach(msg => {
      const roleName = msg.role === 'user' ? 'User' : 'Assistant';
      fullPrompt += `${roleName}: ${msg.content}\n`;
  });
  fullPrompt += `User: ${analysisPrompt}\nAssistant:`;

  // 3. Prepare Audio Input (Data URI)
  let audioDataUri = null;
  if (audioPart) {
      audioDataUri = `data:${audioPart.inlineData.mimeType};base64,${audioPart.inlineData.data}`;
  }

  if (!audioDataUri && history.length === 0) {
      throw new Error("Audio input is required for the first turn.");
  }

  // 4. Initiate the Prediction (POST /v1/predictions)
  const startUrlTarget = `https://api.replicate.com/v1/predictions`;
  const startUrl = getProxyUrl(startUrlTarget);

  let predictionId: string;
  let status: string;
  let output: any;

  try {
    const startResponse = await fetch(startUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            version: versionId,
            input: {
                audio: audioDataUri, 
                prompt: fullPrompt
            }
        })
    });

    if (startResponse.status === 401) {
        throw new Error("Unauthorized (401): Invalid Replicate API Key.");
    }

    if (!startResponse.ok) {
        const text = await startResponse.text();
        handleProxyError(startResponse.status, text);
        let errorJson;
        try { errorJson = JSON.parse(text); } catch(e) {}
        throw new Error(`Replicate API Error (${startResponse.status}): ${errorJson?.detail || text}`);
    }

    const startData = await startResponse.json();
    predictionId = startData.id;
    status = startData.status;
    output = startData.output;

  } catch (error: any) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(
            "Network Error: blocked by CORS or Proxy unreachable.\n\n" +
            `Ensure you are running 'vercel dev' locally or that your deployment is active.`
        );
    }
    throw error;
  }

  // 5. Poll for Result (GET)
  const POLLING_INTERVAL = 2000; // 2 seconds

  while (status === 'starting' || status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));

      const pollTarget = `https://api.replicate.com/v1/predictions/${predictionId}`;
      const pollUrl = getProxyUrl(pollTarget);

      const pollResponse = await fetch(pollUrl, { headers });

      if (pollResponse.status === 401) {
          throw new Error("Unauthorized (401): Invalid Replicate API Key.");
      }

      if (!pollResponse.ok) {
          const pollError = await pollResponse.text();
          handleProxyError(pollResponse.status, pollError);
          throw new Error(`Polling Error (${pollResponse.status}): ${pollError}`);
      }

      const pollData = await pollResponse.json();
      status = pollData.status;
      output = pollData.output;

      if (status === 'failed' || status === 'canceled') {
          throw new Error(`Prediction ${status}: ${pollData.error || 'Unknown error'}`);
      }
  }

  // 6. Format Output
  if (Array.isArray(output)) {
      return output.join('').trim();
  } else if (typeof output === 'string') {
      return output.trim();
  } else {
      return JSON.stringify(output || "");
  }
}

function handleProxyError(status: number, text: string) {
    if (text.trim().startsWith('<')) {
        throw new Error(
            `Proxy Error (${status}): The proxy server returned HTML instead of JSON. Check your Proxy URL.`
        );
    }
}
