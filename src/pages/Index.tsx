
import React, { useState, useCallback } from 'react';
import { AnswerResponse, fetchAnswer } from '@/services/api';
import SearchForm from '@/components/SearchForm';
import AnswerDisplay from '@/components/AnswerDisplay';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [answerChunks, setAnswerChunks] = useState<AnswerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = useCallback(async (question: string, ratio: number) => {
    setIsLoading(true);
    setAnswerChunks([]);
    
    try {
      await fetchAnswer(question, ratio, (newChunk) => {
        setAnswerChunks((prev) => [...prev, newChunk]);
      });
    } catch (error) {
      console.error("Error fetching answer:", error);
      toast({
        title: "Error",
        description: "Failed to fetch answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-800 mb-2">
            LaTeX Answer Craft
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ask mathematical questions and get beautifully formatted answers with LaTeX equations
            in both English and Hindi
          </p>
        </header>
        
        <main className="space-y-6">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
          <AnswerDisplay answerChunks={answerChunks} isLoading={isLoading} />
        </main>
        
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Powered by LaTeX and server-side events</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
