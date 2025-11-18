// FIX: Added Modality to imports for image generation.
import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { PortfolioData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const portfolioSchema = {
  type: Type.OBJECT,
  properties: {
    overview: { 
      type: Type.OBJECT, 
      properties: { 
        title: { type: Type.STRING }, 
        content: { type: Type.OBJECT, properties: { "Goal": {type: Type.STRING}, "Fantasy": {type: Type.STRING}, "Theme": {type: Type.STRING}, "Structure": {type: Type.STRING} } }
      } 
    },
    foundation: { 
      type: Type.OBJECT, 
      properties: { 
        title: { type: Type.STRING }, 
        content: { type: Type.OBJECT, properties: { "Concept Goals": {type: Type.STRING}, "Constraints": {type: Type.STRING}, "Metrics": {type: Type.STRING}, "High-Level Flow": {type: Type.STRING} } }
      } 
    },
    design_system: { 
      type: Type.OBJECT, 
      properties: { 
        title: { type: Type.STRING }, 
        content: { type: Type.OBJECT, properties: { "Navigation": {type: Type.STRING}, "Landmarks": {type: Type.STRING}, "Signposting": {type: Type.STRING}, "Chokepoints": {type: Type.STRING} } }
      } 
    },
    pacing: { 
      type: Type.OBJECT, 
      properties: { 
        title: { type: Type.STRING }, 
        content: { type: Type.OBJECT, properties: { "Peaks": {type: Type.STRING}, "Valleys": {type: Type.STRING}, "Loops": {type: Type.STRING}, "Encounters": {type: Type.STRING} } }
      } 
    },
    combat_design: { 
      type: Type.OBJECT, 
      properties: { 
        title: { type: Type.STRING }, 
        content: { type: Type.OBJECT, properties: { "Cover Layout": {type: Type.STRING}, "Line of Sight": {type: Type.STRING}, "High/Low Ground": {type: Type.STRING}, "Lanes of Engagement": {type: Type.STRING} } }
      } 
    },
    playtest_summary: { 
      type: Type.OBJECT, 
      properties: { 
        title: { type: Type.STRING }, 
        content: { type: Type.OBJECT, properties: { "Potential Problems": {type: Type.STRING}, "Suggested Fixes": {type: Type.STRING} } }
      } 
    },
  },
};


export const analyzeContent = async (base64Image: string, mimeType: string): Promise<PortfolioData> => {
  const prompt = `You are an expert level design analyst. Your task is to analyze the provided game level screenshot and generate a detailed portfolio page based on the principles of excellent level design, structured according to the "In Pursuit of Better Levels" framework.

  Analyze the image and generate a JSON object that strictly follows the provided schema. For each key, provide a detailed analysis based on visual evidence from the image. If something is not visible, infer it based on common design patterns or state that it cannot be determined. Your response should be concise, using bullet points where appropriate.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64Image } },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: portfolioSchema,
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });

  const jsonText = response.text;
  
  try {
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as PortfolioData;
  } catch(e) {
    console.error("Failed to parse Gemini response:", e);
    console.error("Raw response:", jsonText);
    throw new Error("The AI returned an invalid data structure.");
  }
};

// FIX: Updated to use `generateContent` with `gemini-2.5-flash-image` for image-to-image generation, as `generateImages` does not support input images.
export const generateVisualAsset = async (base64Image: string, mimeType: string, assetType: 'Top-down whitebox map' | 'Player flow diagram' | 'Combat analysis overlay'): Promise<string> => {
  let prompt = '';
  switch (assetType) {
    case 'Top-down whitebox map':
      prompt = 'Create a stylized, clean, top-down 2D whitebox diagram of the level layout shown in the provided image. Focus on the main architectural shapes, pathways, and cover objects. Use simple geometric shapes. The style should be minimalist, clear, and suitable for a level design document. The background should be a dark gray.';
      break;
    case 'Player flow diagram':
      prompt = 'Generate an image that illustrates the likely player flow through the level in the screenshot. Draw arrows and paths on top of a simplified, faded version of the original image to indicate primary routes, secondary routes, and potential loops. Use blue for primary paths and yellow for secondary paths.';
      break;
    case 'Combat analysis overlay':
      prompt = 'Analyze the provided level screenshot for combat design. Generate an image that highlights key combat areas. Use red transparent overlays for enemy positions, blue for player cover spots, and draw yellow lines-of-sight for key engagement lanes. The image should be a tactical overlay on a desaturated version of the original image.';
      break;
  }
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageData: string = part.inlineData.data;
      return `data:image/png;base64,${base64ImageData}`;
    }
  }

  throw new Error('Image generation failed.');
};
