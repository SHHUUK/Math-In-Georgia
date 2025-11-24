
import React, { useState, useEffect } from 'react';
import { Triangle, Calculator, RefreshCw, AlertTriangle, HelpCircle, X, Info } from 'lucide-react';

interface TriangleMachineProps {
  onAddXp?: (amount: number, reason?: string) => void;
}

type InputMode = 'SSS' | 'SAS' | 'ASA';

export const TriangleMachine: React.FC<TriangleMachineProps> = ({ onAddXp }) => {
  const [mode, setMode] = useState<InputMode>('SSS');
  
  // Inputs
  const [sideA, setSideA] = useState<string>('3');
  const [sideB, setSideB] = useState<string>('4');
  const [sideC, setSideC] = useState<string>('5');
  const [angleA, setAngleA] = useState<string>('');
  const [angleB, setAngleB] = useState<string>('');
  const [angleC, setAngleC] = useState<string>('');

  // Results
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const calculate = () => {
    setError(null);
    const a = parseFloat(sideA);
    const b = parseFloat(sideB);
    const c = parseFloat(sideC);
    const angA = parseFloat(angleA);
    const angB = parseFloat(angleB);
    
    let finalA = 0, finalB = 0, finalC = 0;
    let finalAngA = 0, finalAngB = 0, finalAngC = 0;

    try {
      if (mode === 'SSS') {
        if (a + b <= c || a + c <= b || b + c <= a) {
          throw new Error("ასეთი სამკუთხედი არ არსებობს (უთანასწორობის დარღვევა)");
        }
        finalA = a; finalB = b; finalC = c;
        // Law of Cosines
        finalAngA = Math.acos((b*b + c*c - a*a) / (2*b*c)) * (180/Math.PI);
        finalAngB = Math.acos((a*a + c*c - b*b) / (2*a*c)) * (180/Math.PI);
        finalAngC = 180 - finalAngA - finalAngB;
      } 
      else if (mode === 'SAS') {
        // Side A, Angle C (between A and B? usually Angle C is between a and b), Side B
        // Let's assume user inputs Side A, Side B and Angle C (Included Angle)
        // Using Angle C input field for the included angle
        const includedAngle = parseFloat(angleC); 
        if (!a || !b || !includedAngle) throw new Error("შეიყვანეთ მონაცემები");
        
        finalA = a; finalB = b; finalAngC = includedAngle;
        const radC = includedAngle * (Math.PI/180);
        
        // Find side c
        finalC = Math.sqrt(a*a + b*b - 2*a*b*Math.cos(radC));
        
        // Find other angles
        finalAngA = Math.asin((a * Math.sin(radC)) / finalC) * (180/Math.PI);
        finalAngB = 180 - finalAngA - finalAngC;
      }
      else if (mode === 'ASA') {
        // Angle A, Side C (included), Angle B
        const sideBetween = parseFloat(sideC);
        if (!angA || !angB || !sideBetween) throw new Error("შეიყვანეთ მონაცემები");
        
        finalAngA = angA; finalAngB = angB; finalC = sideBetween;
        finalAngC = 180 - angA - angB;
        
        if (finalAngC <= 0) throw new Error("კუთხეების ჯამი 180°-ზე მეტია");

        // Sine Rule
        const radA = finalAngA * (Math.PI/180);
        const radB = finalAngB * (Math.PI/180);
        const radC = finalAngC * (Math.PI/180);
        
        finalA = (finalC * Math.sin(radA)) / Math.sin(radC);
        finalB = (finalC * Math.sin(radB)) / Math.sin(radC);
      }

      // Calculate Area (Heron)
      const s = (finalA + finalB + finalC) / 2;
      const area = Math.sqrt(s * (s-finalA) * (s-finalB) * (s-finalC));
      
      setResults({
        a: finalA, b: finalB, c: finalC,
        angA: finalAngA, angB: finalAngB, angC: finalAngC,
        area: area,
        perimeter: finalA + finalB + finalC
      });

      if(onAddXp) onAddXp(10, 'სამკუთხედის ამოხსნა');

    } catch (err: any) {
      setError(err.message || "შეცდომა გამოთვლისას");
      setResults(null);
    }
  };

  // Coordinates for SVG
  const getPoints = () => {
    if (!results) return "0,0 0,0 0,0";
    
    // Scale logic to fit 500x400 box
    const maxSide = Math.max(results.a, results.b, results.c);
    const scale = 300 / maxSide;
    
    // Point A at (50, 350) - bottom left roughly
    // Point B at (50 + c*scale, 350)
    // Point C calculated using Angle A
    
    const Ax = 50;
    const Ay = 350;
    
    const Bx = 50 + results.c * scale;
    const By = 350;
    
    const radA = results.angA * (Math.PI/180);
    const Cx = Ax + (results.b * scale) * Math.cos(radA);
    const Cy = Ay - (results.b * scale) * Math.sin(radA); // Subtract Y because SVG Y is down
    
    return `${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`;
  };

  useEffect(() => {
    calculate();
  }, [mode]); // Recalculate on mode change reset

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
                <h2 className="text-2xl font-bold text-slate-800">სამკუთხედის კალკულატორი</h2>
                <p className="text-slate-500">გზამკვლევი</p>
              </div>
            </div>

            <div className="space-y-6 text-slate-700">
              <div className="flex gap-4">
                <div className="bg-indigo-50 w-8 h-8 rounded-full flex items-center justify-center text-indigo-600 font-bold shrink-0">1</div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">დანიშნულება</h3>
                  <p className="text-sm leading-relaxed">ეს ინსტრუმენტი პოულობს სამკუთხედის ყველა უცნობ გვერდს, კუთხეს და ფართობს.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-indigo-50 w-8 h-8 rounded-full flex items-center justify-center text-indigo-600 font-bold shrink-0">2</div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">რეჟიმები</h3>
                  <ul className="text-sm space-y-2 list-disc pl-4 mt-1 text-slate-600">
                    <li><strong>SSS</strong> - ვიცით სამივე გვერდი.</li>
                    <li><strong>SAS</strong> - ვიცით 2 გვერდი და მათ შორის მდებარე კუთხე.</li>
                    <li><strong>ASA</strong> - ვიცით 1 გვერდი და მასთან მდებარე 2 კუთხე.</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-indigo-50 w-8 h-8 rounded-full flex items-center justify-center text-indigo-600 font-bold shrink-0">3</div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">როგორ გამოვიყენო?</h3>
                  <p className="text-sm leading-relaxed">აირჩიეთ რეჟიმი, ჩაწერეთ ცნობილი მონაცემები და დააჭირეთ "გამოთვლას". სისტემა ავტომატურად დახატავს სამკუთხედს.</p>
                </div>
              </div>
            </div>

            <button onClick={() => setShowTutorial(false)} className="w-full mt-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all">
              დავიწყოთ
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
        
        {/* LEFT: Controls */}
        <div className="w-full lg:w-96 bg-white p-8 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col">
           <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                   <Triangle className="text-indigo-600" fill="currentColor" /> სამკუთხედის ოსტატი
                </h2>
                <p className="text-slate-500 text-sm">
                   შეიყვანეთ მონაცემები და იპოვეთ დანარჩენი.
                </p>
              </div>
              <button onClick={() => setShowTutorial(true)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                 <HelpCircle size={24} />
              </button>
           </div>

           {/* Mode Selection */}
           <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setMode('SSS')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'SSS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>SSS (3 გვერდი)</button>
              <button onClick={() => setMode('SAS')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'SAS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>SAS (2 გვ. 1 კუთხე)</button>
              <button onClick={() => setMode('ASA')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'ASA' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>ASA (1 გვ. 2 კუთხე)</button>
           </div>

           <div className="space-y-4 flex-1">
              {mode === 'SSS' && (
                <>
                  <InputGroup label="გვერდი a" val={sideA} set={setSideA} color="text-blue-600" />
                  <InputGroup label="გვერდი b" val={sideB} set={setSideB} color="text-green-600" />
                  <InputGroup label="გვერდი c" val={sideC} set={setSideC} color="text-red-600" />
                </>
              )}
              {mode === 'SAS' && (
                <>
                  <InputGroup label="გვერდი a" val={sideA} set={setSideA} color="text-blue-600" />
                  <InputGroup label="კუთხე C (მათ შორის)" val={angleC} set={setAngleC} color="text-orange-600" isAngle />
                  <InputGroup label="გვერდი b" val={sideB} set={setSideB} color="text-green-600" />
                </>
              )}
              {mode === 'ASA' && (
                <>
                  <InputGroup label="კუთხე A" val={angleA} set={setAngleA} color="text-purple-600" isAngle />
                  <InputGroup label="გვერდი c (მათ შორის)" val={sideC} set={setSideC} color="text-red-600" />
                  <InputGroup label="კუთხე B" val={angleB} set={setAngleB} color="text-purple-600" isAngle />
                </>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 font-bold">
                   <AlertTriangle size={16} /> {error}
                </div>
              )}
           </div>

           <button onClick={calculate} className="mt-6 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all">
              <Calculator size={20} /> გამოთვლა
           </button>
        </div>

        {/* RIGHT: Visualization & Results */}
        <div className="flex-[2] bg-slate-50 p-8 flex flex-col">
           
           {/* Canvas */}
           <div className="flex-1 bg-white rounded-3xl shadow-inner border border-slate-200 relative flex items-center justify-center overflow-hidden min-h-[300px] mb-6">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
              
              {results ? (
                 <svg width="100%" height="100%" viewBox="0 0 500 400" className="w-full h-full">
                    <polygon 
                      points={getPoints()} 
                      fill="rgba(99, 102, 241, 0.1)" 
                      stroke="#4f46e5" 
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                    {/* Corner Labels could be calculated but for simple visualization we skip text labels inside SVG to avoid overlap complexity */}
                 </svg>
              ) : (
                 <div className="text-slate-400 flex flex-col items-center">
                    <Triangle size={64} strokeWidth={1} className="mb-2" />
                    <p>შეიყვანეთ მონაცემები ვიზუალიზაციისთვის</p>
                 </div>
              )}
           </div>

           {/* Results Grid */}
           {results && (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ResultCard label="გვერდი a" value={results.a.toFixed(2)} color="bg-blue-50 text-blue-700" />
                <ResultCard label="გვერდი b" value={results.b.toFixed(2)} color="bg-green-50 text-green-700" />
                <ResultCard label="გვერდი c" value={results.c.toFixed(2)} color="bg-red-50 text-red-700" />
                <ResultCard label="პერიმეტრი" value={results.perimeter.toFixed(2)} color="bg-slate-100 text-slate-700" />
                
                <ResultCard label="კუთხე A" value={results.angA.toFixed(1) + '°'} color="bg-purple-50 text-purple-700" />
                <ResultCard label="კუთხე B" value={results.angB.toFixed(1) + '°'} color="bg-purple-50 text-purple-700" />
                <ResultCard label="კუთხე C" value={results.angC.toFixed(1) + '°'} color="bg-purple-50 text-purple-700" />
                <ResultCard label="ფართობი" value={results.area.toFixed(2)} color="bg-amber-50 text-amber-700" highlight />
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

const InputGroup = ({ label, val, set, color, isAngle }: any) => (
  <div>
     <label className={`text-xs font-bold uppercase mb-1 block ${color}`}>{label}</label>
     <input 
       type="number" 
       value={val} 
       onChange={(e) => set(e.target.value)} 
       className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-slate-900"
       placeholder={isAngle ? "°" : "0"}
     />
  </div>
);

const ResultCard = ({ label, value, color, highlight }: any) => (
  <div className={`p-3 rounded-xl border border-transparent ${color} ${highlight ? 'ring-2 ring-amber-200 shadow-sm' : ''}`}>
     <div className="text-[10px] font-bold uppercase opacity-70 mb-1">{label}</div>
     <div className="text-xl font-bold font-mono">{value}</div>
  </div>
);
