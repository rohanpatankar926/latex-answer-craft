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
  // If first line is a language identifier (e.g., "python")
  if (lines.length > 0 && /^[a-zA-Z0-9\-\+]{1,20}$/.test(lines[0].trim())) {
    language = lines[0].trim();
    lines.shift();
  }
  // Replace <newline> tokens with actual newline characters
  const code = lines.join('\n').replace(/<newline>/g, "\n");
  return { language, code };
};

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answerChunks, isLoading }) => {
  const processPlainText = (text: string) => {
    return text.split(/(<newline>)/g).map((part, i) =>
      part === '<newline>' ? <br key={i} /> : part
    );
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
    if (text.includes('```')) {
      return renderWithCodeBlock(text);
    } else if (text.includes('$')) {
      const cleanedText = text.replace(/<newline>/g, "\n");
      return <LatexRenderer content={cleanedText} />;
    } else {
      const trimmedText = text.trim();
      const isCode = trimmedText.startsWith("def ") ||
                     trimmedText.startsWith("import ") ||
                     trimmedText.startsWith("print(") ||
                     trimmedText.startsWith("class ");
      if (isCode) {
        const { language, code } = extractLanguageAndCode(trimmedText);
        return <CodeBlock key="single-code" language={language} code={code} />;
      }
      return <span>{processPlainText(text)}</span>;
    }
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

  // 1. Combine text from all chunks
  let rawFullText = answerChunks.map(chunk => chunk.text).join('');
  console.log("Raw Full Text:", rawFullText);

  // 2. Remove unwanted tokens
  const cleanFullText = rawFullText
    .replace(/^\s*data:\s*/gm, '')
    .replace(/CLOSE_CONNECTION/gi, '')
    .trim();
  console.log("Clean Full Text:", cleanFullText);

  // 3. Split on <end_of_english>
  const [englishPartRaw, afterEnglishRaw] = cleanFullText.split("<end_of_english>");
  const englishPart = englishPartRaw ? englishPartRaw.trim() : "";
  console.log("English Part:", englishPart);

  let hindiDevanagariPart = "";
  let hindiRomanPart = "";
  if (afterEnglishRaw) {
    console.log("Text after <end_of_english>:", afterEnglishRaw);
    if (afterEnglishRaw.indexOf('<end_of_hindi_devanagari>') !== -1) {
      const [devanRaw, afterDevanRaw] = afterEnglishRaw.split("<end_of_hindi_devanagari>");
      hindiDevanagariPart = devanRaw ? devanRaw.trim() : "";
      console.log("Hindi (Devanagari) Part:", hindiDevanagariPart);

      if (afterDevanRaw && afterDevanRaw.indexOf('<end_of_hindi_roman>') !== -1) {
        const [romanRaw] = afterDevanRaw.split("<end_of_hindi_roman>");
        hindiRomanPart = romanRaw ? romanRaw.trim() : "";
      }
    } else if (afterEnglishRaw.indexOf('<end_of_hindi_roman>') !== -1) {
      const [devanRaw, romanRaw] = afterEnglishRaw.split("<end_of_hindi_roman>");
      hindiDevanagariPart = devanRaw ? devanRaw.trim() : "";
      hindiRomanPart = romanRaw ? romanRaw.trim() : "";
    } else {
      hindiDevanagariPart = afterEnglishRaw.trim();
    }
  }
  console.log("Hindi (Roman Hindi) Part:", hindiRomanPart);

  return (
    <div className="space-y-4">
      {/* English Section */}
      {englishPart && (
        <Card className="w-full border border-blue-200 shadow-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">English</h2>
            <div className="prose prose-blue max-w-none whitespace-pre-line">
              {renderContent(englishPart)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hindi (Devanagari) Section */}
      {hindiDevanagariPart && (
        <Card className="w-full border border-blue-200 shadow-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">हिंदी (देवनागरी)</h2>
            <div className="prose prose-blue max-w-none whitespace-pre-line">
              {renderContent(hindiDevanagariPart)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hindi (Roman Hindi) Section */}
      {hindiRomanPart ? (
        <Card className="w-full border border-blue-200 shadow-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">हिंदी (Roman Hindi)</h2>
            <div className="prose prose-blue max-w-none whitespace-pre-line">
              {renderContent(hindiRomanPart)}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full border border-blue-200 shadow-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">हिंदी (Roman Hindi)</h2>
            <div className="prose prose-blue max-w-none whitespace-pre-line">
              <span>No Hindi (Roman Hindi) content provided.</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnswerDisplay;
