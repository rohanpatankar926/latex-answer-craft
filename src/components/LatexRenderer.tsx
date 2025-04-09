import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface LatexRendererProps {
  content: string;
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ content }) => {
  // Split the content by $ to separate LaTeX expressions
  const parts = content.split(/(\$.*?\$)/g);

  return (
    <>
      {parts.map((part, index) => {
        // Check if this part is a LaTeX expression
        if (part.startsWith('$') && part.endsWith('$')) {
          const latex = part.slice(1, -1); // Remove the $ symbols
          
          // If the LaTeX is on its own line, render as block math
          if (part.trim() === part && latex.includes('\\')) {
            return <BlockMath key={index} math={latex} />;
          }
          
          // Otherwise render as inline math
          return <InlineMath key={index} math={latex} />;
        }
        
        // If not LaTeX, just return the text
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export default LatexRenderer;
