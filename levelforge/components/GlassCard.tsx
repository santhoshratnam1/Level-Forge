import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className }) => {
  return (
    <div
      className={`bg-[var(--surface-primary)] backdrop-blur-xl rounded-3xl border border-[var(--border-primary)] shadow-[var(--shadow-color)] transition-colors duration-300 ${className}`}
    >
      {children}
    </div>
  );
};