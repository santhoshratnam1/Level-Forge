import React, { useState } from 'react';
import { PortfolioSection } from './PortfolioSection';
import { GlassCard } from '../GlassCard';
import type { Block } from '../../types/portfolio';
import { Icon } from '../Icon';

interface PortfolioBuilderProps {
  initialBlocks?: Block[];
  onSave: (blocks: Block[]) => void;
}

export const PortfolioBuilder: React.FC<PortfolioBuilderProps> = ({ initialBlocks = [], onSave }) => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

  const updateBlock = (id: string, content: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const addBlock = (afterId: string, type: any) => {
    const index = blocks.findIndex(b => b.id === afterId);
    const newBlock: Block = {
      id: Date.now().toString(),
      type: type,
      content: {}
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Portfolio Editor</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => onSave(blocks)}
            className="px-4 py-2 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-xl hover:shadow-[0_0_20px_var(--accent-primary)]/50 transition-all flex items-center gap-2"
          >
            <Icon name="logo" className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      <GlassCard className="p-[var(--padding-card)]">
        <div className="space-y-8">
          {blocks.map((block) => (
            <PortfolioSection
              key={block.id}
              block={block}
              onUpdate={(content) => updateBlock(block.id, content)}
              onDelete={() => deleteBlock(block.id)}
              onAddBelow={(type) => addBlock(block.id, type)}
            />
          ))}
        </div>
      </GlassCard>
    </div>
  );
};