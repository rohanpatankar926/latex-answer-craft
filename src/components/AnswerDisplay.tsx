import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AnswerResponse } from '@/services/api';
import LatexRenderer from './LatexRenderer';

interface AnswerDisplayProps {
  answerChunks: AnswerResponse[];
  isLoading: boolean;
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answerChunks, isLoading }) => {
  // Helper function to process plain text with our custom tokens.
  const processPlainText = (text: string) => {
    // Split by tokens: <newline>, <end_of_english>, <end_of_hindi_devanagari>
    const parts = text.split(/(<newline>|<end_of_english>|<end_of_hindi_devanagari>)/g);
    return parts.map((part, i) => {
      if (part === '<newline>') {
        return <br key={`br-${i}`} />;
      } else if (part === '<end_of_english>' || part === '<end_of_hindi_devanagari>') {
        // Instead of three <br /> elements, we use an empty <p> with vertical margin to add spacing.
        return <p key={`spacer-${i}`} className="my-6" />;
      }
      // Return normal text.
      return part;
    });
  };

  const processedContent = React.useMemo(() => {
    return answerChunks.map((chunk, index) => {
      if (chunk.type === 'newline') {
        return <br key={index} />;
      }

      // If the content contains LaTeX markers, clean the text and pass it to LatexRenderer.
      if (chunk.text.includes('$')) {
        // Replace custom tokens with newline characters.
        // Make sure your LatexRenderer is set up to support newlines.
        const cleanedText = chunk.text
          .replace(/<newline>/g, "\n")
          .replace(/<end_of_english>/g, "\n\n\n")
          .replace(/<end_of_hindi_devanagari>/g, "\n\n\n");
        return <LatexRenderer key={index} content={cleanedText} />;
      }

      // Otherwise, for plain text, process token replacements as React elements.
      return (
        <span key={index} className={chunk.type === 'hindi' ? 'font-hindi' : ''}>
          {processPlainText(chunk.text)}
        </span>
      );
    });
  }, [answerChunks]);

  return (
    <Card className="w-full mt-6 border border-blue-200 shadow-md">
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="h-8 w-8 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
            <p className="mt-4 text-blue-600">Generating answer...</p>
          </div>
        ) : answerChunks.length > 0 ? (
          // Adding whitespace-pre-line to ensure that newline characters in LatexRenderer output are respected.
          <div className="prose prose-blue max-w-none whitespace-pre-line">
            {processedContent}
          </div>
        ) : (
          <p className="text-center text-gray-500">Ask a question to see the answer</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AnswerDisplay;
