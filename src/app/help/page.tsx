"use client";

import React, { useState, useRef } from 'react';
import * as motion from "motion/react-client";
import { 
  ArrowLeft,
  Search,
  Sparkles,
  MessageCircle,
  Video,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  FileText,
  X,
  Loader2
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { warroomService } from '../../services/warroomService';
import AppHeader from '@/components/AppHeader';

// Mock help articles data
const helpArticles = [
  {
    id: 'getting-started',
    title: 'Getting Started with SaintSal™',
    category: 'Getting Started',
    content: `# Getting Started with SaintSal™

Welcome to SaintSal™, your AI-powered business assistant! This guide will help you get up and running quickly.

## Initial Setup

1. **Create Your Account**: Sign up using your email address
2. **Choose Your Agent**: Select from Enterprise, Founder, Customer, or White Label modes
3. **Configure Preferences**: Set up your communication style and business context

## First Steps

- Start with a simple business question
- Upload relevant documents for context
- Explore different AI models (GPT-5, Claude, Dual AI)

## Tips for Better Results

- Be specific in your questions
- Provide context about your business
- Use the professional tools for structured analysis`,
    tags: ['setup', 'beginner', 'account', 'configuration'],
    readTime: '5 min read'
  },
  {
    id: 'ai-models',
    title: 'Understanding AI Models',
    category: 'Features & Tools',
    content: `# Understanding AI Models

SaintSal™ offers multiple AI models, each with unique strengths:

## Available Models

### GPT-5
- Best for: Creative writing, complex reasoning
- Strengths: Broad knowledge, conversational
- Use when: You need creative solutions or general knowledge

### Claude 3
- Best for: Analysis, detailed explanations
- Strengths: Careful reasoning, helpful explanations
- Use when: You need thorough analysis or detailed breakdowns

### Dual AI (Recommended)
- Best for: Comprehensive responses
- Strengths: Combines both models for optimal results
- Use when: You want the best possible response

## Choosing the Right Model

- **Dual AI**: For most business tasks
- **GPT-5**: For creative projects
- **Claude**: For analytical work`,
    tags: ['ai', 'models', 'gpt', 'claude', 'dual'],
    readTime: '4 min read'
  },
  {
    id: 'file-upload',
    title: 'File Upload and Context',
    category: 'Features & Tools',
    content: `# File Upload and Context

Learn how to upload files and provide context to improve AI responses.

## Supported File Types

- **PDFs**: Documents, reports, manuals
- **Text Files**: Notes, scripts, documentation
- **Images**: Charts, diagrams, screenshots
- **CSV**: Data files, spreadsheets

## Upload Process

1. Click the paperclip icon in the chat
2. Select your files (multiple files supported)
3. Wait for processing to complete
4. Files are automatically analyzed and added to context

## Best Practices

- Upload relevant business documents
- Keep files under 10MB for faster processing
- Use descriptive filenames
- Combine multiple related documents for better context`,
    tags: ['files', 'upload', 'context', 'documents'],
    readTime: '3 min read'
  },
  {
    id: 'billing-plans',
    title: 'Billing Plans and Pricing',
    category: 'Billing & Plans',
    content: `# Billing Plans and Pricing

Choose the plan that fits your business needs.

## Available Plans

### Free Access (Limited)
- Basic AI chat functionality
- Limited daily interactions
- Community support
- **Price**: $0/month

### Unlimited
- Unlimited AI interactions
- Priority response time
- Advanced AI models
- Email support
- **Price**: $27/month

### Pro
- Everything in Unlimited
- Advanced analytics
- API access
- Priority support
- Custom integrations
- **Price**: $97/month

### Teams
- Everything in Pro
- 5 team member seats
- Team management dashboard
- Shared AI resources
- **Price**: $297/month

## Upgrading Your Plan

1. Go to Account Settings
2. Click "Upgrade Plan"
3. Choose your new plan
4. Complete payment securely via Stripe

## Billing Questions

- All plans are billed monthly
- You can cancel anytime
- Refunds available within 7 days
- Contact support for billing issues`,
    tags: ['billing', 'pricing', 'plans', 'upgrade'],
    readTime: '6 min read'
  },
  {
    id: 'security-privacy',
    title: 'Security and Privacy',
    category: 'Security & Privacy',
    content: `# Security and Privacy

Your data security and privacy are our top priorities.

## Data Protection

- **Encryption**: AES-256 encryption for all stored data
- **Access Control**: Role-based access with Supabase RLS
- **Infrastructure**: Zero-trust network architecture
- **Hosting**: SOC 2-compliant infrastructure

## Privacy Practices

### What We Collect
- Name, email, phone (if provided)
- Chat interactions and context
- Usage analytics (anonymized)
- Business documents you upload

### What We Never Do
- Sell your personal data
- Share information without consent
- Train external models with your data
- Track you across other websites

## Compliance

We comply with international data protection regulations:
- GDPR (EU)
- CCPA (California)
- PIPEDA (Canada)
- LGPD (Brazil)

## Data Retention

- **Free Users**: 30 days for chat logs
- **Paid Users**: Up to 365 days (user controlled)
- **Immediate Deletion**: Available upon request`,
    tags: ['security', 'privacy', 'data', 'encryption', 'compliance'],
    readTime: '5 min read'
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting Common Issues',
    category: 'Troubleshooting',
    content: `# Troubleshooting Common Issues

Solutions to common problems you might encounter.

## Chat Issues

### AI Not Responding
- Check your internet connection
- Try refreshing the page
- Clear browser cache and cookies
- Contact support if problem persists

### Slow Responses
- Dual AI mode may take longer
- Large file uploads need more processing time
- Try using single AI model for faster responses

### Incomplete Responses
- Check if response is still streaming
- Wait for "Complete" indicator
- Try rephrasing your question

## File Upload Issues

### Upload Failed
- Check file size (max 10MB)
- Ensure file type is supported
- Try uploading one file at a time
- Check internet connection

### File Not Processing
- Wait for processing to complete
- Check file format is correct
- Try uploading a smaller file
- Contact support if issue continues

## Account Issues

### Can't Sign In
- Check email and password
- Try password reset
- Clear browser data
- Contact support for account recovery

### Billing Problems
- Check payment method
- Verify billing address
- Contact billing support
- Check for payment notifications`,
    tags: ['troubleshooting', 'issues', 'problems', 'solutions'],
    readTime: '7 min read'
  }
];

export default function HelpPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(typeof helpArticles[0] & { isAI?: boolean })[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<(typeof helpArticles[0] & { isAI?: boolean }) | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    gettingStarted: false,
    featuresTools: false,
    billingPlans: false,
    securityPrivacy: false,
    troubleshooting: false
  });

  // Refs for debouncing and preventing multiple calls
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSearchingRef = useRef(false);
  const aiResponseRef = useRef('');

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };


  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    // Prevent multiple simultaneous searches
    if (isSearchingRef.current) {
      return;
    }

    isSearchingRef.current = true;
    setIsSearching(true);
    aiResponseRef.current = '';
    
    try {
      // Create context from all help articles for AI
      const articlesContext = helpArticles.map(article => 
        `Title: ${article.title}\nCategory: ${article.category}\nContent: ${article.content}\nTags: ${article.tags.join(', ')}\n\n`
      ).join('');

      // Create AI prompt for help search
      const systemPrompt = `You are an AI assistant for SaintSal™'s Help & Support system. You have access to all help articles and can provide intelligent search results.

CONTEXT ARTICLES:
${articlesContext}

INSTRUCTIONS:
1. Analyze the user's search query: "${searchQuery}"
2. Find the most relevant help articles based on the query
3. Provide a comprehensive AI response that directly answers their question
4. Reference specific articles when relevant
5. If the query is about something not covered in the articles, suggest related topics or direct them to contact support
6. Be helpful, concise, and professional
7. Always end with suggestions for next steps or related articles

RESPONSE FORMAT (USE MARKDOWN):
- Start with a direct answer to their question
- Use **bold** for emphasis and important points
- Use \`code\` for technical terms, buttons, or file names
- Use bullet points (-) for lists
- Use numbered lists (1., 2., 3.) for step-by-step instructions
- Reference specific articles by title when relevant
- Provide actionable next steps
- Suggest related topics if applicable

IMPORTANT: Format your response using proper markdown syntax for better readability.`;

      // Prepare messages for AI
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: searchQuery }
      ];

      // Initialize AI response in results
      setSearchResults([{
        id: 'ai-response',
        title: 'AI Assistant Response',
        category: 'AI Summary',
        content: 'AI is thinking...',
        tags: ['ai', 'summary', 'assistant'],
        readTime: 'AI Generated',
        isAI: true
      }]);
      
      // Use single AI streaming to reduce backend load
      const callbacks = {
        onStart: () => {
          // AI search started
        },
        onChunk: (chunk: string) => {
          aiResponseRef.current += chunk;
          // Update immediately for real-time streaming (remove debouncing for better UX)
          setSearchResults(prev => {
            const aiResult = prev.find(r => r.id === 'ai-response');
            if (aiResult) {
              return prev.map(r => 
                r.id === 'ai-response' 
                  ? { ...r, content: aiResponseRef.current }
                  : r
              );
            } else {
              return [{
                id: 'ai-response',
                title: 'AI Assistant Response',
                category: 'AI Summary',
                content: aiResponseRef.current,
                tags: ['ai', 'summary', 'assistant'],
                readTime: 'AI Generated',
                isAI: true
              }];
            }
          });
        },
        onComplete: () => {
          // AI search completed - final update with complete response
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }
          setSearchResults(prev => prev.map(r => 
            r.id === 'ai-response' 
              ? { ...r, content: aiResponseRef.current }
              : r
          ));
        },
        onError: (error: string) => {
          setSearchResults([{
            id: 'ai-response',
            title: 'AI Assistant Response',
            category: 'AI Summary',
            content: `Sorry, I encountered an error while searching: ${error}. Please try again or contact support for help.`,
            tags: ['ai', 'error', 'assistant'],
            readTime: 'AI Generated',
            isAI: true
          }]);
        }
      };

      // Use single AI (OpenAI) instead of dual AI to reduce backend calls
      await warroomService.getAIStreaming('openai', messages, callbacks);

      // Also find relevant articles for additional context
      const query = searchQuery.toLowerCase();
      const relevantArticles = helpArticles
        .filter(article => {
          const searchableText = `${article.title} ${article.content} ${article.tags.join(' ')}`.toLowerCase();
          return searchableText.includes(query);
        })
        .sort((a, b) => {
          // Calculate relevance score
          let relevanceA = 0;
          let relevanceB = 0;
          const queryWords = query.split(' ');
          
          queryWords.forEach(word => {
            if (a.title.toLowerCase().includes(word)) relevanceA += 3;
            if (a.content.toLowerCase().includes(word)) relevanceA += 2;
            if (a.tags.some(tag => tag.toLowerCase().includes(word))) relevanceA += 1;
            
            if (b.title.toLowerCase().includes(word)) relevanceB += 3;
            if (b.content.toLowerCase().includes(word)) relevanceB += 2;
            if (b.tags.some(tag => tag.toLowerCase().includes(word))) relevanceB += 1;
          });
          
          return relevanceB - relevanceA;
        })
        .slice(0, 3); // Show fewer articles since AI response is primary

      // Add relevant articles to results (excluding AI response if it already exists)
      setSearchResults(prev => {
        const existingResults = prev.filter(r => r.id !== 'ai-response');
        return [...prev, ...relevantArticles.filter(article => 
          !existingResults.some(existing => existing.id === article.id)
        )];
      });

    } catch (error) {
      setSearchResults([{
        id: 'ai-response',
        title: 'AI Assistant Response',
        category: 'AI Summary',
        content: `Sorry, I encountered an error while searching: ${error}. Please try again or contact support for help.`,
        tags: ['ai', 'error', 'assistant'],
        readTime: 'AI Generated',
        isAI: true
      }]);
    } finally {
      setIsSearching(false);
      isSearchingRef.current = false;
      // Clean up timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    }
  };

  const renderMarkdownContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('# ')) {
        return (
          <h1 key={index} className="text-2xl font-bold text-white mb-4 mt-6">
            {trimmedLine.substring(2)}
          </h1>
        );
      } else if (trimmedLine.startsWith('## ')) {
        return (
          <h2 key={index} className="text-xl font-semibold text-white mb-3 mt-5">
            {trimmedLine.substring(3)}
          </h2>
        );
      } else if (trimmedLine.startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-white mb-2 mt-4">
            {trimmedLine.substring(4)}
          </h3>
        );
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
        return (
          <div key={index} className="flex items-start gap-2 mb-2">
            <span className="text-cyan-400 mt-1">•</span>
            <span className="text-gray-300">{trimmedLine.substring(2)}</span>
          </div>
        );
      } else if (trimmedLine.match(/^\d+\.\s/)) {
        // Handle numbered lists
        return (
          <div key={index} className="flex items-start gap-2 mb-2">
            <span className="text-cyan-400 mt-1">{trimmedLine.match(/^\d+\./)?.[0]}</span>
            <span className="text-gray-300">{trimmedLine.replace(/^\d+\.\s/, '')}</span>
          </div>
        );
      } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        return (
          <p key={index} className="text-white font-semibold mb-2">
            {trimmedLine.substring(2, trimmedLine.length - 2)}
          </p>
        );
      } else if (trimmedLine === '') {
        return <div key={index} className="h-4" />;
      } else if (trimmedLine.length > 0) {
        // Handle inline formatting like **bold** and `code`
        const formatText = (text: string) => {
          const parts = [];
          let remaining = text;
          let key = 0;
          
          while (remaining.length > 0) {
            // Handle **bold** text
            const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
            if (boldMatch) {
              const beforeBold = remaining.substring(0, boldMatch.index);
              if (beforeBold) {
                parts.push(
                  <span key={key++}>{formatInlineText(beforeBold)}</span>
                );
              }
              parts.push(
                <strong key={key++} className="text-white font-semibold">
                  {formatInlineText(boldMatch[1])}
                </strong>
              );
              remaining = remaining.substring(boldMatch.index! + boldMatch[0].length);
            } else {
              parts.push(
                <span key={key++}>{formatInlineText(remaining)}</span>
              );
              break;
            }
          }
          
          return parts.length > 1 ? parts : formatInlineText(text);
        };
        
        const formatInlineText = (text: string) => {
          // Handle `code` spans
          const codeMatch = text.match(/`(.*?)`/);
          if (codeMatch) {
            const beforeCode = text.substring(0, codeMatch.index);
            const afterCode = text.substring(codeMatch.index! + codeMatch[0].length);
            return (
              <>
                {beforeCode}
                <code className="bg-gray-700/50 text-cyan-300 px-1 py-0.5 rounded text-sm font-mono">
                  {codeMatch[1]}
                </code>
                {afterCode}
              </>
            );
          }
          return text;
        };
        
        return (
          <p key={index} className="text-gray-300 mb-2 leading-relaxed">
            {formatText(trimmedLine)}
          </p>
        );
      }
      return null;
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* App Header */}
      <AppHeader />
      
      {/* Header */}
      <div className="border-b border-white/20 p-6 pt-24">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Help & Support</h1>
            <p className="text-sm text-gray-400">How Can We Help You?</p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {/* Search Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            How Can We <span className="text-cyan-400">Help</span> You?
          </h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Get instant answers, browse our knowledge base, or connect with our expert support team.
          </p>
          
          <div className="flex gap-3 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                placeholder="Ask AI anything about SaintSal™ - features, billing, troubleshooting..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-cyan-400/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <button
              onClick={performSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 py-3 bg-cyan-500 text-black rounded-lg font-semibold hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  AI Searching...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  AI Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">AI-Powered Search Results</h3>
            
            {searchResults.map((result, index) => (
              <motion.div
                key={result.id}
                className={`mb-4 p-6 rounded-xl border-l-4 ${
                  result.isAI 
                    ? 'bg-gray-800/30 border-l-yellow-400' 
                    : 'bg-gray-800/50 border-l-cyan-400'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  {result.isAI ? (
                    <Sparkles size={20} className="text-yellow-400" />
                  ) : (
                    <FileText size={20} className="text-cyan-400" />
                  )}
                  <h4 className="text-lg font-semibold text-white">{result.title}</h4>
                  <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                    {result.readTime}
                  </span>
                </div>
                
                <div className="text-gray-300 mb-3">
                  {result.isAI ? (
                    <div className="prose prose-invert max-w-none">
                      {renderMarkdownContent(result.content)}
                    </div>
                  ) : (
                    <p>{result.content.split('\n')[0]}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {result.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                      <span key={tagIndex} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectedArticle(result)}
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                  >
                    View Full Article
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Support Options */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">Get Support</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 p-6 rounded-xl text-center hover:bg-gray-800/70 transition-colors cursor-pointer">
              <MessageCircle size={32} className="text-cyan-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">Live Chat Support</h4>
              <p className="text-gray-400 text-sm mb-2">Get instant help from our AI-powered support team</p>
              <span className="text-xs text-cyan-400">24/7 Available</span>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-xl text-center hover:bg-gray-800/70 transition-colors cursor-pointer">
              <Video size={32} className="text-cyan-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">Video Tutorials</h4>
              <p className="text-gray-400 text-sm mb-2">Watch step-by-step guides and feature demonstrations</p>
              <span className="text-xs text-cyan-400">Self-Paced Learning</span>
            </div>
            
            <a
              href="mailto:support@cookin.io"
              className="bg-gray-800/50 p-6 rounded-xl text-center hover:bg-gray-800/70 transition-colors"
            >
              <Mail size={32} className="text-cyan-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">Email Support</h4>
              <p className="text-gray-400 text-sm mb-2">Send detailed questions to our expert support team</p>
              <span className="text-xs text-cyan-400">support@cookin.io</span>
            </a>
            
            <a
              href="tel:9499972097"
              className="bg-gray-800/50 p-6 rounded-xl text-center hover:bg-gray-800/70 transition-colors"
            >
              <Phone size={32} className="text-cyan-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">Priority Support</h4>
              <p className="text-gray-400 text-sm mb-2">Direct phone line for Enterprise customers</p>
              <span className="text-xs text-cyan-400">949-997-2097</span>
            </a>
          </div>
        </div>

        {/* Browse by Category */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-6">
            Browse by <span className="text-cyan-400">Category</span>
          </h3>
          
          <div className="space-y-4">
            {[
              { key: 'gettingStarted', title: 'Getting Started', icon: '⚙️', articles: helpArticles.filter(a => a.category === 'Getting Started') },
              { key: 'featuresTools', title: 'Features & Tools', icon: '🛠️', articles: helpArticles.filter(a => a.category === 'Features & Tools') },
              { key: 'billingPlans', title: 'Billing & Plans', icon: '💳', articles: helpArticles.filter(a => a.category === 'Billing & Plans') },
              { key: 'securityPrivacy', title: 'Security & Privacy', icon: '🔒', articles: helpArticles.filter(a => a.category === 'Security & Privacy') },
              { key: 'troubleshooting', title: 'Troubleshooting', icon: '🔧', articles: helpArticles.filter(a => a.category === 'Troubleshooting') }
            ].map((section) => (
              <div key={section.key} className="bg-gray-800/50 rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-700/50 transition-colors"
                  onClick={() => toggleSection(section.key)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{section.icon}</span>
                    <h4 className="text-lg font-semibold text-white">{section.title}</h4>
                  </div>
                  {expandedSections[section.key] ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </button>
                
                {expandedSections[section.key] && (
                  <div className="p-6 pt-0">
                    <div className="space-y-3">
                      {section.articles.map((article) => (
                        <button
                          key={article.id}
                          className="w-full text-left flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                          onClick={() => setSelectedArticle(article)}
                        >
                          <div className="flex items-center gap-3">
                            <FileText size={16} className="text-gray-400" />
                            <span className="text-white">{article.title}</span>
                          </div>
                          <span className="text-xs text-gray-400">{article.readTime}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 p-6 bg-gray-800/30 rounded-xl">
          <p className="text-gray-400 mb-2">
            Powered by <span className="text-white font-semibold">SAINTSAL GOTTA GUY</span> ⭐
          </p>
          <p className="text-cyan-400 text-sm italic">Always Here When You Need Us</p>
        </div>
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <div className="flex items-center gap-3">
                {selectedArticle.isAI ? (
                  <Sparkles size={24} className="text-yellow-400" />
                ) : (
                  <FileText size={24} className="text-cyan-400" />
                )}
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedArticle.title}</h3>
                  <p className="text-sm text-gray-400">{selectedArticle.category} • {selectedArticle.readTime}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-invert max-w-none">
                {renderMarkdownContent(selectedArticle.content)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
