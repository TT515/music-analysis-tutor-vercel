import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import type { ChatMessage, GenerativePart } from "../types";
import { system_prompt } from "../systemPrompt";
import { callCustomModelApi } from "./customModelService";
import { callChatMusician } from "./chatMusicianService";
import { ApiKeys } from "../components/ConfigModal";

// --- Tool Definitions ---

const analyzeAudioTool: FunctionDeclaration = {
  name: "analyze_audio",
  description: "Use this tool to analyze the content of the uploaded audio file. Ask specific questions about instruments, key, tempo, mood, chords, or transcription.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "The specific question to ask the audio analysis model (Audio Flamingo) about the audio file."
      }
    },
    required: ["query"]
  }
};

const musicTheoryTool: FunctionDeclaration = {
  name: "consult_music_theory",
  description: "Use this tool to ask questions about music theory, history, composition, or general musical concepts that do NOT require listening to the specific audio file.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "The music theory question for ChatMusician."
      }
    },
    required: ["query"]
  }
};

/**
 * Runs the agentic loop: Gemini decides to call tools (AF3 or ChatMusician) or answer directly.
 */
export async function runAgent(
  userPrompt: string,
  history: ChatMessage[],
  audioPart: GenerativePart | undefined,
  keys: ApiKeys,
  onStatusUpdate: (status: string) => void
): Promise<string> {

  if (!keys.gemini) {
    throw new Error("Gemini API Key is missing. Please configure it in settings.");
  }

  const ai = new GoogleGenAI({ apiKey: keys.gemini });

  try {
    // 1. Prepare history for Gemini
    const validHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    // 2. Initialize Chat with Tools
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: validHistory,
      config: {
        systemInstruction: system_prompt,
        tools: [{ functionDeclarations: [analyzeAudioTool, musicTheoryTool] }],
      },
    });

    // 3. Send Initial Message
    let result = await chat.sendMessage({ message: userPrompt });

    // 4. Handle Tool Loop
    let maxTurns = 16;

    while (result.functionCalls && result.functionCalls.length > 0 && maxTurns > 0) {
      maxTurns--;
      const functionCalls = result.functionCalls;
      const functionResponses = [];

      for (const call of functionCalls) {
        const { name, args, id } = call;
        let toolResult = "";
        
        try {
          if (name === "analyze_audio") {
            onStatusUpdate("Agent: Consulting Audio Flamingo...");
            if (!audioPart) {
               toolResult = "Error: No audio file is currently uploaded. Cannot analyze audio content. Please ask the user to upload a file if they want audio analysis.";
            } else {
               if (!keys.replicate) throw new Error("Replicate API Key missing in settings.");
               const query = (args as any).query;
               
               // Pass keys and proxy URL
               toolResult = await callCustomModelApi(keys.replicate, "/api/proxy", query, [], audioPart);
            }
          } else if (name === "consult_music_theory") {
            onStatusUpdate("Agent: Consulting ChatMusician...");
            if (!keys.huggingFace) throw new Error("Hugging Face API Key missing in settings.");
            
            const query = (args as any).query;
            toolResult = await callChatMusician(keys.huggingFace, keys.endpointUrl, query);
          } else {
            toolResult = `Error: Unknown tool '${name}'.`;
          }
        } catch (e: any) {
          console.error(`Stopping Agent due to tool error (${name}):`, e);
          throw e;
        }

        // Construct the response part for this tool call
        functionResponses.push({
          functionResponse: {
            name: name,
            id: id,
            response: { result: toolResult }
          }
        });
      }

      // Send tool responses back to the model
      result = await chat.sendMessage({ message: functionResponses });
    }

    return result.text || "I was unable to generate a final response.";

  } catch (error: any) {
    console.error("Agent Error:", error);
    throw error;
  }
}
