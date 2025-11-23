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

    // Check if KaTeX is loaded from the CDN
    const katex = (window as any).katex;
    if (!katex) {
      // Fallback if KaTeX isn't loaded yet
      containerRef.current.innerText = text;
      return;
    }

    // Advanced Regex to split by $$...$$ (display) or $...$ (inline)
    // We treat the AI response as a mix of text and LaTeX
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
    
    containerRef.current.innerHTML = '';
    
    parts.forEach(part => {
      const span = document.createElement('span');
      
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Display Math
        try {
          katex.render(part.slice(2, -2), span, { displayMode: true, throwOnError: false });
        } catch (e) {
          span.innerText = part;
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // Inline Math
        try {
          katex.render(part.slice(1, -1), span, { displayMode: false, throwOnError: false });
        } catch (e) {
          span.innerText = part;
        }
      } else {
        // Plain Text - handle newlines
        // We replace \n with <br> for plain text parts to preserve formatting
        const lines = part.split('\n');
        lines.forEach((line, i) => {
           span.appendChild(document.createTextNode(line));
           if (i < lines.length - 1) span.appendChild(document.createElement('br'));
        });
      }
      containerRef.current?.appendChild(span);
    });

  }, [text]);

  const Tag = inline ? 'span' : 'div';
  // We use a div/span ref to manually manage the DOM content for KaTeX
  return <Tag ref={containerRef} className={`${className} ${inline ? 'inline' : ''}`} />;
};