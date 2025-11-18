import React, { useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { GlassCard } from './GlassCard';
import { PortfolioBuilder } from './editor/PortfolioBuilder';
import { AnnotationCanvas, type AnnotationCanvasHandle } from './editor/AnnotationCanvas';
import type { Block, GeneratedAsset, Annotation, ChecklistState, DesignChallenge } from '../types/portfolio';
import { useAnnotations } from '../hooks/useAnnotations';
import { Icon, type IconName } from './Icon';
import { ChatAssistant } from './ChatAssistant';
import { DesignChecklist } from './DesignChecklist';
import { useChecklist } from '../hooks/useChecklist';
import { DesignChallenges } from './DesignChallenges';
import { useChallenges } from '../hooks/useChallenges';

interface EditorWorkspaceProps {
  initialBlocks: Block[];
  generatedImages: GeneratedAsset[];
  initialChallenges: DesignChallenge[] | null;
}

export interface EditorWorkspaceHandle {
    getAnnotatedImages: () => Promise<GeneratedAsset[]>;
    getChecklistState: () => ChecklistState;
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
                        className={`p-2 rounded-lg transition-colors ${activeTool === tool ? 'bg-cyan-500/50' : 'hover:bg-white/20'}`} 
                        aria-label={`${tool} tool`}
                    >
                        <Icon name={tool} className="w-6 h-6 text-gray-300" />
                    </button>
                ))}
                <div className="h-6 w-px bg-white/20 mx-2" />
                <button onClick={undo} className="p-2 rounded-lg hover:bg-white/20" aria-label="Undo">
                   <Icon name="undo" className="w-6 h-6 text-gray-300" />
                </button>
                 <button onClick={clear} className="p-2 rounded-lg hover:bg-white/20" aria-label="Clear Annotations">
                   <Icon name="trash" className="w-6 h-6 text-gray-300" />
                </button>
            </div>
        </GlassCard>
    );
};

type LeftPanelTab = 'portfolio' | 'checklist' | 'challenges';

export const EditorWorkspace = forwardRef<EditorWorkspaceHandle, EditorWorkspaceProps>(({ initialBlocks, generatedImages, initialChallenges }, ref) => {
  const [activeImageTab, setActiveImageTab] = useState(0);
  const [leftPanelTab, setLeftPanelTab] = useState<LeftPanelTab>('portfolio');
  const { annotations, addAnnotation, undoAnnotation, clearAnnotations, activeTool, setActiveTool } = useAnnotations();
  const { checklistState, toggleItem, completionPercentage } = useChecklist();
  const { challenges, updateChallengeStatus } = useChallenges(initialChallenges || []);
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
    },
    getChecklistState() {
        return checklistState;
    }
  }));

  const handleSetAnnotations = (newAnnotations: Annotation[]) => {
      addAnnotation(activeImageTab, newAnnotations);
  };

  const TabButton: React.FC<{ tabId: LeftPanelTab; label: string; }> = ({ tabId, label }) => (
    <button
        onClick={() => setLeftPanelTab(tabId)}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex-shrink-0 ${
            leftPanelTab === tabId ? 'bg-cyan-500/30 text-cyan-200' : 'text-gray-400 hover:bg-white/10'
        }`}
    >
        {label}
    </button>
  );
  
  return (
    <div className="w-full h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 flex-grow">
      {/* Left Side: Portfolio Builder */}
      <div className="h-[80vh] flex flex-col">
        <div className="flex-shrink-0 mb-4">
            <GlassCard>
                <div className="p-2 flex space-x-2">
                    <TabButton tabId="portfolio" label="Portfolio" />
                    <TabButton tabId="checklist" label="Checklist" />
                    <TabButton tabId="challenges" label="Challenges" />
                </div>
            </GlassCard>
        </div>
        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
            {leftPanelTab === 'portfolio' && (
                <PortfolioBuilder 
                  initialBlocks={initialBlocks} 
                  onSave={(blocks) => console.log('Saving blocks:', blocks)}
                />
            )}
            {leftPanelTab === 'checklist' && (
                <DesignChecklist 
                    checklistState={checklistState}
                    toggleItem={toggleItem}
                    completionPercentage={completionPercentage}
                />
            )}
            {leftPanelTab === 'challenges' && (
                <DesignChallenges
                    challenges={challenges}
                    onStatusChange={updateChallengeStatus}
                />
            )}
        </div>
      </div>

      {/* Right Side: Visuals */}
      <div className="h-[80vh] flex flex-col">
        <div className="mb-4">
          <AnnotationToolbar 
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            undo={() => undoAnnotation(activeImageTab)}
            clear={() => clearAnnotations(activeImageTab)}
          />
        </div>
        <div className="flex-grow flex flex-col">
            <GlassCard className="flex-grow flex flex-col">
                <div className="p-4 border-b border-white/10">
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {generatedImages.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveImageTab(index)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex-shrink-0 ${
                            activeImageTab === index ? 'bg-cyan-500/30 text-cyan-200' : 'text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            {image.title}
                        </button>
                        ))}
                    </div>
                </div>
                <div className="flex-grow p-4 flex flex-col items-center justify-center min-h-0 relative">
                    {generatedImages[activeImageTab] && (
                        <AnnotationCanvas
                            // FIX: Corrected ref assignment in callback to prevent returning a value, which is invalid for a ref callback.
                            ref={el => { canvasRefs.current[activeImageTab] = el; }}
                            imageUrl={generatedImages[activeImageTab].url}
                            activeTool={activeTool}
                            annotations={annotations[activeImageTab] || []}
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