import React, { useState } from 'react';
import { ArrowDown, Settings, Play, RotateCcw, Calculator, HelpCircle, X, Info, Delete, Wand2, Loader2, Eye } from 'lucide-react';
import { processFunctionStepByStep, generateFunctionProblem } from '../services/geminiService';
import { MathRenderer } from './MathRenderer';

interface FunctionMachineProps {
  onAddXp?: (amount: number, reason?: string) => void;
}

export const FunctionMachine: React.FC<FunctionMachineProps> = ({ onAddXp }) => {
  const [func, setFunc] = useState('2x + 5');
  const [inputVal, setInputVal] = useState('3');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Enhanced Interaction
  const [activeInput, setActiveInput] = useState<'func' | 'input'>('func');
  
  // AI Generator State
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'advanced' | 'expert'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Animation states
  const [dropBall, setDropBall] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const handleCalculate = async () => {
    if (!func || !inputVal) return;
    
    // Reset
    setResult(null);
    setSteps([]);
    setShowOutput(false);
    
    // Start Animation Sequence
    setIsProcessing(true);
    setDropBall(true);

    // Fetch Data
    const data = await processFunctionStepByStep(func, inputVal);
    
    // Wait for animation sync (simulated delay)
    setTimeout(() => {
       setIsProcessing(false);
       setDropBall(false); // Reset ball pos
       setShowOutput(true);
       setResult(data.result);
       setSteps(data.steps);
       if(onAddXp) onAddXp(15, 'ფუნქციის გამოთვლა');
    }, 2000);
  };

  const handleGenerateProblem = async () => {
    setIsGenerating(true);
    // Clear previous results
    setResult(null);
    setSteps([]);
    setShowOutput(false);
    
    const problem = await generateFunctionProblem(difficulty);
    setFunc(problem.func);
    setInputVal(problem.input);
    setIsGenerating(false);
  };

  const insertSymbol = (val: string) => {
    if (activeInput === 'func') {
        setFunc(prev => prev + val);
    } else {
        setInputVal(prev => prev + val);
    }
  };

  const mathSymbols = [
    { label: 'x', val: 'x' },
    { label: 'y', val: 'y' },
    { label: 'a', val: 'a' },
    { label: '+', val: ' + ' },
    { label: '-', val: ' - ' },
    { label: '*', val: '*' },
    { label: '/', val: '/' },
    { label: 'x²', val: '^2' },
    { label: 'x³', val: '^3' },
    { label: '^', val: '^' },
    { label: '√', val: 'sqrt(' },
    { label: '(', val: '(' },
    { label: ')', val: ')' },
    { label: 'π', val: 'pi' },
  ];

  return (
    <div className="h-full flex flex-col items-center bg-slate-50 p-6 animate-fadeIn overflow-y-auto relative">
       {/* Tutorial Overlay */}
       {showTutorial && (
        <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-200 relative">
            <button onClick={() => setShowTutorial(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><X size={24} /></button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><Info size={32} /></div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">როგორ მუშაობს?</h2>
                <p className="text-slate-500">ფუნქციის მანქანის გზამკვლევი</p>
              </div>
            </div>

            <div className="space-y-6 text-slate-700">
              <div className="flex gap-4">
                <div className="bg-indigo-50 w-8 h-8 rounded-full flex items-center justify-center text-indigo-600 font-bold shrink-0">1</div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">რა არის ეს?</h3>
                  <p className="text-sm leading-relaxed">ეს არის ვიზუალური მოდელი, რომელიც გვიჩვენებს როგორ ამუშავებს მათემატიკური ფუნქცია შესავალ მონაცემებს (Input) და გარდაქმნის მათ შედეგად (Output).</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-indigo-50 w-8 h-8 rounded-full flex items-center justify-center text-indigo-600 font-bold shrink-0">2</div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">უნივერსალური ჩასმა</h3>
                  <p className="text-sm leading-relaxed">შეგიძლიათ შეიყვანოთ როგორც რიცხვები (მაგ: 5), ასევე გამოსახულებები (მაგ: a+1). სისტემა ავტომატურად გაამარტივებს.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-indigo-50 w-8 h-8 rounded-full flex items-center justify-center text-indigo-600 font-bold shrink-0">3</div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">როგორ გამოვიყენო?</h3>
                  <ul className="text-sm space-y-2 list-disc pl-4 mt-1 text-slate-600">
                    <li>ველში <strong>ფუნქცია</strong> ჩაწერეთ ფორმულა (მაგ: <code>3x - 2</code>).</li>
                    <li>ველში <strong>x</strong> ჩაწერეთ მნიშვნელობა.</li>
                    <li>გამოიყენეთ <strong>მაგალითის მოფიქრება</strong> სავარჯიშოდ.</li>
                    <li>დააჭირეთ <strong>გამოთვლას</strong>.</li>
                  </ul>
                </div>
              </div>
            </div>

            <button onClick={() => setShowTutorial(false)} className="w-full mt-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all">
              გასაგებია, დავიწყოთ!
            </button>
          </div>
        </div>
       )}

       <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          
          {/* LEFT: The Machine Visual */}
          <div className="flex-1 bg-slate-900 p-8 relative flex flex-col items-center justify-center min-h-[500px]">
             
             {/* Background Grid */}
             <div className="absolute inset-0 opacity-10 pointer-events-none" 
                  style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
             </div>

             {/* INPUT HOPPER */}
             <div className="relative z-10 mb-4 flex flex-col items-center">
                <div className="bg-white p-3 px-6 rounded-xl shadow-lg mb-2 border-4 border-indigo-500 transform hover:scale-105 transition-transform min-w-[100px] text-center">
                   <span className="font-mono font-bold text-xl text-slate-900 flex items-center justify-center gap-2">
                      x = <MathRenderer text={`$${inputVal}$`} inline />
                   </span>
                </div>
                <ArrowDown className={`text-white mb-[-10px] transition-all duration-1000 ${dropBall ? 'translate-y-20 opacity-0' : 'translate-y-0 opacity-100'}`} size={32} />
             </div>

             {/* THE MACHINE BODY */}
             <div className="relative z-10 w-64 h-64 bg-indigo-600 rounded-3xl shadow-2xl border-4 border-indigo-400 flex flex-col items-center justify-center overflow-hidden">
                {/* Gear Animations */}
                <Settings className={`absolute top-4 right-4 text-indigo-400 w-24 h-24 ${isProcessing ? 'animate-spin' : ''}`} style={{animationDuration: '3s'}} />
                <Settings className={`absolute bottom-4 left-4 text-indigo-800 w-16 h-16 ${isProcessing ? 'animate-spin' : ''}`} style={{animationDirection: 'reverse', animationDuration: '2s'}} />
                
                {/* Function Display (Fixed Overflow) */}
                <div className="bg-slate-900/60 backdrop-blur-md p-2 rounded-xl border border-white/20 text-center relative z-20 w-56 max-w-[95%]">
                   <span className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest block mb-1">ფუნქცია</span>
                   <div className="text-white font-mono text-lg font-bold flex justify-center items-center overflow-x-auto no-scrollbar whitespace-nowrap px-2">
                      <MathRenderer text={`$ f(x) = ${func} $`} inline />
                   </div>
                </div>

                {/* Processing Status */}
                {isProcessing && (
                   <div className="absolute bottom-4 text-white font-bold text-sm animate-pulse bg-black/30 px-3 py-1 rounded-full">
                      მუშავდება...
                   </div>
                )}
             </div>

             {/* OUTPUT CHUTE */}
             <div className="relative z-10 mt-4 flex flex-col items-center h-24 justify-end">
                <div className={`h-8 w-4 bg-indigo-500 mb-2 ${showOutput ? 'h-8' : 'h-0'} transition-all duration-500`}></div>
                {showOutput && (
                   <div className="bg-green-500 text-white p-4 rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.6)] border-4 border-green-300 transform animate-in zoom-in slide-in-from-top-4 duration-500">
                      <span className="font-mono font-bold text-3xl"><MathRenderer text={result || ''} inline /></span>
                   </div>
                )}
             </div>

          </div>

          {/* RIGHT: Controls & Explanation */}
          <div className="flex-1 p-8 bg-white flex flex-col">
             <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                     <Calculator className="text-indigo-600"/> ფუნქციის მანქანა
                  </h2>
                  <button onClick={() => setShowTutorial(true)} className="text-slate-400 hover:text-indigo-600 transition-colors" title="ინსტრუქცია">
                    <HelpCircle size={24} />
                  </button>
                </div>

                {/* Generator Section */}
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-indigo-800 uppercase flex items-center gap-1"><Wand2 size={12}/> მაგალითის გენერატორი</span>
                   </div>
                   <div className="grid grid-cols-4 gap-1.5 mb-2">
                      <button onClick={() => setDifficulty('easy')} className={`py-1 text-[10px] font-bold rounded-lg transition-colors ${difficulty === 'easy' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>მარტივი</button>
                      <button onClick={() => setDifficulty('medium')} className={`py-1 text-[10px] font-bold rounded-lg transition-colors ${difficulty === 'medium' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>საშუალო</button>
                      <button onClick={() => setDifficulty('advanced')} className={`py-1 text-[10px] font-bold rounded-lg transition-colors ${difficulty === 'advanced' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>რთული</button>
                      <button onClick={() => setDifficulty('expert')} className={`py-1 text-[10px] font-bold rounded-lg transition-colors ${difficulty === 'expert' ? 'bg-purple-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>ექსპერტი</button>
                   </div>
                   <button 
                     onClick={handleGenerateProblem} 
                     disabled={isGenerating}
                     className="w-full py-2 bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                   >
                      {isGenerating ? <Loader2 className="animate-spin" size={16}/> : <Wand2 size={16}/>} მაგალითის მოფიქრება
                   </button>
                </div>
                
                <div className="space-y-4">
                   <div>
                      <div className="flex justify-between items-center mb-1">
                         <label className="text-xs font-bold text-slate-400 uppercase">ფუნქცია f(x)</label>
                         {func && (
                            <div className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded flex items-center gap-1 animate-in fade-in">
                               <Eye size={10} /> <MathRenderer text={`$${func}$`} inline />
                            </div>
                         )}
                      </div>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={func} 
                          onChange={(e) => setFunc(e.target.value)} 
                          onFocus={() => setActiveInput('func')}
                          className={`w-full p-4 bg-slate-50 border-2 rounded-xl font-mono text-lg outline-none transition-all text-slate-900 pr-10 ${activeInput === 'func' ? 'border-indigo-500 bg-white ring-2 ring-indigo-100' : 'border-slate-200'}`}
                          placeholder="მაგ: x^2 + 5"
                        />
                        <button 
                          onClick={() => setFunc('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Delete size={20} />
                        </button>
                      </div>
                   </div>

                   <div>
                      <div className="flex justify-between items-center mb-1">
                         <label className="text-xs font-bold text-slate-400 uppercase">შეიყვანე x</label>
                         {inputVal && isNaN(Number(inputVal)) && (
                            <div className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded flex items-center gap-1 animate-in fade-in">
                               <Eye size={10} /> <MathRenderer text={`$${inputVal}$`} inline />
                            </div>
                         )}
                      </div>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={inputVal} 
                          onChange={(e) => setInputVal(e.target.value)} 
                          onFocus={() => setActiveInput('input')}
                          className={`w-full p-4 bg-slate-50 border-2 rounded-xl font-mono text-lg outline-none transition-all text-slate-900 pr-10 ${activeInput === 'input' ? 'border-indigo-500 bg-white ring-2 ring-indigo-100' : 'border-slate-200'}`}
                          placeholder="მაგ: 5 ან a+1"
                        />
                        <button 
                          onClick={() => setInputVal('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Delete size={20} />
                        </button>
                      </div>
                   </div>

                   {/* MATH KEYPAD */}
                   <div className="grid grid-cols-7 gap-2 mt-2">
                        {mathSymbols.map((sym) => (
                          <button
                            key={sym.label}
                            onClick={() => insertSymbol(sym.val)}
                            className="p-2 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg font-bold text-xs transition-all shadow-sm active:scale-95 flex items-center justify-center font-mono"
                          >
                            {sym.label}
                          </button>
                        ))}
                   </div>

                   <button 
                     onClick={handleCalculate} 
                     disabled={isProcessing}
                     className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed mt-2"
                   >
                      {isProcessing ? '...' : <><Play fill="currentColor"/> გამოთვლა</>}
                   </button>
                </div>
             </div>

             {/* LOG / STEPS */}
             <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 p-6 overflow-y-auto custom-scrollbar relative">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-slate-700">პროცედურის ლოგი</h3>
                   {steps.length > 0 && <button onClick={() => {setResult(null); setSteps([]); setShowOutput(false);}} className="text-slate-400 hover:text-indigo-600"><RotateCcw size={16}/></button>}
                </div>
                
                {steps.length === 0 && !isProcessing ? (
                   <div className="text-center text-slate-400 mt-10">
                      შეიყვანეთ მონაცემები და დააჭირეთ გამოთვლას
                   </div>
                ) : (
                   <div className="space-y-4">
                      {steps.map((step, idx) => (
                         <div key={idx} className="flex gap-3 animate-in slide-in-from-left-4 fade-in duration-500" style={{animationDelay: `${idx * 200}ms`}}>
                            <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                               {idx + 1}
                            </div>
                            <div className="text-slate-700 text-sm leading-relaxed">
                               <MathRenderer text={step} />
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>
          </div>

       </div>
    </div>
  );
};