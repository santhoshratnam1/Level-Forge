import React, { useState, useRef, useEffect } from 'react';
import { genres } from '../lib/ai/genreTemplates';
import { Icon } from './Icon';

interface GenreSelectorProps {
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({ selectedGenre, onSelectGenre }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (genreKey: string) => {
    onSelectGenre(genreKey);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const currentGenre = genres[selectedGenre];

  return (
    <div className="relative w-full max-w-sm mx-auto" ref={dropdownRef}>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 text-left">Analysis Template</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-xl text-left"
      >
        <div className="flex items-center space-x-3">
          <Icon name={currentGenre.icon} className="w-6 h-6 text-[var(--accent-text)]" />
          <span className="font-semibold">{currentGenre.name}</span>
        </div>
        <Icon name="dropdown" className={`w-5 h-5 text-[var(--text-secondary)] transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 top-full mt-2 w-full bg-[var(--bg-secondary)]/80 backdrop-blur-lg border border-[var(--border-primary)] rounded-xl shadow-2xl overflow-hidden animate-fade-in-down">
          <ul className="max-h-60 overflow-y-auto p-1">
            {Object.entries(genres).map(([key, genre]) => (
              <li key={key}>
                <button
                  onClick={() => handleSelect(key)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${selectedGenre === key ? 'bg-[var(--accent-primary)]/20' : 'hover:bg-[var(--surface-secondary)]'}`}
                >
                  <Icon name={genre.icon} className="w-6 h-6 text-[var(--accent-text)] flex-shrink-0" />
                  <div>
                      <p className="font-semibold">{genre.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{genre.description}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <style>{`
        @keyframes fade-in-down {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
            animation: fade-in-down 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};