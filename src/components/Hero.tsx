import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Check, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Movie } from '@/types/movie';
import { useAppStore } from '@/store/useAppStore';
import { getMovieLogo } from '@/services/tmdb';
import { getGenreIcon } from '@/utils/genreIcons';
import Badge from './Badge';

interface HeroProps {
  movies: Movie[];
  onActiveMovieChange?: (movie: Movie) => void;
}

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Hero({ movies, onActiveMovieChange }: HeroProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();
  const { addToList, removeFromList, isInList } = useAppStore();
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [logos, setLogos] = useState<Record<string, string>>({});
  const logosFetched = useRef(false);

  const movie = movies[current];
  const inList = movie ? isInList(movie.id) : false;

  // Notify parent of active movie
  useEffect(() => {
    if (movies[current]) {
      onActiveMovieChange?.(movies[current]);
    }
  }, [current, movies, onActiveMovieChange]);

  const [mobileMovies, setMobileMovies] = useState<(Movie & { uniqueId: string })[]>([]);

  useEffect(() => {
    if (movies.length > 0) {
      setMobileMovies([
        ...movies.map(m => ({ ...m, uniqueId: `${m.id}-0` })),
        ...movies.map(m => ({ ...m, uniqueId: `${m.id}-1` }))
      ]);
    }
  }, [movies]);

  const handleMobileScroll = useCallback(() => {
    const el = mobileScrollRef.current;
    if (!el || movies.length === 0) return;

    if (el.scrollLeft >= el.scrollWidth - el.clientWidth * 2.5) {
      setMobileMovies(prev => {
        const batchId = Math.floor(prev.length / movies.length);
        if (batchId > 100) return prev; // Limit to 100 batches
        return [
          ...prev,
          ...movies.map(m => ({ ...m, uniqueId: `${m.id}-${batchId}` }))
        ];
      });
    }
  }, [movies]);

  useEffect(() => {
    if (movies.length > 0 && !logosFetched.current) {
      logosFetched.current = true;
      // Fetch logos for all hero movies up-front so they are ready for the mobile swipe slider
      movies.forEach(m => {
        getMovieLogo(m.id, m.type).then((url) => {
          if (url) {
            setLogos((prev) => ({ ...prev, [m.id]: url }));
          }
        });
      });
    }
  }, [movies]);

  const goTo = useCallback(
    (idx: number) => {
      setDirection(idx > current ? 1 : -1);
      setCurrent(idx);
    },
    [current]
  );

  const next = useCallback(() => goTo((current + 1) % movies.length), [current, goTo, movies.length]);
  const prev = useCallback(() => goTo((current - 1 + movies.length) % movies.length), [current, goTo, movies.length]);

  // Desktop Auto-cycle every 3 seconds
  useEffect(() => {
    if (movies.length === 0) return;
    const id = setInterval(next, 3000);
    return () => clearInterval(id);
  }, [next, movies.length]);

  // Mobile Auto-scroll every 3 seconds
  useEffect(() => {
    if (mobileMovies.length === 0) return;
    const id = setInterval(() => {
      const el = mobileScrollRef.current;
      if (!el) return;

      // Scroll by roughly one card width (85vw) + gap
      // The onScroll handler (handleMobileScroll) will dynamically append more items as we approach the end,
      // creating a seamless infinite scroll without ever needing to rewind to 0.
      el.scrollBy({ left: el.clientWidth * 0.85 + 16, behavior: 'smooth' });
    }, 3000);
    return () => clearInterval(id);
  }, [mobileMovies.length]);

  if (!movie) return null;

  const toggleList = () => {
    if (inList) removeFromList(movie.id);
    else addToList(movie);
  };

  const formatRuntime = (min: number) => {
    if (!min) return null;
    return `${Math.floor(min / 60)}h ${min % 60}m`;
  };

  return (
    <>
      {/* ── Mobile Swipeable Hero ── */}
      <div className="md:hidden pt-20 pb-4 bg-transparent w-full relative z-10">
        <div 
          ref={mobileScrollRef}
          onScroll={handleMobileScroll}
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar px-[7.5vw] gap-4 pb-4 scroll-smooth"
        >
          {mobileMovies.map((m) => {
            const isAdded = isInList(m.id);
            const cardTags = [m.genres[0], ...(m.tags || [])].slice(0, 4).filter(Boolean);

            return (
              <div 
                key={m.uniqueId}
                className="snap-center relative w-[85vw] flex-shrink-0 min-h-[450px] h-[65vh] max-h-[600px] rounded-xl overflow-hidden border border-white/10 bg-[#181818] shadow-2xl cursor-pointer"
                onClick={() => navigate(`/${m.type}/${m.id}`)}
              >
                {/* Poster */}
                <img 
                  src={m.poster}
                  alt={m.title}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
                
                {/* Bottom Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                {/* XILFFLIX Watermark (Optional) */}
                <span className="absolute top-3 left-3 font-display font-black text-xs tracking-tighter text-white/70 shadow-black drop-shadow-md z-10">
                  <span className="text-xf-red">X</span>ILFFLIX
                </span>

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col items-center">
                  {/* Title or Logo */}
                  {logos[m.id] ? (
                    <img
                      src={logos[m.id]}
                      alt={m.title}
                      className="max-h-[80px] max-w-[90%] w-auto object-contain mb-3 drop-shadow-2xl filter"
                    />
                  ) : (
                    <h1 className="font-display font-black text-2xl text-white text-center leading-none mb-3 tracking-tight drop-shadow-lg">
                      {m.title}
                    </h1>
                  )}

                  {/* Tags with Dynamic Icons */}
                  <div className="flex items-center gap-1.5 mb-5 text-xs text-white/90 font-medium drop-shadow-md flex-wrap justify-center">
                    {cardTags.map((tag, i) => (
                      <span key={tag} className="flex items-center gap-1">
                        {i > 0 && <span className="text-white/50 mr-1">•</span>}
                        <span>{getGenreIcon(tag)} {tag}</span>
                      </span>
                    ))}
                  </div>

                  {/* Buttons */}
                  <div className="w-full flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/watch/${m.type}/${m.id}`);
                      }}
                      className="flex-1 flex justify-center items-center gap-2 py-3 bg-white text-black font-semibold rounded shadow-lg hover:bg-white/90 transition-colors"
                    >
                      <Play size={18} fill="black" />
                      Play
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAdded) removeFromList(m.id);
                        else addToList(m);
                      }}
                      className="flex-1 flex justify-center items-center gap-2 py-3 bg-[#2A2A2A]/50 text-white font-semibold rounded backdrop-blur-md border border-white/20 shadow-lg hover:bg-[#2A2A2A]/80 transition-colors"
                    >
                      {isAdded ? <Check size={18} /> : <Plus size={18} />}
                      My List
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Desktop Hero (Transparent Overlay on top of Unified Page Background) ── */}
      <div className="hidden md:block relative w-full h-[65vh] min-h-[500px] max-h-[720px] bg-transparent">
        {/* Content */}
        <div className="relative h-full flex flex-col justify-end pb-8">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 w-full">
            <div className="flex items-end justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={movie.id + '-content'}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="max-w-xl lg:max-w-2xl text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]"
                >
                  {/* Title or Logo */}
                  {logos[movie.id] ? (
                    <img
                      src={logos[movie.id]}
                      alt={movie.title}
                      className="max-h-[140px] max-w-[450px] w-auto object-contain mb-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] filter"
                    />
                  ) : (
                    <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-none mb-3 tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                      {movie.title}
                    </h1>
                  )}

                  {/* Clean Metadata Line with Dynamic Themed Genre Icons */}
                  <div className="flex items-center gap-2.5 mb-3 text-sm font-medium text-white/95 drop-shadow-md flex-wrap">
                    <span className="flex items-center gap-1 text-amber-300 font-semibold">
                      ★ {movie.rating.toFixed(1)}/10
                    </span>
                    {movie.year > 0 && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-white/40">•</span>
                        <span>📅 {movie.year}</span>
                      </span>
                    )}
                    {movie.genres[0] && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-white/40">•</span>
                        <span>{getGenreIcon(movie.genres[0])} {movie.genres[0]}</span>
                      </span>
                    )}
                    {movie.ageRating && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-white/40">•</span>
                        <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs backdrop-blur-sm">{movie.ageRating}</span>
                      </span>
                    )}
                    {formatRuntime(movie.runtime) && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-white/40">•</span>
                        <span>⏱️ {formatRuntime(movie.runtime)}</span>
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-white/95 text-sm sm:text-base leading-relaxed line-clamp-3 mb-6 max-w-xl drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)] font-normal">
                    {movie.description}
                  </p>

                  {/* Buttons matching Image 1: [ ▶ Play ] [ + | ⓘ ] */}
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate(`/watch/${movie.type}/${movie.id}`)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all duration-200 shadow-xl"
                      id={`hero-play-${movie.id}`}
                    >
                      <Play size={18} fill="black" />
                      Play
                    </motion.button>

                    {/* Frosted Capsule with Connected + and ⓘ */}
                    <div className="flex items-center rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 px-1 py-0.5 transition-colors shadow-lg">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={toggleList}
                        className="px-3.5 py-2 text-white hover:text-white transition-colors border-r border-white/25 flex items-center justify-center"
                        title={inList ? 'In My List' : 'Add to My List'}
                        id={`hero-list-${movie.id}`}
                      >
                        {inList ? <Check size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => navigate(`/${movie.type}/${movie.id}`)}
                        className="px-3.5 py-2 text-white hover:text-white transition-colors flex items-center justify-center"
                        title="More Info"
                        aria-label="More info"
                      >
                        <Info size={18} strokeWidth={2.5} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slide indicators on the right matching Image 1: — • • • • • • • • */}
              <div className="flex items-center gap-2 pb-3">
                {movies.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === current ? 'w-8 h-1 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Prev/Next controls */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/30 text-white/80 hover:text-white hover:bg-black/60 transition-colors z-10 backdrop-blur-sm"
          aria-label="Previous feature"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/30 text-white/80 hover:text-white hover:bg-black/60 transition-colors z-10 backdrop-blur-sm"
          aria-label="Next feature"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </>
  );
}
