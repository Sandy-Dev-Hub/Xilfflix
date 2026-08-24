import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Check, ThumbsUp } from 'lucide-react';
import type { Movie } from '@/types/movie';
import { useAppStore } from '@/store/useAppStore';

interface MovieCardProps {
  movie: Movie;
  size?: 'sm' | 'md';
}

export default function MovieCard({ movie, size = 'md' }: MovieCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const { addToList, removeFromList, isInList } = useAppStore();
  const inList = isInList(movie.id);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => setHovered(true), 300);
  };
  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setHovered(false);
  };

  const toggleList = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inList) removeFromList(movie.id);
    else addToList(movie);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/${movie.id}`);
  };

  const w = size === 'sm' ? 'w-[140px]' : 'w-[170px] sm:w-[190px] md:w-[210px]';
  const formatRuntime = (min: number) => `${Math.floor(min / 60)}h ${min % 60}m`;

  return (
    <div
      className={`relative ${w} flex-shrink-0 cursor-pointer`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/movie/${movie.id}`)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/movie/${movie.id}`)}
      tabIndex={0}
      role="button"
      aria-label={`${movie.title} (${movie.year})`}
    >
      <motion.div
        animate={{
          scale: hovered ? 1.08 : 1,
          zIndex: hovered ? 30 : 1,
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative rounded-lg overflow-hidden bg-xf-card shadow-md"
        style={{ aspectRatio: '2/3' }}
      >
        {/* Poster */}
        {!imgError ? (
          <img
            src={movie.poster}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-xf-card text-center px-2">
            <span className="text-xf-subtle text-xs font-medium">{movie.title}</span>
          </div>
        )}

        {/* Hover overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col justify-end p-2.5"
            >
              {/* Action icons */}
              <div className="flex gap-2 mb-2">
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePlay}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg"
                  aria-label="Play"
                >
                  <Play size={14} fill="black" className="text-black ml-0.5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleList}
                  className="w-8 h-8 rounded-full bg-xf-card/80 border border-white/30 flex items-center justify-center"
                  aria-label={inList ? 'Remove from list' : 'Add to list'}
                >
                  {inList ? <Check size={14} className="text-white" /> : <Plus size={14} className="text-white" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-full bg-xf-card/80 border border-white/30 flex items-center justify-center"
                  aria-label="Like"
                >
                  <ThumbsUp size={13} className="text-white" />
                </motion.button>
              </div>

              {/* Info */}
              <p className="text-white font-semibold text-xs leading-tight truncate mb-1">{movie.title}</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-green-400 text-xs font-semibold">{movie.rating.toFixed(1)}★</span>
                <span className="text-xf-muted text-xs">{movie.year}</span>
                <span className="text-xf-muted text-xs">{formatRuntime(movie.runtime)}</span>
              </div>
              <div className="flex gap-1 mt-1 flex-wrap">
                {movie.genres.slice(0, 2).map((g) => (
                  <span key={g} className="text-xf-subtle text-[10px]">
                    {g}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
