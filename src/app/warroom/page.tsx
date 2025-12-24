"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

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
import { agentService, type BackendAgent } from '@/services/agentService';
import { supabase, checkAndIncrementRequestCount, getRequestStatus, getAuthToken } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import ThinkingAgentModal from '@/components/ThinkingAgentModal';
import NewAgentModal from '@/components/NewAgentModal';
import EditAgentModal from '@/components/EditAgentModal';
import DeleteAgentModal from '@/components/DeleteAgentModal';
import ImageGenerator from '@/components/ImageGenerator';
import StickyNotes from '@/components/StickyNotes';
import AppHeader from '@/components/AppHeader';
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Bot,
  Menu, 
  MessageSquare,
  Zap,
  BarChart3,
  TrendingUp,
  Building2,
  Crown,
  UserCheck,
  Tag,
  FileText,
  Volume2,
  Sparkles,
  MessageCircle,
  Target,
  Users,
  Palette,
  Loader2,
  Plus,
  X,
  HelpCircle,
  Shield,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Edit,
  ChevronLeft,
  ChevronRight,
  Brain,
  RefreshCw,
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
  isError?: boolean;
  originalUserMessage?: string;  // Store the user query that triggered this response
  isScraping?: boolean;  // Flag for URL scraping messages
}

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  type: 'enterprise' | 'founder' | 'customer' | 'white-label' | 'ai-development' | string;
  contextFiles?: string[];
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}


// Mock data
// Static agents removed - now using dynamic agents from backend

// Ice-breaker suggestions for AI interactions
const iceBreakerSuggestions = [
  {
    id: 'analyze-business',
    title: 'Analyze Business Performance',
    description: 'Get insights into your business metrics and performance',
    icon: BarChart3,
    color: 'blue',
    prompt: 'Analyze my business performance and provide key insights'
  },
  {
    id: 'develop-growth',
    title: 'Develop Growth Strategy',
    description: 'Create comprehensive growth strategies for your business',
    icon: TrendingUp,
    color: 'green',
    prompt: 'Help me develop a comprehensive growth strategy for my business'
  },
  {
    id: 'review-processes',
    title: 'Review Business Processes',
    description: 'Analyze and optimize your business processes',
    icon: Target,
    color: 'purple',
    prompt: 'Review and suggest improvements for my business processes'
  },
  {
    id: 'market-analysis',
    title: 'Market Analysis',
    description: 'Get detailed market insights and competitive analysis',
    icon: Building2,
    color: 'cyan',
    prompt: 'Provide a detailed market analysis and competitive landscape'
  },
  {
    id: 'financial-planning',
    title: 'Financial Planning',
    description: 'Create budgets, forecasts, and financial strategies',
    icon: Crown,
    color: 'yellow',
    prompt: 'Help me with financial planning and budget optimization'
  },
  {
    id: 'team-management',
    title: 'Team Management',
    description: 'Improve team productivity and management strategies',
    icon: Users,
    color: 'indigo',
    prompt: 'Suggest team management strategies and productivity improvements'
  },
  {
    id: 'innovation-ideas',
    title: 'Innovation Ideas',
    description: 'Generate creative solutions and innovative approaches',
    icon: Sparkles,
    color: 'pink',
    prompt: 'Generate innovative ideas and creative solutions for my business'
  },
  {
    id: 'customer-insights',
    title: 'Customer Insights',
    description: 'Understand customer behavior and preferences',
    icon: UserCheck,
    color: 'emerald',
    prompt: 'Analyze customer behavior and provide insights for improvement'
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment',
    description: 'Identify and mitigate potential business risks',
    icon: Shield,
    color: 'red',
    prompt: 'Conduct a comprehensive risk assessment for my business'
  },
  {
    id: 'digital-transformation',
    title: 'Digital Transformation',
    description: 'Modernize operations with digital solutions',
    icon: Zap,
    color: 'orange',
    prompt: 'Guide me through digital transformation strategies'
  }
];

// Code-related ice-breaker suggestions for Code Agent
const codeIceBreakerSuggestions = [
  {
    id: 'debug-code',
    title: 'Debug Code',
    description: 'Find and fix bugs in your code',
    icon: AlertCircle,
    color: 'red',
    prompt: 'Help me debug this code and identify the issue'
  },
  {
    id: 'optimize-performance',
    title: 'Optimize Performance',
    description: 'Improve code speed and efficiency',
    icon: Zap,
    color: 'yellow',
    prompt: 'How can I optimize this code for better performance?'
  },
  {
    id: 'refactor-code',
    title: 'Refactor Code',
    description: 'Improve code structure and readability',
    icon: RefreshCw,
    color: 'blue',
    prompt: 'Help me refactor this code to make it cleaner and more maintainable'
  },
  {
    id: 'design-pattern',
    title: 'Design Patterns',
    description: 'Learn and implement design patterns',
    icon: Brain,
    color: 'purple',
    prompt: 'Explain design patterns and when to use them'
  },
  {
    id: 'api-integration',
    title: 'API Integration',
    description: 'Integrate APIs and build endpoints',
    icon: Target,
    color: 'cyan',
    prompt: 'Help me integrate this API into my application'
  },
  {
    id: 'database-design',
    title: 'Database Design',
    description: 'Design and optimize database schemas',
    icon: Building2,
    color: 'green',
    prompt: 'Help me design an efficient database schema for my application'
  },
  {
    id: 'testing-strategy',
    title: 'Testing Strategy',
    description: 'Write tests and testing best practices',
    icon: Shield,
    color: 'emerald',
    prompt: 'Help me write comprehensive tests for my code'
  },
  {
    id: 'code-review',
    title: 'Code Review',
    description: 'Get feedback on your code quality',
    icon: UserCheck,
    color: 'indigo',
    prompt: 'Review my code and provide feedback on improvements'
  },
  {
    id: 'algorithm-help',
    title: 'Algorithm Help',
    description: 'Solve algorithmic problems',
    icon: Sparkles,
    color: 'pink',
    prompt: 'Help me solve this algorithmic problem'
  },
  {
    id: 'framework-setup',
    title: 'Framework Setup',
    description: 'Set up and configure frameworks',
    icon: Zap,
    color: 'orange',
    prompt: 'Help me set up and configure this framework'
  }
];

// Function to get 5 random ice-breaker suggestions
const getRandomIceBreakers = (isCodeMode: boolean = false): typeof iceBreakerSuggestions => {
  const suggestions = isCodeMode ? codeIceBreakerSuggestions : iceBreakerSuggestions;
  const shuffled = [...suggestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
};

  const AI_MODELS = [
    { id: 'claude', name: 'SaintSal™', description: 'For everything (fast and responsive)', fullDescription: 'Fast, reliable, and high-quality responses' },
    { id: 'dual', name: 'SaintSal™ HACP™ Mode', description: 'For complex tasks (uses more tokens)', fullDescription: 'Most comprehensive answers with enhanced capabilities' }
  ];

export default function WarRoomPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState({ remainingRequests: 0, isAnonymous: false, maxRequests: 2 });
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const getWelcomeMessage = (agent: Agent | null) => {
    const agentName = agent?.name || "SaintSal™";
    return `**Hello from ${agentName}!**\n\nWelcome to SaintSal™ WarRoom - Cookin' Knowledge! How can I help you today?`;
  };

  // Utility function to detect URLs in text
  const detectUrls = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex) || [];
    return urls.filter(url => {
      try {
        const urlObj = new URL(url);
        return ['http:', 'https:'].includes(urlObj.protocol);
      } catch {
        return false;
      }
    });
  };

  // Convert backend agent to frontend agent
  const convertBackendAgent = useCallback((backendAgent: BackendAgent): Agent => {
    // Map agent modes to icons
    const getIconForMode = (mode: string) => {
      switch (mode.toLowerCase()) {
        case 'enterprise':
          return Building2;
        case 'founder':
          return Crown;
        case 'customer':
          return UserCheck;
        case 'whitelabel':
          return Tag;
        default:
          return MessageCircle;
      }
    };

    return {
      id: backendAgent.id,
      name: backendAgent.name,
      description: backendAgent.description || 'AI Assistant',
      icon: getIconForMode(backendAgent.mode),
      type: backendAgent.mode.toLowerCase(),
      contextFiles: backendAgent.context_files || [], // This is an array of file IDs
      createdAt: backendAgent.created_at,
      updatedAt: backendAgent.updated_at,
      userId: backendAgent.user_id
    };
  }, []);

  // Load agents from backend
  const loadAgents = useCallback(async () => {
    setIsLoadingAgents(true);
    try {
      console.log('🔄 WarRoom: Loading agents from backend...');
      const backendAgents = await agentService.getAgents();
      console.log(`📊 WarRoom: Loaded ${backendAgents.length} agents:`, backendAgents.map(a => ({ id: a.id, name: a.name, mode: a.mode })));
      
      // Inline conversion to avoid dependency issues
      const convertedAgents: Agent[] = backendAgents.map((backendAgent: BackendAgent): Agent => {
        // Map agent modes to icons
        const getIconForMode = (mode: string) => {
          switch (mode.toLowerCase()) {
            case 'enterprise':
              return Building2;
            case 'founder':
              return Crown;
            case 'customer':
              return UserCheck;
            case 'whitelabel':
              return Tag;
            default:
              return MessageCircle;
          }
        };

        return {
          id: backendAgent.id,
          name: backendAgent.name,
          description: backendAgent.description || 'AI Assistant',
          icon: getIconForMode(backendAgent.mode),
          type: backendAgent.mode.toLowerCase(),
          contextFiles: backendAgent.context_files || [],
          createdAt: backendAgent.created_at,
          updatedAt: backendAgent.updated_at,
          userId: backendAgent.user_id
        };
      });
      
      console.log(`✅ WarRoom: Converted ${convertedAgents.length} agents for display`);
      setDynamicAgents(convertedAgents);
    } catch (error) {
      console.error('Error loading agents:', error);
      
      // Handle different types of errors
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          console.log('User not authenticated, skipping agent loading');
          setDynamicAgents([]);
          return; // Don't show error toast for auth issues
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          showToast('Access denied: Insufficient permissions', 'error');
        } else if (error.message.includes('404')) {
          showToast('Agents endpoint not found', 'error');
        } else {
          showToast('Failed to load agents: ' + error.message, 'error');
        }
      } else {
        showToast('Failed to load agents', 'error');
      }
      
      // Set empty agents array on error
      setDynamicAgents([]);
    } finally {
      setIsLoadingAgents(false);
    }
  }, [showToast]);

  // Handle agent selection with context loading
  const handleAgentSelect = async (agent: Agent) => {
    try {
      // Clear current chat
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: getWelcomeMessage(agent),
        timestamp: Date.now()
      }]);

      // Disable code agent mode when selecting a regular agent
      setIsCodeAgentMode(false);
      
      // Reset ice-breakers for new agent
      setShowIceBreakers(true);
      setCurrentIceBreakers(getRandomIceBreakers(false));

      // Clear current uploaded files
      fileUploadService.clearAllFiles();
      setUploadedFiles([]);
      setSelectedFile(null);
      setIsUploading(false);
      setUploadProgress(0);
      setIsFilesExpanded(false);

      // Set selected agent
      setSelectedAgent(agent);

      // Check if this is a default agent (not authenticated)
      const isDefaultAgent = agent.id.startsWith('default-');
      if (isDefaultAgent) {
        showToast(`Agent ${agent.name} selected (default mode)`, 'info');
        return;
      }

      // For authenticated agents, fetch their context files
      try {
        console.log(`🔄 WarRoom: Fetching context files for agent ${agent.name} (${agent.id})`);
        console.log(`🔄 WarRoom: Agent context_files array:`, agent.contextFiles);
        
        // Try to get files from the API endpoint first
        let agentFiles: { id?: string; name?: string; size?: number; mime_type?: string; created_at?: string; text_content?: string }[] = [];
        try {
          agentFiles = await agentService.getAgentFiles(agent.id);
          console.log(`📁 WarRoom: getAgentFiles returned:`, agentFiles);
        } catch (apiError) {
          console.log(`📁 WarRoom: getAgentFiles failed, using fallback:`, apiError);
        }
        
        if (agentFiles && agentFiles.length > 0) {
          console.log(`📁 WarRoom: Loaded ${agentFiles.length} context files for agent ${agent.name}`);
          
          // Convert agent files to uploaded files format
          const contextUploadedFiles: UploadedFile[] = agentFiles
            .filter((file: { name?: string; text_content?: string }) => {
              // Only include files with valid name and text content
              return file.name && file.name.trim() && file.text_content && file.text_content.trim();
            })
            .map((file: { id?: string; name?: string; size?: number; mime_type?: string; created_at?: string; text_content?: string }, index: number) => ({
              id: `context-${agent.id}-${file.id || index}`,
              name: (file.name || `Agent Context File ${index + 1}`).trim(),
              size: file.size || 0,
              mimeType: file.mime_type || 'text/plain',
              uploadedAt: file.created_at || new Date().toISOString(),
              isProcessing: false,
              textContent: (file.text_content || '').trim()
            }));

          console.log(`📁 WarRoom: Converted context files:`, contextUploadedFiles);

          // Add context files to the file service
          contextUploadedFiles.forEach(file => {
            fileUploadService.addContextFile(file);
          });

          // Update UI
          setUploadedFiles(fileUploadService.getAllFiles());
          setIsFilesExpanded(true);

          showToast(`Agent ${agent.name} selected with ${agentFiles.length} context files`, 'success');
        } else {
          // Fallback: Use context files from agent object (like native app)
          console.log(`📁 WarRoom: No files from API, trying fallback from agent object`);
          console.log(`📁 WarRoom: Agent context_files length: ${agent.contextFiles?.length || 0}`);
          
          if (agent.contextFiles && agent.contextFiles.length > 0) {
            console.log(`📁 WarRoom: Using fallback - agent has ${agent.contextFiles.length} context file IDs`);
            // The contextFiles array contains file IDs, but we need the actual file data
            // Since the API endpoint doesn't work, we'll show a message that files are linked but not loaded
            showToast(`Agent ${agent.name} selected with ${agent.contextFiles.length} linked files (files not loaded)`, 'info');
          } else {
            console.log(`📁 WarRoom: No context files found for agent ${agent.name}`);
            showToast(`Agent ${agent.name} selected (no context files)`, 'info');
          }
        }
      } catch (fileError) {
        console.error('Error fetching agent context files:', fileError);
        showToast(`Agent ${agent.name} selected (context files unavailable)`, 'warning');
      }
    } catch (error) {
      console.error('Error selecting agent:', error);
      showToast('Failed to select agent', 'error');
    }
  };

  // Check authentication and admin role on component mount
  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
          // Get request status for anonymous users
          const status = await getRequestStatus();
          setRequestStatus(status);
          
          // Check if user has admin role
          try {
            const token = await getAuthToken();
            if (token) {
              const permissionsResponse = await fetch('https://saintsal-backend-0mv8.onrender.com/api/roles/user/permissions', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (permissionsResponse.ok) {
                const permissionsData = await permissionsResponse.json();
                setIsAdmin(permissionsData.success && (permissionsData.data?.role?.role_name === 'Admin' || permissionsData.data?.role?.role_name === 'admin'));
              }
            }
          } catch (error) {
            console.error('Error checking admin role:', error);
            setIsAdmin(false);
          }
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

    checkAuthAndRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/auth');
        setIsAdmin(false);
      } else if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        checkAuthAndRole();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: getWelcomeMessage(null),
      timestamp: Date.now()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedModel, setSelectedModel] = useState('claude');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [agentSelectorOpen, setAgentSelectorOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isFilesExpanded, setIsFilesExpanded] = useState(false);
  const [dynamicAgents, setDynamicAgents] = useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  // Scroll state variables removed - no longer using scroll indicators
  const [dualAIStatus, setDualAIStatus] = useState<{
    step: string;
    message: string;
    isProcessing: boolean;
  }>({ step: '', message: '', isProcessing: false });
  const [showThinkingAgent, setShowThinkingAgent] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string>('');
  const [showNewAgentModal, setShowNewAgentModal] = useState(false);
  const [showEditAgentModal, setShowEditAgentModal] = useState(false);
  const [showDeleteAgentModal, setShowDeleteAgentModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<BackendAgent | null>(null);
  const [deletingAgent, setDeletingAgent] = useState<{id: string, name: string} | null>(null);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [showStickyNotes, setShowStickyNotes] = useState(false);
  const [isCodeAgentMode, setIsCodeAgentMode] = useState(false);
  const [isWebSearching, setIsWebSearching] = useState(false);
  const [webSearchQuery, setWebSearchQuery] = useState<string>('');
  const [currentIceBreakers, setCurrentIceBreakers] = useState<typeof iceBreakerSuggestions>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showIceBreakers, setShowIceBreakers] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [isNavigationExpanded, setIsNavigationExpanded] = useState(false); // Collapsed by default
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(true);
  const [isQuickToolsExpanded, setIsQuickToolsExpanded] = useState(true);
  const [isChatsExpanded, setIsChatsExpanded] = useState(false);
  const [pastChats, setPastChats] = useState<{ id: string; title: string; created_at: string; updated_at: string; message_count?: number }[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showAllChatsModal, setShowAllChatsModal] = useState(false);
  const [allChatsPage, setAllChatsPage] = useState(1);
  const CHATS_PER_PAGE = 10;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const iceBreakerScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const agentSelectorRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll detection removed - no longer using scroll indicators

  // Agent scroll detection removed - no longer using scroll indicators

  // Update welcome message when agent changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome') {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: getWelcomeMessage(selectedAgent),
        timestamp: Date.now()
      }]);
      // Only show ice-breakers if they were visible before agent change
      if (showIceBreakers) {
        setCurrentIceBreakers(getRandomIceBreakers(isCodeAgentMode)); // Get new random ice-breakers
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgent]); // messages intentionally excluded to prevent infinite loop

  // Sync uploaded files with service
  useEffect(() => {
    setUploadedFiles(fileUploadService.getAllFiles());
  }, []);

  // Initialize ice-breakers on load
  useEffect(() => {
    setCurrentIceBreakers(getRandomIceBreakers(isCodeAgentMode));
  }, [isCodeAgentMode]);

  // Update ice-breakers when code agent mode changes
  useEffect(() => {
    if (showIceBreakers) {
      setCurrentIceBreakers(getRandomIceBreakers(isCodeAgentMode));
    }
  }, [isCodeAgentMode, showIceBreakers]);

  // Fetch past chats when dropdown is expanded
  useEffect(() => {
    if (isChatsExpanded && !isLoadingChats) {
      fetchPastChats();
    }
  }, [isChatsExpanded]);

  // Reset page when modal opens
  useEffect(() => {
    if (showAllChatsModal) {
      setAllChatsPage(1);
    }
  }, [showAllChatsModal]);

  // Function to fetch past chats
  const fetchPastChats = async () => {
    setIsLoadingChats(true);
    try {
      const result = await warroomService.getUserChats();
      if (result.success && result.data) {
        setPastChats(result.data);
      } else {
        console.error('Failed to fetch chats:', result.error);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Function to load a specific chat
  const loadChat = async (chatId: string) => {
    try {
      const result = await warroomService.getChat(chatId);
      if (result.success && result.data) {
        const chat = result.data;
        setCurrentChatId(chatId);
        setIsCodeAgentMode(false);
        setSelectedAgent(null);
        
        // Convert chat messages to the format expected by the UI
        const loadedMessages: Message[] = chat.messages.map((msg: { id: string; role: string; content: string; created_at: string }) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.created_at).getTime(),
          isStreaming: false
        }));

        // If there are no messages, show welcome message
        if (loadedMessages.length === 0) {
          setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: getWelcomeMessage(null),
            timestamp: Date.now()
          }]);
          setShowIceBreakers(true);
        } else {
          setMessages(loadedMessages);
          setShowIceBreakers(false);
        }

        // Load files if any
        if (chat.files && chat.files.length > 0) {
          // Clear existing files first
          fileUploadService.clearAllFiles();
          
          // Convert chat files to UploadedFile format and add them
          const loadedFiles: UploadedFile[] = chat.files
            .filter((file: { original_filename?: string; name?: string; extracted_content?: string; text_content?: string }) => {
              // Handle both old and new schema column names
              const fileName = file.original_filename || file.name;
              const textContent = file.extracted_content || file.text_content;
              return fileName && textContent && textContent.trim();
            })
            .map((file: { id: string; original_filename?: string; name?: string; extracted_content?: string; text_content?: string; file_type?: string; mime_type?: string; size?: number; created_at?: string }, index: number) => {
              // Handle both old and new schema column names
              const fileName = file.original_filename || file.name || `File ${index + 1}`;
              const textContent = file.extracted_content || file.text_content || '';
              const mimeType = file.file_type || file.mime_type || 'application/octet-stream';
              
              return {
                id: `loaded-${file.id}`,
                name: fileName,
                size: file.size || 0,
                mimeType: mimeType,
                textContent: textContent,
                uploadedAt: file.created_at || new Date().toISOString(),
                isProcessing: false
              };
            });
          
          // Add all loaded files to the file upload service
          loadedFiles.forEach(file => {
            fileUploadService.addContextFile(file);
          });
          
          // Update UI state
          setUploadedFiles(fileUploadService.getAllFiles());
          
          console.log(`Loaded ${loadedFiles.length} files from chat`);
        } else {
          // Clear files if no files in chat
          fileUploadService.clearAllFiles();
          setUploadedFiles([]);
        }

        setSidebarOpen(false);
        setIsChatsExpanded(false);
        showToast(`Loaded chat: ${chat.title}`, 'success');
      } else {
        showToast(`Failed to load chat: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      showToast('Failed to load chat', 'error');
    }
  };

  // Function to save current chat before creating a new one
  const saveCurrentChat = async () => {
    // Filter out welcome message and check if there are actual messages
    const actualMessages = messages.filter(msg => msg.id !== 'welcome');
    
    if (actualMessages.length === 0) {
      return; // No messages to save
    }

    try {
      // Generate title from first user message (first 50 chars)
      const firstUserMessage = actualMessages.find(msg => msg.role === 'user');
      const chatTitle = firstUserMessage 
        ? firstUserMessage.content.substring(0, 50).trim() || 'New Chat'
        : 'New Chat';

      // Convert messages to the format expected by the API
      const messagesToSave = actualMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Convert uploaded files to the format expected by the API
      // Filter out files without required fields and ensure all fields are present
      const filesToSave = uploadedFiles
        .filter(file => {
          // Only include files that have a name and textContent
          return file.name && file.name.trim() && (file.textContent || '').trim();
        })
        .map(file => ({
          name: file.name.trim(),
          mimeType: file.mimeType || 'application/octet-stream',
          textContent: (file.textContent || '').trim()
        }));

      // Save the chat
      const result = await warroomService.saveChat(chatTitle, messagesToSave, filesToSave);
      
      if (result.success && result.data) {
        // Refresh the chats list
        fetchPastChats();
        showToast('Chat saved successfully', 'success');
      } else {
        console.error('Failed to save chat:', result.error);
        showToast(`Failed to save chat: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error saving chat:', error);
      showToast('Failed to save chat', 'error');
    }
  };

  // Function to create a new chat
  const createNewChat = async () => {
    // Save current chat first if there are messages
    await saveCurrentChat();
    
    setCurrentChatId(null);
    setSidebarOpen(false);
    setIsCodeAgentMode(false);
    setSelectedAgent(null);
    // Reset to default chat
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: getWelcomeMessage(null),
      timestamp: Date.now()
    }]);
    setShowIceBreakers(true);
    setCurrentIceBreakers(getRandomIceBreakers(false));
    fileUploadService.clearAllFiles();
    setUploadedFiles([]);
    setIsChatsExpanded(false);
  };

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

  // Close agent selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        agentSelectorOpen &&
        agentSelectorRef.current &&
        !agentSelectorRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('[data-agent-selector-trigger]')
      ) {
        setAgentSelectorOpen(false);
      }
    };

    if (agentSelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [agentSelectorOpen]);

  // Load agents when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAgents();
    } else {
      // Show default agents when not authenticated
      const defaultAgents: Agent[] = [
        {
          id: 'default-enterprise',
          name: 'Enterprise Agent',
          description: 'Strategic business intelligence and executive decision support',
          icon: Building2,
          type: 'enterprise'
        },
        {
          id: 'default-founder',
          name: 'Founder Agent',
          description: 'Personal strategic advisor with warm, confident style',
          icon: Crown,
          type: 'founder'
        },
        {
          id: 'default-customer',
          name: 'Customer Agent',
          description: 'Professional customer service and support agent',
          icon: UserCheck,
          type: 'customer'
        },
        {
          id: 'default-white-label',
          name: 'White Label',
          description: 'Customizable enterprise solution with client branding',
          icon: Tag,
          type: 'white-label'
        },
        {
          id: 'default-ai-development',
          name: 'AI Development',
          description: 'Build intelligent automation systems for your business',
          icon: FileText,
          type: 'ai-development'
        }
      ];
      setDynamicAgents(defaultAgents);
    }
  }, [isAuthenticated, loadAgents]);

  // Handle new agent creation
  const handleAgentCreated = async (newAgent: BackendAgent) => {
    try {
      // Set loading state for agent refresh
      setIsLoadingAgents(true);
      
      // Refresh the agents list by re-triggering the query
      await loadAgents();
      
      // Convert backend agent to frontend agent
      const convertedAgent = convertBackendAgent(newAgent);
      
      // Select the new agent
      handleAgentSelect(convertedAgent);
      
      showToast(`Agent "${newAgent.name}" created and selected!`, 'success');
    } catch (error) {
      console.error('Error handling new agent:', error);
      showToast('Agent created but failed to refresh list', 'warning');
    } finally {
      setIsLoadingAgents(false);
    }
  };

  // Handle agent update
  const handleAgentUpdated = async (updatedAgent: BackendAgent) => {
    try {
      // Set loading state for agent refresh
      setIsLoadingAgents(true);
      
      // Refresh the agents list by re-triggering the query
      await loadAgents();
      
      // Convert backend agent to frontend agent
      const convertedAgent = convertBackendAgent(updatedAgent);
      
      // Select the updated agent
      handleAgentSelect(convertedAgent);
      
      showToast(`Agent "${updatedAgent.name}" updated and selected!`, 'success');
    } catch (error) {
      console.error('Error handling updated agent:', error);
      showToast('Agent updated but failed to refresh list', 'warning');
    } finally {
      setIsLoadingAgents(false);
    }
  };

  // Handle agent deletion modal
  const handleAgentDelete = (agentId: string, agentName: string) => {
    setDeletingAgent({ id: agentId, name: agentName });
    setShowDeleteAgentModal(true);
  };

  // Confirm agent deletion
  const confirmAgentDelete = async () => {
    if (!deletingAgent) return;

    try {
      setIsLoadingAgents(true);
      
      // Delete the agent
      await agentService.deleteAgent(deletingAgent.id);
      
      // Refresh the agents list
      await loadAgents();
      
      // Clear selected agent if it was the deleted one
      if (selectedAgent?.id === deletingAgent.id) {
        setSelectedAgent(null);
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: getWelcomeMessage(null),
          timestamp: Date.now()
        }]);
      }
      
      showToast(`Agent "${deletingAgent.name}" deleted successfully`, 'success');
      
      // Close modal and reset state
      setShowDeleteAgentModal(false);
      setDeletingAgent(null);
    } catch (error) {
      console.error('Error deleting agent:', error);
      showToast('Failed to delete agent', 'error');
    } finally {
      setIsLoadingAgents(false);
    }
  };

  // Cancel agent deletion
  const cancelAgentDelete = () => {
    setShowDeleteAgentModal(false);
    setDeletingAgent(null);
  };

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
          <h2 className="text-xl font-bold text-white mb-2">Loading WarRoom...</h2>
          <p className="text-gray-400">Please wait while we verify your access</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect to /auth
  }

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

    // Detect URLs in the message
    const detectedUrls = detectUrls(currentMessage);
    let scrapedContent = '';
    
    // Add user message first (always)
    setMessages(prev => [...prev, userMessage]);

    // Scrape content from detected URLs
    if (detectedUrls.length > 0) {
      try {
        // Show loading message for scraping with special flag
        const scrapingMessageId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, {
          id: scrapingMessageId,
          role: 'assistant',
          content: `Scraping content from ${detectedUrls.length} URL${detectedUrls.length > 1 ? 's' : ''}...`,
          timestamp: Date.now(),
          isStreaming: false,
          isScraping: true // Special flag for scraping message
        }]);

        const scrapePromises = detectedUrls.map(url => warroomService.scrapeUrl(url));
        const scrapeResults = await Promise.all(scrapePromises);
        
        // Combine all scraped content
        const scrapedContents = scrapeResults
          .filter(result => result.success && result.data)
          .map(result => {
            const data = result.data!;
            return `URL: ${data.url}\nTitle: ${data.title}\n${data.description ? `Description: ${data.description}\n` : ''}Content:\n${data.content}`;
          });
        
        if (scrapedContents.length > 0) {
          scrapedContent = `\n\nSCRAPED WEB CONTENT:\n${scrapedContents.join('\n\n---\n\n')}`;
        }
      } catch (error) {
        console.error('Error scraping URLs:', error);
        // Continue even if scraping fails
      }
    }

    // Create assistant message placeholder
    const assistantMessage: Message = {
      id: (Date.now() + 2).toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
      originalUserMessage: currentMessage  // Store original query for retry
    };

    // Remove the scraping loading message and add the actual assistant message
    setMessages(prev => {
      const filtered = prev.filter(msg => !msg.isScraping);
      return [...filtered, assistantMessage];
    });

    // Prepare messages for API (use current messages + user message)
    // Filter out empty or error messages to prevent API issues
    const enhancedUserMessage = currentMessage + scrapedContent;
    const apiMessages: ChatMessage[] = [
      ...messages
        .filter(msg => {
          // Keep user messages
          if (msg.role === 'user') return true;
          // For assistant messages, only keep those with meaningful content AND no error flag
          if (msg.role === 'assistant') {
            // Explicitly exclude messages marked as errors
            if (msg.isError) return false;
            
            const content = msg.content?.trim();
            return content && 
                   content.length > 0 && 
                   !content.startsWith('Sorry, I encountered an error:') &&
                   !content.includes('No response generated') &&
                   !content.includes('Retry failed') &&
                   !content.includes('Scraping content from') &&
                   content !== '\n' &&
                   content !== ' ';
          }
          return true;
        })
        .map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: enhancedUserMessage }
    ];

    // Build context files from uploaded files
    const contextFiles = fileUploadService.getCombinedContext();
    const hasFiles = uploadedFiles.length > 0;
    
    // Add system prompt (agent-specific, code agent, or default)
    let systemPrompt = isCodeAgentMode
      ? warroomService.getAgentSystemPrompt('code')
      : selectedAgent 
        ? warroomService.getAgentSystemPrompt(selectedAgent.type)
        : `You are SAINTSAL™ AI Assistant, ready to help with any business challenge.

WEB SEARCH GUIDELINES:
- You have access to web search capabilities to find real-time, up-to-date information
- Use web search when the user asks about:
  * Current events, news, or recent developments
  * Real-time data (weather, stock prices, sports scores, etc.)
  * Information that may have changed since your training data
  * Specific facts, statistics, or data that you're uncertain about
  * Recent product releases, updates, or announcements
  * Latest programming frameworks, libraries, or tools
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
4. Be concise and professional in all interactions

CONTEXT AWARENESS:
- When context files are available, analyze them first and base your response on their content
- Reference specific details from the context files when relevant
- Only expand beyond the context when the user asks for broader insights`;

    // Add file context with priority instructions if files are uploaded
    if (hasFiles && contextFiles && contextFiles.trim()) {
      const fileContextSection = `

═══════════════════════════════════════════════
🚨 CRITICAL: UPLOADED FILES - YOU MUST USE THESE FIRST
═══════════════════════════════════════════════

⚠️ MANDATORY CONTEXT HANDLING RULES - READ CAREFULLY:

1. The user has uploaded files containing THEIR specific information
2. YOU MUST read and analyze the ACTUAL file content below FIRST before answering
3. When the user asks questions about the file content:
   → YOU MUST analyze THEIR specific file content
   → YOU MUST reference specific details from THEIR files
   → DO NOT give generic advice or general knowledge answers
   → The user wants analysis of THEIR specific document, not general tips
4. PRIORITY ORDER:
   → FIRST: Answer questions using the uploaded file content
   → SECOND: Only if the question is NOT related to files, use general knowledge
5. If you cannot find relevant information in the files, say so explicitly
6. Always cite specific details from the files when answering

📄 UPLOADED FILES CONTENT:

${contextFiles}

═══════════════════════════════════════════════
Remember: Files are your PRIMARY source. Answer file-related questions using ONLY the file content above.
═══════════════════════════════════════════════`;

      systemPrompt += fileContextSection;
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
            ? { ...msg, content: `Sorry, I encountered an error: ${error}`, isStreaming: false, isError: true }
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
                  // Update the message content with the full content for smooth streaming
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
                    onComplete: () => {
                      setIsWebSearching(false);
                      setWebSearchQuery('');
                      callbacks.onComplete();
                    },
                    onError: callbacks.onError,
                    onWebSearchStart: (query: string) => {
                      setIsWebSearching(true);
                      setWebSearchQuery(query);
                    },
                    onWebSearchComplete: () => {
                      setIsWebSearching(false);
                    }
                  };

                  warroomService.getAIStreaming(provider, apiMessages, aiCallbacks);
                }
              };

              // Build context files from uploaded files (like native app)
              const contextFiles = fileUploadService.getCombinedContext();
              
              // Pass the selected agent's ID to fetch agent files
              await warroomService.getDualAIStreaming(apiMessages, dualAICallbacks, contextFiles, 0.7, selectedAgent?.id);
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
                onComplete: () => {
                  setIsWebSearching(false);
                  setWebSearchQuery('');
                  callbacks.onComplete();
                },
                onError: callbacks.onError,
                onWebSearchStart: (query: string) => {
                  setIsWebSearching(true);
                  setWebSearchQuery(query);
                },
                onWebSearchComplete: () => {
                  setIsWebSearching(false);
                }
              };

              // Pass the selected agent's ID to fetch agent files
              await warroomService.getAIStreaming(provider, apiMessages, aiCallbacks, selectedAgent?.id);
            }
          } catch (error) {
      console.error('Error sending message:', error);
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: 'Sorry, I encountered an error. Please try again.', isStreaming: false, isError: true }
            : msg
        ));
        setIsAILoading(false);
    }
  };

  // Retry a failed message
  const handleRetryMessage = async (messageId: string) => {
    const messageToRetry = messages.find(msg => msg.id === messageId);
    if (!messageToRetry || !messageToRetry.originalUserMessage) {
      showToast('Cannot retry this message', 'error');
      return;
    }

    // Find the index of the message to retry
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // Get all messages BEFORE the failed response (excluding the failed response itself)
    const contextMessages = messages.slice(0, messageIndex);

    // Reset the assistant message to loading state
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, content: '', isStreaming: true, isError: false }
        : msg
    ));

    setIsAILoading(true);

    // Prepare API messages (context up to the point before this response)
    const apiMessages: ChatMessage[] = [
      ...contextMessages
        .filter(msg => {
          if (msg.role === 'user') return true;
          if (msg.role === 'assistant') {
            // Explicitly exclude messages marked as errors
            if (msg.isError) return false;
            
            const content = msg.content?.trim();
            return content && 
                   content.length > 0 && 
                   !content.startsWith('Sorry, I encountered an error:') &&
                   !content.includes('No response generated') &&
                   !content.includes('Retry failed') &&
                   content !== '\n' &&
                   content !== ' ';
          }
          return true;
        })
        .map(msg => ({ role: msg.role, content: msg.content }))
    ];

    // Add system prompt
    const systemPrompt = selectedAgent 
      ? warroomService.getAgentSystemPrompt(selectedAgent.type)
      : `You are SAINTSAL™ AI Assistant, ready to help with any business challenge.

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
3. Be concise but thorough in your responses
4. Feel free to be creative and inspiring
5. Always maintain a professional yet warm tone`;

    apiMessages.unshift({
      role: 'system',
      content: systemPrompt
    });

    // Build context files
    const contextFiles = fileUploadService.getCombinedContext();

    // Create callbacks for retry
    const callbacks = {
      onChunk: (content: string) => {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, content: msg.content + content, isError: false }  // Clear error flag on first chunk
            : msg
        ));
      },
      onComplete: () => {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, isStreaming: false, isError: false }  // Ensure error flag is cleared
            : msg
        ));
        setIsAILoading(false);
        showToast('Response regenerated successfully', 'success');
      },
      onError: (error: string) => {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, content: `Sorry, I encountered an error: ${error}`, isStreaming: false, isError: true }
            : msg
        ));
        setIsAILoading(false);
        showToast('Retry failed. Please try again.', 'error');
      }
    };

    try {
      if (selectedModel === 'dual') {
        // Dual AI retry
        const dualCallbacks: DualAIStreamingCallbacks = {
          onChunk: callbacks.onChunk,
          onComplete: callbacks.onComplete,
          onError: callbacks.onError
        };
        await warroomService.getDualAIStreaming(apiMessages, dualCallbacks, contextFiles, 0.7, selectedAgent?.id);
      } else {
        // Individual model retry
        const providerMap: { [key: string]: AIProvider } = {
          'gpt': 'openai',
          'claude': 'anthropic',
          'gemini': 'gemini'
        };
        const provider = providerMap[selectedModel] || 'openai';
        const retryCallbacks: AIStreamingCallbacks = {
          onChunk: callbacks.onChunk,
          onComplete: () => {
            setIsWebSearching(false);
            setWebSearchQuery('');
            callbacks.onComplete();
          },
          onError: callbacks.onError,
          onWebSearchStart: (query: string) => {
            setIsWebSearching(true);
            setWebSearchQuery(query);
          },
          onWebSearchComplete: () => {
            setIsWebSearching(false);
          }
        };
        await warroomService.getAIStreaming(provider, apiMessages, retryCallbacks, selectedAgent?.id);
      }
    } catch (error) {
      console.error('Error retrying message:', error);
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, content: 'Retry failed. Please try again.', isStreaming: false, isError: true }
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


  // Handle sidebar menu item clicks
  const handleMenuItemPress = (item: { key: string; icon: string; label: string; action: string; url?: string; route?: string }) => {
    setSidebarOpen(false); // Close sidebar for all actions
    
    switch (item.action) {
      case 'navigate':
        switch (item.key) {
          case 'admin':
            router.push('/admin');
            break;
          case 'dashboard':
            if (isAdmin) {
              router.push('/admin');
            } else {
              router.push('/main-dashboard');
            }
            break;
          case 'agents':
            router.push('/agent-hub');
            break;
          case 'stickynotes':
            setShowStickyNotes(true);
            break;
          case 'imagegenerator':
            setShowImageGenerator(true);
            break;
          case 'legal':
            router.push('/legal');
            break;
          case 'upgrade':
            router.push('/pricing');
            break;
          case 'account':
            router.push('/account');
            break;
          case 'help':
            router.push('/help');
            break;
          default:
            showToast(`${item.label} feature coming soon`, 'info');
        }
        break;
      case 'external':
        if (item.url) {
          window.open(item.url, '_blank', 'noopener,noreferrer');
        }
        break;
      case 'logout':
        // Handle logout
        supabase.auth.signOut().then(() => {
          router.push('/auth');
        });
        break;
      default:
        showToast(`${item.label} feature coming soon`, 'info');
    }
  };

  const handleFileSelect = async (file: File) => {
    console.log('WarRoom: File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
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
      console.log('WarRoom: Calling fileUploadService.uploadFile');
      const uploadedFile = await fileUploadService.uploadFile(file);
      console.log('WarRoom: Upload result:', uploadedFile);
      
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
      
      <div className="flex-1 flex overflow-hidden pt-16">
      {/* Clean Left Sidebar */}
      <motion.div 
        className={`bg-black/90 backdrop-blur-xl border-r border-yellow-500/30 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden h-full`}
        initial={{ width: 0 }}
        animate={{ width: sidebarOpen ? 256 : 0 }}
      >
        {sidebarOpen && (
          <div className="h-full flex flex-col overflow-hidden">
            {/* Logo and Brand */}
            <div className="h-[56px] px-4 border-b border-yellow-500/20 flex items-center flex-shrink-0">
              <div className="flex items-center gap-2 w-full">
                <motion.button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-black/50 rounded-lg transition-all duration-200 flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Collapse sidebar"
                >
                  <ChevronLeft size={16} />
                </motion.button>
                <motion.button
                  onClick={() => setShowNewAgentModal(true)}
                  className="flex-1 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus size={16} />
                  <span>New Agent</span>
                </motion.button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              <div className="mb-4">
                <motion.button
                  onClick={() => setIsNavigationExpanded(!isNavigationExpanded)}
                  className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold text-yellow-400/60 uppercase tracking-wider hover:text-yellow-400/80 transition-colors"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Navigation</span>
                  <ChevronDown 
                    size={14} 
                    className={`text-yellow-400/60 transition-transform duration-200 ${isNavigationExpanded ? 'rotate-0' : '-rotate-90'}`}
                  />
                </motion.button>
                <motion.div
                  initial={false}
                  animate={{ height: isNavigationExpanded ? 'auto' : 0, opacity: isNavigationExpanded ? 1 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0.5 mt-2">
                  <motion.button
                    onClick={() => {
                      setSidebarOpen(false);
                      router.push('/chat');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-black hover:text-yellow-400 border border-transparent hover:border-yellow-500/30 transition-colors flex items-center gap-2"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageCircle size={16} className="text-yellow-400/70" />
                    <span>Chat</span>
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setSidebarOpen(false);
                      setAgentSelectorOpen(true);
                    }}
                    data-agent-selector-trigger
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-black hover:text-yellow-400 border border-transparent hover:border-yellow-500/30 transition-colors flex items-center gap-2"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Bot size={16} className="text-yellow-400/70" />
                    <span>My Companions</span>
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setSidebarOpen(false);
                      router.push('/agent-hub');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-black hover:text-yellow-400 border border-transparent hover:border-yellow-500/30 transition-colors flex items-center gap-2"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Users size={16} className="text-yellow-400/70" />
                    <span>Agent Hub</span>
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setSidebarOpen(false);
                      if (isAdmin) {
                        router.push('/admin');
                      } else {
                        router.push('/main-dashboard');
                      }
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-black hover:text-yellow-400 border border-transparent hover:border-yellow-500/30 transition-colors flex items-center gap-2"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <BarChart3 size={16} className="text-yellow-400/70" />
                    <span>{isAdmin ? 'Admin Dashboard' : 'Dashboard'}</span>
                  </motion.button>
                  </div>
                </motion.div>
              </div>

              {/* Tabs Section */}
              <div className="mb-4">
                <motion.button
                  onClick={() => setIsWorkspaceExpanded(!isWorkspaceExpanded)}
                  className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold text-yellow-400/60 uppercase tracking-wider hover:text-yellow-400/80 transition-colors"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Workspace</span>
                  <ChevronDown 
                    size={14} 
                    className={`text-yellow-400/60 transition-transform duration-200 ${isWorkspaceExpanded ? 'rotate-0' : '-rotate-90'}`}
                  />
                </motion.button>
                <motion.div
                  initial={false}
                  animate={{ height: isWorkspaceExpanded ? 'auto' : 0, opacity: isWorkspaceExpanded ? 1 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0.5 mt-2">
                  {/* Chats Section - Expandable */}
                  <div>
                    <motion.button
                      onClick={() => {
                        setIsChatsExpanded(!isChatsExpanded);
                        if (!isChatsExpanded && pastChats.length === 0) {
                          fetchPastChats();
                        }
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between gap-2 ${
                        !isCodeAgentMode && !selectedAgent && !currentChatId
                          ? 'bg-black border border-yellow-500/30 text-yellow-400'
                          : 'text-gray-300 hover:bg-black hover:text-yellow-400 border border-transparent hover:border-yellow-500/30'
                      }`}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle size={16} className={!isCodeAgentMode && !selectedAgent && !currentChatId ? "text-yellow-400" : "text-yellow-400/70"} />
                        <span>Chats</span>
                      </div>
                      <ChevronDown 
                        size={14} 
                        className={`text-yellow-400/60 transition-transform duration-200 ${isChatsExpanded ? 'rotate-0' : '-rotate-90'}`}
                      />
                    </motion.button>
                    <motion.div
                      initial={false}
                      animate={{ height: isChatsExpanded ? 'auto' : 0, opacity: isChatsExpanded ? 1 : 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5 mt-1 ml-4 pl-2 border-l border-yellow-500/20">
                        {/* New Chat Button */}
                        <motion.button
                          onClick={createNewChat}
                          className="w-full text-left px-2 py-1.5 rounded text-xs text-gray-400 hover:bg-black hover:text-yellow-400 border border-transparent hover:border-yellow-500/20 transition-colors flex items-center gap-2"
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Plus size={12} />
                          <span>New Chat</span>
                        </motion.button>
                        
                        {/* Past Chats List - Show only latest 5 */}
                        {isLoadingChats ? (
                          <div className="px-2 py-2 text-xs text-gray-500 flex items-center gap-2">
                            <Loader2 size={12} className="animate-spin" />
                            <span>Loading chats...</span>
                          </div>
                        ) : pastChats.length === 0 ? (
                          <div className="px-2 py-2 text-xs text-gray-500">
                            No past chats
                          </div>
                        ) : (
                          <>
                            {pastChats.slice(0, 5).map((chat) => (
                              <motion.button
                                key={chat.id}
                                onClick={() => loadChat(chat.id)}
                                className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex items-center gap-2 truncate ${
                                  currentChatId === chat.id
                                    ? 'bg-black border border-yellow-500/30 text-yellow-400'
                                    : 'text-gray-400 hover:bg-black hover:text-yellow-400 border border-transparent hover:border-yellow-500/20'
                                }`}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                title={chat.title}
                              >
                                <MessageSquare size={12} />
                                <span className="truncate">{chat.title || 'Untitled Chat'}</span>
                                {chat.message_count && chat.message_count > 0 && (
                                  <span className="text-xs text-gray-500 ml-auto">({chat.message_count})</span>
                                )}
                              </motion.button>
                            ))}
                            {pastChats.length > 5 && (
                              <motion.button
                                onClick={() => {
                                  setShowAllChatsModal(true);
                                  setAllChatsPage(1);
                                }}
                                className="w-full text-left px-2 py-1.5 rounded text-xs text-gray-400 hover:bg-black hover:text-yellow-400 border border-transparent hover:border-yellow-500/20 transition-colors flex items-center gap-2"
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <ChevronRight size={12} />
                                <span>Show More ({pastChats.length - 5} more)</span>
                              </motion.button>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  </div>
                  <motion.button
                    onClick={() => {
                      setSidebarOpen(false);
                      setShowStickyNotes(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-black hover:text-yellow-400 border border-transparent hover:border-yellow-500/30 transition-colors flex items-center gap-2"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FileText size={16} className="text-yellow-400/70" />
                    <span>Notes</span>
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setSidebarOpen(false);
                      setIsCodeAgentMode(true);
                      setSelectedAgent(null); // Clear any selected agent
                      // Clear current chat and show welcome message
                      setMessages([{
                        id: 'welcome',
                        role: 'assistant',
                        content: '**Hello! I\'m your Code Agent** 🚀\n\nI specialize in answering technical and coding questions. I can help you with:\n\n• Programming languages and frameworks\n• Code debugging and optimization\n• Software architecture and design patterns\n• Technical documentation\n• Best practices and coding standards\n• Algorithm and data structure questions\n\nWhat would you like to code today?',
                        timestamp: Date.now()
                      }]);
                      setShowIceBreakers(true);
                      setCurrentIceBreakers(getRandomIceBreakers(true));
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      isCodeAgentMode
                        ? 'bg-black border border-yellow-500/30 text-yellow-400'
                        : 'text-gray-300 hover:bg-black hover:text-yellow-400 border border-transparent hover:border-yellow-500/30'
                    }`}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Zap size={16} className={isCodeAgentMode ? "text-yellow-400" : "text-yellow-400/70"} />
                    <span>Code Agent</span>
                  </motion.button>
                  </div>
                </motion.div>
              </div>

              {/* Quick Tools */}
              <div className="mb-4">
                <motion.button
                  onClick={() => setIsQuickToolsExpanded(!isQuickToolsExpanded)}
                  className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold text-yellow-400/60 uppercase tracking-wider hover:text-yellow-400/80 transition-colors"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Quick Tools</span>
                  <ChevronDown 
                    size={14} 
                    className={`text-yellow-400/60 transition-transform duration-200 ${isQuickToolsExpanded ? 'rotate-0' : '-rotate-90'}`}
                  />
                </motion.button>
                <motion.div
                  initial={false}
                  animate={{ height: isQuickToolsExpanded ? 'auto' : 0, opacity: isQuickToolsExpanded ? 1 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0.5 mt-2">
                  <motion.button
                    onClick={() => {
                      setSidebarOpen(false);
                      setShowImageGenerator(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-black hover:text-yellow-400 border border-transparent hover:border-yellow-500/30 transition-colors flex items-center gap-2"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Palette size={16} className="text-yellow-400/70" />
                    <span>Image Generator</span>
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setSidebarOpen(false);
                      router.push('/voice');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-black hover:text-yellow-400 border border-transparent hover:border-yellow-500/30 transition-colors flex items-center gap-2"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Mic size={16} className="text-yellow-400/70" />
                    <span>Voice Assistant</span>
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setSidebarOpen(false);
                      router.push('/legal');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-black hover:text-yellow-400 border border-transparent hover:border-yellow-500/30 transition-colors flex items-center gap-2"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Shield size={16} className="text-yellow-400/70" />
                    <span>Legal & Compliance</span>
                  </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-yellow-500/20 space-y-2">
              {isAdmin && (
                <motion.button
                  onClick={() => {
                    setSidebarOpen(false);
                    router.push('/admin');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-black hover:text-yellow-400 border border-transparent hover:border-yellow-500/30 transition-colors flex items-center gap-2"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ChevronRight size={14} className="text-yellow-400/70" />
                  <span>Admin Dashboard</span>
                </motion.button>
              )}
              <motion.button
                onClick={() => {
                  setSidebarOpen(false);
                  router.push('/account');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-black hover:text-yellow-400 border border-transparent hover:border-yellow-500/30 transition-colors flex items-center gap-2"
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <ChevronRight size={14} className="text-yellow-400/70" />
                <span>My Account</span>
              </motion.button>
              <motion.button
                onClick={() => {
                  setSidebarOpen(false);
                  supabase.auth.signOut().then(() => {
                    router.push('/auth');
                  });
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 hover:border-red-400/40 transition-colors flex items-center gap-2"
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <X size={16} />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <div className="h-[56px] bg-black px-4 flex items-center flex-shrink-0 relative z-[30]">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Menu"
              >
                <Menu size={20} />
              </motion.button>
              <div>
                <h1 className="text-xl font-bold text-white">WARROOM</h1>
                <p className="text-xs text-gray-400">SAINTSAL™ Assistant</p>
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
                      onClick={() => {
                        console.log('Think button clicked in warroom!');
                        setShowThinkingAgent(true);
                      }}
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
              
              {/* AI Model Selector Dropdown - WarRoom Version */}
              <div className="relative" ref={modelDropdownRef}>
                <div
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-white/20 rounded-lg hover:bg-gray-700/50 transition-all duration-300 cursor-pointer"
                >
                  <span className="text-yellow-400 font-bold text-xs">AI MODEL:</span>
                  <span className="text-white text-xs font-medium">
                    {AI_MODELS.find(m => m.id === selectedModel)?.name}
                  </span>
                  <ChevronDown size={14} className="text-gray-400" />
                </div>

                {/* Dropdown Menu */}
                {showModelDropdown && (
                  <div
                    className="fixed right-4 top-16 w-80 bg-black border-2 border-white/30 rounded-xl shadow-2xl"
                    style={{ zIndex: 40 }}
                  >
                    <div className="p-3 space-y-2">
                      {AI_MODELS.map((model) => (
                        <div
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model.id);
                            setShowModelDropdown(false);
                          }}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                            selectedModel === model.id
                              ? 'bg-yellow-400/20 border-2 border-yellow-400/50'
                              : 'hover:bg-white/10 border-2 border-transparent'
                          }`}
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
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setAgentSelectorOpen(!agentSelectorOpen)}
                  data-agent-selector-trigger
                  className={`p-2 transition-colors border rounded-lg ${
                    agentSelectorOpen 
                      ? 'text-white border-yellow-400 bg-yellow-400/20' 
                      : 'text-gray-400 border-yellow-400 hover:text-white hover:bg-yellow-400/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="AI Agent Selector"
                >
                  <Bot size={18} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat and Agent Selection */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Agent Selector Sidebar */}
          <motion.div
            ref={agentSelectorRef}
            className={`fixed right-0 top-16 h-[calc(100vh-4rem)] bg-black backdrop-blur-xl border-l border-yellow-400/30 ${
              agentSelectorOpen ? 'w-80' : 'w-0'
            } overflow-hidden`}
            style={{ zIndex: 40 }}
            initial={{ width: 0 }}
            animate={{ width: agentSelectorOpen ? 320 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {agentSelectorOpen && (
              <div className="h-full flex flex-col overflow-hidden">
                {/* Agent Selector Header */}
                <div className="flex items-center justify-between p-4 border-b border-yellow-400/30">
                  <h3 className="text-lg font-bold text-white">SELECT AGENT</h3>
                  <motion.button
                    onClick={() => setAgentSelectorOpen(false)}
                    className="p-2 text-white/70 hover:text-white hover:bg-yellow-400/10 rounded transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={18} />
                  </motion.button>
                </div>

                {/* Agent Selector Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                  {/* Agent Controls */}
                  <div className="p-4 border-b border-yellow-400/20">
                    <p className="text-sm text-white mb-3">Choose your AI companion</p>
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => setShowNewAgentModal(true)}
                        className="flex-1 p-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Plus size={16} />
                        <span className="font-medium">New Agent</span>
                      </motion.button>
                      <motion.button
                        onClick={async () => {
                          if (selectedAgent) {
                            try {
                              const fullAgentData = await agentService.getAgentById(selectedAgent.id);
                              if (fullAgentData) {
                                setEditingAgent(fullAgentData);
                                setShowEditAgentModal(true);
                              } else {
                                showToast('Failed to load agent data for editing', 'error');
                              }
                            } catch (error) {
                              console.error('Error fetching agent data:', error);
                              showToast('Failed to load agent data for editing', 'error');
                            }
                          }
                        }}
                        className={`p-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                          selectedAgent 
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600' 
                            : 'bg-yellow-400/20 text-yellow-400/50 cursor-not-allowed'
                        }`}
                        whileHover={selectedAgent ? { scale: 1.02 } : {}}
                        whileTap={selectedAgent ? { scale: 0.98 } : {}}
                        disabled={!selectedAgent}
                        title={selectedAgent ? "Edit Selected Agent" : "Select an agent to edit"}
                      >
                        <Edit size={16} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Agent List */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {isLoadingAgents ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-yellow-400" />
                        <span className="ml-3 text-yellow-400/80">Loading agents...</span>
                      </div>
                    ) : dynamicAgents.length > 0 ? (
                      <div className="space-y-3">
                        {dynamicAgents.map((agent) => (
                          <motion.button
                            key={agent.id}
                            onClick={() => handleAgentSelect(agent)}
                            className={`w-full text-left p-3 rounded-lg border transition-all duration-300 ${
                              selectedAgent?.id === agent.id
                                ? 'border-yellow-400 bg-yellow-400/20'
                                : 'border-yellow-400/30 bg-black hover:bg-yellow-400/10 hover:border-yellow-400/50'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                selectedAgent?.id === agent.id ? 'bg-yellow-400/30' : 'bg-yellow-400/10'
                              }`}>
                                <agent.icon size={16} className={selectedAgent?.id === agent.id ? 'text-yellow-400' : 'text-yellow-400/70'} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <div className={`font-semibold text-sm truncate ${
                                    selectedAgent?.id === agent.id ? 'text-yellow-400' : 'text-white'
                                  }`}>
                                    {agent.name}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {agent.contextFiles && agent.contextFiles.length > 0 && (
                                      <div className={`text-xs px-2 py-1 rounded-full ${
                                        selectedAgent?.id === agent.id 
                                          ? 'bg-yellow-400/20 text-yellow-400' 
                                          : 'bg-yellow-400/10 text-yellow-400'
                                      }`}>
                                        {agent.contextFiles.length}
                                      </div>
                                    )}
                                    {!agent.id.startsWith('default-') && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAgentDelete(agent.id, agent.name);
                                        }}
                                        className="text-yellow-400/70 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-900/20"
                                        title="Delete Agent"
                                      >
                                        <X size={14} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="text-xs text-yellow-400/70 truncate">
                                  {agent.description}
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-yellow-400/30">
                          <MessageSquare size={24} className="text-yellow-400/70" />
                        </div>
                        <h4 className="text-yellow-400 font-medium mb-2">No Agents Yet</h4>
                        <p className="text-yellow-400/70 text-sm mb-4">Create your first AI companion</p>
                        <motion.button
                          onClick={() => setShowNewAgentModal(true)}
                          className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Create Agent
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
            agentSelectorOpen ? 'mr-80' : 'mr-0'
          }`}>

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
                    {/* URL Scraping Indicator with Gradient Shine */}
                    {message.role === 'assistant' && message.isScraping && (
                      <motion.div 
                        className="mb-3 relative overflow-hidden rounded-xl px-4 py-3 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-400/30 backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Gradient shine animation overlay */}
                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        
                        <div className="relative flex items-center gap-3">
                          {/* Animated loading icon */}
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="flex-shrink-0"
                          >
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </motion.div>
                          
                          {/* Text with gradient */}
                          <div className="flex-1">
                            <p className="text-sm font-semibold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                              {message.content}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">Extracting content from web pages</p>
                          </div>
                          
                          {/* Pulsing dots */}
                          <div className="flex gap-1">
                            <motion.div 
                              className="w-2 h-2 rounded-full bg-emerald-400"
                              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div 
                              className="w-2 h-2 rounded-full bg-teal-400"
                              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
                            />
                            <motion.div 
                              className="w-2 h-2 rounded-full bg-cyan-400"
                              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Web Search Indicator with Gradient Shine */}
                    {message.role === 'assistant' && isWebSearching && message.isStreaming && !message.isScraping && (
                      <motion.div 
                        className="mb-3 relative overflow-hidden rounded-xl px-4 py-3 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-blue-400/30 backdrop-blur-sm"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Gradient shine animation overlay */}
                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        
                        <div className="relative flex items-center gap-3">
                          {/* Animated search icon */}
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="flex-shrink-0"
                          >
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </motion.div>
                          
                          {/* Text with gradient */}
                          <div className="flex-1">
                            <p className="text-sm font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                              Searching the web{webSearchQuery ? `: "${webSearchQuery}"` : ''}...
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">Finding the most up-to-date information</p>
                          </div>
                          
                          {/* Pulsing dots */}
                          <div className="flex gap-1">
                            <motion.div 
                              className="w-2 h-2 rounded-full bg-blue-400"
                              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div 
                              className="w-2 h-2 rounded-full bg-purple-400"
                              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div 
                              className="w-2 h-2 rounded-full bg-pink-400"
                              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {/* Only show message content if it's not a scraping message */}
                    {!message.isScraping && (
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
                    )}
                    
                    {message.role === 'assistant' && message.content && !message.isScraping && (
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-gray-400 hover:text-white transition-colors">
                            <Volume2 size={12} />
                          </button>
                          <span className="text-xs text-gray-400">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {/* Retry Button */}
                        <button
                          onClick={() => handleRetryMessage(message.id)}
                          disabled={isAILoading || message.isStreaming}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all duration-200 ${
                            message.isError
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                              : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={message.isError ? "Retry failed response" : "Regenerate response"}
                        >
                          <RefreshCw size={12} className={isAILoading ? 'animate-spin' : ''} />
                          <span>{message.isError ? 'Retry' : 'Regenerate'}</span>
                        </button>
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
                  className="w-full flex items-center justify-between p-2 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-blue-400" />
                    <span className="text-xs text-white font-medium">Attached Files:</span>
                    <span className="text-xs text-gray-400">({uploadedFiles.length})</span>
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
                      uploadedFiles.map((file) => (
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
                      ))
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
              Sign up for unlimited access to WarRoom!
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
                <li>• Full WarRoom access</li>
                <li>• All AI models (SaintSal™, SaintSal™ HACP™ Mode)</li>
                <li>• No data collection</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* New Agent Modal */}
      <NewAgentModal
        isOpen={showNewAgentModal}
        onClose={() => setShowNewAgentModal(false)}
        onAgentCreated={handleAgentCreated}
      />

      {/* Edit Agent Modal */}
      {editingAgent && (
        <EditAgentModal
          isOpen={showEditAgentModal}
          onClose={() => setShowEditAgentModal(false)}
          onAgentUpdated={handleAgentUpdated}
          agent={editingAgent}
        />
      )}

      {/* Delete Agent Modal */}
      <DeleteAgentModal
        isOpen={showDeleteAgentModal}
        onClose={cancelAgentDelete}
        onConfirm={confirmAgentDelete}
        agentName={deletingAgent?.name || ''}
        isDeleting={isLoadingAgents}
      />

      {/* Image Generator Modal */}
      <ImageGenerator
        isOpen={showImageGenerator}
        onClose={() => setShowImageGenerator(false)}
      />

      {/* Sticky Notes Modal */}
      <StickyNotes
        isOpen={showStickyNotes}
        onClose={() => setShowStickyNotes(false)}
      />

      {/* All Chats Modal */}
      {showAllChatsModal && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAllChatsModal(false);
            }
          }}
        >
          <motion.div
            className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <div className="flex items-center gap-3">
                <MessageCircle size={24} className="text-yellow-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">All Chats</h2>
                  <p className="text-sm text-gray-400">{pastChats.length} total chats</p>
                </div>
              </div>
              <motion.button
                onClick={() => setShowAllChatsModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Chats List */}
            <div className="flex-1 overflow-y-auto p-4">
              {pastChats.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare size={48} className="mx-auto mb-4 text-gray-600" />
                  <p>No chats yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pastChats
                    .slice((allChatsPage - 1) * CHATS_PER_PAGE, allChatsPage * CHATS_PER_PAGE)
                    .map((chat) => (
                      <motion.button
                        key={chat.id}
                        onClick={() => {
                          loadChat(chat.id);
                          setShowAllChatsModal(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                          currentChatId === chat.id
                            ? 'bg-black border border-yellow-500/30 text-yellow-400'
                            : 'text-gray-300 hover:bg-black hover:text-yellow-400 border border-transparent hover:border-yellow-500/20'
                        }`}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <MessageSquare size={16} className={currentChatId === chat.id ? "text-yellow-400" : "text-yellow-400/70"} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{chat.title || 'Untitled Chat'}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {new Date(chat.updated_at).toLocaleDateString()} • {chat.message_count || 0} messages
                          </div>
                        </div>
                        {chat.message_count && chat.message_count > 0 && (
                          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                            {chat.message_count}
                          </span>
                        )}
                      </motion.button>
                    ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {pastChats.length > CHATS_PER_PAGE && (
              <div className="flex items-center justify-between p-4 border-t border-white/20">
                <motion.button
                  onClick={() => setAllChatsPage(prev => Math.max(1, prev - 1))}
                  disabled={allChatsPage === 1}
                  className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-yellow-400 border border-transparent hover:border-yellow-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  whileHover={{ x: allChatsPage > 1 ? -2 : 0 }}
                  whileTap={{ scale: allChatsPage > 1 ? 0.98 : 1 }}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </motion.button>
                
                <div className="text-sm text-gray-400">
                  Page {allChatsPage} of {Math.ceil(pastChats.length / CHATS_PER_PAGE)}
                </div>
                
                <motion.button
                  onClick={() => setAllChatsPage(prev => Math.min(Math.ceil(pastChats.length / CHATS_PER_PAGE), prev + 1))}
                  disabled={allChatsPage >= Math.ceil(pastChats.length / CHATS_PER_PAGE)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-yellow-400 border border-transparent hover:border-yellow-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  whileHover={{ x: allChatsPage < Math.ceil(pastChats.length / CHATS_PER_PAGE) ? 2 : 0 }}
                  whileTap={{ scale: allChatsPage < Math.ceil(pastChats.length / CHATS_PER_PAGE) ? 0.98 : 1 }}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </motion.button>
              </div>
            )}
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
    </div>
  );
}
