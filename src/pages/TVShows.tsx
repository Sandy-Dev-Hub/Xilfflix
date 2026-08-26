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
    (rowGenreId: number | undefined, rowLang: string | undefined, sort: string) => async (page: number): Promise<Movie[]> => {
      const result = await getDiscoverTVPage(rowGenreId, page, sort, rowLang);
      return result.movies;
    },
    []
  );

  const genreLabel = selectedGenre ? selectedGenre.label : 'All TV Shows';
  const visibleHero = heroShows?.slice(0, 10) ?? [];

  const pillOptions: GenreOption[] = TV_GENRES.map(g => ({
    id: g.id,
    label: g.label,
    paramType: 'genre',
  }));

  const mobileFetchMore = useCallback(
    (page: number) => getDiscoverTVPage(genreId, page, "popularity.desc", undefined).then(r => r.movies),
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
          <h1 className="font-display font-black text-3xl text-white">All Shows</h1>
          <p className="text-xf-subtle text-sm mt-1">A broad wall of shows worth browsing.</p>
        </div>

        <FilterPillBar 
          options={pillOptions}
          selected={selectedGenre}
          onSelect={setSelectedGenre}
          allLabel="All Shows"
        />

        <MovieGrid fetchMore={mobileFetchMore} />
      </div>

      {/* ── Desktop Layout (hidden md:block) ── */}
      <div className="hidden md:block">
        {/* Filter Header */}
        <div className="pt-24 pb-6 px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 bg-xf-bg relative z-20">
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white drop-shadow-md">TV Shows</h1>
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
              <TVGenreRow
                key={`upcoming-${language}`}
                title={`Upcoming ${selectedGenre?.label} Shows`}
                genreId={undefined}
                language={language}
                sort="first_air_date.desc"
                fetchMore={makeFetchMore(undefined, language, "first_air_date.desc")}
              />
              {TV_GENRES.map(g => (
                <TVGenreRow
                  key={`${g.id}-${language}-pop`}
                  title={`${selectedGenre?.label} ${g.label} Shows`}
                  genreId={g.id}
                  language={language}
                  sort="popularity.desc"
                  fetchMore={makeFetchMore(g.id, language, "popularity.desc")}
                />
              ))}
            </>
          ) : genreId ? (
            <>
              <TVGenreRow
                key={`upcoming-${genreId}`}
                title={`Upcoming ${selectedGenre?.label} Shows`}
                genreId={genreId}
                language={undefined}
                sort="first_air_date.desc"
                fetchMore={makeFetchMore(genreId, undefined, "first_air_date.desc")}
              />
              {LANGUAGE_OPTIONS.filter(l => l.id !== 'all').map(lang => (
                <TVGenreRow
                  key={`${genreId}-${lang.id}-pop`}
                  title={`${lang.label} ${selectedGenre?.label} Shows`}
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
                <TVGenreRow
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
