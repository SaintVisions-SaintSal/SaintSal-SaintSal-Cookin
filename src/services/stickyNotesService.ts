import { getAuthToken } from '../lib/supabase';

export interface StickyNote {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  isCompleted: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface StickyNoteResponse {
  success: boolean;
  data: StickyNote | StickyNote[];
  error?: string;
  message?: string;
  timestamp?: string;
}

class StickyNotesService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'https://saintsal-backend-0mv8.onrender.com/api';
  }

  /**
   * Fetch all sticky notes for the current user
   */
  async getNotes(): Promise<StickyNote[]> {
    try {
      const authToken = await getAuthToken();
      
      if (!authToken) {
        console.log('No auth token found, returning empty notes array');
        return [];
      }

      const response = await fetch(`${this.baseUrl}/sticky-notes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch sticky notes: ${response.status}`);
      }

      const data: StickyNoteResponse = await response.json();
      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error('Error fetching sticky notes:', error);
      throw error;
    }
  }

  /**
   * Create a new sticky note
   */
  async createNote(note: Omit<StickyNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<StickyNote> {
    try {
      const authToken = await getAuthToken();
      
      if (!authToken) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${this.baseUrl}/sticky-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: note.title,
          content: note.content,
          color: note.color,
          isPinned: note.isPinned,
          isCompleted: note.isCompleted,
          tags: note.tags,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create sticky note: ${response.status}`);
      }

      const data: StickyNoteResponse = await response.json();
      return data.data as StickyNote;
    } catch (error) {
      console.error('Error creating sticky note:', error);
      throw error;
    }
  }

  /**
   * Update an existing sticky note
   */
  async updateNote(id: string, updates: Partial<Omit<StickyNote, 'id' | 'createdAt' | 'updatedAt'>>): Promise<StickyNote> {
    try {
      const authToken = await getAuthToken();
      
      if (!authToken) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${this.baseUrl}/sticky-notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update sticky note: ${response.status}`);
      }

      const data: StickyNoteResponse = await response.json();
      return data.data as StickyNote;
    } catch (error) {
      console.error('Error updating sticky note:', error);
      throw error;
    }
  }

  /**
   * Delete a sticky note
   */
  async deleteNote(id: string): Promise<void> {
    try {
      const authToken = await getAuthToken();
      
      if (!authToken) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${this.baseUrl}/sticky-notes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete sticky note: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting sticky note:', error);
      throw error;
    }
  }
}

export const stickyNotesService = new StickyNotesService();

