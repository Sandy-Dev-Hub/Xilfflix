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
import GenreDropdown, { type GenreOption, LANGUAGE_OPTIONS } from '@/components/GenreDropdown';
import FilterPillBar from '@/components/FilterPillBar';
import MovieGrid from '@/components/MovieGrid';
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

const MOVIE_GENRES = [
  { id: 35, label: 'Comedy' },
  { id: 28, label: 'Action' },
  { id: 53, label: 'Thriller' },
  { id: 27, label: 'Horror' },
  { id: 10749, label: 'Romance' },
  { id: 878, label: 'Sci-Fi' },
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

  // Make fetchMore factory for each row
  const makeFetchMore = useCallback(
    (rowGenreId: number | undefined, rowLang: string | undefined, sort: string) => async (page: number): Promise<Movie[]> => {
      const result = await getDiscoverMoviesPage(rowGenreId, page, sort, rowLang);
      return result.movies;
    },
    []
  );

  const genreLabel = selectedGenre ? selectedGenre.label : 'All Movies';
  const visibleHero = heroMovies?.slice(0, 10) ?? [];

  const pillOptions: GenreOption[] = MOVIE_GENRES.map(g => ({
    id: g.id,
    label: g.label,
    paramType: 'genre',
  }));

  const mobileFetchMore = useCallback(
    (page: number) => getDiscoverMoviesPage(genreId, page, "popularity.desc", undefined).then(r => r.movies),
    [genreId]
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-xf-bg"
    >
      {/* ── Mobile Layout (md:hidden) ── */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="pt-20 px-4 pb-2 bg-xf-bg sticky top-0 z-40">
          <h1 className="font-display font-black text-3xl text-white">All Movies</h1>
          <p className="text-xf-subtle text-sm mt-1">A broad wall of movies worth browsing.</p>
        </div>

        <FilterPillBar 
          options={pillOptions}
          selected={selectedGenre}
          onSelect={setSelectedGenre}
          allLabel="All Movies"
        />

        <MovieGrid fetchMore={mobileFetchMore} />
      </div>

      {/* ── Desktop Layout (hidden md:block) ── */}
      <div className="hidden md:block">
        {/* Filter Header */}
        <div className="pt-24 pb-6 px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 bg-xf-bg relative z-20">
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white drop-shadow-md">Movies</h1>
          <div className="flex items-center gap-3">
            <GenreDropdown selected={selectedGenre} onSelect={setSelectedGenre} />
            {selectedGenre && (
              <span className="text-white/80 text-sm font-medium drop-shadow-md hidden sm:block">
                Showing: {genreLabel}
              </span>
            )}
          </div>
        </div>

        {/* Hero */}
        <div className="relative">
          {heroLoading ? (
            <LoadingSkeleton variant="hero" />
          ) : (
            <Hero movies={visibleHero} />
          )}
        </div>

        {/* Rows */}
        <div className="max-md:mt-4 md:mt-[-40px] relative z-10 flex flex-col gap-10 pb-16">
          {language ? (
            <>
              <GenreRow
                key={`upcoming-${language}`}
                title={`Upcoming ${selectedGenre?.label} Movies`}
                genreId={undefined}
                language={language}
                sort="primary_release_date.desc"
                fetchMore={makeFetchMore(undefined, language, "primary_release_date.desc")}
              />
              {MOVIE_GENRES.map(g => (
                <GenreRow
                  key={`${g.id}-${language}-pop`}
                  title={`${selectedGenre?.label} ${g.label} Movies`}
                  genreId={g.id}
                  language={language}
                  sort="popularity.desc"
                  fetchMore={makeFetchMore(g.id, language, "popularity.desc")}
                />
              ))}
            </>
          ) : genreId ? (
            <>
              <GenreRow
                key={`upcoming-${genreId}`}
                title={`Upcoming ${selectedGenre?.label} Movies`}
                genreId={genreId}
                language={undefined}
                sort="primary_release_date.desc"
                fetchMore={makeFetchMore(genreId, undefined, "primary_release_date.desc")}
              />
              {LANGUAGE_OPTIONS.filter(l => l.id !== 'all').map(lang => (
                <GenreRow
                  key={`${genreId}-${lang.id}-pop`}
                  title={`${lang.label} ${selectedGenre?.label} Movies`}
                  genreId={genreId}
                  language={String(lang.id)}
                  sort="popularity.desc"
                  fetchMore={makeFetchMore(genreId, String(lang.id), "popularity.desc")}
                />
              ))}
            </>
          ) : (
            <>
              {SORT_VARIANTS.map(({ label, sort }) => (
                <GenreRow
                  key={`${genreId}-${language}-${sort}`}
                  title={`${genreLabel} — ${label}`}
                  genreId={genreId}
                  language={language}
                  sort={sort}
                  fetchMore={makeFetchMore(genreId, language, sort)}
                />
              ))}
            </>
          )}
        </div>
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
