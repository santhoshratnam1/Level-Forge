import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import type { PortfolioData, GeneratedAsset, PortfolioSection } from '../types';
import { Icon } from './Icon';

interface EditorWorkspaceProps {
  portfolioData: PortfolioData;
  generatedImages: GeneratedAsset[];
  setPortfolioData: React.Dispatch<React.SetStateAction<PortfolioData | null>>;
}

const AnnotationToolbar: React.FC = () => {
    const tools = ['arrow', 'text', 'brush', 'rect', 'grid'];
    return (
        <GlassCard>
            <div className="p-2 flex justify-around items-center">
                {tools.map(tool => (
                    <button key={tool} className="p-2 rounded-lg hover:bg-white/20 transition-colors">
                        <Icon name={tool as 'arrow' | 'text' | 'brush' | 'rect' | 'grid'} className="w-6 h-6 text-gray-300" />
                    </button>
                ))}
            </div>
        </GlassCard>
    );
};


const EditableSection: React.FC<{
  section: PortfolioSection;
  sectionKey: keyof PortfolioData;
  onContentChange: (sectionKey: keyof PortfolioData, field: string, value: string) => void;
}> = ({ section, sectionKey, onContentChange }) => {
  return (
    <GlassCard className="mb-6">
      <div className="p-6">
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 mb-4">{section.title}</h3>
        {Object.entries(section.content).map(([key, value]) => (
          <div key={key} className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-1">{key}</label>
            <textarea
              value={value}
              onChange={(e) => onContentChange(sectionKey, key, e.target.value)}
              className="w-full p-2 bg-gray-900/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-300 min-h-[80px] resize-y"
            />
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({ portfolioData, generatedImages, setPortfolioData }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleContentChange = (sectionKey: keyof PortfolioData, field: string, value: string) => {
    setPortfolioData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          content: {
            ...prev[sectionKey].content,
            [field]: value
          }
        }
      };
    });
  };


  return (
    <div className="w-full h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 flex-grow">
      {/* Left Side: Generated Content */}
      <div className="h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
        {Object.entries(portfolioData).map(([key, section]) => (
           <EditableSection key={key} section={section} sectionKey={key as keyof PortfolioData} onContentChange={handleContentChange} />
        ))}
      </div>

      {/* Right Side: Visuals */}
      <div className="h-[80vh] flex flex-col">
        <div className="mb-4">
          <AnnotationToolbar />
        </div>
        <div className="flex-grow flex flex-col">
            <GlassCard className="flex-grow flex flex-col">
                <div className="p-4 border-b border-white/10">
                    <div className="flex space-x-2">
                        {generatedImages.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveTab(index)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                            activeTab === index ? 'bg-cyan-500/30 text-cyan-200' : 'text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            {image.title}
                        </button>
                        ))}
                    </div>
                </div>
                <div className="flex-grow p-4 flex items-center justify-center">
                    {generatedImages[activeTab] && (
                        <img 
                            src={generatedImages[activeTab].url} 
                            alt={generatedImages[activeTab].title} 
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    )}
                </div>
            </GlassCard>
        </div>
      </div>
    </div>
  );
};
