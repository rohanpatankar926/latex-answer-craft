import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AnswerResponse } from '@/services/api';
import LatexRenderer from './LatexRenderer';

interface AnswerDisplayProps {
  answerChunks: AnswerResponse[];
  isLoading: boolean;
}

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      {language && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-gray-300 text-gray-800 text-xs rounded">
          {language}
        </div>
      )}
    </div>
  );
};

const extractLanguageAndCode = (rawCode: string) => {
  const trimmed = rawCode.trimStart();
  const lines = trimmed.split('\n');
  let language: string | undefined;
  // If the first line contains only letters, digits, dashes, or plus signs (1–20 chars),
  // treat it as the language.
  if (lines.length > 0 && /^[a-zA-Z0-9\-\+]{1,20}$/.test(lines[0].trim())) {
    language = lines[0].trim();
    lines.shift();
  }
  // Replace <newline> tokens with actual newlines in the remaining code.
  const code = lines.join('\n').replace(/<newline>/g, "\n");
  return { language, code };
};

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answerChunks, isLoading }) => {
  const processPlainText = (text: string) => {
    const parts = text.split(/(<newline>)/g);
    return parts.map((part, i) => {
      if (part === '<newline>') {
        return <br key={`br-${i}`} />;
      }
      return part;
    });
  };

  const renderWithCodeBlock = (text: string) => {
    const parts = text.split(/```/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const { language, code } = extractLanguageAndCode(part);
        return <CodeBlock key={index} language={language} code={code} />;
      }
      return <span key={index}>{processPlainText(part)}</span>;
    });
  };

  const renderContent = (text: string) => {
    // If the text has triple backticks, treat it as a fenced code block
    if (text.includes('```')) {
      return renderWithCodeBlock(text);
    }
    // If the text has LaTeX symbols, pass it to LatexRenderer
    if (text.includes('$')) {
      const cleanedText = text
        .replace(/<newline>/g, "\n")
        .replace(/<end_of_english>/g, "\n\n\n")
        .replace(/<end_of_hindi_devanagari>/g, "\n\n\n");
      return <LatexRenderer content={cleanedText} />;
    }
    // If the text looks like single-line code, handle it similarly
    const trimmedText = text.trim();
    const isCode = trimmedText.startsWith("def ") ||
                   trimmedText.startsWith("import ") ||
                   trimmedText.startsWith("print(") ||
                   trimmedText.startsWith("class ");
    if (isCode) {
      const { language, code } = extractLanguageAndCode(text);
      return <CodeBlock key="single-code" language={language} code={code} />;
    }
    // Otherwise, render as regular text
    return <span>{processPlainText(text)}</span>;
  };

  if (isLoading) {
    return (
      <Card className="w-full mt-6 border border-blue-200 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-10">
            <div className="h-8 w-8 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
            <p className="mt-4 text-blue-600">Generating answer...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!answerChunks || answerChunks.length === 0) {
    return (
      <Card className="w-full mt-6 border border-blue-200 shadow-md">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Ask a question to see the answer</p>
        </CardContent>
      </Card>
    );
  }

  // Combine all chunks
  const fullText = answerChunks.map(chunk => chunk.text).join('');
  // Split for English / Hindi
  const englishSplit = fullText.split('<end_of_english>');
  const englishPart = englishSplit[0] || '';
  const remainder = englishSplit[1] || '';
  const hindiSplit = remainder.split('<end_of_hindi_devanagari>');
  const hindiPart = hindiSplit[0] || '';

  return (
    <div className="space-y-4">
      {englishPart.trim().length > 0 && (
        <Card className="w-full border border-blue-200 shadow-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">English</h2>
            <div className="prose prose-blue max-w-none whitespace-pre-line">
              {renderContent(englishPart)}
            </div>
          </CardContent>
        </Card>
      )}
      {hindiPart.trim().length > 0 && (
        <Card className="w-full border border-blue-200 shadow-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">हिंदी</h2>
            <div className="prose prose-blue max-w-none whitespace-pre-line">
              {renderContent(hindiPart)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnswerDisplay;
