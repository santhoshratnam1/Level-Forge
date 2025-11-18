import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UploadForm } from './components/UploadForm';
import { EditorWorkspace, type EditorWorkspaceHandle } from './components/EditorWorkspace';
import { ComparisonView } from './components/ComparisonView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generateVisualAsset } from './services/geminiService';
import { analyzeAndGeneratePortfolio } from './lib/ai/portfolioGenerator';
import { analyzeAndComparePortfolios } from './lib/ai/comparisonAnalyzer';
import { generateDesignChallenges } from './lib/ai/challengeGenerator';
import type { Block, GeneratedAsset, ComparisonPayload, ComparisonResult, ChecklistState, DesignChallenge, VideoAnalysisResult } from './types/portfolio';
import { Icon } from './components/Icon';
import { processFileUpload } from './utils/fileProcessor';
import { exportToPdf } from './utils/pdfExporter';
import { HelpPanel } from './components/HelpPanel';
import { TimelineView } from './components/TimelineView';
import { extractFramesFromVideo } from './utils/videoProcessor';
import { analyzeVideoTimeline } from './lib/ai/timelineAnalyzer';
import { analyzeVideoForLayout } from './lib/ai/videoLayoutAnalyzer';

type AppMode = 'single' | 'compare';
type AnalysisMode = 'document' | 'video';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('single');
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('document');
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
  const [analysisJson, setAnalysisJson] = useState<any | null>(null);
  const [isGeneratingAsset, setIsGeneratingAsset] = useState<boolean>(false);

  // State for comparison mode
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

  // State for video mode
  const [timelineResult, setTimelineResult] = useState<VideoAnalysisResult | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  
  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  
  // Help Panel State
  const [isHelpPanelOpen, setIsHelpPanelOpen] = useState(false);

  const editorRef = useRef<EditorWorkspaceHandle>(null);

  // Cleanup video URL on unmount or when it changes
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const resetState = () => {
    setMode('single');
    setAnalysisMode('document');
    setFiles([]);
    setIsLoading(false);
    setLoadingMessage('');
    setProgress(0);
    setError(null);
    setPortfolioBlocks(null);
    setChallenges(null);
    setGeneratedImages([]);
    setComparisonResult(null);
    setTimelineResult(null);
    setIsGeneratingPdf(false);
    setGenre('general');
    setAnalysisJson(null);
    setIsGeneratingAsset(false);
    
    if(videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl('');
    }
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
      const { blocks, analysisJson: generatedAnalysis } = await analyzeAndGeneratePortfolio(base64, mimeType, selectedGenre);
      setPortfolioBlocks(blocks);
      setAnalysisJson(generatedAnalysis);
      console.log('✓ Professional analysis complete');
      
      // Step 2.5: Generate Challenges
      setLoadingMessage('💡 Generating actionable design challenges...');
      setProgress(25);
      const generatedChallenges = await generateDesignChallenges(generatedAnalysis);
      setChallenges(generatedChallenges.map((c, i) => ({
        ...c,
        id: `challenge-${i}`,
        status: 'suggested'
      })));
      console.log(`✓ ${generatedChallenges.length} challenges generated`);

      const visualInput = isVisual ? { base64Data: base64, mimeType } : { analysisData: generatedAnalysis };
      
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

  const handleProcessVideoFile = async (file: File) => {
    try {
        // Create object URL for the video player
        const objectUrl = URL.createObjectURL(file);
        setVideoUrl(objectUrl);
  
        // Step 1: Extract frames
        setLoadingMessage('🎞️ Extracting frames from video (1/4)...');
        const frames = await extractFramesFromVideo(file, 5, (p) => setProgress(p * 0.25)); // 0-25% progress
        if (frames.length === 0) {
            throw new Error('Could not extract any frames from the video.');
        }
  
        // Step 2: Analyze for spatial layout with progress tracking
        setLoadingMessage('🗺️ Analyzing spatial layout from frames...');
        setProgress(30);
        
        const startTime = Date.now();
        let currentSubProgress = 30;
        
        const updateInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            // Slowly increment progress to show activity (30% -> 49%) over ~2 minutes
            currentSubProgress = Math.min(49, 30 + elapsed * 0.15);
            setProgress(currentSubProgress);
            setLoadingMessage(`🗺️ Analyzing ${frames.length} frames... ${elapsed}s elapsed`);
        }, 1000);
  
        let spatialAnalysisJson;
        try {
            spatialAnalysisJson = await analyzeVideoForLayout(frames);
            clearInterval(updateInterval);
            setProgress(50);
        } catch (error) {
            clearInterval(updateInterval);
            throw error;
        }
        
        // Step 3: Generate visual assets from layout analysis with progress tracking
        const assetsToGenerate: ('Top-down whitebox map' | 'Player flow diagram')[] = [
            'Top-down whitebox map', 'Player flow diagram'
        ];
        const visualInput = { analysisData: spatialAnalysisJson };
        let generatedAssets: GeneratedAsset[] = [];
  
        // Generate top-down map with elapsed time
        let mapStartTime = Date.now();
        let mapInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - mapStartTime) / 1000);
            setLoadingMessage(`🎨 Generating top-down map (3/4)... ${elapsed}s elapsed`);
        }, 1000);
        
        try {
            setProgress(55);
            const mapImage = await generateVisualAsset(visualInput, assetsToGenerate[0], 'general');
            generatedAssets.push({ title: 'Top-Down Map', url: mapImage });
            clearInterval(mapInterval);
        } catch (error) {
            clearInterval(mapInterval);
            throw error;
        }
  
        // Generate flow diagram with elapsed time
        let flowStartTime = Date.now();
        let flowInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - flowStartTime) / 1000);
            setLoadingMessage(`🌊 Creating player flow diagram (4/4)... ${elapsed}s elapsed`);
        }, 1000);
        
        try {
            setProgress(70);
            const flowImage = await generateVisualAsset(visualInput, assetsToGenerate[1], 'general');
            generatedAssets.push({ title: 'Flow Diagram', url: flowImage });
            clearInterval(flowInterval);
        } catch (error) {
            clearInterval(flowInterval);
            throw error;
        }
  
        // Step 4: Analyze for temporal events (pacing, etc.) with progress tracking
        let timelineStartTime = Date.now();
        let timelineProgress = 80;
        
        const timelineInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - timelineStartTime) / 1000);
            // Slowly increment from 80% to 94%
            timelineProgress = Math.min(94, 80 + elapsed * 0.3);
            setProgress(timelineProgress);
            setLoadingMessage(`🧠 Analyzing player journey & pacing... ${elapsed}s elapsed`);
        }, 1000);
  
        let temporalAnalysis;
        try {
            temporalAnalysis = await analyzeVideoTimeline(frames);
            clearInterval(timelineInterval);
            setProgress(95);
        } catch (error) {
            clearInterval(timelineInterval);
            throw error;
        }
  
        // Step 5: Finalize
        setLoadingMessage('📊 Building timeline visualization...');
        setTimelineResult({ 
            ...temporalAnalysis, 
            frames, 
            generatedAssets,
            videoUrl: objectUrl
        });
  
        setLoadingMessage('✨ Video analysis complete!');
        setProgress(100);
        setTimeout(() => setIsLoading(false), 800);
  
    } catch (err) {
        throw err; // Rethrow to be caught by the main processor
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
    setTimelineResult(null);
    setAnalysisJson(null);

    try {
        if (analysisMode === 'document') {
            if (mode === 'single' && files[0]) {
                await handleProcessSingleFile(files[0], genre);
            } else if (mode === 'compare' && files.length > 1) {
                await handleProcessMultipleFiles(files);
            } else {
                throw new Error('Invalid mode or file selection for document analysis.');
            }
        } else if (analysisMode === 'video' && files[0]) {
            await handleProcessVideoFile(files[0]);
        } else {
            throw new Error('Invalid analysis mode or file selection.');
        }
    } catch (err) {
      console.error('Processing error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to process. ${errorMessage}`);
      setIsLoading(false);
    }
  }, [files, mode, genre, analysisMode]);
  
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

  const handleGenerateNewAsset = async (assetType: 'Top-down whitebox map' | 'Player flow diagram' | 'Combat analysis overlay' | 'Flow & Loops Overlay') => {
    // Prevent concurrent generation
    if (isGeneratingAsset) {
      console.warn('Asset generation already in progress');
      return;
    }

    if (!analysisJson) {
        setError("Cannot generate asset: analysis data is missing.");
        return;
    }
    setIsGeneratingAsset(true);
    setError(null);
    try {
        const visualInput = { analysisData: analysisJson };
        const newImage = await generateVisualAsset(visualInput, assetType, genre);

        const assetTitleMap = {
            'Top-down whitebox map': 'Top-Down Map',
            'Player flow diagram': 'Flow Diagram',
            'Combat analysis overlay': 'Combat Areas',
            'Flow & Loops Overlay': 'Pacing & Loops'
        };
        const title = assetTitleMap[assetType];
        
        setGeneratedImages(prev => {
            const existingIndex = prev.findIndex(img => img.title === title);
            if (existingIndex !== -1) {
                // Replace existing asset
                const updatedImages = [...prev];
                updatedImages[existingIndex] = { title, url: newImage };
                return updatedImages;
            } else {
                // Add new asset
                return [...prev, { title, url: newImage }];
            }
        });
        
    } catch (err) {
        console.error(`Error generating new asset (${assetType}):`, err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to generate new visual. ${errorMessage}`);
    } finally {
        setIsGeneratingAsset(false);
    }
};

  const hasResult = portfolioBlocks || comparisonResult || timelineResult;

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
            onGenerateAsset={handleGenerateNewAsset}
            isGeneratingAsset={isGeneratingAsset}
          />
        ) : comparisonResult ? (
          <ComparisonView result={comparisonResult} />
        ) : timelineResult ? (
            <TimelineView result={timelineResult} />
        ) : (
          <UploadForm 
            onFilesChange={handleFilesChange} 
            onProcess={processFiles} 
            files={files}
            mode={mode}
            setMode={setMode}
            genre={genre}
            setGenre={setGenre}
            analysisMode={analysisMode}
            setAnalysisMode={setAnalysisMode}
          />
        )}
      </main>
      <HelpPanel isOpen={isHelpPanelOpen} onClose={() => setIsHelpPanelOpen(false)} />
    </div>
  );
};

export default App;