import { GoogleGenAI, Type } from '@google/genai';
import { portfolioSchema, portfolioAnalysisPrompt, convertToPortfolioBlocks } from './portfolioGenerator';
import type { Block, ComparisonPayload, ComparisonResult } from '../../types/portfolio';
import { createHeading, createParagraph } from '../../types/portfolio';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const comparisonSchema = {
  type: Type.OBJECT,
  properties: {
    executive_summary: {
      type: Type.STRING,
      description: "A high-level overview comparing the levels' core philosophies and player experiences."
    },
    key_differentiators: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "The top 3-5 most significant differences between the levels."
    },
    shared_strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Common design patterns or strengths shared across the levels."
    },
    comparative_analysis: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                category: { type: Type.STRING, description: "e.g., Navigation, Pacing, Combat Design" },
                breakdown: { type: Type.STRING, description: "Detailed comparison for this category." }
            },
            required: ['category', 'breakdown']
        }
    }
  },
  required: ['executive_summary', 'key_differentiators', 'shared_strengths', 'comparative_analysis']
};


export async function analyzeAndComparePortfolios(payload: ComparisonPayload): Promise<ComparisonResult> {
    // 1. Analyze each level individually and in parallel
    const portfolioPromises = payload.levels.map(async (level) => {
        // We need the raw JSON analysis, not the block structure for the comparison prompt
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [{
                parts: [
                    { inlineData: { mimeType: level.mimeType, data: level.base64 } },
                    { text: portfolioAnalysisPrompt }
                ]
            }],
             config: { 
                responseMimeType: 'application/json',
                responseSchema: portfolioSchema,
                thinkingConfig: { thinkingBudget: 32768 }
             }
        });
        const responseText = response.text;
        if (!responseText?.trim()) {
          throw new Error(`AI returned empty response for level ${level.id}`);
        }
        return {
            id: level.id,
            analysis: JSON.parse(responseText),
        };
    });

    const individualAnalyses = await Promise.all(portfolioPromises);
    
    const comparisonPrompt = `You are a lead level designer comparing multiple level analyses. 
    
    Here are the JSON analyses for ${individualAnalyses.length} different levels:
    ${individualAnalyses.map(a => `\n\n--- LEVEL: ${a.id} ---\n${JSON.stringify(a.analysis, null, 2)}`).join('')}
    
    Your task is to provide a high-level comparative analysis. Focus on the differences in design philosophy, execution, and player experience. Pay special attention to comparing their approaches to **Player Psychology** (how they manage cognitive load and risk/reward) and **Narrative Integration** (how they use the environment to tell a story).
    
    Do not just list what each level has; compare them directly. For example, "Level A uses a hub-and-spoke model for excellent player agency, whereas Level B's linear approach creates a more directed, cinematic experience."
    
    Respond ONLY with a valid JSON object matching the provided schema.`;

    // 2. Perform the comparative analysis
    const comparisonResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ parts: [{ text: comparisonPrompt }] }],
        config: {
            responseMimeType: 'application/json',
            responseSchema: comparisonSchema,
            thinkingConfig: { thinkingBudget: 32768 }
        }
    });

    const comparisonJson = JSON.parse(comparisonResponse.text);

    // 3. Convert all results into Block format for rendering
    const result: ComparisonResult = {
        portfolios: individualAnalyses.map(a => ({
            id: a.id,
            blocks: convertToPortfolioBlocks(a.analysis)
        })),
        comparisonAnalysis: [
            createHeading('Comparative Analysis', 1),
            createHeading('Executive Summary', 2),
            createParagraph(comparisonJson.executive_summary),
            ...(comparisonJson.comparative_analysis.map((cat: any) => ([
                createHeading(cat.category, 2),
                createParagraph(cat.breakdown)
            ])).flat()),
        ]
    };
    
    return result;
}