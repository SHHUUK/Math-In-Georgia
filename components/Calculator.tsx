
import React, { useState, useEffect } from 'react';
import { 
  Calculator as CalcIcon, RefreshCw, Scale, Zap, 
  Coins, ArrowRight, History, Trash2, Divide, X, Circle,
  MoveRight, DollarSign
} from 'lucide-react';

type CalcMode = 'scientific' | 'units' | 'currency' | 'physics';

export const Calculator: React.FC = () => {
  const [mode, setMode] = useState<CalcMode>('scientific');
  
  // --- Scientific State ---
  const [display, setDisplay] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [isRadians, setIsRadians] = useState(false); // Default to Degrees

  // --- Converter State ---
  const [convCategory, setConvCategory] = useState('length');
  const [convValue, setConvValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const [convResult, setConvResult] = useState('');

  // --- Currency State ---
  const [currAmount, setCurrAmount] = useState('100');
  const [currFrom, setCurrFrom] = useState('USD');
  const [currTo, setCurrTo] = useState('GEL');
  const [currResult, setCurrResult] = useState('');

  // --- Physics State ---
  const [physicsFormula, setPhysicsFormula] = useState('velocity');
  const [physicsInputs, setPhysicsInputs] = useState<Record<string, string>>({ d: '', t: '' });
  const [physicsResult, setPhysicsResult] = useState<string | null>(null);

  // --- Scientific Logic ---
  const evaluateExpression = (expr: string): string => {
    try {
      let parsed = expr;

      // Handle Factorials
      while (parsed.includes('!')) {
        parsed = parsed.replace(/(\d+)!/g, (_, n) => {
          let num = parseInt(n);
          let res = 1;
          for (let i = 2; i <= num; i++) res *= i;
          return res.toString();
        });
      }

      // Handle Degrees/Radians for Trig
      const trigFuncs = ['sin', 'cos', 'tan'];
      if (!isRadians) {
        trigFuncs.forEach(func => {
           const regex = new RegExp(`${func}\\(([\\d\\.]+)\\)`, 'g');
           parsed = parsed.replace(regex, (_, num) => {
              const deg = parseFloat(num);
              const rad = deg * (Math.PI / 180);
              return `${func}(${rad})`; 
           });
        });
      }

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
      return Number.isInteger(res) ? res.toString() : parseFloat(res.toFixed(8)).toString();
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
    } else if (['sin', 'cos', 'tan', 'log', 'ln', '√', '∛', 'abs'].includes(val)) {
      setDisplay(prev => prev + val + '(');
    } else if (val === 'x²') {
      setDisplay(prev => prev + '^2');
    } else if (val === 'x³') {
      setDisplay(prev => prev + '^3');
    } else {
      setDisplay(prev => prev + val);
    }
  };

  // --- Unit Converter Logic ---
  const unitCategories = {
    length: { label: 'სიგრძე', units: ['mm', 'cm', 'm', 'km', 'inch', 'ft', 'mile'] },
    weight: { label: 'წონა', units: ['mg', 'g', 'kg', 'ton', 'oz', 'lb'] },
    time: { label: 'დრო', units: ['sec', 'min', 'hour', 'day'] }
  };

  const conversionRates: Record<string, number> = {
    mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, ft: 0.3048, mile: 1609.34,
    mg: 0.001, g: 1, kg: 1000, ton: 1000000, oz: 28.3495, lb: 453.592,
    sec: 1, min: 60, hour: 3600, day: 86400,
  };

  useEffect(() => {
    if (mode === 'units') {
      const fromRate = conversionRates[fromUnit];
      const toRate = conversionRates[toUnit];
      if (fromRate && toRate) {
        const val = parseFloat(convValue) || 0;
        setConvResult(((val * fromRate) / toRate).toFixed(4));
      }
    }
  }, [convValue, fromUnit, toUnit, mode]);

  // --- Currency Logic ---
  // Base: GEL
  const currencyRates: Record<string, number> = {
    GEL: 1.00, 
    USD: 2.75, // 1 USD = 2.75 GEL
    EUR: 2.95, 
    GBP: 3.50, 
    TRY: 0.08, 
    RUB: 0.028
  };

  useEffect(() => {
    if (mode === 'currency') {
        const amount = parseFloat(currAmount) || 0;
        // Convert to GEL first, then to Target
        // Example: 100 USD -> GEL: 100 * 2.75 = 275 GEL
        // 275 GEL -> EUR: 275 / 2.95 = 93.22 EUR
        const inGel = amount * currencyRates[currFrom];
        const final = inGel / currencyRates[currTo];
        setCurrResult(final.toFixed(2));
    }
  }, [currAmount, currFrom, currTo, mode]);

  // --- Physics Logic ---
  const physicsFormulas = {
    velocity: { title: 'სიჩქარე (V = d/t)', inputs: { d: 'მანძილი (m)', t: 'დრო (s)' }, calc: (v: any) => Number(v.d) / Number(v.t) },
    force: { title: 'ძალა (F = ma)', inputs: { m: 'მასა (kg)', a: 'აჩქარება (m/s²)' }, calc: (v: any) => Number(v.m) * Number(v.a) },
    ohm: { title: 'ომის კანონი (I = V/R)', inputs: { v: 'ძაბვა (V)', r: 'წინაღობა (Ω)' }, calc: (v: any) => Number(v.v) / Number(v.r) },
    power: { title: 'სიმძლავრე (P = W/t)', inputs: { w: 'მუშაობა (J)', t: 'დრო (s)' }, calc: (v: any) => Number(v.w) / Number(v.t) }
  };

  const handlePhysicsCalc = () => {
    const f = physicsFormulas[physicsFormula as keyof typeof physicsFormulas];
    const res = f.calc(physicsInputs);
    setPhysicsResult(res.toFixed(4));
  };

  // --- UI Helpers ---
  const sciButtons = [
    { l: '2nd', v: '2nd', c: 'text-indigo-600 bg-indigo-50' }, { l: 'π', v: 'π', c: 'bg-slate-100' }, { l: 'e', v: 'e', c: 'bg-slate-100' }, { l: 'C', v: 'C', c: 'text-red-600 bg-red-50' }, { l: 'DEL', v: 'DEL', c: 'text-red-600 bg-red-50' },
    { l: 'x²', v: 'x²', c: 'bg-slate-100' }, { l: '1/x', v: '^(-1)', c: 'bg-slate-100' }, { l: '|x|', v: 'abs', c: 'bg-slate-100' }, { l: 'mod', v: 'mod', c: 'bg-slate-100' }, { l: '÷', v: '÷', c: 'text-indigo-700 bg-indigo-50' },
    { l: '√x', v: '√', c: 'bg-slate-100' }, { l: 'sin', v: 'sin', c: 'bg-slate-100' }, { l: 'cos', v: 'cos', c: 'bg-slate-100' }, { l: 'tan', v: 'tan', c: 'bg-slate-100' }, { l: '×', v: '×', c: 'text-indigo-700 bg-indigo-50' },
    { l: 'xʸ', v: 'xʸ', c: 'bg-slate-100' }, { l: '7', v: '7', c: 'bg-white border-slate-200 text-slate-900' }, { l: '8', v: '8', c: 'bg-white border-slate-200 text-slate-900' }, { l: '9', v: '9', c: 'bg-white border-slate-200 text-slate-900' }, { l: '-', v: '-', c: 'text-indigo-700 bg-indigo-50' },
    { l: '10ˣ', v: '10^', c: 'bg-slate-100' }, { l: '4', v: '4', c: 'bg-white border-slate-200 text-slate-900' }, { l: '5', v: '5', c: 'bg-white border-slate-200 text-slate-900' }, { l: '6', v: '6', c: 'bg-white border-slate-200 text-slate-900' }, { l: '+', v: '+', c: 'text-indigo-700 bg-indigo-50' },
    { l: 'log', v: 'log', c: 'bg-slate-100' }, { l: '1', v: '1', c: 'bg-white border-slate-200 text-slate-900' }, { l: '2', v: '2', c: 'bg-white border-slate-200 text-slate-900' }, { l: '3', v: '3', c: 'bg-white border-slate-200 text-slate-900' }, { l: '=', v: '=', c: 'row-span-2 bg-indigo-600 text-white shadow-lg hover:bg-indigo-700' },
    { l: 'ln', v: 'ln', c: 'bg-slate-100' }, { l: 'x³', v: 'x³', c: 'bg-slate-100' }, { l: '0', v: '0', c: 'bg-white border-slate-200 text-slate-900' }, { l: '.', v: '.', c: 'bg-white border-slate-200 text-slate-900' }
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden max-w-6xl mx-auto">
      
      {/* Navigation Tabs */}
      <div className="bg-slate-50 p-2 border-b border-slate-200 flex gap-2 overflow-x-auto">
        <TabButton active={mode === 'scientific'} onClick={() => setMode('scientific')} icon={CalcIcon} label="სამეცნიერო" />
        <TabButton active={mode === 'units'} onClick={() => setMode('units')} icon={Scale} label="ერთეულები" />
        <TabButton active={mode === 'currency'} onClick={() => setMode('currency')} icon={Coins} label="ვალუტა" />
        <TabButton active={mode === 'physics'} onClick={() => setMode('physics')} icon={Zap} label="ფიზიკა" />
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50/50">
        
        {/* 1. SCIENTIFIC CALCULATOR */}
        {mode === 'scientific' && (
          <div className="h-full flex flex-col lg:flex-row gap-6">
             <div className="flex-1 flex flex-col gap-4">
                {/* Display Screen */}
                <div className="bg-slate-900 p-6 rounded-2xl text-right shadow-xl min-h-[140px] flex flex-col justify-end relative overflow-hidden">
                  <div className="absolute top-4 left-4 flex bg-slate-800 rounded-lg p-1">
                     <button onClick={() => setIsRadians(false)} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${!isRadians ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}>DEG</button>
                     <button onClick={() => setIsRadians(true)} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${isRadians ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}>RAD</button>
                  </div>
                  <div className="text-slate-400 text-sm font-mono h-5">{history[0] ? history[0].split('=')[0] : ''}</div>
                  <div className="text-white text-4xl font-bold tracking-widest break-all font-mono my-1">{display || '0'}</div>
                  <div className="text-emerald-400 text-2xl font-mono h-8">{result}</div>
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-5 gap-2 md:gap-3 flex-1">
                   {sciButtons.map((btn) => (
                     <button 
                       key={btn.l} onClick={() => handleBtnClick(btn.v)} 
                       className={`p-3 md:p-4 rounded-xl font-bold shadow-sm border border-transparent transition-all active:scale-95 flex items-center justify-center text-lg ${btn.c}`}
                     >{btn.l}</button>
                   ))}
                </div>
             </div>

             {/* History Panel */}
             <div className="w-full lg:w-72 bg-white border border-slate-200 rounded-2xl p-4 hidden lg:flex flex-col h-full shadow-sm">
                <h3 className="font-bold text-slate-700 mb-4 border-b pb-2 flex justify-between items-center">
                   <span className="flex items-center gap-2"><History size={16}/> ისტორია</span>
                   <button onClick={() => setHistory([])} className="p-1 hover:bg-red-50 text-red-400 rounded"><Trash2 size={16}/></button>
                </h3>
                <div className="space-y-2 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                   {history.length === 0 && <p className="text-slate-400 text-sm text-center mt-10">ისტორია ცარიელია</p>}
                   {history.map((h, i) => (
                      <div key={i} className="text-right p-3 hover:bg-indigo-50 rounded-xl cursor-pointer border border-slate-100 transition-colors" onClick={() => setDisplay(h.split('=')[0].trim())}>
                         <div className="text-xs text-slate-500 mb-1">{h.split('=')[0]}</div>
                         <div className="font-mono text-indigo-600 font-bold text-lg">{h.split('=')[1]}</div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* 2. UNIT CONVERTER */}
        {mode === 'units' && (
           <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Scale className="text-indigo-600"/> ერთეულების გადაყვანა</h2>
              
              <div className="flex gap-2 mb-8 bg-slate-50 p-1 rounded-xl">
                 {Object.entries(unitCategories).map(([key, val]) => (
                    <button key={key} onClick={() => setConvCategory(key)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${convCategory === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                       {val.label}
                    </button>
                 ))}
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-center">
                 <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">რაოდენობა</label>
                    <input type="number" value={convValue} onChange={e => setConvValue(e.target.value)} className="w-full p-4 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-lg" />
                 </div>
                 <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">საიდან</label>
                    <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="w-full p-4 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                       {unitCategories[convCategory as keyof typeof unitCategories].units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                 </div>
                 <MoveRight className="text-slate-400 hidden md:block mt-6" />
                 <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">სადამდე</label>
                    <select value={toUnit} onChange={e => setToUnit(e.target.value)} className="w-full p-4 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                       {unitCategories[convCategory as keyof typeof unitCategories].units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                 </div>
              </div>

              <div className="mt-8 bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-center">
                 <div className="text-sm text-indigo-400 font-bold uppercase tracking-wider mb-1">შედეგი</div>
                 <div className="text-4xl font-bold text-indigo-700 font-mono">{convResult} <span className="text-lg text-indigo-400">{toUnit}</span></div>
              </div>
           </div>
        )}

        {/* 3. CURRENCY CONVERTER */}
        {mode === 'currency' && (
           <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><DollarSign className="text-indigo-600"/> ვალუტის კურსი</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
                 <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">თანხა</label>
                    <input type="number" value={currAmount} onChange={e => setCurrAmount(e.target.value)} className="w-full p-4 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-lg" placeholder="0.00" />
                 </div>
                 <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">ვალუტა (დან)</label>
                    <select value={currFrom} onChange={e => setCurrFrom(e.target.value)} className="w-full p-4 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
                       {Object.keys(currencyRates).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">ვალუტა (ში)</label>
                    <select value={currTo} onChange={e => setCurrTo(e.target.value)} className="w-full p-4 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
                       {Object.keys(currencyRates).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
              </div>

              <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 text-center shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 opacity-10"><Coins size={100} className="text-emerald-600"/></div>
                 <span className="text-emerald-600 font-bold text-sm uppercase tracking-widest">კონვერტაცია</span>
                 <div className="text-5xl font-bold text-emerald-800 font-mono my-2">{currResult} <span className="text-2xl">{currTo}</span></div>
                 <div className="text-emerald-500 text-sm font-medium">1 {currFrom} = {(currencyRates[currTo] / currencyRates[currFrom]).toFixed(4)} {currTo}</div>
              </div>
           </div>
        )}

        {/* 4. PHYSICS CALCULATOR */}
        {mode === 'physics' && (
           <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Zap className="text-indigo-600"/> ფიზიკის ფორმულები</h2>
              
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                 {Object.entries(physicsFormulas).map(([key, val]) => (
                    <button key={key} onClick={() => { setPhysicsFormula(key); setPhysicsInputs({}); setPhysicsResult(null); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${physicsFormula === key ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                       {val.title.split(' ')[0]}
                    </button>
                 ))}
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                 <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">{physicsFormulas[physicsFormula as keyof typeof physicsFormulas].title}</h3>
                 <div className="grid gap-4">
                    {Object.entries(physicsFormulas[physicsFormula as keyof typeof physicsFormulas].inputs).map(([k, l]) => (
                       <div key={k}>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{l}</label>
                          <input 
                            type="number" 
                            onChange={e => setPhysicsInputs({...physicsInputs, [k]: e.target.value})} 
                            className="w-full p-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                            placeholder="0" 
                          />
                       </div>
                    ))}
                    <button onClick={handlePhysicsCalc} className="mt-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-all">გამოთვლა</button>
                 </div>
              </div>

              {physicsResult && (
                 <div className="mt-6 bg-white border-l-4 border-indigo-500 p-6 rounded-r-xl shadow-md flex items-center justify-between animate-fadeIn">
                    <span className="font-bold text-slate-500">პასუხი:</span>
                    <span className="text-3xl font-bold text-indigo-700 font-mono">{physicsResult}</span>
                 </div>
              )}
           </div>
        )}

      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${active ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
  >
    <Icon size={18} /> {label}
  </button>
);
