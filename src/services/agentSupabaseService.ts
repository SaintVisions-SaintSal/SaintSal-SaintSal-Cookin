import { supabase } from '../lib/supabase';

export interface SupabaseAgent {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  system_prompt?: string;
  model: string;
  temperature: number;
  config: Record<string, any>;
  is_public: boolean;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

class AgentSupabaseService {
  /**
   * Get all agents for current user (including public ones)
   */
  async getAgents(): Promise<SupabaseAgent[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agents:', error);
        return [];
      }

      return (data || []) as SupabaseAgent[];
    } catch (error) {
      console.error('Error getting agents:', error);
      return [];
    }
  }

  /**
   * Get a specific agent by ID
   */
  async getAgent(agentId: string): Promise<SupabaseAgent | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .single();

      if (error) {
        console.error('Error fetching agent:', error);
        return null;
      }

      return data as SupabaseAgent;
    } catch (error) {
      console.error('Error getting agent:', error);
      return null;
    }
  }

  /**
   * Create a new agent
   */
  async createAgent(agent: Omit<SupabaseAgent, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'usage_count'>): Promise<SupabaseAgent | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('agents')
        .insert({
          ...agent,
          user_id: user.id,
          usage_count: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating agent:', error);
        return null;
      }

      return data as SupabaseAgent;
    } catch (error) {
      console.error('Error creating agent:', error);
      return null;
    }
  }

  /**
   * Update an agent
   */
  async updateAgent(agentId: string, updates: Partial<Omit<SupabaseAgent, 'id' | 'user_id' | 'created_at'>>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', agentId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating agent:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating agent:', error);
      return false;
    }
  }

  /**
   * Delete an agent
   */
  async deleteAgent(agentId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting agent:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting agent:', error);
      return false;
    }
  }

  /**
   * Increment agent usage count
   */
  async incrementUsage(agentId: string): Promise<boolean> {
    try {
      const agent = await this.getAgent(agentId);
      if (!agent) return false;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user || agent.user_id !== user.id) return false;

      const { error } = await supabase
        .from('agents')
        .update({ usage_count: agent.usage_count + 1 })
        .eq('id', agentId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error incrementing usage:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  }
}

export const agentSupabaseService = new AgentSupabaseService();

