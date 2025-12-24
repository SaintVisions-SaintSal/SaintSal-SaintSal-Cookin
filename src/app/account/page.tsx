"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft,
  User,
  Crown,
  Building,
  Users,
  Zap,
  Shield,
  Settings,
  LogOut,
  Trash2,
  Check,
  AlertTriangle,
  Mail,
  Calendar,
  CreditCard,
  Activity,
  RefreshCw,
  Sparkles,
  ExternalLink,
  School,
  Rocket,
  TrendingUp,
  Key,
  Copy,
  Plus,
  X
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { userService, UserProfile } from '@/services/userService';
import UserTierManagement from '@/components/UserTierManagement';
import AppHeader from '@/components/AppHeader';
import type { AuthUser } from '@supabase/supabase-js';
import type { BackendAgent } from '@/services/agentService';

interface ApiKey {
  id: string;
  name: string;
  key_value: string;
  agent?: {
    id: string;
    name: string;
    description?: string;
  } | null;
  permissions: string[];
  rate_limit_per_minute: number;
  rate_limit_per_hour: number;
  rate_limit_per_day: number;
  expires_at?: string | null;
  is_active: boolean;
  last_used_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userTier, setUserTier] = useState('Free');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUserTierManagement, setShowUserTierManagement] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [createdKey, setCreatedKey] = useState<{ name: string; key_value: string } | null>(null);
  const [keyForm, setKeyForm] = useState({
    name: '',
    agent_id: '',
    permissions: ['read', 'write'] as string[],
    rate_limit_per_minute: 30,
    rate_limit_per_hour: 500,
    rate_limit_per_day: 5000
  });
  // Initialize agents as empty array - never null or undefined
  const [agents, setAgents] = useState<BackendAgent[]>(() => {
    // Ensure initial state is always an array
    return [];
  });
  const [loadingApiKeys, setLoadingApiKeys] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [agentsInitialized, setAgentsInitialized] = useState(false);
  
  // Wrapper to ensure setAgents always sets an array
  const setAgentsSafe = (value: BackendAgent[] | null | undefined) => {
    if (!value) {
      setAgents([]);
      setAgentsInitialized(true);
      return;
    }
    if (Array.isArray(value)) {
      setAgents(value);
      setAgentsInitialized(true);
    } else {
      console.warn('setAgentsSafe: value is not an array, converting to empty array', value);
      setAgents([]);
      setAgentsInitialized(true);
    }
  };
  
  // Ensure agents is always an array - defensive programming
  // Use useMemo to recompute when agents changes
  // This MUST always return an array, never null, undefined, or any other type
  const safeAgents: BackendAgent[] = useMemo(() => {
    // Always return an array, never undefined or null
    // This is the single source of truth for agents array
    try {
      // Check if agents exists and is an array
      if (!agents) {
        return [];
      }
      if (!Array.isArray(agents)) {
        console.warn('safeAgents: agents is not an array! Type:', typeof agents, 'Value:', agents);
        return [];
      }
      // Return a fresh copy to prevent mutations
      const result = [...agents];
      // Double-check result is still an array
      if (!Array.isArray(result)) {
        console.error('safeAgents: Result is not an array after spread!', result);
        return [];
      }
      return result;
    } catch (error) {
      console.error('Error in safeAgents useMemo:', error);
      return [];
    }
  }, [agents]);

  const fetchUserProfile = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setIsRefreshing(true);
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Fetch user profile with role information from backend
        try {
          const profile = await userService.getUserProfile();
          if (profile) {
            setUserProfile(profile);
            // Set tier based on actual role from backend
            const tier = profile.role?.role_name || 'Free';
            setUserTier(tier);
            console.log('✅ User profile loaded:', {
              email: profile.email,
              role: profile.role?.role_name,
              permissions: profile.permissions,
              agentLimit: profile.agentLimit,
              fullRole: profile.role
            });
            
            if (showRefreshToast) {
              showToast('Profile updated successfully', 'success');
            }
          } else {
            console.log('⚠️ Could not fetch user profile, using fallback tier');
            // Fallback to metadata tier if backend fetch fails
            const tier = session.user.user_metadata?.tier || 'Free';
            setUserTier(tier);
          }
        } catch (profileError) {
          console.error('Error fetching user profile:', profileError);
          console.log('🔄 Falling back to user metadata for tier information');
          
          // Try to get tier from user metadata
          const metadataTier = session.user.user_metadata?.tier || session.user.user_metadata?.role_name;
          const tier = metadataTier || 'Free';
          setUserTier(tier);
          
          console.log('📋 Using fallback tier:', tier);
          
          if (showRefreshToast) {
            showToast('Failed to refresh profile, using cached data', 'warning');
          }
        }
      } else {
        router.push('/auth');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/auth');
    } finally {
      setIsLoading(false);
      if (showRefreshToast) {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchUserProfile();
    if (showApiKeys) {
      fetchApiKeys();
      fetchAgents();
    }
  }, [router, showApiKeys]);

  // Fetch agents when create key modal opens
  useEffect(() => {
    if (showCreateKey) {
      // Always fetch agents when modal opens to ensure fresh data
      fetchAgents();
    }
  }, [showCreateKey]);

  const fetchApiKeys = async () => {
    try {
      setLoadingApiKeys(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch('https://saintsal-backend-0mv8.onrender.com/api/api-keys/keys', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setApiKeys(data.data.api_keys || []);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoadingApiKeys(false);
    }
  };

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      // Initialize agents to empty array if not already set
      if (!agents) {
        setAgents([]);
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setAgentsSafe([]);
        setLoadingAgents(false);
        return;
      }

      const response = await fetch('https://saintsal-backend-0mv8.onrender.com/api/agents', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        setAgentsSafe([]);
        setLoadingAgents(false);
        return;
      }

      const data = await response.json();
      
      // Ensure we always set an array
      let agentsList: BackendAgent[] = [];
      
      if (data && data.success) {
        if (Array.isArray(data.data)) {
          agentsList = data.data;
        } else if (data.data && Array.isArray(data.data.agents)) {
          agentsList = data.data.agents;
        } else if (data.data && Array.isArray(data.data.data)) {
          agentsList = data.data.data;
        }
      }
      
      // Always set to an array, even if empty - ensure agentsList is never null
      if (!agentsList) {
        agentsList = [];
      }
      if (!Array.isArray(agentsList)) {
        agentsList = [];
      }
      setAgentsSafe(agentsList);
    } catch (error) {
      console.error('Error fetching agents:', error);
      // Always ensure agents is an array on error
      setAgentsSafe([]);
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields (only name is required, agent_id is optional)
    if (!keyForm.name || keyForm.name.trim() === '') {
      showToast('Key name is required', 'error');
      return;
    }

    try {
      setLoadingApiKeys(true);
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
          name: keyForm.name.trim(),
          agent_id: keyForm.agent_id && keyForm.agent_id.trim() !== '' ? keyForm.agent_id : null, // null for general-purpose keys
          permissions: keyForm.permissions,
          rate_limit_per_minute: keyForm.rate_limit_per_minute,
          rate_limit_per_hour: keyForm.rate_limit_per_hour,
          rate_limit_per_day: keyForm.rate_limit_per_day
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Set the created key and keep modal open so user can copy it
        setCreatedKey(data.data.api_key);
        // Reset form but keep modal open
        setKeyForm({
          name: '',
          agent_id: '',
          permissions: ['read', 'write'],
          rate_limit_per_minute: 30,
          rate_limit_per_hour: 500,
          rate_limit_per_day: 5000
        });
        // Refresh the API keys list in the background
        fetchApiKeys();
        // Don't close the modal - let user copy the key first
      } else {
        showToast(data.error || 'Failed to create API key', 'error');
      }
    } catch (_error) {
      showToast('Error creating API key', 'error');
    } finally {
      setLoadingApiKeys(false);
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }
    try {
      setLoadingApiKeys(true);
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
    } catch (error) {
      showToast('Error deleting API key', 'error');
    } finally {
      setLoadingApiKeys(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  // Refresh profile when page becomes visible (e.g., after role changes)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page became visible, refreshing profile...');
        fetchUserProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      showToast('Logged out successfully', 'success');
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Error logging out', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      // In a real app, you'd call a backend endpoint to delete the account
      // For now, we'll just sign out
      await supabase.auth.signOut();
      showToast('Account deletion requested', 'info');
      router.push('/auth');
    } catch (error) {
      console.error('Delete account error:', error);
      showToast('Error deleting account', 'error');
    }
  };

  const getTierInfo = (tier: string, userProfile?: UserProfile | null) => {
    // Use backend role name if available, otherwise fallback to tier
    const roleName = userProfile?.role?.role_name || tier;
    
    console.log('🎯 Getting tier info for:', { roleName, tier, userProfile: userProfile?.role });
    
    switch (roleName.toLowerCase()) {
      case 'admin':
        return {
          name: 'Admin',
          color: 'from-red-500 to-red-600',
          icon: Shield,
          description: 'Administrative access with full system control',
          features: userProfile?.role?.features || ['Full system access', 'User management', 'Advanced analytics', 'API access', 'Priority support', 'Admin dashboard']
        };
      case 'enterprise':
        return {
          name: 'Enterprise',
          color: 'from-purple-500 to-purple-600',
          icon: Building,
          description: 'Full enterprise features with unlimited access',
          features: userProfile?.role?.features || ['Unlimited AI interactions', 'Advanced analytics', 'API access', 'Priority support', 'Custom integrations', 'Team collaboration']
        };
      case 'teams':
        return {
          name: 'Teams',
          color: 'from-indigo-500 to-purple-600',
          icon: Users,
          description: 'Team collaboration with unlimited agents (max 5 users)',
          features: userProfile?.role?.features || ['Unlimited AI interactions', 'Team collaboration', 'Advanced analytics', 'API access', 'Priority support', 'Unlimited agents']
        };
      case 'pro':
        return {
          name: 'Pro',
          color: 'from-blue-500 to-blue-600',
          icon: Crown,
          description: 'Professional features for business users',
          features: userProfile?.role?.features || ['Unlimited AI interactions', 'Advanced analytics', 'API access', 'Priority support', 'Custom integrations', '5 AI agents']
        };
      case 'unlimited':
        return {
          name: 'Unlimited',
          color: 'from-emerald-500 to-teal-600',
          icon: Zap,
          description: 'Unlimited access to all AI features',
          features: userProfile?.role?.features || ['Unlimited AI interactions', 'Priority response time', 'Advanced AI models', 'Email support', 'All basic features', '1 AI agent']
        };
      case 'basic':
        return {
          name: 'Basic',
          color: 'from-cyan-500 to-cyan-600',
          icon: User,
          description: 'Basic features for getting started',
          features: userProfile?.role?.features || ['Chat', 'Warroom', 'Basic features']
        };
      case 'free':
        return {
          name: 'Free',
          color: 'from-gray-500 to-gray-600',
          icon: User,
          description: 'Basic features to get started',
          features: ['Limited AI interactions', 'Community support', 'Basic features']
        };
      default:
        return {
          name: 'Free',
          color: 'from-gray-500 to-gray-600',
          icon: User,
          description: 'Basic features to get started',
          features: ['Limited AI interactions', 'Community support', 'Basic features']
        };
    }
  };

  const tierInfo = getTierInfo(userTier, userProfile);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Loading Account...</h2>
          <p className="text-gray-400">Please wait while we fetch your information</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* App Header */}
      <AppHeader />
      
      {/* Header */}
      <div className="border-b border-white/20 p-6 pt-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">My Account</h1>
              <p className="text-sm text-gray-400">Manage your account settings and preferences</p>
            </div>
          </div>
          
          <button
            onClick={() => fetchUserProfile(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg text-sm font-medium"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Profile'}
          </button>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {/* User Profile Section */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.email}</h2>
              <p className="text-gray-400">Member since {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mail size={16} className="text-cyan-400" />
                <span className="text-sm font-medium text-gray-300">Email</span>
              </div>
              <p className="text-white text-sm">{user.email}</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-cyan-400" />
                <span className="text-sm font-medium text-gray-300">Member Since</span>
              </div>
              <p className="text-white text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={16} className="text-cyan-400" />
                <span className="text-sm font-medium text-gray-300">Last Active</span>
              </div>
                <p className="text-white text-sm">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}</p>
            </div>
          </div>
        </div>

        {/* Current Plan Section */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Current Plan</h3>
          
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tierInfo.color} flex items-center justify-center`}>
              <tierInfo.icon size={24} className="text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">{tierInfo.name} Plan</h4>
              <p className="text-gray-400 text-sm">{tierInfo.description}</p>
            </div>
            <div className="ml-auto flex gap-3">
              {/* Admin User Tier Management Button */}
              {userTier.toLowerCase() === 'admin' && (
                <button
                  onClick={() => setShowUserTierManagement(true)}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Shield size={16} />
                  Manage Users
                </button>
              )}
              
              {/* Upgrade Plan Button */}
              {userTier !== 'Enterprise' && userTier.toLowerCase() !== 'admin' && (
                <button
                  onClick={() => router.push('/pricing')}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors text-sm font-medium"
                >
                  Upgrade Plan
                </button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-white font-medium mb-3">Plan Features</h5>
              <ul className="space-y-2">
                {tierInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check size={16} className="text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="text-white font-medium mb-3">Usage Statistics</h5>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">AI Interactions</span>
                    <span className="text-white">0 / {userProfile?.role?.agent_limit ? (userProfile.role.agent_limit === -1 ? 'Unlimited' : userProfile.role.agent_limit) : (userTier === 'Free' ? '10' : 'Unlimited')}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">File Uploads</span>
                    <span className="text-white">0 / {userProfile?.role?.agent_limit ? (userProfile.role.agent_limit === -1 ? 'Unlimited' : userProfile.role.agent_limit) : (userTier === 'Free' ? '5' : 'Unlimited')}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Agents Created</span>
                    <span className="text-white">0 / {userProfile?.role?.agent_limit ? (userProfile.role.agent_limit === -1 ? 'Unlimited' : userProfile.role.agent_limit) : (userTier === 'Free' ? '1' : 'Unlimited')}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">API Keys</h3>
            <button
              onClick={() => {
                setShowApiKeys(!showApiKeys);
                if (!showApiKeys) {
                  fetchApiKeys();
                  fetchAgents();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors text-sm font-medium"
            >
              <Key size={16} />
              {showApiKeys ? 'Hide Keys' : 'Manage API Keys'}
            </button>
          </div>
          
          {showApiKeys && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">Manage your API keys for the Chrome extension and integrations</p>
                <button
                  onClick={() => setShowCreateKey(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700/70 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Create New Key
                </button>
              </div>

              {loadingApiKeys ? (
                <div className="text-center py-8 text-gray-400">Loading API keys...</div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-8">
                  <Key size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No API keys yet</p>
                  <button
                    onClick={() => setShowCreateKey(true)}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors text-sm font-medium"
                  >
                    Create Your First API Key
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((key: ApiKey) => (
                    <div key={key.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-white font-semibold">{key.name || 'Unnamed Key'}</h4>
                            {key.agent ? (
                              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                                {key.agent.name}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                                General Purpose
                              </span>
                            )}
                            {key.is_active ? (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs rounded-full border border-gray-500/30">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="text-gray-400 text-xs space-y-1">
                            <p>Key: <code className="bg-gray-800/50 px-1.5 py-0.5 rounded">{key.key_value?.substring(0, 20)}...</code></p>
                            <p>Rate Limits: {key.rate_limit_per_minute}/min, {key.rate_limit_per_hour}/hour, {key.rate_limit_per_day}/day</p>
                            {key.expires_at && (
                              <p>Expires: {new Date(key.expires_at).toLocaleDateString()}</p>
                            )}
                            {key.last_used_at && (
                              <p>Last used: {new Date(key.last_used_at).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {key.key_value && (
                            <button
                              onClick={() => copyToClipboard(key.key_value)}
                              className="p-2 bg-gray-600/50 hover:bg-gray-600/70 rounded-lg transition-colors"
                              title="Copy API key"
                            >
                              <Copy size={16} className="text-gray-300" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteApiKey(key.id)}
                            className="p-2 bg-red-900/30 hover:bg-red-900/50 rounded-lg transition-colors"
                            title="Delete API key"
                          >
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Settings */}
          <div className="bg-gray-800/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Account Settings</h3>
            
            <div className="space-y-4">
              <button className="w-full flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors">
                <Settings size={20} className="text-cyan-400" />
                <span className="text-white">Preferences</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors">
                <CreditCard size={20} className="text-cyan-400" />
                <span className="text-white">Billing & Payments</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors">
                <Shield size={20} className="text-cyan-400" />
                <span className="text-white">Privacy & Security</span>
              </button>
            </div>
          </div>

          {/* Account Management */}
          <div className="bg-gray-800/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Account Management</h3>
            
            <div className="space-y-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors"
              >
                <LogOut size={20} className="text-yellow-400" />
                <span className="text-white">Sign Out</span>
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center gap-3 p-3 bg-red-900/30 border border-red-500/30 rounded-lg hover:bg-red-900/50 transition-colors"
              >
                <Trash2 size={20} className="text-red-400" />
                <span className="text-red-400">Delete Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* External Links & Resources */}
        <div className="mt-6 bg-gray-800/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">External Links & Resources</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => window.open('https://app.gohighlevel.com/', '_blank', 'noopener,noreferrer')}
              className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg hover:from-yellow-500/30 hover:to-orange-500/30 transition-colors text-left group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={20} className="text-yellow-400" />
                <span className="text-white font-semibold">GoHighLevel</span>
                <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-400/50">
                  PREMIUM
                </span>
                <ExternalLink size={14} className="text-gray-400 group-hover:text-yellow-400 ml-auto" />
              </div>
              <div className="text-gray-400 text-sm">Access your CRM platform</div>
            </button>
            
            <button
              onClick={() => window.open('https://saintvisiongroup.com', '_blank', 'noopener,noreferrer')}
              className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg hover:from-blue-500/30 hover:to-purple-500/30 transition-colors text-left group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Building size={20} className="text-blue-400" />
                <span className="text-white font-semibold">My Business</span>
                <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-400 ml-auto" />
              </div>
              <div className="text-gray-400 text-sm">Visit Saint Vision Group</div>
            </button>
            
            <button
              onClick={() => window.open('https://saintvisiongroup.com', '_blank', 'noopener,noreferrer')}
              className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition-colors text-left group"
            >
              <div className="flex items-center gap-2 mb-2">
                <Rocket size={20} className="text-purple-400" />
                <span className="text-white font-semibold">SVG Launchpad</span>
                <ExternalLink size={14} className="text-gray-400 group-hover:text-purple-400 ml-auto" />
              </div>
              <div className="text-gray-400 text-sm">Explore our launchpad</div>
            </button>
            
            <button
              onClick={() => window.open('https://saintvisiontech.com', '_blank', 'noopener,noreferrer')}
              className="p-4 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 rounded-lg hover:from-cyan-500/30 hover:to-teal-500/30 transition-colors text-left group"
            >
              <div className="flex items-center gap-2 mb-2">
                <School size={20} className="text-cyan-400" />
                <span className="text-white font-semibold">SVT Institute</span>
                <ExternalLink size={14} className="text-gray-400 group-hover:text-cyan-400 ml-auto" />
              </div>
              <div className="text-gray-400 text-sm">Access training and resources</div>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-gray-800/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/warroom')}
              className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              <div className="text-white font-semibold mb-1">Open WarRoom</div>
              <div className="text-white/80 text-sm">Access your AI assistant</div>
            </button>
            
            <button
              onClick={() => router.push('/help')}
              className="p-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors"
            >
              <div className="text-white font-semibold mb-1">Help & Support</div>
              <div className="text-white/80 text-sm">Browse support articles</div>
            </button>
            
            <button
              onClick={() => router.push('/pricing')}
              className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors"
            >
              <div className="text-white font-semibold mb-1">Upgrade Tier</div>
              <div className="text-white/80 text-sm">Unlock more features</div>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Delete Account</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to permanently delete your account? This action cannot be undone.
              </p>
              
              <div className="text-sm text-gray-400 mb-6 text-left">
                <p className="mb-2">This will permanently delete:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your profile information</li>
                  <li>All chat history</li>
                  <li>Created AI agents</li>
                  <li>Uploaded files</li>
                  <li>All associated data</li>
                </ul>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Tier Management Modal (Admin only) */}
      <UserTierManagement 
        isOpen={showUserTierManagement}
        onClose={() => setShowUserTierManagement(false)}
      />

      {/* Create API Key Modal */}
      {showCreateKey && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" suppressHydrationWarning>
          <div className="bg-gray-900/95 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Create API Key</h3>
              <button
                onClick={() => {
                  setShowCreateKey(false);
                  setCreatedKey(null);
                }}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {createdKey ? (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400 text-sm font-medium mb-2">API Key Created Successfully!</p>
                  <p className="text-gray-300 text-xs mb-4">Copy this key now. You won&apos;t be able to see it again.</p>
                  <div className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between gap-2">
                    <code className="text-yellow-400 text-sm font-mono break-all">{createdKey.key_value}</code>
                    <button
                      onClick={() => copyToClipboard(createdKey.key_value)}
                      className="p-2 bg-gray-700/50 hover:bg-gray-700/70 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Copy size={16} className="text-gray-300" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCreateKey(false);
                    setCreatedKey(null);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors font-medium"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateApiKey} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Key Name</label>
                  <input
                    type="text"
                    value={keyForm.name}
                    onChange={(e) => setKeyForm({ ...keyForm, name: e.target.value })}
                    placeholder="e.g., Chrome Extension Key"
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Agent <span className="text-gray-500 text-xs">(Optional - for general purpose keys)</span>
                  </label>
                  <select
                    value={keyForm.agent_id}
                    onChange={(e) => setKeyForm({ ...keyForm, agent_id: e.target.value })}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500/50"
                    disabled={loadingAgents}
                  >
                    <option value="">No specific agent (General purpose)</option>
                    {loadingAgents ? (
                      <option value="" disabled>Loading agents...</option>
                    ) : (() => {
                      // Only proceed if agents are initialized
                      if (!agentsInitialized) {
                        return null;
                      }
                      
                      // Ensure safeAgents exists and is an array
                      if (!safeAgents) {
                        return null;
                      }
                      if (!Array.isArray(safeAgents)) {
                        return null;
                      }
                      if (safeAgents.length === 0) {
                        return null;
                      }
                      
                      // Create a guaranteed array variable - double check
                      const agentsToRender: BackendAgent[] = Array.isArray(safeAgents) ? safeAgents : [];
                      if (agentsToRender.length === 0) {
                        return null;
                      }
                      
                      // Now safe to map - agentsToRender is guaranteed to be an array
                      try {
                        return agentsToRender.map((agent: BackendAgent) => {
                          if (!agent || !agent.id) return null;
                          return (
                            <option key={agent.id} value={agent.id}>{agent.name || 'Unnamed Agent'}</option>
                          );
                        }).filter(Boolean);
                      } catch (error) {
                        console.error('Error mapping agents:', error);
                        return null;
                      }
                    })()}
                  </select>
                  {!loadingAgents && (!agentsInitialized || !safeAgents || !Array.isArray(safeAgents) || safeAgents.length === 0) && (
                    <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-xs text-blue-400 mb-2">No agents available. You can create a general-purpose API key without selecting an agent.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateKey(false);
                          router.push('/agent-hub');
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                      >
                        Or create an agent in Agent Hub →
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Leave empty for a general-purpose API key that works with any agent</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rate Limits</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <input
                        type="number"
                        value={keyForm.rate_limit_per_minute}
                        onChange={(e) => setKeyForm({ ...keyForm, rate_limit_per_minute: parseInt(e.target.value) })}
                        placeholder="Per minute"
                        className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Per minute</p>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={keyForm.rate_limit_per_hour}
                        onChange={(e) => setKeyForm({ ...keyForm, rate_limit_per_hour: parseInt(e.target.value) })}
                        placeholder="Per hour"
                        className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Per hour</p>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={keyForm.rate_limit_per_day}
                        onChange={(e) => setKeyForm({ ...keyForm, rate_limit_per_day: parseInt(e.target.value) })}
                        placeholder="Per day"
                        className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Per day</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateKey(false)}
                    className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loadingApiKeys}
                    className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loadingApiKeys ? 'Creating...' : 'Create Key'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
