'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as motion from "motion/react-client";
import Image from 'next/image';
import { 
  ArrowLeft,
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
  Loader2,
  Building2,
  Target,
  Sparkles
} from "lucide-react";
import { supabase, getAuthToken } from '@/lib/supabase';
import AppHeader from '@/components/AppHeader';

// Types
interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
}

interface FeatureStats {
  chatScreen: {
    totalRequests: number;
    uniqueUsers: number;
    averageResponseTime: number;
  };
  warRoom: {
    totalRequests: number;
    uniqueUsers: number;
    averageResponseTime: number;
  };
  imageGenerator: {
    totalImagesGenerated: number;
    uniqueUsers: number;
  };
  agents: {
    totalAgentsCreated: number;
    activeAgents: number;
    totalAgentInteractions: number;
  };
}

export default function MainDashboardPage() {
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [featureStats, setFeatureStats] = useState<FeatureStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get auth token
      const token = await getAuthToken();
      if (!token) {
        router.push('/auth');
        return;
      }

      // Simulate loading dashboard data
      // In a real implementation, you would fetch from your backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data for demonstration
      setUserStats({
        totalUsers: 1250,
        activeUsers: 890,
        newUsersThisMonth: 45,
        userGrowthRate: 12.5
      });

      setFeatureStats({
        chatScreen: {
          totalRequests: 15420,
          uniqueUsers: 890,
          averageResponseTime: 1.2
        },
        warRoom: {
          totalRequests: 8930,
          uniqueUsers: 650,
          averageResponseTime: 0.8
        },
        imageGenerator: {
          totalImagesGenerated: 2340,
          uniqueUsers: 420
        },
        agents: {
          totalAgentsCreated: 156,
          activeAgents: 89,
          totalAgentInteractions: 5670
        }
      });

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTime = (seconds: number): string => {
    return `${seconds.toFixed(1)}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading Main Dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* App Header */}
      <AppHeader />
      
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 flex items-center justify-between border-b border-white/20 bg-black/20 backdrop-blur-xl pt-20">
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
              <h1 className="text-2xl font-bold text-white">Main Dashboard</h1>
              <p className="text-sm text-gray-400">SAINTSAL™ Overview & Insights</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock size={16} />
          <span>Last updated: {lastRefresh.toLocaleString()}</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 space-y-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles size={24} className="text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Welcome to SaintSal™</h2>
          </div>
          <p className="text-gray-300 mb-4">
            Your comprehensive overview of the SaintSal™ platform. Monitor key metrics, track usage, and stay informed about your AI-powered experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Users size={20} className="text-blue-400" />
                <span className="text-sm text-gray-400">Total Users</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {userStats ? formatNumber(userStats.totalUsers) : '0'}
              </div>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Activity size={20} className="text-green-400" />
                <span className="text-sm text-gray-400">Active Users</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {userStats ? formatNumber(userStats.activeUsers) : '0'}
              </div>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp size={20} className="text-yellow-400" />
                <span className="text-sm text-gray-400">Growth Rate</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {userStats ? `+${userStats.userGrowthRate}%` : '0%'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Usage Overview */}
        <motion.div
          className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 size={24} className="text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Feature Usage Overview</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare size={20} className="text-blue-400" />
                <span className="text-sm font-semibold text-white">Chat Screen</span>
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {featureStats ? formatNumber(featureStats.chatScreen.totalRequests) : '0'} requests
              </div>
              <div className="text-xs text-gray-400">
                {featureStats ? featureStats.chatScreen.uniqueUsers : '0'} unique users
              </div>
              <div className="text-xs text-gray-400">
                {featureStats ? formatTime(featureStats.chatScreen.averageResponseTime) : '0s'} avg response
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <Shield size={20} className="text-purple-400" />
                <span className="text-sm font-semibold text-white">War Room</span>
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {featureStats ? formatNumber(featureStats.warRoom.totalRequests) : '0'} requests
              </div>
              <div className="text-xs text-gray-400">
                {featureStats ? featureStats.warRoom.uniqueUsers : '0'} unique users
              </div>
              <div className="text-xs text-gray-400">
                {featureStats ? formatTime(featureStats.warRoom.averageResponseTime) : '0s'} avg response
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <ImageIcon size={20} className="text-yellow-400" />
                <span className="text-sm font-semibold text-white">Image Generator</span>
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {featureStats ? formatNumber(featureStats.imageGenerator.totalImagesGenerated) : '0'} images
              </div>
              <div className="text-xs text-gray-400">
                {featureStats ? featureStats.imageGenerator.uniqueUsers : '0'} unique users
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <Bot size={20} className="text-green-400" />
                <span className="text-sm font-semibold text-white">AI Agents</span>
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {featureStats ? featureStats.agents.totalAgentsCreated : '0'} agents created
              </div>
              <div className="text-xs text-gray-400">
                {featureStats ? featureStats.agents.activeAgents : '0'} active agents
              </div>
              <div className="text-xs text-gray-400">
                {featureStats ? formatNumber(featureStats.agents.totalAgentInteractions) : '0'} interactions
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap size={24} className="text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <motion.button
              onClick={() => router.push('/warroom')}
              className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4 text-left hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Shield size={20} className="text-blue-400" />
                <span className="text-white font-semibold">Open WarRoom</span>
              </div>
              <p className="text-gray-400 text-sm">Access your AI assistant</p>
            </motion.button>

            <motion.button
              onClick={() => router.push('/chat')}
              className="bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-500/30 rounded-xl p-4 text-left hover:from-green-500/30 hover:to-teal-500/30 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare size={20} className="text-green-400" />
                <span className="text-white font-semibold">AI Chat</span>
              </div>
              <p className="text-gray-400 text-sm">Start a conversation</p>
            </motion.button>

            <motion.button
              onClick={() => router.push('/agent-hub')}
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 text-left hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Bot size={20} className="text-purple-400" />
                <span className="text-white font-semibold">Agent Hub</span>
              </div>
              <p className="text-gray-400 text-sm">Manage your AI agents</p>
            </motion.button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-gray-400 text-sm mb-2">
            SAINTSAL™ Main Dashboard - Your AI-Powered Overview
          </div>
          <div className="text-gray-500 text-xs">
            Data refreshed every 5 minutes • Real-time monitoring active
          </div>
        </motion.div>
      </div>
    </div>
  );
}
