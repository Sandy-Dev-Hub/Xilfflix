import { useState, useEffect, useRef } from 'react';
import type { Movie } from '@/types/movie';
import MovieCard from './MovieCard';

interface MovieGridProps {
  title?: string;
  fetchMore: (page: number) => Promise<Movie[]>;
}

export default function MovieGrid({ title, fetchMore }: MovieGridProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Initial load when fetchMore changes
  useEffect(() => {
    let active = true;
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);

    fetchMore(1).then(initialMovies => {
      if (!active) return;
      if (initialMovies.length === 0) setHasMore(false);
      setMovies(initialMovies);
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setHasMore(false);
      setLoading(false);
    });

    return () => { active = false; };
  }, [fetchMore]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setLoading(true);
        const nextPage = page + 1;
        fetchMore(nextPage).then(newMovies => {
          if (newMovies.length === 0) {
            setHasMore(false);
          } else {
            setMovies(prev => {
              const existingIds = new Set(prev.map(m => m.id));
              return [...prev, ...newMovies.filter(m => !existingIds.has(m.id))];
            });
            setPage(nextPage);
          }
          setLoading(false);
        }).catch(() => {
          setHasMore(false);
          setLoading(false);
        });
      }
    }, { rootMargin: '0px 0px 400px 0px' });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => observer.disconnect();
  }, [hasMore, loading, page, fetchMore]);

  if (movies.length === 0 && !loading) return null;

  return (
    <div className="px-4 pb-16 pt-4 min-h-[50vh]">
      {title && <h2 className="text-white font-display font-bold text-lg mb-4">{title}</h2>}
      
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
      
      {/* Sentinel / Loading */}
      {hasMore && (
        <div ref={sentinelRef} className="mt-4 flex flex-col items-center gap-4">
          {loading && (
             <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 w-full">
               {[1,2,3,4,5,6].map(i => (
                 <div key={i} className="bg-xf-card skeleton rounded w-full aspect-[2/3]" />
               ))}
             </div>
          )}
        </div>
      )}
    </div>
  );
}
