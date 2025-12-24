"use client";

import React, { useState, useEffect } from 'react';
import * as motion from "motion/react-client";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  X,
  Search,
  Pin,
  FileText,
  CheckCircle,
  Circle,
  Loader2,
} from "lucide-react";
import { stickyNotesService, type StickyNote } from '@/services/stickyNotesService';
import { useToast } from '@/contexts/ToastContext';

interface StickyNotesProps {
  isOpen: boolean;
  onClose: () => void;
}

const NOTE_COLORS = [
  { id: 'yellow', name: 'Yellow', class: 'bg-yellow-200 border-yellow-300 text-yellow-900' },
  { id: 'pink', name: 'Pink', class: 'bg-pink-200 border-pink-300 text-pink-900' },
  { id: 'blue', name: 'Blue', class: 'bg-blue-200 border-blue-300 text-blue-900' },
  { id: 'green', name: 'Green', class: 'bg-green-200 border-green-300 text-green-900' },
  { id: 'purple', name: 'Purple', class: 'bg-purple-200 border-purple-300 text-purple-900' },
  { id: 'orange', name: 'Orange', class: 'bg-orange-200 border-orange-300 text-orange-900' },
  { id: 'red', name: 'Red', class: 'bg-red-200 border-red-300 text-red-900' },
  { id: 'gray', name: 'Gray', class: 'bg-gray-200 border-gray-300 text-gray-900' }
];

export default function StickyNotes({ isOpen, onClose }: StickyNotesProps) {
  const { showToast } = useToast();
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColor, setSelectedColor] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [editingNote, setEditingNote] = useState<StickyNote | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: 'yellow' });

  // Load notes from backend on mount and when modal opens
  useEffect(() => {
    if (isOpen) {
      loadNotes();
    }
  }, [isOpen]);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const loadedNotes = await stickyNotesService.getNotes();
      setNotes(loadedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      showToast('Failed to load sticky notes', 'error');
      // Fallback to empty array on error
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async () => {
    if (!newNote.title.trim() && !newNote.content.trim()) return;

    setIsSaving(true);
    try {
      const note = await stickyNotesService.createNote({
        title: newNote.title.trim() || 'Untitled Note',
        content: newNote.content.trim(),
        color: newNote.color,
        isPinned: false,
        isCompleted: false,
        tags: [],
      });

      setNotes(prev => [note, ...prev]);
      setNewNote({ title: '', content: '', color: 'yellow' });
      setIsCreating(false);
      showToast('Note created successfully', 'success');
    } catch (error) {
      console.error('Error creating note:', error);
      showToast('Failed to create note', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateNote = async (id: string, updates: Partial<Omit<StickyNote, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const updatedNote = await stickyNotesService.updateNote(id, updates);
      setNotes(prev => prev.map(note => 
        note.id === id ? updatedNote : note
      ));
    } catch (error) {
      console.error('Error updating note:', error);
      showToast('Failed to update note', 'error');
      // Reload notes to get correct state
      loadNotes();
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await stickyNotesService.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
      if (editingNote?.id === id) {
        setEditingNote(null);
      }
      showToast('Note deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting note:', error);
      showToast('Failed to delete note', 'error');
    }
  };

  const togglePin = async (id: string) => {
    const currentNote = notes.find(n => n.id === id);
    if (currentNote) {
      await updateNote(id, { isPinned: !currentNote.isPinned });
    }
  };

  const toggleComplete = async (id: string) => {
    const currentNote = notes.find(n => n.id === id);
    if (currentNote) {
      await updateNote(id, { isCompleted: !currentNote.isCompleted });
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesColor = selectedColor === 'all' || note.color === selectedColor;
    const matchesCompleted = showCompleted || !note.isCompleted;
    
    return matchesSearch && matchesColor && matchesCompleted;
  });

  const sortedNotes = filteredNotes.sort((a, b) => {
    // Pinned notes first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Then by updated date
    return b.updatedAt - a.updatedAt;
  });

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center">
              <FileText size={20} className="text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Sticky Notes</h2>
              <p className="text-sm text-gray-400">{notes.length} notes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Controls */}
          <div className="w-80 bg-gray-800/50 border-r border-white/20 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Search Notes
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search notes..."
                    className="w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              {/* Filters */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Filters
                </label>
                <div className="space-y-3">
                  {/* Color Filter */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Color</label>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => setSelectedColor('all')}
                        className={`p-2 rounded-lg border text-xs transition-all ${
                          selectedColor === 'all'
                            ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
                            : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        All
                      </button>
                      {NOTE_COLORS.map(color => (
                        <button
                          key={color.id}
                          onClick={() => setSelectedColor(color.id)}
                          className={`p-2 rounded-lg border text-xs transition-all ${
                            selectedColor === color.id
                              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
                              : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                          style={{ backgroundColor: selectedColor === color.id ? undefined : `var(--${color.id})` }}
                        >
                          {color.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Show Completed Toggle */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showCompleted"
                      checked={showCompleted}
                      onChange={(e) => setShowCompleted(e.target.checked)}
                      className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                    />
                    <label htmlFor="showCompleted" className="text-sm text-gray-300">
                      Show completed notes
                    </label>
                  </div>
                </div>
              </div>

              {/* Create New Note */}
              <div>
                <motion.button
                  onClick={() => setIsCreating(true)}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black rounded-lg font-medium hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus size={16} />
                  Create New Note
                </motion.button>
              </div>

              {/* Quick Stats */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-3">Quick Stats</h4>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Total Notes:</span>
                    <span className="text-white">{notes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pinned:</span>
                    <span className="text-white">{notes.filter(n => n.isPinned).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span className="text-white">{notes.filter(n => n.isCompleted).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Notes */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Loader2 size={32} className="text-yellow-400 animate-spin mb-4" />
                <p className="text-gray-400">Loading notes...</p>
              </div>
            )}

            {/* Create Note Form */}
            {isCreating && (
              <motion.div
                className="mb-6 bg-gray-800/50 rounded-xl p-6 border border-white/20"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Create New Note</h3>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Note title..."
                    className="w-full px-3 py-2 bg-gray-700/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                  />
                  
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your note here..."
                    className="w-full h-24 px-3 py-2 bg-gray-700/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 resize-none"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {NOTE_COLORS.map(color => (
                        <button
                          key={color.id}
                          onClick={() => setNewNote(prev => ({ ...prev, color: color.id }))}
                          className={`w-6 h-6 rounded-full border-2 ${
                            newNote.color === color.id ? 'border-white' : 'border-gray-400'
                          }`}
                          style={{ backgroundColor: color.class.split(' ')[0].replace('bg-', '').replace('-200', '') }}
                        />
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsCreating(false)}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <motion.button
                        onClick={createNote}
                        disabled={isSaving}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black rounded-lg font-medium hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        whileHover={{ scale: isSaving ? 1 : 1.02 }}
                        whileTap={{ scale: isSaving ? 1 : 0.98 }}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Note'
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notes Grid */}
            {!isLoading && (
              <>
                {sortedNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mb-4">
                      <FileText size={32} className="text-gray-500" />
                    </div>
                    <h4 className="text-lg font-medium text-white mb-2">No notes found</h4>
                    <p className="text-gray-400 text-sm max-w-md">
                      {searchTerm || selectedColor !== 'all' || !showCompleted
                        ? 'Try adjusting your search or filters'
                        : 'Create your first sticky note to get started'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    className={`relative rounded-xl p-4 border-2 transition-all hover:shadow-lg ${NOTE_COLORS.find(c => c.id === note.color)?.class || NOTE_COLORS[0].class} ${
                      note.isPinned ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
                    }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Note Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button
                          onClick={() => toggleComplete(note.id)}
                          className="flex-shrink-0"
                        >
                          {note.isCompleted ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : (
                            <Circle size={16} className="text-gray-600" />
                          )}
                        </button>
                        <h4 className={`font-semibold truncate ${
                          note.isCompleted ? 'line-through opacity-60' : ''
                        }`}>
                          {note.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => togglePin(note.id)}
                          className={`p-1 rounded transition-colors ${
                            note.isPinned ? 'text-yellow-600' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <Pin size={14} />
                        </button>
                        <button
                          onClick={() => setEditingNote(note)}
                          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Note Content */}
                    <div className={`text-sm leading-relaxed ${
                      note.isCompleted ? 'opacity-60' : ''
                    }`}>
                      {note.content}
                    </div>

                    {/* Note Footer */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-current border-opacity-20">
                      <span className="text-xs opacity-60">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                      {note.isPinned && (
                        <span className="text-xs opacity-60 flex items-center gap-1">
                          <Pin size={10} />
                          Pinned
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
