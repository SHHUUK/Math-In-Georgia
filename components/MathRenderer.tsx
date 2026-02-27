import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, X, ZoomIn } from 'lucide-react';

interface MathRendererProps {
  text: string;
  className?: string;
  inline?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ text, className = '', inline = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomContent, setZoomContent] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let html = text || '';

    // Placeholders for extracted content
    const svgPlaceholder = (idx: number) => `__SVG_BLOCK_${idx}__`;
    const mathBlockPlaceholder = (idx: number) => `__MATH_BLOCK_${idx}__`;

    const svgs: string[] = [];
    const mathBlocks: string[] = [];

    // 1. Extract SVGs first to prevent text processing from breaking them
    // We assume the SVG is valid XML from Gemini
    html = html.replace(/<svg[\s\S]*?<\/svg>/g, (match) => {
      svgs.push(match);
      return svgPlaceholder(svgs.length - 1);
    });

    // 2. Extract Block Math ($$ ... $$)
    // We capture everything between $$ and $$
    html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, content) => {
      mathBlocks.push(content);
      return mathBlockPlaceholder(mathBlocks.length - 1);
    });

    // 3. Process Markdown-like formatting on the remaining text
    
    // Headers (### -> h3)
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-slate-800 dark:text-slate-200 mt-5 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1 w-full">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-indigo-700 dark:text-indigo-300 mt-6 mb-3 w-full">$1</h2>');
    
    // Bold (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-indigo-900 dark:text-indigo-200">$1</strong>');
    
    // Bullet Points (* text or - text)
    // Using flex container to align bullet properly
    html = html.replace(/^\s*[\-\*] (.*$)/gm, '<div class="flex items-start gap-2 ml-1 mb-1 w-full"><span class="text-indigo-500 dark:text-indigo-400 mt-1.5 text-xs">●</span><span class="flex-1">$1</span></div>');

    // Convert newlines to breaks, but handle multiple newlines as paragraph spacing
    html = html.replace(/\n\n/g, '<div class="h-2"></div>'); // Spacer for double newline
    html = html.replace(/\n/g, '<br />');

    // 4. Restore Math Blocks with Proper Containerization
    html = html.replace(/__MATH_BLOCK_(\d+)__/g, (_, idx) => {
        const content = mathBlocks[parseInt(idx)];
        // Container keeps it separate from text, centered, and scrollable if too wide
        return `
          <div class="my-4 w-full overflow-x-auto overflow-y-hidden p-2 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-center items-center custom-scrollbar">
            <span class="math-display text-lg text-slate-800 dark:text-slate-200">$$ ${content} $$</span>
          </div>
        `;
    });

    // 5. Restore SVGs with Layout Containers (Symmetry & Spacing) & Zoom Capability
    html = html.replace(/__SVG_BLOCK_(\d+)__/g, (_, idx) => {
        const svgContent = svgs[parseInt(idx)];
        // Add specific class 'math-visual-wrapper' for event delegation
        return `
          <div class="my-6 w-full flex flex-col items-center justify-center">
            <div class="math-visual-wrapper bg-white dark:bg-slate-800 p-2 md:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden max-w-full hover:shadow-md transition-all duration-300 cursor-zoom-in relative group">
              ${svgContent}
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors flex items-center justify-center pointer-events-none">
                 <div class="opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-slate-700/90 p-2 rounded-full shadow-sm text-indigo-600 dark:text-indigo-400 transform scale-75 group-hover:scale-100 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-6-6"/><circle cx="10" cy="10" r="8"/><path d="m10 7v6"/><path d="m7 10h6"/></svg>
                 </div>
              </div>
            </div>
            <div class="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium text-center">დააჭირეთ გასადიდებლად</div>
          </div>
        `;
    });

    // Inject processed HTML
    containerRef.current.innerHTML = html;

    // Attach Click Listeners for Zoom
    const visualWrappers = containerRef.current.querySelectorAll('.math-visual-wrapper');
    visualWrappers.forEach((wrapper) => {
      wrapper.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent bubbling if inside another clickable
        // Extract just the inner SVG/IMG for the modal
        setZoomContent(wrapper.innerHTML);
      });
    });

    // Trigger MathJax Typeset
    if ((window as any).MathJax && (window as any).MathJax.typesetPromise) {
      (window as any).MathJax.typesetPromise([containerRef.current]).catch((err: any) => console.error(err));
    }

  }, [text]);

  const Tag = inline ? 'span' : 'div';
  
  return (
    <>
      <Tag ref={containerRef} className={`${className} ${inline ? 'inline' : 'block leading-relaxed break-words text-[15px]'}`} />
      
      {/* Zoom Modal */}
      {zoomContent && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setZoomContent(null)}
        >
          <div className="absolute top-4 right-4 z-50">
            <button 
              onClick={() => setZoomContent(null)} 
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <X size={32} />
            </button>
          </div>
          
          <div 
            className="bg-white p-4 rounded-xl shadow-2xl max-w-full max-h-full overflow-auto flex items-center justify-center relative zoom-content-container"
            onClick={(e) => e.stopPropagation()} // Prevent close on content click
          >
             {/* Render content but remove the overlay hints if they were copied */}
             <div 
               className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[85vh] [&>div]:hidden"
               dangerouslySetInnerHTML={{ __html: zoomContent }} 
             />
          </div>
          <div className="mt-4 text-white/70 text-sm font-bold flex items-center gap-2">
             <Maximize2 size={16} /> ვიზუალიზაციის დეტალური ხედი
          </div>
        </div>
      )}
    </>
  );
};