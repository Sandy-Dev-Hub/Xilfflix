import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Movie } from '@/types/movie';
import Badge from './Badge';

interface TopTenCardProps {
  movie: Movie;
  rank: number;
}

export default function TopTenCard({ movie, rank }: TopTenCardProps) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  // Top 10 row always uses the portrait poster
  const thumbSrc = !imgError ? movie.poster || movie.backdrop || '' : '';

  return (
    <div
      className="relative flex-shrink-0 flex items-end cursor-pointer group/top10 select-none outline-none"
      // Left padding creates room for the numeral to peek out from behind the card
      style={{ paddingLeft: rank < 10 ? '2rem' : '3.2rem' }}
      onClick={() => navigate(`/${movie.type}/${movie.id}`)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/${movie.type}/${movie.id}`)}
      tabIndex={0}
      role="button"
      aria-label={`${movie.title} — ranked #${rank}`}
    >
      {/* ── Large rank numeral — behind the card ───────────────────────────── */}
      <span
        aria-hidden="true"
        className="absolute left-0 bottom-0 select-none font-display font-black leading-none pointer-events-none transition-transform duration-300 group-hover/top10:-translate-x-1"
        style={{
          fontSize: 'clamp(64px, 10vw, 105px)',
          lineHeight: 0.78,
          color: '#0a0a0a',
          WebkitTextStroke: '2px #606060',
          textShadow: '0 4px 16px rgba(0,0,0,0.8)',
          zIndex: 0,
          userSelect: 'none',
        }}
      >
        {rank}
      </span>

      {/* ── Portrait card — sits above numeral, z-10 ──────────────────────── */}
      <div
        className="relative z-10 w-[115px] sm:w-[135px] md:w-[155px]"
      >
        {/* Card image — 2:3 portrait aspect ratio */}
        <div
          className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-xf-card shadow-lg transition-transform duration-300 ease-out group-hover/top10:scale-[1.04] group-hover/top10:shadow-2xl"
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

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/top10:opacity-100 transition-opacity duration-200" />

          {/* 'TOP 10' ribbon top-right */}
          <div className="absolute top-1.5 right-1.5 z-20">
            <Badge label="TOP 10" color="red" size="xs" />
          </div>
        </div>
      </div>
    </div>
  );
}
