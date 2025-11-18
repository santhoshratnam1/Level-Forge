import React, { useState, useCallback } from 'react';
import { UploadForm } from './components/UploadForm';
import { EditorWorkspace } from './components/EditorWorkspace';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generateVisualAsset } from './services/geminiService';
import { analyzeAndGeneratePortfolio } from './lib/ai/portfolioGenerator';
import type { Block, GeneratedAsset } from './types/portfolio';
import { Icon } from './components/Icon';
import { processFileUpload } from './utils/fileProcessor';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [portfolioBlocks, setPortfolioBlocks] = useState<Block[] | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedAsset[]>([]);

  const resetState = () => {
    setFile(null);
    setIsLoading(false);
    setLoadingMessage('');
    setProgress(0);
    setError(null);
    setPortfolioBlocks(null);
    setGeneratedImages([]);
  };

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
  };

  const processFile = useCallback(async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);
    setGeneratedImages([]);

    try {
      setLoadingMessage('📄 Processing file...');
      setProgress(5);
      const processedFile = await processFileUpload(file);
      const { base64, mimeType, isVisual } = processedFile;

      setLoadingMessage('🔍 Analyzing level & generating portfolio...');
      setProgress(20);
      const analysisResult = await analyzeAndGeneratePortfolio(base64, mimeType);
      setPortfolioBlocks(analysisResult);
      console.log('✓ Analysis complete');

      const visualInput = isVisual
        ? { base64Data: base64, mimeType }
        : { analysisData: analysisResult };
      
      setLoadingMessage('🗺️ Generating top-down map... (2/5)');
      setProgress(40);
      const mapImage = await generateVisualAsset(visualInput, 'Top-down whitebox map');
      setGeneratedImages(prev => [...prev, { title: 'Top-Down Map', url: mapImage }]);
      
      setLoadingMessage('📊 Creating flow diagram... (3/5)');
      setProgress(60);
      const flowImage = await generateVisualAsset(visualInput, 'Player flow diagram');
      setGeneratedImages(prev => [...prev, { title: 'Flow Diagram', url: flowImage }]);
      
      setLoadingMessage('⚔️ Analyzing combat areas... (4/5)');
      setProgress(80);
      const combatImage = await generateVisualAsset(visualInput, 'Combat analysis overlay');
      setGeneratedImages(prev => [...prev, { title: 'Combat Areas', url: combatImage }]);
      
      setLoadingMessage('🔄 Visualizing loops & paths... (5/5)');
      setProgress(90);
      const loopsImage = await generateVisualAsset(visualInput, 'Flow & Loops Overlay');
      setGeneratedImages(prev => [...prev, { title: 'Flow & Loops', url: loopsImage }]);
      
      setLoadingMessage('✨ Complete!');
      setProgress(100);

      setTimeout(() => setIsLoading(false), 1000);

    } catch (err) {
      console.error('Processing error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to process the file. ${errorMessage}`);
      setIsLoading(false);
    }
  }, [file]);
  
  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] text-gray-200 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/30 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[400px] h-[400px] bg-blue-600/30 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        <header className="w-full max-w-7xl mx-auto flex justify-between items-center p-4">
           <div className="flex items-center space-x-3">
             <Icon name="logo" className="h-10 w-10 text-cyan-400" />
             <h1 className="text-3xl font-bold text-white tracking-wider">LevelForge</h1>
           </div>
           {portfolioBlocks && (
             <button
               onClick={resetState}
               className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl backdrop-blur-md hover:bg-white/20 transition-colors duration-300 flex items-center space-x-2"
             >
               <Icon name="plus" className="w-5 h-5" />
               <span>New Project</span>
             </button>
           )}
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-grow">
            <LoadingSpinner message={loadingMessage} progress={progress} />
          </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center flex-grow text-center">
            <div className="p-8 bg-red-500/10 border border-red-500/30 rounded-2xl max-w-md">
              <h2 className="text-xl font-semibold text-red-400 mb-2">An Error Occurred</h2>
              <p className="text-red-300 text-sm">{error}</p>
              <button
                onClick={resetState}
                className="mt-6 px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-xl hover:bg-red-500/30 transition-colors duration-300"
              >
                Try Again
              </button>
            </div>
           </div>
        ) : portfolioBlocks && generatedImages.length > 0 ? (
          <EditorWorkspace 
            initialBlocks={portfolioBlocks} 
            generatedImages={generatedImages} 
          />
        ) : (
          <UploadForm onFileChange={handleFileChange} onProcess={processFile} file={file} />
        )}
      </main>
    </div>
  );
};

export default App;
