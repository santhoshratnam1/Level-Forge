import React, { useRef } from 'react';
import { GlassCard } from './GlassCard';
import { Icon } from './Icon';
import { GenreSelector } from './GenreSelector';

type AppMode = 'single' | 'compare';

interface UploadFormProps {
  onFilesChange: (files: File[]) => void;
  onProcess: () => void;
  files: File[];
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  genre: string;
  setGenre: (genre: string) => void;
}

export const UploadForm: React.FC<UploadFormProps> = ({ onFilesChange, onProcess, files, mode, setMode, genre, setGenre }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (fileList: FileList | null) => {
     if (fileList && fileList.length > 0) {
       const newFiles = mode === 'single' ? [...files, ...Array.from(fileList)].slice(0, 5) : Array.from(fileList);
       onFilesChange(newFiles);
     }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onFileChange(e.dataTransfer.files);
  };
  
  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const minFiles = mode === 'compare' ? 2 : 1;
  const maxFiles = mode === 'compare' ? 3 : 5; // Allow up to 5 for single mode
  const canProcess = files.length >= minFiles && (mode === 'single' ? files.length <= maxFiles : files.length <= 3);

  const singleModeTitle = "Upload 1-5 Screenshots";
  const singleModeDescription = "The AI will analyze all images for a complete understanding.";
  const compareModeTitle = "Upload 2-3 Levels";
  const compareModeDescription = "The AI will compare each level file against the others.";

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center flex-grow p-4">
      <GlassCard>
        <div className="p-[var(--padding-card)] text-center">
            {/* Mode Toggle */}
            <div className="mb-6 mx-auto p-1.5 bg-[var(--surface-primary)] rounded-full flex w-fit border border-[var(--border-primary)]">
                <button onClick={() => setMode('single')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${mode === 'single' ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                    Single Analysis
                </button>
                <button onClick={() => setMode('compare')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${mode === 'compare' ? 'bg-[var(--accent-secondary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                    Compare Levels
                </button>
            </div>

          <div onDragOver={handleDragOver} onDrop={handleDrop}>
            <div className="flex justify-center items-center mb-6">
              <div className="p-4 bg-[var(--surface-secondary)] rounded-full border-2 border-[var(--accent-primary)]/50 shadow-[0_0_15px_var(--accent-primary)]/30">
                <Icon name={mode === 'compare' ? 'compare' : 'upload'} className="w-10 h-10 text-[var(--accent-text)]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">{mode === 'single' ? singleModeTitle : compareModeTitle}</h2>
            <p className="text-[var(--text-secondary)] mb-6 text-sm">{mode === 'single' ? singleModeDescription : compareModeDescription}</p>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => onFileChange(e.target.files)}
              className="hidden"
              accept="image/*,video/mp4,video/quicktime,application/pdf"
              multiple={true} // Always allow multiple for simplicity, logic handles the rest
            />
            
            <div className="p-4 mb-6 border-2 border-dashed border-[var(--border-primary)] rounded-2xl bg-[var(--surface-secondary)] min-h-[56px] flex flex-col items-center justify-center space-y-2">
              {files.length > 0 ? (
                <>
                  {files.map((file, index) => (
                    <div key={index} className="w-full flex items-center justify-between text-[var(--text-primary)] font-medium text-sm bg-[var(--surface-primary)] px-3 py-1.5 rounded-md">
                      <p className="truncate w-11/12 text-left">{file.name}</p>
                      <button onClick={() => removeFile(index)} className="text-[var(--color-red-400)] hover:brightness-125 font-bold text-lg">&times;</button>
                    </div>
                  ))}
                  {mode === 'single' && files.length < maxFiles && (
                     <button onClick={handleFileSelect} className="text-[var(--accent-text)] font-semibold hover:brightness-110 transition text-sm pt-2">
                        Add more files... ({files.length}/{maxFiles})
                     </button>
                  )}
                </>
              ) : (
                <button onClick={handleFileSelect} className="text-[var(--accent-text)] font-semibold hover:brightness-110 transition">
                  Click to select file(s)
                </button>
              )}
            </div>
            
            {mode === 'single' && files.length > 0 && (
                <div className="mb-6">
                    <GenreSelector selectedGenre={genre} onSelectGenre={setGenre} />
                </div>
            )}


            <button
              onClick={onProcess}
              disabled={!canProcess}
              className="w-full py-3 px-6 text-lg font-bold text-white rounded-2xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:shadow-[0_0_20px_var(--accent-primary)]/50 disabled:hover:shadow-none"
            >
              {mode === 'compare' ? `Forge Comparison (${files.length}/3)` : `Forge Portfolio (${files.length}/${maxFiles})`}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};