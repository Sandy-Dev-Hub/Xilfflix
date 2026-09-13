import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Film, Tv, Flame, Star, Clock } from 'lucide-react';
import type { ProviderItem } from '@/data/providers';
import type { Movie } from '@/types/movie';
import { getProviderContentPage } from '@/services/tmdb';
import MovieCard from './MovieCard';
import LoadingSkeleton from './LoadingSkeleton';

const TMDB_LOGO_BASE = 'https://image.tmdb.org/t/p/w92';

interface ProviderModalProps {
  provider: ProviderItem | null;
  onClose: () => void;
}

const GENRE_FILTERS = [
  { id: 0, label: 'All Genres' },
  { id: 28, label: 'Action' },
  { id: 35, label: 'Comedy' },
  { id: 18, label: 'Drama' },
  { id: 878, label: 'Sci-Fi' },
  { id: 53, label: 'Thriller' },
  { id: 27, label: 'Horror' },
  { id: 16, label: 'Animation' },
  { id: 10749, label: 'Romance' },
  { id: 14, label: 'Fantasy' },
  { id: 80, label: 'Crime' },
];

const SORT_OPTIONS = [
  { id: 'popularity.desc', label: 'Popular', icon: Flame },
  { id: 'vote_average.desc', label: 'Top Rated', icon: Star },
  { id: 'primary_release_date.desc', label: 'Newest', icon: Clock },
];

export default function ProviderModal({ provider, onClose }: ProviderModalProps) {
  const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>('all');
  const [selectedGenre, setSelectedGenre] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('popularity.desc');

  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (provider) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [provider, onClose]);

  // Reset & load page 1 on filter changes
  useEffect(() => {
    if (!provider) return;

    let isMounted = true;
    setLoading(true);
    setMovies([]);
    setPage(1);
    setHasMore(true);

    getProviderContentPage({
      providerId: provider.tmdbId,
      mediaType,
      genreId: selectedGenre === 0 ? undefined : selectedGenre,
      sortBy,
      page: 1,
    })
      .then((res) => {
        if (!isMounted) return;
        setMovies(res.movies);
        setHasMore(res.movies.length > 0 && res.totalPages > 1);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load provider content:', err);
        setLoading(false);
        setHasMore(false);
      });

    return () => {
      isMounted = false;
    };
  }, [provider, mediaType, selectedGenre, sortBy]);

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (loading || !hasMore || !provider) return;
    const nextPage = page + 1;
    setLoading(true);

    getProviderContentPage({
      providerId: provider.tmdbId,
      mediaType,
      genreId: selectedGenre === 0 ? undefined : selectedGenre,
      sortBy,
      page: nextPage,
    })
      .then((res) => {
        if (res.movies.length === 0) {
          setHasMore(false);
        } else {
          setMovies((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newOnes = res.movies.filter((m) => !existingIds.has(m.id));
            return [...prev, ...newOnes];
          });
          setPage(nextPage);
          if (nextPage >= res.totalPages) setHasMore(false);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load more:', err);
        setLoading(false);
      });
  }, [loading, hasMore, provider, mediaType, selectedGenre, sortBy, page]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore, hasMore, loading]);

  if (!provider) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-7xl max-h-[92vh] flex flex-col bg-xf-secondary border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header Banner */}
          <div className="relative px-5 py-6 sm:px-8 sm:py-8 bg-[#181818] border-b border-white/10 overflow-hidden">
            {/* Ambient background glow */}
            <div
              className="absolute -top-10 -left-10 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-25"
              style={{ backgroundColor: provider.glowColor }}
            />

            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Logo Icon */}
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shadow-xl shrink-0"
                  style={{ backgroundColor: provider.bgColor, boxShadow: `0 8px 24px ${provider.glowColor}` }}
                >
                  <img
                    src={`${TMDB_LOGO_BASE}${provider.logoPath}`}
                    alt={provider.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white">
                      {provider.name}
                    </h2>
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                      <Sparkles className="w-3 h-3 text-amber-300" /> Catalog
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl line-clamp-2">
                    {provider.tagline}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white border border-white/10 hover:border-white/30 transition-all shrink-0 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Filter Tabs Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              {/* Media Type Tabs */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setMediaType('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    mediaType === 'all'
                      ? 'bg-white/20 text-white shadow-sm font-bold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  All Content
                </button>
                <button
                  onClick={() => setMediaType('movie')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    mediaType === 'movie'
                      ? 'bg-white/20 text-white shadow-sm font-bold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" /> Movies
                </button>
                <button
                  onClick={() => setMediaType('tv')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    mediaType === 'tv'
                      ? 'bg-white/20 text-white shadow-sm font-bold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" /> TV Shows
                </button>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5">
                {SORT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = sortBy === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSortBy(opt.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        active
                          ? 'bg-xf-red text-white border-xf-red shadow-lg shadow-xf-red/20'
                          : 'bg-black/30 text-white/60 border-white/10 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Genre Pills */}
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {GENRE_FILTERS.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.id)}
                  className={`whitespace-nowrap px-3 py-1 rounded-full text-xs transition-all ${
                    selectedGenre === genre.id
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/5'
                  }`}
                >
                  {genre.label}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Content Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
            {movies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                {movies.map((movie) => (
                  <div key={`${movie.type}-${movie.id}`} className="w-full">
                    <MovieCard movie={movie} posterMode={false} fluid={true} />
                  </div>
                ))}
              </div>
            ) : !loading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <Film className="w-12 h-12 text-white/20 mb-3" />
                <p className="text-white/60 text-sm font-medium">No titles found for the selected filters.</p>
                <button
                  onClick={() => {
                    setSelectedGenre(0);
                    setMediaType('all');
                    setSortBy('popularity.desc');
                  }}
                  className="mt-4 px-4 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : null}

            {/* Loading Skeleton */}
            {loading && (
              <div className="py-4">
                <LoadingSkeleton variant="row" count={2} />
              </div>
            )}

            {/* Sentinel for Infinite Scroll */}
            <div ref={sentinelRef} className="h-10 w-full" />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
