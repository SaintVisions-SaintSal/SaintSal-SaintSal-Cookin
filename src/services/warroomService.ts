// WarRoom Service for handling AI chat and streaming functionality
// Connects to the existing backend endpoints

import { getAuthToken, signInAnonymously } from '../lib/supabase';

const API_BASE_URL = process.env.BACKEND_URL || 'https://saintsal-backend-0mv8.onrender.com/api';

// AI Provider API Keys
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

// Debug logging (remove in production)
console.log('Environment check:', {
  backend: API_BASE_URL,
  openai: OPENAI_API_KEY ? '✅ Loaded' : '❌ Missing',
  gemini: GEMINI_API_KEY ? '✅ Loaded' : '❌ Missing',
  anthropic: ANTHROPIC_API_KEY ? '✅ Loaded' : '❌ Missing'
});

// Supabase Configuration (for future use)
// const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
// const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  model?: string;
  agentId?: string;
}

export interface ChatCompletionResponse {
  success: boolean;
  data?: {
    content: string;
    model: string;
    provider: string;
    tokens?: number;
    analytics?: {
    tokens_used?: number;
    response_time?: number;
    model_version?: string;
  };
  };
  error?: string;
}

export interface StreamingChatCallbacks {
  onChunk: (chunk: string) => void;
  onComplete: () => void;
  onError: (error: string) => void;
}

// AI Provider Types
export type AIProvider = 'openai' | 'gemini' | 'anthropic';

export interface AIStreamingCallbacks {
  onChunk: (chunk: string) => void;
  onComplete: () => void;
  onError: (error: string) => void;
  onWebSearchStart?: (searchQuery: string) => void;
  onWebSearchComplete?: () => void;
}

export interface DualAIStreamingCallbacks {
  onStart?: () => void;
  onStep?: (step: string, message: string) => void;
  onStepComplete?: (step: string, duration: number) => void;
  onChunk?: (content: string, isComplete: boolean, step?: string) => void;
  onComplete?: (finalResponse: string, chatgptResponse: string, claudeResponse: string) => void;
  onError?: (error: string) => void;
}

class WarRoomService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Get authenticated headers with Supabase token
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    let token = await getAuthToken();
    
    // If no token, try to sign in anonymously
    if (!token) {
      token = await signInAnonymously();
    }
    
    return {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Get a simple chat completion without streaming
   */
  async getChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/chat-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Chat completion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get streaming chat completion
   */
  async getStreamingChatCompletion(
    request: ChatCompletionRequest,
    callbacks: StreamingChatCallbacks
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/fast-chat-completion-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              callbacks.onComplete();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'chunk' && parsed.content) {
                callbacks.onChunk(parsed.content);
              } else if (parsed.type === 'error') {
                callbacks.onError(parsed.error);
                return;
              } else if (parsed.type === 'complete') {
                callbacks.onComplete();
                return;
              }
            } catch {
              console.warn('Failed to parse SSE data:', data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming chat completion error:', error);
      callbacks.onError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }

  /**
   * Get test streaming (for testing without authentication)
   */
  async getTestStreaming(
    messages: ChatMessage[],
    callbacks: StreamingChatCallbacks
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/test-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          temperature: 0.7,
          model: 'gpt-5'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              callbacks.onComplete();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'chunk' && parsed.content) {
                callbacks.onChunk(parsed.content);
              } else if (parsed.type === 'error') {
                callbacks.onError(parsed.error);
                return;
              } else if (parsed.type === 'complete') {
                callbacks.onComplete();
                return;
              }
            } catch {
              console.warn('Failed to parse SSE data:', data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Test streaming error:', error);
      callbacks.onError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }

  /**
   * Create a new chat session
   */
  async createChat(title: string): Promise<{ success: boolean; data?: { id: string; title: string; created_at: string }; error?: string }> {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required. Please sign in to create chats.',
        };
      }

      const response = await fetch(`${this.baseUrl}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create chat error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get user's chat history
   */
  async getUserChats(): Promise<{ success: boolean; data?: { id: string; title: string; created_at: string; updated_at: string; message_count?: number }[]; error?: string }> {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required. Please sign in to view your chats.',
        };
      }

      const response = await fetch(`${this.baseUrl}/chats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get user chats error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get a specific chat with messages and files
   */
  async getChat(chatId: string): Promise<{ success: boolean; data?: { id: string; title: string; messages: Array<{ id: string; role: string; content: string; created_at: string }>; files: Array<{ id: string; name?: string; original_filename?: string; text_content?: string; extracted_content?: string; file_type?: string; mime_type?: string; size?: number; created_at?: string }> }; error?: string }> {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required. Please sign in to view chats.',
        };
      }

      const response = await fetch(`${this.baseUrl}/chats/${chatId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get chat error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Save a chat with messages and files
   */
  async saveChat(title: string, messages: Array<{ role: string; content: string }>, files?: Array<{ name: string; mimeType?: string; textContent: string }>): Promise<{ success: boolean; data?: { id: string; title: string }; error?: string }> {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required. Please sign in to save chats.',
        };
      }

      const response = await fetch(`${this.baseUrl}/chats/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          messages,
          files: files || []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Save chat error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get agents list
   */
  async getAgents(): Promise<{ success: boolean; data?: { id: string; name: string; description: string; type: string; is_active: boolean }[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/agents`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get agents error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Upload file for processing using the extract-pdf endpoint
   * @deprecated Use fileUploadService.uploadFile() instead
   */
  async uploadFile(file: File): Promise<{ success: boolean; text?: string; pages?: number; method?: string; filename?: string; fileSize?: number; extractedAt?: string; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('pdf', file); // The endpoint expects 'pdf' field name

      const response = await fetch(`${this.baseUrl}/extract-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get authentication token from localStorage or session
   */
  private getAuthToken(): string {
    // This should be implemented based on your auth system
    // For now, return empty string for testing
    return localStorage.getItem('authToken') || '';
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Get professional tool suggestions based on business function
   */
  getProfessionalToolPrompts(toolType: string): string[] {
    const prompts = {
      'analyze': [
        'Analyze my business performance metrics',
        'Review my quarterly financial reports',
        'Evaluate my customer satisfaction scores',
        'Assess my operational efficiency',
        'Examine my market position and competition'
      ],
      'strategy': [
        'Develop a growth strategy for my business',
        'Create a marketing plan for Q1',
        'Plan expansion into new markets',
        'Design customer retention strategies',
        'Build a competitive advantage plan'
      ],
      'review': [
        'Review my current business processes',
        'Analyze my workflow efficiency',
        'Evaluate my team performance',
        'Assess my technology stack',
        'Examine my customer service processes'
      ]
    };

    return prompts[toolType as keyof typeof prompts] || [];
  }

  /**
   * Generate agent-specific system prompts
   */
  getAgentSystemPrompt(agentType: string): string {
    const baseGuidelines = `
WEB SEARCH GUIDELINES:
- You have access to web search capabilities to find real-time, up-to-date information
- Use web search when the user asks about:
  * Current events, news, or recent developments
  * Real-time data (weather, stock prices, sports scores, etc.)
  * Information that may have changed since your training data
  * Specific facts, statistics, or data that you're uncertain about
  * Recent product releases, updates, or announcements
  * Latest programming frameworks, libraries, or tools (for code agent)
  * Current best practices or recent changes in technology
- When you need to search, inform the user that you're searching the web for the most current information
- Always cite sources from web search results in your response
- If the question requires current/recent information, proactively use web search without being asked

CRITICAL IDENTITY RULES:
- When asked about your identity (e.g., "Are you saintsal", "Who are you"), respond: "Yes, I am SaintVision SaintSal™" (with the ™ trademark symbol)
- When mentioning what powers you, say "powered by SaintVision technology" (not "powered by SaintSal™'s technology")
- You are ONLY SaintVision SaintSal™ - never identify yourself as Claude, Claude Haiku, ChatGPT, GPT, GPT-4, GPT-4o, GPT-5, Gemini, OpenAI, Anthropic, Google, or any other AI model or service
- NEVER mention that you are powered by Claude, ChatGPT, Gemini, OpenAI, Anthropic, Google, or any other AI service
- NEVER say "I am Claude", "I am ChatGPT", "I am Gemini", "I am GPT", or any variation identifying yourself as another AI model
- NEVER disclose your underlying AI model, technology provider, or service
- Always refer to yourself exclusively as SaintVision SaintSal™ when asked about your identity
- If asked "Are you Claude?" or "Are you ChatGPT?" or similar, respond: "No, I am SaintVision SaintSal™, powered by SaintVision technology"

RESPONSE GUIDELINES:
1. Keep responses short and apt, especially for greetings like "Hello"
2. Only include code snippets or coding references when explicitly requested in the prompt
3. If context files are provided, always reference them first and relate your response to the context before thinking outside the box
4. Stay focused on your agent's specialization and expertise
5. Be concise and professional in all interactions

CONTEXT AWARENESS:
- When context files are available, analyze them first and base your response on their content
- Reference specific details from the context files when relevant
- Only expand beyond the context when the user asks for broader insights
`;

    const prompts = {
      'enterprise': `You are an Enterprise Agent specializing in strategic business intelligence and executive decision support. Provide comprehensive analysis, data-driven insights, and strategic recommendations for enterprise operations. Focus on scalability, efficiency, and long-term growth.${baseGuidelines}`,
      'founder': `You are a Founder Agent with a warm, confident New York style. Provide personal strategic advice, mentorship, and business guidance for founders and entrepreneurs. Be supportive yet direct, with a focus on practical solutions and growth mindset.${baseGuidelines}`,
      'customer': `You are a Customer Agent specializing in professional customer service and support. Handle client interactions with empathy, efficiency, and excellence. Focus on problem resolution, customer satisfaction, and building lasting relationships.${baseGuidelines}`,
      'white-label': `You are a White Label Agent for customizable enterprise solutions. Help partners integrate client branding and scale their deployment. Focus on customization, integration, and partner success.${baseGuidelines}`,
      'ai-development': `You are an AI Development Agent specializing in building intelligent automation systems. Help design, develop, and implement AI solutions tailored to specific business processes. Focus on technical excellence, innovation, and practical implementation.${baseGuidelines}`,
      'code': `You are a Code Agent specializing in programming, software development, and technical problem-solving. Your primary focus is on:

TECHNICAL EXPERTISE:
- Programming languages (JavaScript, TypeScript, Python, Java, C++, Go, Rust, etc.)
- Web development frameworks (React, Next.js, Vue, Angular, etc.)
- Backend technologies (Node.js, Express, Django, Flask, etc.)
- Database systems (SQL, NoSQL, PostgreSQL, MongoDB, etc.)
- Software architecture and design patterns
- Code debugging, optimization, and refactoring
- API design and integration
- DevOps, CI/CD, and deployment
- Testing strategies and best practices
- Version control (Git, GitHub, etc.)

RESPONSE STYLE:
- Provide clear, well-commented code examples
- Explain technical concepts in a structured manner
- Include best practices and common pitfalls
- Offer multiple solutions when applicable
- Focus on practical, production-ready code
- Always format code properly with syntax highlighting
- Explain the "why" behind technical decisions

${baseGuidelines}`
    };

    return prompts[agentType as keyof typeof prompts] || `You are SAINTSAL™ AI Assistant, ready to help with any business challenge.${baseGuidelines}`;
  }

  /**
   * Get streaming AI response from OpenAI via backend
   */
  async getOpenAIStreaming(messages: ChatMessage[], callbacks: AIStreamingCallbacks, agentId?: string): Promise<void> {
    try {
      // Use proper chat completion streaming endpoint with authentication
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/ai/chat-completion-stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: messages,
          temperature: 0.7,
          model: 'gpt-5',
          agent_id: agentId  // ← NEW: Send agent_id to backend
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.type === 'chunk' && parsed.content) {
                // Backend now sends only new content, so send it directly
                const filteredContent = this.filterResponseContent(parsed.content);
                callbacks.onChunk(filteredContent);
              } else if (parsed.type === 'complete') {
                callbacks.onComplete();
                return;
              } else if (parsed.type === 'error') {
                callbacks.onError(parsed.error);
                return;
              }
            } catch {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'OpenAI streaming failed';
      callbacks.onError(errorMessage);
    }
  }

  /**
   * Get streaming AI response from Anthropic Claude via backend
   */
  async getAnthropicStreaming(messages: ChatMessage[], callbacks: AIStreamingCallbacks, agentId?: string): Promise<void> {
    try {
      // Use proper chat completion streaming endpoint with authentication
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/ai/chat-completion-stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: messages,
          temperature: 0.7,
          model: 'claude-haiku-4-5-20251001',
          agent_id: agentId  // ← NEW: Send agent_id to backend
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.type === 'chunk' && parsed.content) {
                // Backend now sends only new content, so send it directly
                const filteredContent = this.filterResponseContent(parsed.content);
                callbacks.onChunk(filteredContent);
              } else if (parsed.type === 'web_search_start' && callbacks.onWebSearchStart) {
                callbacks.onWebSearchStart(parsed.searchQuery || '');
              } else if (parsed.type === 'web_search_complete' && callbacks.onWebSearchComplete) {
                callbacks.onWebSearchComplete();
              } else if (parsed.type === 'complete') {
                callbacks.onComplete();
                return;
              } else if (parsed.type === 'error') {
                callbacks.onError(parsed.error);
                return;
              }
            } catch {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (error: unknown) {
      console.error('Anthropic streaming error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Anthropic streaming failed';
      callbacks.onError(errorMessage);
    }
  }

  /**
   * Get AI response from Google Gemini via backend
   */
  async getGeminiResponse(messages: ChatMessage[]): Promise<string> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/ai/gemini-completion`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: messages,
          temperature: 0.7,
          model: 'gemini-2.5-flash'
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.data?.content || 'No response generated';
      return this.filterResponseContent(content);
    } catch (error: unknown) {
      console.error('Gemini error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gemini request failed';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get streaming AI response based on provider
   */
  async getAIStreaming(provider: AIProvider, messages: ChatMessage[], callbacks: AIStreamingCallbacks, agentId?: string): Promise<void> {
    switch (provider) {
      case 'openai':
        return this.getOpenAIStreaming(messages, callbacks, agentId);
      case 'anthropic':
        return this.getAnthropicStreaming(messages, callbacks, agentId);
      case 'gemini':
        // Gemini doesn't support streaming, so we'll simulate it
        try {
          const response = await this.getGeminiResponse(messages);
          // Simulate streaming by sending chunks
          const words = response.split(' ');
          for (let i = 0; i < words.length; i++) {
            setTimeout(() => {
              const filteredWord = this.filterResponseContent(words[i] + ' ');
              callbacks.onChunk(filteredWord);
              if (i === words.length - 1) {
                callbacks.onComplete();
              }
            }, i * 50); // 50ms delay between words
          }
        } catch (error: unknown) {
          console.error('Gemini API error, falling back to ChatGPT:', error);
          // Fallback to ChatGPT if Gemini fails
          const fallbackCallbacks: AIStreamingCallbacks = {
            onChunk: callbacks.onChunk,
            onComplete: callbacks.onComplete,
            onError: callbacks.onError
          };
          this.getOpenAIStreaming(messages, fallbackCallbacks, agentId);
        }
        break;
      default:
        callbacks.onError(`Unsupported AI provider: ${provider}`);
    }
  }

  /**
   * Filter response content to replace model names with SaintSal™ branding
   */
  private filterResponseContent(content: string): string {
    // Replace common model name references with SaintSal™
    return content
      .replace(/\bClaude Haiku\b/gi, 'SaintSal™')
      .replace(/\bChatGPT\b/gi, 'SaintSal™')
      .replace(/\bGPT-4\b/gi, 'SaintSal™')
      .replace(/\bGPT-4o\b/gi, 'SaintSal™')
      .replace(/\bGPT-5\b/gi, 'SaintSal™')
      .replace(/\bOpenAI\b/gi, 'SaintSal™')
      .replace(/\bAnthropic\b/gi, 'SaintSal™')
      .replace(/\bGemini\b/gi, 'SaintSal™')
      .replace(/\bGoogle\b/gi, 'SaintSal™')
      .replace(/\bI am Claude\b/gi, 'I am SaintSal™')
      .replace(/\bI am ChatGPT\b/gi, 'I am SaintSal™')
      .replace(/\bI am GPT\b/gi, 'I am SaintSal™')
      .replace(/\bI am Gemini\b/gi, 'I am SaintSal™')
      .replace(/\bI am an AI\b/gi, 'I am SaintSal™')
      .replace(/\bI'm Claude\b/gi, 'I am SaintSal™')
      .replace(/\bI'm ChatGPT\b/gi, 'I am SaintSal™')
      .replace(/\bI'm GPT\b/gi, 'I am SaintSal™')
      .replace(/\bI'm Gemini\b/gi, 'I am SaintSal™')
      .replace(/\bI'm an AI\b/gi, 'I am SaintSal™')
      .replace(/\bClaude\b/gi, 'SaintSal™')
      .replace(/\bAI model\b/gi, 'SaintSal™')
      .replace(/\ban AI assistant\b/gi, 'SaintSal™')
      .replace(/\bAI assistant\b/gi, 'SaintSal™');
  }

  /**
   * Get dual AI streaming completion (ChatGPT + Claude) via backend
   * Optimized for smooth streaming like the native app
   */
  async getDualAIStreaming(
    messages: ChatMessage[], 
    callbacks: DualAIStreamingCallbacks,
    contextFiles: string = '',
    temperature: number = 0.7,
    agentId?: string
  ): Promise<void> {
    try {
      callbacks.onStart?.();

      // Extract user query from messages
      const userQuery = messages[messages.length - 1]?.content || '';
      const systemPrompt = messages.find(msg => msg.role === 'system')?.content || '';
      
      // Extract conversation history (all messages except the last one and system message)
      const conversationHistory = messages
        .slice(0, -1)  // Remove last message (current query)
        .filter(msg => msg.role !== 'system');  // Remove system messages

      // Use proper dual AI orchestration endpoint with authentication
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/ai/dual-orchestration-stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userQuery: userQuery,
          messages: conversationHistory,  // ← NEW: Send conversation history
          contextFiles: contextFiles,
          agentContext: systemPrompt,
          isCodingRequest: false,
          temperature: temperature,
          agent_id: agentId
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let chatgptResponse = '';
      let claudeResponse = '';
      let currentStep = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              callbacks.onComplete?.(chatgptResponse || claudeResponse, chatgptResponse, claudeResponse);
              return;
            }
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'step') {
                currentStep = parsed.step;
                callbacks.onStep?.(parsed.step, parsed.message);
              } else if (parsed.type === 'step_complete') {
                callbacks.onStepComplete?.(parsed.step, parsed.duration);
              } else if (parsed.type === 'chunk') {
                // Handle incremental chunks - backend now sends only new content
                if (parsed.content) {
                  const step = currentStep || parsed.step || 'chatgpt';
                  
                  if (step === 'claude') {
                    // Accumulate the new content
                    claudeResponse += parsed.content;
                    const filteredContent = this.filterResponseContent(claudeResponse);
                    callbacks.onChunk?.(filteredContent, parsed.isComplete || false, step);
                  } else {
                    // Accumulate the new content
                    chatgptResponse += parsed.content;
                    const filteredContent = this.filterResponseContent(chatgptResponse);
                    callbacks.onChunk?.(filteredContent, parsed.isComplete || false, step);
                  }
                }
              } else if (parsed.type === 'complete') {
                const filteredFinalResponse = this.filterResponseContent(parsed.finalResponse || '');
                const filteredChatgptResponse = this.filterResponseContent(parsed.chatgptResponse || '');
                const filteredClaudeResponse = this.filterResponseContent(parsed.claudeResponse || '');
                callbacks.onComplete?.(filteredFinalResponse, filteredChatgptResponse, filteredClaudeResponse);
                return;
              } else if (parsed.type === 'error') {
                callbacks.onError?.(parsed.error);
                return;
              }
            } catch {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (error: unknown) {
      console.error('Dual AI streaming error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Dual AI streaming failed';
      callbacks.onError?.(errorMessage);
    }
  }

  /**
   * Check if dual AI is available (always true when using backend)
   */
  isDualAIAvailable(): boolean {
    return true; // Backend handles API key validation
  }

  /**
   * Scrape content from a URL
   */
  async scrapeUrl(url: string): Promise<{ success: boolean; data?: { url: string; title: string; content: string; description: string; scrapedAt: string }; error?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/ai/scrape-url`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('URL scraping error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape URL'
      };
    }
  }

  /**
   * Perform web search using GPT-4o-mini-search-preview
   */
  async performWebSearch(query: string): Promise<{ 
    success: boolean; 
    data?: { 
      summary: string; 
      results: Array<{ title: string; url: string; snippet: string; displayUrl?: string }>; 
      rawResponse: string 
    }; 
    error?: string 
  }> {
    try {
      let token = await getAuthToken();
      
      // If no token, try to sign in anonymously
      if (!token) {
        token = await signInAnonymously();
      }
      
      const url = `${this.baseUrl}/ai/web-search`;
      
      console.log('🔍 Web search request:', { url, query, baseUrl: this.baseUrl });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ query }),
      });
      
      console.log('🔍 Web search response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Web search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Web search failed'
      };
    }
  }
}

// Export singleton instance
export const warroomService = new WarRoomService();
export default warroomService;
