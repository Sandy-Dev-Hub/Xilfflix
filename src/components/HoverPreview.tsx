import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Plus, Check, ThumbsUp, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Movie } from '@/types/movie';
import { useAppStore } from '@/store/useAppStore';
import Badge from './Badge';

interface HoverPreviewProps {
  movie: Movie;
  anchorRect: DOMRect;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}

const POPUP_WIDTH = 400;
const POPUP_IMG_HEIGHT = Math.round(POPUP_WIDTH * 9 / 16); // 225px
const POPUP_FOOTER_HEIGHT = 160;
const POPUP_TOTAL_HEIGHT = POPUP_IMG_HEIGHT + POPUP_FOOTER_HEIGHT;

function computePosition(anchor: DOMRect): { top: number; left: number; transformOrigin: string } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Center popup horizontally on the card
  let left = anchor.left + anchor.width / 2 - POPUP_WIDTH / 2;
  // Center popup vertically over card
  let top = anchor.top + anchor.height / 2 - POPUP_TOTAL_HEIGHT / 2;

  // Clamp horizontally
  const MARGIN = 12;
  if (left < MARGIN) left = MARGIN;
  if (left + POPUP_WIDTH > vw - MARGIN) left = vw - POPUP_WIDTH - MARGIN;

  // Smooth clamp vertically (don't jump below, just keep on screen)
  if (top < 80) top = 80;
  if (top + POPUP_TOTAL_HEIGHT > vh - 12) top = vh - POPUP_TOTAL_HEIGHT - 12;

  // Derive transform-origin based on horizontal position
  const relX = (anchor.left + anchor.width / 2 - left) / POPUP_WIDTH;
  // Use a fixed vertical origin near the center to make scaling feel natural
  const transformOrigin = `${Math.round(relX * 100)}% 50%`;

  return { top, left, transformOrigin };
}

// Respect prefers-reduced-motion
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function HoverPreview({
  movie,
  anchorRect,
  onMouseEnter,
  onMouseLeave,
  onClose,
}: HoverPreviewProps) {
  const { addToList, removeFromList, isInList } = useAppStore();
  const inList = isInList(movie.id);
  const [muted, setMuted] = useState(true);
  const navigate = useNavigate();

  const { top, left, transformOrigin } = computePosition(anchorRect);

  // Close the popup when the user scrolls the page (so it doesn't detach)
  useEffect(() => {
    const handleScroll = () => {
      onClose();
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('wheel', handleScroll, { passive: true, capture: true });
    window.addEventListener('touchmove', handleScroll, { passive: true, capture: true });

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('wheel', handleScroll, { capture: true });
      window.removeEventListener('touchmove', handleScroll, { capture: true });
    };
  }, [onClose]);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    navigate(`/watch/${movie.type}/${movie.id}`);
  };

  const handleInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    navigate(`/${movie.type}/${movie.id}`);
  };

  const toggleList = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inList) removeFromList(movie.id);
    else addToList(movie);
  };

  const formatRuntime = (min: number) => {
    if (!min) return null;
    return `${Math.floor(min / 60)}h ${min % 60}m`;
  };

  const thumbSrc = movie.backdrop || movie.poster || '';

  const animProps = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : {
        initial: { opacity: 0, scale: 0.88, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.88, y: 10 },
        transition: { duration: 0.2, ease: 'easeOut' },
      };

  const popup = (
    <motion.div
      {...animProps}
      style={{
        position: 'fixed',
        top,
        left,
        width: POPUP_WIDTH,
        zIndex: 9999,
        transformOrigin,
      }}
      className="rounded-lg overflow-hidden shadow-2xl shadow-black/70 bg-[#181818] border border-white/10"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Image area */}
      <div className="relative w-full" style={{ height: POPUP_IMG_HEIGHT }}>
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="w-full h-full bg-xf-card flex items-center justify-center">
            <span className="text-xf-subtle text-sm">{movie.title}</span>
          </div>
        )}
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#181818]/80 to-transparent" />

        {/* XILFFLIX watermark */}
        <span className="absolute top-2 left-2.5 font-display font-black text-xs tracking-tighter text-white/60 select-none">
          <span className="text-xf-red">X</span>ILFFLIX
        </span>

        {/* Mute/unmute toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-colors"
          aria-label={muted ? 'Unmute preview' : 'Mute preview'}
        >
          {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>

        {/* Title at bottom-left of image */}
        <p className="absolute bottom-2 left-3 right-10 text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow">
          {movie.title}
        </p>
      </div>

      {/* Footer */}
      <div className="p-4 space-y-3.5 bg-[#181818]">
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Play */}
          <button
            onClick={handlePlay}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow hover:bg-white/90 transition-colors flex-shrink-0"
            aria-label={`Play ${movie.title}`}
          >
            <Play size={18} fill="black" className="text-black ml-1" />
          </button>
          {/* My List */}
          <button
            onClick={toggleList}
            className="w-10 h-10 rounded-full border-2 border-white/40 flex items-center justify-center text-white hover:border-white hover:bg-white/10 transition-colors flex-shrink-0 bg-[#2A2A2A]/50"
            aria-label={inList ? 'Remove from My List' : 'Add to My List'}
          >
            {inList ? <Check size={18} /> : <Plus size={18} />}
          </button>
          {/* Like */}
          <button
            className="w-10 h-10 rounded-full border-2 border-white/40 flex items-center justify-center text-white hover:border-white hover:bg-white/10 transition-colors flex-shrink-0 bg-[#2A2A2A]/50"
            aria-label="Like"
          >
            <ThumbsUp size={16} />
          </button>
          {/* Spacer + Info chevron */}
          <button
            onClick={handleInfo}
            className="ml-auto w-10 h-10 rounded-full border-2 border-white/40 flex items-center justify-center text-white hover:border-white hover:bg-white/10 transition-colors flex-shrink-0 bg-[#2A2A2A]/50"
            aria-label={`More info about ${movie.title}`}
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
          {movie.ageRating && (
            <span className="border border-white/40 text-white text-xs px-1.5 py-0.5 rounded-sm font-semibold">
              {movie.ageRating}
            </span>
          )}
          {formatRuntime(movie.runtime) && (
            <span className="text-white text-sm font-medium">{formatRuntime(movie.runtime)}</span>
          )}
          <span className="border border-white/40 text-white text-[10px] px-1 py-0.5 rounded-sm font-semibold tracking-wider">
            HD
          </span>
          {movie.badges?.[0] && (
            <Badge label={movie.badges[0]} color="red" size="xs" />
          )}
        </div>

        {/* Mood tags */}
        {movie.tags && movie.tags.length > 0 && (
          <p className="text-white text-sm font-medium leading-tight">
            {movie.tags.slice(0, 3).join(' • ')}
          </p>
        )}
      </div>
    </motion.div>
  );

  return createPortal(popup, document.body);
}
