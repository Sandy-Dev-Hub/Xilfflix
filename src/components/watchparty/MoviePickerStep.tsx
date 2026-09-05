import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ArrowLeft, Film } from 'lucide-react';
import { searchContent } from '@/services/tmdb';
import type { Movie } from '@/types/movie';

interface MoviePickerStepProps {
  onSelect: (movie: Movie) => void;
  onBack: () => void;
}

const POSTER_BASE = 'https://image.tmdb.org/t/p/w300';

export default function MoviePickerStep({ onSelect, onBack }: MoviePickerStepProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchContent(query.trim());
        setResults(res.slice(0, 18));
        setSearched(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-xf-muted hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">Pick a Movie or Show</h2>
          <p className="text-xf-subtle text-xs">Search for what you want to watch together</p>
        </div>
      </div>

      {/* Search input */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-xf-subtle" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, TV shows…"
          className="w-full bg-xf-card border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-xf-subtle focus:outline-none focus:border-xf-red/60 transition-colors"
          id="movie-picker-search"
        />
        {loading && (
          <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-xf-muted" />
        )}
      </div>

      {/* Results grid */}
      <div className="flex-1 overflow-y-auto">
        {!query.trim() && (
          <div className="flex flex-col items-center justify-center h-40 text-center text-xf-subtle">
            <Film size={32} className="mb-3 opacity-30" />
            <p className="text-sm">Start typing to search for a movie or show</p>
          </div>
        )}

        {searched && results.length === 0 && !loading && (
          <p className="text-center text-xf-subtle text-sm py-12">
            No results for "{query}". Try another title.
          </p>
        )}

        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
            >
              {results.map((movie) => (
                <motion.button
                  key={`${movie.type}-${movie.id}`}
                  onClick={() => onSelect(movie)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-xf-red/50 transition-colors bg-xf-card aspect-[2/3] flex flex-col"
                  title={movie.title}
                >
                  {movie.poster ? (
                    <img
                      src={`${POSTER_BASE}${movie.poster}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-xf-card">
                      <Film size={24} className="text-xf-subtle" />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2">
                      {movie.title}
                    </p>
                  </div>

                  {/* Type badge */}
                  <span className="absolute top-1.5 right-1.5 bg-black/70 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-xf-muted">
                    {movie.type === 'tv' ? 'TV' : 'Film'}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
