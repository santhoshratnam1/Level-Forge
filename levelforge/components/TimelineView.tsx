import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GlassCard } from './GlassCard';
import { Icon, type IconName } from './Icon';
import type { VideoAnalysisResult, TimelineEvent, TimelineEventType, GeneratedAsset, PacingAnalysis } from '../types/portfolio';

const eventTypeConfig: Record<TimelineEventType, { icon: IconName; color: string }> = {
    Combat: { icon: 'fps', color: 'bg-red-500' },
    Boss_Fight: { icon: 'fps', color: 'bg-red-700' },
    Exploration: { icon: 'open-world', color: 'bg-green-500' },
    Puzzle: { icon: 'puzzle', color: 'bg-yellow-500' },
    Narrative: { icon: 'quote', color: 'bg-blue-500' },
    Player_Stuck: { icon: 'help', color: 'bg-orange-500' },
    Key_Moment: { icon: 'logo', color: 'bg-purple-500' },
    Stealth: { icon: 'horror', color: 'bg-indigo-500' },
    Traversal: { icon: 'arrow', color: 'bg-blue-400' },
    Backtracking: { icon: 'undo', color: 'bg-yellow-700' },
    Looting: { icon: 'download', color: 'bg-yellow-600' },
    Menu_UI: { icon: 'list', color: 'bg-gray-500' },
    Death: { icon: 'trash', color: 'bg-gray-800' },
};

const TimelineScrubber: React.FC<{
  events: TimelineEvent[],
  duration: number,
  currentTime: number,
  onSeek: (time: number) => void
}> = ({ events, duration, currentTime, onSeek }) => {
  const scrubberRef = useRef<HTMLDivElement>(null);

  // Generate SVG path for intensity curve
  const intensityPath = useMemo(() => {
    if (!events.length) return '';
    
    const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);
    const width = 100; // percentage
    const height = 100; // percentage

    let path = `M 0,${height} `; // Start at bottom left
    
    // Normalize points
    // X: timestamp / duration * 100
    // Y: height - (intensity / 10 * height) (High intensity = Low Y value)
    
    // Add a starting point at 0 time if not present, interpolate intensity
    if (sortedEvents[0].timestamp > 0) {
        const firstIntensity = sortedEvents[0].intensity;
        path += `L 0,${height - (firstIntensity / 10 * height)} `;
    }

    sortedEvents.forEach(e => {
        const x = (e.timestamp / duration) * 100;
        const y = height - ((e.intensity / 10) * height);
        path += `L ${x},${y} `;
    });

    // Add end point
    path += `L 100,${height - (sortedEvents[sortedEvents.length - 1].intensity / 10 * height)} `;
    path += `L 100,${height} Z`; // Close path at bottom right

    return path;
  }, [events, duration]);

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(pos * duration);
  };
  
  return (
    <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400 font-mono uppercase tracking-widest">
            <span>Start</span>
            <span>Intensity Curve</span>
            <span>End</span>
        </div>
        <div 
            ref={scrubberRef} 
            onClick={handleScrub} 
            className="w-full h-24 bg-black/50 rounded-xl cursor-pointer relative overflow-hidden border border-white/10 group"
        >
            {/* Intensity Graph */}
            <svg className="absolute inset-0 w-full h-full preserve-3d" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="intensityGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(249, 115, 22, 0.6)" />
                        <stop offset="100%" stopColor="rgba(249, 115, 22, 0.1)" />
                    </linearGradient>
                </defs>
                <path d={intensityPath} fill="url(#intensityGradient)" stroke="rgba(249, 115, 22, 0.8)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
            </svg>

            {/* Playhead Line */}
            <div 
                className="absolute top-0 bottom-0 w-px bg-cyan-400 z-20 shadow-[0_0_10px_rgba(34,211,238,0.8)] pointer-events-none transition-all duration-100 ease-linear" 
                style={{ left: `${(currentTime / duration) * 100}%` }}
            >
                <div className="absolute top-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-md"></div>
            </div>
            
            {/* Event markers */}
            {events.map((event, i) => {
                const config = eventTypeConfig[event.type] || eventTypeConfig.Key_Moment;
                return (
                <div
                    key={i}
                    className={`absolute bottom-2 -translate-x-1/2 w-2 h-2 rounded-full ${config.color} ring-1 ring-black/50 transition-all duration-200 hover:scale-150 hover:z-30`}
                    style={{ left: `${(event.timestamp / duration) * 100}%` }}
                    title={`${event.title} - ${event.type}`}
                />
                );
            })}
        </div>
    </div>
  );
};

// Defined outside TimelineView to prevent re-renders and scroll resetting when video plays
interface EventLogProps {
    events: TimelineEvent[];
    onJump: (timestamp: number) => void;
}

const EventLog: React.FC<EventLogProps> = ({ events, onJump }) => {
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
    const scrollRef = useRef<HTMLDivElement>(null);
    
    const sortedEvents = useMemo(() => 
      [...events].sort((a, b) => a.timestamp - b.timestamp),
      [events]
    );
    
    useEffect(() => {
      const handleScroll = () => {
        if (!scrollRef.current) return;
        
        const { scrollTop, clientHeight, scrollHeight } = scrollRef.current;
        const scrollPercent = scrollTop / (scrollHeight - clientHeight);
        
        // Calculate visible range (show 20 items at a time)
        const totalItems = sortedEvents.length;
        const itemsPerView = 20;
        const start = Math.floor(scrollPercent * Math.max(0, totalItems - itemsPerView));
        const end = Math.min(totalItems, start + itemsPerView + 5); // Add 5 for buffer
        
        setVisibleRange({ start, end });
      };
      
      const scrollEl = scrollRef.current;
      if (scrollEl) {
        scrollEl.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial calculation
      }
      
      return () => scrollEl?.removeEventListener('scroll', handleScroll);
    }, [sortedEvents.length]);
    
    const visibleEvents = sortedEvents.slice(visibleRange.start, visibleRange.end);
    const topPadding = visibleRange.start * 100; // Approximate height per item
    const bottomPadding = Math.max(0, (sortedEvents.length - visibleRange.end) * 100);
    
    return (
      <div ref={scrollRef} className="relative h-full overflow-y-auto custom-scrollbar p-4">
        {/* Top spacer for virtual scrolling */}
        {topPadding > 0 && <div style={{ height: `${topPadding}px` }} />}
        
        {visibleEvents.map((event, index) => {
          const config = eventTypeConfig[event.type] || eventTypeConfig.Key_Moment;
          return (
            <div 
              key={visibleRange.start + index} 
              className="mb-6 flex items-start space-x-4 group cursor-pointer" 
              onClick={() => onJump(event.timestamp)}
            >
              <div className={`flex-shrink-0 mt-1 w-8 h-8 rounded-full ${config.color} flex items-center justify-center ring-4 ring-[#0a0a0f] z-10 relative`}>
                <Icon name={config.icon} className="w-4 h-4 text-white"/>
              </div>
              <div className="flex-grow pt-1 border-l-2 border-white/10 pl-8 -ml-8 group-hover:bg-white/5 rounded-r-lg pb-1 transition-colors">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-cyan-400 font-mono">
                    {new Date(event.timestamp * 1000).toISOString().substr(14, 5)}
                  </p>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">Intensity</span>
                    <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500" style={{width: `${event.intensity * 10}%`}} />
                    </div>
                  </div>
                </div>
                <h4 className="font-bold text-white">{event.title}</h4>
                <p className="text-sm text-gray-300">{event.description}</p>
              </div>
            </div>
          );
        })}
        
        {/* Bottom spacer for virtual scrolling */}
        {bottomPadding > 0 && <div style={{ height: `${bottomPadding}px` }} />}
      </div>
    );
  };

export const TimelineView: React.FC<{ result: VideoAnalysisResult }> = ({ result }) => {
    const { summary, pacing, events, frames, generatedAssets, videoUrl } = result;
    const [activeTab, setActiveTab] = useState<'assets' | 'events' | 'pacing'>('assets');
    const [currentTime, setCurrentTime] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    const duration = frames.length > 0 ? frames[frames.length - 1]?.timestamp : 1;

    const handleSeek = (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    };
    
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const timeUpdate = () => setCurrentTime(video.currentTime);
        video.addEventListener('timeupdate', timeUpdate);
        return () => video.removeEventListener('timeupdate', timeUpdate);
    }, []);

    const jumpToEvent = (timestamp: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = timestamp;
            videoRef.current.play();
        }
    }

    const AssetViewer: React.FC<{ assets: GeneratedAsset[] }> = ({ assets }) => {
        const [activeAsset, setActiveAsset] = useState(0);
        if (!assets || assets.length === 0) {
            return <div className="text-center p-8 text-gray-400">No visual assets were generated for this video.</div>
        }
        return (
            <div className="flex flex-col h-full">
                <div className="flex-shrink-0 flex space-x-2 p-2 border-b border-white/10 overflow-x-auto">
                    {assets.map((asset, index) => (
                        <button key={index} onClick={() => setActiveAsset(index)} className={`flex-shrink-0 px-3 py-1 text-sm rounded-lg ${activeAsset === index ? 'bg-cyan-500/30 text-cyan-200' : 'text-gray-400 hover:bg-white/10'}`}>
                            {asset.title}
                        </button>
                    ))}
                </div>
                <div className="flex-grow p-2 flex items-center justify-center min-h-0">
                    <img src={assets[activeAsset].url} alt={assets[activeAsset].title} className="max-w-full max-h-full object-contain" />
                </div>
            </div>
        );
    }

    const PacingPanel: React.FC<{ pacing: PacingAnalysis }> = ({ pacing }) => {
        if (!pacing) return <div className="p-4 text-gray-400">No pacing analysis available.</div>;
        
        const getScoreColor = (score: number) => {
            if (score >= 8) return 'text-green-400 border-green-400';
            if (score >= 5) return 'text-yellow-400 border-yellow-400';
            return 'text-red-400 border-red-400';
        };
        
        const categories = [
            { key: 'combat', label: 'Combat', color: 'bg-red-500' },
            { key: 'exploration', label: 'Exploration', color: 'bg-green-500' },
            { key: 'puzzle', label: 'Puzzle', color: 'bg-yellow-500' },
            { key: 'narrative', label: 'Narrative', color: 'bg-blue-500' },
            { key: 'idle', label: 'Idle / Menu', color: 'bg-gray-500' },
        ] as const;

        return (
            <div className="relative h-full overflow-y-auto custom-scrollbar p-6 space-y-8">
                {/* Score Header */}
                <div className="flex items-center space-x-6 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center flex-shrink-0 ${getScoreColor(pacing.score)}`}>
                        <div className="text-center">
                            <span className="block text-2xl font-bold">{pacing.score}</span>
                            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">/ 10</span>
                        </div>
                    </div>
                    <div>
                         <h3 className="text-lg font-bold text-white mb-1">Pacing Score</h3>
                         <p className="text-gray-400 text-xs leading-relaxed">AI evaluation of flow consistency, tension management, and player engagement retention.</p>
                    </div>
                </div>
                
                {/* Breakdown Chart */}
                {pacing.breakdown && (
                    <div>
                        <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider text-gray-500">Playtime Breakdown</h4>
                        <div className="space-y-3">
                            {categories.map(cat => {
                                const val = pacing.breakdown?.[cat.key] || 0;
                                if (val === 0) return null;
                                return (
                                    <div key={cat.key}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-300">{cat.label}</span>
                                            <span className="text-white font-mono">{val}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${cat.color} transition-all duration-1000`} style={{ width: `${val}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Critique */}
                <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                    <h4 className="text-blue-300 font-semibold mb-2 flex items-center text-sm">
                        <Icon name="quote" className="w-4 h-4 mr-2" />
                        AI Critique
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed italic">"{pacing.critique}"</p>
                </div>

                {/* Improvements */}
                <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center text-sm uppercase tracking-wider text-gray-500">
                        <Icon name="plus" className="w-4 h-4 mr-2 text-green-400" />
                        Suggested Improvements
                    </h4>
                    <ul className="space-y-2">
                        {pacing.improvements.map((imp, idx) => (
                            <li key={idx} className="flex items-start space-x-3 bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                <span className="flex-shrink-0 w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-[10px] font-bold mt-0.5">
                                    {idx + 1}
                                </span>
                                <span className="text-gray-300 text-sm">{imp}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col flex-grow p-4 h-full">
            <h2 className="text-2xl font-bold mb-4 flex-shrink-0 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Video Timeline Analysis</h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-grow min-h-0 h-full">
                {/* Left Panel: Video Player & Timeline */}
                <div className="lg:col-span-3 h-full flex flex-col space-y-4">
                    <GlassCard className="flex-grow flex flex-col bg-black overflow-hidden relative group">
                         {/* Video Container */}
                        <div className="flex-grow relative flex items-center justify-center">
                             <video 
                                ref={videoRef} 
                                src={videoUrl} 
                                controls 
                                className="max-w-full max-h-full outline-none"
                                controlsList="nodownload"
                             />
                        </div>
                        {/* Summary Overlay (Only visible if video matches) */}
                        <div className="absolute top-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <p className="text-sm text-gray-200 line-clamp-2">{summary}</p>
                        </div>
                    </GlassCard>
                    
                    {/* Scrubber Card */}
                    <GlassCard className="p-6 flex-shrink-0">
                         <TimelineScrubber events={events} duration={duration} currentTime={currentTime} onSeek={handleSeek} />
                    </GlassCard>
                </div>
                
                {/* Right Panel: Analysis Tabs */}
                <div className="lg:col-span-2 h-full flex flex-col">
                    <GlassCard className="h-full flex flex-col">
                        <div className="p-2 border-b border-white/10 flex space-x-1 flex-shrink-0">
                             <button onClick={() => setActiveTab('assets')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'assets' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-gray-500 hover:bg-white/5'}`}>
                                Assets
                             </button>
                             <button onClick={() => setActiveTab('events')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'events' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-gray-500 hover:bg-white/5'}`}>
                                Event Log
                             </button>
                             <button onClick={() => setActiveTab('pacing')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'pacing' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-gray-500 hover:bg-white/5'}`}>
                                Pacing
                             </button>
                        </div>
                        <div className="flex-grow min-h-0 overflow-hidden bg-black/20">
                            {activeTab === 'assets' && <AssetViewer assets={generatedAssets} />}
                            {activeTab === 'events' && <EventLog events={events} onJump={jumpToEvent} />}
                            {activeTab === 'pacing' && <PacingPanel pacing={pacing} />}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};