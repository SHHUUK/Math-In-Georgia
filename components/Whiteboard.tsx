
import React, { useRef, useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { 
  Pen, Eraser, Hand, Trash2, Undo, Redo, Check, 
  MousePointer2, Circle, Triangle, Square,
  Type, Image as ImageIcon, Layers,
  Download, Moon, Sun, Grid, Lock, Unlock, Eye, EyeOff,
  Move, ZoomIn, ZoomOut, Palette, PenTool, X, Plus
} from 'lucide-react';

// --- Types & Interfaces ---

type ToolType = 
  | 'select' | 'pan' | 'pen' | 'highlighter' | 'eraser' 
  | 'rect' | 'circle' | 'triangle' 
  | 'text' | 'image' | 'math_point';

interface Point {
  x: number;
  y: number;
}

interface CanvasObject {
  id: string;
  type: ToolType;
  layerId: string;
  points?: Point[]; // For strokes
  x?: number; // For shapes/text/img/points
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  strokeWidth: number;
  opacity: number;
  imgData?: HTMLImageElement; // For images
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

interface ViewState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

const GRID_SIZE = 50; // 1 Math Unit = 50px

export const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null); // Specific ref for the drawing area
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- State ---
  
  // Canvas Data
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [layers, setLayers] = useState<Layer[]>([{ id: 'layer1', name: 'Layer 1', visible: true, locked: false }]);
  const [activeLayerId, setActiveLayerId] = useState('layer1');
  
  // Appearance State (Decoupled)
  const [bgTheme, setBgTheme] = useState<'light' | 'dark'>('light');
  const [showGrid, setShowGrid] = useState<boolean>(false);
  
  // Viewport
  const [view, setView] = useState<ViewState>({ scale: 1, offsetX: 0, offsetY: 0 });
  const [cursorPos, setCursorPos] = useState<Point>({ x: 0, y: 0 });
  
  // Tools & Properties
  const [tool, setTool] = useState<ToolType>('pen');
  const [strokeColor, setStrokeColor] = useState('#000000'); 
  const [strokeWidth, setStrokeWidth] = useState(5); // Increased default size
  const [eraserSize, setEraserSize] = useState(30);
  
  // Interaction State
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false); // Right-Click Navigation Mode
  const [currentStroke, setCurrentStroke] = useState<CanvasObject | null>(null);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [textInputPos, setTextInputPos] = useState<{x: number, y: number} | null>(null);
  const [textInputValue, setTextInputValue] = useState('');
  
  // Math Input State
  const [mathCoord, setMathCoord] = useState({ x: '0', y: '0' });
  
  // History
  const [history, setHistory] = useState<CanvasObject[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Long Press Logic
  const longPressTimer = useRef<number | null>(null);

  // --- Helpers ---

  // Convert Screen Pixel (Mouse) to World Coordinate (Canvas)
  const toWorld = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - view.offsetX) / view.scale,
      y: (screenY - view.offsetY) / view.scale
    };
  }, [view]);

  // Convert World Coordinate (Canvas) to Screen Pixel
  const toScreen = useCallback((worldX: number, worldY: number) => {
    return {
      x: worldX * view.scale + view.offsetX,
      y: worldY * view.scale + view.offsetY
    };
  }, [view]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...objects]);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevObjects = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setObjects(prevObjects);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setObjects([]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextObjects = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setObjects(nextObjects);
    }
  };

  // --- Rendering Engine ---

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !canvasWrapperRef.current) return;

    // Handle High DPI
    const { width, height } = canvasWrapperRef.current.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Only resize if dimensions changed to avoid flickering
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }
    
    // Reset transform to identity for clearing
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // 1. Background Fill
    let bgColor = '#ffffff';
    let gridColor = 'rgba(0,0,0,0.1)';
    let axisColor = '#000000';
    let textColor = '#000000';

    if (bgTheme === 'dark') {
      bgColor = '#000000'; // TRUE BLACK
      gridColor = 'rgba(255,255,255,0.2)'; // More visible grid on black
      axisColor = '#ffffff';
      textColor = '#ffffff';
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Grid & Axes (ONLY IF SHOWGRID IS TRUE)
    if (showGrid) {
      const scaledGridSize = GRID_SIZE * view.scale;
      
      const gridStartX = Math.floor(-view.offsetX / scaledGridSize);
      const gridEndX = Math.ceil((width - view.offsetX) / scaledGridSize);
      
      const gridStartY = Math.floor(-view.offsetY / scaledGridSize);
      const gridEndY = Math.ceil((height - view.offsetY) / scaledGridSize);

      ctx.beginPath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;

      for (let i = gridStartX; i <= gridEndX; i++) {
        const x = i * scaledGridSize + view.offsetX;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      
      for (let i = gridStartY; i <= gridEndY; i++) {
        const y = i * scaledGridSize + view.offsetY;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Main Axes
      const origin = toScreen(0, 0);
      ctx.beginPath();
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 2;
      
      // Y Axis (Vertical) at X=0
      ctx.moveTo(origin.x, 0);
      ctx.lineTo(origin.x, height);
      
      // X Axis (Horizontal) at Y=0
      ctx.moveTo(0, origin.y);
      ctx.lineTo(width, origin.y);
      ctx.stroke();

      // Coordinate Numbers
      ctx.fillStyle = textColor;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // X Numbers
      for (let i = gridStartX; i <= gridEndX; i++) {
          if (i === 0) continue;
          const x = i * scaledGridSize + view.offsetX;
          ctx.fillText(i.toString(), x, origin.y + 4);
      }

      // Y Numbers
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let i = gridStartY; i <= gridEndY; i++) {
          if (i === 0) continue;
          const y = i * scaledGridSize + view.offsetY;
          // Mathematical Y is inverted
          ctx.fillText((-i).toString(), origin.x - 4, y);
      }
      
      // Origin Label
      ctx.fillText("0", origin.x - 4, origin.y + 4);
    }

    // 3. Objects
    const allObjects = [...objects, ...(currentStroke ? [currentStroke] : [])];

    allObjects.forEach(obj => {
      const layer = layers.find(l => l.id === obj.layerId);
      if (!layer || !layer.visible) return;

      ctx.save();
      ctx.globalAlpha = obj.opacity;

      if (['pen', 'highlighter', 'eraser'].includes(obj.type)) {
        if (!obj.points || obj.points.length < 2) { ctx.restore(); return; }
        
        ctx.beginPath();
        // Move to first point
        const start = toScreen(obj.points[0].x, obj.points[0].y);
        ctx.moveTo(start.x, start.y);
        
        // Draw rest
        for (let i = 1; i < obj.points.length; i++) {
          const p = toScreen(obj.points[i].x, obj.points[i].y);
          ctx.lineTo(p.x, p.y);
        }

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.lineWidth = obj.strokeWidth * view.scale;

        if (obj.type === 'highlighter') {
          ctx.strokeStyle = obj.color;
          ctx.globalAlpha = 0.3;
          ctx.globalCompositeOperation = 'source-over'; 
        } else if (obj.type === 'eraser') {
          ctx.strokeStyle = bgColor; // Paint over with BG color
        } else {
          ctx.strokeStyle = obj.color;
        }
        ctx.stroke();
      } 
      else if (['rect', 'circle', 'triangle'].includes(obj.type)) {
        if (obj.x === undefined || obj.width === undefined) { ctx.restore(); return; }
        const p = toScreen(obj.x, obj.y || 0);
        const w = (obj.width || 0) * view.scale;
        const h = (obj.height || 0) * view.scale;

        ctx.strokeStyle = obj.color;
        ctx.lineWidth = obj.strokeWidth * view.scale;
        ctx.beginPath();
        
        if (obj.type === 'rect') {
          ctx.rect(p.x, p.y, w, h);
        } else if (obj.type === 'circle') {
          ctx.ellipse(p.x + w/2, p.y + h/2, Math.abs(w/2), Math.abs(h/2), 0, 0, Math.PI * 2);
        } else if (obj.type === 'triangle') {
          ctx.moveTo(p.x + w/2, p.y);
          ctx.lineTo(p.x + w, p.y + h);
          ctx.lineTo(p.x, p.y + h);
          ctx.closePath();
        }
        ctx.stroke();
      }
      else if (obj.type === 'text') {
        if (!obj.text || obj.x === undefined) { ctx.restore(); return; }
        const p = toScreen(obj.x, obj.y || 0);
        ctx.font = `${Math.max(10, obj.strokeWidth * 5 * view.scale)}px sans-serif`;
        ctx.fillStyle = obj.color;
        ctx.textBaseline = 'top';
        ctx.fillText(obj.text, p.x, p.y);
      }
      else if (obj.type === 'math_point') {
        if (obj.x === undefined) { ctx.restore(); return; }
        const p = toScreen(obj.x, obj.y || 0);
        
        ctx.beginPath();
        ctx.fillStyle = '#ef4444'; // Red Dot
        const r = Math.max(4, 8 * view.scale); // Larger point size
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        
        // Label
        ctx.fillStyle = textColor;
        ctx.font = `bold ${12 * Math.max(0.8, view.scale)}px monospace`;
        const wx = (obj.x / GRID_SIZE).toFixed(1).replace('.0', '');
        const wy = (-obj.y! / GRID_SIZE).toFixed(1).replace('.0', ''); // Invert Y back
        ctx.fillText(`(${wx}, ${wy})`, p.x + r + 2, p.y - r - 2);
      }
      else if (obj.type === 'image' && obj.imgData) {
        if (obj.x === undefined) { ctx.restore(); return; }
        const p = toScreen(obj.x, obj.y || 0);
        const w = (obj.width || 0) * view.scale;
        const h = (obj.height || 0) * view.scale;
        ctx.drawImage(obj.imgData, p.x, p.y, w, h);
      }

      ctx.restore();
    });

  }, [objects, currentStroke, view, layers, bgTheme, showGrid, toScreen]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      render();
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [render]);


  // --- Event Handlers ---

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent | React.WheelEvent): Point => {
    const rect = canvasWrapperRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Block browser menu
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.ui-element')) return;

    // Handle Right Click for Navigation Mode
    if ('button' in e && (e as React.MouseEvent).button === 2) {
       setIsNavigating(true);
       setLastMousePos(getPointerPos(e));
       return;
    }

    const pos = getPointerPos(e);
    const worldPos = toWorld(pos.x, pos.y);
    setLastMousePos(pos);

    // Long press detection for touch
    if ('touches' in e) {
       longPressTimer.current = window.setTimeout(() => {
          setIsNavigating(true);
       }, 500); // 500ms long press to start zoom/pan
    }

    if (tool === 'pan' || (e as React.MouseEvent).button === 1) { 
      setIsPanning(true);
      return;
    }

    if (tool === 'select') return;
    if (tool === 'text') {
      setTextInputPos(pos);
      return;
    }

    setIsDrawing(true);
    
    const newObj: CanvasObject = {
      id: generateId(),
      type: tool,
      layerId: activeLayerId,
      color: tool === 'eraser' ? (bgTheme === 'dark' ? '#000000' : '#ffffff') : strokeColor,
      strokeWidth: tool === 'eraser' ? eraserSize : strokeWidth,
      opacity: 1,
      points: [worldPos],
      x: worldPos.x, y: worldPos.y, width: 0, height: 0
    };
    setCurrentStroke(newObj);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPointerPos(e);
    const worldPos = toWorld(pos.x, pos.y);
    setCursorPos(pos);

    if (longPressTimer.current) {
       const dx = Math.abs(pos.x - lastMousePos.x);
       const dy = Math.abs(pos.y - lastMousePos.y);
       if (dx > 5 || dy > 5) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
       }
    }

    // Right Click Held: Pan Canvas (Drag)
    if (isNavigating) {
       const dx = pos.x - lastMousePos.x;
       const dy = pos.y - lastMousePos.y;
       setView(v => ({ ...v, offsetX: v.offsetX + dx, offsetY: v.offsetY + dy }));
       setLastMousePos(pos);
       return;
    }

    if (isPanning) {
      const dx = pos.x - lastMousePos.x;
      const dy = pos.y - lastMousePos.y;
      setView(v => ({ ...v, offsetX: v.offsetX + dx, offsetY: v.offsetY + dy }));
      setLastMousePos(pos);
      return;
    }

    if (isDrawing && currentStroke) {
      if (['pen', 'highlighter', 'eraser'].includes(tool)) {
        setCurrentStroke(prev => prev ? {
          ...prev,
          points: [...(prev.points || []), worldPos]
        } : null);
      } 
      else if (['rect', 'circle', 'triangle'].includes(tool)) {
        setCurrentStroke(prev => prev ? {
          ...prev,
          width: worldPos.x - (prev.x || 0),
          height: worldPos.y - (prev.y || 0)
        } : null);
      }
    }
    setLastMousePos(pos);
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
       clearTimeout(longPressTimer.current);
       longPressTimer.current = null;
    }

    if (isDrawing && currentStroke) {
      setObjects(prev => [...prev, currentStroke]);
      saveToHistory();
    }
    setIsDrawing(false);
    setIsPanning(false);
    setIsNavigating(false);
    setCurrentStroke(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    // Only allow zooming if Right Click (Navigation Mode) is active
    if (isNavigating) { 
       const pos = getPointerPos(e);
       const worldPos = toWorld(pos.x, pos.y);
       const delta = -e.deltaY;
       const scaleFactor = Math.pow(1.002, delta); 
       const newScale = Math.min(Math.max(0.1, view.scale * scaleFactor), 20);
       const newOffsetX = pos.x - worldPos.x * newScale;
       const newOffsetY = pos.y - worldPos.y * newScale;
       setView({ scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY });
    }
    // Otherwise, do nothing (Block Scroll)
  };

  // --- Actions ---

  const handleTextSubmit = () => {
    if (textInputValue.trim() && textInputPos) {
      const worldPos = toWorld(textInputPos.x, textInputPos.y);
      const newObj: CanvasObject = {
        id: generateId(),
        type: 'text',
        layerId: activeLayerId,
        x: worldPos.x,
        y: worldPos.y,
        text: textInputValue,
        color: strokeColor,
        strokeWidth: strokeWidth,
        opacity: 1
      };
      setObjects(prev => [...prev, newObj]);
      saveToHistory();
    }
    setTextInputPos(null);
    setTextInputValue('');
  };

  const addMathPoint = () => {
    const xVal = parseFloat(mathCoord.x);
    const yVal = parseFloat(mathCoord.y);
    if (isNaN(xVal) || isNaN(yVal)) return;

    const wx = xVal * GRID_SIZE;
    const wy = -yVal * GRID_SIZE; 
    
    const newObj: CanvasObject = {
      id: generateId(),
      type: 'math_point',
      layerId: activeLayerId,
      x: wx,
      y: wy,
      color: '#ef4444',
      strokeWidth: 1,
      opacity: 1
    };
    setObjects(prev => [...prev, newObj]);
    saveToHistory();
    
    if (canvasWrapperRef.current) {
        const { width, height } = canvasWrapperRef.current.getBoundingClientRect();
        setView(v => ({
            ...v,
            offsetX: width/2 - wx * v.scale,
            offsetY: height/2 - wy * v.scale
        }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          if (!canvasWrapperRef.current) return;
          const { width, height } = canvasWrapperRef.current.getBoundingClientRect();
          const center = toWorld(width/2, height/2);
          
          const newObj: CanvasObject = {
            id: generateId(),
            type: 'image',
            layerId: activeLayerId,
            x: center.x - img.width/2,
            y: center.y - img.height/2,
            width: img.width,
            height: img.height,
            color: 'transparent',
            strokeWidth: 0,
            opacity: 1,
            imgData: img
          };
          setObjects(prev => [...prev, newObj]);
          saveToHistory();
        };
        img.src = evt.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteLayer = (id: string) => {
    if (layers.length <= 1) {
      alert("Cannot delete the last layer.");
      return;
    }
    setLayers(prev => prev.filter(l => l.id !== id));
    setObjects(prev => prev.filter(o => o.layerId !== id));
    if (activeLayerId === id) setActiveLayerId(layers[0].id);
  };

  const exportCanvas = () => {
      if (!canvasRef.current) return;
      const link = document.createElement('a');
      link.download = 'mathmaster-board.png';
      link.href = canvasRef.current.toDataURL();
      link.click();
  };

  return (
    <div className="flex h-full relative overflow-hidden" ref={containerRef} onContextMenu={handleContextMenu}>
      
      {/* 1. LEFT TOOLBAR */}
      <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-2 z-20 shadow-sm overflow-y-auto no-scrollbar ui-element">
         <ToolBtn icon={MousePointer2} label="Select" active={tool === 'select'} onClick={() => setTool('select')} />
         <ToolBtn icon={Hand} label="Pan (Hold Ctrl to Zoom)" active={tool === 'pan'} onClick={() => setTool('pan')} />
         <div className="w-8 h-px bg-slate-200 my-1"></div>
         <ToolBtn icon={Pen} label="Pen" active={tool === 'pen'} onClick={() => setTool('pen')} />
         <ToolBtn icon={PenTool} label="Highlighter" active={tool === 'highlighter'} onClick={() => setTool('highlighter')} />
         <ToolBtn icon={Eraser} label="Eraser" active={tool === 'eraser'} onClick={() => setTool('eraser')} />
         <div className="w-8 h-px bg-slate-200 my-1"></div>
         <ToolBtn icon={Square} label="Rectangle" active={tool === 'rect'} onClick={() => setTool('rect')} />
         <ToolBtn icon={Circle} label="Circle" active={tool === 'circle'} onClick={() => setTool('circle')} />
         <ToolBtn icon={Triangle} label="Triangle" active={tool === 'triangle'} onClick={() => setTool('triangle')} />
         <ToolBtn icon={Type} label="Text" active={tool === 'text'} onClick={() => setTool('text')} />
         <ToolBtn icon={ImageIcon} label="Image" active={tool === 'image'} onClick={() => fileInputRef.current?.click()} />
         
         <div className="mt-auto flex flex-col gap-2">
            <ToolBtn icon={Undo} label="Undo" onClick={undo} />
            <ToolBtn icon={Redo} label="Redo" onClick={redo} />
            <ToolBtn icon={Trash2} label="Clear All" onClick={() => { if(confirm('Clear board?')) { setObjects([]); saveToHistory(); } }} color="text-red-500" />
         </div>
      </div>

      {/* 2. TOP PROPERTIES BAR */}
      <div className="absolute top-4 left-20 right-4 h-14 bg-white rounded-xl shadow-md border border-slate-200 flex items-center px-4 justify-between z-20 ui-element">
         
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-r pr-4 border-slate-200">
               <Palette size={18} className="text-slate-400" />
               <input 
                 type="color" 
                 value={strokeColor} 
                 onChange={e => setStrokeColor(e.target.value)} 
                 className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" 
               />
            </div>
            
            <div className="flex items-center gap-2 border-r pr-4 border-slate-200">
               <span className="text-xs font-bold text-slate-500">Size:</span>
               <input 
                 type="range" min="1" max="50" 
                 value={strokeWidth} 
                 onChange={e => setStrokeWidth(Number(e.target.value))}
                 className="w-24 accent-indigo-600"
               />
               <span className="text-xs w-6">{strokeWidth}</span>
            </div>

            {tool === 'eraser' && (
               <div className="flex items-center gap-2 border-r pr-4 border-slate-200 animate-fadeIn">
                 <span className="text-xs font-bold text-slate-500">Eraser:</span>
                 <input 
                   type="range" min="10" max="100" 
                   value={eraserSize} 
                   onChange={e => setEraserSize(Number(e.target.value))}
                   className="w-24 accent-red-500"
                 />
                 <span className="text-xs w-6">{eraserSize}</span>
               </div>
            )}

            <div className="flex items-center gap-1 border-r pr-4 border-slate-200">
               <button onClick={() => setShowGrid(!showGrid)} className={`p-1.5 rounded ${showGrid ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`} title="Toggle Grid"><Grid size={18}/></button>
               <button onClick={() => setBgTheme('light')} className={`p-1.5 rounded ${bgTheme === 'light' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`} title="Light Mode"><Sun size={18}/></button>
               <button onClick={() => setBgTheme('dark')} className={`p-1.5 rounded ${bgTheme === 'dark' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`} title="Dark Mode"><Moon size={18}/></button>
            </div>
         </div>

         <div className="flex items-center gap-3">
             <div className="bg-slate-50 rounded-lg p-1 flex items-center gap-2 border border-slate-200 px-2">
                <span className="text-xs font-bold text-indigo-600">Point (x,y):</span>
                <input type="number" value={mathCoord.x} onChange={e => setMathCoord({...mathCoord, x: e.target.value})} className="w-12 h-8 border rounded px-1 text-sm bg-white text-slate-900" placeholder="X" />
                <input type="number" value={mathCoord.y} onChange={e => setMathCoord({...mathCoord, y: e.target.value})} className="w-12 h-8 border rounded px-1 text-sm bg-white text-slate-900" placeholder="Y" />
                <button onClick={addMathPoint} className="bg-indigo-600 text-white p-1.5 rounded hover:bg-indigo-700 transition-colors"><Check size={16} /></button>
             </div>
             <button onClick={exportCanvas} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-700"><Download size={16} /> Export</button>
         </div>
      </div>

      {/* 3. LAYERS PANEL */}
      <div className="absolute top-20 right-4 w-60 bg-white rounded-xl shadow-xl border border-slate-200 z-20 flex flex-col overflow-hidden max-h-[300px] ui-element">
         <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm"><Layers size={16}/> Layers</h4>
            <button onClick={() => setLayers([...layers, { id: generateId(), name: `Layer ${layers.length+1}`, visible: true, locked: false }])} className="p-1 hover:bg-slate-200 rounded"><Plus size={14}/></button>
         </div>
         <div className="flex-1 overflow-y-auto">
            {layers.map((layer, idx) => (
               <div key={layer.id} onClick={() => setActiveLayerId(layer.id)} className={`flex items-center justify-between p-2 px-3 text-sm cursor-pointer border-b border-slate-50 ${activeLayerId === layer.id ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-slate-50'}`}>
                  <span className={`${activeLayerId === layer.id ? 'font-bold text-indigo-700' : 'text-slate-600'}`}>{layer.name}</span>
                  <div className="flex gap-1 text-slate-400">
                     <button onClick={(e) => { e.stopPropagation(); setLayers(layers.map(l => l.id === layer.id ? {...l, visible: !l.visible} : l)) }}>{layer.visible ? <Eye size={14}/> : <EyeOff size={14}/>}</button>
                     <button onClick={(e) => { e.stopPropagation(); setLayers(layers.map(l => l.id === layer.id ? {...l, locked: !l.locked} : l)) }}>{layer.locked ? <Lock size={14}/> : <Unlock size={14}/>}</button>
                     {layers.length > 1 && <button onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id) }} className="hover:text-red-500"><Trash2 size={14}/></button>}
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* 4. CANVAS AREA */}
      <div 
        ref={canvasWrapperRef}
        className="flex-1 relative cursor-none touch-none bg-black overflow-hidden" 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />
        
        {/* Custom Brush Cursor */}
        <div 
           className="pointer-events-none fixed rounded-full border border-white z-50 mix-blend-difference"
           style={{
             left: cursorPos.x + (canvasWrapperRef.current?.getBoundingClientRect().left || 0),
             top: cursorPos.y + (canvasWrapperRef.current?.getBoundingClientRect().top || 0),
             width: (tool === 'eraser' ? eraserSize : strokeWidth) * view.scale,
             height: (tool === 'eraser' ? eraserSize : strokeWidth) * view.scale,
             transform: 'translate(-50%, -50%)',
             display: ['pen', 'eraser', 'highlighter'].includes(tool) ? 'block' : 'none'
           }}
        />

        {textInputPos && (
          <div className="absolute bg-white p-2 rounded shadow-xl border border-indigo-500 z-30" style={{ left: textInputPos.x, top: textInputPos.y }}>
             <input autoFocus value={textInputValue} onChange={e => setTextInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTextSubmit()} onBlur={handleTextSubmit} className="border-none outline-none text-slate-900 min-w-[200px]" placeholder="Type text..." />
          </div>
        )}
      </div>

      {/* 5. BOTTOM BAR */}
      <div className="absolute bottom-4 left-20 bg-white px-4 py-2 rounded-full shadow-lg border border-slate-200 flex items-center gap-4 z-20 text-xs font-mono text-slate-600 ui-element">
         <div className="flex items-center gap-2">
            <button onClick={() => setView(v => ({...v, scale: v.scale * 0.9}))} className="p-1 hover:bg-slate-100 rounded"><ZoomOut size={14}/></button>
            <span className="w-12 text-center">{Math.round(view.scale * 100)}%</span>
            <button onClick={() => setView(v => ({...v, scale: v.scale * 1.1}))} className="p-1 hover:bg-slate-100 rounded"><ZoomIn size={14}/></button>
         </div>
         <div className="w-px h-4 bg-slate-200"></div>
         <div>X: {Math.round(-view.offsetX)}, Y: {Math.round(-view.offsetY)}</div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
    </div>
  );
};

const ToolBtn = ({ icon: Icon, label, active, onClick, color }: any) => (
  <button onClick={onClick} title={label} className={`p-3 rounded-xl transition-all duration-200 relative group ${active ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
    <Icon size={22} className={color} />
  </button>
);
