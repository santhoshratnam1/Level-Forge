import React from 'react';
import { GlassCard } from './GlassCard';
import { Icon } from './Icon';
import type { DesignChallenge, ChallengeStatus } from '../types/portfolio';

interface DesignChallengesProps {
  challenges: DesignChallenge[];
  onStatusChange: (id: string, status: ChallengeStatus) => void;
}

const statusConfig = {
    suggested: { ringColor: 'border-gray-500', bgColor: 'bg-gray-700/50', icon: 'plus' as const },
    accepted: { ringColor: 'border-cyan-500', bgColor: 'bg-cyan-500/20', icon: 'ruler' as const },
    completed: { ringColor: 'border-green-500', bgColor: 'bg-green-500/20', icon: 'logo' as const },
};

export const DesignChallenges: React.FC<DesignChallengesProps> = ({ challenges, onStatusChange }) => {
    if (!challenges || challenges.length === 0) {
        return (
            <GlassCard className="p-8 text-center">
                <Icon name="logo" className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">No Challenges Generated</h3>
                <p className="text-gray-400 mt-2">The AI didn't find any specific areas that need major improvement. Great job on this level!</p>
            </GlassCard>
        );
    }

    return (
        <div className="space-y-4">
            {challenges.map(challenge => (
                <GlassCard key={challenge.id} className={`p-4 border-l-4 ${statusConfig[challenge.status].ringColor} transition-all`}>
                    <div className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${statusConfig[challenge.status].bgColor}`}>
                           <Icon name={statusConfig[challenge.status].icon} className="w-5 h-5" />
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-bold text-white">{challenge.title}</h4>
                            <p className="text-sm text-gray-400 mt-1">{challenge.description}</p>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="px-2 py-0.5 text-xs font-semibold bg-white/10 rounded-full">{challenge.category}</span>
                                <div className="space-x-2">
                                    {challenge.status === 'suggested' && (
                                        <button onClick={() => onStatusChange(challenge.id, 'accepted')} className="px-3 py-1 text-xs font-semibold bg-cyan-500/80 rounded-full hover:bg-cyan-500">Accept</button>
                                    )}
                                    {challenge.status === 'accepted' && (
                                        <button onClick={() => onStatusChange(challenge.id, 'completed')} className="px-3 py-1 text-xs font-semibold bg-green-500/80 rounded-full hover:bg-green-500">Mark Complete</button>
                                    )}
                                    {challenge.status === 'completed' && (
                                        <p className="text-xs font-semibold text-green-400">Completed!</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            ))}
        </div>
    );
};
