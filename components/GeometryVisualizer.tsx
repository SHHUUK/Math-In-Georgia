import React, { useState, useRef, useEffect } from 'react';
import { 
  PencilRuler, Download, ZoomIn, ZoomOut, RotateCcw, Play, CheckCircle2,
  Grid as GridIcon, Upload, Image as ImageIcon, X, Columns, Layers, Eye
} from 'lucide-react';
import { solveGeometryProblem, GeoSolution } from '../services/geminiService';
import { MathRenderer } from './MathRenderer';

interface GeometryVisualizerProps {
  onAddXp?: (amount: number, reason?: string) => void;
}

export const GeometryVisualizer: React.FC<GeometryVisualizerProps> = ({ onAddXp }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<GeoSolution | null>(null);
  
  // Interaction State
  const [viewBox, setViewBox] = useState("0 0 800 600"); // Dynamic ViewBox
  const [selectedPoint, setSelectedPoint] = useState<{shapeId: string, pointIndex: number} | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  
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

  // Sync ViewBox from Data or Auto-Fit
  useEffect(() => {
    if (data && data.viewBox) {
       setViewBox(data.viewBox);
    } else {
       setViewBox("0 0 800 600");
    }
  }, [data]);

  const handleSolve = async () => {
    if (!input.trim() && !userImage) return;
    setIsLoading(true);
    // Pass userImage if available, stripped of prefix
    const imgData = userImage ? userImage.split(',')[1] : undefined;
    const result = await solveGeometryProblem(input, imgData);
    if (result) {
      setData(result);
      // GAMIFICATION: Award XP
      if (onAddXp) onAddXp(20, 'გეომეტრიული ამოცანის ამოხსნა');
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

  // --- INTERACTION LOGIC (PAN, ZOOM, DRAG) ---

  const handleMouseDown = (e: React.MouseEvent, shapeId?: string, pointIndex?: number) => {
    // Stop propagation if clicking on UI controls
    if ((e.target as HTMLElement).closest('button')) return;

    if (shapeId !== undefined && pointIndex !== undefined) {
      // Logic for Dragging a Point
      e.stopPropagation(); // Don't trigger pan
      setSelectedPoint({ shapeId, pointIndex });
    } else {
      // Logic for Panning the Canvas
      setIsPanning(true);
      setStartPan({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!svgRef.current) return;

    // 1. POINT DRAGGING
    if (selectedPoint && data) {
      // Convert Screen to SVG Coordinates using Matrix
      const CTM = svgRef.current.getScreenCTM();
      if (!CTM) return;
      
      const mouseX = (e.clientX - CTM.e) / CTM.a;
      const mouseY = (e.clientY - CTM.f) / CTM.d;

      // Grid Snap (20px)
      const snap = 10;
      const x = Math.round(mouseX / snap) * snap;
      const y = Math.round(mouseY / snap) * snap;

      const newData = { ...data };
      const shape = newData.shapes.find(s => s.id === selectedPoint.shapeId);
      if (shape && shape.points) {
        shape.points[selectedPoint.pointIndex].x = x;
        shape.points[selectedPoint.pointIndex].y = y;
        setData(newData);
      }
      return;
    }

    // 2. CANVAS PANNING
    if (isPanning) {
      const dx = e.clientX - startPan.x;
      const dy = e.clientY - startPan.y;
      
      const [vx, vy, vw, vh] = viewBox.split(' ').map(Number);
      const svgRect = svgRef.current.getBoundingClientRect();
      
      // Convert pixel delta to viewbox units
      const scaleX = vw / svgRect.width;
      const scaleY = vh / svgRect.height;
      
      const newX = vx - dx * scaleX;
      const newY = vy - dy * scaleY;
      
      setViewBox(`${newX} ${newY} ${vw} ${vh}`);
      setStartPan({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setSelectedPoint(null);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!svgRef.current) return;
    e.preventDefault(); // Stop page scroll

    const [vx, vy, vw, vh] = viewBox.split(' ').map(Number);
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    
    // Limits
    const newW = vw * zoomFactor;
    const newH = vh * zoomFactor;
    
    // Zoom towards center
    const dx = (vw - newW) / 2;
    const dy = (vh - newH) / 2;

    setViewBox(`${vx + dx} ${vy + dy} ${newW} ${newH}`);
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
    const newW = w * 0.8;
    const newH = h * 0.8;
    const newX = x + (w - newW) / 2;
    const newY = y + (h - newH) / 2;
    setViewBox(`${newX} ${newY} ${newW} ${newH}`);
  };

  const handleZoomOut = () => {
    const [x, y, w, h] = viewBox.split(' ').map(Number);
    const newW = w * 1.2;
    const newH = h * 1.2;
    const newX = x - (newW - w) / 2;
    const newY = y - (newH - h) / 2;
    setViewBox(`${newX} ${newY} ${newW} ${newH}`);
  };

  const handleResetView = () => {
    if (data && data.viewBox) {
       setViewBox(data.viewBox); 
    } else {
       setViewBox("0 0 800 600");
    }
  };

  const renderCanvas = (withOverlay: boolean) => (
    <div className="relative w-full h-full bg-white overflow-hidden flex flex-col rounded-2xl border border-slate-200 shadow-inner group">
       {/* Canvas Controls */}
       <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <button onClick={handleZoomIn} className="p-2 bg-white rounded-lg shadow-sm border hover:bg-slate-50 text-slate-600"><ZoomIn size={20}/></button>
          <button onClick={handleZoomOut} className="p-2 bg-white rounded-lg shadow-sm border hover:bg-slate-50 text-slate-600"><ZoomOut size={20}/></button>
          <button onClick={handleResetView} className="p-2 bg-white rounded-lg shadow-sm border hover:bg-slate-50 text-slate-600"><RotateCcw size={20}/></button>
       </div>

       <div 
         className={`flex-1 overflow-hidden bg-slate-50/50 flex items-center justify-center ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
         onMouseDown={(e) => handleMouseDown(e)}
         onMouseMove={handleMouseMove}
         onMouseUp={handleMouseUp}
         onMouseLeave={handleMouseUp}
         onWheel={handleWheel}
       >
          {(!data && !userImage && !withOverlay) ? (
             <div className="text-center text-slate-400 select-none pointer-events-none">
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
               className="bg-white shadow-sm w-full h-full touch-none"
             >
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
                  </pattern>
                </defs>
                
                {showGrid && <rect x={-5000} y={-5000} width="20000" height="20000" fill="url(#grid)" style={{pointerEvents: 'none'}} />}

                {/* Background User Image Layer (Only in Overlay Mode) */}
                {withOverlay && userImage && (
                  <image 
                    href={userImage} 
                    x="0" y="0" 
                    width="800" height="600" 
                    opacity="0.5"
                    preserveAspectRatio="xMidYMid meet"
                    style={{pointerEvents: 'none'}}
                  />
                )}

                {/* 1. Angle Arcs */}
                {data?.arcs?.map((arc, i) => (
                   <path 
                     key={`arc-${i}`}
                     d={arc.d} 
                     stroke={arc.color || "red"} 
                     strokeWidth="2" 
                     fill="none" 
                     opacity="0.8"
                     style={{pointerEvents: 'none'}}
                   />
                ))}

                {/* 2. Geometric Shapes */}
                {data?.shapes?.map(shape => (
                  <g key={shape.id}>
                      {/* Render Shape */}
                      {shape.type === 'polygon' && shape.points && (
                        <polygon 
                          points={shape.points.map(p => `${p.x},${p.y}`).join(' ')}
                          fill="rgba(79, 70, 229, 0.05)"
                          stroke="#4f46e5"
                          strokeWidth="2.5"
                          style={{pointerEvents: 'none'}}
                        />
                      )}
                      {shape.type === 'line' && shape.points && (
                        <polyline
                            points={shape.points.map(p => `${p.x},${p.y}`).join(' ')}
                            fill="none"
                            stroke="#4f46e5"
                            strokeWidth="2.5"
                            style={{pointerEvents: 'none'}}
                        />
                      )}
                      {shape.type === 'circle' && shape.points && (
                         // Simple circle: First point center, radius derived from second point or prop
                         <circle 
                            cx={shape.points[0].x} 
                            cy={shape.points[0].y}
                            r={shape.points[1] ? Math.hypot(shape.points[1].x - shape.points[0].x, shape.points[1].y - shape.points[0].y) : 50}
                            fill="none"
                            stroke="#4f46e5"
                            strokeWidth="2.5"
                            style={{pointerEvents: 'none'}}
                         />
                      )}

                      {/* Render Vertices & Labels */}
                      {shape.points?.map((p, idx) => (
                        <g 
                          key={idx} 
                          onMouseDown={(e) => handleMouseDown(e, shape.id, idx)} 
                          style={{cursor: 'pointer'}}
                          className="hover:opacity-80"
                        >
                            <circle cx={p.x} cy={p.y} r="6" fill="white" stroke="#4f46e5" strokeWidth="2" />
                            {p.label && (
                              <text 
                                x={p.x + 10} 
                                y={p.y - 10} 
                                fontSize="18" 
                                fontWeight="bold" 
                                fill="#1e293b"
                                style={{ textShadow: "0px 0px 4px white", pointerEvents: 'none' }}
                              >
                                {p.label}
                              </text>
                            )}
                        </g>
                      ))}
                  </g>
                ))}

                {/* 3. Measurements (Sides & Angles Text) */}
                {data?.measurements?.map((m, i) => (
                   <text 
                     key={`meas-${i}`}
                     x={m.x} 
                     y={m.y} 
                     textAnchor="middle" 
                     fontSize={m.type === 'angle' ? '14' : '16'}
                     fill={m.type === 'angle' ? '#dc2626' : '#0f172a'}
                     fontWeight="bold"
                     style={{ textShadow: "0px 0px 4px white", pointerEvents: 'none' }}
                   >
                      {m.text}
                   </text>
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
               <PencilRuler className="text-indigo-600" /> გეომეტრიის არქიტექტორი
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
                  placeholder="მაგ: დახაზე სამკუთხედი ABC, სადაც AB=10, კუთხე B=60..."
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
                     {data.steps?.map((step, idx) => (
                        <div key={idx} className="flex gap-3 relative z-10">
                           <div className="w-6 h-6 rounded-full bg-indigo-50 border-2 border-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                             {idx + 1}
                           </div>
                           <p className="text-slate-700 text-xs pt-1"><MathRenderer text={step} inline /></p>
                        </div>
                     ))}
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