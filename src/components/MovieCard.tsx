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
  /** When true, renders a portrait poster (2:3); defaults to true for Netflix/streaming style */
  posterMode?: boolean;
  /** When true, the card takes full width of its container */
  fluid?: boolean;
  /** When true, renders title and metadata below the poster */
  showInfo?: boolean;
  /** When true, suppresses top badges */
  hideBadges?: boolean;
}

export default function MovieCard({
  movie,
  size = 'md',
  posterMode = true,
  fluid = false,
  showInfo = false,
  hideBadges = false,
}: MovieCardProps) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '200px' });

  const [logo, setLogo] = useState<string | null>(null);
  const [isLogoLoading, setIsLogoLoading] = useState(true);
  const logoFetched = useRef(false);

  useEffect(() => {
    if (!posterMode && isInView && !logoFetched.current) {
      logoFetched.current = true;
      let mounted = true;
      getMovieLogo(movie.id.toString(), movie.type)
        .then((url) => {
          if (mounted) {
            setLogo(url);
            setIsLogoLoading(false);
          }
        })
        .catch(() => {
          if (mounted) setIsLogoLoading(false);
        });
      return () => {
        mounted = false;
      };
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
    }, 120);
  }, []);

  const handleMouseLeave = useCallback(() => {
    clearTimers();
    closeTimer.current = setTimeout(() => {
      setHovered(false);
    }, 120);
  }, []);

  const handlePreviewEnter = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const handlePreviewLeave = useCallback(() => {
    setHovered(false);
  }, []);

  const handleClick = () => navigate(`/${movie.type}/${movie.id}`);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick();
  };

  // Thumbnail: poster for portrait (2:3); fallback to backdrop
  const thumbSrc = !imgError
    ? (posterMode ? (movie.poster || movie.backdrop) : (movie.backdrop || movie.poster)) || ''
    : '';

  // Sizing
  const widthClass = fluid
    ? 'w-full'
    : posterMode
      ? size === 'sm'
        ? 'w-[130px] sm:w-[150px]'
        : 'w-[150px] sm:w-[175px] md:w-[200px]'
      : size === 'sm'
        ? 'w-[200px]'
        : 'w-[240px] sm:w-[280px] lg:w-[300px]';

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
          className="relative rounded-2xl overflow-hidden bg-xf-card shadow-lg transition-transform duration-300 ease-out group-hover/card:scale-[1.04] group-hover/card:shadow-2xl"
          style={aspectStyle}
        >
          {/* Poster / Thumbnail */}
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

          {/* Badge ribbon */}
          {badge && !hideBadges && (
            <div className="absolute top-2 left-2 z-10">
              <Badge label={badge} color="red" size="xs" />
            </div>
          )}

          {/* Subtle gradient sheen */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80 group-hover/card:opacity-40 transition-opacity duration-200" />

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

        {/* Title and details below card */}
        {(showInfo || !posterMode) && (
          <div className="mt-2.5 px-0.5">
            <p className="text-white text-xs sm:text-[13px] font-medium truncate leading-snug tracking-normal">
              {movie.title}
            </p>
            <div className="flex items-center gap-2 text-[11px] font-medium text-white/60 mt-1">
              {movie.rating ? (
                <span className="flex items-center gap-1 text-white/90">
                  <span className="text-xs leading-none">★</span>
                  <span>{movie.rating.toFixed(1)}</span>
                </span>
              ) : null}
              {movie.year ? <span>{movie.year}</span> : null}
            </div>
          </div>
        )}
      </div>

      {/* Portal-based hover preview */}
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
