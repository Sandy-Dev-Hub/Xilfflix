import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'framer-motion';
import type { Movie } from '@/types/movie';
import HoverPreview from './HoverPreview';
import Badge from './Badge';
import { getMovieLogo } from '@/services/tmdb';

interface MovieCardProps {
  movie: Movie;
  size?: 'sm' | 'md';
  /** When true, renders a compact poster (2:3) — used in search results */
  posterMode?: boolean;
  /** When true, the card takes full width of its container */
  fluid?: boolean;
}

export default function MovieCard({ movie, size = 'md', posterMode = false, fluid = false }: MovieCardProps) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "200px" });

  const [logo, setLogo] = useState<string | null>(null);
  const [isLogoLoading, setIsLogoLoading] = useState(true);
  const logoFetched = useRef(false);

  useEffect(() => {
    if (!posterMode && isInView && !logoFetched.current) {
      logoFetched.current = true;
      let mounted = true;
      getMovieLogo(movie.id.toString(), movie.type).then(url => {
        if (mounted) {
          setLogo(url);
          setIsLogoLoading(false);
        }
      }).catch(() => {
        if (mounted) setIsLogoLoading(false);
      });
      return () => { mounted = false; };
    }
  }, [posterMode, isInView, movie.id, movie.type]);

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
  const widthClass = fluid 
    ? 'w-full'
    : posterMode
      ? (size === 'sm' ? 'w-[120px]' : 'w-[140px] sm:w-[160px]')
      : (size === 'sm' ? 'w-[200px]' : 'w-[240px] sm:w-[280px] lg:w-[300px]');

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
          className={`relative rounded-xl overflow-hidden bg-xf-card shadow-md transition-transform duration-200 group-hover/card:scale-[1.03] ${aspectClass}`}
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

          {/* Logo overlay for landscape cards */}
          {!posterMode && thumbSrc && (
            <div className="absolute inset-0 p-3 z-10 flex items-end justify-start">
              {logo ? (
                <img 
                  src={logo} 
                  alt={movie.title} 
                  className="w-[80%] max-h-[50%] object-contain object-left-bottom drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" 
                />
              ) : !isLogoLoading ? (
                <p className="text-white text-[15px] font-black uppercase tracking-widest leading-tight line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {movie.title}
                </p>
              ) : null}
            </div>
          )}
        </div>

        {/* Title and details shown below card */}
        <div className="mt-2 px-1">
          <p className="text-white text-[13px] sm:text-sm font-bold truncate leading-snug tracking-wide">{movie.title}</p>
          {!posterMode && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-white mt-1.5">
              <span className="border border-white/40 px-1 py-0.5 rounded-sm uppercase tracking-wider text-white/80 bg-white/5">{movie.type}</span>
              {movie.year && <span className="text-white/70">{movie.year}</span>}
              {movie.rating && (
                <div className="ml-auto flex items-center text-yellow-500">
                  <span className="mr-0.5 text-lg leading-none mt-[-2px]">★</span>
                  <span>{movie.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          )}
          {posterMode && movie.year && <p className="text-xf-subtle text-[11px] sm:text-xs mt-0.5">{movie.year}</p>}
        </div>
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
