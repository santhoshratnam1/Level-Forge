// ============================================
// types/portfolio.ts
// Complete type definitions matching Notion format
// ============================================

export type BlockType = 
  | 'heading_1'
  | 'heading_2'
  | 'heading_3'
  | 'paragraph'
  | 'bulleted_list'
  | 'numbered_list'
  | 'quote'
  | 'code'
  | 'image'
  | 'video'
  | 'divider'
  | 'callout'
  | 'toggle'
  | 'columns'
  | 'table';

export interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  code?: boolean;
  color?: string;
  backgroundColor?: string;
}

export interface RichText {
  type: 'text' | 'mention' | 'equation';
  text: {
    content: string;
    link?: string;
  };
  annotations?: TextStyle;
}

export interface Block {
  id: string;
  type: BlockType;
  content: any; // Simplified for this implementation
}


// ============================================
// Helper Functions for Creating Blocks
// ============================================

export function createHeading(text: string, level: 1 | 2 | 3): Block {
  return {
    id: generateId(),
    type: `heading_${level}`,
    content: {
      text
    }
  };
}

export function createParagraph(text: string): Block {
  return {
    id: generateId(),
    type: 'paragraph',
    content: {
      text
    }
  };
}

export function createBulletList(items: string[]): Block[] {
    // For simplicity, we create a single paragraph block with bullet points
    const text = items.map(item => `• ${item}`).join('\n');
    return [createParagraph(text)];
}

export function createImage(url: string, caption?: string): Block {
  return {
    id: generateId(),
    type: 'image',
    content: {
      url,
      caption: caption || ''
    }
  };
}

export function createCallout(text: string, title: string = '💡'): Block {
  return {
    id: generateId(),
    type: 'callout',
    content: {
      text,
      title
    }
  };
}

export function createColumns(columns: string[]): Block {
  return {
    id: generateId(),
    type: 'columns',
    content: {
      left: columns[0] || '',
      right: columns[1] || ''
    }
  };
}

export function createDivider(): Block {
  return {
    id: generateId(),
    type: 'divider',
    content: {}
  };
}

export function createRichText(text: string, annotations?: TextStyle): RichText {
  return {
    type: 'text',
    text: {
      content: text
    },
    annotations
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export interface GeneratedAsset {
  title: string;
  url: string; // base64 data URL
}

// ============================================
// Annotation Types
// ============================================
export type AnnotationTool = 'arrow' | 'text' | 'brush' | 'rect' | 'circle' | 'line';

export interface Point {
    x: number;
    y: number;
}

export type Annotation = { id: string; color: string; tool: AnnotationTool } & (
    | { tool: 'rect' | 'circle' | 'arrow' | 'line'; start: Point; end: Point }
    | { tool: 'brush'; points: Point[] }
    | { tool: 'text'; position: Point; text: string; }
);


// ============================================
// Comparison Mode Types
// ============================================

export interface ComparisonPayload {
    levels: {
        id: string;
        base64: string;
        mimeType: string;
    }[];
}

export interface ComparisonResult {
    portfolios: {
        id: string;
        blocks: Block[];
    }[];
    comparisonAnalysis: Block[];
}

// ============================================
// Chat Assistant Types
// ============================================

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// ============================================
// Design Checklist Types
// ============================================

export interface ChecklistItem {
  id: string;
  label: string;
}

export interface ChecklistCategory {
  title: string;
  items: ChecklistItem[];
}

export type ChecklistState = Record<string, boolean>;

// ============================================
// Design Challenge Types
// ============================================

export type ChallengeStatus = 'suggested' | 'accepted' | 'completed';

export interface DesignChallenge {
  id: string;
  title: string;
  description: string;
  category: 'Navigation' | 'Pacing' | 'Combat' | 'Atmosphere' | 'General';
  status: ChallengeStatus;
}

// ============================================
// Video Timeline Analysis Types
// ============================================

export interface ExtractedFrame {
  timestamp: number; // in seconds
  base64: string; // raw base64 data
}

export type TimelineEventType = 
    | 'Combat' 
    | 'Boss_Fight'
    | 'Exploration' 
    | 'Puzzle' 
    | 'Narrative' 
    | 'Player_Stuck' 
    | 'Key_Moment' 
    | 'Stealth'
    | 'Traversal'
    | 'Backtracking'
    | 'Looting'
    | 'Menu_UI'
    | 'Death';

export interface TimelineEvent {
  timestamp: number; // in seconds
  type: TimelineEventType;
  title: string;
  description: string;
  intensity: number; // 0-10, for pacing curve
}

export interface PacingBreakdown {
    combat: number; // percentage 0-100
    exploration: number;
    puzzle: number;
    narrative: number;
    idle: number;
}

export interface PacingAnalysis {
    score: number; // 1-10
    critique: string;
    improvements: string[];
    breakdown?: PacingBreakdown;
}

export interface VideoAnalysisResult {
  summary: string; // High-level summary of the player's journey
  pacing: PacingAnalysis;
  events: TimelineEvent[];
  frames: ExtractedFrame[]; // The frames that were sent for analysis
  generatedAssets: GeneratedAsset[]; // Visual assets generated from video
  videoUrl: string; // Object URL for the video player
}
