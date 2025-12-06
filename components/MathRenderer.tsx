import React, { useEffect, useRef } from 'react';

interface MathRendererProps {
  text: string;
  className?: string;
  inline?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ text, className = '', inline = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- ENHANCED PARSER WITH SVG SUPPORT ---
    // 1. Extract SVGs to prevent them from being escaped or formatted as Markdown.
    const svgs: string[] = [];
    // Regex matches <svg ...> </svg> blocks, including newlines.
    let processedText = text.replace(/<svg[\s\S]*?<\/svg>/g, (match) => {
        svgs.push(match);
        return `__SVG_PLACEHOLDER_${svgs.length - 1}__`;
    });

    // 2. Escape HTML characters in the remaining text (Basic Security)
    let html = processedText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
      
    // 3. Markdown Formatting (Headers, Bold, Lists)
    html = html
      // Headers (### Title -> <h3>Title</h3>)
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-slate-800 mt-4 mb-2 border-b border-slate-200 pb-1">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-indigo-700 mt-5 mb-3">$1</h2>')
      
      // Bold (**text**) -> <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-indigo-900">$1</strong>')
      
      // Lists (* Item or - Item)
      .replace(/^\s*[\-\*] (.*$)/gm, '<li class="ml-4 list-disc marker:text-indigo-500 pl-1 mb-1">$1</li>')
      
      // Line Breaks (\n -> <br>)
      // We apply this ONLY to the text parts, not inside SVGs (since they are placeholders now)
      .replace(/\n/g, "<br />");

    // 4. Restore SVGs (The raw HTML for the image)
    html = html.replace(/__SVG_PLACEHOLDER_(\d+)__/g, (_, index) => {
        // Centered container for the SVG with overflow handling
        return `<div class="my-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm flex justify-center p-4">${svgs[parseInt(index)]}</div>`;
    });

    containerRef.current.innerHTML = html;

    // Trigger MathJax Typeset for LaTeX
    if ((window as any).MathJax && (window as any).MathJax.typesetPromise) {
      (window as any).MathJax.typesetPromise([containerRef.current]).catch((err: any) => console.error(err));
    }

  }, [text]);

  const Tag = inline ? 'span' : 'div';
  
  return <Tag ref={containerRef} className={`${className} ${inline ? 'inline' : ''}`} />;
};