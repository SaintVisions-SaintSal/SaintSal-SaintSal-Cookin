'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as motion from "motion/react-client";
import Image from 'next/image';
import { supabase, getAuthToken } from '@/lib/supabase';
import { 
  ArrowLeft,
  RefreshCw,
  Database,
  FlaskConical,
  Users,
  MessageSquare,
  Image as ImageIcon,
  Bot,
  Mic,
  TrendingUp,
  Activity,
  Star,
  Clock,
  BarChart3,
  Shield,
  Server,
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";

// Types
interface AdminDashboardData {
  userAnalytics: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    userGrowthRate: number;
    tierBreakdown: {
      Basic: number;
      Pro: number;
      Teams: number;
      Unlimited: number;
      Enterprise: number;
      admin: number;
    };
    userEngagement: {
      dailyActiveUsers: number;
      weeklyActiveUsers: number;
      monthlyActiveUsers: number;
      averageSessionDuration: number;
    };
  };
  featureUsage: {
    chatScreen: {
      totalRequests: number;
      uniqueUsers: number;
      averageResponseTime: number;
      successRate: number;
    };
    warRoom: {
      totalRequests: number;
      uniqueUsers: number;
      averageResponseTime: number;
      successRate: number;
    };
    imageGenerator: {
      totalImagesGenerated: number;
      uniqueUsers: number;
      averageGenerationTime: number;
      successRate: number;
    };
    agents: {
      totalAgentsCreated: number;
      activeAgents: number;
      totalAgentInteractions: number;
      mostPopularAgent: string;
    };
    voiceFeatures: {
      totalVoiceInteractions: number;
      uniqueUsers: number;
      averageProcessingTime: number;
    };
  };
  contentAnalytics: {
    totalResponsesGenerated: number;
    averageResponseLength: number;
    totalImagesGenerated: number;
    contentQuality: {
      averageRating: number;
      totalRatings: number;
      positiveFeedback: number;
    };
    mostUsedFeatures: Array<{
      feature: string;
      count: number;
      totalTime: number;
      percentage: number;
    }>;
  };
  systemAnalytics: {
    uptime: number;
    totalApiCalls: number;
    averageResponseTime: number;
    errorRate: number;
    apiCosts: number;
    systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
  };
  databaseAnalytics: {
    totalTables: number;
    totalColumns: number;
    totalForeignKeys: number;
    totalIndexes: number;
    databaseHealth: 'excellent' | 'good' | 'fair' | 'poor';
  };
  lastUpdated: string;
}

interface AIAnalyticsData {
  totalResponses: number;
  averageResponseLength: number;
  totalTokens: number;
  averageProcessingTime: number;
  providerBreakdown: Record<string, number>;
  modelBreakdown: Record<string, number>;
  contentAnalysis: {
    withTables: number;
    withCodeBlocks: number;
    withImages: number;
    withMarkdown: number;
    imageGenerations: number;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [aiAnalytics, setAiAnalytics] = useState<AIAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication and admin role on component mount
  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
          
          // Check if user has admin role from backend
          const token = await getAuthToken();
          if (!token) {
            setError('Authentication required. Please log in to access admin features.');
            return;
          }

          // Check user permissions to verify admin role
          const permissionsResponse = await fetch('https://saintsal-backend-0mv8.onrender.com/api/roles/user/permissions', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (permissionsResponse.ok) {
            const permissionsData = await permissionsResponse.json();
            if (permissionsData.success && (permissionsData.data?.role?.role_name === 'Admin' || permissionsData.data?.role?.role_name === 'admin')) {
              loadDashboardData();
            } else {
              setError('Access denied. Admin privileges required.');
            }
          } else {
            setError('Failed to verify admin privileges.');
          }
        } else {
          setError('Authentication required. Please log in to access admin features.');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setError('Authentication failed. Please log in with admin credentials.');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setError('Authentication required. Please log in to access admin features.');
        setIsAuthenticated(false);
      } else if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        checkAuthAndRole();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get auth token using the proper Supabase method
      const token = await getAuthToken();
      
      if (!token) {
        setError('Authentication required. Please log in to access admin features.');
        setLoading(false);
        return;
      }

      // Make the requests with proper timeout handling
      const dashboardPromise = fetch('https://saintsal-backend-0mv8.onrender.com/api/admin/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include'
      });

      const aiPromise = fetch('https://saintsal-backend-0mv8.onrender.com/api/ai/analytics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include'
      }).catch(() => null);

      // Wait for the main dashboard GET request to complete (after OPTIONS preflight)
      const dashboardResponse = await dashboardPromise;

      if (!dashboardResponse.ok) {
        if (dashboardResponse.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else if (dashboardResponse.status === 401) {
          setError('Authentication failed. Please log in with admin credentials.');
        } else {
          setError('Failed to load dashboard data.');
        }
        return;
      }

      const dashboardResult = await dashboardResponse.json();
      if (dashboardResult.success) {
        setDashboardData(dashboardResult.data);
      } else {
        setError(dashboardResult.error || 'Failed to load dashboard data');
        return;
      }

      // Handle AI analytics separately (non-blocking)
      try {
        const aiResponse = await aiPromise;
        if (aiResponse && aiResponse.ok) {
          const aiResult = await aiResponse.json();
          if (aiResult.success) {
            setAiAnalytics(aiResult.data);
          }
        }
      } catch (aiError) {
        console.warn('AI analytics failed to load:', aiError);
        // Don't show error for AI analytics failure
      }

      setLastRefresh(new Date());
    } catch (error) {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTime = (seconds: number | undefined): string => {
    if (seconds === undefined || seconds === null || isNaN(seconds)) {
      return '0.00s';
    }
    return `${seconds.toFixed(2)}s`;
  };

  const formatPercentage = (value: number | undefined): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.00%';
    }
    return `${value.toFixed(2)}%`;
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return '#10B981';
      case 'good': return '#3B82F6';
      case 'fair': return '#F59E0B';
      case 'poor': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading Admin Dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching analytics data...</p>
        </div>
      </div>
    );
  }

  // Keep showing loading spinner until dashboard data is loaded
  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading Admin Dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 flex items-center justify-between border-b border-white/20 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => router.push('/warroom')}
            className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full hover:bg-white/20 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={24} className="text-white" />
          </motion.button>
          
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="SaintSal™ Logo" 
              width={40}
              height={40}
              className="w-10 h-10 rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-gray-400">SAINTSAL™ Analytics & Insights</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={onRefresh}
            className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full hover:bg-white/20 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={refreshing}
          >
            <RefreshCw size={20} className={`text-yellow-400 ${refreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 space-y-6 max-w-7xl mx-auto">
        {/* Last Updated */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Clock size={16} />
          <span>Last updated: {lastRefresh.toLocaleString()}</span>
        </div>

        {/* Key Metrics Overview */}
        <motion.div
          className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 size={24} className="text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Key Metrics Overview</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <Users size={24} className="text-blue-400" />
                <span className="text-sm text-gray-400">Total Users</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatNumber(dashboardData.userAnalytics.totalUsers)}
              </div>
              <div className="text-xs text-green-400">
                +{formatPercentage(dashboardData.userAnalytics.userGrowthRate)} this month
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare size={24} className="text-purple-400" />
                <span className="text-sm text-gray-400">Total Responses</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatNumber(aiAnalytics?.totalResponses || dashboardData.contentAnalytics.totalResponsesGenerated)}
              </div>
              <div className="text-xs text-gray-400">
                Avg length: {aiAnalytics?.averageResponseLength || dashboardData.contentAnalytics.averageResponseLength} chars
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <ImageIcon size={24} className="text-yellow-400" />
                <span className="text-sm text-gray-400">Images Generated</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatNumber(aiAnalytics?.contentAnalysis?.imageGenerations || dashboardData.contentAnalytics.totalImagesGenerated)}
              </div>
              <div className="text-xs text-gray-400">
                Success rate: {formatPercentage(dashboardData.featureUsage.imageGenerator.successRate)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* User Analytics */}
        <motion.div
          className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Users size={24} className="text-yellow-400" />
            <h2 className="text-xl font-bold text-white">User Analytics</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">User Engagement</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Daily Active Users</span>
                  <span className="text-white font-semibold">
                    {formatNumber(dashboardData.userAnalytics.userEngagement.dailyActiveUsers)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Weekly Active Users</span>
                  <span className="text-white font-semibold">
                    {formatNumber(dashboardData.userAnalytics.userEngagement.weeklyActiveUsers)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Monthly Active Users</span>
                  <span className="text-white font-semibold">
                    {formatNumber(dashboardData.userAnalytics.userEngagement.monthlyActiveUsers)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avg Session Duration</span>
                  <span className="text-white font-semibold">
                    {dashboardData.userAnalytics.userEngagement.averageSessionDuration} min
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Subscription Tiers</h3>
              <div className="space-y-3">
                {Object.entries(dashboardData.userAnalytics.tierBreakdown).map(([tier, count]) => (
                  <div key={tier} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: tier === 'Basic' ? '#6B7280' :
                                        tier === 'Pro' ? '#EAB308' :
                                        tier === 'Teams' ? '#8B5CF6' :
                                        tier === 'Unlimited' ? '#F59E0B' :
                                        tier === 'Enterprise' ? '#10B981' : '#EF4444'
                      }}
                    />
                    <span className="text-gray-400 flex-1">{tier}</span>
                    <span className="text-white font-semibold">{count} users</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Usage Analytics */}
        <motion.div
          className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap size={24} className="text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Feature Usage Analytics</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare size={20} className="text-blue-400" />
                <span className="text-sm font-semibold text-white">Chat Screen</span>
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {formatNumber(dashboardData.featureUsage.chatScreen.totalRequests)} requests
              </div>
              <div className="text-xs text-gray-400">
                {dashboardData.featureUsage.chatScreen.uniqueUsers} unique users
              </div>
              <div className="text-xs text-gray-400">
                {formatTime(dashboardData.featureUsage.chatScreen.averageResponseTime)} avg response
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <Shield size={20} className="text-purple-400" />
                <span className="text-sm font-semibold text-white">War Room</span>
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {formatNumber(dashboardData.featureUsage.warRoom.totalRequests)} requests
              </div>
              <div className="text-xs text-gray-400">
                {dashboardData.featureUsage.warRoom.uniqueUsers} unique users
              </div>
              <div className="text-xs text-gray-400">
                {formatTime(dashboardData.featureUsage.warRoom.averageResponseTime)} avg response
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <ImageIcon size={20} className="text-yellow-400" />
                <span className="text-sm font-semibold text-white">Image Generator</span>
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {formatNumber(dashboardData.featureUsage.imageGenerator.totalImagesGenerated)} images
              </div>
              <div className="text-xs text-gray-400">
                {dashboardData.featureUsage.imageGenerator.uniqueUsers} unique users
              </div>
              <div className="text-xs text-gray-400">
                {formatTime(dashboardData.featureUsage.imageGenerator.averageGenerationTime)} avg generation
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <Bot size={20} className="text-green-400" />
                <span className="text-sm font-semibold text-white">AI Agents</span>
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {dashboardData.featureUsage.agents.totalAgentsCreated} agents created
              </div>
              <div className="text-xs text-gray-400">
                {dashboardData.featureUsage.agents.activeAgents} active agents
              </div>
              <div className="text-xs text-gray-400">
                {formatNumber(dashboardData.featureUsage.agents.totalAgentInteractions)} interactions
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <Mic size={20} className="text-red-400" />
                <span className="text-sm font-semibold text-white">Voice Features</span>
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {formatNumber(dashboardData.featureUsage.voiceFeatures.totalVoiceInteractions)} interactions
              </div>
              <div className="text-xs text-gray-400">
                {dashboardData.featureUsage.voiceFeatures.uniqueUsers} unique users
              </div>
              <div className="text-xs text-gray-400">
                {formatTime(dashboardData.featureUsage.voiceFeatures.averageProcessingTime)} avg processing
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div
          className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Activity size={24} className="text-yellow-400" />
            <h2 className="text-xl font-bold text-white">System Health & Performance</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-4">
                <Server size={20} className="text-green-400" />
                <span className="text-lg font-semibold text-white">System Status</span>
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getHealthColor(dashboardData.systemAnalytics.systemHealth) }}
                />
              </div>
              <div 
                className="text-sm font-bold mb-4"
                style={{ color: getHealthColor(dashboardData.systemAnalytics.systemHealth) }}
              >
                {dashboardData.systemAnalytics.systemHealth.toUpperCase()}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Uptime</span>
                  <span className="text-white font-semibold">
                    {formatPercentage(dashboardData.systemAnalytics.uptime)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avg Response Time</span>
                  <span className="text-white font-semibold">
                    {formatTime(dashboardData.systemAnalytics.averageResponseTime)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Error Rate</span>
                  <span className="text-white font-semibold">
                    {formatPercentage(dashboardData.systemAnalytics.errorRate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">API Usage</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total API Calls</span>
                  <span className="text-white font-semibold">
                    {formatNumber(dashboardData.systemAnalytics.totalApiCalls)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">API Costs</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(dashboardData.systemAnalytics.apiCosts)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Cost Per Call</span>
                  <span className="text-white font-semibold">
                    ${dashboardData.systemAnalytics.totalApiCalls > 0 
                      ? (dashboardData.systemAnalytics.apiCosts / dashboardData.systemAnalytics.totalApiCalls).toFixed(2)
                      : '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Quality */}
        <motion.div
          className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Star size={24} className="text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Content Quality & Feedback</h2>
          </div>
          
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-white">
                    {dashboardData.contentAnalytics.contentQuality.averageRating?.toFixed(2) || '0.00'}
                  </span>
                  <Star size={16} className="text-yellow-400" />
                </div>
                <div className="text-sm text-gray-400">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {formatNumber(dashboardData.contentAnalytics.contentQuality.totalRatings)}
                </div>
                <div className="text-sm text-gray-400">Total Ratings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {formatPercentage(dashboardData.contentAnalytics.contentQuality.positiveFeedback)}
                </div>
                <div className="text-sm text-gray-400">Positive Feedback</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Most Used Features */}
        <motion.div
          className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={24} className="text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Most Used Features</h2>
          </div>
          
          <div className="space-y-3">
            {dashboardData.contentAnalytics.mostUsedFeatures && dashboardData.contentAnalytics.mostUsedFeatures.length > 0 ? (
              dashboardData.contentAnalytics.mostUsedFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-4 bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-black text-sm font-bold">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold mb-1">{feature.feature}</div>
                    <div className="text-sm text-gray-400">
                      {formatTime(feature.totalTime || feature.count)} total time ({formatPercentage(feature.percentage)})
                    </div>
                  </div>
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                      style={{ width: `${feature.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="text-white font-semibold mb-2">No usage data available</div>
                <div className="text-sm">Loading feature usage analytics...</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-gray-400 text-sm mb-2">
            SAINTSAL™ Admin Dashboard - Professional Analytics & Insights
          </div>
          <div className="text-gray-500 text-xs">
            Data refreshed every 5 minutes • Real-time monitoring active
          </div>
        </motion.div>
      </div>
    </div>
  );
}
