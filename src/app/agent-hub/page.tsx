'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import AppHeader from '@/components/AppHeader';
import { Send, X, Bot, User, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
// Removed warroomService import since we're using API key authentication

interface Agent {
  id: string;
  name: string;
  description: string;
  mode: string;
  provider: string;
  model: string;
  temperature: number;
  max_tokens: number;
  file_count: number;
  created_at: string;
  updated_at: string;
}

interface ApiKey {
  id: string;
  name: string;
  agent: {
    id: string;
    name: string;
    description: string;
  };
  permissions: string[];
  rate_limit_per_minute: number;
  rate_limit_per_hour: number;
  rate_limit_per_day: number;
  expires_at: string | null;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatMessageWithId extends ChatMessage {
  id: string;
}

export default function AgentHub() {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'agents' | 'keys'>('agents');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [createdKey, setCreatedKey] = useState<{ name: string; key_value: string; agent: { name: string } } | null>(null);
  
  // Chat modal states
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessageWithId[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Form states
  const [keyForm, setKeyForm] = useState({
    agent_id: '',
    name: '',
    permissions: ['read', 'write'],
    rate_limit_per_minute: 30,
    rate_limit_per_hour: 500,
    rate_limit_per_day: 5000,
    expires_at: ''
  });

  // Fetch data
  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        showToast('Please sign in to view agents', 'error');
        return;
      }

      const response = await fetch('https://saintsal-backend-0mv8.onrender.com/api/agents', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setAgents(data.data.agents);
      } else {
        showToast(data.error || 'Failed to fetch agents', 'error');
      }
    } catch {
      showToast('Error fetching agents', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        showToast('Please sign in to view API keys', 'error');
        return;
      }

      const response = await fetch('https://saintsal-backend-0mv8.onrender.com/api/api-keys/keys', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setApiKeys(data.data.api_keys);
      } else {
        showToast(data.error || 'Failed to fetch API keys', 'error');
      }
    } catch {
      showToast('Error fetching API keys', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    if (activeTab === 'keys') {
      fetchApiKeys();
    }
  }, [activeTab, fetchApiKeys]);


  // Create API key
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        showToast('Please sign in to create API keys', 'error');
        return;
      }

      const response = await fetch('https://saintsal-backend-0mv8.onrender.com/api/api-keys/keys', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          ...keyForm,
          expires_at: keyForm.expires_at || null
        })
      });
      const data = await response.json();
      if (data.success) {
        showToast('API key created successfully!', 'success');
        setCreatedKey(data.data.api_key);
        // Store the API key value temporarily for display (only shown once)
        setSelectedApiKey(data.data.api_key.key_value);
        setShowCreateKey(false);
        setKeyForm({
          agent_id: '',
          name: '',
          permissions: ['read', 'write'],
          rate_limit_per_minute: 30,
          rate_limit_per_hour: 500,
          rate_limit_per_day: 5000,
          expires_at: ''
        });
        fetchApiKeys();
      } else {
        showToast(data.error || 'Failed to create API key', 'error');
      }
    } catch {
      showToast('Error creating API key', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete API key
  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        showToast('Please sign in to delete API keys', 'error');
        return;
      }

      const response = await fetch(`https://saintsal-backend-0mv8.onrender.com/api/api-keys/keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        showToast('API key deleted successfully', 'success');
        fetchApiKeys();
      } else {
        showToast(data.error || 'Failed to delete API key', 'error');
      }
    } catch {
      showToast('Error deleting API key', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  // Chat functions
  const openChatModal = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowChatModal(true);
    setChatMessages([]);
    setChatInput('');
    setSelectedApiKey('');
  };

  const closeChatModal = () => {
    setShowChatModal(false);
    setSelectedAgent(null);
    setChatMessages([]);
    setChatInput('');
    setSelectedApiKey('');
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !selectedApiKey || !selectedAgent) return;

    const userMessage: ChatMessageWithId = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const messageToSend = chatInput.trim();
    setChatInput('');
    setIsChatLoading(true);

    // Create a placeholder assistant message for streaming
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessageWithId = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, assistantMessage]);

    try {
        // Use the API key-authenticated endpoint with conversation history support
        const response = await fetch('https://saintsal-backend-0mv8.onrender.com/api/v1/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${selectedApiKey}`
          },
          body: JSON.stringify({
            message: messageToSend,
            messages: chatMessages.map(msg => ({ 
              role: msg.role, 
              content: msg.content 
            })),
            stream: true
          })
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body reader available');
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
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'chunk' && data.content) {
                  // Accumulate the streaming content
                  setChatMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessageId 
                        ? { ...msg, content: msg.content + data.content }
                        : msg
                    )
                  );
                } else if (data.type === 'complete') {
                  setIsChatLoading(false);
                  break;
                } else if (data.type === 'error') {
                  throw new Error(data.error || 'Unknown error occurred');
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError);
              }
            }
          }
        }

    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Error sending message', 'error');
      // Remove the placeholder message on error
      setChatMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
      setIsChatLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatLoading]);

  const handleManualApiKeyChange = (value: string) => {
    setSelectedApiKey(value);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* App Header */}
      <AppHeader />
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-purple-900/20"></div>
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-pink-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-xl border border-white/20 hover:border-white/30 hover:bg-white/10 transition-all duration-300 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
            <span className="text-gray-300 group-hover:text-white font-medium transition-colors duration-300">Back</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            Agent Hub
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Manage your AI agents and create API keys for third-party access
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-2xl">
            <button
              onClick={() => setActiveTab('agents')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'agents'
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-md border border-white/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Agents
            </button>
            <button
              onClick={() => setActiveTab('keys')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'keys'
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-md border border-white/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              API Keys
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {activeTab === 'agents' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Your Agents</h2>
              </div>

              {loading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-gray-300 text-lg">Loading agents...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {agents.map((agent) => (
                    <div key={agent.id} className="group bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openChatModal(agent)}
                            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-sm transition-all duration-300 backdrop-blur-md border border-white/20"
                          >
                            Chat
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-3">{agent.name}</h3>
                      <p className="text-gray-300 mb-6 leading-relaxed">{agent.description}</p>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Mode</span>
                          <span className="text-white font-medium">{agent.mode}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Provider</span>
                          <span className="text-white font-medium">{agent.provider}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Model</span>
                          <span className="text-white font-medium">{agent.model}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Files</span>
                          <span className="text-white font-medium">{agent.file_count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'keys' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">API Keys</h2>
                <button
                  onClick={() => setShowCreateKey(true)}
                  className="group px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 hover:border-white/30 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create API Key
                </button>
              </div>

              {loading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-gray-300 text-lg">Loading API keys...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 shadow-2xl">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2">{key.name}</h3>
                            <p className="text-gray-300 mb-4">
                              <span className="font-medium">Agent:</span> {key.agent.name}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg text-sm transition-all duration-300 backdrop-blur-md border border-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-md border border-white/10">
                          <p className="text-gray-400 text-sm mb-2">Permissions</p>
                          <div className="flex flex-wrap gap-1">
                            {key.permissions.map((permission, index) => (
                              <span key={index} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs font-medium">
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-md border border-white/10">
                          <p className="text-gray-400 text-sm mb-2">Rate Limit (min)</p>
                          <p className="text-white font-bold text-lg">{key.rate_limit_per_minute}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-md border border-white/10">
                          <p className="text-gray-400 text-sm mb-2">Status</p>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            key.is_active 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {key.is_active ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-md border border-white/10">
                          <p className="text-gray-400 text-sm mb-2">Expires</p>
                          <p className="text-white font-medium">
                            {key.expires_at ? new Date(key.expires_at).toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create Key Modal */}
        {showCreateKey && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl w-full max-w-lg max-h-[90vh] border border-white/20 shadow-2xl flex flex-col">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-2xl font-bold text-white">Create API Key</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleCreateKey} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Agent</label>
                    <select
                      value={keyForm.agent_id}
                      onChange={(e) => setKeyForm({ ...keyForm, agent_id: e.target.value })}
                      className="w-full bg-white/5 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/20 focus:border-purple-500 focus:outline-none transition-all duration-300"
                      required
                    >
                      <option value="">Select an agent</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Key Name</label>
                    <input
                      type="text"
                      value={keyForm.name}
                      onChange={(e) => setKeyForm({ ...keyForm, name: e.target.value })}
                      className="w-full bg-white/5 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/20 focus:border-purple-500 focus:outline-none transition-all duration-300"
                      placeholder="e.g., My Chat Bot Key"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Permissions</label>
                    <div className="space-y-2">
                      {['read', 'write'].map((permission) => (
                        <label key={permission} className="flex items-center bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10 hover:border-white/20 transition-all duration-300">
                          <input
                            type="checkbox"
                            checked={keyForm.permissions.includes(permission)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setKeyForm({
                                  ...keyForm,
                                  permissions: [...keyForm.permissions, permission]
                                });
                              } else {
                                setKeyForm({
                                  ...keyForm,
                                  permissions: keyForm.permissions.filter(p => p !== permission)
                                });
                              }
                            }}
                            className="mr-3 w-4 h-4 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                          />
                          <span className="text-white capitalize font-medium">{permission}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Rate/min</label>
                      <input
                        type="number"
                        value={keyForm.rate_limit_per_minute}
                        onChange={(e) => setKeyForm({ ...keyForm, rate_limit_per_minute: parseInt(e.target.value) })}
                        className="w-full bg-white/5 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/20 focus:border-purple-500 focus:outline-none transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Rate/hour</label>
                      <input
                        type="number"
                        value={keyForm.rate_limit_per_hour}
                        onChange={(e) => setKeyForm({ ...keyForm, rate_limit_per_hour: parseInt(e.target.value) })}
                        className="w-full bg-white/5 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/20 focus:border-purple-500 focus:outline-none transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Rate/day</label>
                      <input
                        type="number"
                        value={keyForm.rate_limit_per_day}
                        onChange={(e) => setKeyForm({ ...keyForm, rate_limit_per_day: parseInt(e.target.value) })}
                        className="w-full bg-white/5 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/20 focus:border-purple-500 focus:outline-none transition-all duration-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Expires At (optional)</label>
                    <input
                      type="datetime-local"
                      value={keyForm.expires_at}
                      onChange={(e) => setKeyForm({ ...keyForm, expires_at: e.target.value })}
                      className="w-full bg-white/5 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/20 focus:border-purple-500 focus:outline-none transition-all duration-300"
                    />
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-white/10">
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    onClick={handleCreateKey}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 backdrop-blur-md border border-white/20 font-semibold"
                  >
                    {loading ? 'Creating...' : 'Create API Key'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateKey(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-6 py-3 rounded-xl transition-all duration-300 backdrop-blur-md border border-white/10 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Created Key Modal */}
        {createdKey && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl w-full max-w-lg border border-white/20 shadow-2xl">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-2xl font-bold text-white">API Key Created!</h3>
                <p className="text-gray-300 mt-2">Save this key securely - it won&apos;t be shown again</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Key Name</label>
                    <p className="text-white font-medium">{createdKey.name}</p>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Agent</label>
                    <p className="text-white font-medium">{createdKey.agent.name}</p>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">API Key</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={createdKey.key_value}
                        readOnly
                        className="flex-1 bg-white/5 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/20 font-mono text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(createdKey.key_value)}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl transition-all duration-300 backdrop-blur-md border border-white/20"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <p className="text-yellow-300 font-medium text-sm">Important Security Notice</p>
                        <p className="text-yellow-200 text-sm mt-1">
                          This API key will only be shown once. Make sure to copy and store it securely. 
                          You won&apos;t be able to see it again.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-white/10">
                <button
                  onClick={() => setCreatedKey(null)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300 backdrop-blur-md border border-white/20 font-semibold"
                >
                  I&apos;ve Saved the Key
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Modal */}
        {showChatModal && selectedAgent && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl w-full max-w-4xl h-[80vh] border border-white/20 shadow-2xl flex flex-col">
              {/* Chat Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedAgent.name}</h3>
                    <p className="text-gray-300 text-sm">{selectedAgent.description}</p>
                  </div>
                </div>
                <button
                  onClick={closeChatModal}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all duration-300 backdrop-blur-md border border-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* API Key Input - Manual Paste Only */}
              {!selectedApiKey && (
                <div className="p-6 border-b border-white/10">
                  <label className="block text-gray-300 text-sm font-medium mb-3">
                    Enter API Key for {selectedAgent.name}
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Paste your API key here (sk_...)"
                      value={selectedApiKey}
                      onChange={(e) => handleManualApiKeyChange(e.target.value)}
                      className="w-full bg-white/5 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/20 focus:border-purple-500 focus:outline-none transition-all duration-300 placeholder-gray-400"
                    />
                    <p className="text-gray-400 text-xs">
                      💡 Copy your API key from the &quot;Create API Key&quot; section above
                    </p>
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Start a conversation with {selectedAgent.name}</p>
                    <p className="text-gray-500 text-sm mt-2">Ask questions or give instructions to your AI agent</p>
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
                        className={`max-w-[80%] rounded-xl p-3 ${
                          message.role === 'user'
                            ? 'bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 text-white'
                            : 'bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 text-white'
                        }`}
                      >
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      {/* Avatar for user (right side) */}
                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gray-700/50 border border-white/20 flex items-center justify-center flex-shrink-0">
                          <User size={20} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 text-white border border-white/20 rounded-2xl p-4">
                      <div className="flex items-center space-x-3">
                        <Bot className="w-5 h-5 text-purple-400" />
                        <span className="text-sm text-gray-300">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* API Status */}
                {!isChatLoading && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs font-medium">API Ready</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Selected API Key Display */}
              {selectedApiKey && (
                <div className="p-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-green-400 text-sm font-medium">API Key Connected</p>
                        <p className="text-gray-400 text-xs">
                          Using API key: {selectedApiKey.substring(0, 8)}...{selectedApiKey.substring(selectedApiKey.length - 4)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedApiKey('');
                      }}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      Change Key
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Input */}
              {selectedApiKey && (
                <div className="p-6 border-t border-white/10">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 bg-white/5 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/20 focus:border-purple-500 focus:outline-none transition-all duration-300"
                      disabled={isChatLoading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!chatInput.trim() || isChatLoading}
                      className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-purple-200 px-6 py-3 rounded-xl transition-all duration-300 backdrop-blur-md border border-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Send className="w-5 h-5" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}