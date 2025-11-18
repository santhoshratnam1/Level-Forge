import React from 'react';
import { Icon } from './Icon';
import { glossary } from '../data/glossary';

interface HelpTooltipProps {
  glossaryKey: keyof typeof glossary;
  children?: React.ReactNode;
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ glossaryKey, children, className }) => {
  const term = glossary[glossaryKey];
  if (!term) return <>{children || null}</>;

  const content = (
    <>
      {children}
      <Icon name="help" className="w-4 h-4 text-cyan-400/70 inline-block ml-1" />
    </>
  );

  return (
    <div className={`group relative inline-flex items-center ${className}`}>
      {content}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-gray-900/80 backdrop-blur-md border border-white/20 rounded-xl text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
        <h4 className="font-bold text-white mb-1">{term.name}</h4>
        <p>{term.shortDescription}</p>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800/80 -mb-2"></div>
      </div>
    </div>
  );
};
