import React from 'react';
import { Icon } from '../Icon';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Start typing...' 
}) => {
  
  const applyFormat = (format: string) => {
    const textarea = document.activeElement as HTMLTextAreaElement;
    if (textarea.tagName !== 'TEXTAREA') return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    let newText = '';
    
    switch (format) {
      case 'bold':
        newText = `**${selected}**`;
        break;
      case 'italic':
        newText = `*${selected}*`;
        break;
      case 'h2':
        newText = `## ${selected}`;
        break;
      case 'list':
        newText = `- ${selected.replace(/\n/g, '\n- ')}`;
        break;
      case 'quote':
        newText = `> ${selected.replace(/\n/g, '\n> ')}`;
        break;
      default:
        newText = selected;
    }
    
    onChange(value.substring(0, start) + newText + value.substring(end));
  };

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
      <div className="flex items-center gap-1 p-1 border-b border-white/10 bg-white/5">
        <ToolbarButton icon="heading2" onClick={() => applyFormat('h2')} title="Heading" />
        <ToolbarButton icon="bold" onClick={() => applyFormat('bold')} title="Bold" />
        <ToolbarButton icon="italic" onClick={() => applyFormat('italic')} title="Italic" />
        <div className="w-px h-5 bg-white/10 mx-1" />
        <ToolbarButton icon="list" onClick={() => applyFormat('list')} title="Bullet List" />
        <ToolbarButton icon="quote" onClick={() => applyFormat('quote')} title="Quote" />
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[150px] p-3 bg-transparent text-gray-200 focus:outline-none resize-y"
      />
    </div>
  );
};

const ToolbarButton: React.FC<{ 
  icon: any; 
  onClick: () => void; 
  title: string;
}> = ({ icon, onClick, title }) => (
  <button
    onClick={onClick}
    title={title}
    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
    type="button"
  >
    <Icon name={icon} className="w-4 h-4 text-gray-400" />
  </button>
);
