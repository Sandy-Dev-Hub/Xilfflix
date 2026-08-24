import {
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Movie } from '@/types/movie';
import MovieCard from './MovieCard';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  className?: string;
}

export default function MovieRow({ title, movies, className = '' }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
    setTimeout(updateScrollState, 400);
  }, []);

  if (!movies.length) return null;

  return (
    <section className={`relative group/row ${className}`} aria-label={title}>
      {/* Row title */}
      <h2 className="px-4 sm:px-8 lg:px-12 mb-3 text-white font-display font-bold text-lg sm:text-xl tracking-tight">
        {title}
      </h2>

      {/* Scroll container wrapper */}
      <div className="relative">
        {/* Left fade + arrow */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none
          bg-gradient-to-r from-xf-bg to-transparent transition-opacity duration-300
          ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`}
        />
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-xf-bg/80 text-white hover:bg-xf-secondary border border-white/10 transition-all duration-200 opacity-0 group-hover/row:opacity-100 backdrop-blur-sm shadow-lg"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Cards */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-8 lg:px-12 pb-4 pt-1"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {movies.map((movie, i) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.35 }}
              style={{ scrollSnapAlign: 'start', flexShrink: 0 }}
            >
              <MovieCard movie={movie} />
            </motion.div>
          ))}
        </div>

        {/* Right fade + arrow */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none
          bg-gradient-to-l from-xf-bg to-transparent transition-opacity duration-300
          ${canScrollRight ? 'opacity-100' : 'opacity-0'}`}
        />
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-xf-bg/80 text-white hover:bg-xf-secondary border border-white/10 transition-all duration-200 opacity-0 group-hover/row:opacity-100 backdrop-blur-sm shadow-lg"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </section>
  );
}
