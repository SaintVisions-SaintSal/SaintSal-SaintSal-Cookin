"use client";

import React, { useState, useEffect } from 'react';
import { X, Search, User, Crown, Building2, Users, Zap, Shield, Check, Loader2, AlertCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import * as motion from "motion/react-client";
import { supabase } from '@/lib/supabase';

interface UserData {
  id: string;
  email: string;
  tier: string;
  tierDescription: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
  lastSignIn: string | null;
}

interface TierData {
  id: string;
  role_name: string;
  description: string;
  features: string[];
  agent_limit: number;
}

interface UserTierManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

// Ensure we always use the deployed backend, never localhost
const getBackendUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  // If env URL is set and not localhost, use it; otherwise use deployed backend
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  return 'https://saintsal-backend-0mv8.onrender.com/api';
};

const BACKEND_URL = getBackendUrl();

export default function UserTierManagement({ isOpen, onClose }: UserTierManagementProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [tiers, setTiers] = useState<TierData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [reason, setReason] = useState('');
  const [showTierDropdown, setShowTierDropdown] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  
  // Delete user states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  
  // New user creation states
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserTier, setNewUserTier] = useState('Basic');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [currentPage, pageSize]);

  const getAuthToken = async () => {
    if (typeof window !== 'undefined') {
      try {
        // Get token from Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token || '';
      } catch (error) {
        console.error('Error getting auth token:', error);
        return '';
      }
    }
    return '';
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      // Load users with pagination
      const usersRes = await fetch(`${BACKEND_URL}/admin/user-management/users?page=${currentPage}&limit=${pageSize}&search=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!usersRes.ok) {
        const errorData = await usersRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load users');
      }

      const usersData = await usersRes.json();
      setUsers(usersData.users || []);
      setTotalUsers(usersData.total || 0);
      setTotalPages(Math.ceil((usersData.total || 0) / pageSize));

      // Load tiers
      const tiersRes = await fetch(`${BACKEND_URL}/admin/user-management/tiers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!tiersRes.ok) {
        throw new Error('Failed to load tiers');
      }

      const tiersData = await tiersRes.json();
      // Filter out lowercase 'admin' to avoid duplication with 'Admin'
      const filteredTiers = (tiersData.tiers || []).filter((tier: TierData) => tier.role_name !== 'admin');
      setTiers(filteredTiers);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSetTier = async () => {
    if (!selectedUser || !selectedTier) {
      setError('Please select a user and tier');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await getAuthToken();
      
      const res = await fetch(`${BACKEND_URL}/admin/user-management/set-user-tier`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: selectedUser.email,
          tierName: selectedTier,
          reason: reason || 'Admin manual change'
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to set user tier');
      }

      await res.json();
      setSuccess(`Successfully updated ${selectedUser.email} to ${selectedTier}`);
      
      // Reload users
      await loadData();
      
      // Reset selection
      setSelectedUser(null);
      setSelectedTier('');
      setReason('');
      setShowTierDropdown(false);
    } catch (err) {
      console.error('Error setting tier:', err);
      setError(err instanceof Error ? err.message : 'Failed to set user tier');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword || !newUserTier) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await getAuthToken();
      
      const res = await fetch(`${BACKEND_URL}/admin/user-management/create-user-with-tier`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          tierName: newUserTier
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      await res.json();
      setSuccess(`Successfully created user ${newUserEmail} with ${newUserTier} tier`);
      
      // Reload users
      await loadData();
      
      // Reset form
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserTier('Basic');
      setShowCreateUser(false);
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await getAuthToken();
      
      const res = await fetch(`${BACKEND_URL}/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      await res.json();
      setSuccess(`Successfully deleted user ${userToDelete.email}`);
      
      // Reload users
      await loadData();
      
      // Reset state
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
    loadData();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'Admin': return Shield;
      case 'Enterprise': return Building2;
      case 'Teams': return Users;
      case 'Pro': return Crown;
      case 'Unlimited': return Zap;
      default: return User;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'Admin': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'Enterprise': return 'text-purple-400 bg-purple-500/20 border-purple-500/50';
      case 'Teams': return 'text-blue-400 bg-blue-500/20 border-blue-500/50';
      case 'Pro': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'Unlimited': return 'text-green-400 bg-green-500/20 border-green-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  // No client-side filtering needed since we're using server-side search

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        className="relative w-full max-w-6xl max-h-[90vh] bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gray-900 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="text-yellow-400" size={28} />
              User Tier Management
            </h2>
            <p className="text-gray-400 text-sm mt-1">Manage user tiers and permissions</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mx-6 mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2">
            <Check size={20} className="text-green-400" />
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Actions Bar */}
          <div className="flex gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users by email or tier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            
            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Search size={20} />
              Search
            </button>

            {/* Create User Button */}
            <button
              onClick={() => setShowCreateUser(!showCreateUser)}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <User size={20} />
              Create User
            </button>
          </div>

          {/* Create User Form */}
          {showCreateUser && (
            <motion.div
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h3 className="text-lg font-bold text-white">Create New User</h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Secure password"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tier</label>
                  <select
                    value={newUserTier}
                    onChange={(e) => setNewUserTier(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    {tiers.map(tier => (
                      <option key={tier.id} value={tier.role_name}>
                        {tier.role_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCreateUser}
                  disabled={loading}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                  Create User
                </button>
                <button
                  onClick={() => setShowCreateUser(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Users List */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Current Tier</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Last Sign In</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {loading && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <Loader2 size={32} className="animate-spin text-yellow-400 mx-auto" />
                        <p className="text-gray-400 mt-2">Loading users...</p>
                      </td>
                    </tr>
                  )}

                  {!loading && users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        No users found
                      </td>
                    </tr>
                  )}

                  {!loading && users.map((user) => {
                    const TierIcon = getTierIcon(user.tier);
                    const isSelected = selectedUser?.id === user.id;

                    return (
                      <tr key={user.id} className={`hover:bg-gray-800/50 transition-colors ${isSelected ? 'bg-gray-800' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                              <User size={20} className="text-gray-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.email}</p>
                              <p className="text-gray-400 text-xs">{user.id.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(user.tier)}`}>
                            <TierIcon size={16} />
                            {user.tier}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-sm">
                          {user.lastSignIn ? new Date(user.lastSignIn).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setSelectedTier(user.tier);
                                setShowTierDropdown(true);
                              }}
                              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Change Tier
                            </button>
                            <button
                              onClick={() => {
                                setUserToDelete(user);
                                setShowDeleteConfirm(true);
                              }}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                              title="Delete User"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            <div className="bg-gray-800 border-t border-gray-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  Showing {users.length} of {totalUsers} users
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <span className="px-3 py-1 text-sm text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Change Tier Modal */}
        {showTierDropdown && selectedUser && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-10">
            <motion.div
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full space-y-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h3 className="text-xl font-bold text-white">Change User Tier</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">User</label>
                <div className="px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white">
                  {selectedUser.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Tier</label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  {tiers.map(tier => (
                    <option key={tier.id} value={tier.role_name}>
                      {tier.role_name} - {tier.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Reason (optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why is this tier being changed?"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSetTier}
                  disabled={loading || selectedTier === selectedUser.tier}
                  className="flex-1 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                  Update Tier
                </button>
                <button
                  onClick={() => {
                    setShowTierDropdown(false);
                    setSelectedUser(null);
                    setSelectedTier('');
                    setReason('');
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && userToDelete && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-10">
            <motion.div
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full space-y-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Delete User</h3>
              </div>
              
              <div className="text-gray-300">
                <p>Are you sure you want to delete this user?</p>
                <div className="mt-2 p-3 bg-gray-900 rounded-lg">
                  <p className="font-semibold text-white">{userToDelete.email}</p>
                  <p className="text-sm text-gray-400">Tier: {userToDelete.tier}</p>
                </div>
                <p className="mt-3 text-sm text-red-400">
                  ⚠️ This action cannot be undone. All user data will be permanently deleted.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleDeleteUser}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                  Delete User
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setUserToDelete(null);
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

