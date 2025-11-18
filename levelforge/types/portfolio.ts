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
    const text = items.map(item => `- ${item}`).join('\n');
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
