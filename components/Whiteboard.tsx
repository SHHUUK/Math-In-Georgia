
import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { 
  Pen, Eraser, Hand, Trash2, Grid3X3, Download, 
  Plus, SigmaSquare, X, Circle, Maximize,
  RotateCcw, MousePointer2, Sigma, TrendingUp,
  Undo, Redo, Check, Divide
} from 'lucide-react';

// Types for the Infinite Canvas System
type Point = { x: number; y: number };
type Stroke = {
  type: 'draw' | 'eraser';
  points: Point[];
  color: string;
  width: number;
};
type MathObject = {
  type: 'function' | 'point' | 'shape';
  data: any;
  color: string;
  id: string;
};
type ViewState = {
  scale: number;
  offsetX: number;
  offsetY: number;
};
type HistoryState = {
  strokes: Stroke[];
  mathObjects: MathObject[];
};

// CONSTANTS
const GRID_SIZE = 50; // 1 Math Unit = 50 Pixels
const BG_COLORS = {
  light: '#ffffff',
  dark: '#09090b', // Deep black/zinc
  paper: '#fefce8'
};

export const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Offscreen buffer for strokes (prevents eraser from killing grid)
  const bufferCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  
  // Canvas State
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [mathObjects, setMathObjects] = useState<MathObject[]>([]);
  const [view, setView] = useState<ViewState>({ scale: 1, offsetX: 0, offsetY: 0 });
  
  // History System
  const [history, setHistory] = useState<HistoryState[]>([{ strokes: [], mathObjects: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'hand'>('pen');
  const [color, setColor] = useState('#4f46e5');
  const [brushSize, setBrushSize] = useState(3);
  const [eraserSize, setEraserSize] = useState(20);
  
  // UI State
  const [showGrid, setShowGrid] = useState(true);
  const [bgType, setBgType] = useState<'light' | 'dark' | 'paper'>('light');
  const [showMathPanel, setShowMathPanel] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null); // ID of button showing success
  
  // Inputs
  const [funcInput, setFuncInput] = useState('x^2');
  const [coordInput, setCoordInput] = useState({ x: '1', y: '1' });

  // --- History Logic ---
  const addToHistory = useCallback(() => {
    const currentState = { strokes, mathObjects };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);
    
    // Limit history size to prevent memory issues
    if (newHistory.length > 50) newHistory.shift();
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [strokes, mathObjects, history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setStrokes(prevState.strokes);
      setMathObjects(prevState.mathObjects);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setStrokes(nextState.strokes);
      setMathObjects(nextState.mathObjects);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, historyIndex]);


  // --- Coordinate Conversions ---
  const toWorld = (screenX: number, screenY: number) => ({
    x: (screenX - view.offsetX) / view.scale,
    y: (screenY - view.offsetY) / view.scale
  });

  const toScreen = (worldX: number, worldY: number) => ({
    x: worldX * view.scale + view.offsetX,
    y: worldY * view.scale + view.offsetY
  });

  const resetView = () => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setView({ scale: 1, offsetX: width / 2, offsetY: height / 2 });
    }
  };

  useEffect(() => { resetView(); }, []);

  // --- Rendering Engine ---
  const render = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !containerRef.current) return;

    // 1. Setup Dimensions
    const { width, height } = containerRef.current.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      
      // Also resize buffer canvas
      bufferCanvasRef.current.width = width * dpr;
      bufferCanvasRef.current.height = height * dpr;
    }

    // 2. Fill Background
    const currentBgColor = BG_COLORS[bgType];
    ctx.fillStyle = currentBgColor;
    ctx.fillRect(0, 0, width, height);

    // 3. Draw Grid & Axes (Layer 0)
    if (showGrid) {
      drawGrid(ctx, width, height);
    }

    // 4. Draw Math Objects (Layer 1 - Under strokes)
    drawMathObjects(ctx, width, height);

    // 5. Draw Strokes (Layer 2 - Using Buffer to fix eraser)
    drawStrokesWithBuffer(ctx, width, height, dpr);
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = GRID_SIZE * view.scale;
    const offsetX = view.offsetX % gridSize;
    const offsetY = view.offsetY % gridSize;

    ctx.lineWidth = 1;
    ctx.strokeStyle = bgType === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

    ctx.beginPath();
    for (let x = offsetX; x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = offsetY; y < height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Main Axes
    const origin = toScreen(0, 0);
    ctx.lineWidth = 2;
    ctx.strokeStyle = bgType === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
    
    ctx.beginPath();
    if (origin.y >= 0 && origin.y <= height) {
      ctx.moveTo(0, origin.y);
      ctx.lineTo(width, origin.y);
    }
    if (origin.x >= 0 && origin.x <= width) {
      ctx.moveTo(origin.x, 0);
      ctx.lineTo(origin.x, height);
    }
    ctx.stroke();
    
    // Numbers
    if (showGrid && view.scale > 0.4) {
      ctx.fillStyle = bgType === 'dark' ? '#94a3b8' : '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      
      // X numbers
      for (let x = offsetX; x < width; x += gridSize) {
        const worldX = Math.round((x - view.offsetX) / view.scale / GRID_SIZE);
        if (worldX !== 0) ctx.fillText(worldX.toString(), x, origin.y + 15);
      }
      // Y numbers
      ctx.textAlign = 'right';
      for (let y = offsetY; y < height; y += gridSize) {
        const worldY = Math.round((y - view.offsetY) / view.scale / GRID_SIZE);
        if (worldY !== 0) ctx.fillText((-worldY).toString(), origin.x - 5, y + 3);
      }
    }
  };

  const drawStrokesWithBuffer = (ctx: CanvasRenderingContext2D, width: number, height: number, dpr: number) => {
    const buffer = bufferCanvasRef.current;
    const bCtx = buffer.getContext('2d');
    if (!bCtx) return;

    // Clear Buffer
    bCtx.clearRect(0, 0, buffer.width, buffer.height);
    bCtx.save();
    bCtx.scale(dpr, dpr);
    
    bCtx.lineCap = 'round';
    bCtx.lineJoin = 'round';

    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;

      bCtx.beginPath();
      const start = toScreen(stroke.points[0].x, stroke.points[0].y);
      bCtx.moveTo(start.x, start.y);

      for (let i = 1; i < stroke.points.length; i++) {
        const p = toScreen(stroke.points[i].x, stroke.points[i].y);
        bCtx.lineTo(p.x, p.y);
      }

      // Key Logic: Eraser uses destination-out on the buffer only
      if (stroke.type === 'eraser') {
        bCtx.globalCompositeOperation = 'destination-out';
        bCtx.lineWidth = stroke.width * view.scale;
        bCtx.stroke();
        bCtx.globalCompositeOperation = 'source-over';
      } else {
        bCtx.strokeStyle = stroke.color;
        bCtx.lineWidth = stroke.width * view.scale;
        bCtx.stroke();
      }
    });
    
    bCtx.restore();

    // Draw buffer onto main canvas
    ctx.save();
    ctx.resetTransform(); // Draw 1:1 with screen pixels
    ctx.drawImage(buffer, 0, 0, width * dpr, height * dpr);
    ctx.restore();
  };

  const drawMathObjects = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    mathObjects.forEach(obj => {
      if (obj.type === 'function') {
        ctx.beginPath();
        ctx.lineWidth = 3 * view.scale;
        ctx.strokeStyle = obj.color;

        let first = true;
        const step = 2; // Step in pixels
        for (let screenX = 0; screenX < width; screenX += step) {
          const worldPos = toWorld(screenX, 0);
          const mathX = worldPos.x / GRID_SIZE; 

          try {
            const mathY = evaluateMath(obj.data, mathX);
            // Invert Y for canvas coordinate system
            const screenPos = toScreen(0, -mathY * GRID_SIZE);
            
            if (screenPos.y > -height * 2 && screenPos.y < height * 2) {
              if (first) {
                ctx.moveTo(screenX, screenPos.y);
                first = false;
              } else {
                ctx.lineTo(screenX, screenPos.y);
              }
            } else {
              first = true;
            }
          } catch (e) {
            first = true;
          }
        }
        ctx.stroke();
      } 
      else if (obj.type === 'point') {
        const pixelX = obj.data.x * GRID_SIZE;
        const pixelY = -obj.data.y * GRID_SIZE;
        const pos = toScreen(pixelX, pixelY);
        
        ctx.beginPath();
        ctx.fillStyle = obj.color;
        ctx.arc(pos.x, pos.y, 6 * view.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = bgType === 'dark' ? '#fff' : '#000';
        ctx.stroke();
        
        // Tooltip for Point
        ctx.fillStyle = bgType === 'dark' ? '#fff' : '#000';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`(${obj.data.x}, ${obj.data.y})`, pos.x + 10, pos.y - 10);
      }
      else if (obj.type === 'shape') {
        if (obj.data === 'unit_circle') {
           const center = toScreen(0, 0);
           const screenRadius = GRID_SIZE * view.scale;
           
           ctx.beginPath();
           ctx.strokeStyle = obj.color;
           ctx.lineWidth = 2 * view.scale;
           ctx.arc(center.x, center.y, screenRadius, 0, Math.PI * 2);
           ctx.stroke();
           
           // Angle markers
           ctx.font = '10px sans-serif';
           ctx.fillStyle = obj.color;
           [0, 30, 45, 60, 90, 180, 270].forEach(deg => {
             const rad = (deg * Math.PI) / 180;
             // Canvas Y is inverted (down is positive)
             const x = center.x + Math.cos(-rad) * (screenRadius + 15);
             const y = center.y + Math.sin(-rad) * (screenRadius + 15);
             ctx.fillText(`${deg}°`, x - 5, y + 3);
           });
        }
      }
    });
  };

  const evaluateMath = (funcStr: string, x: number): number => {
    // Sanitized math eval
    let jsExpr = funcStr.toLowerCase()
      .replace(/\^/g, '**')
      .replace(/\be\b/g, 'Math.E')
      .replace(/\bpi\b/g, 'Math.PI')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/abs/g, 'Math.abs')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/log/g, 'Math.log10')
      .replace(/ln/g, 'Math.log');

    try {
      // eslint-disable-next-line no-new-func
      const f = new Function('x', `return ${jsExpr}`);
      return f(x);
    } catch (e) {
      return 0;
    }
  };

  useLayoutEffect(() => {
    render();
  }, [strokes, view, showGrid, bgType, mathObjects]);

  // --- Event Handlers ---
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const pos = getPos(e);

    if (tool === 'hand') {
      // Panning logic handled in Move
    } else {
      const worldPos = toWorld(pos.x, pos.y);
      const newStroke: Stroke = {
        type: tool === 'eraser' ? 'eraser' : 'draw',
        points: [worldPos],
        color: color,
        width: tool === 'eraser' ? eraserSize : brushSize
      };
      setStrokes([...strokes, newStroke]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const pos = getPos(e);

    if (tool === 'hand') {
      // Simple panning via dragging
      // For smoother panning, usually we'd store last position
      // Here we use movementX/Y if available, else simpler logic
      if ('movementX' in e) {
         setView(prev => ({
           ...prev,
           offsetX: prev.offsetX + (e as React.MouseEvent).movementX,
           offsetY: prev.offsetY + (e as React.MouseEvent).movementY
         }));
      }
    } else {
      const worldPos = toWorld(pos.x, pos.y);
      setStrokes(prev => {
        const last = prev[prev.length - 1];
        const newPoints = [...last.points, worldPos];
        return [...prev.slice(0, -1), { ...last, points: newPoints }];
      });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (tool !== 'hand') {
        addToHistory();
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.2, view.scale * (1 + scaleAmount)), 5);
    setView(prev => ({ ...prev, scale: newScale }));
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    let cx, cy;
    if ('touches' in e) {
      cx = e.touches[0].clientX;
      cy = e.touches[0].clientY;
    } else {
      cx = (e as React.MouseEvent).clientX;
      cy = (e as React.MouseEvent).clientY;
    }
    return { x: cx - rect.left, y: cy - rect.top };
  };

  // --- Actions ---
  const triggerFeedback = (id: string) => {
    setActiveFeedback(id);
    setTimeout(() => setActiveFeedback(null), 1500);
    addToHistory();
  };

  const addFunction = (fn: string = funcInput, btnId: string = 'custom-func') => {
    setMathObjects([...mathObjects, {
      type: 'function',
      data: fn,
      color: color,
      id: Date.now().toString()
    }]);
    triggerFeedback(btnId);
  };

  const addPoint = () => {
    setMathObjects([...mathObjects, {
      type: 'point',
      data: { x: parseFloat(coordInput.x), y: parseFloat(coordInput.y) },
      color: color,
      id: Date.now().toString()
    }]);
    triggerFeedback('add-point');
  };

  const addUnitCircle = () => {
    setMathObjects([...mathObjects, {
      type: 'shape',
      data: 'unit_circle',
      color: color,
      id: Date.now().toString()
    }]);
    triggerFeedback('unit-circle');
  };

  const clearBoard = () => {
    if (window.confirm('ნამდვილად გსურთ დაფის გასუფთავება?')) {
      setStrokes([]);
      setMathObjects([]);
      addToHistory();
    }
  };

  const downloadBoard = () => {
    const link = document.createElement('a');
    link.download = 'mathmaster-board.png';
    link.href = canvasRef.current?.toDataURL() || '';
    link.click();
  };

  const colors = ['#000000', '#dc2626', '#4f46e5', '#16a34a', '#ca8a04', '#ffffff'];

  return (
    <div className="flex h-full relative overflow-hidden bg-slate-100 font-sans select-none">
      
      {/* Math Tools Sidebar */}
      <div className={`absolute left-0 top-0 bottom-0 z-30 bg-white shadow-2xl transition-all duration-300 flex flex-col border-r border-slate-200 ${showMathPanel ? 'w-80 translate-x-0' : 'w-80 -translate-x-full'}`}>
        <div className="p-4 border-b flex items-center justify-between bg-slate-900 text-white">
          <h3 className="font-bold flex items-center gap-2"><TrendingUp size={20} /> გრაფიკები</h3>
          <button onClick={() => setShowMathPanel(false)} className="hover:bg-slate-700 p-1 rounded"><X size={20} /></button>
        </div>
        
        <div className="p-5 space-y-8 overflow-y-auto flex-1">
          
          {/* Function Plotter */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
              <TrendingUp size={14} className="text-indigo-600" /> ფუნქციის აგება
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono">y =</span>
                <input 
                  type="text"
                  value={funcInput}
                  onChange={(e) => setFuncInput(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button 
                onClick={() => addFunction(funcInput, 'custom-func')} 
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 shadow-sm transition-all"
              >
                {activeFeedback === 'custom-func' ? <Check size={20} className="animate-bounce" /> : <Plus size={20} />}
              </button>
            </div>
            
            {/* Quick Functions */}
            <div className="grid grid-cols-3 gap-2">
               {[
                 { l: 'x²', v: 'x^2' }, { l: 'sin(x)', v: 'sin(x)' }, { l: 'cos(x)', v: 'cos(x)' },
                 { l: 'tan(x)', v: 'tan(x)' }, { l: '√x', v: 'sqrt(x)' }, { l: '|x|', v: 'abs(x)' },
                 { l: 'ln(x)', v: 'ln(x)' }, { l: 'eˣ', v: 'e^x' }, { l: '1/x', v: '1/x' }
               ].map((item) => (
                 <button 
                   key={item.l}
                   onClick={() => addFunction(item.v, `quick-${item.l}`)} 
                   className="p-2 bg-slate-50 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 text-xs rounded font-mono text-slate-700 transition-all relative overflow-hidden"
                 >
                   {activeFeedback === `quick-${item.l}` ? <Check size={14} className="mx-auto text-green-500" /> : item.l}
                 </button>
               ))}
            </div>
          </div>

          {/* Point Plotter */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
              <MousePointer2 size={14} className="text-indigo-600" /> წერტილის დასმა
            </label>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <span className="absolute left-2 top-2 text-slate-400 text-xs">X</span>
                <input type="number" value={coordInput.x} onChange={(e) => setCoordInput({...coordInput, x: e.target.value})} className="w-full pl-6 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900" />
              </div>
              <div className="relative flex-1">
                <span className="absolute left-2 top-2 text-slate-400 text-xs">Y</span>
                <input type="number" value={coordInput.y} onChange={(e) => setCoordInput({...coordInput, y: e.target.value})} className="w-full pl-6 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900" />
              </div>
              <button 
                onClick={addPoint} 
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 shadow-sm transition-all"
              >
                {activeFeedback === 'add-point' ? <Check size={20} className="animate-bounce" /> : <Plus size={20} />}
              </button>
            </div>
          </div>

          {/* Quick Shapes */}
          <div className="space-y-3">
             <label className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
               <Circle size={14} className="text-indigo-600" /> ფიგურები
             </label>
             <button 
               onClick={addUnitCircle} 
               className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-slate-700 font-medium transition-all group"
             >
               <div className="flex items-center gap-3">
                 <Circle size={20} className="text-indigo-500 group-hover:scale-110 transition-transform" />
                 ტრიგონომეტრიული წრე
               </div>
               {activeFeedback === 'unit-circle' && <Check size={18} className="text-green-500 animate-in fade-in zoom-in" />}
             </button>
          </div>

          {/* Object List */}
          {mathObjects.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-900 uppercase">დამატებული ობიექტები</label>
              {mathObjects.map(obj => (
                <div key={obj.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200 text-sm group hover:border-red-200 transition-colors">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: obj.color }}></div>
                    <span className="truncate font-mono text-slate-700">
                      {obj.type === 'function' ? `y = ${obj.data}` : obj.type === 'point' ? `(${obj.data.x}, ${obj.data.y})` : 'Unit Circle'}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setMathObjects(mathObjects.filter(o => o.id !== obj.id));
                      addToHistory();
                    }}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toggle Sidebar Button */}
      <button 
        onClick={() => setShowMathPanel(!showMathPanel)}
        className={`absolute left-4 top-4 z-20 p-3 rounded-xl shadow-lg border transition-all duration-300 ${showMathPanel ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-indigo-600 border-slate-200 hover:scale-105'}`}
        title="გრაფიკების პანელი"
      >
        <SigmaSquare size={24} />
      </button>

      {/* Main Toolbar (Top Center) */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-white p-2 rounded-2xl shadow-xl border border-slate-200 flex items-center gap-4 animate-fadeIn">
        {/* Tools */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button onClick={() => setTool('hand')} className={`p-2.5 rounded-lg transition-all ${tool === 'hand' ? 'bg-white shadow-sm text-indigo-600 scale-105' : 'text-slate-500 hover:text-indigo-500'}`} title="გადაადგილება"><Hand size={20} /></button>
           <button onClick={() => setTool('pen')} className={`p-2.5 rounded-lg transition-all ${tool === 'pen' ? 'bg-white shadow-sm text-indigo-600 scale-105' : 'text-slate-500 hover:text-indigo-500'}`} title="კალამი"><Pen size={20} /></button>
           <button onClick={() => setTool('eraser')} className={`p-2.5 rounded-lg transition-all ${tool === 'eraser' ? 'bg-white shadow-sm text-indigo-600 scale-105' : 'text-slate-500 hover:text-indigo-500'}`} title="საშლელი"><Eraser size={20} /></button>
        </div>

        <div className="w-px h-8 bg-slate-200"></div>

        {/* History Controls */}
        <div className="flex gap-1">
           <button onClick={undo} disabled={historyIndex === 0} className="p-2 text-slate-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 rounded-lg" title="უკან (Ctrl+Z)"><Undo size={20} /></button>
           <button onClick={redo} disabled={historyIndex === history.length - 1} className="p-2 text-slate-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 rounded-lg" title="წინ (Ctrl+Y)"><Redo size={20} /></button>
        </div>

        <div className="w-px h-8 bg-slate-200"></div>

        {/* Size Slider */}
        <div className="flex items-center gap-3 w-24 px-2 group relative">
           <div className={`w-2 h-2 rounded-full transition-all ${tool === 'eraser' ? 'bg-slate-400' : 'bg-indigo-600'}`}></div>
           <input 
             type="range" 
             min="1" 
             max="50" 
             value={tool === 'eraser' ? eraserSize : brushSize}
             onChange={(e) => tool === 'eraser' ? setEraserSize(parseInt(e.target.value)) : setBrushSize(parseInt(e.target.value))}
             className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
           />
           {/* Size Tooltip */}
           <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
             {tool === 'eraser' ? eraserSize : brushSize}px
           </div>
        </div>

        <div className="w-px h-8 bg-slate-200"></div>

        {/* Colors */}
        <div className="flex gap-1.5">
          {colors.map(c => (
            <button 
              key={c} 
              onClick={() => {setColor(c); setTool('pen');}}
              className={`w-6 h-6 rounded-full border border-slate-200 transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-1 ring-indigo-400 scale-110' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Right Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
         <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-200 flex flex-col gap-2">
           <button onClick={resetView} className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="ცენტრზე დაბრუნება"><RotateCcw size={20} /></button>
           <button onClick={clearBoard} className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="გასუფთავება"><Trash2 size={20} /></button>
           <button onClick={downloadBoard} className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="სურათად შენახვა"><Download size={20} /></button>
         </div>

         <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-200 flex flex-col gap-2">
           <button onClick={() => setShowGrid(!showGrid)} className={`p-2.5 rounded-lg transition-colors ${showGrid ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:bg-slate-50'}`} title="ბადე"><Grid3X3 size={20} /></button>
           <button 
            onClick={() => setBgType(bgType === 'light' ? 'dark' : bgType === 'dark' ? 'paper' : 'light')} 
            className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-lg font-bold text-xs border border-slate-100"
            title="ფონი"
           >
             {bgType === 'light' ? 'Dark' : bgType === 'dark' ? 'Paper' : 'Light'}
           </button>
         </div>
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className={`w-full h-full ${tool === 'hand' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <canvas ref={canvasRef} className="block touch-none" />
      </div>
      
      {/* Status Indicator */}
      <div className="absolute bottom-4 right-4 flex items-center gap-3 pointer-events-none">
         <div className="bg-black/70 text-white px-3 py-1.5 rounded-full text-xs backdrop-blur-sm font-mono shadow-lg">
            Scale: {(view.scale * 100).toFixed(0)}%
         </div>
         <div className="bg-black/70 text-white px-3 py-1.5 rounded-full text-xs backdrop-blur-sm font-mono shadow-lg">
            Origin: ({view.offsetX.toFixed(0)}, {view.offsetY.toFixed(0)})
         </div>
      </div>
    </div>
  );
};
