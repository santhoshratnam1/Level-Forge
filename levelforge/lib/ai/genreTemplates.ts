import { Type } from '@google/genai';
import { IconName } from '../../components/Icon';

// ===================================
// BASE SCHEMA & PROMPT
// ===================================

const baseSchemaProperties = {
  title: { type: Type.STRING, description: "Clear, descriptive title of the level" },
  planning: {
    type: Type.OBJECT,
    properties: {
      restrictions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Constraints: budget, mechanics, technical limits, narrative." },
      goals: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Design goals: theme, player fantasy, emotional tone." },
      context: { type: Type.STRING, description: "Where this fits in game progression." },
      golden_path: { type: Type.STRING, description: "The intended primary route through the level." }
    },
    required: ['restrictions', 'goals', 'context', 'golden_path']
  },
  navigation: {
    type: Type.OBJECT,
    properties: {
      landmarks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Macro, Meso, and Micro landmarks." },
      signposting: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Visual/audio cues guiding the player." },
      visual_language: { type: Type.STRING, description: "Consistent use of colors, shapes, lighting." }
    },
    required: ['landmarks', 'signposting', 'visual_language']
  },
  pacing: {
    type: Type.OBJECT,
    properties: {
      flow_structure: { type: Type.STRING, description: "How the level flows: linear, hub-based, open, etc." },
      gates_valves: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Gates (blocks progress) and Valves (prevent backtracking)." },
      loops_shortcuts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Loop paths and shortcuts." },
      intensity_curve: { type: Type.STRING, description: "How tension/action rises and falls." }
    },
    required: ['flow_structure', 'gates_valves', 'loops_shortcuts', 'intensity_curve']
  },
  experience_enhancement: {
    type: Type.OBJECT,
    properties: {
      atmosphere: { type: Type.STRING, description: "Mood created through lighting, color, audio." },
      narrative_integration: { type: Type.STRING, description: "How the level tells a story through its environment." },
      memorable_moments: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Stand-out beats: reveals, setpieces, surprises." }
    },
    required: ['atmosphere', 'narrative_integration', 'memorable_moments']
  },
  player_psychology: {
    type: Type.OBJECT,
    properties: {
      cognitive_load: { type: Type.STRING, description: "How the level manages the player's mental effort." },
      risk_reward: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key examples of risk vs. reward decisions." },
      emotional_journey: { type: Type.STRING, description: "The intended emotional arc for the player." }
    },
    required: ['cognitive_load', 'risk_reward', 'emotional_journey']
  },
  narrative_theme: {
    type: Type.OBJECT,
    properties: {
      environmental_storytelling: { type: Type.STRING, description: "How the environment tells a story without explicit text." },
      thematic_consistency: { type: Type.STRING, description: "How mechanics and aesthetics reinforce core themes." },
      symbolism: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Objects or layouts with symbolic meaning." }
    },
    required: ['environmental_storytelling', 'thematic_consistency', 'symbolism']
  },
  strengths_opportunities: {
    type: Type.OBJECT,
    properties: {
      what_works: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Successful design elements." },
      improvement_areas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Constructive suggestions for enhancement." }
    },
    required: ['what_works', 'improvement_areas']
  }
};

const baseAnalysisPrompt = `You are a senior level designer conducting a professional portfolio-quality analysis using the "In Pursuit of Better Levels" framework. Analyze this game level image in comprehensive detail. Provide actionable insights. Respond ONLY with valid JSON matching the schema. Each string field should be 2-4 sentences. Each array should have 3-5 detailed items.`;

const baseVisualPrompts = {
    image: {
        'Top-down whitebox map': 'Create a stylized, clean, top-down 2D whitebox diagram of the level layout shown. Focus on main architectural shapes, pathways, and objects. Style should be minimalist and clear for a design document. Background should be dark gray.',
        'Player flow diagram': 'Illustrate the likely player flow through the level. Draw arrows and paths on a simplified, faded version of the original image to indicate primary (blue) and secondary (yellow) routes and loops.',
        'Combat analysis overlay': 'Analyze for combat design. On a desaturated version of the image, highlight key combat areas: red overlays for enemy positions, blue for player cover, and yellow lines-of-sight for key engagement lanes.',
        'Flow & Loops Overlay': 'Illustrate the level\'s flow and loops. On a simplified version, draw the primary path (solid blue), secondary paths (dashed yellow), and shortcuts or loop-backs (green arrows).',
    },
    text: {
        'Top-down whitebox map': 'Based on the level analysis, generate a conceptual, clean, top-down 2D whitebox diagram. Focus on architecture, paths, and cover. Style: minimalist, clear. Background: dark gray.',
        'Player flow diagram': 'From the level analysis, create a diagram illustrating player flow. Show primary (blue) and secondary (yellow) routes. Background: neutral dark grid.',
        'Combat analysis overlay': 'From the level analysis, generate a tactical map. Use red shapes for enemies, blue for cover, and yellow lines for sightlines. Background: dark grid.',
        'Flow & Loops Overlay': 'From the level analysis, generate a flow diagram. Show primary path (solid blue), secondary paths (dashed yellow), and shortcuts (green arrows). Background: dark grid.',
    }
};

// ===================================
// GENRE DEFINITIONS
// ===================================

export interface Genre {
  name: string;
  icon: IconName;
  description: string;
  schema: any; // Simplified for this implementation
  analysisPrompt: string;
  visualPrompts: typeof baseVisualPrompts;
}

export const genres: Record<string, Genre> = {
  general: {
    name: 'General Level Design',
    icon: 'general',
    description: 'A balanced analysis across all design pillars.',
    analysisPrompt: `${baseAnalysisPrompt}\nFocus on a balanced view of Planning, Navigation, Pacing, Combat, and Experience Enhancement.`,
    schema: {
      type: Type.OBJECT,
      properties: {
        ...baseSchemaProperties,
        combat: {
          type: Type.OBJECT,
          properties: {
            encounter_design: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key combat encounters and their purpose." },
            cover_layout: { type: Type.STRING, description: "Distribution and types of cover." },
            tactical_elements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "High ground, flanking routes, choke points." }
          },
          required: ['encounter_design', 'cover_layout', 'tactical_elements']
        },
      },
      required: ['title', 'planning', 'navigation', 'pacing', 'combat', 'experience_enhancement', 'player_psychology', 'narrative_theme', 'strengths_opportunities']
    },
    visualPrompts: baseVisualPrompts,
  },
  fps: {
    name: 'First-Person Shooter',
    icon: 'fps',
    description: 'Focus on combat, sightlines, and cover.',
    analysisPrompt: `${baseAnalysisPrompt}\n**GENRE: FIRST-PERSON SHOOTER.** Deeply analyze combat design, including sightlines, cover quality (full/half, destructible), flanking routes, verticality, and arena layouts.`,
    schema: {
        type: Type.OBJECT,
        properties: {
            ...baseSchemaProperties,
            combat: {
                type: Type.OBJECT,
                properties: {
                    sightlines: { type: Type.STRING, description: "Analysis of long, medium, and short range sightlines." },
                    cover_analysis: { type: Type.STRING, description: "Quality, type (full/half, soft/hard), and placement of cover." },
                    flanking_routes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Primary and secondary routes to bypass enemy positions." },
                    verticality: { type: Type.STRING, description: "Use of high ground and multiple levels for tactical advantage." },
                },
                required: ['sightlines', 'cover_analysis', 'flanking_routes', 'verticality']
            },
        },
        required: ['title', 'planning', 'navigation', 'pacing', 'combat', 'experience_enhancement', 'player_psychology', 'narrative_theme', 'strengths_opportunities']
    },
    visualPrompts: {
        ...baseVisualPrompts,
        image: {
            ...baseVisualPrompts.image,
            'Combat analysis overlay': 'Analyze this FPS level. On a desaturated version of the image, draw primary sightlines (long yellow lines), highlight high-quality cover (blue shapes), and mark key flanking routes (dashed red arrows).',
        },
        text: {
            ...baseVisualPrompts.text,
            'Combat analysis overlay': 'From the FPS level analysis, generate a tactical map. Draw primary sightlines (long yellow lines), highlight high-quality cover (blue shapes), and mark key flanking routes (dashed red arrows). Background: dark grid.',
        }
    }
  },
  platformer: {
      name: 'Platformer',
      icon: 'platformer',
      description: 'Focus on jumps, hazards, and flow.',
      analysisPrompt: `${baseAnalysisPrompt}\n**GENRE: PLATFORMER.** Analyze platforming challenges, including jump design (distance, height, timing), hazard placement, rhythm, and skill-based sections. Identify any secrets or optional paths.`,
      schema: {
          type: Type.OBJECT,
          properties: {
              ...baseSchemaProperties,
              platforming_challenges: {
                  type: Type.OBJECT,
                  properties: {
                      core_mechanics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Analysis of the primary platforming actions (jump, dash, wall-climb)." },
                      hazard_design: { type: Type.ARRAY, items: { type: 'string' }, description: 'Types and placement of environmental hazards.' },
                      rhythm_flow: { type: Type.STRING, description: "The flow and timing of sequential platforming sections." },
                      skill_curve: { type: Type.STRING, description: "How the level teaches and tests player platforming skills." }
                  },
                  required: ['core_mechanics', 'hazard_design', 'rhythm_flow', 'skill_curve']
              },
          },
          required: ['title', 'planning', 'navigation', 'pacing', 'platforming_challenges', 'experience_enhancement', 'player_psychology', 'narrative_theme', 'strengths_opportunities']
      },
      visualPrompts: {
          ...baseVisualPrompts,
          image: {
            ...baseVisualPrompts.image,
            'Player flow diagram': 'Illustrate the player path in this platformer level. On a simplified image, draw the main jump sequence path (solid blue line), highlight locations of difficult jumps or hazards (red circles), and show paths to secrets (dashed yellow lines).',
          },
          text: {
            ...baseVisualPrompts.text,
            'Player flow diagram': 'From the platformer level analysis, diagram the player path. Draw the main jump sequence path (solid blue line), highlight locations of difficult jumps or hazards (red circles), and show paths to secrets (dashed yellow lines). Background: dark grid.',
          }
      },
  },
  puzzle: {
      name: 'Puzzle',
      icon: 'puzzle',
      description: 'Focus on mechanics, hints, and solutions.',
      analysisPrompt: `${baseAnalysisPrompt}\n**GENRE: PUZZLE.** Analyze puzzle design. Deconstruct the core mechanics, the way hints are presented, the logical steps to the solution, and the difficulty curve.`,
      schema: {
          type: Type.OBJECT,
          properties: {
              ...baseSchemaProperties,
              puzzle_design: {
                  type: Type.OBJECT,
                  properties: {
                      puzzle_mechanics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The core rules and interactions of the puzzles." },
                      hinting_signposting: { type: Type.STRING, description: "How the level subtly guides the player towards the solution without being explicit." },
                      solution_paths: { type: Type.STRING, description: "The logical flow and potential 'aha!' moments for the player." },
                      difficulty_curve: { type: Type.STRING, description: "How puzzle complexity evolves through the level." },
                  },
                  required: ['puzzle_mechanics', 'hinting_signposting', 'solution_paths', 'difficulty_curve']
              },
          },
          required: ['title', 'planning', 'navigation', 'pacing', 'puzzle_design', 'experience_enhancement', 'player_psychology', 'narrative_theme', 'strengths_opportunities']
      },
      visualPrompts: {
          ...baseVisualPrompts,
          image: {
            ...baseVisualPrompts.image,
            'Player flow diagram': 'Create a diagram of the solution path for this puzzle level. On a simplified image, use numbered arrows (1, 2, 3...) to show the sequence of required actions or interactions. Highlight key puzzle elements (yellow boxes).',
          },
          text: {
            ...baseVisualPrompts.text,
            'Player flow diagram': 'From the puzzle level analysis, create a solution path diagram. Use numbered arrows (1, 2, 3...) to show the sequence of actions. Highlight key puzzle elements (yellow boxes). Background: dark grid.',
          }
      },
  },
};
