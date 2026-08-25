import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Movie } from '@/types/movie';
import Badge from './Badge';

interface TopTenCardProps {
  movie: Movie;
  rank: number;
}

/** Portrait card dimensions for the Top 10 row */
const CARD_WIDTH = 190; // px — narrower than 16:9 standard cards

export default function TopTenCard({ movie, rank }: TopTenCardProps) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  // Top 10 row always uses the portrait poster — not backdrop
  const thumbSrc = !imgError ? movie.poster || movie.backdrop || '' : '';

  return (
    <div
      className="relative flex-shrink-0 flex items-end cursor-pointer group/top10"
      // Left padding creates room for the numeral to peek out from behind the card
      style={{ paddingLeft: rank < 10 ? '2.5rem' : '3.25rem' }}
    >
      {/* ── Large rank numeral — behind the card ───────────────────────────── */}
      <span
        aria-hidden="true"
        className="absolute left-0 bottom-0 select-none font-display font-black leading-none"
        style={{
          fontSize: 'clamp(80px, 10vw, 120px)',
          lineHeight: 0.82,
          color: '#1A1A1A',
          WebkitTextStroke: '2.5px #2E2E2E',
          zIndex: 0,
          userSelect: 'none',
        }}
      >
        {rank}
      </span>

      {/* ── Portrait card — sits above numeral, z-10 ──────────────────────── */}
      <div
        className="relative z-10"
        style={{ width: CARD_WIDTH }}
        onClick={() => navigate(`/${movie.type}/${movie.id}`)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/${movie.type}/${movie.id}`)}
        tabIndex={0}
        role="button"
        aria-label={`${movie.title} — ranked #${rank}`}
      >
        {/* Card image — 2:3 portrait aspect ratio */}
        <div
          className="relative rounded-md overflow-hidden bg-xf-card shadow-lg transition-transform duration-200 group-hover/top10:scale-[1.04]"
          style={{ aspectRatio: '2/3' }}
        >
          {thumbSrc ? (
            <img
              src={thumbSrc}
              alt={movie.title}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-xf-card px-2 text-center">
              <span className="text-xf-subtle text-xs font-medium">{movie.title}</span>
            </div>
          )}

          {/* Gradient overlay for bottom legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/top10:opacity-100 transition-opacity duration-200" />

          {/*
            'TOP 10' ribbon sits top-right (exception to standard top-left rule,
            matching the reference). movie.badges[0] could say 'Top Rated' here
            but we always show 'TOP 10' as the explicit rank marker.
          */}
          <div className="absolute top-1.5 right-1.5 z-20">
            <Badge label="TOP 10" color="red" size="xs" />
          </div>
        </div>
      </div>
    </div>
  );
}
