import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tv } from 'lucide-react';
import {
  getDiscoverTVPage,
  getDiscoverTV,
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
  { label: 'Newest First', sort: 'first_air_date.desc' },
];

const TV_GENRES = [
  { id: 35, label: 'Comedy' },
  { id: 10759, label: 'Action & Adventure' },
  { id: 18, label: 'Drama' },
  { id: 80, label: 'Crime' },
  { id: 9648, label: 'Mystery' },
  { id: 10765, label: 'Sci-Fi & Fantasy' },
];

export default function TVShows() {
  const [selectedGenre, setSelectedGenre] = useState<GenreOption | null>(null);

  const genreId = selectedGenre?.paramType === 'genre'
    ? (typeof selectedGenre.id === 'number' ? selectedGenre.id : undefined)
    : undefined;

  const language = selectedGenre?.paramType === 'language' && selectedGenre.id !== 'all'
    ? String(selectedGenre.id)
    : undefined;

  const fetchHero = useCallback(
    () => getDiscoverTV(genreId, language),
    [genreId, language]
  );
  const { data: heroShows, loading: heroLoading } = useTMDB(fetchHero, [genreId, language]);

  const makeFetchMore = useCallback(
    (rowGenreId: number | undefined, sort: string) => async (page: number): Promise<Movie[]> => {
      const result = await getDiscoverTVPage(rowGenreId, page, sort, language);
      return result.movies;
    },
    [language]
  );

  const genreLabel = selectedGenre ? selectedGenre.label : 'All TV Shows';
  const visibleHero = heroShows?.slice(0, 5) ?? [];

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
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white drop-shadow-md">TV Shows</h1>
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

      {/* Rows */}
      <div className="mt-[-40px] relative z-10 flex flex-col gap-10 pb-16">
        {language ? (
          <>
            <TVGenreRow
              key={`upcoming-${language}`}
              title={`Upcoming ${selectedGenre?.label} Shows`}
              genreId={undefined}
              language={language}
              sort="first_air_date.desc"
              fetchMore={makeFetchMore(undefined, "first_air_date.desc")}
            />
            {TV_GENRES.map(g => (
              <TVGenreRow
                key={`${g.id}-${language}-pop`}
                title={`${g.label} Shows`}
                genreId={g.id}
                language={language}
                sort="popularity.desc"
                fetchMore={makeFetchMore(g.id, "popularity.desc")}
              />
            ))}
          </>
        ) : (
          <>
            {SORT_VARIANTS.map(({ label, sort }) => (
              <TVGenreRow
                key={`${genreId}-${language}-${sort}`}
                title={`${genreLabel} — ${label}`}
                genreId={genreId}
                language={language}
                sort={sort}
                fetchMore={makeFetchMore(genreId, sort)}
              />
            ))}
          </>
        )}
      </div>

      <Footer />
    </motion.div>
  );
}

// ─── Sub-component for each TV sort-variant row ────────────────────────────────
function TVGenreRow({
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
  const { data, loading } = useTMDB(
    async () => {
      const result = await getDiscoverTVPage(genreId, 1, sort, language);
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
