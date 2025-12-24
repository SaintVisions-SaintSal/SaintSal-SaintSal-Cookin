'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Mic, X, Video } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

export default function WebAssistantPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Handle search submission - navigate to search results page
  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!searchQuery.trim()) {
      return;
    }

    // Navigate to search results page with query
    router.push(`/web-assistant/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };


  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on '/' key
      if (e.key === '/' && e.target !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Set body and html background to black immediately on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Create and inject style tag for immediate effect
      const style = document.createElement('style');
      style.id = 'web-assistant-black-bg';
      style.textContent = `
        html, body {
          background-color: #000000 !important;
          color: #ffffff !important;
        }
      `;
      document.head.appendChild(style);
      
      // Also set inline styles as backup
      document.documentElement.style.backgroundColor = '#000000';
      document.body.style.backgroundColor = '#000000';
      document.body.style.color = '#ffffff';
      
      return () => {
        // Cleanup
        const styleTag = document.getElementById('web-assistant-black-bg');
        if (styleTag) {
          styleTag.remove();
        }
        document.documentElement.style.backgroundColor = '';
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white" style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
      <AppHeader />
      
      <div className="flex flex-col items-center pt-32 pb-16 px-4">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-normal text-white mb-2">
            SAINTSAL<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">™</span>
          </h1>
          <p className="text-sm text-gray-400">Web Search</p>
        </div>

        {/* Search Box */}
        <div className="w-full max-w-2xl mb-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center border border-gray-700 bg-white/5 backdrop-blur-xl rounded-full shadow-lg hover:shadow-xl transition-shadow px-5 py-3 focus-within:shadow-xl focus-within:border-blue-500">
              <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search the web with SAINTSAL™..."
                className="flex-1 outline-none bg-transparent text-white placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="ml-3 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
              <button
                type="button"
                className="ml-3 p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Voice search"
              >
                <Mic className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* Search Buttons */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                disabled={!searchQuery.trim()}
                className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-md hover:bg-white/20 hover:border-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                SAINTSAL™ Search
              </button>
              <button
                type="button"
                onClick={() => router.push('/screen-share')}
                className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-md hover:bg-white/20 hover:border-white/30 transition-colors"
              >
                I&apos;m Feeling Lucky
              </button>
            </div>
          </form>
        </div>


        {/* Prominent "Stream to SaintSal" Button */}
        <div className="mb-8 w-full max-w-2xl">
          <a
            href="/screen-share"
            className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
          >
            <Video className="w-5 h-5" />
            <span>Stream to SAINTSAL™</span>
          </a>
        </div>

      </div>
    </div>
  );
}

