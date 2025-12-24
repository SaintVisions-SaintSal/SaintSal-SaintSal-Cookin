"use client";

import React, { useState, useEffect } from 'react';
import * as motion from "motion/react-client";
import { 
  X, 
  MessageSquare, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Building2,
  Crown,
  UserCheck,
  Tag,
  Loader2,
  FileText,
  Upload,
  Trash2
} from "lucide-react";
import { agentService, type BackendAgent } from '@/services/agentService';
import { useToast } from '@/contexts/ToastContext';
import { fileUploadService, type UploadedFile } from '@/services/fileUploadService';
import { warroomService, type ChatMessage, type AIStreamingCallbacks } from '@/services/warroomService';

interface AgentConfig {
  name: string;
  description?: string;
  system_prompt: string;
  mode: 'Enterprise' | 'Founder' | 'Customer' | 'WhiteLabel';
}

interface TestMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

interface NewAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: (agent: BackendAgent) => void;
}

const AGENT_MODES = [
  { 
    id: 'Enterprise', 
    name: 'Enterprise', 
    description: 'Strategic business intelligence and executive decision support',
    icon: Building2,
    color: 'blue'
  },
  { 
    id: 'Founder', 
    name: 'Founder', 
    description: 'Personal strategic advisor with warm, confident style',
    icon: Crown,
    color: 'yellow'
  },
  { 
    id: 'Customer', 
    name: 'Customer', 
    description: 'Professional customer service and support agent',
    icon: UserCheck,
    color: 'green'
  },
  { 
    id: 'WhiteLabel', 
    name: 'White Label', 
    description: 'Customizable enterprise solution with client branding',
    icon: Tag,
    color: 'purple'
  }
];


export default function NewAgentModal({ isOpen, onClose, onAgentCreated }: NewAgentModalProps) {
  const { showToast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSaving, setIsSaving] = useState(false);
  
  // Agent configuration
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: "New Agent",
    description: "",
    system_prompt: "You are SAINTSAL™, an enterprise AI assistant powered by HACP™ protocol. You provide strategic business intelligence with a warm, confident New York style.",
    mode: 'Enterprise'
  });

  // File upload state
  const [contextFiles, setContextFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Test chat state
  const [testInput, setTestInput] = useState("");
  const [testMessages, setTestMessages] = useState<TestMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm ${agentConfig.name}. I'm here to help you with ${agentConfig.mode.toLowerCase()} tasks. How can I assist you today?`,
      timestamp: Date.now()
    }
  ]);
  const [isTestRunning, setIsTestRunning] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setAgentConfig({
        name: "New Agent",
        description: "",
        system_prompt: "You are SAINTSAL™, an enterprise AI assistant powered by HACP™ protocol. You provide strategic business intelligence with a warm, confident New York style.",
        mode: 'Enterprise'
      });
      setTestInput("");
      setTestMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm New Agent. I'm here to help you with enterprise tasks. How can I assist you today?`,
        timestamp: Date.now()
      }]);
    }
  }, [isOpen]);

  // Update welcome message when config changes
  useEffect(() => {
    setTestMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{
          id: 'welcome',
          role: 'assistant',
          content: `Hello! I'm ${agentConfig.name}. I'm here to help you with ${agentConfig.mode.toLowerCase()} tasks. How can I assist you today?`,
          timestamp: Date.now()
        }];
      }
      return prev;
    });
  }, [agentConfig.name, agentConfig.mode]);

  const handleConfigChange = (field: keyof AgentConfig, value: string) => {
    setAgentConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleTestMessage = async () => {
    if (!testInput.trim() || isTestRunning) return;

    const userMessage: TestMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: testInput,
      timestamp: Date.now()
    };

    const assistantMessage: TestMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    };

    setTestMessages(prev => [...prev, userMessage, assistantMessage]);
    setTestInput("");
    setIsTestRunning(true);

    try {
      // Build context from uploaded files
      const contextSections: string[] = [];
      const MAX_CONTEXT_CHARS = 15000;
      
      for (const file of contextFiles) {
        if (file.textContent && file.textContent.trim()) {
          contextSections.push(`[${file.name}]\n${file.textContent}`);
        }
      }
      
      const combinedContext = contextSections.join('\n\n');
      const truncatedContext = combinedContext.length > MAX_CONTEXT_CHARS 
        ? combinedContext.slice(0, MAX_CONTEXT_CHARS) + `\n\n[Context truncated to ${MAX_CONTEXT_CHARS} characters for performance]`
        : combinedContext;

      // Build full context including agent identity and files
      const fullContextSections: string[] = [];
      fullContextSections.push(`Agent Name: ${agentConfig.name}`);
      fullContextSections.push(`Agent Mode: ${agentConfig.mode}`);
      fullContextSections.push(`System Prompt: ${agentConfig.system_prompt}`);
      
      if (truncatedContext && truncatedContext.trim()) {
        fullContextSections.push(`\n[Context Files]\n${truncatedContext}`);
      }

      const fullContext = fullContextSections.join('\n\n');

      // Prepare messages for AI
      const messages: ChatMessage[] = [
        { role: 'system', content: fullContext },
        ...testMessages.slice(0, -1).map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user', content: testInput }
      ];

      // Use real AI streaming
      const callbacks: AIStreamingCallbacks = {
        onChunk: (chunk: string) => {
          setTestMessages(prev => prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: msg.content + chunk }
              : msg
          ));
        },
        onComplete: () => {
          setTestMessages(prev => prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, isStreaming: false }
              : msg
          ));
          setIsTestRunning(false);
        },
        onError: (error: string) => {
          setTestMessages(prev => prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: `Sorry, I encountered an error: ${error}`, isStreaming: false }
              : msg
          ));
          setIsTestRunning(false);
        }
      };

      // Use OpenAI for testing (most reliable)
      await warroomService.getAIStreaming('openai', messages, callbacks);
    } catch (error) {
      console.error('Test message error:', error);
      setTestMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: "Sorry, I encountered an error. Please try again.", isStreaming: false }
          : msg
      ));
      setIsTestRunning(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);

    try {
      const uploadedFile = await fileUploadService.uploadFile(file);
      
      if (uploadedFile.textContent && !uploadedFile.error) {
        setContextFiles(prev => [...prev, uploadedFile]);
        showToast(`File uploaded successfully: ${file.name}`, 'success');
      } else {
        showToast(`Upload failed: ${uploadedFile.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('File upload error:', error);
      showToast('Failed to upload file', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileRemove = (fileId: string) => {
    setContextFiles(prev => prev.filter(file => file.id !== fileId));
    showToast('File removed', 'info');
  };

  const handleSaveAgent = async () => {
    // Validate required fields
    if (!agentConfig.name.trim()) {
      showToast('Agent name is required', 'error');
      return;
    }

    if (!agentConfig.system_prompt.trim()) {
      showToast('System prompt is required', 'error');
      return;
    }

    setIsSaving(true);
    
    try {
      // Store files in database first to get real UUIDs
      let databaseFileIds: string[] = [];
      if (contextFiles.length > 0) {
        console.log('Storing context files in database...');
        databaseFileIds = await fileUploadService.storeFilesInDatabase();
        console.log('Database file IDs:', databaseFileIds);
      }

      const agentData = {
        name: agentConfig.name.trim(),
        description: agentConfig.description?.trim() || `SAINTSAL™ ${agentConfig.mode} Agent`,
        system_prompt: agentConfig.system_prompt.trim(),
        mode: agentConfig.mode,
        provider: 'Dual' as const, // Default provider like native app
        model: 'o3', // Default model like native app
        temperature: 0.7, // Fixed temperature for all agents
        max_tokens: 4096, // Maximum tokens for all agents
        context_files: databaseFileIds // Use database UUIDs instead of temp IDs
      };

      const createdAgent = await agentService.createAgent(agentData);
      
      if (createdAgent) {
        // Close modal first
        onClose();
        // Then trigger the agent creation callback
        onAgentCreated(createdAgent);
      } else {
        console.error('Agent creation returned null/undefined');
        showToast('Failed to create agent. Please check console for details.', 'error');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast(`Failed to create agent: ${errorMessage}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getModeIcon = (mode: string) => {
    const modeData = AGENT_MODES.find(m => m.id === mode);
    return modeData?.icon || Building2;
  };

  const getModeColor = (mode: string) => {
    const modeData = AGENT_MODES.find(m => m.id === mode);
    return modeData?.color || 'blue';
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white">Create New Agent</h2>
            <p className="text-gray-400 text-sm">Build your custom AI companion</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 p-4 border-b border-white/20 flex-shrink-0">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            step === 1 ? 'bg-yellow-400/20 text-yellow-400' : 'text-gray-400'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 1 ? 'bg-yellow-400 text-black' : 'bg-gray-600 text-gray-300'
            }`}>
              1
            </div>
            <span className="font-medium">Configure</span>
          </div>
          <div className="w-8 h-px bg-gray-600"></div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            step === 2 ? 'bg-yellow-400/20 text-yellow-400' : 'text-gray-400'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 2 ? 'bg-yellow-400 text-black' : 'bg-gray-600 text-gray-300'
            }`}>
              2
            </div>
            <span className="font-medium">Test</span>
          </div>
          <div className="w-8 h-px bg-gray-600"></div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            step === 3 ? 'bg-yellow-400/20 text-yellow-400' : 'text-gray-400'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 3 ? 'bg-yellow-400 text-black' : 'bg-gray-600 text-gray-300'
            }`}>
              3
            </div>
            <span className="font-medium">Finalize</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Step 1: Configure */}
          {step === 1 && (
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Agent Name */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Agent Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={agentConfig.name}
                    onChange={(e) => handleConfigChange('name', e.target.value)}
                    className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none transition-colors ${
                      !agentConfig.name.trim() 
                        ? 'border-red-400/50 focus:border-red-400' 
                        : 'border-white/20 focus:border-yellow-400'
                    }`}
                    placeholder="Enter agent name"
                  />
                  {!agentConfig.name.trim() && (
                    <p className="text-xs text-red-400 mt-1">Agent name is required</p>
                  )}
                </div>

                {/* Agent Description */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={agentConfig.description || ''}
                    onChange={(e) => handleConfigChange('description', e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                    placeholder="Brief description of your agent"
                  />
                </div>

                {/* Agent Mode */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Agent Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {AGENT_MODES.map((mode) => {
                      const IconComponent = mode.icon;
                      const isSelected = agentConfig.mode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => handleConfigChange('mode', mode.id)}
                          className={`p-4 rounded-lg border transition-all duration-300 text-left ${
                            isSelected
                              ? 'border-yellow-400 bg-yellow-400/10'
                              : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isSelected ? 'bg-yellow-400/20' : 'bg-gray-700'
                            }`}>
                              <IconComponent size={16} className={isSelected ? 'text-yellow-400' : 'text-gray-300'} />
                            </div>
                            <div>
                              <div className={`font-medium ${isSelected ? 'text-yellow-400' : 'text-white'}`}>
                                {mode.name}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {mode.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>


                {/* System Prompt */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    System Prompt <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={agentConfig.system_prompt}
                    onChange={(e) => handleConfigChange('system_prompt', e.target.value)}
                    rows={6}
                    className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none transition-colors resize-none ${
                      !agentConfig.system_prompt.trim() 
                        ? 'border-red-400/50 focus:border-red-400' 
                        : 'border-white/20 focus:border-yellow-400'
                    }`}
                    placeholder="Define how your agent should behave and respond..."
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    This defines your agent&apos;s personality, expertise, and response style.
                  </p>
                  {!agentConfig.system_prompt.trim() && (
                    <p className="text-xs text-red-400 mt-1">System prompt is required</p>
                  )}
                </div>

                {/* Context Files Upload */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Context Files (Optional)
                  </label>
                  
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-yellow-400/50 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.txt,.md,.csv,.json,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files) {
                          Array.from(e.target.files).forEach(file => handleFileUpload(file));
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-300 mb-1">Click to upload files or drag and drop</p>
                      <p className="text-xs text-gray-500">PDF, TXT, MD, CSV, JSON, DOC, DOCX (max 8MB each)</p>
                    </label>
                  </div>

                  {/* Uploaded Files List */}
                  {contextFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-white">Uploaded Files ({contextFiles.length})</h4>
                      {contextFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText size={16} className="text-blue-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-white font-medium truncate">{file.name}</div>
                              <div className="text-xs text-gray-400">
                                {Math.round(file.size / 1024)}KB • {file.textContent ? 'Ready' : 'Processing...'}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleFileRemove(file.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-900/20"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {isUploading && (
                    <div className="mt-2 text-center">
                      <div className="inline-flex items-center gap-2 text-yellow-400 text-sm">
                        <Loader2 size={16} className="animate-spin" />
                        Uploading files...
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Step 2: Test */}
          {step === 2 && (
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-white/20 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${getModeColor(agentConfig.mode)}-400/20`}>
                    {React.createElement(getModeIcon(agentConfig.mode), { 
                      size: 16, 
                      className: `text-${getModeColor(agentConfig.mode)}-400` 
                    })}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{agentConfig.name}</h3>
                    <p className="text-xs text-gray-400">Test your agent&apos;s responses</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {testMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-lg p-3 rounded-xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/5 border border-white/20 text-white'
                      }`}
                    >
                      <div className="text-sm">
                        {message.isStreaming ? (
                          <div className="flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin text-yellow-400" />
                            <span className="text-gray-400">Thinking...</span>
                          </div>
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-white/20 flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTestMessage()}
                    placeholder="Type a test message..."
                    className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                    disabled={isTestRunning}
                  />
                  <button
                    onClick={handleTestMessage}
                    disabled={!testInput.trim() || isTestRunning}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MessageSquare size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Finalize */}
          {step === 3 && (
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Ready to Deploy</h3>
                  <p className="text-gray-400">Review your agent configuration before creating</p>
                </div>

                {/* Agent Summary */}
                <div className="bg-white/5 border border-white/20 rounded-xl p-6 space-y-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Agent Summary</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Name</label>
                      <p className="text-white font-medium">{agentConfig.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Mode</label>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center bg-${getModeColor(agentConfig.mode)}-400/20`}>
                          {React.createElement(getModeIcon(agentConfig.mode), { 
                            size: 12, 
                            className: `text-${getModeColor(agentConfig.mode)}-400` 
                          })}
                        </div>
                        <span className="text-white font-medium">{agentConfig.mode}</span>
                      </div>
                    </div>
                  </div>

                  {agentConfig.description && (
                    <div>
                      <label className="text-sm text-gray-400">Description</label>
                      <p className="text-white">{agentConfig.description}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-gray-400">System Prompt</label>
                    <div className="mt-2 p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-gray-300 text-sm">{agentConfig.system_prompt}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Context Files</label>
                    <div className="mt-2">
                      {contextFiles.length > 0 ? (
                        <div className="space-y-2">
                          {contextFiles.map((file) => (
                            <div key={file.id} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                              <FileText size={14} className="text-blue-400" />
                              <span className="text-white text-sm">{file.name}</span>
                              <span className="text-gray-400 text-xs">({Math.round(file.size / 1024)}KB)</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No context files added</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Capabilities Preview */}
                <div className="bg-white/5 border border-white/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Agent Capabilities</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-gray-300">Executive-level strategic analysis</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-gray-300">Business diagnostic and optimization</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-gray-300">Professional communication</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-gray-300">Context-aware responses</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-white/20 flex-shrink-0">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1 as 1 | 2 | 3)}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1 as 1 | 2 | 3)}
                disabled={step === 1 && (!agentConfig.name.trim() || !agentConfig.system_prompt.trim())}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === 1 ? `Next → Test ${contextFiles.length > 0 ? `(${contextFiles.length} files)` : '(Optional)'}` : 'Next'}
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSaveAgent}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Create Agent
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
