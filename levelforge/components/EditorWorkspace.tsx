import React, { useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { GlassCard } from './GlassCard';
import { PortfolioBuilder } from './editor/PortfolioBuilder';
import { AnnotationCanvas, type AnnotationCanvasHandle } from './editor/AnnotationCanvas';
import type { Block, GeneratedAsset, Annotation } from '../types/portfolio';
import { useAnnotations } from '../hooks/useAnnotations';
import { Icon, type IconName } from './Icon';
import { ChatAssistant } from './ChatAssistant';

interface EditorWorkspaceProps {
  initialBlocks: Block[];
  generatedImages: GeneratedAsset[];
}

export interface EditorWorkspaceHandle {
    getAnnotatedImages: () => Promise<GeneratedAsset[]>;
}

const AnnotationToolbar: React.FC<{
    activeTool: string;
    setActiveTool: (tool: IconName) => void;
    undo: () => void;
    clear: () => void;
}> = ({ activeTool, setActiveTool, undo, clear }) => {
    const tools: IconName[] = ['arrow', 'text', 'brush', 'rect', 'circle', 'line'];
    return (
        <GlassCard>
            <div className="p-2 flex justify-around items-center">
                {tools.map(tool => (
                    <button 
                        key={tool} 
                        onClick={() => setActiveTool(tool)}
                        className={`p-2 rounded-lg transition-colors ${activeTool === tool ? 'bg-[var(--accent-primary)]/50' : 'hover:bg-[var(--surface-secondary)]'}`} 
                        aria-label={`${tool} tool`}
                    >
                        <Icon name={tool} className="w-6 h-6 text-[var(--text-secondary)]" />
                    </button>
                ))}
                <div className="h-6 w-px bg-[var(--border-primary)] mx-2" />
                <button onClick={undo} className="p-2 rounded-lg hover:bg-[var(--surface-secondary)]" aria-label="Undo">
                   <Icon name="undo" className="w-6 h-6 text-[var(--text-secondary)]" />
                </button>
                 <button onClick={clear} className="p-2 rounded-lg hover:bg-[var(--surface-secondary)]" aria-label="Clear Annotations">
                   <Icon name="trash" className="w-6 h-6 text-[var(--text-secondary)]" />
                </button>
            </div>
        </GlassCard>
    );
};

export const EditorWorkspace = forwardRef<EditorWorkspaceHandle, EditorWorkspaceProps>(({ initialBlocks, generatedImages }, ref) => {
  const [activeTab, setActiveTab] = useState(0);
  const { annotations, addAnnotation, undoAnnotation, clearAnnotations, activeTool, setActiveTool } = useAnnotations();
  const canvasRefs = useRef<{[key: number]: AnnotationCanvasHandle | null}>({});

  useImperativeHandle(ref, () => ({
    async getAnnotatedImages() {
        const annotatedImages: GeneratedAsset[] = [];
        for(let i = 0; i < generatedImages.length; i++) {
            const handle = canvasRefs.current[i];
            if (handle) {
                const url = await handle.exportImage();
                annotatedImages.push({
                    title: generatedImages[i].title,
                    url,
                });
            } else {
                annotatedImages.push(generatedImages[i]);
            }
        }
        return annotatedImages;
    }
  }));

  const handleSetAnnotations = (newAnnotations: Annotation[]) => {
      addAnnotation(activeTab, newAnnotations);
  };
  
  return (
    <div className="w-full h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 flex-grow">
      {/* Left Side: Portfolio Builder */}
      <div className="h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
        <PortfolioBuilder 
          initialBlocks={initialBlocks} 
          onSave={(blocks) => console.log('Saving blocks:', blocks)}
        />
      </div>

      {/* Right Side: Visuals */}
      <div className="h-[80vh] flex flex-col">
        <div className="mb-4">
          <AnnotationToolbar 
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            undo={() => undoAnnotation(activeTab)}
            clear={() => clearAnnotations(activeTab)}
          />
        </div>
        <div className="flex-grow flex flex-col">
            <GlassCard className="flex-grow flex flex-col">
                <div className="p-4 border-b border-[var(--border-primary)]">
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {generatedImages.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveTab(index)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex-shrink-0 ${
                            activeTab === index ? 'bg-[var(--accent-primary)]/30 text-[var(--accent-text)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]'
                            }`}
                        >
                            {image.title}
                        </button>
                        ))}
                    </div>
                </div>
                <div className="flex-grow p-4 flex flex-col items-center justify-center min-h-0 relative">
                    {generatedImages[activeTab] && (
                        <AnnotationCanvas
                            // FIX: Corrected ref assignment in callback to prevent returning a value, which is invalid for a ref callback.
                            ref={el => { canvasRefs.current[activeTab] = el; }}
                            imageUrl={generatedImages[activeTab].url}
                            activeTool={activeTool}
                            annotations={annotations[activeTab] || []}
                            onAnnotationsChange={handleSetAnnotations}
                        />
                    )}
                </div>
            </GlassCard>
        </div>
      </div>
      <ChatAssistant portfolioBlocks={initialBlocks} />
    </div>
  );
});