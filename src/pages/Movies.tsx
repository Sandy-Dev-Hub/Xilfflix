import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
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

const ALL_MOVIE_GENRES = [
  { id: 28, label: 'Action & Adventure' },
  { id: 53, label: 'Thriller' },
  { id: 80, label: 'Crime' },
  { id: 27, label: 'Horror' },
  { id: 35, label: 'Comedy' },
  { id: 878, label: 'Sci-Fi & Fantasy' },
  { id: 18, label: 'Drama' },
  { id: 10749, label: 'Romance' },
  { id: 16, label: 'Animation' },
  { id: 9648, label: 'Mystery' },
];

const LANGUAGE_ROWS = [
  { id: 'en', label: 'Hollywood & English' },
  { id: 'ta', label: 'Tamil' },
  { id: 'te', label: 'Telugu' },
  { id: 'hi', label: 'Hindi' },
  { id: 'ml', label: 'Malayalam' },
  { id: 'all', label: 'International & Global' },
];

export default function Movies() {
  const [selectedGenre, setSelectedGenre] = useState<GenreOption | null>(null);
  const [addonRoot, setAddonRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setAddonRoot(document.getElementById('navbar-addon'));
  }, []);

  const genreId = selectedGenre?.paramType === 'genre' ? selectedGenre.id : undefined;
  const language = selectedGenre?.paramType === 'language' ? String(selectedGenre.id) : undefined;

  // Hero data (top movies for current filter)
  const fetchHero = useCallback(() =>
    getDiscoverMovies(genreId, language),
    [genreId, language]
  );
  const { data: heroMovies, loading: heroLoading } = useTMDB(fetchHero, [genreId, language]);

  // Make fetchMore factory for each row
  const makeFetchMore = useCallback(
    (rowGenreId: number | string | undefined, rowLang: string | undefined, sort: string) => async (page: number): Promise<Movie[]> => {
      const result = await getDiscoverMoviesPage(rowGenreId, page, sort, rowLang);
      return result.movies;
    },
    []
  );

  const genreLabel = selectedGenre ? selectedGenre.label : 'All Movies';
  const visibleHero = heroMovies?.slice(0, 10) ?? [];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-xf-bg"
    >
      {/* Navbar Addon: XILFFLIX > Movies [Genres ⌵] */}
      {addonRoot && createPortal(
        <div className="flex items-center gap-1 sm:gap-2 ml-1.5 sm:ml-4">
          <ChevronRight size={14} className="text-white/50 shrink-0 sm:w-4 sm:h-4" />
          <span className="font-display font-bold text-xs sm:text-lg text-white truncate">Movies</span>
          <GenreDropdown selected={selectedGenre} onSelect={setSelectedGenre} />
        </div>,
        addonRoot
      )}

      {/* Hero Section */}
      <div className="relative">
        {heroLoading ? (
          <LoadingSkeleton variant="hero" />
        ) : (
          <Hero movies={visibleHero} />
        )}
      </div>

      {/* Home-like Movie Rows */}
      <div className="max-md:mt-4 md:mt-[-40px] relative z-10 flex flex-col gap-10 pb-16">
        {language ? (
          /* ── When a specific Language is selected ── */
          <>
            <GenreRow
              key={`upcoming-${language}`}
              title={`Upcoming ${selectedGenre?.label} Movies`}
              genreId={undefined}
              language={language}
              sort="primary_release_date.desc"
              fetchMore={makeFetchMore(undefined, language, "primary_release_date.desc")}
            />
            <GenreRow
              key={`pop-${language}`}
              title={`Popular ${selectedGenre?.label} Movies`}
              genreId={undefined}
              language={language}
              sort="popularity.desc"
              fetchMore={makeFetchMore(undefined, language, "popularity.desc")}
            />
            <GenreRow
              key={`top-${language}`}
              title={`Top Rated ${selectedGenre?.label} Movies`}
              genreId={undefined}
              language={language}
              sort="vote_average.desc"
              fetchMore={makeFetchMore(undefined, language, "vote_average.desc")}
            />
            {ALL_MOVIE_GENRES.map(g => (
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
          /* ── When a specific Genre is selected (e.g. Horror, Crime, Thriller, Action, etc.) ── */
          <>
            <GenreRow
              key={`upcoming-${genreId}`}
              title={`New & Upcoming ${genreLabel} Movies`}
              genreId={genreId}
              language={undefined}
              sort="primary_release_date.desc"
              fetchMore={makeFetchMore(genreId, undefined, "primary_release_date.desc")}
            />
            <GenreRow
              key={`pop-${genreId}`}
              title={`Trending ${genreLabel} Movies`}
              genreId={genreId}
              language={undefined}
              sort="popularity.desc"
              fetchMore={makeFetchMore(genreId, undefined, "popularity.desc")}
            />
            <GenreRow
              key={`top-${genreId}`}
              title={`Critically Acclaimed ${genreLabel}`}
              genreId={genreId}
              language={undefined}
              sort="vote_average.desc"
              fetchMore={makeFetchMore(genreId, undefined, "vote_average.desc")}
            />

            {/* Regional & International rows for the selected Genre */}
            {LANGUAGE_ROWS.map(lang => (
              <GenreRow
                key={`${genreId}-${lang.id}-pop`}
                title={`${lang.label} ${genreLabel} Movies`}
                genreId={genreId}
                language={lang.id}
                sort="popularity.desc"
                fetchMore={makeFetchMore(genreId, lang.id, "popularity.desc")}
              />
            ))}

            {/* Sub-genre / Category Combos */}
            {String(genreId) === '80' /* Crime */ && (
              <>
                <GenreRow
                  title="Crime & Suspense Thrillers"
                  genreId="80,53"
                  language={undefined}
                  sort="popularity.desc"
                  fetchMore={makeFetchMore("80,53", undefined, "popularity.desc")}
                />
                <GenreRow
                  title="Heist & Action Crime"
                  genreId="80,28"
                  language={undefined}
                  sort="popularity.desc"
                  fetchMore={makeFetchMore("80,28", undefined, "popularity.desc")}
                />
                <GenreRow
                  title="Mystery & Detective Crime"
                  genreId="80,9648"
                  language={undefined}
                  sort="popularity.desc"
                  fetchMore={makeFetchMore("80,9648", undefined, "popularity.desc")}
                />
              </>
            )}

            {String(genreId) === '53' /* Thriller */ && (
              <>
                <GenreRow
                  title="Crime Thrillers"
                  genreId="53,80"
                  language={undefined}
                  sort="popularity.desc"
                  fetchMore={makeFetchMore("53,80", undefined, "popularity.desc")}
                />
                <GenreRow
                  title="Psychological & Mystery Thrillers"
                  genreId="53,9648"
                  language={undefined}
                  sort="popularity.desc"
                  fetchMore={makeFetchMore("53,9648", undefined, "popularity.desc")}
                />
                <GenreRow
                  title="Action Thrillers"
                  genreId="53,28"
                  language={undefined}
                  sort="popularity.desc"
                  fetchMore={makeFetchMore("53,28", undefined, "popularity.desc")}
                />
              </>
            )}

            {String(genreId) === '27' /* Horror */ && (
              <>
                <GenreRow
                  title="Supernatural & Thriller Horror"
                  genreId="27,53"
                  language={undefined}
                  sort="popularity.desc"
                  fetchMore={makeFetchMore("27,53", undefined, "popularity.desc")}
                />
                <GenreRow
                  title="Mystery & Psychological Horror"
                  genreId="27,9648"
                  language={undefined}
                  sort="popularity.desc"
                  fetchMore={makeFetchMore("27,9648", undefined, "popularity.desc")}
                />
                <GenreRow
                  title="Sci-Fi & Creature Horror"
                  genreId="27,878"
                  language={undefined}
                  sort="popularity.desc"
                  fetchMore={makeFetchMore("27,878", undefined, "popularity.desc")}
                />
              </>
            )}

            {/* Related rows */}
            {ALL_MOVIE_GENRES.filter(g => String(g.id) !== String(genreId)).slice(0, 4).map(g => (
              <GenreRow
                key={`related-${g.id}`}
                title={`More in ${g.label}`}
                genreId={g.id}
                language={undefined}
                sort="popularity.desc"
                fetchMore={makeFetchMore(g.id, undefined, "popularity.desc")}
              />
            ))}
          </>
        ) : (
          /* ── When All Movies is selected (Default) ── */
          <>
            {SORT_VARIANTS.map(({ label, sort }) => (
              <GenreRow
                key={`sort-${sort}`}
                title={`${genreLabel} — ${label}`}
                genreId={genreId}
                language={language}
                sort={sort}
                fetchMore={makeFetchMore(genreId, language, sort)}
              />
            ))}
            {ALL_MOVIE_GENRES.map(g => (
              <GenreRow
                key={`all-${g.id}`}
                title={`${g.label} Movies`}
                genreId={g.id}
                language={undefined}
                sort="popularity.desc"
                fetchMore={makeFetchMore(g.id, undefined, "popularity.desc")}
              />
            ))}
            {LANGUAGE_ROWS.map(l => (
              <GenreRow
                key={`all-lang-${l.id}`}
                title={`${l.label} Movies`}
                genreId={undefined}
                language={l.id}
                sort="popularity.desc"
                fetchMore={makeFetchMore(undefined, l.id, "popularity.desc")}
              />
            ))}
          </>
        )}
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
  genreId?: number | string;
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
