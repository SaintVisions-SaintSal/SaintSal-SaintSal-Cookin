import { supabase } from '../lib/supabase';

export interface StickyNote {
  id: string;
  user_id: string;
  content: string;
  color: string;
  position: { x: number; y: number };
  created_at: string;
  updated_at: string;
}

class StickyNotesSupabaseService {
  /**
   * Get all sticky notes for current user
   */
  async getNotes(): Promise<StickyNote[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('sticky_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sticky notes:', error);
        return [];
      }

      return (data || []) as StickyNote[];
    } catch (error) {
      console.error('Error getting sticky notes:', error);
      return [];
    }
  }

  /**
   * Create a new sticky note
   */
  async createNote(note: Omit<StickyNote, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<StickyNote | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('sticky_notes')
        .insert({
          ...note,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating sticky note:', error);
        return null;
      }

      return data as StickyNote;
    } catch (error) {
      console.error('Error creating sticky note:', error);
      return null;
    }
  }

  /**
   * Update a sticky note
   */
  async updateNote(noteId: string, updates: Partial<Omit<StickyNote, 'id' | 'user_id' | 'created_at'>>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('sticky_notes')
        .update(updates)
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating sticky note:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating sticky note:', error);
      return false;
    }
  }

  /**
   * Delete a sticky note
   */
  async deleteNote(noteId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('sticky_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting sticky note:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting sticky note:', error);
      return false;
    }
  }
}

export const stickyNotesSupabaseService = new StickyNotesSupabaseService();

