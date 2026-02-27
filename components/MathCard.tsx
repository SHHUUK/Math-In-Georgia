import React, { useState } from 'react';
import { Copy, Check, BookOpen, ArrowRight, Wand2, Loader2 } from 'lucide-react';
import { MathSubTopic, Language } from '../types';
import { generateMathIllustration } from '../services/geminiService';
import { MathRenderer } from './MathRenderer';

interface MathCardProps {
  topic: MathSubTopic;
  onClick?: () => void;
  language?: Language;
}

export const MathCard: React.FC<MathCardProps> = ({ topic, onClick, language = 'ka' }) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const t = {
    ka: {
      noImage: 'ფოტო მიუწვდომელია',
      generating: 'AI ილუსტრაციის შექმნა...',
      generate: 'ილუსტრაციის გენერირება',
      copy: 'ფორმულის კოპირება',
      viewFull: 'სრულად ნახვა'
    },
    en: {
      noImage: 'Image unavailable',
      generating: 'Creating AI Illustration...',
      generate: 'Generate Illustration',
      copy: 'Copy Formula',
      viewFull: 'View Full'
    }
  }[language];

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

  // Prepare the formula text.
  // With MathJax, we can just pass the formula directly. 
  // We wrap it in $$ to ensure display mode if it's not already.
  const rawFormula = topic.formula ? topic.formula.split('\n')[0] + (topic.formula.includes('\n') ? '\n...' : '') : '';
  const displayFormula = rawFormula.startsWith('$') ? rawFormula : `$$ ${rawFormula} $$`;

  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden 
        transform transition-all duration-300 ease-out
        hover:scale-[1.02] hover:-translate-y-1 
        hover:shadow-xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-900/40 hover:border-indigo-300 dark:hover:border-indigo-700
        flex flex-col group h-full break-inside-avoid
        ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`h-48 overflow-hidden relative ${!showImage ? `bg-gradient-to-br ${gradientClass}` : 'bg-indigo-50 dark:bg-indigo-950/30'}`}>
        {showImage ? (
          <img 
            src={showImage} 
            alt={topic.title}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white p-4 text-center gap-2 relative overflow-hidden">
             <div className="absolute inset-0 bg-black/10"></div>
             <BookOpen size={48} className="opacity-30 mb-2" />
             <span className="text-sm font-medium opacity-80">{t.noImage}</span>
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
                 <span className="text-white font-bold text-sm tracking-wide drop-shadow-md">{t.generating}</span>
               </div>
            ) : (
              <button
                onClick={handleGenerateImage}
                className="group/btn flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white/10 backdrop-blur-md border border-white/20 transition-all hover:scale-105"
              >
                <div className="p-3 bg-white/20 rounded-full text-white group-hover/btn:bg-white group-hover/btn:text-indigo-600 transition-colors shadow-lg border border-white/20">
                  <Wand2 size={20} />
                </div>
                <span className="text-white font-semibold text-xs drop-shadow-md uppercase tracking-wider">{t.generate}</span>
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="p-6 flex-1 flex flex-col gap-4">
        {topic.formula && (
          <div className="relative group/formula">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 group-hover:border-indigo-200 dark:group-hover:border-indigo-900 group-hover:shadow-sm transition-all duration-300 text-indigo-800 dark:text-indigo-300 overflow-x-auto math-formula shadow-inner pr-10 min-h-[60px] flex items-center">
              <div className="text-xl font-bold w-full">
                 <MathRenderer text={displayFormula} />
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm opacity-0 group-hover/formula:opacity-100 transition-all duration-200 focus:opacity-100 focus:outline-none z-10"
              title={t.copy}
              data-html2canvas-ignore
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
        )}
        
        <div className="prose prose-sm prose-slate dark:prose-invert text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
          <p className="line-clamp-3">{topic.explanation}</p>
        </div>

        {onClick && (
          <div className="pt-2 mt-auto flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-semibold text-sm group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors" data-html2canvas-ignore>
            <div className="flex items-center">
              <BookOpen size={16} className="mr-2" />
              {t.viewFull}
            </div>
            <ArrowRight size={16} className="transform translate-x-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        )}
      </div>
    </div>
  );
};
