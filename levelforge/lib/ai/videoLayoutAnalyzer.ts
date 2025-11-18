import { Type } from "@google/genai";
import { getAiInstance } from '../../services/geminiService';
import type { ExtractedFrame } from '../../types/portfolio';
import { withTimeout } from '../../utils/timeout';

const layoutSchema = {
  type: Type.OBJECT,
  properties: {
    overall_layout_description: {
      type: Type.STRING,
      description: "A high-level description of the level's structure (e.g., 'linear dungeon', 'hub with spokes', 'open area')."
    },
    areas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A short, unique identifier for the area (e.g., 'main_hall', 'sewer_tunnel')." },
          description: { type: Type.STRING, description: "A description of the area's appearance, key features, and purpose." },
          connections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                to_area_id: { type: Type.STRING, description: "The ID of the area this one connects to." },
                description: { type: Type.STRING, description: "How they are connected (e.g., 'A large archway', 'A narrow corridor')." }
              }
            }
          }
        }
      }
    },
    key_features: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          feature: { type: Type.STRING, description: "A key feature or landmark (e.g., 'Central Fountain', 'Collapsed Bridge')." },
          area_id: { type: Type.STRING, description: "The ID of the area where this feature is located." }
        }
      }
    }
  },
  required: ['overall_layout_description', 'areas', 'key_features']
};


export async function analyzeVideoForLayout(frames: ExtractedFrame[]): Promise<any> {
    const TIMEOUT = 180000; // 3 minutes, as this can be a long process
    const prompt = `You are a professional cartographer and level designer. Your task is to infer a 2D top-down map and spatial layout from a sequence of first-person gameplay frames.
    
    I will provide frames in chronological order. Analyze the player's movement and what they see to build a coherent understanding of the level's geometry.
    - Identify distinct areas or rooms.
    - Describe how these areas connect to each other.
    - Note key landmarks or features.
    
    The goal is to produce a structured JSON description of the level layout that can be used later to generate a top-down diagram. Be descriptive and focus on spatial relationships. Infer the layout even if the player doesn't show every corner. Assume standard architectural logic.
    
    Respond ONLY with a valid JSON object matching the provided schema.`;

    const requestParts: ({text: string} | {inlineData: {mimeType: string, data: string}})[] = [{ text: prompt }];
    frames.forEach(frame => {
      requestParts.push({ text: `Frame at ${frame.timestamp} seconds:` });
      requestParts.push({
        inlineData: { mimeType: 'image/jpeg', data: frame.base64 }
      });
    });

    try {
        const analyze = async () => {
            const ai = getAiInstance();
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: requestParts },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: layoutSchema,
                }
            });
            
            const responseText = response.text;
            if (!responseText?.trim()) {
                throw new Error('AI returned an empty response for layout analysis.');
            }

            const analysis = JSON.parse(responseText);
            // Also add a title for compatibility with asset generator
            analysis.title = "Inferred Level Layout";
            return analysis;
        };

        return await withTimeout(
            analyze(),
            TIMEOUT,
            'Spatial layout analysis timed out after 3 minutes. The video might be too long or complex.'
        );

    } catch (error) {
        console.error("Video layout analysis error:", error);
         if (error instanceof Error) {
            throw new Error(`Gemini layout analysis error: ${error.message}`);
        }
        throw new Error("An unknown error occurred during video layout analysis.");
    }
}