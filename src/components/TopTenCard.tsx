import type { Movie } from '@/types/movie';
import MovieCard from './MovieCard';
import Badge from './Badge';

interface TopTenCardProps {
  movie: Movie;
  rank: number;
}

export default function TopTenCard({ movie, rank }: TopTenCardProps) {
  return (
    <div className="relative flex-shrink-0 flex items-end" style={{ paddingLeft: rank < 10 ? '2.75rem' : '3.5rem' }}>
      {/* Large rank numeral rendered behind the card */}
      <span
        aria-hidden="true"
        className="absolute left-0 bottom-0 select-none font-display font-black leading-none text-[#1E1E1E]"
        style={{
          fontSize: 'clamp(72px, 9vw, 110px)',
          WebkitTextStroke: '2px #2C2C2C',
          lineHeight: 0.85,
          zIndex: 0,
          userSelect: 'none',
        }}
      >
        {rank}
      </span>

      {/* Card sits above numeral */}
      <div className="relative z-10">
        {/* TOP 10 ribbon on card */}
        <div className="absolute top-1.5 right-1.5 z-20">
          <Badge label="TOP 10" color="red" size="xs" />
        </div>
        <MovieCard movie={movie} />
      </div>
    </div>
  );
}
