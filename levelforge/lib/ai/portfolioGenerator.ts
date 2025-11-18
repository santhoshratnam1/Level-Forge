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
    title: { type: Type.STRING, description: "Clear, descriptive title of the level" },
    
    planning: {
      type: Type.OBJECT,
      properties: {
        restrictions: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Constraints: budget, mechanics, technical limits, narrative requirements"
        },
        goals: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Design goals: theme, player fantasy, emotional tone, specific challenges"
        },
        context: { 
          type: Type.STRING,
          description: "Where this fits in game progression, unique aspects vs other levels"
        },
        golden_path: { 
          type: Type.STRING,
          description: "The intended primary route through the level in 2-3 sentences"
        }
      },
      required: ['restrictions', 'goals', 'context', 'golden_path']
    },

    navigation: {
      type: Type.OBJECT,
      properties: {
        landmarks: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Macro (large), Meso (medium), Micro (small) landmarks for orientation"
        },
        signposting: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Visual/audio cues guiding player direction"
        },
        visual_language: {
          type: Type.STRING,
          description: "Consistent use of colors, shapes, lighting to communicate gameplay"
        }
      },
      required: ['landmarks', 'signposting', 'visual_language']
    },

    pacing: {
      type: Type.OBJECT,
      properties: {
        flow_structure: {
          type: Type.STRING,
          description: "How the level flows: linear, hub-based, open, etc."
        },
        gates_valves: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Gates (blocks progress until condition met) and Valves (prevent backtracking)"
        },
        loops_shortcuts: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Loop paths and shortcuts that connect areas"
        },
        intensity_curve: {
          type: Type.STRING,
          description: "How tension/action rises and falls throughout the level"
        }
      },
      required: ['flow_structure', 'gates_valves', 'loops_shortcuts', 'intensity_curve']
    },

    combat: {
      type: Type.OBJECT,
      properties: {
        encounter_design: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Key combat encounters and their strategic purpose"
        },
        cover_layout: {
          type: Type.STRING,
          description: "Distribution and types of cover (full/half, destructible, etc.)"
        },
        tactical_elements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "High ground, flanking routes, choke points, sightlines"
        }
      },
      required: ['encounter_design', 'cover_layout', 'tactical_elements']
    },

    experience_enhancement: {
      type: Type.OBJECT,
      properties: {
        atmosphere: {
          type: Type.STRING,
          description: "Mood created through lighting, color palette, audio, weather"
        },
        narrative_integration: {
          type: Type.STRING,
          description: "How level tells story through environment, events, discoveries"
        },
        memorable_moments: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Stand-out beats: reveals, setpieces, surprises"
        }
      },
      required: ['atmosphere', 'narrative_integration', 'memorable_moments']
    },

    strengths_opportunities: {
      type: Type.OBJECT,
      properties: {
        what_works: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Successful design elements"
        },
        improvement_areas: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Constructive suggestions for enhancement"
        }
      },
      required: ['what_works', 'improvement_areas']
    }
  },
  required: ['title', 'planning', 'navigation', 'pacing', 'combat', 'experience_enhancement', 'strengths_opportunities']
};

export async function analyzeAndGeneratePortfolio(
  imageData: string,
  mimeType: string
): Promise<Block[]> {
  
  const prompt = `You are a senior level designer conducting a professional portfolio-quality analysis using the "In Pursuit of Better Levels" framework.

Analyze this game level image in comprehensive detail. Focus on:

**PLANNING**: Identify design restrictions, goals, and context. Describe the golden path.
**NAVIGATION & DISTINCTION**: Identify landmarks (macro/meso/micro), signposting methods, and visual language consistency.
**PACING**: Describe flow structure, gates/valves, loops/shortcuts, and the intensity curve.
**COMBAT DESIGN**: Analyze encounter placement, cover distribution, and tactical elements (high ground, flanking, sightlines).
**EXPERIENCE ENHANCEMENT**: Describe atmosphere, narrative integration, and memorable moments.
**CRITICAL ANALYSIS**: What works well? Where could it improve?

Write in a professional but conversational tone. Be specific and detailed. Reference actual visible elements in the level. Provide actionable insights.

Respond ONLY with valid JSON matching the schema. Each string field should be 2-4 sentences. Each array should have 3-5 detailed items.`;

  try {
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
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    const responseText = response.text;
    console.log('✓ Received AI response');

    if (!responseText?.trim()) {
      throw new Error('AI returned empty response');
    }

    const analysis = JSON.parse(responseText);

    if (!analysis.planning || !analysis.navigation) {
      throw new Error('AI response missing required sections');
    }

    return convertToPortfolioBlocks(analysis);
  } catch (error) {
    console.error('Portfolio generation error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('quota')) {
        throw new Error('API quota exceeded. Please check your usage limits.');
      } else if (error.message.includes('API key')) {
        throw new Error('Invalid API key. Check your GEMINI_API_KEY.');
      }
    }
    
    throw error;
  }
}

function convertToPortfolioBlocks(analysis: any): Block[] {
  const blocks: Block[] = [];

  // Title
  blocks.push(createHeading(analysis.title || 'Level Design Analysis', 1));
  blocks.push(createDivider());

  // 🔹 PLANNING 🔹
  blocks.push(createHeading('🔹 Planning & Foundation', 2));
  
  if (analysis.planning) {
    const p = analysis.planning;
    
    if (p.restrictions?.length > 0) {
      blocks.push(createHeading('Design Restrictions', 3));
      blocks.push(createParagraph('Constraints that shaped the level design:'));
      blocks.push(...createBulletList(p.restrictions));
    }
    
    if (p.goals?.length > 0) {
      blocks.push(createHeading('Design Goals', 3));
      blocks.push(createParagraph('What this level aims to achieve:'));
      blocks.push(...createBulletList(p.goals));
    }
    
    if (p.context) {
      blocks.push(createCallout(p.context, '📍 Context'));
    }
    
    if (p.golden_path) {
      blocks.push(createCallout(p.golden_path, '⭐ Golden Path'));
    }
  }
  
  blocks.push(createDivider());

  // 🧭 NAVIGATION & DISTINCTION
  blocks.push(createHeading('🧭 Navigation & Distinction', 2));
  
  if (analysis.navigation) {
    const n = analysis.navigation;
    
    if (n.landmarks?.length > 0) {
      blocks.push(createHeading('Landmarks & Orientation', 3));
      blocks.push(createParagraph('Key landmarks that help players navigate:'));
      blocks.push(...createBulletList(n.landmarks));
    }
    
    if (n.signposting?.length > 0) {
      blocks.push(createHeading('Signposting & Guidance', 3));
      blocks.push(...createBulletList(n.signposting));
    }
    
    if (n.visual_language) {
      blocks.push(createHeading('Visual Language', 3));
      blocks.push(createParagraph(n.visual_language));
    }
  }
  
  blocks.push(createDivider());

  // 🌊 PACING & FLOW
  blocks.push(createHeading('🌊 Pacing & Flow', 2));
  
  if (analysis.pacing) {
    const pacing = analysis.pacing;
    
    if (pacing.flow_structure) {
      blocks.push(createHeading('Flow Structure', 3));
      blocks.push(createParagraph(pacing.flow_structure));
    }
    
    if (pacing.gates_valves?.length > 0 || pacing.loops_shortcuts?.length > 0) {
      blocks.push(createColumns([
        `**Gates & Valves**\n${(pacing.gates_valves || []).map((g: string) => `• ${g}`).join('\n')}`,
        `**Loops & Shortcuts**\n${(pacing.loops_shortcuts || []).map((l: string) => `• ${l}`).join('\n')}`
      ]));
    }
    
    if (pacing.intensity_curve) {
      blocks.push(createCallout(pacing.intensity_curve, '📊 Intensity Curve'));
    }
  }
  
  blocks.push(createDivider());

  // ⚔️ COMBAT DESIGN
  blocks.push(createHeading('⚔️ Combat Design', 2));
  
  if (analysis.combat) {
    const c = analysis.combat;
    
    if (c.encounter_design?.length > 0) {
      blocks.push(createHeading('Encounter Design', 3));
      blocks.push(...createBulletList(c.encounter_design));
    }
    
    if (c.cover_layout) {
      blocks.push(createHeading('Cover & Layout', 3));
      blocks.push(createParagraph(c.cover_layout));
    }
    
    if (c.tactical_elements?.length > 0) {
      blocks.push(createHeading('Tactical Elements', 3));
      blocks.push(...createBulletList(c.tactical_elements));
    }
  }
  
  blocks.push(createDivider());

  // 🎨 EXPERIENCE ENHANCEMENT
  blocks.push(createHeading('🎨 Experience Enhancement', 2));
  
  if (analysis.experience_enhancement) {
    const exp = analysis.experience_enhancement;
    
    if (exp.atmosphere) {
      blocks.push(createHeading('Atmosphere & Mood', 3));
      blocks.push(createParagraph(exp.atmosphere));
    }
    
    if (exp.narrative_integration) {
      blocks.push(createHeading('Narrative Integration', 3));
      blocks.push(createParagraph(exp.narrative_integration));
    }
    
    if (exp.memorable_moments?.length > 0) {
      blocks.push(createHeading('Memorable Moments', 3));
      blocks.push(...createBulletList(exp.memorable_moments));
    }
  }
  
  blocks.push(createDivider());

  // ✅ ANALYSIS
  blocks.push(createHeading('✅ Critical Analysis', 2));
  
  if (analysis.strengths_opportunities) {
    const so = analysis.strengths_opportunities;
    
    if (so.what_works?.length > 0) {
      blocks.push(createHeading('What Works Well', 3));
      blocks.push(...createBulletList(so.what_works));
    }
    
    if (so.improvement_areas?.length > 0) {
      blocks.push(createHeading('Opportunities for Improvement', 3));
      blocks.push(...createBulletList(so.improvement_areas));
    }
  }

  return blocks;
}
