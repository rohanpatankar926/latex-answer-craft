import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface LatexRendererProps {
  content: string;
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ content }) => {
  // Updated regex to capture newlines using [\s\S]
  const parts = content.split(/(\$[\s\S]*?\$)/g);

  return (
    <>
      {parts.map((part, index) => {
        // Check if this part is a LaTeX expression enclosed in dollar signs.
        if (part.startsWith('$') && part.endsWith('$')) {
          // Remove the $ symbols.
          const latex = part.slice(1, -1);
          
          // Use block math if the LaTeX string includes a newline character,
          // which usually indicates a multiline expression.
          if (latex.includes('\n')) {
            return <BlockMath key={index} math={latex} />;
          }
          
          // Otherwise render as inline math.
          return <InlineMath key={index} math={latex} />;
        }
        
        // If not a LaTeX expression, render as plain text.
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export default LatexRenderer;
