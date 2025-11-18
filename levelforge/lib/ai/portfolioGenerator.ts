import { getAiInstance } from '../../services/geminiService';
import type { Block } from '../../types/portfolio';
import { 
  createHeading, 
  createParagraph, 
  createBulletList, 
  createCallout,
  createDivider,
  createColumns
} from '../../types/portfolio';
import { genres } from './genreTemplates';

// FIX: Export a general schema and prompt for use in other modules like the comparison analyzer.
export const portfolioSchema = genres.general.schema;
export const portfolioAnalysisPrompt = genres.general.analysisPrompt;


export async function analyzeAndGeneratePortfolio(
  imageData: string,
  mimeType: string,
  genre: string
): Promise<{ blocks: Block[], analysisJson: any }> {
  
  const template = genres[genre] || genres['general'];
  const { analysisPrompt, schema } = template;
  const ai = getAiInstance();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: {
        parts: [
          { inlineData: { mimeType, data: imageData } },
          { text: analysisPrompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    const responseText = response.text;
    console.log('✓ Received AI response');

    if (!responseText?.trim()) {
      throw new Error('AI returned empty response');
    }

    const analysis = JSON.parse(responseText);

    if (!analysis.planning) {
      throw new Error('AI response missing required sections');
    }

    return {
        blocks: convertToPortfolioBlocks(analysis),
        analysisJson: analysis
    };
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

// FIX: Export this function so it can be imported and used in other modules like comparisonAnalyzer.ts
export function convertToPortfolioBlocks(analysis: any): Block[] {
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

  // GENRE-SPECIFIC SECTION
  if (analysis.combat) {
    blocks.push(createHeading('⚔️ Combat Design (FPS)', 2));
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
    blocks.push(createDivider());
  }
  
  if (analysis.platforming_challenges) {
      blocks.push(createHeading('🏃 Platforming Challenges', 2));
      const p = analysis.platforming_challenges;
      if (p.core_mechanics?.length > 0) {
          blocks.push(createHeading('Core Mechanics', 3));
          blocks.push(...createBulletList(p.core_mechanics));
      }
      if (p.hazard_design?.length > 0) {
          blocks.push(createHeading('Hazard & Obstacle Design', 3));
          blocks.push(...createBulletList(p.hazard_design));
      }
      if (p.skill_curve) {
          blocks.push(createCallout(p.skill_curve, '📈 Skill Curve'));
      }
      blocks.push(createDivider());
  }

  if (analysis.puzzle_design) {
      blocks.push(createHeading('🧩 Puzzle Design', 2));
      const p = analysis.puzzle_design;
      if (p.puzzle_mechanics?.length > 0) {
          blocks.push(createHeading('Puzzle Mechanics', 3));
          blocks.push(...createBulletList(p.puzzle_mechanics));
      }
      if (p.hinting_signposting) {
          blocks.push(createHeading('Hinting & Signposting', 3));
          blocks.push(createParagraph(p.hinting_signposting));
      }
      if (p.solution_paths) {
          blocks.push(createCallout(p.solution_paths, '💡 Solution Paths'));
      }
      blocks.push(createDivider());
  }
  
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
  
  // 🧠 PLAYER PSYCHOLOGY
  blocks.push(createHeading('🧠 Player Psychology', 2));
  if (analysis.player_psychology) {
    const psy = analysis.player_psychology;
    if (psy.cognitive_load) {
      blocks.push(createHeading('Cognitive Load', 3));
      blocks.push(createParagraph(psy.cognitive_load));
    }
    if (psy.risk_reward?.length > 0) {
      blocks.push(createHeading('Risk vs. Reward', 3));
      blocks.push(...createBulletList(psy.risk_reward));
    }
    if (psy.emotional_journey) {
      blocks.push(createCallout(psy.emotional_journey, '🎢 Emotional Journey'));
    }
  }
  blocks.push(createDivider());

  // 📚 NARRATIVE & THEME
  blocks.push(createHeading('📚 Narrative & Theme', 2));
  if (analysis.narrative_theme) {
    const nar = analysis.narrative_theme;
    if (nar.environmental_storytelling) {
      blocks.push(createHeading('Environmental Storytelling', 3));
      blocks.push(createParagraph(nar.environmental_storytelling));
    }
    if (nar.thematic_consistency) {
      blocks.push(createHeading('Thematic Consistency', 3));
      blocks.push(createParagraph(nar.thematic_consistency));
    }
    if (nar.symbolism?.length > 0) {
      blocks.push(createHeading('Symbolism & Motifs', 3));
      blocks.push(...createBulletList(nar.symbolism));
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