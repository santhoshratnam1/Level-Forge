import React, { useState, useCallback } from 'react';
import { UploadForm } from './components/UploadForm';
import { EditorWorkspace } from './components/EditorWorkspace';
import { LoadingSpinner } from './components/LoadingSpinner';
import { analyzeContent, generateVisualAsset } from './services/geminiService';
import type { PortfolioData, GeneratedAsset } from './types';
import { Icon } from './components/Icon';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedAsset[]>([]);

  const resetState = () => {
    setFile(null);
    setIsLoading(false);
    setLoadingMessage('');
    setError(null);
    setPortfolioData(null);
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

    try {
      setLoadingMessage('Reading file...');
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = (reader.result as string).split(',')[1];
        const mimeType = file.type;

        try {
          setLoadingMessage('Analyzing & generating assets...');

          // Run all AI tasks in parallel for performance
          const [
            analysisResult,
            mapImage,
            flowImage,
            combatImage,
          ] = await Promise.all([
            analyzeContent(base64Image, mimeType),
            generateVisualAsset(base64Image, mimeType, 'Top-down whitebox map'),
            generateVisualAsset(base64Image, mimeType, 'Player flow diagram'),
            generateVisualAsset(base64Image, mimeType, 'Combat analysis overlay'),
          ]);

          // Update state with all results at once
          setPortfolioData(analysisResult);

          const newImages: GeneratedAsset[] = [
            { title: 'Top-Down Map', url: mapImage },
            { title: 'Flow Diagram', url: flowImage },
            { title: 'Combat Areas', url: combatImage },
          ];
          setGeneratedImages(newImages);

        } catch (err) {
          console.error(err);
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during AI processing.';
          setError(`Failed to process the file with AI. Reason: ${errorMessage} Please check the console for details.`);
        } finally {
          setIsLoading(false);
          setLoadingMessage('');
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        setError('Failed to read the file.');
        setIsLoading(false);
      };
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
      setIsLoading(false);
    }
  }, [file]);
  
  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] text-gray-200 overflow-hidden relative">
      {/* Background Blobs */}
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
           {portfolioData && (
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
            <LoadingSpinner />
            <p className="mt-4 text-lg text-gray-300">{loadingMessage}</p>
          </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center flex-grow text-center">
            <div className="p-8 bg-red-500/10 border border-red-500/30 rounded-2xl max-w-md">
              <h2 className="text-xl font-semibold text-red-400 mb-2">An Error Occurred</h2>
              <p className="text-red-300">{error}</p>
              <button
                onClick={resetState}
                className="mt-6 px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-xl hover:bg-red-500/30 transition-colors duration-300"
              >
                Try Again
              </button>
            </div>
           </div>
        ) : portfolioData && generatedImages.length > 0 ? (
          <EditorWorkspace portfolioData={portfolioData} generatedImages={generatedImages} setPortfolioData={setPortfolioData} />
        ) : (
          <UploadForm onFileChange={handleFileChange} onProcess={processFile} file={file} />
        )}
      </main>
    </div>
  );
};

export default App;