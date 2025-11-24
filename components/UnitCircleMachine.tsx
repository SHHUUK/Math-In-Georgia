
import React, { useState, useRef, useEffect } from 'react';
import { Circle, Compass, RotateCcw, HelpCircle, X, Info } from 'lucide-react';

interface UnitCircleMachineProps {
  onAddXp?: (amount: number, reason?: string) => void;
}

export const UnitCircleMachine: React.FC<UnitCircleMachineProps> = ({ onAddXp }) => {
  const [angle, setAngle] = useState(45); // Degrees
  const [isDragging, setIsDragging] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Math Conversions
  const rad = (angle * Math.PI) / 180;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  const tan = Math.tan(rad);

  // Visualization Config
  const size = 500;
  const center = size / 2;
  const radius = 180;
  
  // Coordinates for the point on circle
  const cx = center + cos * radius;
  const cy = center - sin * radius; // SVG Y is inverted

  const handleMouseDown = () => setIsDragging(true);
  
  const handleMouseUp = () => {
    if (isDragging && onAddXp) {
        onAddXp(5, 'ტრიგონომეტრიული წრის გამოკვლევა');
    }
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !svgRef.current) return;

    // Get mouse position relative to SVG center
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left - center;
    const y = clientY - rect.top - center;

    // Calculate angle
    // atan2 returns angle in radians from -PI to PI. 
    // We invert Y because SVG Y is down.
    let theta = Math.atan2(-y, x); 
    if (theta < 0) theta += 2 * Math.PI; // Normalize 0-2PI

    const degrees = (theta * 180) / Math.PI;
    setAngle(Math.round(degrees));
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 p-4 md:p-8 animate-fadeIn overflow-y-auto relative">
      
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-200 relative">
            <button onClick={() => setShowTutorial(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><X size={24} /></button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><Info size={32} /></div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">ტრიგონომეტრიული წრე</h2>
                <p className="text-slate-500">ინტერაქტიული გზამკვლევი</p>
              </div>
            </div>

            <div className="space-y-6 text-slate-700">
              <div className="flex gap-4">
                <div className="bg-indigo-50 w-8 h-8 rounded-full flex items-center justify-center text-indigo-600 font-bold shrink-0">1</div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">რა არის ეს?</h3>
                  <p className="text-sm leading-relaxed">ეს წრე გვეხმარება დავინახოთ კავშირი კუთხესა და კოორდინატებს შორის. მისი რადიუსი ყოველთვის 1 ერთეულია.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-indigo-50 w-8 h-8 rounded-full flex items-center justify-center text-indigo-600 font-bold shrink-0">2</div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">კოორდინატები და ფუნქციები</h3>
                  <p className="text-sm leading-relaxed">წრეზე ნებისმიერი წერტილის კოორდინატებია <span className="font-mono text-indigo-600">(cos θ, sin θ)</span>.
                  <br/>• <strong>Sin (სინუსი)</strong> არის ვერტიკალური სიმაღლე (ლურჯი).
                  <br/>• <strong>Cos (კოსინუსი)</strong> არის ჰორიზონტალური მანძილი (წითელი).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-indigo-50 w-8 h-8 rounded-full flex items-center justify-center text-indigo-600 font-bold shrink-0">3</div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">ინსტრუქცია</h3>
                  <ul className="text-sm space-y-2 list-disc pl-4 mt-1 text-slate-600">
                    <li>მოკიდეთ ხელი (მაუსი/თითი) თეთრ წერტილს წრეზე.</li>
                    <li>ატრიალეთ ის წრის გარშემო.</li>
                    <li>დააკვირდით როგორ იცვლება მარჯვნივ მონაცემები.</li>
                  </ul>
                </div>
              </div>
            </div>

            <button onClick={() => setShowTutorial(false)} className="w-full mt-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all">
              გავიგე
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
        
        {/* LEFT: Interactive Visualization */}
        <div className="flex-[2] bg-slate-900 relative min-h-[500px] flex items-center justify-center overflow-hidden select-none">
           {/* Grid Background */}
           <div className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
           </div>

           <svg 
             ref={svgRef}
             width={size} 
             height={size} 
             viewBox={`0 0 ${size} ${size}`} 
             className="cursor-pointer touch-none"
             onMouseMove={handleMouseMove}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseUp}
             onTouchMove={handleMouseMove}
             onTouchEnd={handleMouseUp}
           >
              {/* Axes */}
              <line x1="0" y1={center} x2={size} y2={center} stroke="#475569" strokeWidth="2" />
              <line x1={center} y1="0" x2={center} y2={size} stroke="#475569" strokeWidth="2" />

              {/* Unit Circle */}
              <circle cx={center} cy={center} r={radius} fill="none" stroke="#94a3b8" strokeWidth="2" />

              {/* Angle Arc */}
              <path 
                d={`M ${center + 40} ${center} A 40 40 0 ${angle > 180 ? 1 : 0} 0 ${center + Math.cos(rad)*40} ${center - Math.sin(rad)*40}`} 
                fill="rgba(255, 255, 255, 0.1)" 
                stroke="white" 
                strokeDasharray="4"
              />
              <text x={center + 20} y={center - 20} fill="white" fontSize="12">{angle}°</text>

              {/* Radius Line */}
              <line x1={center} y1={center} x2={cx} y2={cy} stroke="white" strokeWidth="2" />

              {/* Cosine Line (Horizontal - Red) */}
              <line x1={center} y1={center} x2={cx} y2={center} stroke="#ef4444" strokeWidth="4" />
              
              {/* Sine Line (Vertical - Blue) */}
              <line x1={cx} y1={center} x2={cx} y2={cy} stroke="#3b82f6" strokeWidth="4" />

              {/* Tangent Line (Orange) */}
              {/* Tangent is line from (1,0) up to the extended radius */}
              {/* Only show if cos is not close to 0 */}
              {Math.abs(cos) > 0.01 && (
                 <line 
                   x1={center + radius} 
                   y1={center} 
                   x2={center + radius} 
                   y2={center - tan * radius} 
                   stroke="#f97316" 
                   strokeWidth="2" 
                   strokeDasharray="5,5"
                   opacity="0.7"
                 />
              )}
              {/* Radius Extension for Tangent */}
              {Math.abs(cos) > 0.01 && (
                 <line
                   x1={center}
                   y1={center}
                   x2={center + radius}
                   y2={center - tan * radius}
                   stroke="white"
                   strokeWidth="1"
                   strokeDasharray="2,2"
                   opacity="0.3"
                 />
              )}

              {/* Draggable Point */}
              <circle 
                cx={cx} 
                cy={cy} 
                r="10" 
                fill="white" 
                stroke="#6366f1" 
                strokeWidth="3" 
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                className="cursor-grab active:cursor-grabbing shadow-lg"
                style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.5))' }}
              />
           </svg>

           <div className="absolute bottom-4 left-4 text-slate-400 text-xs">
              გადაადგილეთ თეთრი წერტილი წრეზე
           </div>
        </div>

        {/* RIGHT: Data Panel */}
        <div className="w-full lg:w-96 bg-white p-8 border-l border-slate-200 flex flex-col overflow-y-auto">
           <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                   <Compass className="text-indigo-600" /> ტრიგონომეტრიული წრე
                </h2>
                <p className="text-slate-500 text-sm">
                   ერთეულოვანი წრეწირი გვიჩვენებს კავშირს კუთხესა და კოორდინატებს შორის.
                </p>
              </div>
              <button onClick={() => setShowTutorial(true)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                 <HelpCircle size={24} />
              </button>
           </div>

           {/* Main Angle Display */}
           <div className="bg-slate-50 rounded-3xl p-6 text-center border border-slate-200 mb-8 shadow-inner">
              <div className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-2">კუთხე (Angle)</div>
              <div className="text-5xl font-mono font-bold text-slate-800 mb-2">{angle}°</div>
              <div className="text-indigo-600 font-mono font-bold bg-indigo-50 inline-block px-3 py-1 rounded-lg">
                 {(rad / Math.PI).toFixed(2)}π rad
              </div>
           </div>

           {/* Values */}
           <div className="space-y-4">
              {/* Sine */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                 <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-blue-700 flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Sin(θ)</span>
                    <span className="font-mono font-bold text-blue-900 text-xl">{sin.toFixed(4)}</span>
                 </div>
                 <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-75" style={{width: `${Math.abs(sin)*100}%`}}></div>
                 </div>
                 <div className="text-xs text-blue-600 mt-2 text-right">Y კოორდინატი (სიმაღლე)</div>
              </div>

              {/* Cosine */}
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                 <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-red-700 flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Cos(θ)</span>
                    <span className="font-mono font-bold text-red-900 text-xl">{cos.toFixed(4)}</span>
                 </div>
                 <div className="w-full bg-red-200 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 transition-all duration-75" style={{width: `${Math.abs(cos)*100}%`}}></div>
                 </div>
                 <div className="text-xs text-red-600 mt-2 text-right">X კოორდინატი (სიგანე)</div>
              </div>

              {/* Tangent */}
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                 <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-orange-700 flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div> Tan(θ)</span>
                    <span className="font-mono font-bold text-orange-900 text-xl">
                       {Math.abs(tan) > 100 ? '∞' : tan.toFixed(4)}
                    </span>
                 </div>
                 <div className="text-xs text-orange-600 mt-2 text-right">დახრილობა (Sin / Cos)</div>
              </div>
           </div>

           <button 
             onClick={() => setAngle(45)} 
             className="mt-8 flex items-center justify-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
           >
              <RotateCcw size={16} /> განულება
           </button>
        </div>

      </div>
    </div>
  );
};
