import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { PortfolioBuilder } from './editor/PortfolioBuilder';
import type { Block, GeneratedAsset } from '../types/portfolio';
import { Icon, type IconName } from './Icon';

interface EditorWorkspaceProps {
  initialBlocks: Block[];
  generatedImages: GeneratedAsset[];
}

const AnnotationToolbar: React.FC = () => {
    const tools: IconName[] = ['arrow', 'text', 'brush', 'rect', 'circle', 'line', 'grid', 'ruler'];
    return (
        <GlassCard>
            <div className="p-2 flex justify-around items-center">
                {tools.map(tool => (
                    <button key={tool} className="p-2 rounded-lg hover:bg-white/20 transition-colors" aria-label={`${tool} tool`}>
                        <Icon name={tool} className="w-6 h-6 text-gray-300" />
                    </button>
                ))}
            </div>
        </GlassCard>
    );
};


export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({ initialBlocks, generatedImages }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
    alert('Image URL copied to clipboard!');
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
          <AnnotationToolbar />
        </div>
        <div className="flex-grow flex flex-col">
            <GlassCard className="flex-grow flex flex-col">
                <div className="p-4 border-b border-white/10">
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {generatedImages.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveTab(index)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex-shrink-0 ${
                            activeTab === index ? 'bg-cyan-500/30 text-cyan-200' : 'text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            {image.title}
                        </button>
                        ))}
                    </div>
                </div>
                <div className="flex-grow p-4 flex flex-col items-center justify-center min-h-0 relative">
                    {generatedImages[activeTab] && (
                        <>
                           <img 
                                src={generatedImages[activeTab].url} 
                                alt={generatedImages[activeTab].title} 
                                className="max-w-full max-h-full object-contain rounded-lg"
                            />
                            <button
                              onClick={() => handleCopyUrl(generatedImages[activeTab].url)}
                              className="absolute bottom-6 right-6 px-3 py-1.5 text-xs bg-black/50 backdrop-blur-md border border-white/20 rounded-lg hover:bg-black/70 transition-colors"
                            >
                              Copy URL
                            </button>
                        </>
                    )}
                </div>
            </GlassCard>
        </div>
      </div>
    </div>
  );
};
