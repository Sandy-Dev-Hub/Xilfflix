import {
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Movie } from '@/types/movie';
import MovieCard from './MovieCard';
import TopTenCard from './TopTenCard';

// Hover zone width from row edges
const EDGE_ZONE = 110;

interface MovieRowProps {
  title: string;
  movies: Movie[];
  className?: string;
  /** 'topTen' renders TopTenCard with rank numerals */
  variant?: 'standard' | 'topTen';
  /**
   * When provided, the row loads additional pages as the user scrolls right.
   * Should return the next page of movies; return [] when exhausted.
   */
  fetchMore?: (nextPage: number) => Promise<Movie[]>;
}

export default function MovieRow({
  title,
  movies,
  className = '',
  variant = 'standard',
  fetchMore,
}: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [allMovies, setAllMovies] = useState<Movie[]>(movies);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(!!fetchMore);

  // Sync movies from parent
  useEffect(() => {
    setAllMovies(movies);
  }, [movies]);

  // ── Scroll state ───────────────────────────────────────────────────────────
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isAtStart = el.scrollLeft <= 10;
    const isAtEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 10;
    setCanScrollLeft(!isAtStart);
    setCanScrollRight(!isAtEnd);
    if (isAtStart) setShowLeftArrow(false);
    if (isAtEnd) setShowRightArrow(false);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = 0;
    }
    updateScrollState();
    if (!el) return;
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScrollState]);

  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    const target = dir === 'right'
      ? el.scrollLeft + scrollAmount
      : Math.max(0, el.scrollLeft - scrollAmount);
    el.scrollTo({ left: target, behavior: 'smooth' });
    setTimeout(updateScrollState, 450);
  }, [updateScrollState]);

  // ── Mouse proximity (live inspection of scroll boundaries) ─────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const row = rowRef.current;
    const el = scrollRef.current;
    if (!row || !el) return;

    const isAtStart = el.scrollLeft <= 10;
    const isAtEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 10;
    const { left, width } = row.getBoundingClientRect();
    const x = e.clientX - left;

    setShowLeftArrow(!isAtStart && x <= EDGE_ZONE);
    setShowRightArrow(!isAtEnd && x >= width - EDGE_ZONE);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowLeftArrow(false);
    setShowRightArrow(false);
  }, []);

  // ── Infinite scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!fetchMore || !sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          setLoadingMore(true);
          try {
            const nextPage = currentPage + 1;
            const newMovies = await fetchMore(nextPage);
            if (newMovies.length === 0) {
              setHasMore(false);
            } else {
              setAllMovies((prev) => {
                const existingIds = new Set(prev.map((m) => m.id));
                return [...prev, ...newMovies.filter((m) => !existingIds.has(m.id))];
              });
              setCurrentPage(nextPage);
            }
          } catch {
            setHasMore(false);
          } finally {
            setLoadingMore(false);
          }
        }
      },
      { root: scrollRef.current, threshold: 0.1, rootMargin: '0px 200px 0px 0px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchMore, hasMore, loadingMore, currentPage]);

  if (!allMovies.length) return null;

  return (
    <section
      className={`relative select-none ${className}`}
      aria-label={title}
    >
      {/* Row title — flush with page grid */}
      <h2 className="px-4 sm:px-8 lg:px-12 mb-3.5 text-white font-display font-bold text-lg sm:text-xl tracking-tight">
        {title}
      </h2>

      {/* Scroll container wrapper */}
      <div
        ref={rowRef}
        className="relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Left arrow — centered vertically on posters */}
        <AnimatePresence>
          {showLeftArrow && canScrollLeft && (
            <motion.button
              key="left-arrow"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              className="
                absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30
                w-9 h-9 sm:w-11 sm:h-11
                flex items-center justify-center
                cursor-pointer bg-transparent border-0 outline-none
                text-white hover:scale-120 active:scale-90
                transition-transform duration-150
              "
            >
              <ChevronLeft
                className="w-7 h-7 sm:w-8 sm:h-8 text-white stroke-white"
                style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.95)) drop-shadow(0 0 3px rgba(0,0,0,0.9))' }}
                strokeWidth={2.8}
              />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right arrow — centered vertically on posters */}
        <AnimatePresence>
          {showRightArrow && canScrollRight && (
            <motion.button
              key="right-arrow"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              className="
                absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30
                w-9 h-9 sm:w-11 sm:h-11
                flex items-center justify-center
                cursor-pointer bg-transparent border-0 outline-none
                text-white hover:scale-120 active:scale-90
                transition-transform duration-150
              "
            >
              <ChevronRight
                className="w-7 h-7 sm:w-8 sm:h-8 text-white stroke-white"
                style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.95)) drop-shadow(0 0 3px rgba(0,0,0,0.9))' }}
                strokeWidth={2.8}
              />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Cards — first card starts exactly beneath heading */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto scrollbar-hide py-2 scroll-smooth"
        >
          {allMovies.map((movie, i) => (
            <div
              key={movie.id}
              className={`flex-shrink-0 ${i === 0 ? 'ml-4 sm:ml-8 lg:ml-12' : ''} ${
                i === allMovies.length - 1 ? 'mr-4 sm:mr-8 lg:mr-12' : ''
              }`}
            >
              {variant === 'topTen' ? (
                <TopTenCard movie={movie} rank={i + 1} />
              ) : (
                <MovieCard movie={movie} posterMode={true} />
              )}
            </div>
          ))}

          {/* Infinite scroll sentinel + skeleton */}
          {fetchMore && (
            <div ref={sentinelRef} className="flex-shrink-0 flex items-center">
              {loadingMore && (
                <div
                  className="rounded-2xl bg-xf-card skeleton flex-shrink-0 mr-4 sm:mr-8 lg:mr-12"
                  style={{ width: 175, aspectRatio: '2/3' }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
