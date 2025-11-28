
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

    // --- SIMPLE MARKDOWN PARSER ---
    // We convert Markdown syntax to HTML before letting MathJax render the math.
    // This allows mixed content: "### Title" + "$x^2$"
    
    let html = text
      // Escape HTML characters first to prevent XSS (basic)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      
      // 1. Headers (### Title -> <h3>Title</h3>)
      // We look for ### at start of line
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-slate-800 mt-4 mb-2 border-b border-slate-200 pb-1">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-indigo-700 mt-5 mb-3">$1</h2>')
      
      // 2. Bold (**text**) -> <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-indigo-900">$1</strong>')
      
      // 3. Lists (* Item or - Item)
      // Simple replace: newline + * -> <li>
      // Note: This is a loose parser. For strict nested lists, a real library is needed.
      .replace(/^\s*[\-\*] (.*$)/gm, '<li class="ml-4 list-disc marker:text-indigo-500 pl-1 mb-1">$1</li>')
      
      // 4. Line Breaks (\n -> <br>)
      // But avoid adding <br> inside or after list items/headers excessively
      .replace(/\n/g, "<br />");

    // Wrap list items in <ul> if needed (simplified approach: just rely on browser handling of <li>)
    // A more robust way:
    if (html.includes('<li')) {
       // Just let them sit there, browsers render <li> fine even without strict <ul> in some contexts,
       // but strictly we should wrap. For this simplified visualizer, we can leave as is or wrap block.
       // Let's rely on the container styling.
    }

    containerRef.current.innerHTML = html;

    // Trigger MathJax Typeset
    if ((window as any).MathJax && (window as any).MathJax.typesetPromise) {
      (window as any).MathJax.typesetPromise([containerRef.current]).catch((err: any) => console.error(err));
    }

  }, [text]);

  const Tag = inline ? 'span' : 'div';
  
  return <Tag ref={containerRef} className={`${className} ${inline ? 'inline' : ''}`} />;
};
