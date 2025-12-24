"use client";

import * as motion from "motion/react-client";
import Image from 'next/image';
import { MessageCircle, Zap, FileText, ArrowRight, Copy, CheckCircle, Code, Key, Shield, Clock, Users, BarChart3, ExternalLink } from "lucide-react";
import { useState } from 'react';
import AppHeader from '@/components/AppHeader';

export default function APIGuide() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const codeExamples = {
    createKey: `curl -X POST https://saintsal-backend-0mv8.onrender.com/api/api-keys/keys \\
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "your-agent-id",
    "name": "My App Key",
    "permissions": ["read", "write"],
    "rate_limit_per_minute": 30,
    "rate_limit_per_hour": 500,
    "rate_limit_per_day": 5000
  }'`,
    
    chat: `curl -X POST https://saintsal-backend-0mv8.onrender.com/api/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hello! Can you help me with my business?",
    "context_files": "Additional context data here...",
    "stream": false
  }'`,
    
    streaming: `curl -X POST https://saintsal-backend-0mv8.onrender.com/api/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Tell me about your capabilities",
    "stream": true
  }'`,
    
    agentFiles: `curl -X GET https://saintsal-backend-0mv8.onrender.com/api/v1/agent/files \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    
    agentInfo: `curl -X GET https://saintsal-backend-0mv8.onrender.com/api/v1/agent/info \\
  -H "Authorization: Bearer YOUR_API_KEY"`
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* App Header */}
      <AppHeader />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-full text-gray-300 text-sm font-medium mb-8">
              Developer Documentation
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              SAINTSAL™ AI
              <span className="block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                API Reference
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Integrate SAINTSAL™ AI into your applications with our powerful REST API. Create agents, manage API keys, and build intelligent workflows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/agent-hub"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Key size={18} />
                Create API Keys
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <motion.a
                href="#quick-start"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-md border border-white/20 text-white rounded-xl font-semibold hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Code size={18} />
                Quick Start
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section id="quick-start" className="py-20 bg-white/2 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Quick Start Guide
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get up and running with SAINTSAL™ AI API in minutes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create an Agent",
                description: "Go to Agent Hub and create a specialized AI agent with custom prompts and files.",
                icon: Users,
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "2", 
                title: "Generate API Key",
                description: "Create an API key for your agent with custom permissions and rate limits.",
                icon: Key,
                color: "from-green-500 to-emerald-500"
              },
              {
                step: "3",
                title: "Start Building",
                description: "Use the API key to integrate AI capabilities into your applications.",
                icon: Code,
                color: "from-purple-500 to-pink-500"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mb-6`}>
                  <span className="text-white font-bold text-2xl">{item.step}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-gray-300 text-lg leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* API Endpoints Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              API Endpoints
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Complete reference for all available API endpoints
            </p>
          </motion.div>

          <div className="space-y-8">
            {/* Create API Key */}
            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                  <Key size={24} className="text-gray-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Create API Key</h3>
                  <p className="text-gray-400">Generate a new API key for your agent</p>
                </div>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Request</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                    <div className="text-green-400 font-mono text-sm mb-2">POST /api/api-keys/keys</div>
                    <div className="text-gray-300 font-mono text-sm">
                      <div>Authorization: Bearer YOUR_SUPABASE_TOKEN</div>
                      <div>Content-Type: application/json</div>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-white mb-4">Body</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <pre className="text-gray-300 font-mono text-sm overflow-x-auto">
{`{
  "agent_id": "string",
  "name": "string",
  "permissions": ["read", "write"],
  "rate_limit_per_minute": 30,
  "rate_limit_per_hour": 500,
  "rate_limit_per_day": 5000,
  "expires_at": "2024-12-31T23:59:59Z"
}`}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">cURL Example</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4 relative">
                    <button
                      onClick={() => copyToClipboard(codeExamples.createKey, 'createKey')}
                      className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      {copiedCode === 'createKey' ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} className="text-gray-300" />}
                    </button>
                    <pre className="text-gray-300 font-mono text-sm overflow-x-auto">
{codeExamples.createKey}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Chat Endpoint */}
            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                  <MessageCircle size={24} className="text-gray-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Chat with Agent</h3>
                  <p className="text-gray-400">Send messages to your AI agent and get responses</p>
                </div>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Request</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                    <div className="text-green-400 font-mono text-sm mb-2">POST /api/v1/chat</div>
                    <div className="text-gray-300 font-mono text-sm">
                      <div>Authorization: Bearer YOUR_API_KEY</div>
                      <div>Content-Type: application/json</div>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-white mb-4">Body</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <pre className="text-gray-300 font-mono text-sm overflow-x-auto">
{`{
  "message": "string",
  "context_files": "string (optional)",
  "stream": false
}`}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">cURL Example</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4 relative">
                    <button
                      onClick={() => copyToClipboard(codeExamples.chat, 'chat')}
                      className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      {copiedCode === 'chat' ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} className="text-gray-300" />}
                    </button>
                    <pre className="text-gray-300 font-mono text-sm overflow-x-auto">
{codeExamples.chat}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Streaming Chat */}
            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                  <Zap size={24} className="text-gray-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Streaming Chat</h3>
                  <p className="text-gray-400">Get real-time streaming responses from your agent</p>
                </div>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Request</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                    <div className="text-green-400 font-mono text-sm mb-2">POST /api/v1/chat</div>
                    <div className="text-gray-300 font-mono text-sm">
                      <div>Authorization: Bearer YOUR_API_KEY</div>
                      <div>Content-Type: application/json</div>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-white mb-4">Body</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <pre className="text-gray-300 font-mono text-sm overflow-x-auto">
{`{
  "message": "string",
  "stream": true
}`}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">cURL Example</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4 relative">
                    <button
                      onClick={() => copyToClipboard(codeExamples.streaming, 'streaming')}
                      className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      {copiedCode === 'streaming' ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} className="text-gray-300" />}
                    </button>
                    <pre className="text-gray-300 font-mono text-sm overflow-x-auto">
{codeExamples.streaming}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Get Agent Files */}
            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                  <FileText size={24} className="text-gray-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Get Agent Files</h3>
                  <p className="text-gray-400">Retrieve files associated with your agent</p>
                </div>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Request</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                    <div className="text-green-400 font-mono text-sm mb-2">GET /api/v1/agent/files</div>
                    <div className="text-gray-300 font-mono text-sm">
                      <div>Authorization: Bearer YOUR_API_KEY</div>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-white mb-4">Response</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <pre className="text-gray-300 font-mono text-sm overflow-x-auto">
{`{
  "success": true,
  "data": {
    "files": [
      {
        "id": "string",
        "name": "string",
        "mime_type": "string",
        "size": 1234,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "agent": {
      "id": "string",
      "name": "string",
      "description": "string"
    }
  }
}`}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">cURL Example</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4 relative">
                    <button
                      onClick={() => copyToClipboard(codeExamples.agentFiles, 'agentFiles')}
                      className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      {copiedCode === 'agentFiles' ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} className="text-gray-300" />}
                    </button>
                    <pre className="text-gray-300 font-mono text-sm overflow-x-auto">
{codeExamples.agentFiles}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Get Agent Info */}
            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                  <BarChart3 size={24} className="text-gray-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Get Agent Info</h3>
                  <p className="text-gray-400">Retrieve information about your agent</p>
                </div>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Request</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                    <div className="text-green-400 font-mono text-sm mb-2">GET /api/v1/agent/info</div>
                    <div className="text-gray-300 font-mono text-sm">
                      <div>Authorization: Bearer YOUR_API_KEY</div>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-white mb-4">Response</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <pre className="text-gray-300 font-mono text-sm overflow-x-auto">
{`{
  "success": true,
  "data": {
    "agent": {
      "id": "string",
      "name": "string",
      "description": "string",
      "prompt": "string",
      "model": "gpt-4",
      "temperature": 0.7,
      "max_tokens": 2000
    }
  }
}`}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">cURL Example</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4 relative">
                    <button
                      onClick={() => copyToClipboard(codeExamples.agentInfo, 'agentInfo')}
                      className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      {copiedCode === 'agentInfo' ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} className="text-gray-300" />}
                    </button>
                    <pre className="text-gray-300 font-mono text-sm overflow-x-auto">
{codeExamples.agentInfo}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/2 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              API Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Powerful features to build intelligent applications
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Secure Authentication",
                description: "API key-based authentication with granular permissions and secure storage."
              },
              {
                icon: Clock,
                title: "Rate Limiting",
                description: "Configurable rate limits per minute, hour, and day to control usage."
              },
              {
                icon: FileText,
                title: "Context Files",
                description: "Upload files to agents and include them in API calls for context-aware responses."
              },
              {
                icon: Zap,
                title: "Real-time Streaming",
                description: "Get streaming responses for real-time conversations and better UX."
              },
              {
                icon: BarChart3,
                title: "Usage Analytics",
                description: "Track API usage, performance metrics, and agent interactions."
              },
              {
                icon: Users,
                title: "Multi-Agent Support",
                description: "Create and manage multiple specialized agents for different use cases."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon size={24} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Create your first agent and start building intelligent applications with SAINTSAL™ AI
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.a
                href="/warroom"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-xl hover:shadow-2xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Key size={20} />
                Create Your First Agent
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.a>
              
              <motion.a
                href="/"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-semibold hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <ExternalLink size={20} />
                Back to Home
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/5 backdrop-blur-xl border-t border-white/20 py-12 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div
              className="flex items-center gap-2 text-2xl font-bold text-white mb-4 md:mb-0"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Image src="/logo.png" alt="SaintSal™ Logo" width={20} height={20} />
              </div>
              SaintSal™ AI
            </motion.div>
            
            <motion.div
              className="flex flex-col md:flex-row gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="text-center md:text-left">
                <h4 className="text-white font-semibold mb-2">Resources</h4>
                <div className="space-y-1">
                  <a href="/agent-hub" className="block text-gray-400 hover:text-white transition-colors hover:bg-white/5 px-2 py-1 rounded-lg">Agent Hub</a>
                  <a href="/api-guide" className="block text-gray-400 hover:text-white transition-colors hover:bg-white/5 px-2 py-1 rounded-lg">API Guide</a>
                  <a href="/chat" className="block text-gray-400 hover:text-white transition-colors hover:bg-white/5 px-2 py-1 rounded-lg">AI Chat</a>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            className="mt-8 pt-8 border-t border-white/10 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-gray-400">
              © 2024 SaintSal™ AI. Automate Smarter, Optimize Faster, and Grow Stronger.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
