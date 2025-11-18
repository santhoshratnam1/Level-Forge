import { GoogleGenAI } from "@google/genai";
import type { Content } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export async function getChatResponse(
  history: Content[],
  context: string
): Promise<string> {
  const systemInstruction = `You are a world-class level design consultant named "Forge Assistant". 
Your user has just generated a portfolio analysis for their game level. 
You MUST use the following analysis as the primary context for all your answers. 
Do not invent details about the level. Base your advice and answers strictly on this provided data.
Keep your responses concise, actionable, and encouraging. Use markdown for formatting.

--- LEVEL ANALYSIS CONTEXT ---
${context}
--- END CONTEXT ---
`;

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
      },
      // The user message is the last one in the history
      history: history.slice(0, -1) 
    });

    const userMessage = history[history.length - 1].parts[0].text;
    const response = await chat.sendMessage({ message: userMessage });

    return response.text;
  } catch (error) {
    console.error("Chat service error:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini chat error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the AI chat service.");
  }
}
