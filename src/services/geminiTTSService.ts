// Gemini-TTS Service - Google Cloud Text-to-Speech API integration
// Provides natural, expressive speech generation with style control

export interface GeminiTTSConfig {
  apiKey: string;
  projectId?: string;
  region?: string;
}

export interface TTSRequest {
  text: string;
  voice: string;
  stylePrompt?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
  markupTags?: boolean;
}

export interface TTSResponse {
  audioContent: string; // Base64 encoded audio
  mimeType: string;
  duration?: number;
}

class GeminiTTSService {
  private config: GeminiTTSConfig;
  private baseUrl: string;

  constructor(config: GeminiTTSConfig) {
    this.config = config;
    this.baseUrl = `https://texttospeech.googleapis.com/v1/projects/${config.projectId || 'your-project-id'}/locations/${config.region || 'us-central1'}`;
  }

  // Available Gemini-TTS voices with their characteristics
  getAvailableVoices() {
    return [
      { name: 'Puck', gender: 'Male', characteristics: 'Upbeat, cheerful, energetic' },
      { name: 'Zephyr', gender: 'Male', characteristics: 'Bright, lively, enthusiastic' },
      { name: 'Charon', gender: 'Male', characteristics: 'Informative, clear, professional' },
      { name: 'Kore', gender: 'Female', characteristics: 'Firm, confident, authoritative' },
      { name: 'Fenrir', gender: 'Male', characteristics: 'Excitable, dynamic, passionate' },
      { name: 'Leda', gender: 'Female', characteristics: 'Youthful, fresh, vibrant' },
      { name: 'Orus', gender: 'Male', characteristics: 'Firm, strong, dependable' },
      { name: 'Aoede', gender: 'Female', characteristics: 'Breezy, light, airy' },
      { name: 'Callirrhoe', gender: 'Female', characteristics: 'Easy-going, relaxed, calm' },
      { name: 'Autonoe', gender: 'Female', characteristics: 'Bright, vibrant, energetic' },
      { name: 'Enceladus', gender: 'Male', characteristics: 'Breathy, soft, gentle' },
      { name: 'Iapetus', gender: 'Male', characteristics: 'Clear, distinct, articulate' },
      { name: 'Umbriel', gender: 'Male', characteristics: 'Easy-going, mellow, smooth' },
      { name: 'Algieba', gender: 'Male', characteristics: 'Smooth, polished, refined' },
      { name: 'Despina', gender: 'Female', characteristics: 'Smooth, elegant, sophisticated' },
      { name: 'Erinome', gender: 'Female', characteristics: 'Clear, crisp, precise' },
      { name: 'Algenib', gender: 'Male', characteristics: 'Gravelly, rough, textured' },
      { name: 'Rasalgethi', gender: 'Male', characteristics: 'Informative, educational, helpful' },
      { name: 'Laomedeia', gender: 'Female', characteristics: 'Upbeat, positive, optimistic' },
      { name: 'Achernar', gender: 'Female', characteristics: 'Soft, gentle, tender' },
      { name: 'Alnilam', gender: 'Male', characteristics: 'Firm, solid, reliable' },
      { name: 'Schedar', gender: 'Male', characteristics: 'Even, balanced, steady' },
      { name: 'Gacrux', gender: 'Female', characteristics: 'Mature, experienced, wise' },
      { name: 'Pulcherrima', gender: 'Female', characteristics: 'Forward, direct, assertive' },
      { name: 'Achird', gender: 'Male', characteristics: 'Friendly, warm, approachable' },
      { name: 'Zubenelgenubi', gender: 'Male', characteristics: 'Casual, informal, relaxed' },
      { name: 'Vindemiatrix', gender: 'Female', characteristics: 'Gentle, kind, nurturing' },
      { name: 'Sadachbia', gender: 'Male', characteristics: 'Lively, animated, spirited' },
      { name: 'Sadaltager', gender: 'Male', characteristics: 'Knowledgeable, informative, educational' },
      { name: 'Sulafat', gender: 'Female', characteristics: 'Warm, cozy, comforting' }
    ];
  }

  // Generate natural speech with style control
  async generateSpeech(request: TTSRequest): Promise<TTSResponse> {
    try {
      console.log('🎤 Generating speech with Gemini-TTS:', {
        voice: request.voice,
        textLength: request.text.length,
        stylePrompt: request.stylePrompt
      });

      // Use backend API instead of direct Google Cloud API
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://saintsal-backend-0mv8.onrender.com';
      const response = await fetch(`${backendUrl}/api/gemini-tts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          voice: request.voice,
          stylePrompt: request.stylePrompt,
          speed: request.speed || 1.0,
          pitch: request.pitch || 0.0,
          volume: request.volume || 0.0,
          markupTags: request.markupTags !== false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini-TTS API error: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate speech');
      }
      
      return {
        audioContent: data.audioContent,
        mimeType: data.mimeType || 'audio/mpeg',
        duration: data.duration || this.estimateDuration(request.text, request.speed || 1.0)
      };

    } catch (error) {
      console.error('❌ Gemini-TTS generation failed:', error);
      throw error;
    }
  }

  // Enhance text with natural markup tags for more expressive speech
  private enhanceTextWithMarkup(text: string, enableMarkup: boolean = true): string {
    if (!enableMarkup) return text;

    let enhancedText = text;

    // Add natural pauses and emphasis
    enhancedText = enhancedText
      // Add natural pauses after sentences
      .replace(/\.\s+/g, '. [short pause] ')
      .replace(/\?\s+/g, '? [short pause] ')
      .replace(/!\s+/g, '! [short pause] ')
      // Add emphasis to important words
      .replace(/\b(amazing|incredible|fantastic|wonderful|great|awesome)\b/gi, '[emphasized] $1')
      // Add natural hesitations for conversational feel
      .replace(/\b(well|so|um|uh|you know)\b/gi, '[uhm] $1')
      // Add natural reactions
      .replace(/\b(ha|haha|hahaha|lol)\b/gi, '[laughing]')
      // Add natural breathing
      .replace(/\b(that's|it's|I'm|you're|we're|they're)\b/gi, (match) => {
        const contractions = ['that\'s', 'it\'s', 'I\'m', 'you\'re', 'we\'re', 'they\'re'];
        const index = contractions.findIndex(c => match.toLowerCase().includes(c));
        return index >= 0 ? `[breath] ${match}` : match;
      });

    return enhancedText;
  }

  // Estimate audio duration based on text length and speaking rate
  private estimateDuration(text: string, speakingRate: number): number {
    const wordsPerMinute = 150 * speakingRate; // Average speaking rate
    const wordCount = text.split(/\s+/).length;
    return (wordCount / wordsPerMinute) * 60; // Duration in seconds
  }

  // Get style prompts for different conversation types
  getStylePrompts() {
    return {
      cheerful: "You are having a friendly conversation. Speak in a cheerful, upbeat, and enthusiastic way.",
      casual: "You are chatting with a friend. Speak in a casual, relaxed, and conversational way.",
      professional: "You are providing professional assistance. Speak in a clear, informative, and helpful way.",
      excited: "You are excited about something. Speak with enthusiasm, energy, and excitement.",
      calm: "You are being reassuring. Speak in a calm, gentle, and soothing way.",
      curious: "You are curious about something. Speak in an interested, questioning, and engaged way.",
      confident: "You are confident about your knowledge. Speak in a firm, assured, and knowledgeable way.",
      friendly: "You are being welcoming and friendly. Speak in a warm, approachable, and kind way."
    };
  }

  // Check if the service is available
  async isAvailable(): Promise<boolean> {
    // Only run on client side to avoid SSR issues
    if (typeof window === 'undefined') {
      console.warn('⚠️ Speech APIs not available in server environment');
      return false;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://saintsal-backend-0mv8.onrender.com';
      const response = await fetch(`${backendUrl}/api/gemini-tts/status`);
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.success && data.available;
    } catch (error) {
      console.warn('⚠️ Could not check Gemini-TTS availability:', error);
      return false;
    }
  }
}

export const geminiTTSService = new GeminiTTSService({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY || '',
  projectId: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID || '',
  region: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_REGION || 'us-central1'
});

export default geminiTTSService;
