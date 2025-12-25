import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  tier: 'free' | 'starter' | 'pro' | 'teams' | 'enterprise';
  role: 'user' | 'admin' | 'super_admin';
  ghl_contact_id?: string;
  ghl_location_id?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  monthly_requests: number;
  request_limit: number;
  last_request_reset?: string; // DATE field
  created_at: string;
  updated_at: string;
}

export interface TierLimits {
  tier: string;
  monthly_requests: number;
  price_monthly: number;
  price_annual: number;
  ghl_product_id: string;
  features: {
    models?: string[] | 'all';
    voice?: boolean;
    warroom?: boolean;
    team_size?: number | 'unlimited';
    custom?: boolean;
  };
}

class ProfileService {
  /**
   * Get current user's profile from Supabase
   */
  async getProfile(): Promise<Profile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  /**
   * Update user tier via secure Edge Function (recommended for GHL payments)
   * Uses Edge Function to validate GHL product ID and update tier securely
   */
  async updateTierViaEdgeFunction(
    ghlProductId: string,
    options?: {
      ghlContactId?: string;
      ghlLocationId?: string;
    }
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return { success: false, error: 'Not authenticated' };
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        return { success: false, error: 'Missing Supabase configuration' };
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/ghl-update-tier`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({
          ghl_product_id: ghlProductId,
          ghl_contact_id: options?.ghlContactId,
          ghl_location_id: options?.ghlLocationId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.error || 'Failed to update tier' };
      }

      const result = await response.json();
      console.log('✅ Tier updated via Edge Function:', result);
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error updating tier via Edge Function:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update user tier directly (fallback method, less secure)
   * Use updateTierViaEdgeFunction for GHL payments instead
   */
  async updateTier(
    tier: 'free' | 'starter' | 'pro' | 'teams' | 'enterprise',
    options?: {
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
      ghlContactId?: string;
      ghlLocationId?: string;
    }
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get tier limits to update request_limit
      const tierLimits = this.getTierLimits(tier);

      const updateData: any = {
        tier,
        updated_at: new Date().toISOString()
      };

      // Update request_limit based on tier
      if (tierLimits) {
        updateData.request_limit = tierLimits.monthly_requests;
      }

      // Add optional fields
      if (options?.stripeCustomerId) {
        updateData.stripe_customer_id = options.stripeCustomerId;
      }
      if (options?.stripeSubscriptionId) {
        updateData.stripe_subscription_id = options.stripeSubscriptionId;
      }
      if (options?.ghlContactId) {
        updateData.ghl_contact_id = options.ghlContactId;
      }
      if (options?.ghlLocationId) {
        updateData.ghl_location_id = options.ghlLocationId;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating tier:', error);
        return false;
      }

      console.log('✅ Tier updated successfully:', tier);
      return true;
    } catch (error) {
      console.error('Error updating tier:', error);
      return false;
    }
  }

  /**
   * Check if user can make a request based on their tier
   */
  async canMakeRequest(): Promise<{ canMake: boolean; remaining: number; limit: number }> {
    try {
      const profile = await this.getProfile();
      if (!profile) {
        return { canMake: false, remaining: 0, limit: 0 };
      }

      // Enterprise has unlimited (999999)
      if (profile.tier === 'enterprise' || profile.request_limit >= 999999) {
        return { canMake: true, remaining: -1, limit: -1 };
      }

      const remaining = profile.request_limit - profile.monthly_requests;
      return {
        canMake: remaining > 0,
        remaining: Math.max(0, remaining),
        limit: profile.request_limit
      };
    } catch (error) {
      console.error('Error checking request limit:', error);
      return { canMake: false, remaining: 0, limit: 0 };
    }
  }

  /**
   * Increment monthly request count
   */
  async incrementRequestCount(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get current profile
      const profile = await this.getProfile();
      if (!profile) return false;

      // Increment monthly_requests
      const { error } = await supabase
        .from('profiles')
        .update({ 
          monthly_requests: profile.monthly_requests + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error incrementing requests:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error incrementing request count:', error);
      return false;
    }
  }

  /**
   * Reset monthly request count (for new billing cycle)
   */
  async resetMonthlyRequests(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          monthly_requests: 0,
          last_request_reset: new Date().toISOString().split('T')[0], // DATE format
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error resetting monthly requests:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error resetting monthly requests:', error);
      return false;
    }
  }

  /**
   * Check if monthly requests need to be reset (new month)
   */
  async checkAndResetIfNeeded(): Promise<boolean> {
    try {
      const profile = await this.getProfile();
      if (!profile) return false;

      const today = new Date().toISOString().split('T')[0];
      const lastReset = profile.last_request_reset || profile.created_at.split('T')[0];
      
      // If last reset was in a different month, reset
      if (lastReset !== today) {
        return await this.resetMonthlyRequests();
      }

      return false;
    } catch (error) {
      console.error('Error checking monthly reset:', error);
      return false;
    }
  }

  /**
   * Get tier limits (static mapping)
   */
  getTierLimits(tier: string): TierLimits | null {
    const tierLimitsMap: Record<string, TierLimits> = {
      'free': {
        tier: 'free',
        monthly_requests: 50,
        price_monthly: 0,
        price_annual: 0,
        ghl_product_id: '694671739e4922feddcc3e1e',
        features: { models: ['gpt-4o-mini'], voice: false, warroom: false }
      },
      'starter': {
        tier: 'starter',
        monthly_requests: 500,
        price_monthly: 27,
        price_annual: 270,
        ghl_product_id: '69464c136d52f05832acd6d5',
        features: { models: ['gpt-4o-mini', 'gpt-4o'], voice: true, warroom: false }
      },
      'pro': {
        tier: 'pro',
        monthly_requests: 2000,
        price_monthly: 97,
        price_annual: 970,
        ghl_product_id: '694677961e9e6a5435be0d10',
        features: { models: ['gpt-4o', 'claude-3', 'gemini'], voice: true, warroom: true }
      },
      'teams': {
        tier: 'teams',
        monthly_requests: 10000,
        price_monthly: 297,
        price_annual: 2970,
        ghl_product_id: '69467a30d0aaf6f7a96a8d9b',
        features: { models: 'all', voice: true, warroom: true, team_size: 10 }
      },
      'enterprise': {
        tier: 'enterprise',
        monthly_requests: 999999,
        price_monthly: 497,
        price_annual: 4970,
        ghl_product_id: '69467bdcccecbd04ba5f18a7',
        features: { models: 'all', voice: true, warroom: true, team_size: 'unlimited', custom: true }
      }
    };

    return tierLimitsMap[tier] || null;
  }
}

export const profileService = new ProfileService();

