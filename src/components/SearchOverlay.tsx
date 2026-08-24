import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { searchContent } from '@/services/tmdb';
import { useTMDB } from '@/hooks/useTMDB';
import MovieCard from './MovieCard';
import LoadingSkeleton from './LoadingSkeleton';

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery } = useAppStore();
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSearch = useCallback(() => {
    if (debouncedQuery.length < 2) return Promise.resolve([]);
    return searchContent(debouncedQuery);
  }, [debouncedQuery]);

  const { data: results, loading, error } = useTMDB(fetchSearch, [debouncedQuery]);

  // Focus input on open
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSearchQuery('');
    }
  }, [searchOpen, setSearchQuery]);

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        const btn = document.getElementById('navbar-search-btn');
        btn?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [searchOpen, setSearchOpen]);

  const handleClose = () => {
    setSearchOpen(false);
    const btn = document.getElementById('navbar-search-btn');
    btn?.focus();
  };

  const handleCardClick = (type: 'movie' | 'tv', id: string) => {
    setSearchOpen(false);
    navigate(`/${type}/${id}`);
  };

  if (!searchOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex flex-col"
        style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(16px)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        {/* Header */}
        <div className="flex items-center gap-4 px-4 sm:px-8 py-5 border-b border-white/10">
          <Search size={22} className="text-xf-muted flex-shrink-0" />
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, shows…"
            className="flex-1 bg-transparent text-white text-lg sm:text-xl placeholder-xf-subtle outline-none"
            aria-label="Search input"
            id="search-overlay-input"
          />
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/10 text-xf-muted hover:text-white transition-colors"
            aria-label="Close search"
          >
            <X size={22} />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          {debouncedQuery.length < 2 && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <Search size={40} className="text-xf-subtle/40" />
              <p className="text-xf-subtle text-center">
                Start typing to search across movies and TV shows
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <p className="text-xf-red font-medium">Failed to search TMDB</p>
            </div>
          )}

          {loading && debouncedQuery.length >= 2 && (
            <div className="mt-4">
              <LoadingSkeleton variant="row" count={1} />
            </div>
          )}

          {!loading && !error && debouncedQuery.length >= 2 && results?.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <p className="text-xf-muted font-medium">No results for "{debouncedQuery}"</p>
              <p className="text-xf-subtle text-sm">Try a different title</p>
            </div>
          )}

          {!loading && !error && results && results.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-white font-semibold mb-2">Top Results</h3>
              <div className="flex flex-wrap gap-4">
                {results.map((movie) => (
                  <div key={movie.id} onClick={(e) => { e.preventDefault(); handleCardClick(movie.type, movie.id); }}>
                    <MovieCard movie={movie} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
