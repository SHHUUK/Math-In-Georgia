
import React, { useState, useEffect } from 'react';
import { 
  Calculator as CalcIcon, RefreshCw, Scale, Zap, 
  Coins, ArrowRight, History, Trash2, Divide, X
} from 'lucide-react';

type CalcMode = 'scientific' | 'units' | 'currency' | 'physics';

export const Calculator: React.FC = () => {
  const [mode, setMode] = useState<CalcMode>('scientific');
  
  // --- Scientific State ---
  const [display, setDisplay] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  // --- Converter State ---
  const [convCategory, setConvCategory] = useState('length');
  const [convValue, setConvValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const [convResult, setConvResult] = useState('');

  // --- Physics State ---
  const [physicsFormula, setPhysicsFormula] = useState('velocity');
  const [physicsInputs, setPhysicsInputs] = useState<Record<string, string>>({ a: '', b: '' });
  const [physicsResult, setPhysicsResult] = useState<string | null>(null);

  // --- Scientific Logic ---
  
  // Advanced Evaluation Function
  const evaluateExpression = (expr: string): string => {
    try {
      // 1. Handle Factorials (e.g., 5!)
      // Regex to find number followed by !
      let parsed = expr;
      while (parsed.includes('!')) {
        parsed = parsed.replace(/(\d+)!/g, (_, n) => {
          let num = parseInt(n);
          let res = 1;
          for (let i = 2; i <= num; i++) res *= i;
          return res.toString();
        });
      }

      // 2. Replace Visual Symbols with JS Math
      parsed = parsed
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/∛\(/g, 'Math.cbrt(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/\^/g, '**')
        .replace(/mod/g, '%');

      // eslint-disable-next-line no-new-func
      const res = new Function('return ' + parsed)();
      
      if (!isFinite(res) || isNaN(res)) return 'Error';
      return Number.isInteger(res) ? res.toString() : res.toFixed(6).replace(/\.?0+$/, '');
    } catch (e) {
      return 'Error';
    }
  };

  const handleBtnClick = (val: string) => {
    if (val === 'C') {
      setDisplay('');
      setResult('');
    } else if (val === 'DEL') {
      setDisplay(prev => prev.slice(0, -1));
    } else if (val === '=') {
      const res = evaluateExpression(display);
      setResult(res);
      if (res !== 'Error') {
        setHistory(prev => [`${display} = ${res}`, ...prev].slice(0, 10));
      }
    } else if (val === 'x²') {
      setDisplay(prev => prev + '^2');
    } else if (val === 'x³') {
      setDisplay(prev => prev + '^3');
    } else if (val === 'xʸ') {
      setDisplay(prev => prev + '^');
    } else if (val === '√') {
      setDisplay(prev => prev + '√(');
    } else if (val === '∛') {
      setDisplay(prev => prev + '∛(');
    } else if (val === 'mod') {
      setDisplay(prev => prev + 'mod');
    } else if (val === 'log') {
      setDisplay(prev => prev + 'log(');
    } else if (val === 'ln') {
      setDisplay(prev => prev + 'ln(');
    } else if (val === 'n!') {
      setDisplay(prev => prev + '!');
    } else if (['sin', 'cos', 'tan', 'abs'].includes(val)) {
      setDisplay(prev => prev + val + '(');
    } else {
      // Prevent multiple operators
      const ops = ['+', '-', '×', '÷', '^', '.', '%'];
      if (ops.includes(val) && ops.includes(display.slice(-1))) {
        return; 
      }
      setDisplay(prev => prev + val);
    }
  };

  // --- Converter Logic ---
  const conversionRates: Record<string, number> = {
    // Length (base: meter)
    mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, ft: 0.3048, mile: 1609.34,
    // Weight (base: gram)
    mg: 0.001, g: 1, kg: 1000, ton: 1000000, oz: 28.3495, lb: 453.592,
    // Time (base: second)
    sec: 1, min: 60, hour: 3600, day: 86400,
  };

  useEffect(() => {
    if (mode === 'units') {
      const fromRate = conversionRates[fromUnit];
      const toRate = conversionRates[toUnit];
      if (fromRate && toRate) {
        const val = parseFloat(convValue) || 0;
        const baseValue = val * fromRate;
        const finalValue = baseValue / toRate;
        setConvResult(Number.isInteger(finalValue) ? finalValue.toString() : finalValue.toFixed(6));
      }
    }
  }, [convValue, fromUnit, toUnit, mode]);

  // --- Currency Logic (Updated Approx Rates Relative to GEL) ---
  // Rates are approximate as of late 2024/2025 context
  const currencyRates: Record<string, number> = {
    GEL: 1.00,
    USD: 2.75, // 1 USD = 2.75 GEL
    EUR: 2.95, // 1 EUR = 2.95 GEL
    GBP: 3.50, // 1 GBP = 3.50 GEL
    TRY: 0.08, // 1 TRY = 0.08 GEL
    RUB: 0.028 // 1 RUB = 0.028 GEL
  };
  
  const calculateCurrency = () => {
    const val = parseFloat(convValue) || 0;
    // Convert FROM unit to GEL (Base), then from GEL to TO unit
    // Formula: (Value * Rate_of_From) / Rate_of_To
    // NOTE: The rates map above is "Price of 1 Unit in GEL".
    const result = (val * currencyRates[fromUnit]) / currencyRates[toUnit];
    return result.toFixed(2);
  };

  // --- Physics Logic ---
  const physicsFormulas = {
    velocity: { 
      title: 'სიჩქარე (V = d/t)', 
      inputs: { d: 'მანძილი (m)', t: 'დრო (s)' }, 
      calc: (v: any) => Number(v.d) / Number(v.t) 
    },
    force: { 
      title: 'ძალა (F = ma)', 
      inputs: { m: 'მასა (kg)', a: 'აჩქარება (m/s²)' }, 
      calc: (v: any) => Number(v.m) * Number(v.a) 
    },
    density: { 
      title: 'სიმკვრივე (ρ = m/V)', 
      inputs: { m: 'მასა (kg)', v: 'მოცულობა (m³)' }, 
      calc: (v: any) => Number(v.m) / Number(v.v) 
    },
    ohm: { 
      title: 'ომის კანონი (I = V/R)', 
      inputs: { v: 'ძაბვა (V)', r: 'წინაღობა (Ω)' }, 
      calc: (v: any) => Number(v.v) / Number(v.r) 
    },
    kinetic: { 
      title: 'კინეტიკური ენერგია (Ek = mv²/2)', 
      inputs: { m: 'მასა (kg)', v: 'სიჩქარე (m/s)' }, 
      calc: (v: any) => 0.5 * Number(v.m) * Math.pow(Number(v.v), 2) 
    },
  };

  const calculatePhysics = () => {
    const formula = physicsFormulas[physicsFormula as keyof typeof physicsFormulas];
    if (!formula) return;
    
    const res = formula.calc(physicsInputs);
    setPhysicsResult(Number.isInteger(res) ? res.toString() : res.toFixed(4));
  };

  // --- RENDER HELPERS ---
  
  const ModeButton = ({ id, icon: Icon, label }: { id: CalcMode, icon: any, label: string }) => (
    <button 
      onClick={() => setMode(id)}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-medium flex-1 justify-center
        ${mode === id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-indigo-50'}`}
    >
      <Icon size={18} />
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  // Scientific Buttons Layout
  // Added 'text-slate-900' and 'border' to white buttons to ensure visibility
  const sciButtons = [
    { l: '2nd', v: '2nd', c: 'text-indigo-600 bg-indigo-50 border border-indigo-100' }, { l: 'π', v: 'π', c: 'bg-slate-100 text-slate-800' }, { l: 'e', v: 'e', c: 'bg-slate-100 text-slate-800' }, { l: 'C', v: 'C', c: 'text-red-600 bg-red-50 border border-red-100' }, { l: 'DEL', v: 'DEL', c: 'text-red-600 bg-red-50 border border-red-100' },
    { l: 'x²', v: 'x²', c: 'bg-slate-100 text-slate-800' }, { l: '1/x', v: '^(-1)', c: 'bg-slate-100 text-slate-800' }, { l: '|x|', v: 'abs', c: 'bg-slate-100 text-slate-800' }, { l: 'mod', v: 'mod', c: 'bg-slate-100 text-slate-800' }, { l: '÷', v: '÷', c: 'text-indigo-700 bg-indigo-50 border border-indigo-100' },
    { l: '√x', v: '√', c: 'bg-slate-100 text-slate-800' }, { l: '(', v: '(', c: 'bg-slate-100 text-slate-800' }, { l: ')', v: ')', c: 'bg-slate-100 text-slate-800' }, { l: 'n!', v: 'n!', c: 'bg-slate-100 text-slate-800' }, { l: '×', v: '×', c: 'text-indigo-700 bg-indigo-50 border border-indigo-100' },
    { l: 'xʸ', v: 'xʸ', c: 'bg-slate-100 text-slate-800' }, { l: '7', v: '7', c: 'bg-white text-slate-900 text-xl border border-slate-200' }, { l: '8', v: '8', c: 'bg-white text-slate-900 text-xl border border-slate-200' }, { l: '9', v: '9', c: 'bg-white text-slate-900 text-xl border border-slate-200' }, { l: '-', v: '-', c: 'text-indigo-700 bg-indigo-50 border border-indigo-100' },
    { l: '10ˣ', v: '10^', c: 'bg-slate-100 text-slate-800' }, { l: '4', v: '4', c: 'bg-white text-slate-900 text-xl border border-slate-200' }, { l: '5', v: '5', c: 'bg-white text-slate-900 text-xl border border-slate-200' }, { l: '6', v: '6', c: 'bg-white text-slate-900 text-xl border border-slate-200' }, { l: '+', v: '+', c: 'text-indigo-700 bg-indigo-50 border border-indigo-100' },
    { l: 'log', v: 'log', c: 'bg-slate-100 text-slate-800' }, { l: '1', v: '1', c: 'bg-white text-slate-900 text-xl border border-slate-200' }, { l: '2', v: '2', c: 'bg-white text-slate-900 text-xl border border-slate-200' }, { l: '3', v: '3', c: 'bg-white text-slate-900 text-xl border border-slate-200' }, { l: '=', v: '=', c: 'row-span-2 bg-indigo-600 text-white text-2xl shadow-lg hover:bg-indigo-700' },
    { l: 'ln', v: 'ln', c: 'bg-slate-100 text-slate-800' }, { l: 'x³', v: 'x³', c: 'bg-slate-100 text-slate-800' }, { l: '0', v: '0', c: 'bg-white text-slate-900 text-xl border border-slate-200' }, { l: '.', v: '.', c: 'bg-white text-slate-900 text-xl border border-slate-200' }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-3xl shadow-xl border border-slate-200 overflow-hidden max-w-6xl mx-auto">
      
      {/* Header / Tabs */}
      <div className="bg-slate-100 p-2 flex gap-2 overflow-x-auto">
        <ModeButton id="scientific" icon={CalcIcon} label="სამეცნიერო" />
        <ModeButton id="units" icon={RefreshCw} label="გადამყვანი" />
        <ModeButton id="currency" icon={Coins} label="ვალუტა" />
        <ModeButton id="physics" icon={Zap} label="ფიზიკა" />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        
        {/* === SCIENTIFIC CALCULATOR === */}
        {mode === 'scientific' && (
          <div className="h-full flex flex-col lg:flex-row gap-6">
             {/* Keypad & Display */}
             <div className="flex-1 flex flex-col gap-4">
                <div className="bg-slate-900 p-6 rounded-2xl text-right shadow-inner min-h-[120px] flex flex-col justify-end relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                  <div className="text-slate-400 text-sm font-mono tracking-wider h-6 overflow-hidden">{history[0] ? history[0].split('=')[0] : ''}</div>
                  <div className="text-white text-4xl font-bold tracking-widest break-all font-mono flex-wrap">
                    {display || '0'}
                  </div>
                  <div className="text-indigo-300 text-xl font-mono mt-2 h-8">{result}</div>
                </div>

                <div className="grid grid-cols-5 gap-2 md:gap-3 flex-1">
                   {sciButtons.map((btn) => (
                     <button 
                       key={btn.l} 
                       onClick={() => handleBtnClick(btn.v)} 
                       className={`p-3 md:p-4 rounded-xl font-bold shadow-sm transition-all hover:brightness-95 active:scale-95 flex items-center justify-center ${btn.c}`}
                     >
                       {btn.l}
                     </button>
                   ))}
                </div>
             </div>

             {/* History Panel */}
             <div className="w-full lg:w-72 bg-white border border-slate-200 rounded-2xl p-4 hidden lg:flex flex-col h-full shadow-sm">
               <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                 <h3 className="font-bold text-slate-700 flex items-center gap-2"><History size={18} className="text-indigo-500"/> გამოთვლები</h3>
                 <button onClick={() => setHistory([])} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
               </div>
               <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                 {history.length === 0 && (
                   <div className="flex flex-col items-center justify-center h-40 text-slate-300 gap-2">
                     <History size={32} />
                     <span className="text-xs">ისტორია ცარიელია</span>
                   </div>
                 )}
                 {history.map((item, idx) => (
                   <div key={idx} className="group relative p-3 bg-slate-50 rounded-xl text-right hover:bg-indigo-50 hover:shadow-md cursor-pointer transition-all border border-transparent hover:border-indigo-100" onClick={() => setDisplay(item.split('=')[0].trim())}>
                     <div className="text-xs text-slate-400 mb-1">{item.split('=')[0]}</div>
                     <div className="text-lg font-mono font-bold text-indigo-600">{item.split('=')[1]}</div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}

        {/* === CONVERTER & CURRENCY === */}
        {(mode === 'units' || mode === 'currency') && (
          <div className="max-w-2xl mx-auto flex flex-col gap-8 animate-fadeIn py-10">
             <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
               <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${mode === 'units' ? 'bg-indigo-100 text-indigo-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {mode === 'units' ? <Scale size={24}/> : <Coins size={24} />}
                  </div>
                  {mode === 'units' ? 'ერთეულების გადაყვანა' : 'ვალუტის კურსი'}
               </h2>

               {mode === 'units' && (
                 <div className="flex gap-2 mb-8 p-1.5 bg-slate-100 rounded-xl overflow-x-auto">
                   {['length', 'weight', 'time'].map(cat => (
                     <button 
                      key={cat}
                      onClick={() => {
                        setConvCategory(cat); 
                        setFromUnit(cat === 'length' ? 'm' : cat === 'weight' ? 'kg' : 'min');
                        setToUnit(cat === 'length' ? 'km' : cat === 'weight' ? 'lb' : 'hour');
                      }}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${convCategory === cat ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                       {cat === 'length' ? 'სიგრძე' : cat === 'weight' ? 'წონა' : 'დრო'}
                     </button>
                   ))}
                 </div>
               )}

               <div className="flex flex-col md:flex-row gap-6 items-center">
                 {/* Input Side */}
                 <div className="flex-1 w-full space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">საიდან</label>
                    <div className="relative">
                       <input 
                         type="number" 
                         value={convValue}
                         onChange={(e) => setConvValue(e.target.value)}
                         className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-2xl font-mono outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900"
                       />
                    </div>
                    <select 
                      value={fromUnit}
                      onChange={(e) => setFromUnit(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-white font-medium text-slate-700 cursor-pointer hover:border-indigo-300 transition-colors"
                    >
                      {mode === 'currency' 
                        ? Object.keys(currencyRates).map(u => <option key={u} value={u}>{u}</option>)
                        : Object.keys(conversionRates).filter(u => {
                           if(convCategory === 'length') return ['mm','cm','m','km','inch','ft','mile'].includes(u);
                           if(convCategory === 'weight') return ['mg','g','kg','ton','oz','lb'].includes(u);
                           return ['sec','min','hour','day'].includes(u);
                        }).map(u => <option key={u} value={u}>{u}</option>)
                      }
                    </select>
                 </div>

                 <div className="bg-slate-100 p-3 rounded-full text-slate-400 rotate-90 md:rotate-0">
                    <ArrowRight size={24} />
                 </div>

                 {/* Output Side */}
                 <div className="flex-1 w-full space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">სადამდე</label>
                    <div className="w-full p-4 bg-indigo-600 border border-indigo-500 rounded-xl text-2xl font-mono text-white font-bold min-h-[66px] flex items-center shadow-md">
                       {mode === 'currency' ? calculateCurrency() : convResult}
                    </div>
                    <select 
                      value={toUnit}
                      onChange={(e) => setToUnit(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-white font-medium text-slate-700 cursor-pointer hover:border-indigo-300 transition-colors"
                    >
                       {mode === 'currency' 
                        ? Object.keys(currencyRates).map(u => <option key={u} value={u}>{u}</option>)
                        : Object.keys(conversionRates).filter(u => {
                           if(convCategory === 'length') return ['mm','cm','m','km','inch','ft','mile'].includes(u);
                           if(convCategory === 'weight') return ['mg','g','kg','ton','oz','lb'].includes(u);
                           return ['sec','min','hour','day'].includes(u);
                        }).map(u => <option key={u} value={u}>{u}</option>)
                      }
                    </select>
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* === PHYSICS CALCULATOR === */}
        {mode === 'physics' && (
          <div className="max-w-4xl mx-auto animate-fadeIn py-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* Sidebar List */}
               <div className="md:col-span-1 space-y-2">
                 {Object.entries(physicsFormulas).map(([key, data]) => (
                   <button
                     key={key}
                     onClick={() => { 
                        setPhysicsFormula(key); 
                        setPhysicsResult(null);
                        setPhysicsInputs({});
                     }}
                     className={`w-full text-left p-4 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${physicsFormula === key ? 'bg-indigo-600 text-white shadow-lg scale-[1.02]' : 'bg-white hover:bg-indigo-50 text-slate-600 border border-slate-100'}`}
                   >
                     {data.title.split('(')[0]}
                     {physicsFormula === key && <Zap size={16} className="animate-pulse" />}
                   </button>
                 ))}
               </div>

               {/* Main Calculation Area */}
               <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Zap size={100} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-800 mb-8 pb-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                       <Zap size={24} />
                    </div>
                    {physicsFormulas[physicsFormula as keyof typeof physicsFormulas].title}
                  </h3>

                  <div className="space-y-6 relative z-10">
                    {Object.entries(physicsFormulas[physicsFormula as keyof typeof physicsFormulas].inputs).map(([key, label]) => (
                      <div key={key}>
                        <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide ml-1">{label}</label>
                        <input 
                          type="number"
                          value={physicsInputs[key] || ''}
                          onChange={(e) => setPhysicsInputs({...physicsInputs, [key]: e.target.value})}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-lg transition-all text-slate-900"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={calculatePhysics}
                    className="w-full mt-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Zap size={20} />
                    გამოთვლა
                  </button>

                  {physicsResult !== null && (
                    <div className="mt-8 bg-green-50 border border-green-200 p-6 rounded-2xl text-center animate-in zoom-in duration-300">
                      <span className="text-xs text-green-600 font-bold uppercase tracking-widest mb-2 block">პასუხი</span>
                      <div className="text-4xl font-mono font-bold text-green-700">{physicsResult}</div>
                    </div>
                  )}
               </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};
