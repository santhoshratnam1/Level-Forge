import React, { useRef } from 'react';
import { GlassCard } from './GlassCard';
import { Icon } from './Icon';

interface UploadFormProps {
  onFileChange: (file: File) => void;
  onProcess: () => void;
  file: File | null;
}

export const UploadForm: React.FC<UploadFormProps> = ({ onFileChange, onProcess, file }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center flex-grow">
      <GlassCard>
        <div className="p-8 text-center" onDragOver={handleDragOver} onDrop={handleDrop}>
          <div className="flex justify-center items-center mb-6">
            <div className="p-4 bg-gray-900/50 rounded-full border-2 border-cyan-400/50 shadow-[0_0_15px_rgba(72,187,255,0.3)]">
              <Icon name="upload" className="w-10 h-10 text-cyan-300" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Upload Your Level</h2>
          <p className="text-gray-400 mb-6">Drag & drop a video, screenshot, or document, or click to browse.</p>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && onFileChange(e.target.files[0])}
            className="hidden"
            accept="image/*,video/mp4,video/quicktime,application/pdf"
          />
          
          <div className="p-4 mb-6 border-2 border-dashed border-white/20 rounded-2xl bg-white/5">
            {file ? (
              <p className="text-white font-medium truncate">{file.name}</p>
            ) : (
              <button onClick={handleFileSelect} className="text-cyan-400 font-semibold hover:text-cyan-300 transition">
                Click to select a file
              </button>
            )}
          </div>

          <button
            onClick={onProcess}
            disabled={!file}
            className="w-full py-3 px-6 text-lg font-bold text-white rounded-2xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-[0_0_20px_rgba(72,187,255,0.5)] disabled:hover:shadow-none"
          >
            Forge Portfolio
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
