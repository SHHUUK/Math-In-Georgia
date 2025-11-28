
import React, { useState } from 'react';
import { Copy, Check, BookOpen, ArrowRight, Wand2, Loader2 } from 'lucide-react';
import { MathSubTopic } from '../types';
import { generateMathIllustration } from '../services/geminiService';

interface MathCardProps {
  topic: MathSubTopic;
  onClick?: () => void;
}

const formatMathToUnicode = (text: string) => {
  if (!text) return '';

  // Superscript mapping
  const superscripts: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    'n': 'ⁿ', 'x': 'ˣ', 'y': 'ʸ', '+': '⁺', '-': '⁻',
    '(': '⁽', ')': '⁾'
  };

  return text
    // Common symbols
    .replace(/\bsqrt\b/gi, '√')
    .replace(/\bpi\b/gi, 'π')
    .replace(/\bdelta\b/gi, 'Δ')
    .replace(/\btheta\b/gi, 'θ')
    .replace(/\binfinity\b/gi, '∞')
    .replace(/!=/g, '≠')
    .replace(/<=/g, '≤')
    .replace(/>=/g, '≥')
    .replace(/->/g, '→')
    .replace(/\*/g, '·')
    // Fractions and Special Powers
    .replace(/\^1\/2/g, '½')
    .replace(/\^1\/3/g, '⅓')
    // Generic Superscript replacer for ^2, ^n, ^(n+1)
    .replace(/\^([0-9nxy+\-()]+)/g, (_, char) => {
      return char.split('').map((c: string) => superscripts[c] || c).join('');
    });
};

export const MathCard: React.FC<MathCardProps> = ({ topic, onClick }) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when copying
    if (topic.formula) {
      try {
        await navigator.clipboard.writeText(topic.formula);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const handleGenerateImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGenerating(true);
    const img = await generateMathIllustration(topic.title, topic.explanation);
    if (img) {
      setGeneratedImage(img);
      setImageError(false);
    }
    setIsGenerating(false);
  };

  // Reliable placeholder gradients based on topic ID hash or simple rotation
  const gradients = [
    'from-blue-400 to-indigo-600',
    'from-emerald-400 to-teal-600',
    'from-orange-400 to-pink-600',
    'from-purple-400 to-violet-600',
  ];
  const gradientClass = gradients[topic.title.length % gradients.length];

  // Determine what image to show: Generated > Provided URL > Fallback
  const showImage = generatedImage || (!imageError && topic.imageUrl);

  // Prepare the formula text
  const rawFormula = topic.formula ? topic.formula.split('\n')[0] + (topic.formula.includes('\n') ? '\n...' : '') : '';
  const displayFormula = formatMathToUnicode(rawFormula);

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden 
        transform transition-all duration-300 ease-out
        hover:scale-[1.02] hover:-translate-y-1 
        hover:shadow-xl hover:shadow-indigo-500/20 hover:border-indigo-300 
        flex flex-col group h-full break-inside-avoid
        ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`h-48 overflow-hidden relative ${!showImage ? `bg-gradient-to-br ${gradientClass}` : 'bg-indigo-50'}`}>
        {showImage ? (
          <img 
            src={showImage} 
            alt={topic.title}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white p-4 text-center gap-2 relative overflow-hidden">
             <div className="absolute inset-0 bg-black/10"></div>
             <BookOpen size={48} className="opacity-30 mb-2" />
             <span className="text-sm font-medium opacity-80">ფოტო მიუწვდომელია</span>
          </div>
        )}

        {/* Image Overlay Gradient & Title */}
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 via-indigo-900/30 to-transparent flex items-end pointer-events-none z-10">
          <div className="p-5 w-full">
            <h3 className="text-white font-bold text-xl drop-shadow-md tracking-wide transform group-hover:translate-x-1 transition-transform duration-300">{topic.title}</h3>
          </div>
        </div>

        {/* Explicit Generate Button if Image Missing */}
        {!showImage && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center z-20 p-4 text-center transition-all duration-500 ${isGenerating ? 'bg-indigo-900/40 backdrop-blur-sm' : ''} group-hover:opacity-100 opacity-0`} data-html2canvas-ignore>
            {isGenerating ? (
               <div className="flex flex-col items-center gap-2">
                 <div className="relative">
                   <div className="w-12 h-12 rounded-full border-4 border-white/30 animate-pulse"></div>
                   <Loader2 size={24} className="text-white animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                 </div>
                 <span className="text-white font-bold text-sm tracking-wide drop-shadow-md">AI ილუსტრაციის შექმნა...</span>
               </div>
            ) : (
              <button
                onClick={handleGenerateImage}
                className="group/btn flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white/10 backdrop-blur-md border border-white/20 transition-all hover:scale-105"
              >
                <div className="p-3 bg-white/20 rounded-full text-white group-hover/btn:bg-white group-hover/btn:text-indigo-600 transition-colors shadow-lg border border-white/20">
                  <Wand2 size={20} />
                </div>
                <span className="text-white font-semibold text-xs drop-shadow-md uppercase tracking-wider">ილუსტრაციის გენერირება</span>
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="p-6 flex-1 flex flex-col gap-4">
        {topic.formula && (
          <div className="relative group/formula">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 group-hover:border-indigo-200 group-hover:shadow-sm transition-all duration-300 font-mono text-indigo-800 overflow-x-auto math-formula shadow-inner pr-10">
              {/* Increased font size here */}
              <pre className="whitespace-pre-wrap font-bold font-mono font-feature-settings-tnum text-xl md:text-2xl">{displayFormula}</pre>
            </div>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-300 shadow-sm opacity-0 group-hover/formula:opacity-100 transition-all duration-200 focus:opacity-100 focus:outline-none z-10"
              title="ფორმულის კოპირება"
              data-html2canvas-ignore
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
        )}
        
        <div className="prose prose-sm prose-slate text-slate-600 leading-relaxed flex-1">
          <p className="line-clamp-3">{topic.explanation}</p>
        </div>

        {onClick && (
          <div className="pt-2 mt-auto flex items-center justify-between text-indigo-600 font-semibold text-sm group-hover:text-indigo-700 transition-colors" data-html2canvas-ignore>
            <div className="flex items-center">
              <BookOpen size={16} className="mr-2" />
              სრულად ნახვა
            </div>
            <ArrowRight size={16} className="transform translate-x-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        )}
      </div>
    </div>
  );
};
