
import React, { useState } from 'react';
import { Triangle, Ruler, CheckCircle2, RefreshCcw, HelpCircle, X, Info } from 'lucide-react';

interface PythagorasMachineProps {
  onAddXp?: (amount: number, reason?: string) => void;
}

export const PythagorasMachine: React.FC<PythagorasMachineProps> = ({ onAddXp }) => {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const c = Math.sqrt(a * a + b * b);
  
  // Visualization Constants
  const scale = 35; // Pixels per unit
  const ox = 300;   // Origin X
  const oy = 400;   // Origin Y

  // Coordinates
  const C = { x: ox, y: oy };
  const A_pt = { x: ox, y: oy - a * scale };
  const B_pt = { x: ox + b * scale, y: oy };

  // Square A (Left)
  const SqA_pts = [
    C, A_pt, 
    { x: ox - a * scale, y: oy - a * scale }, 
    { x: ox - a * scale, y: oy }
  ];

  // Square B (Bottom)
  const SqB_pts = [
    C, B_pt, 
    { x: ox + b * scale, y: oy + b * scale }, 
    { x: ox, y: oy + b * scale }
  ];

  // Square C (Hypotenuse)
  const normalX = a * scale;
  const normalY = -b * scale;
  
  const SqC_pts = [
    A_pt, B_pt,
    { x: B_pt.x + normalX, y: B_pt.y + normalY },
    { x: A_pt.x + normalX, y: A_pt.y + normalY }
  ];

  const polyStr = (pts: {x:number, y:number}[]) => pts.map(p => `${p.x},${p.y}`).join(' ');

  const handleVerify = () => {
    setIsVerifying(true);
    setVerified(false);
    setTimeout(() => {
      setIsVerifying(false);
      setVerified(true);
      if (onAddXp) onAddXp(15, 'პითაგორას თეორემის შემოწმება');
    }, 1500);
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
                <h2 className="text-2xl font-bold text-slate-800">ინსტრუქცია</h2>
                <p className="text-slate-500">პითაგორას თეორემის ვიზუალიზაცია</p>
              </div>
            </div>

            <div className="space-y-6 text-slate-700">
              <div className="flex gap-4">
                <div className="bg-indigo-50 w-8 h-8 rounded-full flex items-center justify-center text-indigo-600 font-bold shrink-0">1</div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">რა არის ეს?</h3>
                  <p className="text-sm leading-relaxed">ეს ინსტრუმენტი ვიზუალურად ამტკიცებს ფორმულას <span className="font-mono font-bold">a² + b² = c²</span>.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-indigo-50 w-8 h-8 rounded-full flex items-center justify-center text-indigo-600 font-bold shrink-0">2</div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">როგორ მუშაობს?</h3>
                  <p className="text-sm leading-relaxed">თეორემა ამბობს, რომ კათეტებზე (a და b) აგებული კვადრატების ფართობების ჯამი ზუსტად უდრის ჰიპოტენუზაზე (c) აგებული კვადრატის ფართობს.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-indigo-50 w-8 h-8 rounded-full flex items-center justify-center text-indigo-600 font-bold shrink-0">3</div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">გამოყენება</h3>
                  <ul className="text-sm space-y-2 list-disc pl-4 mt-1 text-slate-600">
                    <li>შეცვალეთ <strong>a</strong> და <strong>b</strong> გვერდების სიგრძე სლაიდერებით.</li>
                    <li>დააჭირეთ <strong>შემოწმებას</strong>.</li>
                    <li>დააკვირდით ფერებს: როცა სისტემა "მწვანდება", ეს ნიშნავს რომ ტოლობა დადასტურდა.</li>
                  </ul>
                </div>
              </div>
            </div>

            <button onClick={() => setShowTutorial(false)} className="w-full mt-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all">
              გასაგებია
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
        
        {/* LEFT: Visualization */}
        <div className="flex-1 bg-slate-900 relative min-h-[500px] overflow-hidden flex items-center justify-center cursor-move">
           {/* Grid Background */}
           <div className="absolute inset-0 opacity-20 pointer-events-none" 
                style={{backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '35px 35px'}}>
           </div>

           <svg width="100%" height="100%" viewBox="0 0 800 600" className="absolute inset-0 pointer-events-none">
              {/* Triangle */}
              <polygon points={polyStr([C, A_pt, B_pt])} fill="#ffffff" stroke="none" opacity="0.9" />
              
              {/* Square A */}
              <g className="transition-all duration-500 ease-out">
                 <polygon points={polyStr(SqA_pts)} fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="2" />
                 <text x={ox - (a*scale)/2} y={oy - (a*scale)/2} textAnchor="middle" dominantBaseline="middle" fill="#ef4444" fontWeight="bold" fontSize="16">
                    a² = {a * a}
                 </text>
              </g>

              {/* Square B */}
              <g className="transition-all duration-500 ease-out">
                 <polygon points={polyStr(SqB_pts)} fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="2" />
                 <text x={ox + (b*scale)/2} y={oy + (b*scale)/2} textAnchor="middle" dominantBaseline="middle" fill="#3b82f6" fontWeight="bold" fontSize="16">
                    b² = {b * b}
                 </text>
              </g>

              {/* Square C */}
              <g className={`transition-all duration-1000 ease-out ${verified ? 'opacity-100' : 'opacity-80'}`}>
                 <polygon points={polyStr(SqC_pts)} fill={verified ? "rgba(34, 197, 94, 0.4)" : "rgba(168, 85, 247, 0.2)"} stroke={verified ? "#22c55e" : "#a855f7"} strokeWidth="3" />
                 <text x={A_pt.x + (b*scale)/2 + normalX/2} y={A_pt.y + (a*scale)/2 + normalY/2} textAnchor="middle" dominantBaseline="middle" fill={verified ? "#22c55e" : "#a855f7"} fontWeight="bold" fontSize="18">
                    c² = {c.toFixed(2)}² ≈ {(c*c).toFixed(1)}
                 </text>
              </g>

              {/* Labels */}
              <text x={ox - 15} y={oy - (a*scale)/2} fill="white" fontSize="12">a={a}</text>
              <text x={ox + (b*scale)/2} y={oy + 15} fill="white" fontSize="12">b={b}</text>
              <text x={ox + (b*scale)/2 - 20} y={oy - (a*scale)/2 - 20} fill="white" fontSize="12">c={c.toFixed(2)}</text>
           </svg>
        </div>

        {/* RIGHT: Controls */}
        <div className="w-full lg:w-96 bg-white p-8 border-l border-slate-200 flex flex-col">
           <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                   <Triangle className="text-indigo-600" /> პითაგორას მანქანა
                </h2>
                <p className="text-slate-500 text-sm">
                   შეცვალეთ კათეტების სიგრძე და დააკვირდით, როგორ იცვლება კვადრატების ფართობები.
                </p>
              </div>
              <button onClick={() => setShowTutorial(true)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                 <HelpCircle size={24} />
              </button>
           </div>

           <div className="space-y-8 mb-8">
              {/* Control A */}
              <div>
                 <div className="flex justify-between items-center mb-2">
                    <label className="font-bold text-slate-700 text-sm uppercase flex items-center gap-2"><Ruler size={16} className="text-red-500"/> კათეტი a</label>
                 </div>
                 <div className="flex gap-3 items-center">
                    <input 
                      type="range" min="1" max="12" step="1" 
                      value={a} onChange={e => {setA(Number(e.target.value)); setVerified(false);}}
                      className="flex-1 accent-red-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="number"
                      min="1" max="12"
                      value={a}
                      onChange={e => {
                        const val = Math.max(1, Math.min(12, Number(e.target.value)));
                        setA(val);
                        setVerified(false);
                      }}
                      className="w-16 p-2 border border-slate-300 rounded-lg text-center font-bold text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
                    />
                 </div>
              </div>

              {/* Control B */}
              <div>
                 <div className="flex justify-between items-center mb-2">
                    <label className="font-bold text-slate-700 text-sm uppercase flex items-center gap-2"><Ruler size={16} className="text-blue-500"/> კათეტი b</label>
                 </div>
                 <div className="flex gap-3 items-center">
                    <input 
                      type="range" min="1" max="12" step="1" 
                      value={b} onChange={e => {setB(Number(e.target.value)); setVerified(false);}}
                      className="flex-1 accent-blue-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="number"
                      min="1" max="12"
                      value={b}
                      onChange={e => {
                        const val = Math.max(1, Math.min(12, Number(e.target.value)));
                        setB(val);
                        setVerified(false);
                      }}
                      className="w-16 p-2 border border-slate-300 rounded-lg text-center font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                 </div>
              </div>
           </div>

           <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8">
              <div className="flex justify-between items-center mb-2 border-b border-slate-200 pb-2">
                 <span className="text-slate-600 font-mono">a² + b²</span>
                 <span className="font-bold text-slate-800">{a*a} + {b*b} = {a*a + b*b}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-slate-600 font-mono">c²</span>
                 <span className="font-bold text-indigo-600">{c.toFixed(2)}² ≈ {(c*c).toFixed(0)}</span>
              </div>
           </div>

           <div className="mt-auto">
              <button 
                onClick={handleVerify}
                disabled={isVerifying || verified}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${verified ? 'bg-green-500 text-white cursor-default' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.02]'}`}
              >
                 {isVerifying ? 'მოწმდება...' : verified ? <><CheckCircle2 /> დამტკიცებულია</> : <><RefreshCcw /> შემოწმება</>}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};
