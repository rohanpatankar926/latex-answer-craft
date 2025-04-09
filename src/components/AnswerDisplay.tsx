import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AnswerResponse } from '@/services/api';
import LatexRenderer from './LatexRenderer';

interface AnswerDisplayProps {
  answerChunks: AnswerResponse[];
  isLoading: boolean;
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answerChunks, isLoading }) => {
  // Process the chunks to handle newlines and LaTeX correctly
  const processedContent = React.useMemo(() => {
    return answerChunks.map((chunk, index) => {
      if (chunk.type === 'newline') {
        return <br key={index} />;
      }
      
      // Check if content contains LaTeX (enclosed in $ symbols)
      if (chunk.text.includes('$')) {
        return <LatexRenderer key={index} content={chunk.text} />;
      }
      
      // Otherwise, return plain text
      return <span key={index} className={chunk.type === 'hindi' ? 'font-hindi' : ''}>{chunk.text}</span>;
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
          <div className="prose prose-blue max-w-none">
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
