// Gemini Live WebSocket Service - Real-time continuous voice conversation
// Uses native audio models for natural speech interaction with Gemini-TTS integration

import { geminiTTSService, TTSRequest } from './geminiTTSService';

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
  backendUrl?: string;
  voiceName?: string; // Gemini-TTS voice name
  useGeminiTTS?: boolean; // Flag to use Gemini-TTS API
  disableVoiceResponses?: boolean; // Flag to disable all voice responses
  stylePrompt?: string; // Natural language style prompt
  googleCloudApiKey?: string; // Google Cloud API key for TTS
  googleCloudProjectId?: string; // Google Cloud project ID
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
  onUserSpeech?: (text: string) => void;
  onAudioResponse?: (audioData: string) => void;
  onError?: (error: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export class GeminiLiveWebSocketService {
  private config: GeminiLiveConfig | null = null;
  private callbacks: GeminiLiveCallbacks = {};
  private isInitialized = false;
  private isConnected = false;
  private isListening = false;
  private isThinking = false;
  private isSpeaking = false;
  private isProcessing = false;
  private isManualDisconnect = false;
  
  // WebSocket connection
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  
  // Conversation context
  private conversationHistory: Array<{role: 'user' | 'assistant', content: string, timestamp: number}> = [];
  private maxHistoryLength = 20; // Keep last 20 exchanges
  
  // Web Speech API for voice input
  private recognition: SpeechRecognition | null = null;
  private speechSynthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.initializeSpeechAPIs();
  }

  private initializeSpeechAPIs() {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.warn('⚠️ Speech APIs not available in server environment');
      return;
    }

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition = new (window as any).SpeechRecognition();
    }

    if (this.recognition) {
      this.recognition.continuous = true; // Enable continuous listening
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }

    // Initialize Speech Synthesis
    this.speechSynthesis = window.speechSynthesis;
  }

  async initialize(config: GeminiLiveConfig, callbacks: GeminiLiveCallbacks = {}): Promise<void> {
    this.config = config;
    this.callbacks = callbacks;

    try {
      // API key not required since we use backend WebSocket connection
      // The backend handles the actual Gemini API calls securely
      this.isInitialized = true;
      
      console.log('✅ Gemini Live WebSocket Service initialized');
      this.callbacks.onStateChange?.({
        isConnected: false,
        isListening: false,
        isThinking: false,
        isSpeaking: false,
        isProcessing: false
      });
    } catch (error) {
      console.error('❌ Failed to initialize Gemini Live WebSocket Service:', error);
      this.callbacks.onError?.(error instanceof Error ? error.message : 'Failed to initialize service');
      throw error;
    }
  }

  async connect(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    try {
      const backendUrl = this.config?.backendUrl || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://saintsal-backend-0mv8.onrender.com';
      const model = this.config?.model || 'gemini-2.5-flash';
      const systemInstruction = this.config?.systemInstruction || 'You are a helpful AI voice assistant. Provide friendly, conversational, and concise responses.';
      
      // Try WebSocket connection first, fallback to HTTP if it fails
      const wsUrl = `${backendUrl.replace('http', 'ws')}/ws?token=gemini-live`;
      
      console.log('🔗 Attempting WebSocket connection:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('🔗 WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Send Gemini Live initialization message
        this.ws!.send(JSON.stringify({
          type: 'gemini_live',
          model: model,
          systemInstruction: systemInstruction
        }));
        
        this.callbacks.onConnected?.();
        this.callbacks.onStateChange?.({
          isConnected: true,
          isListening: false,
          isThinking: false,
          isSpeaking: false,
          isProcessing: false
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ Gemini Live WebSocket error:', error);
        console.log('🔄 WebSocket failed, falling back to HTTP mode');
        this.fallbackToHttpMode();
      };

      this.ws.onclose = (event) => {
        console.log('🔌 Gemini Live WebSocket closed:', event.reason);
        this.isConnected = false;
        this.callbacks.onDisconnected?.();
        this.callbacks.onStateChange?.({
          isConnected: false,
          isListening: false,
          isThinking: false,
          isSpeaking: false,
          isProcessing: false
        });
        
        // If WebSocket fails to connect, fallback to HTTP mode
        if (event.code === 1006 && this.reconnectAttempts === 0) {
          console.log('🔄 WebSocket connection failed, falling back to HTTP mode');
          this.fallbackToHttpMode();
          return;
        }
        
        // Attempt to reconnect
        this.attemptReconnect();
      };

    } catch (error) {
      console.error('❌ Failed to connect to Gemini Live WebSocket:', error);
      this.callbacks.onError?.(error instanceof Error ? error.message : 'Failed to connect to Gemini Live');
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleWebSocketMessage(message: any) {
    console.log('📨 Received WebSocket message:', message);

    switch (message.type) {
      case 'connected':
        console.log('✅ Gemini Live session established');
        break;
        
      case 'gemini_message':
        this.handleGeminiMessage(message.data);
        break;
        
      case 'error':
        console.error('❌ Gemini Live error:', message.error);
        
        // Handle specific Gemini API errors with retry logic
        if (message.error.includes('503 Service Unavailable') || message.error.includes('overloaded')) {
          console.log('🔄 Gemini API is overloaded, will retry in 5 seconds...');
          this.callbacks.onError?.('Gemini API is temporarily overloaded. Retrying in 5 seconds...');
          
          // Auto-retry after 5 seconds
          setTimeout(() => {
            if (this.isConnected && !this.isManualDisconnect) {
              console.log('🔄 Retrying connection after API overload...');
              this.attemptReconnect();
            }
          }, 5000);
        } else if (message.error.includes('429') || message.error.includes('quota')) {
          console.log('⚠️ Rate limit exceeded, will retry in 10 seconds...');
          this.callbacks.onError?.('Rate limit exceeded. Retrying in 10 seconds...');
          
          // Auto-retry after 10 seconds for rate limits
          setTimeout(() => {
            if (this.isConnected && !this.isManualDisconnect) {
              console.log('🔄 Retrying connection after rate limit...');
              this.attemptReconnect();
            }
          }, 10000);
        } else {
          this.callbacks.onError?.(message.error);
        }
        break;
        
      case 'disconnected':
        console.log('🔌 Gemini Live session disconnected');
        this.isConnected = false;
        this.callbacks.onDisconnected?.();
        break;
        
      default:
        console.warn('⚠️ Unknown message type:', message.type);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleGeminiMessage(message: any) {
    console.log('📨 Received Gemini message:', message);

    if (message.data) {
      // Audio response from native audio model
      this.callbacks.onAudioResponse?.(message.data);
      if (!this.config?.disableVoiceResponses) {
        this.speakAudioData(message.data);
      } else {
        console.log('🔇 Voice responses disabled, skipping audio playback');
      }
    } else if (message.serverContent?.modelTurn?.parts) {
      // Text response (fallback)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const textParts = message.serverContent.modelTurn.parts.filter((part: any) => part.text).map((part: any) => part.text).join('');

      if (textParts) {
        // Add AI response to conversation history
        this.conversationHistory.push({
          role: 'assistant',
          content: textParts,
          timestamp: Date.now()
        });

        // Trim history if it gets too long
        if (this.conversationHistory.length > this.maxHistoryLength) {
          this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
        }

        console.log('📚 Updated conversation history, length:', this.conversationHistory.length);

        this.callbacks.onTextResponse?.(textParts);
        this.callbacks.onStateChange?.({
          isThinking: false,
          isSpeaking: true,
          aiResponse: textParts
        });
        
        // Convert text to speech only if voice responses are enabled
        if (!this.config?.disableVoiceResponses) {
          this.speakText(textParts);
        } else {
          console.log('🔇 Voice responses disabled, skipping TTS');
        }
      }
    }

    if (message.serverContent?.turnComplete) {
      this.callbacks.onStateChange?.({
        isThinking: false,
        isSpeaking: false,
        isProcessing: false
      });
    }
  }

  private speakAudioData(audioData: string) {
    try {
      // Convert base64 audio data to audio
      const audioBytes = atob(audioData);
      const audioArray = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }

      const audioBlob = new Blob([audioArray], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.callbacks.onStateChange?.({
          isSpeaking: false
        });
      };
      
      audio.play();
    } catch (error) {
      console.error('❌ Error playing audio:', error);
      // Fallback to text-to-speech
      this.speakText('Audio playback failed, using text-to-speech instead.');
    }
  }

  private preprocessTextForSpeech(text: string): string {
    // Remove markdown formatting
    const cleanedText = text
      // Remove bold/italic markdown (**text** or *text*)
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      // Remove other markdown formatting
      .replace(/#{1,6}\s+/g, '') // Headers
      .replace(/`([^`]+)`/g, '$1') // Inline code
      .replace(/```[\s\S]*?```/g, '') // Code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Images
      .replace(/~~([^~]+)~~/g, '$1') // Strikethrough
      .replace(/^[-*+]\s+/gm, '') // List items
      .replace(/^\d+\.\s+/gm, '') // Numbered lists
      .replace(/^>\s*/gm, '') // Blockquotes
      .replace(/^#{1,6}\s+/gm, '') // Headers at start of line
      .replace(/\n{3,}/g, '\n\n') // Multiple newlines
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      // Remove emojis and special characters that don't sound good
      .replace(/[😊😄😃😀😁😂🤣😅😆😉😎🤔😮😯😲😳😴😵😶😷🤒🤕🤢🤮🤧😇🤠🤡🤥🤤🤫🤭🤯🤪🤨🧐🤓😈👿💀☠️👹👺👻👽👾🤖💩😺😸😹😻😼😽🙀😿😾]/g, '')
      .replace(/[🎉🎊🎈🎁🎀🎂🎃🎄🎆🎇✨🌟💫⭐🌠🌈☀️🌙🌛🌜🌝🌞🌚🌕🌖🌗🌘🌑🌒🌓🌔]/g, '')
      .replace(/[🔥💧⚡❄️🌪️🌊🌋🌍🌎🌏🌌🌑🌒🌓🌔🌕🌖🌗🌘🌙🌚🌛🌜🌝🌞🌟🌠]/g, '')
      .replace(/[👍👎👌✌️🤞🤟🤘🤙👈👉👆👇☝️✋🤚🖐️🖖👋🤝👏🙌👐🤲🤜🤛✊👊👎👌✌️🤞🤟🤘🤙👈👉👆👇☝️✋🤚🖐️🖖👋🤝👏🙌👐🤲🤜🤛✊👊]/g, '')
      .replace(/[❤️💛💚💙💜🖤🤍🤎💔❣️💕💞💓💗💖💘💝💟]/g, '')
      .replace(/[😀😃😄😁😆😅😂🤣😊😇🙂🙃😉😌😍🥰😘😗😙😚😋😛😝😜🤪🤨🧐🤓😎🤩🥳😏😒😞😔😟😕🙁☹️😣😖😫😩🥺😢😭😤😠😡🤬🤯😳🥵🥶😱😨😰😥😓🤗🤔🤭🤫🤥😶😐😑😬🙄😯😦😧😮😲🥱😴🤤😪😵🤐🥴🤢🤮🤧😷🤒🤕🤑🤠😈👿👹👺🤡💩👻💀☠️👽👾🤖🎃😺😸😹😻😼😽🙀😿😾]/g, '')
      // Clean up any remaining special characters that might be spoken
      .replace(/[•·▪▫‣⁃]/g, '') // Bullet points
      .replace(/[→←↑↓↔↕↖↗↘↙]/g, '') // Arrows
      .replace(/[★☆✦✧✩✪✫✬✭✮✯✰]/g, '') // Stars
      .replace(/[♪♫♬♭♮♯]/g, '') // Music notes
      .replace(/[⚡⚡⚡]/g, '') // Lightning
      .replace(/[🔥🔥🔥]/g, '') // Fire
      .replace(/[💯]/g, '') // Hundred points
      .replace(/[✅❌✔️✖️]/g, '') // Checkmarks
      .replace(/[❗❓]/g, '') // Exclamation/question marks
      // Clean up multiple spaces and normalize text
      .replace(/\s+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .trim();

    console.log('🧹 Text preprocessing:', {
      original: text.substring(0, 100) + '...',
      cleaned: cleanedText.substring(0, 100) + '...',
      removedChars: text.length - cleanedText.length
    });

    return cleanedText;
  }

  private async speakWithGeminiTTS(text: string) {
    try {
      console.log('🎤 Using Gemini-TTS with voice:', this.config?.voiceName);
      
      // Get style prompt based on voice characteristics
      const stylePrompt = this.getStylePromptForVoice(this.config?.voiceName || 'Puck');
      
      const ttsRequest: TTSRequest = {
        text: text,
        voice: this.config?.voiceName || 'Puck',
        stylePrompt: stylePrompt,
        speed: 1.0, // Natural speaking rate
        pitch: 0.0, // Neutral pitch
        volume: 0.0, // Normal volume
        markupTags: true // Enable natural markup for expressive speech
      };

      const response = await geminiTTSService.generateSpeech(ttsRequest);
      
      // Convert base64 audio to blob and play
      const audioBlob = new Blob([
        Uint8Array.from(atob(response.audioContent), c => c.charCodeAt(0))
      ], { type: response.mimeType });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onloadstart = () => {
        console.log('🔊 Started playing Gemini-TTS audio');
        this.isSpeaking = true;
        this.callbacks.onStateChange?.({
          isSpeaking: true,
          isListening: false
        });
      };
      
      audio.onended = () => {
        console.log('🔊 Finished playing Gemini-TTS audio');
        this.isSpeaking = false;
        this.callbacks.onStateChange?.({
          isSpeaking: false
        });
        
        // Clean up
        URL.revokeObjectURL(audioUrl);
        
        // Resume listening after delay
        setTimeout(() => {
          if (this.isConnected && !this.isManualDisconnect && !this.isListening) {
            this.startRecording().catch(console.error);
          }
        }, 2000);
      };
      
      audio.onerror = (error) => {
        console.error('❌ Gemini-TTS audio playback error:', error);
        this.isSpeaking = false;
        this.callbacks.onStateChange?.({
          isSpeaking: false
        });
        
        // Clean up and fallback to browser TTS
        URL.revokeObjectURL(audioUrl);
        this.speakWithBrowserTTS(text);
      };
      
      // Play the audio
      await audio.play();
      
    } catch (error) {
      console.error('❌ Gemini-TTS failed:', error);
      // Re-throw error to be caught by the caller for fallback
      throw error;
    }
  }

  private getStylePromptForVoice(voiceName: string): string {
    const stylePrompts = {
      'Puck': "You are having a friendly conversation. Speak in a cheerful, upbeat, and enthusiastic way.",
      'Zephyr': "You are excited about something. Speak with enthusiasm, energy, and brightness.",
      'Charon': "You are providing helpful information. Speak in a clear, informative, and professional way.",
      'Kore': "You are confident about your knowledge. Speak in a firm, assured, and authoritative way.",
      'Fenrir': "You are passionate about the topic. Speak with excitement, energy, and dynamism.",
      'Leda': "You are young and enthusiastic. Speak in a fresh, vibrant, and youthful way.",
      'Orus': "You are dependable and reliable. Speak in a firm, strong, and steady way.",
      'Aoede': "You are in a light mood. Speak in a breezy, airy, and relaxed way.",
      'Callirrhoe': "You are being calm and reassuring. Speak in an easy-going, relaxed, and gentle way.",
      'Autonoe': "You are bright and energetic. Speak in a vibrant, lively, and enthusiastic way."
    };
    
    return stylePrompts[voiceName as keyof typeof stylePrompts] || 
           "You are having a friendly conversation. Speak in a natural, conversational, and engaging way.";
  }

  private async speakWithExternalTTS(text: string) {
    try {
      console.log('🎤 Using external TTS with voice:', this.config?.voiceName);
      
      // This is a placeholder for external TTS integration
      // You would integrate with your preferred TTS service here
      // For now, fall back to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.15;
      utterance.volume = 0.85;
      utterance.lang = 'en-US';
      
      // Try to find a voice that matches the requested characteristics
      const voices = this.speechSynthesis?.getVoices() || [];
      const voiceMap: { [key: string]: string[] } = {
        'Puck -- Upbeat': ['Samantha', 'Victoria', 'Fiona', 'Aria', 'Emma', 'Joanna'],
        'Zephyr -- Bright': ['Alex', 'Daniel', 'Karen', 'Moira', 'Tessa'],
        'Charon -- Informative': ['Microsoft David', 'Google US English', 'Enhanced'],
        'Kore -- Firm': ['Microsoft Zira', 'Salli', 'Kimberly', 'Ivy'],
        'Fenrir -- Excitable': ['Joey', 'Justin', 'Matthew', 'Rishi']
      };
      
      const preferredVoices = voiceMap[this.config?.voiceName || ''] || ['Samantha', 'Victoria', 'Aria'];
      
      for (const voiceName of preferredVoices) {
        const voice = voices.find(v => v.name.includes(voiceName));
        if (voice) {
          utterance.voice = voice;
          console.log('🎤 Selected voice:', voice.name);
          break;
        }
      }
      
      utterance.onstart = () => {
        this.isSpeaking = true;
        this.callbacks.onStateChange?.({
          isSpeaking: true,
          isListening: false
        });
      };
      
      utterance.onend = () => {
        this.isSpeaking = false;
        this.callbacks.onStateChange?.({
          isSpeaking: false
        });
        
        // Resume listening after delay
        setTimeout(() => {
          if (this.isConnected && !this.isManualDisconnect && !this.isListening) {
            this.startRecording().catch(console.error);
          }
        }, 2000);
      };
      
      utterance.onerror = (event) => {
        console.error('❌ External TTS error:', event.error);
        this.isSpeaking = false;
        this.callbacks.onStateChange?.({
          isSpeaking: false
        });
      };
      
      this.speechSynthesis?.speak(utterance);
      
    } catch (error) {
      console.error('❌ External TTS failed, falling back to browser TTS:', error);
      // Fallback to regular browser TTS
      this.speakWithBrowserTTS(text);
    }
  }

  private speakWithBrowserTTS(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Enhanced speech parameters for more natural sound
    utterance.rate = 0.9; // Slightly slower for more natural pace
    utterance.pitch = 1.0; // Neutral pitch for natural sound
    utterance.volume = 0.8; // Good volume without being too loud
    utterance.lang = 'en-US';
    
    // Get all available voices
    const voices = this.speechSynthesis?.getVoices() || [];
    console.log('🎤 Available voices:', voices.map(v => v.name));
    
    // Priority list for natural-sounding voices (most natural first)
    const naturalVoices = [
      // Google voices (usually most natural)
      'Google US English',
      'Google UK English Female',
      'Google UK English Male',
      'Google Australian English Female',
      'Google Australian English Male',
      
      // Microsoft voices (good quality)
      'Microsoft Zira Desktop',
      'Microsoft David Desktop',
      'Microsoft Susan Desktop',
      'Microsoft Mark Desktop',
      'Microsoft Hazel Desktop',
      
      // macOS voices (if available)
      'Samantha',
      'Alex',
      'Victoria',
      'Daniel',
      'Karen',
      'Fiona',
      'Moira',
      'Tessa',
      'Veena',
      'Rishi',
      'Amara',
      'Aria',
      'Emma',
      'Joanna',
      'Kimberly',
      'Salli',
      'Joey',
      'Justin',
      'Matthew',
      'Ivy',
      'Kendra'
    ];
    
    // Try to find the most natural voice
    for (const voiceName of naturalVoices) {
      const voice = voices.find(v => 
        v.name.includes(voiceName) && 
        v.lang.startsWith('en') &&
        v.localService === false // Prefer cloud-based voices (usually better quality)
      );
      if (voice) {
        utterance.voice = voice;
        console.log('🎤 Selected natural voice:', voice.name);
        break;
      }
    }

    // If no cloud voice found, try any English voice
    if (!utterance.voice) {
      const englishVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Natural') || v.name.includes('Enhanced'))
      );
      if (englishVoice) {
        utterance.voice = englishVoice;
        console.log('🎤 Selected English voice:', englishVoice.name);
      }
    }

    // If still no voice found, use any available English voice
    if (!utterance.voice) {
      const anyEnglishVoice = voices.find(v => v.lang.startsWith('en'));
      if (anyEnglishVoice) {
        utterance.voice = anyEnglishVoice;
        console.log('🎤 Selected any English voice:', anyEnglishVoice.name);
      }
    }

    utterance.onstart = () => {
      console.log('🔊 Started speaking:', text.substring(0, 50) + '...');
      
      // Set speaking flag to prevent feedback
      this.isSpeaking = true;
      
      // Ensure recognition is stopped
      if (this.recognition && this.isListening) {
        try {
          this.recognition.stop();
          this.isListening = false;
          console.log('🎤 Stopped listening while AI is speaking');
        } catch (error) {
          console.warn('⚠️ Error stopping recognition:', error);
          this.isListening = false;
        }
      }
      
      this.callbacks.onStateChange?.({
        isSpeaking: true,
        isListening: false
      });
    };

    utterance.onend = () => {
      console.log('🔊 Finished speaking');
      
      // Clear speaking flag
      this.isSpeaking = false;
      
      this.callbacks.onStateChange?.({
        isSpeaking: false
      });
      
      // Add longer delay (2 seconds) before resuming listening to prevent feedback
      setTimeout(() => {
        if (this.isConnected && !this.isManualDisconnect && !this.isListening) {
          console.log('🎤 Resuming listening after speech delay');
          this.startRecording().catch(console.error);
        }
      }, 2000); // Increased from 500ms to 2000ms
    };

    utterance.onerror = (event) => {
      console.error('❌ Speech synthesis error:', event.error);
      
      // Clear speaking flag
      this.isSpeaking = false;
      
      this.callbacks.onStateChange?.({
        isSpeaking: false
      });
      
      // Resume listening after error with delay
      setTimeout(() => {
        if (this.isConnected && !this.isManualDisconnect && !this.isListening) {
          console.log('🎤 Resuming listening after speech error');
          this.startRecording().catch(console.error);
        }
      }, 1000);
    };

    this.currentUtterance = utterance;
    this.speechSynthesis?.speak(utterance);
  }

  private async speakText(text: string) {
    if (!this.speechSynthesis) return;

    // Preprocess text to remove markdown and emojis
    const cleanedText = this.preprocessTextForSpeech(text);
    
    if (!cleanedText.trim()) {
      console.log('⚠️ No text to speak after cleaning');
      return;
    }

    // Stop any current speech and recognition immediately
    this.speechSynthesis.cancel();
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
        console.log('🎤 Stopped listening before AI speaks');
      } catch (error) {
        console.warn('⚠️ Error stopping recognition:', error);
      }
    }

    // Try Gemini-TTS API first (preferred)
    if (this.config?.useGeminiTTS && this.config?.voiceName) {
      const isAvailable = await geminiTTSService.isAvailable();
      if (isAvailable) {
        try {
          await this.speakWithGeminiTTS(cleanedText);
          return;
        } catch (error) {
          console.warn('⚠️ Gemini-TTS failed, falling back to browser TTS:', error);
          // Fall through to browser TTS fallback
        }
      } else {
        console.warn('⚠️ Gemini-TTS not available, using browser TTS fallback');
        // Fall through to browser TTS fallback
      }
    }

    // Fallback to browser TTS with enhanced natural voice selection
    this.speakWithBrowserTTS(cleanedText);
  }

  private fallbackToHttpMode() {
    console.log('🔄 Switching to HTTP mode for Gemini Live');
    this.isConnected = true;
    this.callbacks.onConnected?.();
    this.callbacks.onStateChange?.({
      isConnected: true,
      isListening: false,
      isThinking: false,
      isSpeaking: false,
      isProcessing: false
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('❌ Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.callbacks.onError?.('Connection lost. Please refresh the page.');
    }
  }

  async startRecording(): Promise<void> {
    if (!this.recognition || !this.isConnected) {
      throw new Error('Speech recognition not available or not connected');
    }

    // Check if already listening to avoid duplicate starts
    if (this.isListening) {
      console.log('🎤 Already listening, skipping start');
      return;
    }

    // Don't start listening if AI is speaking
    if (this.isSpeaking) {
      console.log('🎤 AI is speaking, skipping start');
      return;
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
        // Ignore speech recognition results when AI is speaking to prevent feedback
        if (this.isSpeaking) {
          console.log('🎤 Ignoring speech input while AI is speaking');
          return;
        }

        const transcript = event.results[event.results.length - 1][0].transcript;
        const isFinal = event.results[event.results.length - 1].isFinal;
        
        if (isFinal && transcript.trim()) {
          console.log('🎤 Speech recognized:', transcript);
          
          // Notify about user speech
          this.callbacks.onUserSpeech?.(transcript);
          
          this.callbacks.onStateChange?.({
            isThinking: true,
            isProcessing: true
          });

          // Send text to Gemini Live
          this.sendText(transcript);
        }
      };

      this.recognition.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        this.callbacks.onError?.(`Speech recognition error: ${event.error}`);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.callbacks.onStateChange?.({
          isListening: false
        });
        
        // Restart listening for continuous conversation
        if (this.isConnected) {
          setTimeout(() => {
            this.startRecording().catch(console.error);
          }, 100);
        }
      };

      this.recognition.start();
      console.log('🎤 Started continuous recording...');
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
    console.log('🛑 Stopping recording...');
    
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        console.log('🛑 Stopped speech recognition');
      } catch (error) {
        console.warn('⚠️ Error stopping recognition:', error);
      }
    }
    
    this.isListening = false;
    this.callbacks.onStateChange?.({
      isListening: false
    });
    
    console.log('✅ Recording stopped');
  }

  async sendText(text: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to Gemini Live');
    }

    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: text,
        timestamp: Date.now()
      });

      // Trim history if it gets too long
      if (this.conversationHistory.length > this.maxHistoryLength) {
        this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
      }

      // If WebSocket is available, use it
      if (this.ws) {
        this.ws.send(JSON.stringify({
          type: 'text',
          text: text,
          conversationHistory: this.conversationHistory
        }));
        console.log('📤 Sent text to Gemini Live via WebSocket:', text);
      } else {
        // Fallback to HTTP API
        await this.sendTextViaHttp(text);
        console.log('📤 Sent text to Gemini Live via HTTP:', text);
      }

      console.log('📚 Conversation history length:', this.conversationHistory.length);
    } catch (error) {
      console.error('❌ Error sending text to Gemini Live:', error);
      this.callbacks.onError?.(error instanceof Error ? error.message : 'Failed to send text');
    }
  }

  private async sendTextViaHttp(text: string): Promise<void> {
    const backendUrl = this.config?.backendUrl || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://saintsal-backend-0mv8.onrender.com';
    
    try {
      // Use the existing process-text endpoint as fallback
      const response = await fetch(`${backendUrl}/api/gemini-live/process-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer gemini-live-token' // Simple token for fallback
        },
        body: JSON.stringify({
          text: text,
          model: this.config?.model || 'gemini-2.5-flash',
          systemInstruction: this.config?.systemInstruction || 'You are a helpful AI voice assistant. Provide friendly, conversational, and concise responses.'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.result && data.result.text) {
        // Simulate WebSocket message handling
        this.handleWebSocketMessage({
          type: 'gemini_message',
          data: {
            serverContent: {
              modelTurn: {
                parts: [{
                  text: data.result.text
                }]
              },
              turnComplete: true
            }
          }
        });
      }
    } catch (error) {
      console.error('❌ HTTP fallback failed:', error);
      // Fallback to browser TTS with a simple response
      this.handleWebSocketMessage({
        type: 'gemini_message',
        data: {
          serverContent: {
            modelTurn: {
              parts: [{
                text: "I'm having trouble connecting to the AI service. Please try again later."
              }]
            },
            turnComplete: true
          }
        }
      });
    }
  }

  stopSpeaking(): void {
    console.log('🔇 Stopping all speech...');
    
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
      console.log('🔇 Cancelled speech synthesis');
    }
    
    // Stop current utterance if exists
    if (this.currentUtterance) {
      this.currentUtterance.onend = null;
      this.currentUtterance.onerror = null;
      this.currentUtterance = null;
    }
    
    // Update state
    this.isSpeaking = false;
    this.callbacks.onStateChange?.({
      isSpeaking: false
    });
    
    console.log('✅ Speech stopped');
  }

  pauseSpeaking(): void {
    console.log('⏸️ Pausing speech...');
    
    if (this.speechSynthesis) {
      this.speechSynthesis.pause();
      console.log('⏸️ Speech paused');
    }
  }

  resumeSpeaking(): void {
    console.log('▶️ Resuming speech...');
    
    if (this.speechSynthesis) {
      this.speechSynthesis.resume();
      console.log('▶️ Speech resumed');
    }
  }

  clearConversationHistory(): void {
    this.conversationHistory = [];
    console.log('🗑️ Conversation history cleared');
  }

  getConversationHistory(): Array<{role: 'user' | 'assistant', content: string, timestamp: number}> {
    return [...this.conversationHistory];
  }

  async disconnect(): Promise<void> {
    try {
      console.log('🔌 Starting disconnect process...');
      
      // Set manual disconnect flag to prevent auto-reconnect
      this.isManualDisconnect = true;
      
      // Stop all speech synthesis immediately
      if (this.speechSynthesis) {
        this.speechSynthesis.cancel();
        console.log('🔇 Stopped speech synthesis');
      }
      
      // Stop current utterance if exists
      if (this.currentUtterance) {
        this.currentUtterance.onend = null;
        this.currentUtterance.onerror = null;
        this.currentUtterance = null;
      }
      
      // Stop speech recognition
      if (this.recognition && this.isListening) {
        try {
          this.recognition.stop();
          console.log('🎤 Stopped speech recognition');
        } catch (error) {
          console.warn('⚠️ Error stopping recognition:', error);
        }
      }
      
      // Close WebSocket connection
      if (this.ws) {
        this.ws.close();
        this.ws = null;
        console.log('🔌 Closed WebSocket connection');
      }
      
      // Clear all timers
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
      
      // Reset all state flags
      this.isConnected = false;
      this.isListening = false;
      this.isThinking = false;
      this.isSpeaking = false;
      this.isProcessing = false;
      this.isManualDisconnect = false;
      this.reconnectAttempts = 0;

      // Update callbacks with final state
      this.callbacks.onStateChange?.({
        isConnected: false,
        isListening: false,
        isThinking: false,
        isSpeaking: false,
        isProcessing: false
      });

      console.log('✅ Disconnect process completed');
    } catch (error) {
      console.error('❌ Error during disconnect:', error);
    }
  }

  isServiceConnected(): boolean {
    return this.isConnected;
  }

  // Force cleanup method for emergency cleanup
  forceCleanup(): void {
    console.log('🚨 Force cleanup initiated...');
    
    try {
      // Stop all speech synthesis
      if (this.speechSynthesis) {
        this.speechSynthesis.cancel();
      }
      
      // Stop speech recognition
      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch {
          // Ignore errors when force stopping
        }
      }
      
      // Close WebSocket
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      
      // Clear all timers
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
      
      // Reset all state
      this.isConnected = false;
      this.isListening = false;
      this.isThinking = false;
      this.isSpeaking = false;
      this.isProcessing = false;
      this.isManualDisconnect = true;
      this.reconnectAttempts = 0;
      this.currentUtterance = null;
      
      console.log('✅ Force cleanup completed');
    } catch (error) {
      console.error('❌ Error during force cleanup:', error);
    }
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
export const geminiLiveWebSocketService = new GeminiLiveWebSocketService();
