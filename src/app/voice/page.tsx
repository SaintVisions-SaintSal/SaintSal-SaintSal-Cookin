'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MicOff, 
  X, 
  Play,
  Pause,
  PhoneOff
} from 'lucide-react';
import { geminiLiveWebSocketService } from '@/services/geminiLiveWebSocketService';
import AnimatedOrb from '@/components/AnimatedOrb';

interface VoiceState {
  isConnected: boolean;
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  aiResponse: string;
}

export default function VoicePage() {
  const router = useRouter();
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isConnected: false,
    isListening: false,
    isThinking: false,
    isSpeaking: false,
    isProcessing: false,
    aiResponse: ''
  });
  const [isPaused, setIsPaused] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [selectedVoice] = useState('Puck');
  const [userSpeech, setUserSpeech] = useState<string>('');
  const [ttsService, setTtsService] = useState<'gemini-tts' | 'browser-tts' | 'unknown'>('unknown');
  const [error, setError] = useState<string | null>(null);

  // Available Gemini-TTS voices (used in future implementation)
  /* const voiceOptions = [
    { value: 'Puck', label: 'Puck (Upbeat & Cheerful)' },
    { value: 'Zephyr', label: 'Zephyr (Bright & Energetic)' },
    { value: 'Charon', label: 'Charon (Informative & Clear)' },
    { value: 'Kore', label: 'Kore (Firm & Confident)' },
    { value: 'Fenrir', label: 'Fenrir (Excitable & Dynamic)' },
    { value: 'Leda', label: 'Leda (Youthful & Fresh)' },
    { value: 'Orus', label: 'Orus (Firm & Strong)' },
    { value: 'Aoede', label: 'Aoede (Breezy & Light)' },
    { value: 'Callirrhoe', label: 'Callirrhoe (Easy-going & Relaxed)' },
    { value: 'Autonoe', label: 'Autonoe (Bright & Vibrant)' },
    { value: 'Enceladus', label: 'Enceladus (Breathy & Gentle)' },
    { value: 'Iapetus', label: 'Iapetus (Clear & Articulate)' },
    { value: 'Umbriel', label: 'Umbriel (Easy-going & Mellow)' },
    { value: 'Algieba', label: 'Algieba (Smooth & Refined)' },
    { value: 'Despina', label: 'Despina (Smooth & Elegant)' },
    { value: 'Erinome', label: 'Erinome (Clear & Crisp)' },
    { value: 'Algenib', label: 'Algenib (Gravelly & Textured)' },
    { value: 'Rasalgethi', label: 'Rasalgethi (Informative & Educational)' },
    { value: 'Laomedeia', label: 'Laomedeia (Upbeat & Optimistic)' },
    { value: 'Achernar', label: 'Achernar (Soft & Gentle)' },
    { value: 'Alnilam', label: 'Alnilam (Firm & Reliable)' },
    { value: 'Schedar', label: 'Schedar (Even & Balanced)' },
    { value: 'Gacrux', label: 'Gacrux (Mature & Wise)' },
    { value: 'Pulcherrima', label: 'Pulcherrima (Forward & Direct)' },
    { value: 'Achird', label: 'Achird (Friendly & Warm)' },
    { value: 'Zubenelgenubi', label: 'Zubenelgenubi (Casual & Relaxed)' },
    { value: 'Vindemiatrix', label: 'Vindemiatrix (Gentle & Nurturing)' },
    { value: 'Sadachbia', label: 'Sadachbia (Lively & Animated)' },
    { value: 'Sadaltager', label: 'Sadaltager (Knowledgeable & Educational)' },
    { value: 'Sulafat', label: 'Sulafat (Warm & Comforting)' }
  ]; */

  useEffect(() => {
    // Log voice config once on mount
    console.log('Voice config:', { selectedVoice, ttsService });
    
    initializeVoiceService();
    
    // Cleanup function that runs when component unmounts
    return () => {
      console.log('🧹 Component unmounting, cleaning up...');
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Additional cleanup on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🧹 Page unloading, cleaning up...');
      cleanup();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const checkTTSService = async () => {
    // Only run on client side to avoid SSR issues
    if (typeof window === 'undefined') {
      console.log('⚠️ Speech APIs not available in server environment');
      setTtsService('browser-tts');
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://saintsal-backend-0mv8.onrender.com';
      const response = await fetch(`${backendUrl}/api/gemini-tts/status`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.available) {
          setTtsService('gemini-tts');
          console.log('✅ Using Gemini-TTS service');
        } else {
          setTtsService('browser-tts');
          console.log('⚠️ Using browser TTS fallback');
        }
      } else {
        setTtsService('browser-tts');
        console.log('⚠️ Using browser TTS fallback');
      }
    } catch (err) {
      console.log('⚠️ Using browser TTS fallback:', err);
      setTtsService('browser-tts');
    }
  };

  const initializeVoiceService = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      // Check which TTS service is available
      await checkTTSService();

      // Use backend API instead of direct Gemini API key exposure
      const apiKey = 'not-required'; // We'll use backend for Gemini calls
      
      if (apiKey === 'not-required') {
        console.log('ℹ️ Using backend API for Gemini calls (secure)');
      }

      await geminiLiveWebSocketService.initialize({
        apiKey: 'not-required', // Backend handles API key securely
        model: 'gemini-2.5-flash',
        systemInstruction: 'You are a helpful AI voice assistant. Provide friendly, conversational, and concise responses. Keep your answers brief and engaging.',
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://saintsal-backend-0mv8.onrender.com',
        voiceName: selectedVoice,
        useGeminiTTS: true,
        stylePrompt: 'You are having a friendly conversation. Speak in a natural, cheerful, and engaging way.',
        googleCloudApiKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY || '',
        googleCloudProjectId: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID || ''
      }, {
        onStateChange: (state) => {
          setVoiceState(prev => ({ ...prev, ...state }));
        },
        onTextResponse: (text) => {
          console.log('📝 AI Response:', text);
        },
        onUserSpeech: (text) => {
          console.log('🎤 User Speech:', text);
          setUserSpeech(text);
        },
        onAudioResponse: () => {
          console.log('🔊 Audio Response received');
        },
        onError: (error: string | Error) => {
          console.error('❌ Voice service error:', error);
          
          // Handle specific error types with user-friendly messages
          let errorMessage = typeof error === 'string' ? error : (error.message || error.toString());
          if (errorMessage.includes('overloaded') || errorMessage.includes('503')) {
            errorMessage = 'Gemini API is temporarily overloaded. The system will retry automatically in a few seconds.';
          } else if (errorMessage.includes('429') || errorMessage.includes('quota')) {
            errorMessage = 'Rate limit exceeded. The system will retry automatically in a few seconds.';
          } else if (errorMessage.includes('retry')) {
            errorMessage = errorMessage; // Keep retry messages as-is
          }
          
          setError(errorMessage);
        },
        onConnected: () => {
          console.log('✅ Connected to Gemini Live');
          setError(null);
        },
        onDisconnected: () => {
          console.log('🔌 Disconnected from Gemini Live');
        }
      });

      await geminiLiveWebSocketService.connect();
    } catch (error) {
      console.error('❌ Failed to initialize voice service:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize voice service');
    } finally {
      setIsInitializing(false);
    }
  };

  const cleanup = async () => {
    try {
      console.log('🧹 Starting cleanup process...');
      
      // Stop all speech synthesis immediately
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        console.log('🔇 Cancelled all speech synthesis');
      }
      
      // Try normal disconnect first
      try {
        await geminiLiveWebSocketService.disconnect();
      } catch (error) {
        console.warn('⚠️ Normal disconnect failed, using force cleanup:', error);
        // Use force cleanup as fallback
        geminiLiveWebSocketService.forceCleanup();
      }
      
      // Reset all state
      setVoiceState({
        isConnected: false,
        isListening: false,
        isThinking: false,
        isSpeaking: false,
        isProcessing: false,
        aiResponse: ''
      });
      
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      // Last resort: force cleanup
      geminiLiveWebSocketService.forceCleanup();
    }
  };

  const handleMicPress = async () => {
    try {
      if (!voiceState.isConnected) {
        await initializeVoiceService();
        return;
      }

      if (voiceState.isListening) {
        await geminiLiveWebSocketService.stopRecording();
      } else {
        await geminiLiveWebSocketService.startRecording();
      }
    } catch (error) {
      console.error('❌ Mic error:', error);
      setError(error instanceof Error ? error.message : 'Microphone error');
    }
  };

  const handleClose = async () => {
    await cleanup();
    router.back();
  };

  const handlePauseToggle = () => {
    if (isPaused) {
      // Resume
      setIsPaused(false);
      if (voiceState.isSpeaking) {
        // Resume speech if it was paused
        geminiLiveWebSocketService.resumeSpeaking?.();
      }
    } else {
      // Pause
      setIsPaused(true);
      if (voiceState.isSpeaking) {
        // Pause speech
        geminiLiveWebSocketService.pauseSpeaking?.();
      }
    }
  };

  const getStatusText = () => {
    if (isInitializing) return 'Initializing...';
    if (!voiceState.isConnected) return 'Connecting...';
    if (voiceState.isListening) return 'Listening (continuous)...';
    if (voiceState.isThinking) return 'Thinking...';
    if (voiceState.isSpeaking) return 'Speaking...';
    if (voiceState.isProcessing) return 'Processing...';
    return 'Ready for conversation';
  };

  const getStatusColor = () => {
    if (isInitializing) return 'text-blue-400';
    if (voiceState.isListening) return 'text-green-400';
    if (voiceState.isThinking) return 'text-yellow-400';
    if (voiceState.isSpeaking) return 'text-purple-400';
    if (voiceState.isProcessing) return 'text-orange-400';
    return 'text-white';
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 flex items-center justify-between flex-shrink-0">
        <motion.button
          onClick={handleClose}
          className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full hover:bg-white/20 transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <X size={24} className="text-white" />
        </motion.button>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Voice Assistant</h1>
          <p className="text-gray-300">Chatting with SaintSal™</p>
        </div>

        <div className="w-12" /> {/* Spacer */}
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full opacity-20"
          animate={{
            background: [
              'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 60%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full opacity-15"
          animate={{
            background: [
              'radial-gradient(circle at 60% 40%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 30% 70%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 70% 30%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 60% 40%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)'
            ]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2">
        {/* Status Display */}
        <motion.div
          className="mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`text-lg font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </div>
          {voiceState.aiResponse && (
            <div className="mt-3 p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl max-w-2xl">
              <p className="text-white text-sm leading-relaxed">
                {voiceState.aiResponse}
              </p>
            </div>
          )}
        </motion.div>

        {/* Beautiful SVG Orb */}
        <motion.div
          className="mb-6 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <AnimatedOrb
            isListening={voiceState.isListening}
            isSpeaking={voiceState.isSpeaking}
            isThinking={voiceState.isThinking}
            isConnected={voiceState.isConnected}
            isInitializing={isInitializing}
          />
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6 p-4 bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-2xl max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <p className="text-red-300 text-sm text-center">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Speech Display */}
      <div className="relative z-10 mb-4 flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 max-w-md w-full">
          <label className="block text-xs font-medium text-white mb-1 text-center">
            You said:
          </label>
          <div className="min-h-[40px] flex items-center justify-center">
            {userSpeech ? (
              <motion.p 
                className="text-white text-center text-sm leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                &quot;{userSpeech}&quot;
              </motion.p>
            ) : (
              <p className="text-gray-400 text-center text-xs italic">
                {voiceState.isListening ? "Listening..." : "Speak to start conversation"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls - Three Essential Buttons */}
      <div className="relative z-10 p-4 flex items-center justify-center gap-6 flex-shrink-0">
        {/* Start Talking Button */}
        <motion.button
          onClick={handleMicPress}
          disabled={!voiceState.isConnected || voiceState.isProcessing}
          className={`p-5 rounded-full backdrop-blur-xl border transition-all duration-200 ${
            voiceState.isListening
              ? 'bg-red-500/30 border-red-500/50 shadow-lg shadow-red-500/20'
              : voiceState.isConnected
              ? 'bg-green-500/30 border-green-500/50 hover:bg-green-500/40 shadow-lg shadow-green-500/20'
              : 'bg-gray-500/20 border-gray-500/30'
          }`}
          whileHover={{ scale: voiceState.isConnected ? 1.05 : 1 }}
          whileTap={{ scale: voiceState.isConnected ? 0.95 : 1 }}
          title={voiceState.isListening ? "Stop Talking" : "Start Talking"}
        >
          {voiceState.isListening ? (
            <MicOff size={32} className="text-red-400" />
          ) : (
            <Play size={32} className={voiceState.isConnected ? "text-green-400" : "text-gray-400"} />
          )}
        </motion.button>

        {/* Pause Button */}
        <motion.button
          onClick={handlePauseToggle}
          disabled={!voiceState.isConnected || !voiceState.isSpeaking}
          className={`p-5 rounded-full backdrop-blur-xl border transition-all duration-200 ${
            isPaused
              ? 'bg-yellow-500/30 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
              : voiceState.isSpeaking
              ? 'bg-orange-500/30 border-orange-500/50 hover:bg-orange-500/40 shadow-lg shadow-orange-500/20'
              : 'bg-gray-500/20 border-gray-500/30'
          }`}
          whileHover={{ scale: voiceState.isSpeaking ? 1.05 : 1 }}
          whileTap={{ scale: voiceState.isSpeaking ? 0.95 : 1 }}
          title={isPaused ? "Resume" : "Pause"}
        >
          {isPaused ? (
            <Play size={32} className="text-yellow-400" />
          ) : (
            <Pause size={32} className={voiceState.isSpeaking ? "text-orange-400" : "text-gray-400"} />
          )}
        </motion.button>

        {/* End Call Button */}
        <motion.button
          onClick={handleClose}
          className="p-5 bg-red-500/30 border border-red-500/50 rounded-full hover:bg-red-500/40 transition-all duration-200 shadow-lg shadow-red-500/20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="End Call"
        >
          <PhoneOff size={32} className="text-red-400" />
        </motion.button>
      </div>
    </div>
  );
}
