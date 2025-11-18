import React, { useState } from 'react';
import type { ComparisonResult } from '../types/portfolio';
import { GlassCard } from './GlassCard';
import { PortfolioBuilder } from './editor/PortfolioBuilder';

export const ComparisonView: React.FC<{ result: ComparisonResult }> = ({ result }) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'side-by-side'>('summary');

    return (
        <div className="w-full h-full max-w-7xl mx-auto flex flex-col flex-grow p-4">
            <div className="flex-shrink-0 mb-4">
                <div className="p-1.5 bg-black/30 rounded-full flex w-fit border border-white/10 mx-auto">
                    <button onClick={() => setActiveTab('summary')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'summary' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                        AI Summary
                    </button>
                    <button onClick={() => setActiveTab('side-by-side')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'side-by-side' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                        Side-by-Side
                    </button>
                </div>
            </div>

            <div className="flex-grow min-h-0">
                {activeTab === 'summary' && (
                     <div className="h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                        <PortfolioBuilder 
                            initialBlocks={result.comparisonAnalysis} 
                            onSave={() => {}} 
                        />
                    </div>
                )}
                
                {activeTab === 'side-by-side' && (
                    <div className={`grid grid-cols-1 md:grid-cols-${result.portfolios.length} gap-6 h-[75vh]`}>
                        {result.portfolios.map(portfolio => (
                            <div key={portfolio.id} className="h-full flex flex-col">
                                <h2 className="text-xl font-bold text-center mb-4 truncate">{portfolio.id}</h2>
                                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                                    <GlassCard className="p-4">
                                        <PortfolioBuilder 
                                            initialBlocks={portfolio.blocks.slice(1)} // Slice to remove the main title
                                            onSave={() => {}}
                                        />
                                    </GlassCard>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
