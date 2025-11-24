
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Mic, RefreshCcw, Sparkles, User, BookOpen, AudioWaveform, Video, Lock } from 'lucide-react';
import { generatePodcastAudio, generateEducationalVideo } from '../services/geminiService';

interface AIDiscussionPlayerProps {
  topicTitle: string;
  topicContent: string;
  onClose?: () => void;
}

export const AIDiscussionPlayer: React.FC<AIDiscussionPlayerProps> = ({ topicTitle, topicContent, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [script, setScript] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [sourceNode, setSourceNode] = useState<AudioBufferSourceNode | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [pausedAt, setPausedAt] = useState<number>(0);
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Initialize Audio Context
  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass({ sampleRate: 24000 });
    setAudioContext(ctx);
    
    // Check for API Key for Video (Veo Requirement)
    const checkKey = async () => {
       if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
       }
    };
    checkKey();

    return () => {
      if (ctx.state !== 'closed') ctx.close();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const selectApiKey = async () => {
     if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
        setHasApiKey(true);
     }
  };

  const initPodcast = async () => {
    if (!topicTitle) return;
    setIsLoading(true);
    
    // Parallel Generation if key exists
    const audioPromise = generatePodcastAudio(topicTitle, topicContent);
    
    let videoPromise = Promise.resolve(null as string | null);
    if (hasApiKey) {
        setIsGeneratingVideo(true);
        videoPromise = generateEducationalVideo(topicTitle);
    }

    const [audioResult, videoResult] = await Promise.all([audioPromise, videoPromise]);

    if (audioResult.audioBuffer) {
      setAudioBuffer(audioResult.audioBuffer);
      setScript(audioResult.script);
    }
    
    if (videoResult) {
       setVideoUrl(videoResult);
    }
    
    setIsLoading(false);
    setIsGeneratingVideo(false);
  };

  useEffect(() => {
    if (topicTitle) {
      initPodcast();
    }
  }, [topicTitle]); // Only re-run if topic changes

  const playAudio = () => {
    if (!audioContext || !audioBuffer) return;

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    // Setup Analyser for Visuals
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyserRef.current = analyser;

    source.start(0, pausedAt);
    setStartTime(audioContext.currentTime - pausedAt);
    setSourceNode(source);
    setIsPlaying(true);
    
    // Play Video Sync
    if (videoRef.current) {
       videoRef.current.play().catch(e => console.error("Video play failed", e));
    }
    
    source.onended = () => {
      setIsPlaying(false);
      setPausedAt(0);
      if (videoRef.current) {
         videoRef.current.pause();
         videoRef.current.currentTime = 0;
      }
    };

    drawVisualizer();
  };

  const pauseAudio = () => {
    if (sourceNode && audioContext) {
      sourceNode.stop();
      setPausedAt(audioContext.currentTime - startTime);
      setIsPlaying(false);
    }
    if (videoRef.current) {
       videoRef.current.pause();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const drawVisualizer = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Stylish Waveform
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        
        // Use white/light blue for video overlay visibility
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(129, 140, 248, 0.8)');
        
        ctx.fillStyle = gradient;
        
        const y = (canvas.height - barHeight) / 2;
        ctx.fillRect(x, y, barWidth, barHeight);

        x += barWidth + 1;
      }
    };
    draw();
  };

  // Parse script to display as dialogue
  const scriptLines = script.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden flex flex-col h-full max-h-[700px] w-full max-w-5xl mx-auto animate-fadeIn">
       {/* Header - Video Style */}
       <div className="bg-slate-900 text-white p-4 flex justify-between items-center relative overflow-hidden z-20">
          <div className="relative z-10 flex items-center gap-3">
             <div className="p-2 bg-white/10 rounded-full backdrop-blur-md animate-pulse">
               <Video size={24} className="text-indigo-300" />
             </div>
             <div>
               <h2 className="text-xl font-bold">AI ვიდეო-ლექცია</h2>
               <p className="text-xs text-indigo-200 uppercase tracking-wider">{topicTitle}</p>
             </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="relative z-10 p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">X</button>
          )}
       </div>

       <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-black">
          
          {/* Left: Video Player Area */}
          <div className="w-full lg:w-3/5 bg-black relative flex items-center justify-center group">
             
             {/* Video Background */}
             {videoUrl ? (
                <video 
                   ref={videoRef}
                   src={videoUrl} 
                   className="w-full h-full object-contain"
                   loop 
                   muted 
                   playsInline
                />
             ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-black flex items-center justify-center">
                   {/* Fallback Avatars if no video */}
                   <div className="flex items-center gap-8">
                      <div className={`flex flex-col items-center gap-2 transition-transform duration-300 ${isPlaying ? 'scale-110' : 'scale-100'}`}>
                         <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 p-0.5 shadow-lg">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Host" className="w-full h-full rounded-full bg-white" />
                         </div>
                         <span className="text-xs font-bold text-slate-400">Alex</span>
                      </div>
                      <div className={`flex flex-col items-center gap-2 transition-transform duration-300 ${isPlaying ? 'scale-110' : 'scale-100'}`}>
                         <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 p-0.5 shadow-lg">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Guest" className="w-full h-full rounded-full bg-white" />
                         </div>
                         <span className="text-xs font-bold text-slate-400">Sarah</span>
                      </div>
                   </div>
                </div>
             )}

             {/* Overlays */}
             <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
             
             {/* Visualizer Canvas Overlay */}
             <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center pb-10 pointer-events-none">
                <canvas ref={canvasRef} width="400" height="80" className="w-full max-w-md h-20 opacity-80"></canvas>
             </div>

             {/* Generating States */}
             {(isLoading || isGeneratingVideo) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-20">
                   <div className="relative">
                      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <Sparkles size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-300 animate-pulse" />
                   </div>
                   <p className="text-white font-bold mt-4 animate-pulse">
                      {isGeneratingVideo ? 'იქმნება ვიდეო ახსნა (Veo)...' : 'გენერირდება აუდიო...'}
                   </p>
                </div>
             )}

             {/* API Key Prompt for Video */}
             {!hasApiKey && !isLoading && (
                <div className="absolute top-4 right-4 z-30">
                   <button 
                     onClick={selectApiKey}
                     className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 transition-all"
                   >
                      <Lock size={14} /> ვიდეოს ჩართვა (API Key)
                   </button>
                </div>
             )}

             {/* Play Controls */}
             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={isPlaying ? pauseAudio : playAudio}
                  disabled={isLoading || !audioBuffer}
                  className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white flex items-center justify-center shadow-2xl transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-white/30"
                >
                   {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>
             </div>
          </div>

          {/* Right: Transcript */}
          <div className="w-full lg:w-2/5 bg-white flex flex-col border-l border-slate-200">
             <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                <BookOpen size={18} className="text-indigo-600" />
                <h3 className="font-bold text-slate-700 text-sm uppercase">ტრანსკრიპტი</h3>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
                {isLoading ? (
                   <div className="space-y-4 animate-pulse">
                      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                      <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                   </div>
                ) : (
                   <div className="space-y-6">
                      {scriptLines.map((line, idx) => {
                         const isAlex = line.startsWith('Alex:');
                         return (
                            <div key={idx} className={`flex gap-3 ${isAlex ? 'flex-row' : 'flex-row-reverse'}`}>
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white shadow-sm border-2 border-white ${isAlex ? 'bg-indigo-500' : 'bg-rose-500'}`}>
                                  {isAlex ? 'A' : 'S'}
                               </div>
                               <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${isAlex ? 'bg-slate-50 text-slate-800 rounded-tl-none' : 'bg-indigo-50 text-indigo-900 rounded-tr-none'}`}>
                                  <strong className="block mb-1 text-xs opacity-50 uppercase tracking-wider">{isAlex ? 'Alex' : 'Sarah'}</strong>
                                  {line.replace(/^(Alex:|Sarah:)/, '').trim()}
                               </div>
                            </div>
                         )
                      })}
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};
