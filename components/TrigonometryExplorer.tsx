import React, { useState } from 'react';
import { Sigma, Table2, FunctionSquare, Calculator } from 'lucide-react';
import { MathRenderer } from './MathRenderer';

export const TrigonometryExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'formulas' | 'table' | 'calculator'>('formulas');
  
  // Calculator state
  const [calcInput, setCalcInput] = useState<string>('30');
  
  const calculateTrig = (degrees: number) => {
    const rad = degrees * (Math.PI / 180);
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    const tan = Math.tan(rad);
    
    // Format to avoid floating point errors like 0.0000000000000001
    const format = (val: number) => {
      if (Math.abs(val) < 1e-10) return 0;
      if (Math.abs(val) > 1e10) return Infinity;
      return Number(val.toFixed(4));
    };

    const formattedCos = format(cos);
    const formattedSin = format(sin);
    
    let formattedTan: string | number = format(tan);
    if (formattedCos === 0) formattedTan = 'არ არსებობს';
    
    let formattedCot: string | number;
    if (formattedSin === 0) {
      formattedCot = 'არ არსებობს';
    } else {
      formattedCot = format(cos / sin);
    }
    
    return {
      sin: format(sin),
      cos: format(cos),
      tan: formattedTan,
      cot: formattedCot
    };
  };
  
  const [calcResult, setCalcResult] = useState(() => calculateTrig(30));

  const handleCalcInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCalcInput(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setCalcResult(calculateTrig(num));
    }
  };

  const renderFormulas = () => (
    <div className="space-y-6 animate-fadeIn p-4">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-xl text-indigo-600 dark:text-indigo-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
          ძირითადი იგივეობები
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
            <MathRenderer text="$$ \sin^2 \alpha + \cos^2 \alpha = 1 $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
            <MathRenderer text="$$ \tan \alpha \cdot \cot \alpha = 1 $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
            <MathRenderer text="$$ \tan \alpha = \frac{\sin \alpha}{\cos \alpha} $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
            <MathRenderer text="$$ \cot \alpha = \frac{\cos \alpha}{\sin \alpha} $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
            <MathRenderer text="$$ 1 + \tan^2 \alpha = \frac{1}{\cos^2 \alpha} $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
            <MathRenderer text="$$ 1 + \cot^2 \alpha = \frac{1}{\sin^2 \alpha} $$" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-xl text-indigo-600 dark:text-indigo-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
          ორმაგი კუთხის ფორმულები
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
            <MathRenderer text="$$ \sin 2\alpha = 2 \sin \alpha \cos \alpha $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center relative space-y-2">
            <MathRenderer text="$$ \cos 2\alpha = \cos^2 \alpha - \sin^2 \alpha $$" />
            <MathRenderer text="$$ = 2\cos^2 \alpha - 1 $$" />
            <MathRenderer text="$$ = 1 - 2\sin^2 \alpha $$" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
              <MathRenderer text="$$ \tan 2\alpha = \frac{2 \tan \alpha}{1 - \tan^2 \alpha} $$" />
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
              <MathRenderer text="$$ \cot 2\alpha = \frac{\cot^2 \alpha - 1}{2 \cot \alpha} $$" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-xl text-indigo-600 dark:text-indigo-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
          შეკრების ფორმულები
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
            <MathRenderer text="$$ \sin(\alpha + \beta) = \sin\alpha \cos\beta + \cos\alpha \sin\beta $$" />
            <div className="h-4"></div>
            <MathRenderer text="$$ \sin(\alpha - \beta) = \sin\alpha \cos\beta - \cos\alpha \sin\beta $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
             <MathRenderer text="$$ \cos(\alpha + \beta) = \cos\alpha \cos\beta - \sin\alpha \sin\beta $$" />
             <div className="h-4"></div>
             <MathRenderer text="$$ \cos(\alpha - \beta) = \cos\alpha \cos\beta + \sin\alpha \sin\beta $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
            <MathRenderer text="$$ \tan(\alpha \pm \beta) = \frac{\tan\alpha \pm \tan\beta}{1 \mp \tan\alpha \tan\beta} $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
            <MathRenderer text="$$ \cot(\alpha \pm \beta) = \frac{\cot\alpha \cot\beta \mp 1}{\cot\beta \pm \cot\alpha} $$" />
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-xl text-indigo-600 dark:text-indigo-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
          ნახევარი კუთხის (ხარისხის დაწევის) ფორმულები
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
            <MathRenderer text="$$ \sin^2 \frac{\alpha}{2} = \frac{1 - \cos \alpha}{2} $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
            <MathRenderer text="$$ \cos^2 \frac{\alpha}{2} = \frac{1 + \cos \alpha}{2} $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center md:col-span-2">
            <MathRenderer text="$$ \tan \frac{\alpha}{2} = \frac{\sin \alpha}{1 + \cos \alpha} = \frac{1 - \cos \alpha}{\sin \alpha} = \pm\sqrt{\frac{1-\cos\alpha}{1+\cos\alpha}} $$" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-xl text-indigo-600 dark:text-indigo-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
          სამმაგი კუთხის ფორმულები
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
            <MathRenderer text="$$ \sin 3\alpha = 3\sin\alpha - 4\sin^3\alpha $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
            <MathRenderer text="$$ \cos 3\alpha = 4\cos^3\alpha - 3\cos\alpha $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
             <MathRenderer text="$$ \tan 3\alpha = \frac{3\tan\alpha - \tan^3\alpha}{1 - 3\tan^2\alpha} $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
             <MathRenderer text="$$ \cot 3\alpha = \frac{\cot^3\alpha - 3\cot\alpha}{3\cot^2\alpha - 1} $$" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-xl text-indigo-600 dark:text-indigo-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
          ჯამისა და სხვაობის გარდაქმნა ნამრავლად
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
             <MathRenderer text="$$ \sin\alpha + \sin\beta = 2\sin\frac{\alpha+\beta}{2}\cos\frac{\alpha-\beta}{2} $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
             <MathRenderer text="$$ \sin\alpha - \sin\beta = 2\sin\frac{\alpha-\beta}{2}\cos\frac{\alpha+\beta}{2} $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
             <MathRenderer text="$$ \cos\alpha + \cos\beta = 2\cos\frac{\alpha+\beta}{2}\cos\frac{\alpha-\beta}{2} $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
             <MathRenderer text="$$ \cos\alpha - \cos\beta = -2\sin\frac{\alpha+\beta}{2}\sin\frac{\alpha-\beta}{2} $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
             <MathRenderer text="$$ \tan\alpha \pm \tan\beta = \frac{\sin(\alpha \pm \beta)}{\cos\alpha\cos\beta} $$" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-xl text-indigo-600 dark:text-indigo-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
          ნამრავლის გარდაქმნა ჯამად
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
             <MathRenderer text="$$ \sin\alpha \sin\beta = \frac{1}{2}[\cos(\alpha-\beta) - \cos(\alpha+\beta)] $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
             <MathRenderer text="$$ \cos\alpha \cos\beta = \frac{1}{2}[\cos(\alpha-\beta) + \cos(\alpha+\beta)] $$" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
             <MathRenderer text="$$ \sin\alpha \cos\beta = \frac{1}{2}[\sin(\alpha+\beta) + \sin(\alpha-\beta)] $$" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTable = () => (
    <div className="animate-fadeIn p-4 overflow-x-auto">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 min-w-max">
        <h3 className="font-bold text-xl text-indigo-600 dark:text-indigo-400 mb-6 flex items-center gap-2">
          <Table2 className="w-6 h-6" /> ტრიგონომეტრიული მნიშვნელობების ცხრილი
        </h3>
        
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-4 border-b-2 border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
                გრადუსები (<MathRenderer inline text="\(^\circ\)" />)
              </th>
              <th className="p-3 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <MathRenderer inline text="\(0^\circ\)" />
              </th>
              <th className="p-3 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                <MathRenderer inline text="\(30^\circ\)" />
              </th>
              <th className="p-3 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <MathRenderer inline text="\(45^\circ\)" />
              </th>
              <th className="p-3 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                <MathRenderer inline text="\(60^\circ\)" />
              </th>
              <th className="p-3 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <MathRenderer inline text="\(90^\circ\)" />
              </th>
              <th className="p-3 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                <MathRenderer inline text="\(180^\circ\)" />
              </th>
              <th className="p-3 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <MathRenderer inline text="\(270^\circ\)" />
              </th>
              <th className="p-3 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                <MathRenderer inline text="\(360^\circ\)" />
              </th>
            </tr>
            <tr>
              <th className="p-4 border-b-4 border-slate-300 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-300">
                რადიანები
              </th>
              <th className="p-3 border-b-4 border-slate-300 dark:border-slate-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                <MathRenderer inline text="\(0\)" />
              </th>
              <th className="p-3 border-b-4 border-slate-300 dark:border-slate-600 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                <MathRenderer inline text="\(\frac{\pi}{6}\)" />
              </th>
              <th className="p-3 border-b-4 border-slate-300 dark:border-slate-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                <MathRenderer inline text="\(\frac{\pi}{4}\)" />
              </th>
              <th className="p-3 border-b-4 border-slate-300 dark:border-slate-600 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                <MathRenderer inline text="\(\frac{\pi}{3}\)" />
              </th>
              <th className="p-3 border-b-4 border-slate-300 dark:border-slate-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                <MathRenderer inline text="\(\frac{\pi}{2}\)" />
              </th>
              <th className="p-3 border-b-4 border-slate-300 dark:border-slate-600 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                <MathRenderer inline text="\(\pi\)" />
              </th>
              <th className="p-3 border-b-4 border-slate-300 dark:border-slate-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                <MathRenderer inline text="\(\frac{3\pi}{2}\)" />
              </th>
              <th className="p-3 border-b-4 border-slate-300 dark:border-slate-600 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                <MathRenderer inline text="\(2\pi\)" />
              </th>
            </tr>
          </thead>
          <tbody>
            {/* SIN */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <td className="p-4 border-b border-slate-200 dark:border-slate-700 font-bold text-pink-600 dark:text-pink-400">
                <MathRenderer inline text="\(\sin \alpha\)" />
              </td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(0\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(\frac{1}{2}\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(\frac{\sqrt{2}}{2}\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(\frac{\sqrt{3}}{2}\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(1\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(0\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(-1\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(0\)" /></td>
            </tr>
            {/* COS */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
              <td className="p-4 border-b border-slate-200 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400">
                <MathRenderer inline text="\(\cos \alpha\)" />
              </td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(1\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(\frac{\sqrt{3}}{2}\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(\frac{\sqrt{2}}{2}\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(\frac{1}{2}\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(0\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(-1\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(0\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(1\)" /></td>
            </tr>
            {/* TAN */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <td className="p-4 border-b border-slate-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400">
                <MathRenderer inline text="\(\tan \alpha\)" />
              </td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(0\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(\frac{\sqrt{3}}{3}\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(1\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(\sqrt{3}\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700 text-slate-400">-</td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(0\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700 text-slate-400">-</td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(0\)" /></td>
            </tr>
            {/* COT */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
              <td className="p-4 border-b border-slate-200 dark:border-slate-700 font-bold text-amber-600 dark:text-amber-400">
                <MathRenderer inline text="\(\cot \alpha\)" />
              </td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700 text-slate-400">-</td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(\sqrt{3}\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(1\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(\frac{\sqrt{3}}{3}\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(0\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700 text-slate-400">-</td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700"><MathRenderer inline text="\(0\)" /></td>
              <td className="p-4 border-b border-slate-200 dark:border-slate-700 text-slate-400">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCalculator = () => (
    <div className="animate-fadeIn p-4 flex justify-center">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center justify-center gap-2">
          <Calculator className="w-6 h-6 text-indigo-500" />
          ტრიგონომეტრიული კალკულატორი
        </h3>
        
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">შეიყვანეთ კუთხე გრადუსებში (deg)</label>
          <div className="relative">
            <input 
              type="number"
              value={calcInput}
              onChange={handleCalcInput}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-lg font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="მაგ: 45"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">°</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl flex flex-col items-center">
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1">
              <MathRenderer inline text="\(\sin\)" />
            </span>
            <span className="text-2xl font-mono font-bold text-indigo-800 dark:text-indigo-200">
              {!isNaN(parseFloat(calcInput)) ? calcResult.sin : '-'}
            </span>
          </div>
          
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl flex flex-col items-center">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
              <MathRenderer inline text="\(\cos\)" />
            </span>
            <span className="text-2xl font-mono font-bold text-emerald-800 dark:text-emerald-200">
              {!isNaN(parseFloat(calcInput)) ? calcResult.cos : '-'}
            </span>
          </div>
          
          <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-2xl flex flex-col items-center">
            <span className="text-sm font-bold text-pink-600 dark:text-pink-400 mb-1 flex items-center gap-1">
              <MathRenderer inline text="\(\tan\)" />
            </span>
            <span className="text-2xl font-mono font-bold text-pink-800 dark:text-pink-200">
              {!isNaN(parseFloat(calcInput)) ? calcResult.tan : '-'}
            </span>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl flex flex-col items-center">
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
              <MathRenderer inline text="\(\cot\)" />
            </span>
            <span className="text-2xl font-mono font-bold text-amber-800 dark:text-amber-200">
              {!isNaN(parseFloat(calcInput)) ? calcResult.cot : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Sigma className="text-indigo-600 w-8 h-8" />
            ტრიგონომეტრიის ცნობარი
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
            ყველა საჭირო ფორმულა, მნიშვნელობათა ცხრილი და ინსტრუმენტი ტრიგონომეტრიული სიდიდეების გამოსათვლელად.
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
            <FunctionSquare className="w-4 h-4" /> ფორმულები
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'table' 
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Table2 className="w-4 h-4" /> ცხრილი
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'calculator' 
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" /> კალკულატორი
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        {activeTab === 'formulas' && renderFormulas()}
        {activeTab === 'table' && renderTable()}
        {activeTab === 'calculator' && renderCalculator()}
      </div>
    </div>
  );
};
