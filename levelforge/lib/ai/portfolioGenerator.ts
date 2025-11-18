import { GoogleGenAI, Type } from '@google/genai';
import type { Block } from '@/types/portfolio';
import { 
  createHeading, 
  createParagraph, 
  createBulletList, 
  createCallout,
  createDivider,
  createColumns
} from '@/types/portfolio';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const portfolioSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    overview: {
      type: Type.OBJECT,
      properties: {
        goal: { type: Type.STRING },
        fantasy: { type: Type.STRING },
        theme: { type: Type.STRING },
        structure: { type: Type.STRING },
        key_features: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    foundation: {
      type: Type.OBJECT,
      properties: {
        design_goals: { type: Type.ARRAY, items: { type: Type.STRING } },
        constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
        golden_path: { type: Type.STRING }
      }
    },
    navigation: {
      type: Type.OBJECT,
      properties: {
        landmarks: { type: Type.ARRAY, items: { type: Type.STRING } },
        breadcrumbs: { type: Type.ARRAY, items: { type: Type.STRING } },
        signposting: { type: Type.ARRAY, items: { type: Type.STRING } },
      }
    },
    combat: {
      type: Type.OBJECT,
      properties: {
        cover_layout: { type: Type.STRING },
        line_of_sight: { type: Type.STRING },
        high_ground: { type: Type.STRING },
      }
    },
    flow: {
      type: Type.OBJECT,
      properties: {
        primary_path: { type: Type.STRING },
        secondary_routes: { type: Type.ARRAY, items: { type: Type.STRING } },
        loops: { type: Type.STRING },
      }
    },
    playtest: {
      type: Type.OBJECT,
      properties: {
        key_issues: { type: Type.ARRAY, items: { type: Type.STRING } },
        suggested_improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
      }
    }
  }
};

export async function analyzeAndGeneratePortfolio(
  imageData: string,
  mimeType: string
): Promise<Block[]> {
  
  const prompt = `You are an expert level designer creating a professional portfolio page.
Analyze this game level image in detail and generate a comprehensive portfolio document following the "In Pursuit of Better Levels" framework.
Respond ONLY with the JSON matching the schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: {
      parts: [
        { inlineData: { mimeType, data: imageData } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: portfolioSchema,
      thinkingConfig: { thinkingBudget: 24576 }
    }
  });

  const analysis = JSON.parse(response.text);
  
  return convertToPortfolioBlocks(analysis);
}

function convertToPortfolioBlocks(analysis: any): Block[] {
  const blocks: Block[] = [];

  blocks.push(createHeading(analysis.title || 'Level Design Portfolio', 1));
  blocks.push(createDivider());

  // Overview
  blocks.push(createHeading('📋 Overview', 2));
  blocks.push(createParagraph(`**Goal:** ${analysis.overview.goal}\n**Player Fantasy:** ${analysis.overview.fantasy}\n**Theme:** ${analysis.overview.theme}\n**Structure:** ${analysis.overview.structure}`));
  blocks.push(createParagraph('**Key Features:**'));
  blocks.push(...createBulletList(analysis.overview.key_features));
  blocks.push(createDivider());

  // Foundation
  blocks.push(createHeading('🏗️ Foundation', 2));
  blocks.push(createParagraph('**Design Goals:**'));
  blocks.push(...createBulletList(analysis.foundation.design_goals));
  blocks.push(createParagraph('**Constraints:**'));
  blocks.push(...createBulletList(analysis.foundation.constraints));
  blocks.push(createCallout(`**Golden Path:** ${analysis.foundation.golden_path}`, 'Golden Path'));
  blocks.push(createDivider());

  // Navigation
  blocks.push(createHeading('🧭 Navigation & Readability', 2));
  blocks.push(createParagraph('**Landmarks:**'));
  blocks.push(...createBulletList(analysis.navigation.landmarks));
  blocks.push(createParagraph('**Breadcrumbs & Signposting:**'));
  blocks.push(...createBulletList([...analysis.navigation.breadcrumbs, ...analysis.navigation.signposting]));
  blocks.push(createDivider());
  
  // Combat
  if (analysis.combat) {
    blocks.push(createHeading('⚔️ Combat Design', 2));
    blocks.push(createColumns([
        `**Cover Layout:**\n${analysis.combat.cover_layout}`,
        `**Line of Sight & High Ground:**\n${analysis.combat.line_of_sight}\n${analysis.combat.high_ground}`
    ]));
    blocks.push(createDivider());
  }

  // Flow
  blocks.push(createHeading('🌊 Flow & Movement', 2));
  blocks.push(createParagraph(`**Primary Path:** ${analysis.flow.primary_path}`));
  blocks.push(createParagraph('**Secondary Routes:**'));
  blocks.push(...createBulletList(analysis.flow.secondary_routes));
  blocks.push(createParagraph(`**Loops:** ${analysis.flow.loops}`));
  blocks.push(createDivider());
  
  // Playtest
  if (analysis.playtest) {
    blocks.push(createHeading('🧪 Playtest Insights', 2));
    blocks.push(createCallout(`**Potential Issues:**\n${analysis.playtest.key_issues.map((i: string) => `• ${i}`).join('\n')}`, 'Potential Issues'));
    blocks.push(createParagraph('**Suggested Improvements:**'));
    blocks.push(...createBulletList(analysis.playtest.suggested_improvements));
  }

  return blocks;
}
