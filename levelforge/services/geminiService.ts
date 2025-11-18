import { GoogleGenAI, Modality } from "@google/genai";
import { withTimeout } from '../utils/timeout';
import { genres } from '../lib/ai/genreTemplates';

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
      console.warn(`Attempt ${i + 1}/${maxRetries} failed:`, error instanceof Error ? error.message : error);
      
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

type VisualInput = 
  | { images: { imageData: string; mimeType: string }[] }
  | { analysisData: any };


export const generateVisualAsset = async (
  input: VisualInput,
  assetType: 'Top-down whitebox map' | 'Player flow diagram' | 'Combat analysis overlay' | 'Flow & Loops Overlay',
  genre: string
): Promise<string> => {
  const TIMEOUT = 120000; // Increased to 120 seconds for image generation
  const template = genres[genre] || genres['general'];
  
  console.log(`Generating ${assetType} for genre: ${genre}...`);
  
  let prompt: string;
  let contents: { parts: ({ text: string } | { inlineData: { data: string; mimeType: string } })[] };

  if ('images' in input && input.images.length > 0) {
    const imageParts = input.images.map(img => ({
      inlineData: { data: img.imageData, mimeType: img.mimeType }
    }));
    prompt = `From these ${input.images.length} screenshots of the same level, ${template.visualPrompts.image[assetType]}`;
    contents = {
      parts: [ ...imageParts, { text: prompt } ],
    };
  } else if ('analysisData' in input) {
    const analysisText = `Here is a JSON representation of a level design analysis:\n\n${JSON.stringify(input.analysisData, null, 2)}`;
    prompt = `${template.visualPrompts.text[assetType]}\n\n${analysisText}`;
    contents = { parts: [{ text: prompt }] };
  } else {
    throw new Error("Invalid input for generateVisualAsset. Provide either images or analysis data.");
  }
  
  try {
    return await withTimeout(
      retryWithBackoff(async () => {
        console.log(`Making API call for ${assetType}...`);
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: contents,
          config: {
            responseModalities: [Modality.IMAGE],
          },
        });

        console.log(`Received response for ${assetType}`);

        // Check if we have candidates
        if (!response.candidates || response.candidates.length === 0) {
          throw new Error(`No candidates returned for ${assetType}`);
        }

        // Look for image data in the response
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64ImageData: string = part.inlineData.data;
            console.log(`✓ Successfully generated ${assetType}`);
            return `data:image/png;base64,${base64ImageData}`;
          }
        }

        throw new Error(`No image data found in response for ${assetType}`);
      }, 2), // Reduced retries to 2 to avoid excessive waiting
      TIMEOUT,
      `Image generation timed out after 120 seconds for ${assetType}`
    );
  } catch (error) {
    console.error(`Error generating ${assetType}:`, error);
    
    // Return a placeholder or rethrow with more context
    if (error instanceof Error) {
      throw new Error(`Failed to generate ${assetType}: ${error.message}`);
    }
    throw error;
  }
};