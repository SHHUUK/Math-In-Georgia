import React, { useState } from 'react';
import { Calculator, BookOpen, Cpu, Lightbulb, PlayCircle, Sigma } from 'lucide-react';
import { MathRenderer } from './MathRenderer';

interface Term {
  coef: number;
  vars: string;
  pow: number;
  raw: string;
}

const parseTerm = (input: string): Term | null => {
  if (!input) return null;
  const noSpace = input.replace(/\s+/g, '');
  
  // Matches e.g. -2, 3.5, -x, 4x, x^2, 5y^3, -ab^2
  // It's a simplistic parser for standard single terms.
  const regex = /^(-?\d*\.?\d*)([a-zA-Z]+)?(?:\^(\d+))?$/;
  const match = noSpace.match(regex);
  
  if (!match) return { coef: 1, vars: noSpace, pow: 1, raw: input }; // Fallback

  let coefStr = match[1];
  let vars = match[2] || '';
  let powStr = match[3];

  let coef = 1;
  if (coefStr === '-') coef = -1;
  else if (coefStr) coef = parseFloat(coefStr);

  let pow = 1;
  if (powStr) pow = parseInt(powStr, 10);
  if (!vars) pow = 0; // Constants don't really have a variable power

  return { coef, vars, pow, raw: input };
};

const formatTermNode = (coef: number, vars: string, power: number) => {
  if (coef === 0) return '0';
  let str = '';
  
  if (coef === -1 && vars) str = '-';
  else if (coef !== 1 || !vars) str = coef.toString();
  
  if (vars) {
    str += vars;
    if (power > 1) str += `^{${power}}`;
  }
  return str;
};

// Power a term to an exponent e.g. (2x^2)^3 => 8x^6
const powerTerm = (t: Term, exp: number) => {
   if (!t.vars) return Math.pow(t.coef, exp).toString();
   const newCoef = Math.pow(t.coef, exp);
   const newPow = t.pow * exp;
   return formatTermNode(newCoef, t.vars, newPow);
};

// Multiply two terms and a constant e.g. 2 * (3x) * (4y^2) => 24xy^2
const multiplyTerms = (c: number, t1: Term, t2: Term) => {
   const newCoef = c * t1.coef * t2.coef;
   if (newCoef === 0) return '0';
   
   // We won't combine variables if they are different (e.g. x and y)
   // For a simple machine, we just concatenate them
   let varStr = '';
   if (t1.vars === t2.vars && t1.vars) {
       const newPow = t1.pow + t2.pow;
       varStr = `${t1.vars}^{${newPow}}`; // 1 is handled implicitly sometimes, but ^{1} is messy.
       if (newPow === 1) varStr = t1.vars;
   } else {
       const v1 = t1.vars ? `${t1.vars}${t1.pow > 1 ? `^{${t1.pow}}` : ''}` : '';
       const v2 = t2.vars ? `${t2.vars}${t2.pow > 1 ? `^{${t2.pow}}` : ''}` : '';
       varStr = v1 + v2;
   }
   
   let str = '';
   if (newCoef === -1 && varStr) str = '-';
   else if (newCoef !== 1 || !varStr) str = newCoef.toString();
   
   return str + varStr;
};

const multiplyTermPower = (c: number, t1: Term, p1: number, t2: Term, p2: number) => {
   // Simplify by mocking terms to powered state
   const t1p = { ...t1, coef: Math.pow(t1.coef, p1), pow: t1.pow * p1, vars: t1.vars ? t1.vars : '' };
   const t2p = { ...t2, coef: Math.pow(t2.coef, p2), pow: t2.pow * p2, vars: t2.vars ? t2.vars : '' };
   return multiplyTerms(c, t1p, t2p);
}


export const ShortMultiplicationMachine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'formulas'|'machine'|'factor'>('formulas');
  
  const [termA, setTermA] = useState('2x');
  const [termB, setTermB] = useState('3y');
  const [operation, setOperation] = useState<'plus'|'minus'>('plus');
  const [exponent, setExponent] = useState<2|3>(2);

  const [factorA, setFactorA] = useState('6x^2');
  const [factorB, setFactorB] = useState('9x');
  const [factorOp, setFactorOp] = useState<'plus'|'minus'>('minus');

  const renderFormulas = () => (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Introduction */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-xl text-indigo-600 dark:text-indigo-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
          შემოკლებული გამრავლების ფორმულები
        </h3>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          შემოკლებული გამრავლების ფორმულები გამოიყენება მრავალწევრების სწრაფად გადასამრავლებლად ან მარტივ მამრავლებლად დასაშლელად. 
          მათი ცოდნა აუცილებელია ალგებრული გამოსახულებების გამარტივებისთვის და განტოლებების ამოსახსნელად.
        </p>
      </div>

      {/* Squares */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">
          კვადრატის ფორმულები
        </h3>
        <div className="space-y-6">
          {/* (a+b)^2 */}
          <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
            <h4 className="font-bold text-indigo-700 dark:text-indigo-300 mb-2">ორწევრის ჯამის კვადრატი</h4>
            <div className="bg-white dark:bg-slate-950 p-4 rounded-lg flex justify-center mb-4">
               <MathRenderer text="$$ (a + b)^2 = a^2 + 2ab + b^2 $$" />
            </div>
            <div className="ml-2 space-y-2 text-sm">
               <p className="text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">მარტივი მაგალითი:</strong> <MathRenderer inline text="\( (x + 3)^2 = x^2 + 2 \cdot x \cdot 3 + 3^2 = x^2 + 6x + 9 \)" /></p>
               <p className="text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">რთული მაგალითი:</strong> <MathRenderer inline text="\( (2x^2 + 5y)^2 = (2x^2)^2 + 2(2x^2)(5y) + (5y)^2 = 4x^4 + 20x^2y + 25y^2 \)" /></p>
            </div>
          </div>

          {/* (a-b)^2 */}
          <div className="bg-pink-50/50 dark:bg-pink-900/10 p-4 rounded-xl border border-pink-100 dark:border-pink-800">
            <h4 className="font-bold text-pink-700 dark:text-pink-300 mb-2">ორწევრის სხვაობის კვადრატი</h4>
            <div className="bg-white dark:bg-slate-950 p-4 rounded-lg flex justify-center mb-4">
               <MathRenderer text="$$ (a - b)^2 = a^2 - 2ab + b^2 $$" />
            </div>
            <div className="ml-2 space-y-2 text-sm">
               <p className="text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">მარტივი მაგალითი:</strong> <MathRenderer inline text="\( (y - 4)^2 = y^2 - 2 \cdot y \cdot 4 + 4^2 = y^2 - 8y + 16 \)" /></p>
               <p className="text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">რთული მაგალითი:</strong> <MathRenderer inline text="\( (-a - b)^2 = (-(a+b))^2 = a^2 + 2ab + b^2 \)" /> (მინუსის ფრჩხილებს გარეთ გატანით)</p>
            </div>
          </div>

          {/* a^2-b^2 */}
          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <h4 className="font-bold text-emerald-700 dark:text-emerald-300 mb-2">კვადრატების სხვაობა</h4>
            <div className="bg-white dark:bg-slate-950 p-4 rounded-lg flex justify-center mb-4">
               <MathRenderer text="$$ a^2 - b^2 = (a - b)(a + b) $$" />
            </div>
            <div className="ml-2 space-y-2 text-sm">
               <p className="text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">მარტივი მაგალითი:</strong> <MathRenderer inline text="\( x^2 - 25 = (x - 5)(x + 5) \)" /></p>
               <p className="text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">რთული მაგალითი:</strong> <MathRenderer inline text="\( 16m^4 - 81n^2 = (4m^2 - 9n)(4m^2 + 9n) \)" /></p>
               <p className="text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">ფრჩხილებით:</strong> <MathRenderer inline text="\( (x+1)^2 - (x-2)^2 = ((x+1)-(x-2))((x+1)+(x-2)) = 3(2x-1) \)" /></p>
            </div>
          </div>

          {/* (a+b+c)^2 */}
          <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
            <h4 className="font-bold text-amber-700 dark:text-amber-300 mb-2">სამწევრისა და მრავალწევრის კვადრატი</h4>
            <div className="bg-white dark:bg-slate-950 p-4 rounded-lg flex flex-col gap-4 text-center items-center justify-center mb-4">
               <MathRenderer text="$$ (a + b + c)^2 = a^2 + b^2 + c^2 + 2ab + 2ac + 2bc $$" />
               <MathRenderer text="$$ (a - b - c)^2 = a^2 + b^2 + c^2 - 2ab - 2ac + 2bc $$" />
               <MathRenderer text="$$ \text{და ა.შ.} \dots $$" />
            </div>
            <div className="ml-2 space-y-2 text-sm">
               <p className="text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">ზოგადი წესი:</strong> მრავალწევრის კვადრატი უდრის ყველა წევრის კვადრატების ჯამს დამატებული თითოეული წყვილის გაორკეცებული ნამრავლი შესაბამისი ნიშნებით.</p>
               <p className="text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">ოთხწევრისთვის:</strong> <MathRenderer inline text="\( (a+b+c+d)^2 = a^2+b^2+c^2+d^2 + 2ab+2ac+2ad+2bc+2bd+2cd \)" /></p>
            </div>
          </div>
        </div>
      </div>

      {/* Cubes */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">
          კუბის და მე-n ხარისხის ფორმულები
        </h3>
        <div className="space-y-6">
          {/* (a+b)^3 */}
          <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
            <h4 className="font-bold text-indigo-700 dark:text-indigo-300 mb-2">ჯამის და სხვაობის კუბი</h4>
            <div className="bg-white dark:bg-slate-950 p-4 rounded-lg flex flex-col gap-4 text-center items-center justify-center mb-4">
               <MathRenderer text="$$ (a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3 $$" />
               <MathRenderer text="$$ (a - b)^3 = a^3 - 3a^2b + 3ab^2 - b^3 $$" />
            </div>
            <div className="ml-2 space-y-2 text-sm">
               <p className="text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">მაგალითი 1:</strong> <MathRenderer inline text="\( (x + 2)^3 = x^3 + 3(x^2)(2) + 3(x)(2^2) + 2^3 = x^3 + 6x^2 + 12x + 8 \)" /></p>
               <p className="text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">მაგალითი 2:</strong> <MathRenderer inline text="\( (2m - 1)^3 = (2m)^3 - 3(2m)^2(1) + 3(2m)(1^2) - 1^3 = 8m^3 - 12m^2 + 6m - 1 \)" /></p>
            </div>
          </div>

          {/* a^3 \pm b^3 */}
          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <h4 className="font-bold text-emerald-700 dark:text-emerald-300 mb-2">კუბების ჯამი და სხვაობა</h4>
            <div className="bg-white dark:bg-slate-950 p-4 rounded-lg flex flex-col gap-4 text-center items-center justify-center mb-4">
               <MathRenderer text="$$ a^3 + b^3 = (a + b)(a^2 - ab + b^2) $$" />
               <MathRenderer text="$$ a^3 - b^3 = (a - b)(a^2 + ab + b^2) $$" />
            </div>
            <div className="ml-2 space-y-2 text-sm">
               <p className="text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">მაგალითი:</strong> <MathRenderer inline text="\( 8x^3 + 27 = (2x)^3 + 3^3 = (2x + 3)((2x)^2 - (2x)(3) + 3^2) = (2x+3)(4x^2 - 6x + 9) \)" /></p>
               <p className="text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">მინიშნება:</strong> მეორე ფრჩხილს ეწოდება "არასრული კვადრატი" რადგან მასში 2ab-ს მაგივრად მხოლოდ ab წერია.</p>
            </div>
          </div>

          {/* (a+b+c)^3 */}
          <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
            <h4 className="font-bold text-amber-700 dark:text-amber-300 mb-2">სამწევრის კუბი</h4>
            <div className="bg-white dark:bg-slate-950 p-4 rounded-lg flex flex-col gap-4 text-center items-center justify-center mb-4">
               <MathRenderer text="$$ (a + b + c)^3 = a^3 + b^3 + c^3 + 3(a+b)(a+c)(b+c) $$" />
               <MathRenderer text="$$ (a + b + c)^3 = a^3 + b^3 + c^3 + 3a^2b + 3a^2c + 3ab^2 + 3ac^2 + 3b^2c + 3bc^2 + 6abc $$" />
            </div>
          </div>
          
          {/* a^n \pm b^n */}
           <div className="bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
            <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-2">მე-n ხარისხის ჯამი და სხვაობა</h4>
            <div className="bg-white dark:bg-slate-950 p-4 rounded-lg flex flex-col gap-4 text-center items-center justify-center mb-4">
               <MathRenderer text="$$ a^n - b^n = (a - b)(a^{n-1} + a^{n-2}b + \dots + ab^{n-2} + b^{n-1}) $$" />
               <p className="text-sm text-slate-500 font-bold mt-2">ლუწი n-ისთვის (<MathRenderer inline text="\( n = 2k \)" />):</p>
               <MathRenderer text="$$ a^{2k} - b^{2k} = (a^k - b^k)(a^k + b^k) $$" />
               <MathRenderer text="$$ (a + b)^4 = a^4 + 4a^3b + 6a^2b^2 + 4ab^3 + b^4 $$" />
               <MathRenderer text="$$ (a - b)^4 = a^4 - 4a^3b + 6a^2b^2 - 4ab^3 + b^4 $$" />
               <p className="text-sm text-slate-500 font-bold mt-2">კენტი n-ისთვის (<MathRenderer inline text="\( n = 2k+1 \)" />):</p>
               <MathRenderer text="$$ a^{2k+1} + b^{2k+1} = (a + b)(a^{2k} - a^{2k-1}b + \dots + b^{2k}) $$" />
            </div>
            <div className="ml-2 space-y-2 text-sm">
               <p className="text-slate-600 dark:text-slate-400"><strong>შენიშვნა:</strong> ჯამის ფორმულა ლუწი n-ისთვის (<MathRenderer inline text="\( a^2+b^2, a^4+b^4 \)" />) არ იშლება მამრავლებლად ნამდვილ რიცხვთა სიმრავლეში.</p>
               <p className="text-slate-600 dark:text-slate-400">ბინომიალური კოეფიციენტების პოვნა შესაძლებელია პასკალის სამკუთხედით.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );

  const renderMachine = () => {
    // Evaluation Logic For Interactive Steps
    let eq = '';
    let step1 = '';
    let step2 = '';
    
    // Fallback logic
    const aText = termA || '0';
    const bText = termB || '0';
    const opSign = operation === 'plus' ? '+' : '-';
    
    const parsedA = parseTerm(termA);
    const parsedB = parseTerm(termB);

    if (exponent === 2) {
       eq = `(${aText} ${opSign} ${bText})^2`;
       if (operation === 'plus') {
          step1 = `(${aText})^2 + 2(${aText})(${bText}) + (${bText})^2`;
          if (parsedA && parsedB) {
             step2 = `${powerTerm(parsedA, 2)} + ${multiplyTerms(2, parsedA, parsedB)} + ${powerTerm(parsedB, 2)}`;
          }
       } else {
          step1 = `(${aText})^2 - 2(${aText})(${bText}) + (${bText})^2`;
          if (parsedA && parsedB) {
             step2 = `${powerTerm(parsedA, 2)} - ${multiplyTerms(2, parsedA, parsedB)} + ${powerTerm(parsedB, 2)}`;
          }
       }
    } else if (exponent === 3) {
       eq = `(${aText} ${opSign} ${bText})^3`;
       if (operation === 'plus') {
          step1 = `(${aText})^3 + 3(${aText})^2(${bText}) + 3(${aText})(${bText})^2 + (${bText})^3`;
          if (parsedA && parsedB) {
             step2 = `${powerTerm(parsedA, 3)} + ${multiplyTermPower(3, parsedA, 2, parsedB, 1)} + ${multiplyTermPower(3, parsedA, 1, parsedB, 2)} + ${powerTerm(parsedB, 3)}`;
          }
       } else {
          step1 = `(${aText})^3 - 3(${aText})^2(${bText}) + 3(${aText})(${bText})^2 - (${bText})^3`;
          if (parsedA && parsedB) {
             step2 = `${powerTerm(parsedA, 3)} - ${multiplyTermPower(3, parsedA, 2, parsedB, 1)} + ${multiplyTermPower(3, parsedA, 1, parsedB, 2)} - ${powerTerm(parsedB, 3)}`;
          }
       }
    }

    // Clean double signs like + - => -
    step2 = step2.replace(/\+ \-/g, '- ').replace(/\- \-/g, '+ ').replace(/^\+ /, '');

    return (
      <div className="animate-fadeIn pb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-6">
           <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center justify-center gap-2">
             <Cpu className="w-6 h-6 text-indigo-500" />
             გამრავლების სიმულატორი
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] items-center gap-4 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">წევრი A</label>
                 <input 
                    type="text" 
                    value={termA} 
                    onChange={e => setTermA(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-mono text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="მაგ: 2x"
                 />
              </div>
              
              <div className="flex flex-col gap-2 mx-auto">
                 <button 
                   onClick={() => setOperation(operation === 'plus' ? 'minus' : 'plus')}
                   className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xl hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors mt-6"
                 >
                   {operation === 'plus' ? '+' : '-'}
                 </button>
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">წევრი B</label>
                 <input 
                    type="text" 
                    value={termB} 
                    onChange={e => setTermB(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-mono text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="მაგ: 3y"
                 />
              </div>

              <div className="flex flex-col gap-2">
                 <label className="text-xs font-bold text-slate-500 uppercase text-center">ხარისხი</label>
                 <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                    <button 
                      onClick={() => setExponent(2)}
                      className={`flex-1 px-3 py-2 rounded-lg font-bold text-sm ${exponent === 2 ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                       ^2
                    </button>
                    <button 
                      onClick={() => setExponent(3)}
                      className={`flex-1 px-3 py-2 rounded-lg font-bold text-sm ${exponent === 3 ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                       ^3
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Live Preview & Result */}
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-3xl p-6 relative overflow-hidden min-h-[300px] flex flex-col items-center justify-center">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full"></div>
           
           <div className="relative z-10 w-full flex flex-col items-center gap-6">
              <div className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                 <MathRenderer inline text={`$$ ${eq} $$`} />
              </div>
              
              <div className="text-lg text-slate-500 dark:text-slate-400 font-bold">
                 =
              </div>

              <div className="w-full bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto text-center custom-scrollbar">
                 <span className="text-indigo-600 dark:text-indigo-400 text-lg md:text-xl font-bold whitespace-nowrap">
                    <MathRenderer inline text={`$$ ${step1} $$`} />
                 </span>
              </div>

              {parsedA && parsedB && step2 && (
                <>
                  <div className="text-lg text-slate-500 dark:text-slate-400 font-bold">
                     =
                  </div>

                  <div className="w-full bg-slate-900 dark:bg-black p-6 rounded-2xl shadow-lg border border-slate-800 overflow-x-auto text-center custom-scrollbar">
                     <span className="text-emerald-400 text-xl md:text-2xl font-bold whitespace-nowrap">
                        <MathRenderer inline text={`$$ ${step2} $$`} />
                     </span>
                  </div>
                </>
              )}
           </div>
        </div>
      </div>
    );
  };

  const getGCD = (x: number, y: number): number => {
    x = Math.abs(Math.round(x));
    y = Math.abs(Math.round(y));
    while(y) {
      let t = y;
      y = x % y;
      x = t;
    }
    return x || 1;
  };

  const renderFactorMachine = () => {
    const t1 = parseTerm(factorA);
    const t2 = parseTerm(factorB);
    
    let eqStr = `${factorA || '0'} ${factorOp === 'plus' ? '+' : '-'} ${factorB || '0'}`;
    // handle case where second term is negative with plus, etc.
    eqStr = eqStr.replace(/\+ \-/g, '- ').replace(/\- \-/g, '+ ');

    let steps: string[] = [];
    let resultStr = '';

    if (t1 && t2) {
       const gcdCoef = getGCD(t1.coef, t2.coef);
       let gcdVars = '';
       let gcdPow = 0;

       if (t1.vars === t2.vars && t1.vars !== '') {
          gcdVars = t1.vars;
          gcdPow = Math.min(t1.pow, t2.pow);
       } else if (t1.vars && t2.vars && t1.vars.includes(t2.vars)) {
          gcdVars = t2.vars;
          gcdPow = 1;
       } else if (t2.vars && t1.vars && t2.vars.includes(t1.vars)) {
          gcdVars = t1.vars;
          gcdPow = 1;
       }

       const commonTermFormat = formatTermNode(gcdCoef, gcdVars, gcdPow);
       
       let rem1Coef = t1.coef / gcdCoef;
       let rem1Pow = t1.pow - gcdPow;
       let rem1Vars = t1.vars;
       if (gcdVars && gcdVars === t1.vars && rem1Pow === 0) rem1Vars = '';
       
       let rem2Coef = t2.coef / gcdCoef;
       let rem2Pow = t2.pow - gcdPow;
       let rem2Vars = t2.vars;
       if (gcdVars && gcdVars === t2.vars && rem2Pow === 0) rem2Vars = '';

       let r1Str = formatTermNode(rem1Coef, rem1Vars, rem1Pow);
       let r2Str = formatTermNode(rem2Coef, rem2Vars, rem2Pow);
       if (r1Str === '') r1Str = '1';
       if (r2Str === '') r2Str = '1';

       steps.push(`$$ \\text{1. ვპოულობთ კოეფიციენტების უდიდეს საერთო გამყოფს: } GCD(|${t1.coef}|, |${t2.coef}|) = ${gcdCoef} $$`);
       if (gcdVars) {
          steps.push(`$$ \\text{2. ვპოულობთ საერთო ცვლადს და ვირჩევთ უმცირესი ხარისხით: } ${gcdVars}^{${gcdPow}} $$`);
       } else {
          steps.push(`$$ \\text{2. მონომებს შორის საერთო ცვლადი არ არის.} $$`);
       }
       
       steps.push(`$$ \\text{3. საერთო მამრავლია ნამრავლი: } ${commonTermFormat} $$`);
       steps.push(`$$ \\text{4. ვყოფთ ორივე წევრს საერთო მამრავლზე:} $$`);
       steps.push(`$$ \\frac{${factorA}}{${commonTermFormat}} = ${r1Str} \\quad \\text{და} \\quad \\frac{${factorB}}{${commonTermFormat}} = ${r2Str} $$`);
       
       resultStr = `${commonTermFormat}(${r1Str} ${factorOp === 'plus' ? '+' : '-'} ${r2Str})`;
       resultStr = resultStr.replace(/\+ \-/g, '- ').replace(/\- \-/g, '+ ');
    }

    return (
      <div className="animate-fadeIn pb-8">
        {/* Explanation Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-6">
           <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
             <Lightbulb className="w-6 h-6 text-amber-500" />
             საერთო მამრავლის გატანა
           </h3>
           <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
             საერთო მამრავლის ფრჩხილებს გარეთ გატანა მრავალწევრის მამრავლებლად დაშლის ერთ-ერთი ძირითადი ხერხია. 
             ეს პროცესი ეფუძნება გამრავლების განრიგებადობის კანონს: <MathRenderer inline text="\( ab + ac = a(b + c) \)" />.
           </p>
           <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400 text-sm">
             <li>ჯერ უნდა ვიპოვოთ რიცხვითი კოეფიციენტების <strong>უდიდესი საერთო გამყოფი (GCD)</strong>.</li>
             <li>შემდეგ ვპოულობთ საერთო ცვლადებს <strong>უმცირესი ხარისხით</strong>.</li>
             <li>საერთო მამრავლს გავიტანთ ფრჩხილებს გარეთ, ფრჩხილებში კი რჩება თითოეული წევრის საერთო მამრავლზე გაყოფის შედეგი.</li>
           </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-6">
           <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">წევრი A</label>
                 <input 
                    type="text" 
                    value={factorA} 
                    onChange={e => setFactorA(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-mono text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="მაგ: 6x^2"
                 />
              </div>
              
              <div className="flex flex-col gap-2 mx-auto">
                 <button 
                   onClick={() => setFactorOp(factorOp === 'plus' ? 'minus' : 'plus')}
                   className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold text-xl hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors mt-6"
                 >
                   {factorOp === 'plus' ? '+' : '-'}
                 </button>
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">წევრი B</label>
                 <input 
                    type="text" 
                    value={factorB} 
                    onChange={e => setFactorB(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-mono text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="მაგ: 9x"
                 />
              </div>
           </div>
        </div>

        {/* Breakdown & Result */}
        <div className="space-y-4">
           <div className="bg-white dark:bg-slate-900 px-6 py-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center overflow-x-auto">
              <span className="text-2xl font-bold text-slate-800 dark:text-white">
                <MathRenderer inline text={`$$ ${eqStr} $$`} />
              </span>
           </div>
           
           <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 space-y-4 text-center text-sm md:text-base">
              <h4 className="font-bold text-slate-500 uppercase text-xs mb-4">ნაბიჯები</h4>
              {steps.map((step, i) => (
                <div key={i} className="py-2">
                   <MathRenderer inline text={step} />
                </div>
              ))}
           </div>
           
           <div className="bg-emerald-600 dark:bg-emerald-500 p-6 rounded-2xl shadow-lg border border-emerald-500 text-center text-white overflow-x-auto">
              <h4 className="font-bold text-emerald-200 uppercase text-xs mb-2">საბოლოო პასუხი</h4>
              <span className="text-3xl font-black">
                 <MathRenderer inline text={`$$ = ${resultStr} $$`} />
              </span>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Calculator className="text-indigo-600 w-8 h-8" />
            შემოკლებული გამრავლება
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
            ალგებრული ფორმულების ცნობარი და დინამიური სიმულატორი გონებაში ამოხსნის გასაუმჯობესებლად.
          </p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 self-start">
          <button
            onClick={() => setActiveTab('formulas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'formulas' 
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" /> თეორია
          </button>
          <button
            onClick={() => setActiveTab('machine')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'machine' 
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" /> მანქანა
          </button>
          <button
            onClick={() => setActiveTab('factor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'factor' 
                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Lightbulb className="w-4 h-4" /> დაშლა
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4">
        {activeTab === 'formulas' && renderFormulas()}
        {activeTab === 'machine' && renderMachine()}
        {activeTab === 'factor' && renderFactorMachine()}
      </div>
    </div>
  );
};
