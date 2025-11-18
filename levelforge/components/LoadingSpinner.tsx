import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  progress?: number; // 0-100
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, progress = 0 }) => {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Spinner with progress */}
      <div className="relative h-32 w-32">
        {/* Background circle */}
        <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-[var(--border-primary)]"
          />
          {/* Progress circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="var(--accent-primary)"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.35s ease-out' }}
          />
        </svg>
        
        {/* Spinning center */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 border-2 border-[var(--accent-primary)]/30 rounded-full animate-spin"></div>
        </div>
        
        {/* Progress percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-[var(--accent-text)]">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-[var(--text-primary)] max-w-sm">{message}</p>
          <p className="text-sm text-[var(--text-secondary)]">This may take 1-2 minutes...</p>
        </div>
      )}

      {/* Progress bar */}
      <div className="w-80 h-2 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-primary)]"
          style={{ width: `${progress}%`, transition: 'width 0.35s ease-out' }}
        />
      </div>
    </div>
  );
};