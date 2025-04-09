
export interface AnswerResponse {
  text: string;
  type: 'english' | 'hindi' | 'latex' | 'newline';
}

export const fetchAnswer = async (
  question: string, 
  ratio: number,
  onDataChunk: (data: AnswerResponse) => void
): Promise<void> => {
  try {
    const encodedQuestion = encodeURIComponent(question);
    const url = `http://49.50.68.129:8089/get_jawab?question=${encodedQuestion}&ratio=${ratio}`;
    
    const response = await fetch(url);
    
    if (!response.body) {
      throw new Error("Response body is null");
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let buffer = "";
    
    while (true) {
      const { value, done } = await reader.read();
      
      if (done) {
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const content = line.substring(6);
          
          if (content === "CLOSE_CONNECTION") {
            return;
          }
          
          if (content === "<newline>") {
            onDataChunk({ text: "\n", type: "newline" });
          } else if (content === "<end_of_english>") {
            // Add three newlines after English section ends
            onDataChunk({ text: "\n\n\n", type: "newline" });
          } else if (content === "<end_of_hindi_devanagari>") {
            // Add a newline after Hindi section ends
            onDataChunk({ text: "\n", type: "newline" });
          } else {
            // Process as normal text with potential LaTeX
            onDataChunk({
              text: content,
              type: content.includes("$") ? "latex" : 
                    content.match(/[\u0900-\u097F]/) ? "hindi" : "english"
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching answer:", error);
    throw error;
  }
};
