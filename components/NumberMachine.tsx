
import React, { useState, useEffect } from 'react';
import { Hash, Binary, Search, HelpCircle, X, Info, Copy, Check } from 'lucide-react';

interface NumberMachineProps {
  onAddXp?: (amount: number, reason?: string) => void;
}

export const NumberMachine: React.FC<NumberMachineProps> = ({ onAddXp }) => {
  const [input, setInput] = useState<string>('12');
  const [data, setData] = useState<any>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const n = parseInt(input);
    if (isNaN(n)) {
      setData(null);
      return;
    }

    // 1. Prime Check
    const isPrime = checkPrime(n);

    // 2. Factors
    const factors = getFactors(n);

    // 3. Prime Factorization
    const primeFactors = getPrimeFactorization(n);

    // 4. Roman
    const roman = toRoman(n);

    // 5. Binary / Hex
    const binary = n.toString(2);
    const hex = n.toString(16).toUpperCase();

    // 6. Properties
    const isEven = n % 2 === 0;
    const isSquare = Number.isInteger(Math.sqrt(n));
    const isCube = Number.isInteger(Math.cbrt(n));

    setData({
      num: n,
      isPrime,
      factors,
      primeFactors,
      roman,
      binary,
      hex,
      isEven,
      isSquare,
      isCube,
      sqrt: Math.sqrt(n).toFixed(3),
      cbrt: Math.cbrt(n).toFixed(3)
    });

    if (onAddXp) onAddXp(5, 'რიცხვის ანალიზი');
  };

  useEffect(() => {
    calculate();
  }, [input]);

  // --- Helpers ---
  const checkPrime = (num: number) => {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  };

  const getFactors = (num: number) => {
    const factors = [];
    for (let i = 1; i <= num; i++) {
      if (num % i === 0) factors.push(i);
    }
    return factors;
  };

  const getPrimeFactorization = (num: number) => {
    const factors: number[] = [];
    let d = 2;
    let temp = num;
    while (d * d <= temp) {
      while (temp % d === 0) {
        factors.push(d);
        temp /= d;
      }
      d++;
    }
    if (temp > 1) factors.push(temp);
    return factors.join(' × ');
  };

  const toRoman = (num: number) => {
    if (num < 1 || num > 3999) return "N/A";
    const lookup: Record<string, number> = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
    let roman = '';
    for (let i in lookup ) {
      while ( num >= lookup[i] ) {
        roman += i;
        num -= lookup[i];
      }
    }
    return roman;
  };

  const copyData = () => {
    if (!data) return;
    const text = `
      რიცხვი: ${data.num}
      მარტივია?: ${data.isPrime ? 'კი' : 'არა'}
      გამყოფები: ${data.factors.join(', ')}
      რომაულად: ${data.roman}
      ორობითში: ${data.binary}
    `;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 p-4 md:p-8 animate-fadeIn overflow-y-auto relative">
      
      {/* Tutorial */}
      {showTutorial && (
        <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-2xl font-bold text-slate-800">რიცხვების ანალიზატორი</h2>
               <button onClick={() => setShowTutorial(false)}><X className="text-slate-500" /></button>
            </div>
            <p className="text-slate-600 mb-4">
              ეს არის "შვეიცარიული დანა" არითმეტიკისთვის. ჩაწერეთ ნებისმიერი მთელი რიცხვი და მყისიერად მიიღეთ სრული დოსიე:
            </p>
            <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5 mb-6">
               <li>არის თუ არა მარტივი?</li>
               <li>როგორ იშლება მამრავლებად?</li>
               <li>როგორ იწერება ორობით და რომაულ სისტემებში?</li>
               <li>არის თუ არა სრული კვადრატი?</li>
            </ul>
            <button onClick={() => setShowTutorial(false)} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">გასაგებია</button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto w-full">
         <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10 mb-6">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                     <Hash className="text-indigo-600" size={32} /> რიცხვის ანალიზი
                  </h1>
                  <p className="text-slate-500 mt-1">შეიყვანეთ რიცხვი მის გამოსაკვლევად</p>
               </div>
               <button onClick={() => setShowTutorial(true)} className="text-slate-400 hover:text-indigo-600"><HelpCircle size={24} /></button>
            </div>

            <div className="relative">
               <input 
                 type="number" 
                 value={input} 
                 onChange={(e) => setInput(e.target.value)} 
                 className="w-full p-6 text-4xl font-mono font-bold text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all text-center"
                 placeholder="0"
               />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none font-bold text-xl">NUM</div>
            </div>
         </div>

         {data && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-bottom-4">
               
               {/* Prime Status */}
               <div className={`p-6 rounded-2xl border-l-8 shadow-sm ${data.isPrime ? 'bg-green-50 border-green-500 text-green-900' : 'bg-slate-50 border-slate-400 text-slate-800'}`}>
                  <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">სტატუსი</div>
                  <div className="text-2xl font-bold">{data.isPrime ? 'მარტივი რიცხვი' : 'შედგენილი რიცხვი'}</div>
                  <div className="text-sm mt-2 opacity-80">{data.isPrime ? 'იყოფა მხოლოდ 1-ზე და საკუთარ თავზე' : 'აქვს 2-ზე მეტი გამყოფი'}</div>
               </div>

               {/* Factorization */}
               <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">მარტივ მამრავლებად დაშლა</div>
                  <div className="text-2xl font-mono font-bold text-slate-800 break-all">{data.primeFactors}</div>
               </div>

               {/* Divisors */}
               <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm md:col-span-2 lg:col-span-1">
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">ყველა გამყოფი ({data.factors.length})</div>
                  <div className="text-sm font-mono text-slate-600 break-words leading-relaxed">
                     {data.factors.join(', ')}
                  </div>
               </div>

               {/* Binary / Hex */}
               <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-md md:col-span-3 flex flex-col md:flex-row gap-8 items-center justify-around">
                  <div className="text-center">
                     <div className="flex items-center gap-2 justify-center text-indigo-300 font-bold text-sm mb-1"><Binary size={16} /> ორობითი (Binary)</div>
                     <div className="font-mono text-2xl">{data.binary}</div>
                  </div>
                  <div className="w-px h-12 bg-slate-700 hidden md:block"></div>
                  <div className="text-center">
                     <div className="text-pink-300 font-bold text-sm mb-1">თექვსმეტობითი (Hex)</div>
                     <div className="font-mono text-2xl">0x{data.hex}</div>
                  </div>
                  <div className="w-px h-12 bg-slate-700 hidden md:block"></div>
                  <div className="text-center">
                     <div className="text-amber-300 font-bold text-sm mb-1">რომაული (Roman)</div>
                     <div className="font-serif text-2xl">{data.roman}</div>
                  </div>
               </div>

               {/* Roots */}
               <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ფესვები</div>
                  <div className="flex justify-between items-center mb-2">
                     <span className="font-mono">√{data.num}</span>
                     <span className="font-bold text-slate-800">{data.isSquare ? data.sqrt : `≈${data.sqrt}`}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="font-mono">∛{data.num}</span>
                     <span className="font-bold text-slate-800">{data.isCube ? data.cbrt : `≈${data.cbrt}`}</span>
                  </div>
               </div>

               {/* Properties */}
               <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm md:col-span-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">თვისებები</div>
                  <div className="flex gap-2 flex-wrap">
                     <span className={`px-3 py-1 rounded-full text-sm font-bold ${data.isEven ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {data.isEven ? 'ლუწი (Even)' : 'კენტი (Odd)'}
                     </span>
                     {data.isSquare && <span className="px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-700">სრული კვადრატი</span>}
                     {data.isCube && <span className="px-3 py-1 rounded-full text-sm font-bold bg-pink-100 text-pink-700">სრული კუბი</span>}
                     <span className="px-3 py-1 rounded-full text-sm font-bold bg-slate-100 text-slate-700">{data.num.toString().length} ციფრიანი</span>
                  </div>
               </div>

            </div>
         )}

         {data && (
            <div className="mt-6 text-center">
               <button onClick={copyData} className="inline-flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-indigo-600 transition-colors">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'კოპირებულია' : 'შედეგების კოპირება'}
               </button>
            </div>
         )}
      </div>
    </div>
  );
};
