'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ExternalLink, ArrowLeft } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { warroomService } from '@/services/warroomService';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  displayUrl?: string;
}

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchSummary, setSearchSummary] = useState('');
  const [searchTime, setSearchTime] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get query from URL params and perform search
  useEffect(() => {
    const query = searchParams.get('q') || '';
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Set body background to black
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.id = 'search-results-black-bg';
      style.textContent = `
        html, body {
          background-color: #000000 !important;
          color: #ffffff !important;
        }
      `;
      document.head.appendChild(style);
      
      document.documentElement.style.backgroundColor = '#000000';
      document.body.style.backgroundColor = '#000000';
      document.body.style.color = '#ffffff';
      
      return () => {
        const styleTag = document.getElementById('search-results-black-bg');
        if (styleTag) {
          styleTag.remove();
        }
        document.documentElement.style.backgroundColor = '';
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
      };
    }
  }, []);

  const performSearch = async (query: string) => {
    if (!query.trim() || isSearching) return;

    const startTime = Date.now();
    setIsSearching(true);
    setSearchResults([]);
    setSearchSummary('');
    setSearchTime('');

    try {
      const result = await warroomService.performWebSearch(query.trim());
      
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
      setSearchTime(elapsedTime);
      
      if (result.success && result.data) {
        setSearchSummary(result.data.summary);
        setSearchResults(result.data.results);
      } else {
        console.error('Search failed:', result.error);
        setSearchSummary(`Search failed: ${result.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error performing search:', error);
      setSearchSummary(`An error occurred: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Navigate to search results page with query
    router.push(`/web-assistant/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleNewSearch = () => {
    router.push('/web-assistant');
  };

  return (
    <div className="min-h-screen bg-black text-white" style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
      <AppHeader />
      
      <div className="pt-32 pb-16 px-4">
        {/* Search Bar at Top */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleNewSearch}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="New Search"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex-1">
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
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Loading Animation */}
        {isSearching && (
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-400 text-sm">Searching with SAINTSAL™...</p>
            </div>
          </div>
        )}

        {/* Search Results */}
        {!isSearching && (searchResults.length > 0 || searchSummary) && (
          <div className="max-w-3xl mx-auto">
            {/* Results Stats */}
            {searchResults.length > 0 && searchTime && (
              <div className="text-sm text-gray-400 mb-6">
                About {searchResults.length} results ({searchTime} seconds)
              </div>
            )}

            {/* Search Summary */}
            {searchSummary && (
              <div className="mb-8">
                <div className="bg-white/5 backdrop-blur-xl rounded-lg p-4 border border-white/20">
                  <p className="text-gray-300 leading-relaxed">{searchSummary}</p>
                </div>
              </div>
            )}

            {/* Search Results List */}
            {searchResults.length > 0 && (
              <div className="space-y-6">
                {searchResults.map((result, index) => (
                  <div key={index} className="border-b border-gray-800 pb-6 last:border-b-0">
                    <div className="flex items-start gap-2 mb-1">
                      <ExternalLink className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <a
                          href={result.url}
                          target={result.url.startsWith('http') ? '_blank' : undefined}
                          rel={result.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-xl text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                        >
                          {result.title}
                        </a>
                        {result.displayUrl && (
                          <div className="text-sm text-green-400 mt-1">
                            {result.displayUrl}
                          </div>
                        )}
                        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                          {result.snippet}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results Message */}
            {searchResults.length === 0 && searchSummary && !isSearching && (
              <div className="text-center py-20">
                <p className="text-gray-400">No results found. Try a different search query.</p>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {!isSearching && searchResults.length === 0 && !searchSummary && searchQuery && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center py-20">
              <p className="text-gray-400">Search failed. Please try again.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading search...</p>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
