'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
// Using browser's built-in Speech Recognition API for speech-to-text
import { videoAnalysisService } from '@/services/videoAnalysisService';

// TypeScript declarations for Speech Recognition API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface ExtendedSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

// Simple markdown renderer component
const MarkdownRenderer = ({ content }: { content: string }) => {
  const formatMarkdown = (text: string) => {
    return text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-white mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mb-4">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 text-green-400 p-3 rounded-lg my-2 overflow-x-auto"><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-700 text-green-400 px-1 py-0.5 rounded text-sm">$1</code>')
      // Lists
      .replace(/^\* (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
      // Line breaks
      .replace(/\n/g, '<br>');
  };

  return (
    <div 
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
    />
  );
};


interface VideoAnalysisState {
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  isTalking: boolean;
  isConnecting: boolean;
  currentResponse: string;
  error: string | null;
}

interface ChatMessage {
  id: string;
  type: 'video' | 'text';
  content: string;
  videoUrl?: string;
  videoBlob?: Blob;
  timestamp: Date;
  isUser: boolean;
  geminiAnalysis?: string;
}

export default function ScreenSharePage() {
  const router = useRouter();
  
  // Refs for video and audio handling
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // Voice activity detection refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const voiceDetectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef(false);
  const voiceStartTimeRef = useRef<number | null>(null);
  const minVoiceDuration = 1000; // 1 second in milliseconds
  
  // Speech recognition refs
  const currentSpokenTextRef = useRef<string>('');
  const isProcessingSpeechRef = useRef<boolean>(false);
  // Browser speech recognition doesn't need audio recording refs
  const pendingVideoBlobRef = useRef<Blob | null>(null);
  const pendingVideoUrlRef = useRef<string>('');
  const isWaitingForTranscriptionRef = useRef<boolean>(false);
  const secureVideoBlobRef = useRef<Blob | null>(null);
  const secureVideoUrlRef = useRef<string>('');
  
  // State management
  const [videoState, setVideoState] = useState<VideoAnalysisState>({
    isRecording: false,
    isProcessing: false,
    isSpeaking: false,
    isListening: false,
    isTalking: false,
    isConnecting: false,
    currentResponse: '',
    error: null
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastRecordingStatus, setLastRecordingStatus] = useState<string>('');
  const [spokenText, setSpokenText] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Browser Speech Recognition function
  const transcribeWithBrowserAPI = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Get SpeechRecognition constructor from window object
      const SpeechRecognition = (window as unknown as { SpeechRecognition?: new () => ExtendedSpeechRecognition; webkitSpeechRecognition?: new () => ExtendedSpeechRecognition }).SpeechRecognition || (window as unknown as { SpeechRecognition?: new () => ExtendedSpeechRecognition; webkitSpeechRecognition?: new () => ExtendedSpeechRecognition }).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      console.log('🎤 Starting browser Speech Recognition...');
      setIsTranscribing(true);
      isProcessingSpeechRef.current = true;

      const recognition = new SpeechRecognition() as ExtendedSpeechRecognition;
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('🎤 Speech recognition started');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Browser transcription result:', transcript);
        resolve(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('❌ Speech recognition error:', event.error);
        reject(new Error(`Speech recognition failed: ${event.error}`));
      };

      recognition.onend = () => {
        console.log('🎤 Speech recognition ended');
        setIsTranscribing(false);
        isProcessingSpeechRef.current = false;
      };

      recognition.start();
    });
  };

  // Start browser speech recognition
  const startBrowserSpeechRecognition = () => {
    try {
      console.log('🎤 Starting browser speech recognition...');
      transcribeWithBrowserAPI()
        .then((transcript) => {
          if (transcript) {
            currentSpokenTextRef.current = transcript;
            setSpokenText(transcript);
            console.log('🎤 Browser transcription completed:', transcript);
          }
        })
        .catch((error) => {
          console.error('❌ Browser speech recognition error:', error);
        });
    } catch (error) {
      console.error('❌ Error starting browser speech recognition:', error);
    }
  };

  // Function to clean text for speech by removing markdown and special characters
  const cleanTextForSpeech = (text: string): string => {
    return text
      // Remove markdown headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold and italic markdown
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      // Remove code blocks and inline code
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove links but keep the text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove list markers
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // Remove blockquotes
      .replace(/^>\s*/gm, '')
      // Remove horizontal rules
      .replace(/^[-*_]{3,}$/gm, '')
      // Remove extra whitespace and newlines
      .replace(/\n\s*\n/g, '. ')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      // Remove special characters that shouldn't be spoken
      .replace(/[#*_`~^|\\]/g, '')
      // Clean up any remaining multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
  };

  // TTS function using browser Web Speech API with ChatGPT voice support
  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      console.log('🔊 Using browser Web Speech API...');
      
      // Stop all recording and voice detection when AI starts speaking
      if (isRecordingRef.current) {
        console.log('🔊 AI speaking - stopping all recording...');
        stopRecording();
      }
      
      // Stop voice detection completely
      stopVoiceDetection();
      
      // Update state to show AI is speaking
      setVideoState(prev => ({
        ...prev,
        isListening: false,
        isRecording: false
      }));
      
      await speakWithBrowserAPI(text);
    } catch (error) {
      console.error('❌ TTS failed:', error);
    } finally {
      setIsSpeaking(false);
      
      // Don't automatically resume recording - user needs to manually start talking again
      console.log('🔊 AI finished speaking - waiting for user to start talking again...');
      setVideoState(prev => ({
        ...prev,
        isListening: false,
        isRecording: false,
        isTalking: true // Keep talking mode active but not listening
      }));
      
      // Show a temporary message to guide the user
      setLastRecordingStatus('AI finished speaking - click "Start Talking" to continue...');
      setTimeout(() => {
        setLastRecordingStatus('');
      }, 3000); // Clear after 3 seconds
    }
  };

  // Browser Web Speech API with male confident voice
  const speakWithBrowserAPI = (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      // Clean the text to remove markdown formatting and special characters
      const cleanText = cleanTextForSpeech(text);
      console.log('🔊 Original text:', text);
      console.log('🔊 Cleaned text for speech:', cleanText);

      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Configure voice with different profiles for variety
      const voiceProfiles = [
        { rate: 1.1, pitch: 1.0, volume: 1.0, name: 'Confident' },
        { rate: 1.0, pitch: 0.9, volume: 0.95, name: 'Professional' },
        { rate: 1.2, pitch: 1.1, volume: 0.9, name: 'Energetic' },
        { rate: 0.9, pitch: 0.8, volume: 1.0, name: 'Authoritative' },
        { rate: 1.05, pitch: 0.95, volume: 0.95, name: 'Clear' }
      ];
      
      // Select a random voice profile for variety
      const selectedProfile = voiceProfiles[Math.floor(Math.random() * voiceProfiles.length)];
      
      utterance.rate = selectedProfile.rate;
      utterance.pitch = selectedProfile.pitch;
      utterance.volume = selectedProfile.volume;
      
      console.log('🎤 Using voice profile:', selectedProfile.name);
      
      // Try to find a good male voice (prefer male voices for confident experience)
      const voices = speechSynthesis.getVoices();
      const preferredVoices = [
        // Google voices
        'Google UK English Male', 'Google US English Male', 'Google Australian English Male',
        // Microsoft voices
        'Microsoft David Desktop', 'Microsoft Mark Desktop', 'Microsoft Richard Desktop',
        // macOS voices
        'Daniel', 'Tom', 'Alex', 'Fred', 'Albert', 'Bruce', 'Ralph', 'Oliver', 'Harry',
        // Additional male voices
        'Male', 'Man', 'Guy', 'Speaker', 'Narrator', 'Voice', 'English Male',
        // Specific voice names
        'David', 'Mark', 'Richard', 'James', 'John', 'Michael', 'Robert', 'William'
      ];
      
      // More intelligent voice selection
      let selectedVoice = null;
      
      // First, try to find a preferred male voice
      selectedVoice = voices.find(voice => 
        preferredVoices.some(preferred => 
          voice.name.toLowerCase().includes(preferred.toLowerCase())
        ) && voice.name.toLowerCase().includes('male')
      );
      
      // If no male voice found, try any preferred voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          preferredVoices.some(preferred => 
            voice.name.toLowerCase().includes(preferred.toLowerCase())
          )
        );
      }
      
      // If still no voice, try any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.toLowerCase().includes('male') || 
           voice.name.toLowerCase().includes('man') ||
           voice.name.toLowerCase().includes('david') ||
           voice.name.toLowerCase().includes('mark'))
        );
      }
      
      // Fallback to any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
      }
      
      // Last resort
      if (!selectedVoice) {
        selectedVoice = voices[0];
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('🎤 Using voice:', selectedVoice.name, 'Language:', selectedVoice.lang);
      }

      utterance.onend = () => {
        console.log('✅ Browser TTS completed');
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('❌ Browser TTS error:', event.error);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      // Start speaking
      speechSynthesis.speak(utterance);
    });
  };

  // Voice activity detection functions
  const startVoiceDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Note: Using browser's built-in Speech Recognition API for text capture
      console.log('🎤 Using browser Speech Recognition API for text capture');
      
      const detectVoice = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        const isVoiceActive = average > 20; // Voice detection threshold
        
        setVideoState(prev => ({
          ...prev,
          isTalking: isVoiceActive
        }));
        
        // Auto-start recording when voice is detected and screen is shared
        if (isVoiceActive && !isRecordingRef.current && isScreenShared) {
          console.log('Voice detected, starting recording...');
          voiceStartTimeRef.current = Date.now();
          currentSpokenTextRef.current = ''; // Reset spoken text for new recording
          console.log('🎤 Reset spoken text for new recording');
          startRecording();
          startBrowserSpeechRecognition();
        }
        // Auto-stop recording when voice stops
        else if (!isVoiceActive && isRecordingRef.current) {
          const voiceDuration = voiceStartTimeRef.current ? Date.now() - voiceStartTimeRef.current : 0;
          console.log(`Voice stopped after ${voiceDuration}ms`);
          
          if (voiceDuration >= minVoiceDuration) {
            console.log('Voice duration sufficient, stopping video recording and waiting for transcription...');
            
            // Set flag to wait for transcription
            isWaitingForTranscriptionRef.current = true;
            setLastRecordingStatus('Processing speech...');
            
            // Browser speech recognition is already running
            
            // Mark this recording as valid for analysis
            (mediaRecorderRef.current as MediaRecorder & { shouldAnalyze?: boolean; spokenText?: string }).shouldAnalyze = true;
            (mediaRecorderRef.current as MediaRecorder & { shouldAnalyze?: boolean; spokenText?: string }).spokenText = ''; // Will be filled by transcription
            
            // Stop video recording after a small delay to ensure transcription starts
            console.log('🎤 Stopping video recording after delay to ensure transcription starts...');
            setTimeout(() => {
              stopRecording();
            }, 100); // 100ms delay
            
            console.log('🎤 isProcessingSpeechRef.current:', isProcessingSpeechRef.current);
            console.log('🎤 isWaitingForTranscriptionRef.current:', isWaitingForTranscriptionRef.current);
            
            // Wait for OpenAI transcription to complete
            let transcriptionTimeout = 0;
            const waitForTranscription = () => {
              console.log('🎤 waitForTranscription called, isProcessingSpeechRef.current:', isProcessingSpeechRef.current);
              transcriptionTimeout++;
              
              if (isProcessingSpeechRef.current) {
                console.log('🎤 Still processing transcription, waiting...');
                if (transcriptionTimeout > 20) { // 10 seconds timeout
                  console.log('🎤 Transcription timeout, proceeding with empty text...');
                  isWaitingForTranscriptionRef.current = false;
                  return;
                }
                setTimeout(waitForTranscription, 500); // Check every 500ms
              } else {
                console.log('🎤 Transcription complete, final text:', currentSpokenTextRef.current);
                // Update the spoken text in the media recorder
                (mediaRecorderRef.current as MediaRecorder & { shouldAnalyze?: boolean; spokenText?: string }).spokenText = currentSpokenTextRef.current;
                console.log('🎤 Now analyzing with transcribed text...');
                
                // Step 2: Wait for file handle release (1-3 seconds as recommended by Google)
                console.log('⏳ Waiting for file handle release (3 seconds)...');
                setTimeout(() => {
                  // Step 3: Use the secure copy for analysis
                  console.log('🔒 Checking secure video data - blob:', !!secureVideoBlobRef.current, 'url:', !!secureVideoUrlRef.current);
                  if (secureVideoBlobRef.current && secureVideoUrlRef.current) {
                    console.log('🔒 Analyzing secure video with transcribed text:', currentSpokenTextRef.current);
                    setLastRecordingStatus('Analyzing video...');
                    setSpokenText(currentSpokenTextRef.current);
                    addVideoToChat(secureVideoBlobRef.current, secureVideoUrlRef.current, currentSpokenTextRef.current);
                    
                    // Clean up secure data
                    secureVideoBlobRef.current = null;
                    secureVideoUrlRef.current = '';
                  } else if (pendingVideoBlobRef.current && pendingVideoUrlRef.current) {
                    console.log('🔒 Fallback: Analyzing pending video with transcribed text:', currentSpokenTextRef.current);
                    setLastRecordingStatus('Analyzing video...');
                    setSpokenText(currentSpokenTextRef.current);
                    addVideoToChat(pendingVideoBlobRef.current, pendingVideoUrlRef.current, currentSpokenTextRef.current);
                    
                    // Clear pending data
                    pendingVideoBlobRef.current = null;
                    pendingVideoUrlRef.current = '';
                  } else {
                    console.log('❌ No video data found for analysis');
                  }
                  
                  // Reset the waiting flag after analysis
                  isWaitingForTranscriptionRef.current = false;
                }, 3000); // 3 second delay as requested
              }
            };
            
            // Start waiting for transcription
            console.log('🎤 Starting waitForTranscription...');
            waitForTranscription();
          } else {
            console.log('Voice duration too short, discarding recording...');
            // Browser speech recognition is already running
            // Mark this recording as invalid for analysis
            (mediaRecorderRef.current as MediaRecorder & { shouldAnalyze?: boolean; spokenText?: string }).shouldAnalyze = false;
            stopRecording();
          }
          voiceStartTimeRef.current = null;
        }
      };
      
      voiceDetectionIntervalRef.current = setInterval(detectVoice, 100);
    } catch (error) {
      console.error('Error starting voice detection:', error);
      setVideoState(prev => ({
        ...prev,
        error: 'Failed to start voice detection'
      }));
    }
  };

  const stopVoiceDetection = useCallback(() => {
    if (voiceDetectionIntervalRef.current) {
      clearInterval(voiceDetectionIntervalRef.current);
      voiceDetectionIntervalRef.current = null;
    }
    
    // Browser speech recognition stops automatically
    
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setVideoState(prev => ({
      ...prev,
      isTalking: false
    }));
  }, []);

  // Initialize voice services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Load browser voices
        if ('speechSynthesis' in window) {
          const loadVoices = () => {
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
              console.log('🎤 Available browser voices:', voices.map(v => v.name));
            }
          };
          
          // Load voices immediately if available
          loadVoices();
          
          // Also load when voices change
          speechSynthesis.addEventListener('voiceschanged', loadVoices);
        }

        // No need to initialize external services since we're using browser Speech Recognition API
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize services:', error);
        setVideoState(prev => ({
          ...prev,
          error: 'Failed to initialize voice services'
        }));
      }
    };

    initializeServices();

    // Cleanup function to stop voice activities when component unmounts
    return () => {
      console.log('🧹 Component unmounting - cleaning up voice activities...');
      cleanupVoiceActivities();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVoiceDetection();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [stopVoiceDetection]);

  // Screen sharing functions
  const startScreenShare = async () => {
    try {
      setVideoState(prev => ({ ...prev, error: null }));
      
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      setIsScreenShared(true);
    } catch (error) {
      console.error('Error starting screen share:', error);
      setVideoState(prev => ({
        ...prev,
        error: 'Failed to start screen sharing. Please check permissions.'
      }));
    }
  };

  const stopScreenShare = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScreenShared(false);
    setVideoState(prev => ({ ...prev, isRecording: false }));
  };

  // Recording functions
  const startRecording = () => {
    if (!streamRef.current || isRecordingRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      isRecordingRef.current = true;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        chunksRef.current = [];
        isRecordingRef.current = false;
        
        // Check if we were waiting for transcription
        if (isWaitingForTranscriptionRef.current) {
          console.log('🎤 Video recording stopped while waiting for transcription, securing recording...');
          console.log('🎤 Original video blob size:', blob.size);
          
          // Step 1: Secure the recording immediately by creating a stable copy
          console.log('🔒 Securing recording - creating stable copy...');
          secureVideoBlobRef.current = new Blob([blob], { type: 'video/webm' });
          secureVideoUrlRef.current = URL.createObjectURL(secureVideoBlobRef.current);
          
          // Store both original and secure copies
          pendingVideoBlobRef.current = blob;
          pendingVideoUrlRef.current = videoUrl;
          
          console.log('🔒 Secure copy created - blob size:', secureVideoBlobRef.current.size);
          console.log('🔒 Pending data stored - blob:', !!pendingVideoBlobRef.current, 'url:', !!pendingVideoUrlRef.current);
          console.log('🔒 Secure data stored - blob:', !!secureVideoBlobRef.current, 'url:', !!secureVideoUrlRef.current);
          
          return; // Don't analyze yet, wait for transcription
        }
        
        // Check if this recording should be analyzed based on voice duration
        const shouldAnalyze = (mediaRecorder as MediaRecorder & { shouldAnalyze?: boolean; spokenText?: string }).shouldAnalyze;
        const spokenText = (mediaRecorder as MediaRecorder & { shouldAnalyze?: boolean; spokenText?: string }).spokenText || '';
        
        console.log('🎤 Video recording stopped - shouldAnalyze:', shouldAnalyze, 'spokenText:', spokenText);
        console.log('🎤 isWaitingForTranscriptionRef.current:', isWaitingForTranscriptionRef.current);
        console.log('🎤 isProcessingSpeechRef.current:', isProcessingSpeechRef.current);
        console.log('🎤 currentSpokenTextRef.current:', currentSpokenTextRef.current);
        
        if (shouldAnalyze) {
          console.log('Voice duration sufficient, checking if transcription is complete...');
          console.log('🎤 Spoken text for analysis:', spokenText);
          
          // ALWAYS wait for transcription if we're in waiting mode
          if (isWaitingForTranscriptionRef.current || isProcessingSpeechRef.current) {
            console.log('🎤 Still waiting for transcription, storing video data...');
            pendingVideoBlobRef.current = blob;
            pendingVideoUrlRef.current = videoUrl;
            setLastRecordingStatus('Processing speech...');
            return; // Don't analyze yet
          }
          
          // If transcription is complete, analyze now
          if (spokenText && spokenText.trim()) {
            console.log('🎤 Transcription complete, analyzing video with:', spokenText);
            setLastRecordingStatus('Analyzing video...');
            setSpokenText(spokenText);
            await addVideoToChat(blob, videoUrl, spokenText);
          } else {
            console.log('🎤 No transcribed text available, using generic analysis...');
            setLastRecordingStatus('Analyzing video...');
            setSpokenText('');
            await addVideoToChat(blob, videoUrl, '');
          }
        } else {
          console.log('Voice duration too short, discarding video...');
          setLastRecordingStatus('Recording too short (< 1s), discarded');
          // Clean up the video URL since we're not using it
          URL.revokeObjectURL(videoUrl);
          // Clear status after 3 seconds
          setTimeout(() => setLastRecordingStatus(''), 3000);
        }
      };

      mediaRecorder.start(1000);
      setVideoState(prev => ({ ...prev, isRecording: true }));
    } catch (error) {
      console.error('Error starting recording:', error);
      setVideoState(prev => ({
        ...prev,
        error: 'Failed to start recording'
      }));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      mediaRecorderRef.current.stop();
      setVideoState(prev => ({ ...prev, isRecording: false }));
    }
  };

  // Add video to chat and analyze with Gemini
  const addVideoToChat = async (videoBlob: Blob, videoUrl: string, spokenText?: string) => {
    const messageId = Date.now().toString();
    
    // Add video message to chat
    const videoMessage: ChatMessage = {
      id: messageId,
      type: 'video',
      content: spokenText && spokenText.trim() ? `"${spokenText.trim()}"` : 'Screen recording',
      videoUrl: videoUrl,
      videoBlob: videoBlob,
      timestamp: new Date(),
      isUser: true
    };
    
    setChatMessages(prev => [...prev, videoMessage]);
    setIsAnalyzing(true);
    
      try {
        // Create focused prompt based on spoken text
        console.log('🔍 Debug - spokenText received:', spokenText);
        console.log('🔍 Debug - spokenText length:', spokenText?.length);
        console.log('🔍 Debug - spokenText trimmed:', spokenText?.trim());
        const userRequest = spokenText && spokenText.trim();
        
        const analysisPrompt = userRequest
          ? `Based on the user's spoken request: "${userRequest}", analyze this screen recording and provide a concise, specific response focused on what they asked about.

IMPORTANT INSTRUCTIONS:
- Be concise and direct in your response
- If the user is asking "how to do something" or "how should this be done", provide clear step-by-step instructions
- If they're asking about a specific element, focus only on that element
- If they're asking for analysis, provide specific insights about what you see
- Format your response in clear markdown with proper headings, bullet points, and code blocks where appropriate
- Keep the response focused and actionable

Analyze the screen recording and provide a helpful, specific response to their request.`
          : 'Analyze this screen recording and provide detailed insights about what you see. Describe the content, identify any important elements, and provide helpful observations about the interface or content. Format your response in clear markdown.';
        
        console.log('🎯 Analysis prompt:', analysisPrompt);
        
        // Analyze video with Gemini
        await videoAnalysisService.analyzeVideoWithProgress({
          video: videoBlob,
          prompt: analysisPrompt,
          filename: `screen-recording-${messageId}.webm`
        }, {
        onProgress: (progress) => {
          console.log(`Video analysis progress: ${progress}%`);
        },
        onComplete: async (response) => {
          // Add AI response to chat
          const aiMessage: ChatMessage = {
            id: `${messageId}-ai`,
            type: 'text',
            content: response.analysis || 'No analysis available',
            timestamp: new Date(),
            isUser: false
          };
          
                      setChatMessages(prev => [...prev, aiMessage]);
                      setIsAnalyzing(false);
                      setLastRecordingStatus(''); // Clear status when analysis completes

                      // Update video message with analysis
                      setChatMessages(prev => prev.map(msg =>
                        msg.id === messageId
                          ? { ...msg, geminiAnalysis: response.analysis }
                          : msg
                      ));

          // Speak the response
          if (isInitialized && response.analysis) {
            console.log('🔊 Attempting TTS with text:', response.analysis.substring(0, 100) + '...');
            await speakText(response.analysis);
          } else {
            console.log('⚠️ TTS skipped - isInitialized:', isInitialized, 'hasAnalysis:', !!response.analysis);
          }
        },
        onError: (error) => {
          console.error('Video analysis error:', error);
          const errorMessage: ChatMessage = {
            id: `${messageId}-error`,
            type: 'text',
            content: `Analysis failed: ${error}`,
            timestamp: new Date(),
            isUser: false
          };
          
          setChatMessages(prev => [...prev, errorMessage]);
          setIsAnalyzing(false);
        }
      });
    } catch (error) {
      console.error('Error analyzing video:', error);
      const errorMessage: ChatMessage = {
        id: `${messageId}-error`,
        type: 'text',
        content: 'Failed to analyze video',
        timestamp: new Date(),
        isUser: false
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
      setIsAnalyzing(false);
    }
  };


  // Voice interaction function (for voice detection only, not responses)
  const toggleTalkingMode = async () => {
    if (!isInitialized) {
      setVideoState(prev => ({
        ...prev,
        error: 'Voice services not initialized yet. Please wait a moment.'
      }));
      return;
    }

    try {
      if (videoState.isListening) {
        // Stop talking mode
        // No need to stop Gemini Live recording since we're not using it
        stopVoiceDetection();
        setVideoState(prev => ({
          ...prev,
          isListening: false,
          isTalking: false,
          error: null
        }));
      } else {
        // Start talking mode (voice detection only)
        setVideoState(prev => ({ ...prev, error: null, isConnecting: true }));
        
        // Start voice detection with a small delay (no Gemini Live needed)
        setTimeout(async () => {
          try {
            await startVoiceDetection();
            setVideoState(prev => ({
              ...prev,
              isListening: true,
              isTalking: true,
              isConnecting: false
            }));
            console.log('🎤 Voice detection started - will only trigger screen recording, no voice responses');
          } catch (voiceError) {
            console.error('Error starting voice detection:', voiceError);
            setVideoState(prev => ({
              ...prev,
              error: 'Failed to start voice detection. Please check microphone permissions.',
              isConnecting: false
            }));
          }
        }, 1000); // 1 second delay
      }
    } catch (error) {
      console.error('Error toggling talking mode:', error);
      setVideoState(prev => ({
        ...prev,
        error: 'Failed to connect to voice service. Please try again.'
      }));
    }
  };

  // Cleanup function to stop all voice activities
  const cleanupVoiceActivities = () => {
    try {
      console.log('🧹 Cleaning up voice activities...');
      
      // Stop speech synthesis immediately
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        console.log('🔇 Cancelled speech synthesis');
      }
      
      // Stop recording and voice detection
      stopRecording();
      stopVoiceDetection();
      
      // Reset all voice states
      setIsSpeaking(false);
      setVideoState(prev => ({
        ...prev,
        isListening: false,
        isRecording: false,
        isSpeaking: false,
        isTalking: false,
        isConnecting: false
      }));
      
      console.log('✅ Voice cleanup completed');
    } catch (error) {
      console.error('❌ Error during voice cleanup:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* App Header */}
      <AppHeader />

      {/* Main Content */}
      <div className="pt-20 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              SAINTSAL™
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Web Assistant
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Share your screen and get AI-powered insights with voice interaction
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chat Area */}
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">AI Video Chat</h2>
              </div>
              
              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto space-y-4 mb-6">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Start talking to begin the conversation!</p>
                    <p className="text-sm mt-2">Your screen recordings will be analyzed by AI</p>
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          message.isUser
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'bg-white/10 backdrop-blur-md border border-white/20 text-gray-300'
                        }`}
                      >
                        {message.type === 'video' ? (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Video className="w-4 h-4" />
                              <span className="text-sm font-medium">Screen Recording</span>
                            </div>
                            <video
                              src={message.videoUrl}
                              controls
                              className="w-full h-32 object-contain bg-black rounded-lg"
                            />
                            {message.geminiAnalysis && (
                              <div className="mt-2 text-xs opacity-75">
                                ✓ Analyzed by Gemini
                              </div>
                            )}
                          </div>
                                    ) : (
                                      <div>
                                        {message.isUser ? (
                                          <p className="whitespace-pre-wrap">{message.content}</p>
                                        ) : (
                                          <MarkdownRenderer content={message.content} />
                                        )}
                                        <div className="text-xs opacity-75 mt-1">
                                          {message.timestamp.toLocaleTimeString()}
                                        </div>
                                      </div>
                                    )}
                      </div>
                    </div>
                  ))
                )}
                
                            {/* Analyzing indicator */}
                            {isAnalyzing && (
                              <div className="flex justify-start">
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 text-gray-300 px-4 py-3 rounded-2xl">
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                    <span>Analyzing video with Gemini (will format response in markdown)...</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Recording status indicator */}
                            {lastRecordingStatus && (
                              <div className="flex justify-center">
                                <div className={`px-4 py-2 rounded-xl text-sm ${
                                  lastRecordingStatus.includes('discarded') 
                                    ? 'bg-orange-500/20 backdrop-blur-md border border-orange-400/30 text-orange-300'
                                    : 'bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-blue-300'
                                }`}>
                                  {lastRecordingStatus}
                                </div>
                              </div>
                            )}
              </div>
            </div>

              {/* Controls Panel */}
              <div className="space-y-6">
                {/* Screen Capture */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Video className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Screen Capture</h3>
                </div>
                
                {/* Video Preview */}
                <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-32 object-contain"
                  />
                  {videoState.isRecording && (
                    <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Recording
                    </div>
                  )}
                </div>

                {/* Screen Share Controls */}
                {!isScreenShared ? (
                  <Button 
                    onClick={startScreenShare} 
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Video className="w-4 h-4" />
                    Start Screen Share
                  </Button>
                ) : (
                  <Button 
                    onClick={stopScreenShare} 
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <VideoOff className="w-4 h-4" />
                    Stop Screen Share
                  </Button>
                )}
              </div>

              {/* Voice Controls */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Voice Detection</h3>
                </div>
                
                <Button
                  onClick={toggleTalkingMode}
                  disabled={!isInitialized || videoState.isSpeaking || videoState.isConnecting}
                  className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${
                    videoState.isConnecting
                      ? 'bg-yellow-500/20 backdrop-blur-md border border-yellow-400/30 text-yellow-300'
                      : videoState.isListening 
                      ? 'bg-white/10 backdrop-blur-md border border-red-400/30 text-red-300 hover:bg-red-500/20 hover:border-red-400/50' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                  }`}
                >
                  {videoState.isConnecting ? (
                    <div className="w-4 h-4 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
                  ) : videoState.isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                  {videoState.isConnecting 
                    ? 'Connecting...' 
                    : videoState.isListening 
                    ? 'Stop Detection' 
                    : 'Start Detection'
                  }
                </Button>

                {/* Status Indicators */}
                <div className="mt-4 space-y-2">
                  {videoState.isConnecting && (
                    <div className="bg-yellow-500/20 backdrop-blur-md border border-yellow-400/30 text-yellow-300 px-3 py-2 rounded-lg text-sm">
                      Connecting
                    </div>
                  )}
                  {videoState.isListening && (
                    <div className="bg-green-500/20 backdrop-blur-md border border-green-400/30 text-green-300 px-3 py-2 rounded-lg text-sm">
                      Listening
                    </div>
                  )}
                  {videoState.isTalking && (
                    <div className="bg-orange-500/20 backdrop-blur-md border border-orange-400/30 text-orange-300 px-3 py-2 rounded-lg text-sm">
                      Talking
                    </div>
                  )}
                  {videoState.isRecording && (
                    <div className="bg-red-500/20 backdrop-blur-md border border-red-400/30 text-red-300 px-3 py-2 rounded-lg text-sm">
                      Recording
                    </div>
                  )}
                  {videoState.isSpeaking && (
                    <div className="bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-blue-300 px-3 py-2 rounded-lg text-sm">
                      Speaking
                    </div>
                  )}
                  {isSpeaking && (
                    <div className="bg-purple-500/20 backdrop-blur-md border border-purple-400/30 text-purple-300 px-3 py-2 rounded-lg text-sm">
                      AI Speaking
                    </div>
                  )}
                  {isTranscribing && (
                    <div className="bg-cyan-500/20 backdrop-blur-md border border-cyan-400/30 text-cyan-300 px-3 py-2 rounded-lg text-sm">
                      Transcribing Speech
                    </div>
                  )}
                  {spokenText && (
                    <div className="bg-green-500/20 backdrop-blur-md border border-green-400/30 text-green-300 px-3 py-2 rounded-lg text-sm">
                      🎤 Captured: &quot;{spokenText}&quot;
                    </div>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {videoState.error && (
                <div className="bg-red-500/20 backdrop-blur-md border border-red-400/30 text-red-300 px-4 py-3 rounded-xl">
                  {videoState.error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}