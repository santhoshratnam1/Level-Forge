import { GoogleGenAI, Modality } from "@google/genai";
import { withTimeout } from '../utils/timeout';

// More robust validation
if (!process.env.API_KEY) {
  const errorMsg = 'API_KEY environment variable not set. Please ensure it is configured correctly.';
  console.error(errorMsg);
  throw new Error(errorMsg);
}

if (process.env.API_KEY.length < 20) {
  console.warn('API key seems unusually short. Please verify it is correct.');
}


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Utility: Retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${i + 1} failed:`, error);
      
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

export const generateVisualAsset = async (
  input: { base64Data: string; mimeType: string } | { analysisData: any },
  assetType: 'Top-down whitebox map' | 'Player flow diagram' | 'Combat analysis overlay' | 'Flow & Loops Overlay'
): Promise<string> => {
  const TIMEOUT = 90000; // 90 seconds for image generation
  
  let prompt: string;
  let contents: { parts: ({ text: string } | { inlineData: { data: string; mimeType: string } })[] };

  if ('base64Data' in input) {
    // Input is a visual (image or video frame)
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
      case 'Flow & Loops Overlay':
        prompt = 'Generate a diagram illustrating the level\'s flow and loops. On a simplified version of the image, draw the primary path in a thick, solid blue line. Draw secondary paths or optional routes in a dashed yellow line. Clearly mark any shortcuts or loop-backs with green arrows and labels.';
        break;
    }
    contents = {
      parts: [
        { inlineData: { data: input.base64Data, mimeType: input.mimeType } },
        { text: prompt },
      ],
    };
  } else {
    // Input is textual analysis (from a PDF)
    const analysisText = `Here is a JSON representation of a level design analysis:\n\n${JSON.stringify(input.analysisData, null, 2)}`;
    switch (assetType) {
      case 'Top-down whitebox map':
        prompt = `Based on the following level design analysis, generate a conceptual, clean, top-down 2D whitebox diagram of the described level layout. Focus on the main architectural shapes, pathways, and cover objects mentioned. Use simple geometric shapes. The style should be minimalist, clear, and suitable for a level design document. The background should be a dark gray.\n\n${analysisText}`;
        break;
      case 'Player flow diagram':
        prompt = `From the provided level design analysis, create a diagram illustrating the likely player flow. Generate arrows and paths to indicate primary and secondary routes. Use blue for primary paths and yellow for secondary paths. The background should be a neutral, dark grid.\n\n${analysisText}`;
        break;
      case 'Combat analysis overlay':
        prompt = `Based on the level design analysis below, generate a tactical map. Use red shapes for potential enemy concentrations, blue shapes for player cover spots, and yellow lines for key lines-of-sight. The diagram should be a conceptual, top-down view on a dark grid.\n\n${analysisText}`;
        break;
      case 'Flow & Loops Overlay':
        prompt = `Based on the level design analysis below, generate a diagram illustrating the level's flow and loops. Draw a primary path in a thick, solid blue line. Draw secondary paths in a dashed yellow line. Clearly mark shortcuts or loop-backs with green arrows. The diagram should be a conceptual, top-down view on a dark grid.\n\n${analysisText}`;
        break;
    }
    contents = { parts: [{ text: prompt }] };
  }
  
  return withTimeout(
    retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: contents,
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

      throw new Error(`Image generation failed for ${assetType}.`);
    }),
    TIMEOUT,
    `Image generation timed out after 90 seconds`
  );
};
