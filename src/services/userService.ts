import { getAuthToken } from '../lib/supabase';

export interface UserRole {
  id: number;
  role_name: string;
  description: string;
  agent_limit: number;
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  user_metadata: Record<string, unknown>;
  role: UserRole | null;
  permissions: string[];
  agentLimit: number;
}

export interface UserProfileResponse {
  success: boolean;
  data?: UserProfile;
  error?: string;
  timestamp: string;
}

class UserService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'https://saintsal-backend-0mv8.onrender.com/api';
  }

  /**
   * Fetch current user's profile with role information
   */
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const authToken = await getAuthToken();
      
      if (!authToken) {
        console.log('No auth token found, cannot fetch user profile');
        return null;
      }

      // Get current user ID from the token (we need to decode it or get it from Supabase)
      const { supabase } = await import('../lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found in session');
        return null;
      }

      console.log('🔑 Fetching user profile for:', user.id);
      console.log('🌐 Request URL:', `${this.baseUrl}/user-management/${user.id}`);
      console.log('🔑 Auth token length:', authToken.length);
      
      const response = await fetch(`${this.baseUrl}/user-management/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        let errorMessage = `Failed to fetch user profile: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.log('❌ Error response data:', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          console.log('❌ Could not parse error response');
        }
        
        if (response.status === 401) {
          throw new Error('401 Unauthorized - Please log in again');
        } else if (response.status === 403) {
          throw new Error('403 Forbidden - Insufficient permissions');
        } else if (response.status === 404) {
          throw new Error('404 Not Found - User profile not found');
        } else {
          throw new Error(errorMessage);
        }
      }

      const data: UserProfileResponse = await response.json();
      console.log('✅ User profile response:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch user profile');
      }

      return data.data || null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Update user role after successful payment
   */
  async updateUserRole(userId: string, roleName: string): Promise<{ success: boolean; error?: string; requiresSessionRefresh?: boolean }> {
    try {
      const authToken = await getAuthToken();
      
      if (!authToken) {
        throw new Error('No auth token found');
      }

      console.log('🔄 Updating user role:', { userId, roleName });

      const response = await fetch(`${this.baseUrl}/user-management/update-role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          userId,
          roleName
        })
      });

      if (!response.ok) {
        let errorMessage = `Failed to update user role: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Ignore parsing errors
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Role update response:', data);

      return {
        success: data.success,
        requiresSessionRefresh: data.requiresSessionRefresh
      };
    } catch (error) {
      console.error('Error updating user role:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Refresh user session to get updated role and permissions
   */
  async refreshUserSession(): Promise<{ success: boolean; error?: string }> {
    try {
      const authToken = await getAuthToken();
      
      if (!authToken) {
        throw new Error('No auth token found');
      }

      console.log('🔄 Refreshing user session');

      const response = await fetch(`${this.baseUrl}/auth/refresh-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        let errorMessage = `Failed to refresh session: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Ignore parsing errors
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Session refresh response:', data);

      return {
        success: data.success
      };
    } catch (error) {
      console.error('Error refreshing user session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const userService = new UserService();
