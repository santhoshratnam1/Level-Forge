import React, { useRef } from 'react';
import { GlassCard } from './GlassCard';
import { Icon } from './Icon';
import { GenreSelector } from './GenreSelector';

type AppMode = 'single' | 'compare';
type AnalysisMode = 'document' | 'video';

interface UploadFormProps {
  onFilesChange: (files: File[]) => void;
  onProcess: () => void;
  files: File[];
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  genre: string;
  setGenre: (genre: string) => void;
  analysisMode: AnalysisMode;
  setAnalysisMode: (mode: AnalysisMode) => void;
}

export const UploadForm: React.FC<UploadFormProps> = ({ 
    onFilesChange, 
    onProcess, 
    files, 
    mode, 
    setMode, 
    genre, 
    setGenre,
    analysisMode,
    setAnalysisMode
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (fileList: FileList | null) => {
     if (fileList && fileList.length > 0) {
       onFilesChange(Array.from(fileList));
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

  const isDocumentMode = analysisMode === 'document';
  const minFiles = isDocumentMode && mode === 'compare' ? 2 : 1;
  const maxFiles = isDocumentMode && mode === 'compare' ? 3 : 1;
  const canProcess = isDocumentMode 
    ? (files.length >= minFiles && files.length <= maxFiles)
    : (files.length === 1);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center flex-grow">
      <GlassCard>
        <div className="p-8 text-center">
             {/* Analysis Mode Toggle */}
            <div className="mb-6 mx-auto p-1.5 bg-black/30 rounded-full flex w-fit border border-white/10">
                <button onClick={() => setAnalysisMode('document')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${isDocumentMode ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                    Image/Doc Analysis
                </button>
                <button onClick={() => setAnalysisMode('video')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${!isDocumentMode ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                    Video Timeline
                </button>
            </div>
            
            {isDocumentMode && (
                 <div className="mb-6 mx-auto p-1.5 bg-black/30 rounded-full flex w-fit border border-white/10">
                    <button onClick={() => setMode('single')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${mode === 'single' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                        Single Analysis
                    </button>
                    <button onClick={() => setMode('compare')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${mode === 'compare' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                        Compare Levels
                    </button>
                </div>
            )}

          <div onDragOver={handleDragOver} onDrop={handleDrop}>
            <div className="flex justify-center items-center mb-6">
              <div className="p-4 bg-gray-900/50 rounded-full border-2 border-cyan-400/50 shadow-[0_0_15px_rgba(72,187,255,0.3)]">
                <Icon name={isDocumentMode ? (mode === 'compare' ? 'compare' : 'upload') : 'video'} className="w-10 h-10 text-cyan-300" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
                 {isDocumentMode 
                    ? (mode === 'compare' ? 'Upload 2-3 Levels' : 'Upload Your Level') 
                    : 'Upload Gameplay Video'
                }
            </h2>
            <p className="text-gray-400 mb-6">Drag & drop files, or click to browse.</p>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => onFileChange(e.target.files)}
              className="hidden"
              accept={isDocumentMode ? "image/*,video/mp4,video/quicktime,application/pdf" : "video/mp4,video/quicktime"}
              multiple={isDocumentMode && mode === 'compare'}
            />
            
            <div className="p-4 mb-6 border-2 border-dashed border-white/20 rounded-2xl bg-white/5 min-h-[56px] flex items-center justify-center">
              {files.length > 0 ? (
                <div className="space-y-2 w-full">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-white font-medium text-sm bg-white/5 px-3 py-1.5 rounded-md">
                      <p className="truncate w-11/12 text-left">{file.name}</p>
                      <button onClick={() => removeFile(index)} className="text-red-400 hover:text-red-300">&times;</button>
                    </div>
                  ))}
                </div>
              ) : (
                <button onClick={handleFileSelect} className="text-cyan-400 font-semibold hover:text-cyan-300 transition">
                  Click to select file(s)
                </button>
              )}
            </div>
            
            {isDocumentMode && mode === 'single' && files.length > 0 && (
                <div className="mb-6">
                    <GenreSelector selectedGenre={genre} onSelectGenre={setGenre} />
                </div>
            )}


            <button
              onClick={onProcess}
              disabled={!canProcess}
              className="w-full py-3 px-6 text-lg font-bold text-white rounded-2xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-[0_0_20px_rgba(72,187,255,0.5)] disabled:hover:shadow-none"
            >
             {isDocumentMode 
                ? (mode === 'compare' ? `Forge Comparison (${files.length}/${maxFiles})` : 'Forge Portfolio')
                : `Analyze Timeline (${files.length}/1)`
              }
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};