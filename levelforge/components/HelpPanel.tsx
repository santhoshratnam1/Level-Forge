import React, { useState, useMemo } from 'react';
import { GlassCard } from './GlassCard';
import { Icon } from './Icon';
import { glossary, type GlossaryTerm } from '../data/glossary';

interface HelpPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HelpPanel: React.FC<HelpPanelProps> = ({ isOpen, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

    const filteredGlossary = useMemo(() => {
        if (!searchTerm) return Object.values(glossary);
        return Object.values(glossary).filter(term => 
            term.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            term.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const handleSelectTerm = (term: GlossaryTerm) => {
        setSelectedTerm(term);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 transition-opacity" onClick={onClose}></div>

            {/* Panel */}
            <div className="relative w-full max-w-lg bg-[#0f0f19]/80 backdrop-blur-xl border-l border-white/10 shadow-2xl transform transition-transform ease-in-out duration-300 translate-x-0">
                <header className="p-4 flex justify-between items-center border-b border-white/10 sticky top-0 bg-[#0f0f19]/80 backdrop-blur-xl">
                    <h2 className="text-2xl font-bold text-white">Learning Resources</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
                        <Icon name="plus" className="w-6 h-6 transform rotate-45" />
                    </button>
                </header>
                
                <div className="p-4">
                    <input 
                        type="text"
                        placeholder="Search for a term..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 bg-black/30 border border-white/20 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                </div>

                <div className="h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
                    {selectedTerm ? (
                        <div className="p-6 animate-fade-in">
                            <button onClick={() => setSelectedTerm(null)} className="text-cyan-400 mb-4 text-sm font-semibold">&larr; Back to list</button>
                            <div className="flex items-center space-x-3 mb-4">
                                <Icon name={selectedTerm.icon} className="w-8 h-8 text-cyan-300" />
                                <h3 className="text-3xl font-bold">{selectedTerm.name}</h3>
                            </div>
                            <p className="text-gray-300 leading-relaxed mb-6">{selectedTerm.longDescription}</p>
                            
                            {selectedTerm.resources.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-lg mb-2 text-white">Further Reading</h4>
                                    <ul className="space-y-2">
                                        {selectedTerm.resources.map(res => (
                                            <li key={res.url}>
                                                <a href={res.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-cyan-400">
                                                    {res.title} &rarr;
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <ul className="p-4 space-y-2">
                            {filteredGlossary.map(term => (
                                <li key={term.name}>
                                    <button onClick={() => handleSelectTerm(term)} className="w-full text-left p-4 bg-white/5 border border-transparent rounded-xl hover:border-white/20 hover:bg-white/10 transition-all">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-white">{term.name}</p>
                                            <Icon name={term.icon} className="w-6 h-6 text-gray-500" />
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1">{term.shortDescription}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
              `}</style>
        </div>
    );
};
