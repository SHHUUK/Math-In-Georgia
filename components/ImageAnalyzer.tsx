import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, Loader2, CheckCircle, Bot, RefreshCcw, Lightbulb, ZoomIn, ZoomOut, Maximize2, PenTool, LayoutTemplate, ScanEye } from 'lucide-react';
import { analyzeImageWithGemini, generateSimilarProblem, solveGeometryProblem, GeoSolution } from '../services/geminiService';
import { MathRenderer } from './MathRenderer';

interface ImageAnalyzerProps {
  onAddXp?: (amount: number, reason?: string) => void;
}

export const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ onAddXp }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  
  // Analysis State
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [reconstruction, setReconstruction] = useState<GeoSolution | null>(null);
  const [practiceProblem, setPracticeProblem] = useState<string | null>(null);
  
  // Loading State
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPractice, setIsGeneratingPractice] = useState(false);
  
  // View State
  const [activeTab, setActiveTab] = useState<'text' | 'reconstruction'>('text');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [reconViewBox, setReconViewBox] = useState("0 0 800 600");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Paste Event Listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            const blob = items[i].getAsFile();
            if (blob) {
              const reader = new FileReader();
              reader.onloadend = () => {
                const result = reader.result as string;
                setSelectedImage(result);
                setMimeType(blob.type);
                resetAnalysis();
              };
              reader.readAsDataURL(blob);
            }
            break;
          }
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  // Center Reconstruction on Load
  useEffect(() => {
    if (reconstruction && reconstruction.shapes && reconstruction.shapes.length > 0) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      let hasPoints = false;

      reconstruction.shapes.forEach(shape => {
        if (shape.points) {
          shape.points.forEach(p => {
            hasPoints = true;
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
          });
        }
      });

      if (hasPoints) {
        const padding = 60;
        const width = Math.max(maxX - minX + (padding * 2), 400);
        const height = Math.max(maxY - minY + (padding * 2), 300);
        const centerX = minX - padding + (width - (maxX - minX + padding * 2)) / 2;
        const centerY = minY - padding + (height - (maxY - minY + padding * 2)) / 2;
        setReconViewBox(`${minX - padding} ${minY - padding} ${width} ${height}`);
      }
    }
  }, [reconstruction]);

  const resetAnalysis = () => {
    setAnalysis(null);
    setReconstruction(null);
    setPracticeProblem(null);
    setActiveTab('text');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        setMimeType(file.type);
        resetAnalysis();
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const clearImage = () => {
    setSelectedImage(null);
    resetAnalysis();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedImage || !mimeType) return;
    setIsLoading(true);
    setPracticeProblem(null);
    
    try {
      const base64Data = selectedImage.split(',')[1];
      
      // Call both services in parallel: Text Analysis & Geometry Reconstruction
      const [textResult, geoResult] = await Promise.all([
        analyzeImageWithGemini(base64Data, mimeType),
        solveGeometryProblem("", base64Data) // Empty string signals reconstruction mode
      ]);

      setAnalysis(textResult);
      setReconstruction(geoResult);
      
      // Auto-switch to reconstruction tab if text is short but geometry is found
      if (geoResult && geoResult.shapes.length > 0) {
         // Optionally notify user
      }

      // GAMIFICATION: Award XP
      if (onAddXp) onAddXp(40, 'ფოტოს დეტალური ანალიზი');
      
    } catch (error) {
      console.error("Analysis failed", error);
      setAnalysis("შეცდომა ანალიზის დროს. გთხოვთ სცადოთ თავიდან.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePractice = async () => {
    if (!analysis) return;
    setIsGeneratingPractice(true);
    const problem = await generateSimilarProblem(analysis);
    setPracticeProblem(problem);
    setIsGeneratingPractice(false);
  };

  // Zoom Logic for Reconstruction
  const zoomRecon = (factor: number) => {
    const [x, y, w, h] = reconViewBox.split(' ').map(Number);
    const newW = w * factor;
    const newH = h * factor;
    const newX = x + (w - newW) / 2;
    const newY = y + (h - newH) / 2;
    setReconViewBox(`${newX} ${newY} ${newW} ${newH}`);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Image Zoom Modal */}
      {isImageModalOpen && selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
           <div className="flex justify-end p-4">
              <button onClick={() => setIsImageModalOpen(false)} className="text-white hover:text-red-400 transition-colors p-2 bg-white/10 rounded-full"><X size={32}/></button>
           </div>
           <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
              <img src={selectedImage} alt="Full View" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
           </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <ScanEye className="w-6 h-6" />
          ვიზუალური ანალიზი & რეკონსტრუქცია
        </h2>
        <p className="text-indigo-100 max-w-xl">
          ატვირთეთ მათემატიკური ამოცანის ფოტო. Gemini გააანალიზებს მას და შექმნის ზუსტ გეომეტრიულ ასლს.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* LEFT COLUMN: Input & Preview */}
        <div className="flex flex-col gap-4">
          <div 
            className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 relative transition-all duration-300 min-h-[300px] overflow-hidden group ${
              selectedImage 
                ? 'border-indigo-300 bg-slate-900' 
                : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'
            }`}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

            {selectedImage ? (
              <>
                <img src={selectedImage} alt="Uploaded problem" className="w-full h-full object-contain rounded-lg opacity-90 group-hover:opacity-100 transition-opacity" />
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                   <button onClick={() => setIsImageModalOpen(true)} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-indigo-600 transition-all transform hover:scale-110" title="გადიდება">
                      <Maximize2 size={24} />
                   </button>
                   <button onClick={clearImage} className="p-3 bg-red-500/80 backdrop-blur-md rounded-full text-white hover:bg-red-600 transition-all transform hover:scale-110" title="წაშლა">
                      <X size={24} />
                   </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <Upload size={32} />
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-700">ატვირთეთ ფოტო</p>
                  <p className="text-sm text-slate-500 mt-1">PNG, JPG ან Paste (Ctrl+V)</p>
                </div>
                <button onClick={triggerUpload} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                  ფაილის არჩევა
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!selectedImage || isLoading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <><Loader2 className="animate-spin" /> მუშავდება...</> : <><CheckCircle /> გაანალიზება</>}
          </button>
        </div>

        {/* RIGHT COLUMN: Results (Tabs) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[600px] lg:h-auto">
          {/* Tabs Header */}
          <div className="flex border-b border-slate-200">
             <button 
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'text' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'bg-slate-50 text-slate-500 hover:text-slate-700'}`}
             >
                <LayoutTemplate size={18} /> ტექსტური ანალიზი
             </button>
             <button 
                onClick={() => setActiveTab('reconstruction')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'reconstruction' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'bg-slate-50 text-slate-500 hover:text-slate-700'}`}
             >
                <PenTool size={18} /> ვიზუალური რეკონსტრუქცია
                {reconstruction && <span className="bg-green-500 w-2 h-2 rounded-full"></span>}
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 custom-scrollbar relative">
             
             {/* Content: Text Analysis */}
             {activeTab === 'text' && (
                analysis ? (
                  <div className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-300">
                     <div className="prose prose-indigo max-w-none text-slate-700 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                       <MathRenderer text={analysis} />
                     </div>

                     <div className="pt-2">
                        {!practiceProblem ? (
                          <button 
                            onClick={handleGeneratePractice}
                            disabled={isGeneratingPractice}
                            className="w-full py-3 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                          >
                             {isGeneratingPractice ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}
                             მსგავსი მაგალითის გენერირება
                          </button>
                        ) : (
                          <div className="bg-green-50 p-5 rounded-xl border border-green-200 animate-in fade-in slide-in-from-bottom-4">
                             <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                                <Lightbulb size={20} />
                                ივარჯიშე:
                             </h4>
                             <div className="text-green-900 font-medium">
                               <MathRenderer text={practiceProblem} />
                             </div>
                          </div>
                        )}
                     </div>
                  </div>
                ) : (
                  <EmptyState message="ატვირთეთ ფოტო და დააჭირეთ ანალიზს ტექსტური ახსნის მისაღებად." />
                )
             )}

             {/* Content: Reconstruction */}
             {activeTab === 'reconstruction' && (
                reconstruction ? (
                   <div className="h-full flex flex-col animate-in slide-in-from-right-4 fade-in duration-300">
                      <div className="bg-white rounded-xl border border-slate-200 shadow-inner flex-1 relative overflow-hidden">
                         
                         {/* Reconstruction Canvas */}
                         <svg 
                           width="100%" 
                           height="100%" 
                           viewBox={reconViewBox} 
                           preserveAspectRatio="xMidYMid meet"
                           className="w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]"
                         >
                            {reconstruction.shapes?.map((shape, idx) => (
                               <g key={shape.id || idx}>
                                  {shape.type === 'polygon' && shape.points && (
                                    <polygon 
                                      points={shape.points.map(p => `${p.x},${p.y}`).join(' ')}
                                      fill="rgba(79, 70, 229, 0.1)"
                                      stroke="#4f46e5"
                                      strokeWidth="3"
                                      vectorEffect="non-scaling-stroke"
                                    />
                                  )}
                                  {shape.type === 'line' && shape.points && (
                                    <polyline
                                        points={shape.points.map(p => `${p.x},${p.y}`).join(' ')}
                                        fill="none"
                                        stroke="#4f46e5"
                                        strokeWidth="3"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                  )}
                                  {shape.type === 'circle' && shape.points && shape.points.length >= 2 && (
                                     // Simple circle approximation if provided as center + radius point
                                     <circle 
                                        cx={shape.points[0].x} 
                                        cy={shape.points[0].y} 
                                        r={Math.sqrt(Math.pow(shape.points[1].x - shape.points[0].x, 2) + Math.pow(shape.points[1].y - shape.points[0].y, 2))}
                                        fill="none"
                                        stroke="#4f46e5"
                                        strokeWidth="3"
                                        vectorEffect="non-scaling-stroke"
                                     />
                                  )}
                                  {shape.points?.map((p, pIdx) => (
                                    <g key={pIdx}>
                                        <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#4f46e5" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                                        <text x={p.x + 10} y={p.y - 10} fontSize="20" fontWeight="bold" fill="#1e293b">{p.label}</text>
                                    </g>
                                  ))}
                               </g>
                            ))}
                         </svg>

                         {/* Zoom Controls */}
                         <div className="absolute top-4 right-4 flex flex-col gap-2">
                            <button onClick={() => zoomRecon(0.8)} className="p-2 bg-white rounded-lg shadow border border-slate-200 hover:bg-slate-50 text-slate-600"><ZoomIn size={20}/></button>
                            <button onClick={() => zoomRecon(1.2)} className="p-2 bg-white rounded-lg shadow border border-slate-200 hover:bg-slate-50 text-slate-600"><ZoomOut size={20}/></button>
                         </div>
                      </div>
                      
                      <div className="mt-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-sm text-indigo-800">
                         <strong>AI შენიშვნა:</strong> ეს არის სურათზე ნაპოვნი გეომეტრიის ციფრული რეკონსტრუქცია. ის გეხმარებათ ფიგურის სუფთა სახით აღქმაში.
                      </div>
                   </div>
                ) : (
                   <EmptyState message={analysis ? "ამ ამოცანაში გეომეტრიული ფიგურები ვერ მოიძებნა." : "ატვირთეთ ფოტო რეკონსტრუქციისთვის."} icon={analysis ? <XCircle size={48} className="text-red-300"/> : undefined} />
                )
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ message, icon }: { message: string, icon?: React.ReactNode }) => (
  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 min-h-[200px] animate-in fade-in">
    {icon || <Bot size={64} className="opacity-20" />}
    <p className="text-center max-w-xs">{message}</p>
  </div>
);

const XCircle = ({size, className}: {size: number, className?: string}) => (
   <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
);
