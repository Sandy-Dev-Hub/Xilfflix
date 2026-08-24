import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { searchMovies } from '@/data/movies';
import MovieCard from './MovieCard';

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = searchQuery.length >= 2 ? searchMovies(searchQuery) : [];

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
        // Return focus to search button
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
            placeholder="Search movies, shows, genres, actors…"
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
          {searchQuery.length < 2 && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <Search size={40} className="text-xf-subtle/40" />
              <p className="text-xf-subtle text-center">
                Start typing to search across movies, shows, genres, and cast
              </p>
            </div>
          )}

          {searchQuery.length >= 2 && results.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <p className="text-xf-muted font-medium">No results for "{searchQuery}"</p>
              <p className="text-xf-subtle text-sm">Try a different title, genre, or actor name</p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <p className="text-xf-muted text-sm mb-4">
                {results.length} result{results.length !== 1 ? 's' : ''} for "
                <span className="text-white font-medium">{searchQuery}</span>"
              </p>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                {results.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} size="sm" />
                ))}
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
