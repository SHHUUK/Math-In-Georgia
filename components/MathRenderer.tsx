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

    // Set the inner HTML
    // We treat newlines as <br> for non-math text mostly, 
    // but MathJax will handle the $...$ parts.
    // To be safe, we just set the text content and let MathJax parse the whole block.
    // However, simply setting innerText loses line breaks in the UI.
    
    // Strategy: Split by newlines, wrap in divs, then let MathJax process.
    // Or simpler: Just set innerHTML with converted newlines and let MathJax search.
    
    const formattedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br />");

    containerRef.current.innerHTML = formattedText;

    // Trigger MathJax Typeset
    if ((window as any).MathJax && (window as any).MathJax.typesetPromise) {
      (window as any).MathJax.typesetPromise([containerRef.current]).catch((err: any) => console.error(err));
    }

  }, [text]);

  const Tag = inline ? 'span' : 'div';
  
  return <Tag ref={containerRef} className={`${className} ${inline ? 'inline' : ''}`} />;
};