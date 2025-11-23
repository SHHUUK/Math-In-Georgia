
import React, { useState, useRef, useEffect } from 'react';
import { 
  PencilRuler, Download, ZoomIn, ZoomOut, RotateCcw, Play, CheckCircle2,
  Grid as GridIcon, Upload, Image as ImageIcon, X, Columns, Layers, Eye
} from 'lucide-react';
import { solveGeometryProblem, GeoSolution } from '../services/geminiService';
import { MathRenderer } from './MathRenderer';

export const GeometryVisualizer: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<GeoSolution | null>(null);
  
  // Interaction State
  const [viewBox, setViewBox] = useState("0 0 800 600"); // Dynamic ViewBox
  const [selectedPoint, setSelectedPoint] = useState<{shapeId: string, pointIndex: number} | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [measurements, setMeasurements] = useState<string[]>([]);
  
  // Image & View State
  const [userImage, setUserImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'drawing' | 'photo' | 'overlay'>('drawing');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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
                setUserImage(reader.result as string);
                setViewMode('split'); // Switch to split view on paste
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

  // Auto-Fit Logic: When data changes, calculate bounds and center the view
  useEffect(() => {
    if (data && data.shapes.length > 0) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      
      data.shapes.forEach(shape => {
        shape.points.forEach(p => {
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        });
      });

      // Add padding
      const padding = 60;
      const width = maxX - minX + (padding * 2);
      const height = maxY - minY + (padding * 2);
      
      // Ensure minimum size to prevent extreme zoom on single points
      const finalWidth = Math.max(width, 400);
      const finalHeight = Math.max(height, 300);
      
      // Center the content
      const centerX = minX - padding + (width - finalWidth) / 2;
      const centerY = minY - padding + (height - finalHeight) / 2;

      setViewBox(`${centerX} ${centerY} ${finalWidth} ${finalHeight}`);
    } else {
      setViewBox("0 0 800 600");
    }
    
    updateMeasurements();
  }, [data]);

  // Helper: Distance between two points
  const dist = (p1: {x:number, y:number}, p2: {x:number, y:number}) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  // Helper: Update Measurements based on current shape state
  const updateMeasurements = () => {
    if (!data) return;
    const notes: string[] = [];

    data.shapes.forEach(shape => {
      if (shape.type === 'polygon' || shape.type === 'line') {
        for (let i = 0; i < shape.points.length; i++) {
          const p1 = shape.points[i];
          const p2 = shape.points[(i + 1) % shape.points.length];
          // Don't close line loop
          if (shape.type === 'line' && i === shape.points.length - 1) continue;
          
          const d = dist(p1, p2);
          // Scale pixel distance to approximate "units" (e.g., 50px = 1 unit)
          const units = (d / 50).toFixed(1); 
          notes.push(`${p1.label.split(' ')[0]}${p2.label.split(' ')[0]} = ${units}`);
        }
      }
    });
    setMeasurements(notes);
  };

  const handleSolve = async () => {
    if (!input.trim() && !userImage) return;
    setIsLoading(true);
    // Pass userImage if available, stripped of prefix
    const imgData = userImage ? userImage.split(',')[1] : undefined;
    const result = await solveGeometryProblem(input, imgData);
    if (result) {
      setData(result);
    }
    setIsLoading(false);
  };

  // Image File Handling
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
        setViewMode('split'); // Auto switch
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag Logic
  const handleMouseDown = (shapeId: string, pointIndex: number) => {
    setSelectedPoint({ shapeId, pointIndex });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectedPoint || !data || !svgRef.current) return;
    
    // Convert Screen to SVG Coordinates using Matrix
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return;
    
    const mouseX = (e.clientX - CTM.e) / CTM.a;
    const mouseY = (e.clientY - CTM.f) / CTM.d;

    // Grid Snap (20px)
    const snap = 20;
    const x = Math.round(mouseX / snap) * snap;
    const y = Math.round(mouseY / snap) * snap;

    const newData = { ...data };
    const shape = newData.shapes.find(s => s.id === selectedPoint.shapeId);
    if (shape) {
      shape.points[selectedPoint.pointIndex].x = x;
      shape.points[selectedPoint.pointIndex].y = y;
      setData(newData);
    }
  };

  const handleMouseUp = () => {
    setSelectedPoint(null);
  };

  const exportSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "geometry_problem.svg";
    link.click();
  };

  // Manual Zoom Controls
  const handleZoomIn = () => {
    const [x, y, w, h] = viewBox.split(' ').map(Number);
    const newW = w * 0.9;
    const newH = h * 0.9;
    const newX = x + (w - newW) / 2;
    const newY = y + (h - newH) / 2;
    setViewBox(`${newX} ${newY} ${newW} ${newH}`);
  };

  const handleZoomOut = () => {
    const [x, y, w, h] = viewBox.split(' ').map(Number);
    const newW = w * 1.1;
    const newH = h * 1.1;
    const newX = x - (newW - w) / 2;
    const newY = y - (newH - h) / 2;
    setViewBox(`${newX} ${newY} ${newW} ${newH}`);
  };

  const handleResetView = () => {
    // Trigger useEffect logic again by creating a new object ref, or just reset to default if empty
    if (data) {
       setData({...data}); // Force re-calc bounds
    } else {
       setViewBox("0 0 800 600");
    }
  };

  const renderCanvas = (withOverlay: boolean) => (
    <div className="relative w-full h-full bg-white overflow-hidden flex flex-col rounded-2xl border border-slate-200 shadow-inner">
       {/* Canvas Controls */}
       <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <button onClick={handleZoomIn} className="p-2 bg-white rounded-lg shadow-sm border hover:bg-slate-50 text-slate-600"><ZoomIn size={20}/></button>
          <button onClick={handleZoomOut} className="p-2 bg-white rounded-lg shadow-sm border hover:bg-slate-50 text-slate-600"><ZoomOut size={20}/></button>
          <button onClick={handleResetView} className="p-2 bg-white rounded-lg shadow-sm border hover:bg-slate-50 text-slate-600"><RotateCcw size={20}/></button>
       </div>

       <div className="flex-1 overflow-hidden bg-slate-50/50 flex items-center justify-center cursor-crosshair">
          {(!data && !userImage && !withOverlay) ? (
             <div className="text-center text-slate-400">
                <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
                <p>ტილო ცარიელია.</p>
             </div>
          ) : (
             <svg 
               ref={svgRef}
               width="100%" 
               height="100%" 
               viewBox={viewBox}
               preserveAspectRatio="xMidYMid meet"
               className="bg-white shadow-sm w-full h-full"
               onMouseMove={handleMouseMove}
               onMouseUp={handleMouseUp}
               onMouseLeave={handleMouseUp}
             >
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
                  </pattern>
                </defs>
                
                {showGrid && <rect x={-5000} y={-5000} width="10000" height="10000" fill="url(#grid)" />}

                {/* Background User Image Layer (Only in Overlay Mode) */}
                {withOverlay && userImage && (
                  <image 
                    href={userImage} 
                    x="0" y="0" 
                    width="800" height="600" 
                    opacity="0.5"
                    preserveAspectRatio="xMidYMid meet"
                  />
                )}

                {/* Geometric Shapes Layer */}
                {data?.shapes.map(shape => (
                  <g key={shape.id}>
                      {/* Render Shape */}
                      {shape.type === 'polygon' && (
                        <polygon 
                          points={shape.points.map(p => `${p.x},${p.y}`).join(' ')}
                          fill="rgba(79, 70, 229, 0.1)"
                          stroke="#4f46e5"
                          strokeWidth="2"
                        />
                      )}
                      {shape.type === 'line' && (
                        <polyline
                            points={shape.points.map(p => `${p.x},${p.y}`).join(' ')}
                            fill="none"
                            stroke="#4f46e5"
                            strokeWidth="2"
                        />
                      )}

                      {/* Render Points & Labels */}
                      {shape.points.map((p, idx) => (
                        <g key={idx} onMouseDown={() => handleMouseDown(shape.id, idx)} style={{cursor: 'grab'}}>
                            <circle cx={p.x} cy={p.y} r="6" fill="white" stroke="#4f46e5" strokeWidth="2" />
                            <text 
                              x={p.x + 12} 
                              y={p.y - 12} 
                              fontSize="16" 
                              fontWeight="bold" 
                              fill="#1e293b"
                              style={{ textShadow: "0px 0px 3px white" }}
                            >
                              {p.label}
                            </text>
                        </g>
                      ))}
                  </g>
                ))}
             </svg>
          )}
       </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans text-slate-900 p-4 md:p-8 animate-fadeIn">
       
       {/* Header */}
       <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-900">
               <PencilRuler className="text-indigo-600" /> გეომეტრია
            </h1>
          </div>
          
          {/* View Mode Controls */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button onClick={() => setViewMode('split')} title="გაყოფილი ხედი" className={`p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${viewMode === 'split' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:bg-slate-200'}`}>
                <Columns size={18} /> <span className="hidden md:inline">ორივე</span>
             </button>
             <button onClick={() => setViewMode('drawing')} title="მხოლოდ ნახაზი" className={`p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${viewMode === 'drawing' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:bg-slate-200'}`}>
                <PencilRuler size={18} /> <span className="hidden md:inline">ნახაზი</span>
             </button>
             <button onClick={() => setViewMode('photo')} title="მხოლოდ ფოტო" className={`p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${viewMode === 'photo' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:bg-slate-200'}`}>
                <ImageIcon size={18} /> <span className="hidden md:inline">ფოტო</span>
             </button>
             <button onClick={() => setViewMode('overlay')} title="გადაფარვა" className={`p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${viewMode === 'overlay' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:bg-slate-200'}`}>
                <Layers size={18} /> <span className="hidden md:inline">Overlay</span>
             </button>
          </div>

          <div className="flex gap-2">
             <button onClick={() => setShowGrid(!showGrid)} className={`p-3 rounded-xl border ${showGrid ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`} title="Grid">
               <GridIcon size={20} />
             </button>
             <button onClick={exportSvg} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600" title="Export">
               <Download size={20} />
             </button>
          </div>
       </div>

       <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
          
          {/* Left Panel: Input & Steps */}
          <div className="w-full lg:w-80 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 shrink-0">
             
             {/* Input Area */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">ამოცანის პირობა</label>
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 resize-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all mb-4 text-sm"
                  placeholder="მაგ: დახაზე სამკუთხედი..."
                />
                
                {/* Image Upload Control */}
                <div className="flex items-center gap-2 mb-4">
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className={`flex-1 py-2 px-4 rounded-xl border-dashed border-2 flex items-center justify-center gap-2 transition-all text-sm ${userImage ? 'border-green-300 bg-green-50 text-green-700' : 'border-slate-300 text-slate-500 hover:border-indigo-300 hover:bg-slate-50'}`}
                   >
                     {userImage ? <CheckCircle2 size={16}/> : <Upload size={16}/>}
                     {userImage ? 'ატვირთულია' : 'ატვირთე ფოტო'}
                   </button>
                   {userImage && (
                     <button onClick={() => { setUserImage(null); setViewMode('drawing'); }} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100">
                       <X size={20} />
                     </button>
                   )}
                </div>

                <button 
                  onClick={handleSolve}
                  disabled={isLoading || (!input.trim() && !userImage)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> მუშავდება...</> : <><Play size={18} fill="currentColor"/> ამოხსნა</>}
                </button>
             </div>

             {/* Steps & Solution */}
             {data && (
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex-1">
                  <div className="mb-4">
                     <h3 className="font-bold text-md text-slate-800 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" /> ახსნა
                     </h3>
                     <p className="text-slate-600 mt-2 text-sm leading-relaxed">{data.explanation}</p>
                  </div>
                  
                  <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-3">ნაბიჯები</h3>
                  <div className="space-y-3 relative">
                     <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
                     {data.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-3 relative z-10">
                           <div className="w-6 h-6 rounded-full bg-indigo-50 border-2 border-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                             {idx + 1}
                           </div>
                           <p className="text-slate-700 text-xs pt-1"><MathRenderer text={step} inline /></p>
                        </div>
                     ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100">
                     <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-3">გაზომვები</h3>
                     <div className="grid grid-cols-2 gap-2">
                        {measurements.map((m, i) => (
                           <div key={i} className="bg-slate-50 px-3 py-2 rounded-lg text-xs font-mono text-indigo-600 font-bold border border-slate-100 text-center">
                              {m}
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
             )}
          </div>

          {/* Right Panel: VISUAL AREA */}
          <div className="flex-1 flex gap-4 relative h-full">
             
             {/* MODE: SPLIT VIEW (Photo Left, Drawing Right) */}
             {viewMode === 'split' && (
                <>
                   <div className="w-1/2 bg-slate-900/5 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden relative">
                      <span className="absolute top-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-md">ორიგინალი ფოტო</span>
                      {userImage ? (
                         <img src={userImage} alt="User Problem" className="max-w-full max-h-full object-contain" />
                      ) : (
                         <div className="text-slate-400 flex flex-col items-center gap-2">
                            <ImageIcon size={32} />
                            <span className="text-sm">ფოტო არ არის</span>
                         </div>
                      )}
                   </div>
                   <div className="w-1/2">
                      {renderCanvas(false)}
                   </div>
                </>
             )}

             {/* MODE: DRAWING ONLY */}
             {viewMode === 'drawing' && (
                <div className="w-full h-full">
                   {renderCanvas(false)}
                </div>
             )}

             {/* MODE: PHOTO ONLY */}
             {viewMode === 'photo' && (
                <div className="w-full h-full bg-slate-900/5 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden">
                   {userImage ? (
                      <img src={userImage} alt="User Problem" className="max-w-full max-h-full object-contain" />
                   ) : (
                      <div className="text-slate-400 flex flex-col items-center gap-2">
                         <ImageIcon size={48} />
                         <span>ფოტო არ არის ატვირთული</span>
                      </div>
                   )}
                </div>
             )}

             {/* MODE: OVERLAY (Stacked) */}
             {viewMode === 'overlay' && (
                <div className="w-full h-full">
                   {renderCanvas(true)}
                </div>
             )}

          </div>
       </div>
    </div>
  );
};
