import React, { useState, useCallback, useRef } from 'react';
import { UploadForm } from './components/UploadForm';
import { EditorWorkspace, type EditorWorkspaceHandle } from './components/EditorWorkspace';
import { ComparisonView } from './components/ComparisonView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generateVisualAsset } from './services/geminiService';
import { analyzeAndGeneratePortfolio } from './lib/ai/portfolioGenerator';
import { analyzeAndComparePortfolios } from './lib/ai/comparisonAnalyzer';
import { generateDesignChallenges } from './lib/ai/challengeGenerator';
import type { Block, GeneratedAsset, ComparisonPayload, ComparisonResult, ChecklistState, DesignChallenge } from './types/portfolio';
import { Icon } from './components/Icon';
import { processFileUpload } from './utils/fileProcessor';
import { exportToPdf } from './utils/pdfExporter';
import { HelpPanel } from './components/HelpPanel';

type AppMode = 'single' | 'compare';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('single');
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  // State for single mode
  const [portfolioBlocks, setPortfolioBlocks] = useState<Block[] | null>(null);
  const [challenges, setChallenges] = useState<DesignChallenge[] | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedAsset[]>([]);
  const [genre, setGenre] = useState<string>('general');

  // State for comparison mode
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  
  // Help Panel State
  const [isHelpPanelOpen, setIsHelpPanelOpen] = useState(false);

  const editorRef = useRef<EditorWorkspaceHandle>(null);

  const resetState = () => {
    setMode('single');
    setFiles([]);
    setIsLoading(false);
    setLoadingMessage('');
    setProgress(0);
    setError(null);
    setPortfolioBlocks(null);
    setChallenges(null);
    setGeneratedImages([]);
    setComparisonResult(null);
    setIsGeneratingPdf(false);
    setGenre('general');
  };

  const handleFilesChange = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setError(null);
  };

  const handleProcessSingleFile = async (file: File, selectedGenre: string) => {
    try {
      // Step 1: Process File
      setLoadingMessage('📄 Processing your level file...');
      setProgress(5);
      const processedFile = await processFileUpload(file);
      const { base64, mimeType, isVisual } = processedFile;

      // Step 2: AI Analysis
      setLoadingMessage('🔍 Analyzing using genre-specific framework...');
      setProgress(15);
      const { blocks, analysisJson } = await analyzeAndGeneratePortfolio(base64, mimeType, selectedGenre);
      setPortfolioBlocks(blocks);
      console.log('✓ Professional analysis complete');
      
      // Step 2.5: Generate Challenges
      setLoadingMessage('💡 Generating actionable design challenges...');
      setProgress(25);
      const generatedChallenges = await generateDesignChallenges(analysisJson);
      setChallenges(generatedChallenges.map((c, i) => ({
        ...c,
        id: `challenge-${i}`,
        status: 'suggested'
      })));
      console.log(`✓ ${generatedChallenges.length} challenges generated`);

      const visualInput = isVisual ? { base64Data: base64, mimeType } : { analysisData: analysisJson };
      
      const assetsToGenerate: ('Top-down whitebox map' | 'Player flow diagram' | 'Combat analysis overlay' | 'Flow & Loops Overlay')[] = [
        'Top-down whitebox map', 'Player flow diagram', 'Combat analysis overlay', 'Flow & Loops Overlay'
      ];
      const loadingMessages = [
        '🗺️ Generating top-down whitebox map (1/4)...',
        '🌊 Creating player flow & navigation diagram (2/4)...',
        '⚔️ Analyzing combat spaces & encounters (3/4)...',
        '🔄 Mapping pacing, loops & shortcuts (4/4)...'
      ];
      const progressSteps = [30, 50, 70, 90];
      const titles = ['Top-Down Map', 'Flow Diagram', 'Combat Areas', 'Pacing & Loops'];

      for (let i = 0; i < assetsToGenerate.length; i++) {
        setLoadingMessage(loadingMessages[i]);
        setProgress(progressSteps[i]);
        const image = await generateVisualAsset(visualInput, assetsToGenerate[i], selectedGenre);
        setGeneratedImages(prev => [...prev, { title: titles[i], url: image }]);
      }
      
      setLoadingMessage('✨ Portfolio complete!');
      setProgress(100);
      setTimeout(() => setIsLoading(false), 800);
    } catch (err) {
      throw err; // Rethrow to be caught by the main processor
    }
  };

  const handleProcessMultipleFiles = async (filesToProcess: File[]) => {
    try {
        setLoadingMessage(`📄 Processing ${filesToProcess.length} level files...`);
        setProgress(5);
        const processedFiles = await Promise.all(filesToProcess.map(processFileUpload));
        
        setLoadingMessage(`🔍 Analyzing ${filesToProcess.length} levels...`);
        setProgress(25);

        const comparisonPayload: ComparisonPayload = {
            levels: processedFiles.map((pf, i) => ({
                id: filesToProcess[i].name,
                base64: pf.base64,
                mimeType: pf.mimeType,
            }))
        };
        
        setLoadingMessage(`🧠 Generating comparative analysis...`);
        setProgress(60);

        const result = await analyzeAndComparePortfolios(comparisonPayload);
        setComparisonResult(result);

        setLoadingMessage('✨ Comparison complete!');
        setProgress(100);
        setTimeout(() => setIsLoading(false), 800);

    } catch(err) {
        throw err;
    }
  };

  const processFiles = useCallback(async () => {
    if (files.length === 0) {
      setError('Please select one or more files.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);
    setGeneratedImages([]);
    setPortfolioBlocks(null);
    setChallenges(null);
    setComparisonResult(null);

    try {
      if (mode === 'single' && files[0]) {
        await handleProcessSingleFile(files[0], genre);
      } else if (mode === 'compare' && files.length > 1) {
        await handleProcessMultipleFiles(files);
      } else {
        throw new Error('Invalid mode or file selection.');
      }
    } catch (err) {
      console.error('Processing error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to process. ${errorMessage}`);
      setIsLoading(false);
    }
  }, [files, mode, genre]);
  
  const handleDownloadPdf = async () => {
    if (!portfolioBlocks || !editorRef.current) return;
    setIsGeneratingPdf(true);
    try {
        const annotatedImages = await editorRef.current.getAnnotatedImages();
        const checklistState = editorRef.current.getChecklistState();
        const levelName = portfolioBlocks.find(b => b.type === 'heading_1')?.content.text || 'Analysis';
        await exportToPdf(portfolioBlocks, annotatedImages, levelName, checklistState);
    } catch (err) {
        console.error("PDF Generation Error:", err);
        setError(err instanceof Error ? err.message : 'Could not generate PDF.');
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  const hasResult = portfolioBlocks || comparisonResult;

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
           <div className="flex items-center space-x-2">
                <button
                    onClick={() => setIsHelpPanelOpen(true)}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl backdrop-blur-md hover:bg-white/20 transition-colors duration-300 flex items-center space-x-2"
                >
                    <Icon name="help" className="w-5 h-5" />
                    <span>Learn More</span>
                </button>
               {hasResult && (
                 <>
                    {portfolioBlocks && (
                        <button
                            onClick={handleDownloadPdf}
                            disabled={isGeneratingPdf}
                            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl backdrop-blur-md hover:bg-white/20 transition-colors duration-300 flex items-center space-x-2 disabled:opacity-50"
                        >
                            <Icon name="download" className="w-5 h-5" />
                            <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
                        </button>
                    )}
                   <button
                     onClick={resetState}
                     className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl backdrop-blur-md hover:bg-white/20 transition-colors duration-300 flex items-center space-x-2"
                   >
                     <Icon name="plus" className="w-5 h-5" />
                     <span>New Project</span>
                   </button>
                 </>
               )}
            </div>
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
              <button onClick={resetState} className="mt-6 px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-xl hover:bg-red-500/30 transition-colors duration-300">
                Try Again
              </button>
            </div>
           </div>
        ) : portfolioBlocks ? (
          <EditorWorkspace 
            ref={editorRef}
            initialBlocks={portfolioBlocks} 
            generatedImages={generatedImages} 
            initialChallenges={challenges}
          />
        ) : comparisonResult ? (
          <ComparisonView result={comparisonResult} />
        ) : (
          <UploadForm 
            onFilesChange={handleFilesChange} 
            onProcess={processFiles} 
            files={files}
            mode={mode}
            setMode={setMode}
            genre={genre}
            setGenre={setGenre}
          />
        )}
      </main>
      <HelpPanel isOpen={isHelpPanelOpen} onClose={() => setIsHelpPanelOpen(false)} />
    </div>
  );
};

export default App;