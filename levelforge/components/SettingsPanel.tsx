import React from 'react';
import { GlassCard } from './GlassCard';
// FIX: The types `Theme`, `Accent`, and `Density` were incorrectly imported from `useTheme`. They are now imported from their source file, `ThemeContext`.
import { useTheme } from '../hooks/useTheme';
import type { Theme, Accent, Density } from '../contexts/ThemeContext';
import { Icon } from './Icon';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
    className?: string;
}> = ({ onClick, isActive, children, className = '' }) => (
    <button
        onClick={onClick}
        className={`w-full p-3 rounded-lg border-2 transition-colors text-sm font-semibold
            ${isActive ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/20 text-[var(--accent-text)]' : 'border-[var(--border-primary)] bg-[var(--surface-secondary)] hover:border-[var(--accent-primary)]/50'}
            ${className}`}
    >
        {children}
    </button>
);

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
    const { theme, setTheme, accent, setAccent, density, setDensity } = useTheme();

    if (!isOpen) return null;

    const themes: { id: Theme; label: string }[] = [
        { id: 'dark', label: 'Dark' },
        { id: 'light', label: 'Light' },
    ];
    
    const accents: { id: Accent; label: string; color: string }[] = [
        { id: 'cyan', label: 'Cyan', color: 'bg-cyan-500' },
        { id: 'purple', label: 'Purple', color: 'bg-purple-500' },
        { id: 'green', label: 'Green', color: 'bg-green-500' },
    ];
    
    const densities: { id: Density; label: string }[] = [
        { id: 'compact', label: 'Compact' },
        { id: 'comfortable', label: 'Comfortable' },
        { id: 'spacious', label: 'Spacious' },
    ];

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <GlassCard 
                className="w-full max-w-md animate-fade-in-down"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Settings</h2>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-[var(--surface-secondary)]">
                            <Icon name="plus" className="w-5 h-5 transform rotate-45" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Theme Setting */}
                        <div>
                            <h3 className="text-sm font-semibold mb-2 text-[var(--text-secondary)]">Theme</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {themes.map(t => (
                                    <SettingButton key={t.id} onClick={() => setTheme(t.id)} isActive={theme === t.id}>
                                        {t.label}
                                    </SettingButton>
                                ))}
                            </div>
                        </div>

                        {/* Accent Color Setting */}
                        <div>
                            <h3 className="text-sm font-semibold mb-2 text-[var(--text-secondary)]">Accent Color</h3>
                             <div className="grid grid-cols-3 gap-3">
                                {accents.map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => setAccent(a.id)}
                                        className={`w-full p-3 rounded-lg border-2 transition-all ${accent === a.id ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-primary)]' : 'border-transparent hover:border-[var(--border-primary)]'}`}
                                    >
                                        <div className={`w-full h-6 rounded ${a.color}`}></div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Density Setting */}
                        <div>
                            <h3 className="text-sm font-semibold mb-2 text-[var(--text-secondary)]">Density</h3>
                             <div className="grid grid-cols-3 gap-3">
                                {densities.map(d => (
                                     <SettingButton key={d.id} onClick={() => setDensity(d.id)} isActive={density === d.id}>
                                        {d.label}
                                    </SettingButton>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>
            <style>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-10px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};