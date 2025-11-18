import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className }) => {
  return (
    <div
      className={`bg-black/30 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
};
