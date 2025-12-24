"use client";

import React, { useState, useEffect } from 'react';
import * as motion from "motion/react-client";
import { useToast } from '@/contexts/ToastContext';
import { agentService, type BackendAgent } from '@/services/agentService';
import { fileUploadService, type UploadedFile } from '@/services/fileUploadService';
import { warroomService, type ChatMessage, type AIStreamingCallbacks } from '@/services/warroomService';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  FileText, 
  Trash2, 
  Send, 
  Loader2,
  CheckCircle,
  Edit,
  MessageCircle
} from "lucide-react";

// Use BackendAgent type for editing

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentUpdated: (updatedAgent: BackendAgent) => void;
  agent: BackendAgent | null;
}

interface AgentConfig {
  name: string;
  description?: string;
  system_prompt: string;
  mode: 'Enterprise' | 'Founder' | 'Customer' | 'WhiteLabel';
}

const EditAgentModal: React.FC<EditAgentModalProps> = ({
  isOpen,
  onClose,
  onAgentUpdated,
  agent
}) => {
  const { showToast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: '',
    description: '',
    system_prompt: '',
    mode: 'Enterprise'
  });
  const [contextFiles, setContextFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testMessages, setTestMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
  }>>([]);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when modal opens with agent data
  useEffect(() => {
    if (isOpen && agent) {
      setAgentConfig({
        name: agent.name,
        description: agent.description || '',
        system_prompt: agent.system_prompt || 'You are a helpful AI assistant.',
        mode: agent.mode || 'Enterprise'
      });
      
      // Load context files for the agent
      loadAgentContextFiles(agent.id);
      
      setStep(1);
      setTestInput('');
      setTestMessages([]);
      setIsSaving(false);
    }
  }, [isOpen, agent]);

  // Load context files for the agent
  const loadAgentContextFiles = async (agentId: string) => {
    try {
      console.log('Loading context files for agent:', agentId);
      const agentFiles = await agentService.getAgentFiles(agentId);
      
      if (agentFiles && agentFiles.length > 0) {
        // Convert agent files to UploadedFile format
        const contextFiles: UploadedFile[] = agentFiles.map(file => ({
          id: file.id || `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name || 'Unknown file',
          size: file.size || 0,
          mimeType: file.mime_type || 'text/plain',
          textContent: file.text_content || '',
          uploadedAt: file.created_at || new Date().toISOString(),
          isProcessing: false
        }));
        
        setContextFiles(contextFiles);
        console.log('Loaded context files:', contextFiles);
      } else {
        setContextFiles([]);
        console.log('No context files found for agent');
      }
    } catch (error) {
      console.error('Error loading agent context files:', error);
      setContextFiles([]);
    }
  };

  const handleTestMessage = async () => {
    if (!testInput.trim() || isTestRunning) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: testInput.trim()
    };

    const assistantMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant' as const,
      content: '',
      isStreaming: true
    };

    setTestMessages(prev => [...prev, userMessage, assistantMessage]);
    setTestInput('');
    setIsTestRunning(true);

    try {
      // Build context from agent config and files
      let fullContext = `You are ${agentConfig.name}, a ${agentConfig.mode} AI assistant.\n\nSystem Prompt: ${agentConfig.system_prompt}`;
      
      if (contextFiles.length > 0) {
        fullContext += '\n\nContext Files:';
        contextFiles.forEach(file => {
          fullContext += `\n\nFile: ${file.name}\n${file.textContent || 'No content available'}`;
        });
      }

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
      setContextFiles(prev => [...prev, uploadedFile]);
      showToast(`File "${file.name}" uploaded successfully!`, 'success');
    } catch (error) {
      console.error('File upload error:', error);
      showToast(`Failed to upload file "${file.name}"`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileRemove = (fileId: string) => {
    setContextFiles(prev => prev.filter(file => file.id !== fileId));
    showToast('File removed', 'info');
  };

  const handleSaveAgent = async () => {
    if (!agentConfig.name.trim() || !agentConfig.system_prompt.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setIsSaving(true);
      
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
        provider: 'Dual' as const,
        model: 'o3',
        temperature: 0.7,
        max_tokens: 4096,
        context_files: databaseFileIds
      };

      console.log('Updating agent with data:', agentData);
      const updatedAgent = await agentService.updateAgent(agent?.id || '', agentData);
      
      if (updatedAgent) {
        showToast(`Agent "${agentConfig.name}" updated successfully!`, 'success');
        onClose();
        onAgentUpdated(updatedAgent);
      } else {
        showToast('Failed to update agent', 'error');
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast(`Failed to update agent: ${errorMessage}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !agent) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Edit size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edit Agent</h2>
              <p className="text-sm text-gray-400">Modify your AI companion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-700/50">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNum 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step > stepNum ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-gray-400">
              {step === 1 && 'Configure'}
              {step === 2 && 'Test'}
              {step === 3 && 'Finalize'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Agent Name *
                </label>
                <input
                  type="text"
                  value={agentConfig.name}
                  onChange={(e) => setAgentConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  placeholder="Enter agent name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={agentConfig.description || ''}
                  onChange={(e) => setAgentConfig(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  placeholder="Enter agent description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Agent Mode *
                </label>
                <select
                  value={agentConfig.mode}
                  onChange={(e) => setAgentConfig(prev => ({ ...prev, mode: e.target.value as 'Enterprise' | 'Founder' | 'Customer' | 'WhiteLabel' }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                >
                  <option value="Enterprise">Enterprise</option>
                  <option value="Founder">Founder</option>
                  <option value="Customer">Customer</option>
                  <option value="WhiteLabel">WhiteLabel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  System Prompt *
                </label>
                <textarea
                  value={agentConfig.system_prompt}
                  onChange={(e) => setAgentConfig(prev => ({ ...prev, system_prompt: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none"
                  placeholder="Enter the system prompt that defines how this agent should behave..."
                />
              </div>

              {/* Context Files Section */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Context Files
                </label>
                <div className="space-y-3">
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-gray-600/50 rounded-lg p-6 text-center hover:border-blue-500/50 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept=".pdf,.txt,.md,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files) {
                          Array.from(e.target.files).forEach(handleFileUpload);
                        }
                      }}
                      className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-400">
                        Click to upload files or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, TXT, MD, DOC, DOCX files supported
                      </p>
                    </label>
                  </div>

                  {/* File List */}
                  {contextFiles.length > 0 && (
                    <div className="space-y-2">
                      {contextFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText size={16} className="text-blue-400" />
                            <div>
                              <p className="text-sm text-white">{file.name}</p>
                              <p className="text-xs text-gray-400">
                                {Math.round(file.size / 1024)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleFileRemove(file.id)}
                            className="p-1 hover:bg-gray-700 rounded transition-colors"
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {isUploading && (
                    <div className="text-center py-2">
                      <Loader2 size={16} className="animate-spin text-blue-400 mx-auto" />
                      <p className="text-xs text-gray-400 mt-1">Uploading files...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Test Your Agent</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Chat with your agent to test its responses before finalizing.
                </p>
              </div>

              {/* Chat Messages */}
              <div className="bg-gray-800/50 rounded-lg p-4 h-48 overflow-y-auto">
                {testMessages.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <MessageCircle size={32} className="mx-auto mb-2" />
                    <p>Start a conversation to test your agent</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-700 text-gray-100'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          {message.isStreaming && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" />
                              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-100" />
                              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-200" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTestMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  disabled={isTestRunning}
                />
                <button
                  onClick={handleTestMessage}
                  disabled={!testInput.trim() || isTestRunning}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isTestRunning ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Review & Update</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Review your agent configuration and update it.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Agent Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white">{agentConfig.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mode:</span>
                      <span className="text-white">{agentConfig.mode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Description:</span>
                      <span className="text-white">{agentConfig.description || 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Context Files:</span>
                      <span className="text-white">{contextFiles.length} files</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">System Prompt</h4>
                  <div className="bg-gray-900/50 rounded p-3 text-sm text-gray-300 max-h-24 overflow-y-auto">
                    {agentConfig.system_prompt}
                  </div>
                </div>

                {contextFiles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Context Files</h4>
                    <div className="space-y-1">
                      {contextFiles.map((file) => (
                        <div key={file.id} className="flex items-center gap-2 text-sm">
                          <FileText size={14} className="text-blue-400" />
                          <span className="text-gray-300">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700/50 flex-shrink-0">
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep((step - 1) as 1 | 2 | 3)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep((step + 1) as 1 | 2 | 3)}
                disabled={step === 1 && (!agentConfig.name.trim() || !agentConfig.system_prompt.trim())}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
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
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Update Agent
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditAgentModal;
