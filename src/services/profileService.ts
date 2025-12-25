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
   * Update user tier (called after successful payment)
   */
  async updateTier(tier: 'free' | 'starter' | 'pro' | 'teams' | 'enterprise', ghlContactId?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const updateData: any = {
        tier,
        updated_at: new Date().toISOString()
      };

      if (ghlContactId) {
        updateData.ghl_contact_id = ghlContactId;
      }

      // Get tier limits to update request_limit
      const { data: tierData } = await supabase
        .from('tier_limits')
        .select('monthly_requests')
        .eq('tier', tier)
        .single();

      if (tierData) {
        updateData.request_limit = tierData.monthly_requests;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating tier:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating tier:', error);
      return false;
    }
  }

  /**
   * Get tier limits for a specific tier
   */
  async getTierLimits(tier: string): Promise<TierLimits | null> {
    try {
      const { data, error } = await supabase
        .from('tier_limits')
        .select('*')
        .eq('tier', tier)
        .single();

      if (error) {
        console.error('Error fetching tier limits:', error);
        return null;
      }

      return data as TierLimits;
    } catch (error) {
      console.error('Error getting tier limits:', error);
      return null;
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

      const { error } = await supabase.rpc('increment_monthly_requests', {
        user_id: user.id
      });

      if (error) {
        // Fallback: manual update
        const profile = await this.getProfile();
        if (profile) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ monthly_requests: profile.monthly_requests + 1 })
            .eq('id', user.id);

          if (updateError) {
            console.error('Error incrementing requests:', updateError);
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error incrementing request count:', error);
      return false;
    }
  }
}

export const profileService = new ProfileService();

