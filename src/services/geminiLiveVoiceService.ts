// Gemini Live Voice Service - Real-time voice interaction using Google Gemini Live API
// Based on: https://ai.google.dev/gemini-api/docs/live

// Speech Recognition types (for Web Speech API)
interface SpeechRecognitionEvent extends Event {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

export interface GeminiLiveConfig {
  apiKey: string;
  model?: string;
  systemInstruction?: string;
}

export interface GeminiLiveCallbacks {
  onStateChange?: (state: {
    isConnected?: boolean;
    isListening?: boolean;
    isThinking?: boolean;
    isSpeaking?: boolean;
    isProcessing?: boolean;
    aiResponse?: string;
  }) => void;
  onTextResponse?: (text: string) => void;
  onAudioResponse?: (audioData: string) => void;
  onError?: (error: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export class GeminiLiveVoiceService {
  private config: GeminiLiveConfig | null = null;
  private callbacks: GeminiLiveCallbacks = {};
  private isInitialized = false;
  private isConnected = false;
  private isListening = false;
  private isThinking = false;
  private isSpeaking = false;
  private isProcessing = false;
  
  // Web Speech API for voice input
  private recognition: SpeechRecognition | null = null;
  private speechSynthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  
  // Gemini Live API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private genAI: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private session: any = null;

  constructor() {
    this.initializeSpeechAPIs();
  }

  private initializeSpeechAPIs() {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition = new (window as any).SpeechRecognition();
    }

    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }

    // Initialize Speech Synthesis
    this.speechSynthesis = window.speechSynthesis;
  }

  async initialize(config: GeminiLiveConfig, callbacks: GeminiLiveCallbacks = {}): Promise<void> {
    this.config = config;
    this.callbacks = callbacks;

    try {
      // Dynamically import Google Generative AI
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      
      if (!config.apiKey) {
        throw new Error('Gemini API key is required');
      }

      this.genAI = new GoogleGenerativeAI(config.apiKey);
      this.isInitialized = true;
      
      console.log('✅ Gemini Live Voice Service initialized');
      this.callbacks.onStateChange?.({
        isConnected: false,
        isListening: false,
        isThinking: false,
        isSpeaking: false,
        isProcessing: false
      });
    } catch (error) {
      console.error('❌ Failed to initialize Gemini Live Voice Service:', error);
      this.callbacks.onError?.(error instanceof Error ? error.message : 'Failed to initialize service');
      throw error;
    }
  }

  async connect(): Promise<void> {
    if (!this.isInitialized || !this.config?.apiKey) {
      throw new Error('Service not initialized');
    }

    try {
      // Model configuration (currently using default)
      // const model = this.config?.model || 'gemini-2.5-flash-native-audio-preview-09-2025';
      
      // For now, we'll use the backend API instead of direct WebSocket connection
      // The Live API requires WebSocket connection which is complex to implement in browser
      // We'll use our backend endpoint for now
      this.isConnected = true;
      this.callbacks.onConnected?.();
      this.callbacks.onStateChange?.({
        isConnected: true,
        isListening: false,
        isThinking: false,
        isSpeaking: false,
        isProcessing: false
      });

      console.log('🎤 Connected to Gemini Live via backend');
    } catch (error) {
      console.error('❌ Failed to connect to Gemini Live:', error);
      this.callbacks.onError?.(error instanceof Error ? error.message : 'Failed to connect to Gemini Live');
      throw error;
    }
  }



  private speakText(text: string) {
    if (!this.speechSynthesis) return;

    this.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      console.log('🔊 Started speaking:', text.substring(0, 50) + '...');
      this.callbacks.onStateChange?.({
        isSpeaking: true
      });
    };

    utterance.onend = () => {
      console.log('🔊 Finished speaking');
      this.callbacks.onStateChange?.({
        isSpeaking: false
      });
    };

    utterance.onerror = (event) => {
      console.error('❌ Speech synthesis error:', event.error);
      this.callbacks.onStateChange?.({
        isSpeaking: false
      });
    };

    this.currentUtterance = utterance;
    this.speechSynthesis.speak(utterance);
  }

  async startRecording(): Promise<void> {
    if (!this.recognition || !this.isConnected) {
      throw new Error('Speech recognition not available or not connected');
    }

    try {
      this.isListening = true;
      this.callbacks.onStateChange?.({
        isListening: true,
        isThinking: false,
        isSpeaking: false,
        isProcessing: true
      });

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Speech recognized:', transcript);
        
        this.isListening = false;
        this.callbacks.onStateChange?.({
          isListening: false,
          isThinking: true,
          isProcessing: true
        });

        // Send audio to Gemini Live
        this.sendAudioToGemini(transcript);
      };

      this.recognition.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        this.isListening = false;
        this.callbacks.onStateChange?.({
          isListening: false,
          isProcessing: false
        });
        this.callbacks.onError?.(`Speech recognition error: ${event.error}`);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.callbacks.onStateChange?.({
          isListening: false
        });
      };

      this.recognition.start();
      console.log('🎤 Started recording...');
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      this.isListening = false;
      this.callbacks.onStateChange?.({
        isListening: false,
        isProcessing: false
      });
      this.callbacks.onError?.(error instanceof Error ? error.message : 'Failed to start recording');
    }
  }

  async stopRecording(): Promise<void> {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.callbacks.onStateChange?.({
        isListening: false
      });
      console.log('🛑 Stopped recording');
    }
  }

  private async sendAudioToGemini(text: string) {
    if (!this.isConnected) {
      console.error('❌ Not connected to Gemini Live');
      return;
    }

    try {
      // Use backend API for Gemini processing
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://saintsal-backend-0mv8.onrender.com/api';
      
      // Get auth token for backend request
      const { getAuthToken } = await import('@/lib/supabase');
      const authToken = await getAuthToken();
      
      const response = await fetch(`${backendUrl}/gemini-live/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          text: text,
          model: this.config?.model || 'gemini-2.5-flash',
          systemInstruction: this.config?.systemInstruction || 'You are a helpful AI voice assistant. Provide friendly, conversational, and concise responses.'
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content') {
                fullResponse += data.content;
                this.callbacks.onTextResponse?.(data.content);
                this.callbacks.onStateChange?.({ aiResponse: fullResponse });
              } else if (data.type === 'done') {
                // Speak the complete response
                if (fullResponse) {
                  this.speakText(fullResponse);
                }
                this.callbacks.onStateChange?.({
                  isThinking: false,
                  isSpeaking: true,
                  isProcessing: false
                });
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch {
              // Ignore parsing errors for non-JSON lines
            }
          }
        }
      }
      
      console.log('📤 Sent text to Gemini Live:', text);
    } catch (error) {
      console.error('❌ Error sending to Gemini Live:', error);
      this.callbacks.onError?.(error instanceof Error ? error.message : 'Failed to send to Gemini Live');
    }
  }

  async sendText(text: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to Gemini Live');
    }

    try {
      this.callbacks.onStateChange?.({
        isThinking: true,
        isProcessing: true
      });

      // Use the same backend API method
      await this.sendAudioToGemini(text);

      console.log('📤 Sent text to Gemini Live:', text);
    } catch (error) {
      console.error('❌ Error sending text to Gemini Live:', error);
      this.callbacks.onError?.(error instanceof Error ? error.message : 'Failed to send text');
    }
  }

  stopSpeaking(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
      this.callbacks.onStateChange?.({
        isSpeaking: false
      });
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.recognition && this.isListening) {
        this.recognition.stop();
      }

      this.isConnected = false;
      this.isListening = false;
      this.isThinking = false;
      this.isSpeaking = false;
      this.isProcessing = false;

      this.callbacks.onStateChange?.({
        isConnected: false,
        isListening: false,
        isThinking: false,
        isSpeaking: false,
        isProcessing: false
      });

      console.log('🔌 Disconnected from Gemini Live');
    } catch (error) {
      console.error('❌ Error disconnecting:', error);
    }
  }

  isServiceConnected(): boolean {
    return this.isConnected;
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isConnected: this.isConnected,
      isListening: this.isListening,
      isThinking: this.isThinking,
      isSpeaking: this.isSpeaking,
      isProcessing: this.isProcessing
    };
  }
}

// Export singleton instance
export const geminiLiveVoiceService = new GeminiLiveVoiceService();
