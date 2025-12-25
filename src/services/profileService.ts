import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  tier: 'free' | 'starter' | 'pro' | 'teams' | 'enterprise';
  role: 'user' | 'admin' | 'super_admin';
  stripe_customer_id?: string;
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
  async updateTier(tier: 'free' | 'starter' | 'pro' | 'teams' | 'enterprise', stripeCustomerId?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const updateData: any = {
        tier,
        updated_at: new Date().toISOString()
      };

      if (stripeCustomerId) {
        updateData.stripe_customer_id = stripeCustomerId;
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
   * Get tier limits (static mapping since tier_limits table may not exist)
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

