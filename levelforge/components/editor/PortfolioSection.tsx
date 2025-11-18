import React, { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';
import type { Block } from '../../types/portfolio';
import { Icon } from '../Icon';

interface PortfolioSectionProps {
  block: Block;
  onUpdate: (content: any) => void;
  onDelete: () => void;
  onAddBelow: (type: string) => void;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  block,
  onUpdate,
  onDelete,
  onAddBelow
}) => {
  const [showBlockMenu, setShowBlockMenu] = useState(false);

  const renderBlock = () => {
    switch (block.type) {
      case 'heading_1':
      case 'heading_2':
      case 'heading_3':
        const sizeClass = block.type === 'heading_1' ? 'text-4xl' : block.type === 'heading_2' ? 'text-3xl' : 'text-2xl';
        return (
          <input
            type="text"
            value={block.content.text || ''}
            onChange={(e) => onUpdate({ ...block.content, text: e.target.value })}
            className={`${sizeClass} font-bold bg-transparent w-full focus:outline-none text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-text)] to-[var(--accent-secondary)] placeholder:text-[var(--text-secondary)]/50`}
            placeholder="Heading"
          />
        );

      case 'paragraph':
        return (
          <RichTextEditor
            value={block.content.text || ''}
            onChange={(text) => onUpdate({ ...block.content, text })}
          />
        );

      case 'image':
        return (
          <div className="space-y-2">
            {block.content.url ? (
              <img src={block.content.url} alt={block.content.caption || ''} className="w-full rounded-xl"/>
            ) : (
              <div className="border-2 border-dashed border-[var(--border-primary)] rounded-xl p-8 text-center bg-[var(--surface-secondary)]">
                <p className="text-[var(--text-secondary)]">Paste an image URL above to display it here.</p>
              </div>
            )}
            <input type="text" value={block.content.url || ''} onChange={(e) => onUpdate({ ...block.content, url: e.target.value })} placeholder="Paste image URL here..." className="w-full p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"/>
            <input type="text" value={block.content.caption || ''} onChange={(e) => onUpdate({ ...block.content, caption: e.target.value })} placeholder="Image caption (optional)" className="w-full bg-transparent text-sm text-center text-[var(--text-secondary)] focus:outline-none"/>
          </div>
        );

      case 'callout':
        return (
          <div className="border-l-4 border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 rounded-r-xl p-4">
             <input type="text" value={block.content.title || ''} onChange={(e) => onUpdate({ ...block.content, title: e.target.value })} placeholder="Callout title" className="w-full bg-transparent font-semibold text-[var(--accent-text)] focus:outline-none mb-2"/>
            <textarea value={block.content.text || ''} onChange={(e) => onUpdate({ ...block.content, text: e.target.value })} placeholder="Callout text..." className="w-full bg-transparent focus:outline-none resize-none min-h-[60px]"/>
          </div>
        );

      case 'columns':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RichTextEditor value={block.content.left || ''} onChange={(text) => onUpdate({ ...block.content, left: text })} placeholder="Left column..."/>
            <RichTextEditor value={block.content.right || ''} onChange={(text) => onUpdate({ ...block.content, right: text })} placeholder="Right column..."/>
          </div>
        );

      case 'divider':
        return <hr className="border-[var(--border-primary)]" />;

      default:
        return <div className="text-red-500">Unsupported block type: {block.type}</div>;
    }
  };

  return (
    <div className="group relative py-2">
      <div className="relative">
        {renderBlock()}
        <div className="absolute top-0 -right-10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
            <button onClick={onDelete} className="p-1.5 bg-[var(--surface-primary)] rounded-md hover:bg-red-500/30"><Icon name="plus" className="w-4 h-4 text-red-400 transform rotate-45" /></button>
            <button onClick={() => setShowBlockMenu(!showBlockMenu)} className="p-1.5 bg-[var(--surface-primary)] rounded-md hover:bg-[var(--accent-primary)]/30"><Icon name="plus" className="w-4 h-4 text-[var(--accent-text)]" /></button>
        </div>
      </div>

      {showBlockMenu && (
        <div className="absolute top-full left-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl shadow-xl p-1 w-48 z-10">
          <BlockMenuItem label="Heading" onClick={() => { onAddBelow('heading_2'); setShowBlockMenu(false); }} />
          <BlockMenuItem label="Text" onClick={() => { onAddBelow('paragraph'); setShowBlockMenu(false); }} />
          <BlockMenuItem label="Image" onClick={() => { onAddBelow('image'); setShowBlockMenu(false); }} />
          <BlockMenuItem label="Callout" onClick={() => { onAddBelow('callout'); setShowBlockMenu(false); }} />
          <BlockMenuItem label="Columns" onClick={() => { onAddBelow('columns'); setShowBlockMenu(false); }} />
          <BlockMenuItem label="Divider" onClick={() => { onAddBelow('divider'); setShowBlockMenu(false); }} />
        </div>
      )}
    </div>
  );
};

const BlockMenuItem: React.FC<{label: string; onClick: () => void;}> = ({ label, onClick }) => (
  <button onClick={onClick} className="w-full text-left p-2 hover:bg-[var(--surface-secondary)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm">
    {label}
  </button>
);