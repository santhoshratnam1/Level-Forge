import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="relative h-24 w-24">
      <div className="absolute top-0 left-0 h-full w-full border-4 border-t-cyan-400 border-gray-700 rounded-full animate-spin"></div>
      <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center">
        <div className="h-12 w-12 bg-cyan-400/20 rounded-full animate-ping"></div>
      </div>
    </div>
  );
};
