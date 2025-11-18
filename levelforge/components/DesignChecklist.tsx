import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { Icon } from './Icon';
import { checklistData } from '../data/checklistItems';
import type { ChecklistState } from '../types/portfolio';

interface DesignChecklistProps {
  checklistState: ChecklistState;
  toggleItem: (id: string) => void;
  completionPercentage: number;
}

const ChecklistProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => (
    <div className="w-full">
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold text-gray-300">Checklist Progress</span>
            <span className="text-sm font-bold text-cyan-300">{percentage}%</span>
        </div>
        <div className="w-full bg-black/30 rounded-full h-2.5">
            <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full" 
                style={{ width: `${percentage}%`, transition: 'width 0.5s ease-in-out' }}
            ></div>
        </div>
    </div>
);

export const DesignChecklist: React.FC<DesignChecklistProps> = ({ checklistState, toggleItem, completionPercentage }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <GlassCard className="mb-8">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 flex justify-between items-center"
            >
                <h3 className="text-xl font-bold text-white">Design Checklist</h3>
                <Icon name="dropdown" className={`w-6 h-6 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 pt-0">
                    <div className="mb-6">
                        <ChecklistProgressBar percentage={completionPercentage} />
                    </div>
                    <div className="space-y-4">
                        {checklistData.map(category => (
                            <div key={category.title}>
                                <h4 className="font-semibold text-cyan-300 mb-2 border-b border-white/10 pb-1">{category.title}</h4>
                                <ul className="space-y-2">
                                    {category.items.map(item => (
                                        <li key={item.id}>
                                            <label className="flex items-center space-x-3 cursor-pointer group">
                                                <input 
                                                    type="checkbox"
                                                    checked={checklistState[item.id] || false}
                                                    onChange={() => toggleItem(item.id)}
                                                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600"
                                                />
                                                <span className={`text-sm ${checklistState[item.id] ? 'text-gray-500 line-through' : 'text-gray-300 group-hover:text-white'} transition-colors`}>
                                                    {item.label}
                                                </span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </GlassCard>
    );
};
