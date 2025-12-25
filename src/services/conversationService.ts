import { supabase } from '../lib/supabase';

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  messages: Array<{ role: string; content: string; timestamp?: number }>;
  model: string;
  agent_id?: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

class ConversationService {
  /**
   * Get all conversations for current user
   */
  async getConversations(): Promise<Conversation[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }

      return (data || []) as Conversation[];
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  /**
   * Get a specific conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching conversation:', error);
        return null;
      }

      return data as Conversation;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    title: string,
    messages: Array<{ role: string; content: string }> = [],
    model: string = 'gpt-4o',
    agentId?: string
  ): Promise<Conversation | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title,
          messages: messages as any,
          model,
          agent_id: agentId,
          message_count: messages.length
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return null;
      }

      return data as Conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }

  /**
   * Update conversation messages
   */
  async updateConversation(
    conversationId: string,
    updates: {
      title?: string;
      messages?: Array<{ role: string; content: string }>;
      message_count?: number;
    }
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const updateData: any = { ...updates };
      if (updates.messages) {
        updateData.message_count = updates.messages.length;
      }

      const { error } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating conversation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating conversation:', error);
      return false;
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting conversation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }
}

export const conversationService = new ConversationService();

