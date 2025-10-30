/**
 * API client for MedLama backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  learning_level?: 'beginner' | 'high_school' | 'medical_student' | 'doctor';
}

export interface ChatResponse {
  response: string;
  topic: string;
  analysis_complete: boolean;
  conversation_id: string;
  metadata: {
    model: string;
    learning_level: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  topic: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetail extends Conversation {
  messages: ChatMessage[];
}

export interface Analytics {
  user: {
    email: string;
    name: string;
    learning_level: string;
    stats: {
      total_lessons: number;
      total_quizzes: number;
      average_score: number;
      streak: number;
      total_messages: number;
    };
  };
  conversations: {
    total: number;
  };
  quizzes: {
    total_quizzes: number;
    average_score: number;
    topics_covered: number;
  };
  progress: {
    topics: Record<string, any>;
    achievements: string[];
    current_streak: number;
    longest_streak: number;
  };
}

export interface QuizRequest {
  topic: string;
  num_questions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizResponse {
  quiz: string;
  topic: string;
  num_questions: number;
  difficulty: string;
}

export interface VisualRequest {
  topic: string;
}

export interface VisualResponse {
  visual_description: string;
  topic: string;
}

export interface APIError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
  };
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle API errors
        const error = data as APIError;
        throw new Error(error.error?.message || 'An error occurred');
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  /**
   * Send a chat message and get AI response
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>('/api/v1/chat/message', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Generate a visual description
   */
  async generateVisual(request: VisualRequest): Promise<VisualResponse> {
    return this.request<VisualResponse>('/api/v1/chat/visual', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get all conversations
   */
  async getConversations(limit: number = 50, skip: number = 0): Promise<{ conversations: Conversation[]; total: number }> {
    return this.request(`/api/v1/chat/conversations?limit=${limit}&skip=${skip}`, {
      method: 'GET',
    });
  }

  /**
   * Get a specific conversation
   */
  async getConversation(conversationId: string): Promise<ConversationDetail> {
    return this.request(`/api/v1/chat/conversations/${conversationId}`, {
      method: 'GET',
    });
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<{ message: string }> {
    return this.request(`/api/v1/chat/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get user analytics
   */
  async getAnalytics(): Promise<Analytics> {
    return this.request('/api/v1/chat/analytics', {
      method: 'GET',
    });
  }

  /**
   * Generate a quiz (enhanced version)
   */
  async generateQuiz(request: QuizRequest): Promise<any> {
    return this.request('/api/v1/quiz/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Submit quiz answers
   */
  async submitQuiz(data: {
    quiz_id: string;
    topic: string;
    questions: any[];
    answers: Record<string, string>;
    time_spent: number;
    difficulty: string;
  }): Promise<any> {
    return this.request('/api/v1/quiz/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get quiz history
   */
  async getQuizHistory(topic?: string, limit?: number): Promise<any> {
    const params = new URLSearchParams();
    if (topic) params.append('topic', topic);
    if (limit) params.append('limit', limit.toString());
    
    return this.request(`/api/v1/quiz/history?${params.toString()}`, {
      method: 'GET',
    });
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<{ 
    status: string; 
    service: string; 
    ai_service: string;
    database: string;
  }> {
    return this.request('/api/v1/chat/health', {
      method: 'GET',
    });
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use sendMessage instead
   */
  async legacyPrompt(message: string): Promise<{ messages: string }> {
    const response = await fetch(
      `${this.baseURL}/api/llm/response/?message=${encodeURIComponent(message)}`
    );
    return response.json();
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export class for testing
export { APIClient };
