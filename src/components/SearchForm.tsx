
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface SearchFormProps {
  onSearch: (question: string, ratio: number) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [question, setQuestion] = useState('');
  const [ratio, setRatio] = useState([0.8]); // Default ratio
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }
    
    onSearch(question, ratio[0]);
  };

  return (
    <Card className="w-full border border-blue-200 shadow-md">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="question" className="text-sm font-medium text-gray-700">
              Enter your question
            </label>
            <Input
              id="question"
              placeholder="e.g., What is a factorial equation?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="ratio" className="text-sm font-medium text-gray-700">
                Language Ratio
              </label>
              <span className="text-sm text-blue-600 font-mono">
                {ratio[0].toFixed(2)}
              </span>
            </div>
            <Slider
              id="ratio"
              value={ratio}
              onValueChange={setRatio}
              min={0}
              max={1}
              step={0.01}
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>More Hindi</span>
              <span>More English</span>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                Generating...
              </>
            ) : (
              "Get Answer"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchForm;
