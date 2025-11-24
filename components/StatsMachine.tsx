
import React, { useState, useEffect } from 'react';
import { BarChart, Calculator, HelpCircle, X, Info, Sigma, ArrowRight } from 'lucide-react';

interface StatsMachineProps {
  onAddXp?: (amount: number, reason?: string) => void;
}

export const StatsMachine: React.FC<StatsMachineProps> = ({ onAddXp }) => {
  const [input, setInput] = useState('1, 2, 3, 4, 5, 5, 9');
  const [data, setData] = useState<any>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const calculate = () => {
    // Parse input
    const nums = input.split(',')
      .map(n => parseFloat(n.trim()))
      .filter(n => !isNaN(n));

    if (nums.length === 0) {
      setData(null);
      return;
    }

    // Sort
    nums.sort((a, b) => a - b);
    const count = nums.length;
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / count;

    // Median
    let median = 0;
    if (count % 2 === 0) {
      median = (nums[count / 2 - 1] + nums[count / 2]) / 2;
    } else {
      median = nums[Math.floor(count / 2)];
    }

    // Mode
    const frequency: Record<string, number> = {};
    let maxFreq = 0;
    nums.forEach(n => {
      frequency[n] = (frequency[n] || 0) + 1;
      if (frequency[n] > maxFreq) maxFreq = frequency[n];
    });
    const modes = Object.keys(frequency)
      .filter(k => frequency[k] === maxFreq && maxFreq > 1)
      .map(Number);

    // Range
    const min = nums[0];
    const max = nums[count - 1];
    const range = max - min;

    // Variance & Std Dev (Sample)
    const variance = nums.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (count - 1 || 1);
    const stdDev = Math.sqrt(variance);

    // Chart Data (Frequency bins - simple unique values for now)
    const chartData = Object.entries(frequency).map(([val, freq]) => ({
      val, freq, height: (freq / maxFreq) * 100
    })).sort((a,b) => parseFloat(a.val) - parseFloat(b.val));

    setData({
      count, sum, mean, median, modes, range, min, max, variance, stdDev, chartData
    });

    if(onAddXp) onAddXp(10, 'სტატისტიკური ანალიზი');
  };

  useEffect(() => {
    calculate();
  }, [input]);

  return (
    <div className="h-full flex flex-col bg-slate-50 p-4 md:p-8 animate-fadeIn overflow-y-auto relative">
      
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-2xl font-bold text-slate-800">სტატისტიკის ანალიზატორი</h2>
               <button onClick={() => setShowTutorial(false)}><X className="text-slate-500" /></button>
            </div>
            <p className="text-slate-600 mb-4">
              შეიყვანეთ რიცხვების ნაკრები და მიიღეთ სრული სტატისტიკური სურათი.
            </p>
            <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5 mb-6">
               <li><strong>Mean (საშუალო):</strong> რიცხვების ჯამი / რაოდენობაზე.</li>
               <li><strong>Median (მედიანა):</strong> შუა რიცხვი დალაგებულ მწკრივში.</li>
               <li><strong>Mode (მოდა):</strong> ყველაზე ხშირად გამეორებული რიცხვი.</li>
               <li><strong>Range (გაბნევა):</strong> სხვაობა უდიდესსა და უმცირესს შორის.</li>
               <li><strong>Std Dev (გადახრა):</strong> რამდენად შორს არის მონაცემები საშუალოსგან.</li>
            </ul>
            <button onClick={() => setShowTutorial(false)} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">გასაგებია</button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto w-full">
         {/* Header & Input */}
         <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                     <BarChart className="text-indigo-600" size={32} /> სტატისტიკა
                  </h1>
                  <p className="text-slate-500 mt-1">მონაცემთა ანალიზი და ვიზუალიზაცია</p>
               </div>
               <button onClick={() => setShowTutorial(true)} className="text-slate-400 hover:text-indigo-600"><HelpCircle size={24} /></button>
            </div>

            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">რიცხვების სიმრავლე (გამოყავით მძიმით)</label>
               <input 
                 type="text" 
                 value={input} 
                 onChange={(e) => setInput(e.target.value)} 
                 className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-mono text-lg focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-900"
                 placeholder="1, 2, 5, 10..."
               />
            </div>
         </div>

         {/* Results */}
         {data && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               
               {/* Key Metrics */}
               <div className="lg:col-span-1 space-y-4">
                  <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg">
                     <div className="text-indigo-200 text-xs font-bold uppercase mb-1">საშუალო (Mean)</div>
                     <div className="text-4xl font-bold font-mono">{data.mean.toFixed(2)}</div>
                     <div className="mt-2 text-xs bg-white/10 inline-block px-2 py-1 rounded">ჯამი: {data.sum} / რაოდენობა: {data.count}</div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                     <div className="text-slate-400 text-xs font-bold uppercase mb-1">მედიანა (Median)</div>
                     <div className="text-3xl font-bold text-slate-800 font-mono">{data.median}</div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                     <div className="text-slate-400 text-xs font-bold uppercase mb-1">მოდა (Mode)</div>
                     <div className="text-2xl font-bold text-slate-800 font-mono">
                        {data.modes.length > 0 ? data.modes.join(', ') : 'არ აქვს'}
                     </div>
                  </div>
               </div>

               {/* Advanced Metrics & Chart */}
               <div className="lg:col-span-2 flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-slate-500 font-bold text-xs uppercase"><Sigma size={14}/> სტანდარტული გადახრა</div>
                        <div className="text-2xl font-bold text-indigo-600 font-mono">{data.stdDev.toFixed(3)}</div>
                     </div>
                     <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-slate-500 font-bold text-xs uppercase"><ArrowRight size={14}/> დიაპაზონი (Range)</div>
                        <div className="text-2xl font-bold text-indigo-600 font-mono">{data.range} <span className="text-sm text-slate-400">({data.min} - {data.max})</span></div>
                     </div>
                  </div>

                  {/* Frequency Chart */}
                  <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                     <h3 className="font-bold text-slate-700 mb-6 text-sm uppercase">სიხშირის განაწილება</h3>
                     <div className="flex-1 flex items-end justify-around gap-2 min-h-[200px] pb-6 border-b border-slate-100">
                        {data.chartData.map((d: any, i: number) => (
                           <div key={i} className="flex flex-col items-center flex-1 group relative">
                              {/* Tooltip */}
                              <div className="absolute -top-8 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                 {d.freq}x
                              </div>
                              {/* Bar */}
                              <div 
                                 className="w-full max-w-[40px] bg-indigo-500 rounded-t-lg transition-all duration-500 hover:bg-indigo-600" 
                                 style={{ height: `${Math.max(d.height, 5)}%` }}
                              ></div>
                              {/* Label */}
                              <div className="mt-2 text-xs font-bold text-slate-500 font-mono">{d.val}</div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

            </div>
         )}
      </div>
    </div>
  );
};
