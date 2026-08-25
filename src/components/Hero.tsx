import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Check, Info, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import type { Movie } from '@/types/movie';
import { useAppStore } from '@/store/useAppStore';
import Badge from './Badge';

interface HeroProps {
  movies: Movie[];
}

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Hero({ movies }: HeroProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [muted, setMuted] = useState(true);
  const navigate = useNavigate();
  const { addToList, removeFromList, isInList } = useAppStore();

  const movie = movies[current];
  const inList = movie ? isInList(movie.id) : false;

  const goTo = useCallback(
    (idx: number) => {
      setDirection(idx > current ? 1 : -1);
      setCurrent(idx);
    },
    [current]
  );

  const next = useCallback(() => goTo((current + 1) % movies.length), [current, goTo, movies.length]);
  const prev = useCallback(() => goTo((current - 1 + movies.length) % movies.length), [current, goTo, movies.length]);

  // Auto-cycle every 8 seconds
  useEffect(() => {
    if (movies.length === 0) return;
    const id = setInterval(next, 8000);
    return () => clearInterval(id);
  }, [next, movies.length]);

  if (!movie) return null;

  const toggleList = () => {
    if (inList) removeFromList(movie.id);
    else addToList(movie);
  };

  const formatRuntime = (min: number) => {
    if (!min) return null;
    return `${Math.floor(min / 60)}h ${min % 60}m`;
  };

  // Dot-separated metadata items
  const metaItems = [
    movie.genres[0],
    movie.year > 0 ? String(movie.year) : null,
    formatRuntime(movie.runtime),
    movie.ageRating,
  ].filter(Boolean) as string[];

  return (
    <div className="relative w-full h-[75vh] min-h-[520px] max-h-[900px] overflow-hidden bg-xf-bg">
      {/* Backdrop images with Ken-Burns */}
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={movie.id}
          custom={direction}
          initial={{ opacity: 0, x: direction * 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -60 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            // Use `key` on img to restart Ken-Burns CSS animation on slide change
            key={`backdrop-${movie.id}`}
            src={movie.backdrop}
            alt={movie.title}
            className={`w-full h-full object-cover object-center ${!prefersReducedMotion ? 'ken-burns' : ''}`}
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-xf-bg via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

      {/* Mute/unmute control (top-right) */}
      <button
        onClick={() => setMuted(!muted)}
        className="absolute top-20 right-4 sm:right-8 z-20 w-9 h-9 rounded-full bg-black/50 border border-white/30 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        aria-label={muted ? 'Unmute preview' : 'Mute preview'}
      >
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={movie.id + '-content'}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="max-w-xl lg:max-w-2xl"
            >
              {/* Badges row */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {movie.badges && movie.badges.length > 0 ? (
                  movie.badges.slice(0, 2).map((b) => (
                    <Badge key={b} label={b} color="red" size="sm" />
                  ))
                ) : (
                  <Badge
                    label={movie.type === 'tv' ? 'TV Series' : 'Movie'}
                    color="white"
                    size="sm"
                  />
                )}
              </div>

              {/* Title */}
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-none mb-4 tracking-tight">
                {movie.title}
              </h1>

              {/* Dot-separated metadata */}
              <div className="flex items-center gap-2 mb-4 text-sm text-xf-muted flex-wrap">
                <span className="text-green-400 font-semibold">{movie.rating.toFixed(1)} ★</span>
                {metaItems.map((item, i) => (
                  <span key={item} className="flex items-center gap-2">
                    {i > 0 && <span className="text-xf-subtle/60">•</span>}
                    <span>{item}</span>
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-xf-muted text-sm sm:text-base leading-relaxed line-clamp-3 mb-6">
                {movie.description}
              </p>

              {/* Buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/watch/${movie.type}/${movie.id}`)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all duration-200 shadow-lg shadow-black/30"
                  id={`hero-play-${movie.id}`}
                >
                  <Play size={18} fill="black" />
                  Play
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={toggleList}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/20"
                  id={`hero-list-${movie.id}`}
                >
                  {inList ? <Check size={18} /> : <Plus size={18} />}
                  {inList ? 'In My List' : '+ My List'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/${movie.type}/${movie.id}`)}
                  className="flex items-center gap-2 px-5 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/10"
                  aria-label="More info"
                >
                  <Info size={18} />
                  <span className="hidden sm:inline text-sm font-medium">More Info</span>
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Prev/Next controls */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors z-10 backdrop-blur-sm"
        aria-label="Previous feature"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors z-10 backdrop-blur-sm"
        aria-label="Next feature"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-8 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
