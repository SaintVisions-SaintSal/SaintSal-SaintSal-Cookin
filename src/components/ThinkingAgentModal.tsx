"use client";

import React, { useState, useEffect } from 'react';
import * as motion from "motion/react-client";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  X, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Brain,
  ChevronDown,
  ChevronUp,
  FileText,
  Search,
  MapPin,
  Calendar,
  Route,
  Database,
  Code,
  BookOpen,
  Lightbulb,
  Target,
  Zap,
  Globe,
  Users,
  BarChart,
  Settings,
  Camera,
  Music,
  Gamepad2,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Briefcase,
  Heart,
  Star,
  TrendingUp
} from "lucide-react";

interface Todo {
  id: string;
  content: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  estimatedTime: string;
  result?: string;
  error?: string;
  usedWebSearch?: boolean;
}

interface ThinkingAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userQuery: string;
  context?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export default function ThinkingAgentModal({
  isOpen,
  onClose,
  userQuery,
  context = '',
  conversationHistory = []
}: ThinkingAgentModalProps) {
  const [isThinking, setIsThinking] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [completedTodos, setCompletedTodos] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [editableQuery, setEditableQuery] = useState(userQuery || "Help me with my request");
  const [summary, setSummary] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [isCreatingSummary, setIsCreatingSummary] = useState(false);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [thinkingStartTime, setThinkingStartTime] = useState<number | null>(null);
  const [webSearchingTodos, setWebSearchingTodos] = useState<Set<string>>(new Set());

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsThinking(false);
      setCurrentStep('');
      setReasoning('');
      setTodos([]);
      setIsExpanded(true);
      setCompletedTodos(0);
      setTotalDuration(0);
      setEditableQuery(userQuery || "Help me with my request");
      setSummary('');
      setShowSummary(false);
      setIsCreatingSummary(false);
      setShowRetryButton(false);
      setThinkingStartTime(null);
      setWebSearchingTodos(new Set());
    }
  }, [isOpen, userQuery]);

  // 5-minute timeout tracking
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isThinking && thinkingStartTime && !showRetryButton) {
      timeoutId = setTimeout(() => {
        if (isThinking && !showRetryButton) {
          setShowRetryButton(true);
        }
      }, 5 * 60 * 1000); // 5 minutes
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isThinking, thinkingStartTime, showRetryButton]);

  const startThinking = async () => {
    if (!editableQuery.trim()) return;

    setIsThinking(true);
    setCurrentStep('Initializing thinking agent...');
    setThinkingStartTime(Date.now());
    setShowRetryButton(false);

    try {
      // Get authentication token
      const { getAuthToken } = await import('@/lib/supabase');
      const token = await getAuthToken();
      
      const response = await fetch('https://saintsal-backend-0mv8.onrender.com/api/ai/thinking-agent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userQuery: editableQuery,
          context,
          conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start thinking agent');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
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
              const data = JSON.parse(line);
              handleStreamData(data);
            } catch (e) {
              console.error('Failed to parse stream data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Thinking agent error:', error);
      setCurrentStep(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsThinking(false);
    }
  };

  const retryThinking = () => {
    // Reset all states and restart thinking
    setCurrentStep('');
    setReasoning('');
    setTodos([]);
    setCompletedTodos(0);
    setTotalDuration(0);
    setSummary('');
    setShowSummary(false);
    setIsCreatingSummary(false);
    setShowRetryButton(false);
    setThinkingStartTime(null);
    
    // Start thinking again
    startThinking();
  };

  const handleStreamData = (data: {
    type: string;
    message?: string;
    reasoning?: string;
    todos?: Todo[];
    todoId?: string;
    content?: string;
    estimatedTime?: string;
    result?: string;
    error?: string;
    totalDuration?: number;
    todosCompleted?: number;
    results?: string[];
    summary?: string;
    step?: string;
    usedWebSearch?: boolean;
  }) => {
    switch (data.type) {
      case 'connected':
        setCurrentStep(data.message || '');
        break;

      case 'step':
        setCurrentStep(data.message || '');
        if (data.step === 'summarizing') {
          setIsCreatingSummary(true);
        }
        break;

      case 'plan':
        setReasoning(data.reasoning || '');
        setTodos((data.todos || []).map((todo: Todo) => ({
          ...todo,
          status: 'pending' as const
        })));
        setCurrentStep('Plan created! Starting execution...');
        break;

      case 'todo_start':
        setTodos(prev => prev.map(todo => 
          todo.id === data.todoId 
            ? { ...todo, status: 'in_progress' as const }
            : todo
        ));
        
        // Check if this todo needs web search and add to web searching set
        const currentTodo = todos.find(todo => todo.id === data.todoId);
        if (currentTodo && needsWebSearch(currentTodo.content, editableQuery)) {
          setWebSearchingTodos(prev => new Set(prev).add(data.todoId || ''));
        }
        
        setCurrentStep(`Executing: ${data.content || ''}`);
        break;

      case 'todo_complete':
        setTodos(prev => prev.map(todo => 
          todo.id === data.todoId 
            ? { 
                ...todo, 
                status: 'completed' as const,
                result: data.result,
                usedWebSearch: data.usedWebSearch || false
              }
            : todo
        ));
        
        // Remove from web searching set when completed
        setWebSearchingTodos(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.todoId || '');
          return newSet;
        });
        
        setCompletedTodos(prev => prev + 1);
        setCurrentStep(`Completed: ${(data.result || '').substring(0, 100)}...`);
        break;

      case 'todo_error':
        setTodos(prev => prev.map(todo => 
          todo.id === data.todoId 
            ? { 
                ...todo, 
                status: 'error' as const,
                error: data.error
              }
            : todo
        ));
        
        // Remove from web searching set when error occurs
        setWebSearchingTodos(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.todoId || '');
          return newSet;
        });
        
        setCurrentStep(`Error in task: ${data.error || 'Unknown error'}`);
        break;

      case 'complete':
        setTotalDuration(data.totalDuration || 0);
        setCurrentStep(`All tasks completed! Total time: ${Math.round((data.totalDuration || 0) / 1000)}s`);
        setShowRetryButton(false); // Hide retry button when completed
        break;

      case 'summary':
        setSummary(data.summary || '');
        setShowSummary(true);
        setIsCreatingSummary(false);
        break;

      case 'error':
        setCurrentStep(`Error: ${data.error || 'Unknown error'}`);
        break;
    }
  };

  const getStatusIcon = (status: Todo['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'in_progress':
        return <Loader2 size={16} className="text-blue-400 animate-spin" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-400" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-400 rounded-full" />;
    }
  };

  const getStatusColor = (status: Todo['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'in_progress':
        return 'text-blue-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const needsWebSearch = (content: string, userQuery: string) => {
    const searchKeywords = [
      'current', 'latest', 'recent', 'today', 'now', '2024', '2025',
      'news', 'update', 'trend', 'price', 'rate', 'weather',
      'restaurant', 'hotel', 'flight', 'event', 'movie', 'game',
      'stock', 'crypto', 'market', 'business', 'company',
      'research', 'find', 'search', 'look up', 'check', 'verify'
    ];
    
    const combinedText = (content + ' ' + userQuery).toLowerCase();
    return searchKeywords.some(keyword => combinedText.includes(keyword));
  };

  const getTodoIcon = (content: string) => {
    const lowerContent = content.toLowerCase();
    
    // Web search related tasks
    if (lowerContent.includes('current') || lowerContent.includes('latest') || lowerContent.includes('recent') || 
        lowerContent.includes('news') || lowerContent.includes('update') || lowerContent.includes('trend') ||
        lowerContent.includes('price') || lowerContent.includes('rate') || lowerContent.includes('weather') ||
        lowerContent.includes('find') || lowerContent.includes('search') || lowerContent.includes('look up') ||
        lowerContent.includes('check') || lowerContent.includes('verify') || lowerContent.includes('2024') ||
        lowerContent.includes('2025') || lowerContent.includes('today') || lowerContent.includes('now')) {
      return <Globe size={16} className="text-cyan-400" />;
    }
    
    // Location and mapping related
    if (lowerContent.includes('map') || lowerContent.includes('location') || lowerContent.includes('geographic')) {
      return <MapPin size={16} className="text-blue-400" />;
    }
    
    // Research and analysis
    if (lowerContent.includes('research') || lowerContent.includes('analyze') || lowerContent.includes('investigate')) {
      return <Search size={16} className="text-purple-400" />;
    }
    
    // Planning and scheduling
    if (lowerContent.includes('plan') || lowerContent.includes('schedule') || lowerContent.includes('itinerary') || lowerContent.includes('calendar')) {
      return <Calendar size={16} className="text-green-400" />;
    }
    
    // Travel and routes
    if (lowerContent.includes('travel') || lowerContent.includes('route') || lowerContent.includes('journey') || lowerContent.includes('distance')) {
      return <Route size={16} className="text-orange-400" />;
    }
    
    // Data and information
    if (lowerContent.includes('data') || lowerContent.includes('information') || lowerContent.includes('database') || lowerContent.includes('collect')) {
      return <Database size={16} className="text-cyan-400" />;
    }
    
    // Technical and development
    if (lowerContent.includes('code') || lowerContent.includes('develop') || lowerContent.includes('build') || lowerContent.includes('implement')) {
      return <Code size={16} className="text-indigo-400" />;
    }
    
    // Learning and education
    if (lowerContent.includes('learn') || lowerContent.includes('study') || lowerContent.includes('understand') || lowerContent.includes('education')) {
      return <BookOpen size={16} className="text-amber-400" />;
    }
    
    // Ideas and creativity
    if (lowerContent.includes('idea') || lowerContent.includes('creative') || lowerContent.includes('brainstorm') || lowerContent.includes('design')) {
      return <Lightbulb size={16} className="text-yellow-400" />;
    }
    
    // Goals and targets
    if (lowerContent.includes('goal') || lowerContent.includes('target') || lowerContent.includes('objective') || lowerContent.includes('achieve')) {
      return <Target size={16} className="text-red-400" />;
    }
    
    // Optimization and performance
    if (lowerContent.includes('optimize') || lowerContent.includes('improve') || lowerContent.includes('enhance') || lowerContent.includes('boost')) {
      return <Zap size={16} className="text-yellow-500" />;
    }
    
    // Global and international
    if (lowerContent.includes('global') || lowerContent.includes('international') || lowerContent.includes('worldwide') || lowerContent.includes('country')) {
      return <Globe size={16} className="text-teal-400" />;
    }
    
    // People and social
    if (lowerContent.includes('people') || lowerContent.includes('users') || lowerContent.includes('customers') || lowerContent.includes('community')) {
      return <Users size={16} className="text-pink-400" />;
    }
    
    // Analytics and metrics
    if (lowerContent.includes('analytics') || lowerContent.includes('metrics') || lowerContent.includes('statistics') || lowerContent.includes('performance')) {
      return <BarChart size={16} className="text-emerald-400" />;
    }
    
    // Configuration and setup
    if (lowerContent.includes('setup') || lowerContent.includes('configure') || lowerContent.includes('install') || lowerContent.includes('settings')) {
      return <Settings size={16} className="text-gray-400" />;
    }
    
    // Media and content
    if (lowerContent.includes('image') || lowerContent.includes('photo') || lowerContent.includes('video') || lowerContent.includes('media')) {
      return <Camera size={16} className="text-purple-500" />;
    }
    
    // Entertainment
    if (lowerContent.includes('music') || lowerContent.includes('audio') || lowerContent.includes('sound')) {
      return <Music size={16} className="text-pink-500" />;
    }
    
    if (lowerContent.includes('game') || lowerContent.includes('gaming') || lowerContent.includes('play')) {
      return <Gamepad2 size={16} className="text-green-500" />;
    }
    
    // Shopping and commerce
    if (lowerContent.includes('shop') || lowerContent.includes('buy') || lowerContent.includes('purchase') || lowerContent.includes('commerce')) {
      return <ShoppingBag size={16} className="text-blue-500" />;
    }
    
    // Food and dining
    if (lowerContent.includes('food') || lowerContent.includes('restaurant') || lowerContent.includes('eat') || lowerContent.includes('dining')) {
      return <Utensils size={16} className="text-orange-500" />;
    }
    
    // Transportation
    if (lowerContent.includes('car') || lowerContent.includes('vehicle') || lowerContent.includes('transport') || lowerContent.includes('drive')) {
      return <Car size={16} className="text-gray-500" />;
    }
    
    // Home and real estate
    if (lowerContent.includes('home') || lowerContent.includes('house') || lowerContent.includes('property') || lowerContent.includes('real estate')) {
      return <Home size={16} className="text-brown-400" />;
    }
    
    // Business and work
    if (lowerContent.includes('business') || lowerContent.includes('work') || lowerContent.includes('job') || lowerContent.includes('career')) {
      return <Briefcase size={16} className="text-slate-500" />;
    }
    
    // Health and wellness
    if (lowerContent.includes('health') || lowerContent.includes('fitness') || lowerContent.includes('wellness') || lowerContent.includes('medical')) {
      return <Heart size={16} className="text-red-500" />;
    }
    
    // Quality and excellence
    if (lowerContent.includes('quality') || lowerContent.includes('excellent') || lowerContent.includes('best') || lowerContent.includes('top')) {
      return <Star size={16} className="text-yellow-400" />;
    }
    
    // Growth and trends
    if (lowerContent.includes('growth') || lowerContent.includes('trend') || lowerContent.includes('increase') || lowerContent.includes('expand')) {
      return <TrendingUp size={16} className="text-green-500" />;
    }
    
    // Default icon for general tasks
    return <Brain size={16} className="text-purple-400" />;
  };

  // Shining light animation component for web search
  const ShiningText = ({ children, isActive }: { children: React.ReactNode; isActive: boolean }) => {
    if (!isActive) return <>{children}</>;
    
    return (
      <motion.span
        className="relative inline-block"
        initial={{ opacity: 1 }}
        animate={{ 
          opacity: [1, 0.3, 1],
          textShadow: [
            '0 0 0px rgba(59, 130, 246, 0)',
            '0 0 10px rgba(59, 130, 246, 0.8)',
            '0 0 20px rgba(59, 130, 246, 1)',
            '0 0 10px rgba(59, 130, 246, 0.8)',
            '0 0 0px rgba(59, 130, 246, 0)'
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {children}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 0.5
          }}
        />
      </motion.span>
    );
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ zIndex: 9999 }}
    >
      <motion.div
        className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Thinking Agent</h2>
              <p className="text-sm text-gray-400">Planning and executing your request</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {totalDuration > 0 && (
              <div className="text-sm text-gray-400">
                Completed in {Math.round(totalDuration / 1000)}s
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* User Query */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Your Request:</h3>
            <textarea
              value={editableQuery}
              onChange={(e) => setEditableQuery(e.target.value)}
              placeholder="Describe what you need help with..."
              className="w-full bg-gray-800/50 rounded-lg p-3 border border-white/10 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-white/30 transition-colors"
              rows={3}
              disabled={isThinking}
            />
          </div>

          {/* Control Button */}
          {!isThinking && todos.length === 0 && (
            <div className="text-center mb-6">
              <motion.button
                onClick={startThinking}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Thinking
              </motion.button>
            </div>
          )}

          {/* Current Step */}
          {currentStep && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-blue-400">
                {isThinking ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle size={16} />
                )}
                <span className="text-sm font-medium">{currentStep}</span>
              </div>
            </div>
          )}

          {/* Retry Button - Shows after 5 minutes */}
          {showRetryButton && isThinking && (
            <div className="mb-6">
              <motion.div
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <AlertCircle size={20} className="text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-300">
                        Thinking process is taking longer than expected
                      </p>
                      <p className="text-xs text-red-200/80 mt-1">
                        The process may have gotten stuck. You can retry to restart.
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={retryThinking}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors duration-200 flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Loader2 size={16} className="animate-spin" />
                    <span>RETRY</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Reasoning */}
          {reasoning && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-2">My Approach:</h3>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Headings
                      h1: ({ children }) => <h1 className="text-base font-bold mb-2 text-blue-200">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-sm font-bold mb-1 text-blue-200">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-blue-200">{children}</h3>,
                      
                      // Paragraphs
                      p: ({ children }) => <p className="mb-2 last:mb-0 text-blue-300 text-sm">{children}</p>,
                      
                      // Lists
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-blue-300 text-sm">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-blue-300 text-sm">{children}</ol>,
                      li: ({ children }) => <li className="text-blue-300 text-sm">{children}</li>,
                      
                      // Text formatting
                      strong: ({ children }) => <strong className="font-bold text-blue-200 text-sm">{children}</strong>,
                      em: ({ children }) => <em className="italic text-blue-200 text-sm">{children}</em>,
                      
                      // Code
                      code: ({ children }) => <code className="bg-blue-900/30 px-1 py-0.5 rounded text-xs text-blue-100">{children}</code>,
                      pre: ({ children }) => <pre className="bg-blue-900/20 p-2 rounded text-xs text-blue-100 mb-2 overflow-x-auto">{children}</pre>,
                      
                      // Blockquotes
                      blockquote: ({ children }) => <blockquote className="border-l-2 border-blue-400 pl-2 italic text-blue-300 mb-2 text-sm">{children}</blockquote>,
                    }}
                  >
                    {reasoning}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Todos */}
          {todos.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  To-dos {todos.length}
                  {completedTodos > 0 && (
                    <span className="text-xs text-gray-400">
                      ({completedTodos}/{todos.length} completed)
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {isExpanded && (
                <div className="space-y-2">
                  {todos.map((todo, index) => (
                    <motion.div
                      key={todo.id}
                      className="bg-gray-800/30 border border-white/10 rounded-lg p-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getStatusIcon(todo.status)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <ShiningText isActive={webSearchingTodos.has(todo.id) && todo.status === 'in_progress'}>
                              <span className={`text-sm font-medium ${getStatusColor(todo.status)}`}>
                                {todo.content}
                                {webSearchingTodos.has(todo.id) && todo.status === 'in_progress' && (
                                  <span className="ml-2 text-xs text-blue-400">
                                    🌐 Searching the web...
                                  </span>
                                )}
                              </span>
                            </ShiningText>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              {getTodoIcon(todo.content)}
                            </div>
                          </div>
                          
                          {todo.result && (
                            <div className="mt-2 p-2 bg-gray-700/50 rounded border-l-2 border-green-400/50">
                              {todo.usedWebSearch && (
                                <div className="flex items-center gap-1 mb-2 text-xs text-blue-400">
                                  <Globe size={12} />
                                  <span>Used web search for real-time data</span>
                                </div>
                              )}
                              <div className="prose prose-invert prose-xs max-w-none">
                                <ReactMarkdown 
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    // Headings
                                    h1: ({ children }) => <h1 className="text-sm font-bold mb-1 text-white">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-xs font-bold mb-1 text-white">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-xs font-bold mb-1 text-white">{children}</h3>,
                                    
                                    // Paragraphs
                                    p: ({ children }) => <p className="mb-1 last:mb-0 text-gray-300 text-xs">{children}</p>,
                                    
                                    // Lists
                                    ul: ({ children }) => <ul className="list-disc list-inside mb-1 space-y-0.5 text-gray-300 text-xs">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-1 space-y-0.5 text-gray-300 text-xs">{children}</ol>,
                                    li: ({ children }) => <li className="text-gray-300 text-xs">{children}</li>,
                                    
                                    // Text formatting
                                    strong: ({ children }) => <strong className="font-bold text-white text-xs">{children}</strong>,
                                    em: ({ children }) => <em className="italic text-gray-200 text-xs">{children}</em>,
                                    
                                    // Code
                                    code: ({ children }) => <code className="bg-gray-600 px-1 py-0.5 rounded text-xs text-green-400">{children}</code>,
                                    pre: ({ children }) => <pre className="bg-gray-800 p-2 rounded text-xs text-green-400 mb-1 overflow-x-auto">{children}</pre>,
                                    
                                    // Blockquotes
                                    blockquote: ({ children }) => <blockquote className="border-l-2 border-gray-500 pl-2 italic text-gray-300 mb-1 text-xs">{children}</blockquote>,
                                  }}
                                >
                                  {todo.result}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )}
                          
                          {todo.error && (
                            <div className="mt-2 p-2 bg-red-500/10 rounded border-l-2 border-red-400/50">
                              <p className="text-xs text-red-300">{todo.error}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Summary Creation Step */}
          {isCreatingSummary && (
            <div className="mb-6">
              <motion.div
                className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <motion.div
                      className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <FileText size={16} className="text-white" />
                    </motion.div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Loader2 size={16} className="text-purple-400 animate-spin" />
                      <span className="text-sm font-medium text-purple-300">
                        Creating Executive Summary
                      </span>
                    </div>
                    <p className="text-xs text-purple-200/80">
                      Synthesizing all analysis results into a comprehensive overview...
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Summary Section */}
          {summary && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FileText size={16} className="text-purple-400" />
                  Executive Summary
                </h3>
                <button
                  onClick={() => setShowSummary(!showSummary)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {showSummary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {showSummary && (
                <motion.div
                  className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Headings
                        h1: ({ children }) => <h1 className="text-lg font-bold mb-3 text-purple-200">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-purple-200">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold mb-2 text-purple-200">{children}</h3>,
                        
                        // Paragraphs
                        p: ({ children }) => <p className="mb-3 last:mb-0 text-purple-100 text-sm leading-relaxed">{children}</p>,
                        
                        // Lists
                        ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 text-purple-100 text-sm">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-purple-100 text-sm">{children}</ol>,
                        li: ({ children }) => <li className="text-purple-100 text-sm">{children}</li>,
                        
                        // Text formatting
                        strong: ({ children }) => <strong className="font-bold text-purple-200 text-sm">{children}</strong>,
                        em: ({ children }) => <em className="italic text-purple-200 text-sm">{children}</em>,
                        
                        // Code
                        code: ({ children }) => <code className="bg-purple-900/30 px-1 py-0.5 rounded text-xs text-purple-100">{children}</code>,
                        pre: ({ children }) => <pre className="bg-purple-900/20 p-2 rounded text-xs text-purple-100 mb-2 overflow-x-auto">{children}</pre>,
                        
                        // Blockquotes
                        blockquote: ({ children }) => <blockquote className="border-l-2 border-purple-400 pl-3 italic text-purple-200 mb-3 text-sm">{children}</blockquote>,
                      }}
                    >
                      {summary}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Final Results */}
          {totalDuration > 0 && completedTodos === todos.length && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-sm font-medium text-green-400">All tasks completed!</span>
              </div>
              <p className="text-xs text-gray-300">
                Successfully executed {completedTodos} tasks in {Math.round(totalDuration / 1000)} seconds.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
