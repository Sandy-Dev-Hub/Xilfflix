import {
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Movie } from '@/types/movie';
import MovieCard from './MovieCard';
import TopTenCard from './TopTenCard';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [allMovies, setAllMovies] = useState<Movie[]>(movies);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(!!fetchMore);

  // Sync movies from parent (initial load)
  useEffect(() => {
    setAllMovies(movies);
  }, [movies]);

  // ── Scroll state ───────────────────────────────────────────────────────────
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'right' ? el.clientWidth * 0.8 : -el.clientWidth * 0.8, behavior: 'smooth' });
    setTimeout(updateScrollState, 400);
  }, [updateScrollState]);

  // ── Edge-zone arrow visibility ──────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const w = rect.width;
    const edgePct = 0.07; // 7% edge zone
    setShowLeftArrow(x < w * edgePct && canScrollLeft);
    setShowRightArrow(x > w * (1 - edgePct) && canScrollRight);
  }, [canScrollLeft, canScrollRight]);

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
                // Deduplicate by id
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
      className={`relative ${className}`}
      aria-label={title}
    >
      {/* Row title */}
      <h2 className="px-4 sm:px-8 lg:px-12 mb-3 text-white font-display font-bold text-lg sm:text-xl tracking-tight">
        {title}
      </h2>

      {/* Scroll container wrapper */}
      <div
        ref={containerRef}
        className="relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Left fade */}
        <div
          className={`absolute left-0 top-0 bottom-4 w-16 z-10 pointer-events-none
            bg-gradient-to-r from-xf-bg to-transparent transition-opacity duration-200
            ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Left arrow — only in edge zone */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className={`absolute left-1 top-1/2 -translate-y-5 z-20 w-10 h-10 rounded-full
              bg-[rgba(20,20,20,0.7)] backdrop-blur-sm text-white border border-white/10
              flex items-center justify-center transition-all duration-200
              hover:bg-[rgba(20,20,20,0.9)] hover:scale-110 shadow-lg
              ${showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Cards */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-4 sm:px-8 lg:px-12 pb-4 pt-1"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {allMovies.map((movie, i) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.3 }}
              style={{ scrollSnapAlign: 'start', flexShrink: 0 }}
            >
              {variant === 'topTen' ? (
                <TopTenCard movie={movie} rank={i + 1} />
              ) : (
                <MovieCard movie={movie} />
              )}
            </motion.div>
          ))}

          {/* Infinite scroll sentinel + skeleton */}
          {fetchMore && (
            <div ref={sentinelRef} className="flex-shrink-0 flex items-center">
              {loadingMore && (
                <div
                  className="rounded-md bg-xf-card skeleton flex-shrink-0"
                  style={{ width: 300, aspectRatio: '16/9' }}
                />
              )}
            </div>
          )}
        </div>

        {/* Right fade */}
        <div
          className={`absolute right-0 top-0 bottom-4 w-16 z-10 pointer-events-none
            bg-gradient-to-l from-xf-bg to-transparent transition-opacity duration-200
            ${canScrollRight ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Right arrow — only in edge zone */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className={`absolute right-1 top-1/2 -translate-y-5 z-20 w-10 h-10 rounded-full
              bg-[rgba(20,20,20,0.7)] backdrop-blur-sm text-white border border-white/10
              flex items-center justify-center transition-all duration-200
              hover:bg-[rgba(20,20,20,0.9)] hover:scale-110 shadow-lg
              ${showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </section>
  );
}
