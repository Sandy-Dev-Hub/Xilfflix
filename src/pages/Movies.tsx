import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import {
  getDiscoverMoviesPage,
  getDiscoverMovies,
} from '@/services/tmdb';
import { useTMDB } from '@/hooks/useTMDB';
import Hero from '@/components/Hero';
import MovieRow from '@/components/MovieRow';
import Footer from '@/components/Footer';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import GenreDropdown, { type GenreOption } from '@/components/GenreDropdown';
import type { Movie } from '@/types/movie';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0 },
};

const SORT_VARIANTS = [
  { label: 'Most Popular', sort: 'popularity.desc' },
  { label: 'Top Rated', sort: 'vote_average.desc' },
  { label: 'Newest First', sort: 'primary_release_date.desc' },
];

export default function Movies() {
  const [selectedGenre, setSelectedGenre] = useState<GenreOption | null>(null);

  const genreId = selectedGenre?.paramType === 'genre'
    ? (typeof selectedGenre.id === 'number' ? selectedGenre.id : undefined)
    : undefined;

  const language = selectedGenre?.paramType === 'language' && selectedGenre.id !== 'all'
    ? String(selectedGenre.id)
    : undefined;

  // Hero data (top movies for current filter)
  const fetchHero = useCallback(() =>
    getDiscoverMovies(genreId, language),
    [genreId, language]
  );
  const { data: heroMovies, loading: heroLoading } = useTMDB(fetchHero, [genreId, language]);

  // Make fetchMore factory for each sort variant
  const makeFetchMore = useCallback(
    (sort: string) => async (page: number): Promise<Movie[]> => {
      const result = await getDiscoverMoviesPage(genreId, page, sort, language);
      return result.movies;
    },
    [genreId, language]
  );

  const genreLabel = selectedGenre ? selectedGenre.label : 'All Movies';
  const visibleHero = heroMovies?.slice(0, 5) ?? [];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-xf-bg"
    >
      {/* Hero with Overlay Header */}
      <div className="relative">
        <div className="absolute top-24 sm:top-28 left-4 sm:left-8 lg:left-12 z-20 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 pointer-events-none">
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white drop-shadow-md">Movies</h1>
          <div className="pointer-events-auto flex items-center gap-3">
            <GenreDropdown selected={selectedGenre} onSelect={setSelectedGenre} />
            {selectedGenre && (
              <span className="text-white/80 text-sm font-medium drop-shadow-md hidden sm:block">
                Showing: {genreLabel}
              </span>
            )}
          </div>
        </div>

        {heroLoading ? (
          <LoadingSkeleton variant="hero" />
        ) : (
          <Hero movies={visibleHero} />
        )}
      </div>

      {/* Genre sub-rows — each with different sort for variety */}
      <div className="mt-[-40px] relative z-10 flex flex-col gap-10 pb-16">
        {SORT_VARIANTS.map(({ label, sort }) => (
          <GenreRow
            key={`${genreId}-${language}-${sort}`}
            title={`${genreLabel} — ${label}`}
            genreId={genreId}
            language={language}
            sort={sort}
            fetchMore={makeFetchMore(sort)}
          />
        ))}
      </div>

      <Footer />
    </motion.div>
  );
}

// ─── Sub-component for each sort-variant row ──────────────────────────────────
function GenreRow({
  title,
  genreId,
  language,
  sort,
  fetchMore,
}: {
  title: string;
  genreId?: number;
  language?: string;
  sort: string;
  fetchMore: (page: number) => Promise<Movie[]>;
}) {
  const fetch = useCallback(
    () => getDiscoverMoviesPage(genreId, 1, sort, language),
    [genreId, sort, language]
  );
  const { data, loading } = useTMDB(
    async () => {
      const result = await fetch();
      return result.movies;
    },
    [genreId, sort, language]
  );

  if (loading) {
    return (
      <div className="px-4 sm:px-8 lg:px-12">
        <div className="h-4 w-48 bg-xf-card skeleton rounded mb-4" />
        <LoadingSkeleton variant="row" count={1} />
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <MovieRow
      title={title}
      movies={data}
      fetchMore={fetchMore}
    />
  );
}
