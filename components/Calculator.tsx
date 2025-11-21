import React, { useState, useEffect } from 'react';
import { 
  Calculator as CalcIcon, RefreshCw, Scale, Zap, 
  Coins, ArrowRight, History, Trash2, Delete, Divide 
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
  const handleBtnClick = (val: string) => {
    if (val === 'C') {
      setDisplay('');
      setResult('');
    } else if (val === 'DEL') {
      setDisplay(prev => prev.slice(0, -1));
    } else if (val === '=') {
      try {
        // Safe eval replacement
        let expression = display
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
          .replace(/√\(/g, 'Math.sqrt(')
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/\^/g, '**');

        // eslint-disable-next-line no-new-func
        const res = new Function('return ' + expression)();
        const formatted = Number.isInteger(res) ? res.toString() : res.toFixed(4);
        setResult(formatted);
        setHistory(prev => [`${display} = ${formatted}`, ...prev].slice(0, 10));
      } catch (e) {
        setResult('Error');
      }
    } else {
      // Prevent multiple operators
      if (['+', '-', '×', '÷', '^', '.'].includes(val) && ['+', '-', '×', '÷', '^', '.'].includes(display.slice(-1))) {
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

  // --- Currency Logic (Static Estimate) ---
  const currencyRates: Record<string, number> = {
    GEL: 1, USD: 2.65, EUR: 2.88, GBP: 3.45
  };
  
  const calculateCurrency = () => {
    const val = parseFloat(convValue) || 0;
    // Convert 'from' to GEL (base), then to 'to'
    const inGEL = val * (currencyRates[fromUnit] || 1); // Actually this logic depends on if rate is "Per GEL" or "GEL Per Unit". Assuming GEL per Unit here.
    // Let's assume rates are: 1 USD = 2.65 GEL. So to get GEL from USD, we multiply.
    
    // If converting USD to EUR:
    // USD -> GEL -> EUR
    // (Value * USD_Rate) / EUR_Rate
    
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

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-3xl shadow-xl border border-slate-200 overflow-hidden max-w-5xl mx-auto">
      
      {/* Header / Tabs */}
      <div className="bg-slate-100 p-2 flex gap-2 overflow-x-auto">
        <ModeButton id="scientific" icon={CalcIcon} label="სამეცნიერო" />
        <ModeButton id="units" icon={RefreshCw} label="გადამყვანი" />
        <ModeButton id="currency" icon={Coins} label="ვალუტა" />
        <ModeButton id="physics" icon={Zap} label="ფიზიკა" />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-6 overflow-y-auto">
        
        {/* === SCIENTIFIC CALCULATOR === */}
        {mode === 'scientific' && (
          <div className="h-full flex flex-col md:flex-row gap-6">
             {/* Keypad & Display */}
             <div className="flex-1 flex flex-col gap-4">
                <div className="bg-slate-900 p-6 rounded-2xl text-right shadow-inner min-h-[120px] flex flex-col justify-end">
                  <div className="text-slate-400 text-lg font-mono tracking-wider h-6">{result}</div>
                  <div className="text-white text-4xl font-bold tracking-widest break-all font-mono">
                    {display || '0'}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 flex-1">
                   {['C', '(', ')', 'DEL'].map(b => (
                     <button key={b} onClick={() => handleBtnClick(b)} className="p-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold shadow-sm transition-all">{b}</button>
                   ))}
                   {['sin(', 'cos(', 'tan(', '÷'].map(b => (
                     <button key={b} onClick={() => handleBtnClick(b)} className="p-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold shadow-sm transition-all">{b}</button>
                   ))}
                   {['7', '8', '9', '×'].map(b => (
                     <button key={b} onClick={() => handleBtnClick(b)} className={`p-4 rounded-xl font-bold shadow-sm transition-all text-xl ${['×'].includes(b) ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>{b}</button>
                   ))}
                   {['4', '5', '6', '-'].map(b => (
                     <button key={b} onClick={() => handleBtnClick(b)} className={`p-4 rounded-xl font-bold shadow-sm transition-all text-xl ${['-'].includes(b) ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>{b}</button>
                   ))}
                   {['1', '2', '3', '+'].map(b => (
                     <button key={b} onClick={() => handleBtnClick(b)} className={`p-4 rounded-xl font-bold shadow-sm transition-all text-xl ${['+'].includes(b) ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>{b}</button>
                   ))}
                   {['0', '.', '^', '='].map(b => (
                     <button key={b} onClick={() => handleBtnClick(b)} className={`p-4 rounded-xl font-bold shadow-sm transition-all text-xl ${b === '=' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>{b}</button>
                   ))}
                   {['√(', 'π', 'e', 'ln('].map(b => (
                     <button key={b} onClick={() => handleBtnClick(b)} className="p-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-medium text-sm">{b}</button>
                   ))}
                </div>
             </div>

             {/* History Panel */}
             <div className="w-full md:w-64 bg-white border border-slate-200 rounded-2xl p-4 hidden md:flex flex-col">
               <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                 <h3 className="font-bold text-slate-700 flex items-center gap-2"><History size={16}/> ისტორია</h3>
                 <button onClick={() => setHistory([])} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
               </div>
               <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
                 {history.length === 0 && <p className="text-xs text-slate-400 text-center mt-10">ცარიელია</p>}
                 {history.map((item, idx) => (
                   <div key={idx} className="text-sm p-2 bg-slate-50 rounded-lg text-right font-mono text-slate-600 hover:bg-indigo-50 cursor-pointer" onClick={() => setDisplay(item.split('=')[0].trim())}>
                     {item}
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}

        {/* === CONVERTER & CURRENCY === */}
        {(mode === 'units' || mode === 'currency') && (
          <div className="max-w-2xl mx-auto flex flex-col gap-8 animate-fadeIn">
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
               <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  {mode === 'units' ? <Scale className="text-indigo-600"/> : <Coins className="text-yellow-600" />}
                  {mode === 'units' ? 'ერთეულების გადაყვანა' : 'ვალუტის კურსი'}
               </h2>

               {mode === 'units' && (
                 <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl overflow-x-auto">
                   {['length', 'weight', 'time'].map(cat => (
                     <button 
                      key={cat}
                      onClick={() => {
                        setConvCategory(cat); 
                        setFromUnit(cat === 'length' ? 'm' : cat === 'weight' ? 'kg' : 'min');
                        setToUnit(cat === 'length' ? 'km' : cat === 'weight' ? 'lb' : 'hour');
                      }}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize ${convCategory === cat ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                     >
                       {cat === 'length' ? 'სიგრძე' : cat === 'weight' ? 'წონა' : 'დრო'}
                     </button>
                   ))}
                 </div>
               )}

               <div className="flex flex-col md:flex-row gap-4 items-center">
                 {/* Input Side */}
                 <div className="flex-1 w-full space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">რაოდენობა</label>
                    <input 
                      type="number" 
                      value={convValue}
                      onChange={(e) => setConvValue(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-2xl font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <select 
                      value={fromUnit}
                      onChange={(e) => setFromUnit(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-white font-medium"
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

                 <ArrowRight className="text-slate-300 rotate-90 md:rotate-0" size={32} />

                 {/* Output Side */}
                 <div className="flex-1 w-full space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">შედეგი</label>
                    <div className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-2xl font-mono text-indigo-700 font-bold min-h-[66px] flex items-center">
                       {mode === 'currency' ? calculateCurrency() : convResult}
                    </div>
                    <select 
                      value={toUnit}
                      onChange={(e) => setToUnit(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-white font-medium"
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
          <div className="max-w-3xl mx-auto animate-fadeIn">
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
                     className={`w-full text-left p-3 rounded-xl text-sm font-semibold transition-all ${physicsFormula === key ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-indigo-50 text-slate-600'}`}
                   >
                     {data.title.split('(')[0]}
                   </button>
                 ))}
               </div>

               {/* Main Calculation Area */}
               <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">
                    {physicsFormulas[physicsFormula as keyof typeof physicsFormulas].title}
                  </h3>

                  <div className="space-y-4">
                    {Object.entries(physicsFormulas[physicsFormula as keyof typeof physicsFormulas].inputs).map(([key, label]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-slate-500 mb-1">{label}</label>
                        <input 
                          type="number"
                          value={physicsInputs[key] || ''}
                          onChange={(e) => setPhysicsInputs({...physicsInputs, [key]: e.target.value})}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={calculatePhysics}
                    className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-[0.98]"
                  >
                    გამოთვლა
                  </button>

                  {physicsResult !== null && (
                    <div className="mt-6 bg-green-50 border border-green-100 p-4 rounded-xl text-center">
                      <span className="text-sm text-green-600 font-bold uppercase tracking-wider">პასუხი</span>
                      <div className="text-3xl font-mono font-bold text-green-700 mt-1">{physicsResult}</div>
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