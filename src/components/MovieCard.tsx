import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Movie } from '@/types/movie';
import HoverPreview from './HoverPreview';
import Badge from './Badge';

interface MovieCardProps {
  movie: Movie;
  size?: 'sm' | 'md';
  /** When true, renders a compact poster (2:3) — used in search results */
  posterMode?: boolean;
}

export default function MovieCard({ movie, size = 'md', posterMode = true }: MovieCardProps) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  // Hover-delay timers
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const handleMouseEnter = useCallback(() => {
    clearTimers();
    openTimer.current = setTimeout(() => {
      if (cardRef.current) {
        setCardRect(cardRef.current.getBoundingClientRect());
        setHovered(true);
      }
    }, 300);
  }, []);

  const handleMouseLeave = useCallback(() => {
    clearTimers();
    // Give 120ms grace period so mouse can move to preview without closing
    closeTimer.current = setTimeout(() => {
      setHovered(false);
    }, 120);
  }, []);

  /** Called by HoverPreview when mouse enters — cancels the pending close */
  const handlePreviewEnter = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  /** Called by HoverPreview when mouse leaves */
  const handlePreviewLeave = useCallback(() => {
    setHovered(false);
  }, []);

  const handleClick = () => navigate(`/${movie.type}/${movie.id}`);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick();
  };

  // Thumbnail: prefer backdrop (16:9) for standard cards; fallback to poster if missing
  const thumbSrc = !imgError
    ? (posterMode ? movie.poster : (movie.backdrop || movie.poster)) || ''
    : '';

  // Sizing
  const widthClass = posterMode
    ? (size === 'sm' ? 'w-[130px]' : 'w-[160px] sm:w-[180px]')
    : (size === 'sm' ? 'w-[220px]' : 'w-[260px] sm:w-[280px] lg:w-[300px]');

  const aspectClass = posterMode ? '' : '';
  const aspectStyle = posterMode ? { aspectRatio: '2/3' } : { aspectRatio: '16/9' };

  const badge = movie.badges?.[0];

  return (
    <>
      <div
        ref={cardRef}
        className={`relative ${widthClass} flex-shrink-0 cursor-pointer group/card`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`${movie.title} (${movie.year})`}
      >
        <div
          className={`relative rounded-md overflow-hidden bg-xf-card shadow-md transition-transform duration-200 group-hover/card:scale-[1.03] ${aspectClass}`}
          style={aspectStyle}
        >
          {/* Thumbnail */}
          {thumbSrc ? (
            <img
              src={thumbSrc}
              alt={movie.title}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-xf-card text-center px-2">
              <span className="text-xf-subtle text-xs font-medium">{movie.title}</span>
            </div>
          )}

          {/* Badge ribbon (top-left corner) */}
          {badge && (
            <div className="absolute top-1.5 left-1.5 z-10">
              <Badge label={badge} color="red" size="xs" />
            </div>
          )}

          {/* Subtle hover bottom-fade (non-popup subtle cue) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 transition-opacity duration-200" />

          {/* Title overlay for 16:9 cards (since backdrops lack titles) */}
          {!posterMode && thumbSrc && (
            <div className="absolute bottom-0 left-0 right-0 p-2 z-10">
              <p className="text-white text-[13px] font-semibold leading-tight line-clamp-2 drop-shadow-md">
                {movie.title}
              </p>
            </div>
          )}
        </div>

        {/* Title shown below card in poster mode */}
        {posterMode && (
          <p className="mt-1.5 text-white text-xs font-medium truncate px-0.5">{movie.title}</p>
        )}
      </div>

      {/* Portal-based hover preview — lives outside row's overflow container */}
      {hovered && cardRect && (
        <HoverPreview
          movie={movie}
          anchorRect={cardRect}
          onMouseEnter={handlePreviewEnter}
          onMouseLeave={handlePreviewLeave}
          onClose={() => setHovered(false)}
        />
      )}
    </>
  );
}
