
// Simple API service for AI interactions
// Optimized for Termux compatibility

const API_URL = "http://localhost:5000/api";

export interface AIResponse {
  response: string;
  error?: string;
}

export interface AIRequest {
  prompt: string;
  sessionId?: string;
}

export const generateAIResponse = async (request: AIRequest): Promise<AIResponse> => {
  try {
    const response = await fetch(`${API_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        response: "", 
        error: errorData.error || "Failed to generate response" 
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating AI response:", error);
    return { 
      response: "", 
      error: "Network error or server unavailable" 
    };
  }
};

export const clearConversation = async (sessionId: string = "default"): Promise<void> => {
  try {
    await fetch(`${API_URL}/clear`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId }),
    });
  } catch (error) {
    console.error("Error clearing conversation:", error);
  }
};
