import { supabase } from '../lib/supabase';

export interface UsageRecord {
  id: string;
  user_id: string;
  date: string; // DATE format
  model?: string;
  requests: number;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
  created_at: string;
}

class UsageService {
  /**
   * Get usage records for current user
   */
  async getUsageRecords(startDate?: string, endDate?: string): Promise<UsageRecord[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('usage_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching usage records:', error);
        return [];
      }

      return (data || []) as UsageRecord[];
    } catch (error) {
      console.error('Error getting usage records:', error);
      return [];
    }
  }

  /**
   * Record usage for a request
   */
  async recordUsage(
    model: string,
    tokensInput: number = 0,
    tokensOutput: number = 0,
    costUsd: number = 0
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const today = new Date().toISOString().split('T')[0];

      // Try to update existing record for today
      const { data: existing } = await supabase
        .from('usage_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .eq('model', model)
        .single();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('usage_records')
          .update({
            requests: existing.requests + 1,
            tokens_input: existing.tokens_input + tokensInput,
            tokens_output: existing.tokens_output + tokensOutput,
            cost_usd: existing.cost_usd + costUsd
          })
          .eq('id', existing.id);

        if (error) {
          console.error('Error updating usage record:', error);
          return false;
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from('usage_records')
          .insert({
            user_id: user.id,
            date: today,
            model,
            requests: 1,
            tokens_input: tokensInput,
            tokens_output: tokensOutput,
            cost_usd: costUsd
          });

        if (error) {
          console.error('Error creating usage record:', error);
          return false;
        }
      }

      // Also increment monthly_requests in profiles
      const { profileService } = await import('./profileService');
      await profileService.incrementRequestCount();

      return true;
    } catch (error) {
      console.error('Error recording usage:', error);
      return false;
    }
  }

  /**
   * Get usage summary for current month
   */
  async getMonthlyUsage(): Promise<{
    totalRequests: number;
    totalTokensInput: number;
    totalTokensOutput: number;
    totalCost: number;
    byModel: Record<string, { requests: number; tokens: number; cost: number }>;
  }> {
    try {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = today.toISOString().split('T')[0];

      const records = await this.getUsageRecords(firstDay, lastDay);

      const summary = {
        totalRequests: 0,
        totalTokensInput: 0,
        totalTokensOutput: 0,
        totalCost: 0,
        byModel: {} as Record<string, { requests: number; tokens: number; cost: number }>
      };

      records.forEach(record => {
        summary.totalRequests += record.requests;
        summary.totalTokensInput += record.tokens_input;
        summary.totalTokensOutput += record.tokens_output;
        summary.totalCost += record.cost_usd;

        const model = record.model || 'unknown';
        if (!summary.byModel[model]) {
          summary.byModel[model] = { requests: 0, tokens: 0, cost: 0 };
        }
        summary.byModel[model].requests += record.requests;
        summary.byModel[model].tokens += record.tokens_input + record.tokens_output;
        summary.byModel[model].cost += record.cost_usd;
      });

      return summary;
    } catch (error) {
      console.error('Error getting monthly usage:', error);
      return {
        totalRequests: 0,
        totalTokensInput: 0,
        totalTokensOutput: 0,
        totalCost: 0,
        byModel: {}
      };
    }
  }
}

export const usageService = new UsageService();

