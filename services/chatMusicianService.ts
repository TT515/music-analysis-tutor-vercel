export async function callChatMusician(apiKey: string, endpointUrl: string, prompt: string): Promise<string> {
  // Use the standard Inference API URL which is often more stable for direct browser calls than the router
  const url = endpointUrl;

  // 1. Strict Key Check
  if (!apiKey || apiKey.includes("YOUR_HF_API_KEY")) {
     throw new Error("Hugging Face API Key is missing in services/geminiService.ts");
  }

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`, 
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: prompt, 
        parameters: { max_new_tokens: 512, return_full_text: false }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HF API Error (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    // 2. Validate Response Shape
    if (result.error) {
       throw new Error(`HF Model Error: ${result.error} (Estimated wait: ${result.estimated_time || 'unknown'}s)`);
    }

    if (Array.isArray(result) && result[0]?.generated_text) {
        return result[0].generated_text;
    } else {
        console.error("Unexpected HF Response:", result);
        throw new Error("Received empty or malformed response from ChatMusician.");
    }

  } catch (error: any) {
    console.error("ChatMusician Service Error:", error);
    throw error;
  }
}
