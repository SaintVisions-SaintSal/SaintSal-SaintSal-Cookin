"use client";

import React, { useState, useEffect, useRef } from 'react';

// Speech Recognition types
declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
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

import * as motion from "motion/react-client";
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { warroomService, type ChatMessage, type StreamingChatCallbacks, type AIProvider, type AIStreamingCallbacks, type DualAIStreamingCallbacks } from '@/services/warroomService';
import FileUpload from '@/components/FileUpload';
import { fileUploadService, type UploadedFile } from '@/services/fileUploadService';
import { supabase, checkAndIncrementRequestCount, getRequestStatus } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import ThinkingAgentModal from '@/components/ThinkingAgentModal';
import AppHeader from '@/components/AppHeader';
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  FileText,
  Volume2,
  Sparkles,
  MessageCircle,
  Loader2,
  X,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChefHat,
  BookOpen,
  Lightbulb,
  Coffee,
  Camera,
  Music,
  Gamepad2,
  Car,
  Home,
  ArrowLeft,
  Brain,
  User
} from "lucide-react";

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isClaudeLoading?: boolean;
  isGPT5Loading?: boolean;
  isStreaming?: boolean;
  currentStep?: 'claude' | 'gpt' | 'complete';
}

// User-centric ice-breaker suggestions
const iceBreakerSuggestions = [
  {
    id: 'cooking-ramen',
    title: 'How to make ramen',
    description: 'Learn to cook perfect ramen at home',
    icon: ChefHat,
    color: 'orange',
    prompt: 'Teach me how to make delicious ramen at home'
  },
  {
    id: 'social-skills',
    title: 'How to talk to anyone',
    description: 'Improve your conversation skills',
    icon: MessageCircle,
    color: 'blue',
    prompt: 'Give me tips on how to talk to anyone and start conversations'
  },
  {
    id: 'learn-skill',
    title: 'Learn a new skill',
    description: 'Discover what you can learn today',
    icon: BookOpen,
    color: 'green',
    prompt: 'What new skill should I learn and how do I get started?'
  },
  {
    id: 'creative-ideas',
    title: 'Creative project ideas',
    description: 'Get inspired with creative projects',
    icon: Lightbulb,
    color: 'yellow',
    prompt: 'Give me some creative project ideas I can work on'
  },
  {
    id: 'coffee-brewing',
    title: 'Perfect coffee brewing',
    description: 'Master the art of coffee making',
    icon: Coffee,
    color: 'brown',
    prompt: 'Teach me how to brew the perfect cup of coffee'
  },
  {
    id: 'photography-tips',
    title: 'Photography tips',
    description: 'Improve your photography skills',
    icon: Camera,
    color: 'purple',
    prompt: 'Give me photography tips for better photos'
  },
  {
    id: 'music-recommendations',
    title: 'Music recommendations',
    description: 'Discover new music and artists',
    icon: Music,
    color: 'pink',
    prompt: 'Recommend some great music I should listen to'
  },
  {
    id: 'gaming-strategy',
    title: 'Gaming strategies',
    description: 'Level up your gaming skills',
    icon: Gamepad2,
    color: 'indigo',
    prompt: 'Give me gaming tips and strategies'
  },
  {
    id: 'car-maintenance',
    title: 'Car maintenance',
    description: 'Keep your car in top condition',
    icon: Car,
    color: 'red',
    prompt: 'Teach me basic car maintenance tips'
  },
  {
    id: 'home-organization',
    title: 'Home organization',
    description: 'Organize and declutter your space',
    icon: Home,
    color: 'teal',
    prompt: 'Help me organize and declutter my home'
  }
];

// Function to get 5 random ice-breaker suggestions
const getRandomIceBreakers = (): typeof iceBreakerSuggestions => {
  const shuffled = [...iceBreakerSuggestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
};

const AI_MODELS = [
  { id: 'gpt', name: 'GPT-5', description: 'For complex analysis', fullDescription: 'Best for deep reasoning and complex tasks' },
  { id: 'claude', name: 'CLAUDE', description: 'For everything (fast and responsive)', fullDescription: 'Fast, reliable, and high-quality responses' },
  { id: 'gemini', name: 'GEMINI', description: 'For vision and documents', fullDescription: 'Excellent for image analysis and document processing' },
  { id: 'dual', name: 'DUAL AI', description: 'For complex tasks (uses more tokens)', fullDescription: 'Claude + GPT-4o - Most comprehensive answers' }
];

export default function ChatPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState({ remainingRequests: 0, isAnonymous: false, maxRequests: 2 });
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const getWelcomeMessage = () => {
    return `**Hello! I'm your AI Assistant**\n\nI'm here to help you with anything you need - from cooking tips to life advice, creative projects to learning new skills. What would you like to explore today?`;
  };

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
          // Get request status for anonymous users
          const status = await getRequestStatus();
          setRequestStatus(status);
        } else {
          router.push('/auth');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/auth');
      } else if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: getWelcomeMessage(),
      timestamp: Date.now()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('dual');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isFilesExpanded, setIsFilesExpanded] = useState(false);
  const [dualAIStatus, setDualAIStatus] = useState<{
    step: string;
    message: string;
    isProcessing: boolean;
  }>({ step: '', message: '', isProcessing: false });
  const [fallbackMessage, setFallbackMessage] = useState<string>('');
  const [currentIceBreakers, setCurrentIceBreakers] = useState<typeof iceBreakerSuggestions>([]);
  const [showIceBreakers, setShowIceBreakers] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showThinkingAgent, setShowThinkingAgent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const iceBreakerScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sync uploaded files with service
  useEffect(() => {
    setUploadedFiles(fileUploadService.getAllFiles());
  }, []);

  // Initialize ice-breakers on load
  useEffect(() => {
    setCurrentIceBreakers(getRandomIceBreakers());
  }, []);

  // Check scroll position when ice-breakers change
  useEffect(() => {
    if (showIceBreakers && currentIceBreakers.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        checkScrollPosition();
      }, 100);
    }
  }, [showIceBreakers, currentIceBreakers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showModelDropdown && modelDropdownRef.current) {
        const target = event.target as HTMLElement;
        if (!modelDropdownRef.current.contains(target)) {
          setShowModelDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModelDropdown]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for speech recognition support
      const SpeechRecognitionAPI = (window as Window & typeof globalThis).webkitSpeechRecognition || 
                                    (window as Window & typeof globalThis).SpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        const speechRecognition = new SpeechRecognitionAPI();
        speechRecognition.continuous = false;
        speechRecognition.interimResults = false;
        speechRecognition.lang = 'en-US';
        
        speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(prev => prev + transcript);
          setIsRecording(false);
        };
        
        speechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
        };
        
        speechRecognition.onend = () => {
          setIsRecording(false);
        };
        
        setRecognition(speechRecognition);
      }
    }
    
    // Cleanup function
    return () => {
      // Access recognition from closure instead of dependency
    };
  }, []); // Empty dependency array - only run once on mount

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Image 
              src="/logo.png" 
              alt="SaintSal™ Logo" 
              width={64}
              height={64}
              className="w-16 h-16 rounded-2xl"
            />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Loading Chat...</h2>
          <p className="text-gray-400">Please wait while we verify your access</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect to /auth
  }

  // Handle ice-breaker selection
  const handleIceBreakerSelect = (iceBreaker: typeof iceBreakerSuggestions[0]) => {
    setInputMessage(iceBreaker.prompt);
    setShowIceBreakers(false); // Hide ice-breakers when one is selected
  };

  // Check scroll position for ice-breaker arrows
  const checkScrollPosition = () => {
    if (iceBreakerScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = iceBreakerScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Scroll ice-breakers left
  const scrollIceBreakersLeft = () => {
    if (iceBreakerScrollRef.current) {
      iceBreakerScrollRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  // Scroll ice-breakers right
  const scrollIceBreakersRight = () => {
    if (iceBreakerScrollRef.current) {
      iceBreakerScrollRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isAILoading) return;

    // Check request limits for anonymous users
    const requestCheck = await checkAndIncrementRequestCount();
    if (!requestCheck.canMakeRequest) {
      setShowUpgradePrompt(true);
      return;
    }

    // Update request status
    setRequestStatus(prev => ({
      ...prev,
      remainingRequests: requestCheck.remainingRequests
    }));

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: Date.now()
    };

    const currentMessage = inputMessage;
    setInputMessage('');
    
    // Hide ice-breakers when first message is sent
    const isFirstUserMessage = messages.length <= 1; // Only welcome message exists
    if (isFirstUserMessage) {
      setShowIceBreakers(false);
    }
    
    setIsAILoading(true);

    // Create assistant message placeholder
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    };

    // Add both user and assistant messages at once
    setMessages(prev => [...prev, userMessage, assistantMessage]);

    // Prepare messages for API (use current messages + user message)
    // Filter out empty or error messages to prevent API issues
    const apiMessages: ChatMessage[] = [
      ...messages
        .filter(msg => {
          // Keep user messages
          if (msg.role === 'user') return true;
          // For assistant messages, only keep those with meaningful content
          if (msg.role === 'assistant') {
            const content = msg.content?.trim();
            return content && 
                   content.length > 0 && 
                   !content.startsWith('Sorry, I encountered an error:') &&
                   !content.includes('No response generated') &&
                   content !== '\n' &&
                   content !== ' ';
          }
          return true;
        })
        .map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: currentMessage }
    ];

    // Build context files from uploaded files
    const contextFiles = fileUploadService.getCombinedContext();
    const hasFiles = uploadedFiles.length > 0;
    
    // Add system prompt with file context
    let systemPrompt = `You are SAINTSAL™ AI Assistant, ready to help with any question or task.

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
1. Keep responses helpful, friendly, and engaging
2. Be conversational and approachable
3. If context files are provided, always reference them first and relate your response to the context before thinking outside the box
4. Be concise but thorough in your responses
5. Feel free to be creative and inspiring

CONTEXT AWARENESS:
- When context files are available, analyze them first and base your response on their content
- Reference specific details from the context files when relevant
- Only expand beyond the context when the user asks for broader insights
- When the user mentions "this file", "the file", "these files", "the attached files", or "the uploaded files", they are referring to the files in the context below`;

    // Add file context to system prompt if files are uploaded
    if (hasFiles && contextFiles) {
      systemPrompt += `\n\n=== UPLOADED FILES CONTEXT ===\nThe user has uploaded ${uploadedFiles.length} file(s). Below is the content of all uploaded files:\n\n${contextFiles}\n\n=== END OF FILES CONTEXT ===\n\nIMPORTANT: When the user asks about "the file" or "these files", they are referring to the files shown above. Always analyze and reference these files when the user asks questions about them.`;
    }

    apiMessages.unshift({
      role: 'system',
      content: systemPrompt
    });

    const callbacks: StreamingChatCallbacks = {
      onChunk: (chunk: string) => {
        // This will be handled by the dual AI onChunk callback for dual AI mode
        // For single AI modes, this will still work
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: msg.content + chunk }
            : msg
        ));
      },
      onComplete: () => {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, isStreaming: false }
            : msg
        ));
        setIsAILoading(false);
      },
      onError: (error: string) => {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: `Sorry, I encountered an error: ${error}`, isStreaming: false }
            : msg
        ));
        setIsAILoading(false);
      }
    };

    try {
      if (selectedModel === 'dual') {
        // Use dual AI streaming
        const dualAICallbacks: DualAIStreamingCallbacks = {
          onStart: () => {
            setDualAIStatus({ step: 'Starting', message: 'Initializing dual AI...', isProcessing: true });
          },
          onStep: (step: string, message: string) => {
            setDualAIStatus({ step, message, isProcessing: true });
          },
          onStepComplete: (step: string, duration: number) => {
            console.log(`${step} completed in ${duration}ms`);
          },
          onChunk: (content: string, isComplete: boolean) => {
            // The content parameter already contains the full accumulated content
            // Use requestAnimationFrame for smooth UI updates
            requestAnimationFrame(() => {
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMessage.id 
                  ? { ...msg, content: content, isStreaming: !isComplete }
                  : msg
              ));
            });
          },
          onComplete: () => {
            setDualAIStatus({ step: '', message: '', isProcessing: false });
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, isStreaming: false }
                : msg
            ));
            setIsAILoading(false);
          },
          onError: (error: string) => {
            setDualAIStatus({ step: '', message: '', isProcessing: false });
            setFallbackMessage('Dual AI failed, switching to single AI mode...');
            console.error('Dual AI failed, falling back to single AI mode:', error);
            
            // Clear fallback message after 3 seconds
            setTimeout(() => setFallbackMessage(''), 3000);
            
            // Fallback to single AI mode
            const providerMap: { [key: string]: AIProvider } = {
              'gpt': 'openai',
              'claude': 'anthropic',
              'gemini': 'gemini'
            };
            const provider = providerMap['gpt'] || 'openai';
            
            const aiCallbacks: AIStreamingCallbacks = {
              onChunk: callbacks.onChunk,
              onComplete: callbacks.onComplete,
              onError: callbacks.onError
            };

            warroomService.getAIStreaming(provider, apiMessages, aiCallbacks);
          }
        };
        
        // Note: contextFiles is already built above and included in the system prompt
        await warroomService.getDualAIStreaming(apiMessages, dualAICallbacks, '', 0.7);
      } else {
        // Map selected model to AI provider
        const providerMap: { [key: string]: AIProvider } = {
          'gpt': 'openai',
          'claude': 'anthropic',
          'gemini': 'gemini'
        };

        const provider = providerMap[selectedModel] || 'openai';
        
        // Use direct AI streaming with environment variables
        const aiCallbacks: AIStreamingCallbacks = {
          onChunk: callbacks.onChunk,
          onComplete: callbacks.onComplete,
          onError: callbacks.onError
        };

        await warroomService.getAIStreaming(provider, apiMessages, aiCallbacks);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: 'Sorry, I encountered an error. Please try again.', isStreaming: false }
          : msg
      ));
      setIsAILoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = async (file: File) => {
    console.log('Chat: File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file using the new service
      console.log('Chat: Calling fileUploadService.uploadFile');
      const uploadedFile = await fileUploadService.uploadFile(file);
      console.log('Chat: Upload result:', uploadedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadedFile.textContent && !uploadedFile.error) {
        // Update uploaded files list
        setUploadedFiles(prev => [...prev, uploadedFile]);
        
        // Show success toast and close modal
        showToast(`File uploaded successfully: ${file.name}`, 'success');
        setShowFileUpload(false);
        setSelectedFile(null);
      } else {
        // Show error toast and keep modal open
        showToast(`Upload failed: ${uploadedFile.error || 'Unknown error'}`, 'error');
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('File upload error:', error);
      showToast('Failed to upload file', 'error');
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    // Clear the last uploaded file from the service
    const files = fileUploadService.getAllFiles();
    if (files.length > 0) {
      fileUploadService.removeFile(files[files.length - 1].id);
      setUploadedFiles(fileUploadService.getAllFiles());
    }
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* App Header */}
      <AppHeader />
      
      {/* Top Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/20 p-4 flex-shrink-0 relative z-[100] mt-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">AI CHAT</h1>
              <p className="text-xs text-gray-400">Your Personal AI Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Request Counter for Anonymous Users */}
            {requestStatus.isAnonymous && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-blue-400 text-xs font-medium">
                  {requestStatus.remainingRequests === -1 
                    ? 'Unlimited' 
                    : `${requestStatus.remainingRequests} requests left`
                  }
                </span>
              </div>
            )}

            {/* Think Mode Button */}
            <motion.button
              onClick={() => setShowThinkingAgent(true)}
              className="p-2 bg-black border border-yellow-500/30 rounded-lg hover:bg-gray-900/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Think Mode"
            >
              <Brain size={16} className="text-yellow-400" />
            </motion.button>

      
            {/* Fallback Message */}
            {fallbackMessage && (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-yellow-400 text-xs font-medium">{fallbackMessage}</span>
              </div>
            )}
            
            {/* AI Model Selector Dropdown */}
            <div className="relative" ref={modelDropdownRef}>
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-white/20 rounded-lg hover:bg-gray-700/50 transition-all duration-300"
              >
                <span className="text-yellow-400 font-bold text-xs">AI MODEL:</span>
                <span className="text-white text-xs font-medium">
                  {AI_MODELS.find(m => m.id === selectedModel)?.name}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {showModelDropdown && (
                <motion.div
                  className="fixed right-4 top-16 w-80 bg-black border-2 border-white/30 rounded-xl shadow-2xl"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ zIndex: 99999 }}
                >
                  <div className="p-2">
                    {AI_MODELS.map((model) => (
                      <motion.button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setShowModelDropdown(false);
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-300 mb-1 ${
                          selectedModel === model.id
                            ? 'bg-yellow-400/20 border border-yellow-400/50'
                            : 'hover:bg-white/10 border border-transparent'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className={`font-bold text-sm ${
                            selectedModel === model.id ? 'text-yellow-400' : 'text-white'
                          }`}>
                            {model.name}
                          </span>
                          {selectedModel === model.id && (
                            <CheckCircle size={16} className="text-yellow-400" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{model.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 chat-scrollbar"
        >
          {messages.map((message) => {
            // Special rendering for welcome message
            if (message.id === 'welcome') {
              return (
                <motion.div
                  key={message.id}
                  className="flex justify-center items-center py-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center max-w-2xl">
                    <div className="font-montserrat text-4xl font-bold text-white mb-4">
                      {message.content.split('\n\n')[0].replace(/\*\*/g, '')}
                    </div>
                    <div className="font-montserrat text-lg text-gray-300 font-light">
                      {message.content.split('\n\n')[1]}
                    </div>
                  </div>
                </motion.div>
              );
            }

            // Regular chat bubble rendering
            return (
              <motion.div
                key={message.id}
                className={`flex items-start gap-3 w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Avatar for assistant (left side) */}
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gray-700/50 border border-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <Image 
                      src="/logo.png" 
                      alt="Saintsal Logo" 
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full"
                    />
                  </div>
                )}

                <div
                  className={`max-w-lg p-3 rounded-xl ${
                    message.role === 'user'
                      ? 'bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 text-white'
                      : 'bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 text-white'
                  }`}
                >
                <div className="text-sm">
                  {message.content ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Headings
                          h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-white">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-white">{children}</h3>,
                          
                          // Paragraphs
                          p: ({ children }) => <p className="mb-2 last:mb-0 text-gray-300">{children}</p>,
                          
                          // Lists
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-gray-300">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-gray-300">{children}</ol>,
                          li: ({ children }) => <li className="text-gray-300">{children}</li>,
                          
                          // Text formatting
                          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                          em: ({ children }) => <em className="italic text-gray-200">{children}</em>,
                          
                          // Code
                          code: ({ children }) => <code className="bg-gray-700 px-1 py-0.5 rounded text-xs text-green-400">{children}</code>,
                          pre: ({ children }) => <pre className="bg-gray-800 p-3 rounded-lg overflow-x-auto text-xs text-green-400 mb-2">{children}</pre>,
                          
                          // Blockquotes
                          blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-300 mb-2">{children}</blockquote>,
                          
                          // Links
                          a: ({ children, href }) => <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                          
                          // Tables (from remark-gfm)
                          table: ({ children }) => <table className="border-collapse border border-gray-600 mb-2">{children}</table>,
                          thead: ({ children }) => <thead className="bg-gray-700">{children}</thead>,
                          tbody: ({ children }) => <tbody>{children}</tbody>,
                          tr: ({ children }) => <tr className="border-b border-gray-600">{children}</tr>,
                          th: ({ children }) => <th className="border border-gray-600 px-2 py-1 text-left font-semibold text-white">{children}</th>,
                          td: ({ children }) => <td className="border border-gray-600 px-2 py-1 text-gray-300">{children}</td>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : message.isStreaming ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-yellow-400" />
                      <span className="text-gray-400 text-xs">
                        {dualAIStatus.isProcessing && dualAIStatus.step ? 
                          `${dualAIStatus.step}: ${dualAIStatus.message}` : 
                          'Thinking...'
                        }
                      </span>
                    </div>
                  ) : (
                    <p className="mb-0 text-gray-400 text-xs">No response yet...</p>
                  )}
                </div>
                
                {message.role === 'assistant' && message.content && (
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-white transition-colors">
                        <Volume2 size={12} />
                      </button>
                      <span className="text-xs text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar for user (right side) */}
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-700/50 border border-white/20 flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-gray-300" />
                </div>
              )}
            </motion.div>
            );
          })}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/20 flex-shrink-0">
          {/* Ice-Breaker Suggestions */}
          {showIceBreakers && (
            <div className="mb-4">
              <div className="relative py-2">
                {/* Left Arrow */}
                {canScrollLeft && (
                  <motion.button
                    onClick={scrollIceBreakersLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-gray-800/90 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center hover:bg-gray-700/90 transition-all duration-200 shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <ChevronLeft size={16} className="text-white" />
                  </motion.button>
                )}

                {/* Right Arrow */}
                {canScrollRight && (
                  <motion.button
                    onClick={scrollIceBreakersRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-gray-800/90 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center hover:bg-gray-700/90 transition-all duration-200 shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    <ChevronRight size={16} className="text-white" />
                  </motion.button>
                )}

                {/* Ice-Breaker Cards */}
                <div 
                  ref={iceBreakerScrollRef}
                  className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide overflow-y-visible"
                  onScroll={checkScrollPosition}
                >
                  {currentIceBreakers.map((iceBreaker) => (
                    <motion.button
                      key={iceBreaker.id}
                      onClick={() => handleIceBreakerSelect(iceBreaker)}
                      className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] min-w-[280px] ${
                        iceBreaker.color === 'blue' ? 'border-blue-400/50 bg-blue-400/10 hover:bg-blue-400/20' :
                        iceBreaker.color === 'green' ? 'border-green-400/50 bg-green-400/10 hover:bg-green-400/20' :
                        iceBreaker.color === 'purple' ? 'border-purple-400/50 bg-purple-400/10 hover:bg-purple-400/20' :
                        iceBreaker.color === 'cyan' ? 'border-cyan-400/50 bg-cyan-400/10 hover:bg-cyan-400/20' :
                        iceBreaker.color === 'yellow' ? 'border-yellow-400/50 bg-yellow-400/10 hover:bg-yellow-400/20' :
                        iceBreaker.color === 'indigo' ? 'border-indigo-400/50 bg-indigo-400/10 hover:bg-indigo-400/20' :
                        iceBreaker.color === 'pink' ? 'border-pink-400/50 bg-pink-400/10 hover:bg-pink-400/20' :
                        iceBreaker.color === 'emerald' ? 'border-emerald-400/50 bg-emerald-400/10 hover:bg-emerald-400/20' :
                        iceBreaker.color === 'red' ? 'border-red-400/50 bg-red-400/10 hover:bg-red-400/20' :
                        iceBreaker.color === 'orange' ? 'border-orange-400/50 bg-orange-400/10 hover:bg-orange-400/20' :
                        iceBreaker.color === 'brown' ? 'border-amber-600/50 bg-amber-600/10 hover:bg-amber-600/20' :
                        iceBreaker.color === 'teal' ? 'border-teal-400/50 bg-teal-400/10 hover:bg-teal-400/20' :
                        'border-orange-400/50 bg-orange-400/10 hover:bg-orange-400/20'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          iceBreaker.color === 'blue' ? 'bg-blue-400/20' :
                          iceBreaker.color === 'green' ? 'bg-green-400/20' :
                          iceBreaker.color === 'purple' ? 'bg-purple-400/20' :
                          iceBreaker.color === 'cyan' ? 'bg-cyan-400/20' :
                          iceBreaker.color === 'yellow' ? 'bg-yellow-400/20' :
                          iceBreaker.color === 'indigo' ? 'bg-indigo-400/20' :
                          iceBreaker.color === 'pink' ? 'bg-pink-400/20' :
                          iceBreaker.color === 'emerald' ? 'bg-emerald-400/20' :
                          iceBreaker.color === 'red' ? 'bg-red-400/20' :
                          iceBreaker.color === 'orange' ? 'bg-orange-400/20' :
                          iceBreaker.color === 'brown' ? 'bg-amber-600/20' :
                          iceBreaker.color === 'teal' ? 'bg-teal-400/20' :
                          'bg-orange-400/20'
                        }`}>
                          <iceBreaker.icon size={16} className={
                            iceBreaker.color === 'blue' ? 'text-blue-400' :
                            iceBreaker.color === 'green' ? 'text-green-400' :
                            iceBreaker.color === 'purple' ? 'text-purple-400' :
                            iceBreaker.color === 'cyan' ? 'text-cyan-400' :
                            iceBreaker.color === 'yellow' ? 'text-yellow-400' :
                            iceBreaker.color === 'indigo' ? 'text-indigo-400' :
                            iceBreaker.color === 'pink' ? 'text-pink-400' :
                            iceBreaker.color === 'emerald' ? 'text-emerald-400' :
                            iceBreaker.color === 'red' ? 'text-red-400' :
                            iceBreaker.color === 'orange' ? 'text-orange-400' :
                            iceBreaker.color === 'brown' ? 'text-amber-600' :
                            iceBreaker.color === 'teal' ? 'text-teal-400' :
                            'text-orange-400'
                          } />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm mb-1 ${
                            iceBreaker.color === 'blue' ? 'text-blue-300' :
                            iceBreaker.color === 'green' ? 'text-green-300' :
                            iceBreaker.color === 'purple' ? 'text-purple-300' :
                            iceBreaker.color === 'cyan' ? 'text-cyan-300' :
                            iceBreaker.color === 'yellow' ? 'text-yellow-300' :
                            iceBreaker.color === 'indigo' ? 'text-indigo-300' :
                            iceBreaker.color === 'pink' ? 'text-pink-300' :
                            iceBreaker.color === 'emerald' ? 'text-emerald-300' :
                            iceBreaker.color === 'red' ? 'text-red-300' :
                            iceBreaker.color === 'orange' ? 'text-orange-300' :
                            iceBreaker.color === 'brown' ? 'text-amber-300' :
                            iceBreaker.color === 'teal' ? 'text-teal-300' :
                            'text-orange-300'
                          }`}>
                            {iceBreaker.title}
                          </div>
                          <div className="text-xs text-gray-400 leading-relaxed">
                            {iceBreaker.description}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="text-center mt-3">
                <span className="text-xs text-gray-500">💡 Click any suggestion to get started</span>
              </div>
            </div>
          )}
          
          {/* Collapsible Attached Files Section */}
          <div className="mt-4">
            <motion.button
              onClick={() => setIsFilesExpanded(!isFilesExpanded)}
              className={`w-full flex items-center justify-between p-2 border rounded-lg hover:bg-white/10 transition-colors ${
                uploadedFiles.length > 0 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-white/5 border-white/20'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-2">
                <FileText size={14} className={uploadedFiles.length > 0 ? "text-green-400" : "text-blue-400"} />
                <span className="text-xs text-white font-medium">
                  {uploadedFiles.length > 0 ? 'Files in Context:' : 'Attached Files:'}
                </span>
                <span className={`text-xs ${uploadedFiles.length > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                  ({uploadedFiles.length})
                </span>
                {uploadedFiles.length > 0 && (
                  <span className="text-xs text-green-400 ml-1">✓ Active</span>
                )}
              </div>
              {isFilesExpanded ? (
                <ChevronUp size={14} className="text-gray-400" />
              ) : (
                <ChevronDown size={14} className="text-gray-400" />
              )}
            </motion.button>
            
            <motion.div
              initial={false}
              animate={{ height: isFilesExpanded ? 'auto' : 0, opacity: isFilesExpanded ? 1 : 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className={`mt-2 space-y-1.5 ${uploadedFiles.length > 2 ? 'max-h-48 overflow-y-auto pr-2' : ''}`}>
                {uploadedFiles.length === 0 ? (
                  <div className="text-center py-3 text-gray-400 text-xs">
                    No files attached. Click the paperclip icon to upload files.
                  </div>
                ) : (
                  <>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 mb-2">
                      <p className="text-xs text-green-400">
                        ✓ {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} loaded into context. 
                        The AI can now reference &quot;{uploadedFiles.length === 1 ? 'this file' : 'these files'}&quot; in conversation.
                      </p>
                    </div>
                    {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2 border border-white/10">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {/* File Icon */}
                      <div className="flex-shrink-0">
                        {file.isProcessing ? (
                          <Loader2 size={14} className="text-blue-400 animate-spin" />
                        ) : file.error ? (
                          <AlertCircle size={14} className="text-red-400" />
                        ) : (
                          <CheckCircle size={14} className="text-green-400" />
                        )}
                      </div>
                      
                      {/* File Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white font-medium truncate">{file.name}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            ({Math.round(file.size / 1024)}KB)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            file.isProcessing 
                              ? 'bg-blue-900/30 text-blue-400' 
                              : file.error 
                                ? 'bg-red-900/30 text-red-400'
                                : 'bg-green-900/30 text-green-400'
                          }`}>
                            {file.isProcessing ? 'Processing...' : file.error ? 'Error' : 'Ready'}
                          </span>
                          {file.textContent && (
                            <span className="text-xs text-gray-400">
                              {file.textContent.length.toLocaleString()} chars
                            </span>
                          )}
                        </div>
                        {file.error && (
                          <div className="text-xs text-red-400 mt-0.5 truncate">
                            {file.error}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => {
                        fileUploadService.removeFile(file.id);
                        setUploadedFiles(fileUploadService.getAllFiles());
                      }}
                      className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-900/20"
                    >
                      <X size={14} />
                    </button>
                  </div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </div>
          
          {/* Input Area with proper spacing */}
          <div className="mt-6 flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full bg-gray-800/50 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white/40 transition-colors"
                disabled={isAILoading}
              />
            </div>
            
            <div className="flex items-center gap-1">
              <motion.button
                onClick={() => router.push('/voice')}
                className="p-2 bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white rounded-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Voice Assistant"
              >
                <MessageCircle size={16} />
              </motion.button>
              
              <motion.button
                onClick={() => {
                  if (isRecording) {
                    // Stop recording
                    if (recognition) {
                      recognition.stop();
                    }
                    setIsRecording(false);
                  } else {
                    // Start recording
                    if (recognition) {
                      recognition.start();
                      setIsRecording(true);
                    } else {
                      console.error('Speech recognition not available');
                    }
                  }
                }}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isRecording 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </motion.button>
              
              <motion.button
                onClick={() => setShowFileUpload(true)}
                className="p-2 bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white rounded-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Paperclip size={16} />
              </motion.button>
              
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isAILoading}
                className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send size={16} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Upload File</h3>
              <button
                onClick={() => setShowFileUpload(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <FileUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              selectedFile={selectedFile}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-md text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-black" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Upgrade Required</h3>
            <p className="text-gray-300 mb-6">
              You&apos;ve used all {requestStatus.maxRequests} free requests. 
              Sign up for unlimited access to AI Chat!
            </p>
            
            <div className="space-y-3">
              <motion.button
                onClick={() => {
                  setShowUpgradePrompt(false);
                  router.push('/auth');
                }}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-orange-500 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign Up for Free
              </motion.button>
              
              <button
                onClick={() => setShowUpgradePrompt(false)}
                className="w-full py-2 text-gray-400 hover:text-white transition-colors"
              >
                Maybe Later
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-white">What you get:</span>
              </div>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Unlimited AI requests</li>
                <li>• Full AI Chat access</li>
                <li>• All AI models (GPT-5, Claude, Dual AI)</li>
                <li>• No data collection</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Thinking Agent Modal */}
      <ThinkingAgentModal
        isOpen={showThinkingAgent}
        onClose={() => setShowThinkingAgent(false)}
        userQuery={inputMessage || "Help me with my request"}
        context={fileUploadService.getCombinedContext() || ''}
        conversationHistory={messages
          .filter(msg => {
            if (msg.role === 'user') return true;
            if (msg.role === 'assistant') {
              const content = msg.content?.trim();
              return content && 
                     content.length > 0 && 
                     !content.startsWith('Sorry, I encountered an error:') &&
                     !content.includes('No response generated') &&
                     content !== '\n' &&
                     content !== ' ';
            }
            return true;
          })
          .map(msg => ({ role: msg.role, content: msg.content }))
        }
      />
    </div>
  );
}
