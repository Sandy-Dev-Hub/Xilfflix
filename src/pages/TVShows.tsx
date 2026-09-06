import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
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

const ALL_TV_GENRES = [
  { id: 10759, label: 'Action & Adventure' },
  { id: 80, label: 'Crime' },
  { id: 9648, label: 'Mystery & Thriller' },
  { id: 10765, label: 'Sci-Fi & Fantasy' },
  { id: 35, label: 'Comedy' },
  { id: 18, label: 'Drama' },
  { id: 16, label: 'Animation & Anime' },
  { id: 99, label: 'Documentary' },
];

const LANGUAGE_ROWS = [
  { id: 'en', label: 'Hollywood & English' },
  { id: 'ta', label: 'Tamil' },
  { id: 'te', label: 'Telugu' },
  { id: 'hi', label: 'Hindi' },
  { id: 'ml', label: 'Malayalam' },
  { id: 'all', label: 'International & Anime' },
];

export default function TVShows() {
  const [selectedGenre, setSelectedGenre] = useState<GenreOption | null>(null);
  const [addonRoot, setAddonRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setAddonRoot(document.getElementById('navbar-addon'));
  }, []);

  const genreId = selectedGenre?.paramType === 'genre' ? selectedGenre.id : undefined;
  const language = selectedGenre?.paramType === 'language' ? String(selectedGenre.id) : undefined;

  const fetchHero = useCallback(
    () => getDiscoverTV(genreId, language),
    [genreId, language]
  );
  const { data: heroShows, loading: heroLoading } = useTMDB(fetchHero, [genreId, language]);

  const makeFetchMore = useCallback(
    (rowGenreId: number | string | undefined, rowLang: string | undefined, sort: string) => async (page: number): Promise<Movie[]> => {
      const result = await getDiscoverTVPage(rowGenreId, page, sort, rowLang);
      return result.movies;
    },
    []
  );

  const genreLabel = selectedGenre ? selectedGenre.label : 'All TV Shows';
  const visibleHero = heroShows?.slice(0, 10) ?? [];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-xf-bg"
    >
      {/* Navbar Addon: XILFFLIX > TV Shows [Genres ⌵] */}
      {addonRoot && createPortal(
        <div className="flex items-center gap-1 sm:gap-2 ml-1.5 sm:ml-4">
          <ChevronRight size={14} className="text-white/50 shrink-0 sm:w-4 sm:h-4" />
          <span className="font-display font-bold text-xs sm:text-lg text-white whitespace-nowrap">TV Shows</span>
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

      {/* Home-like TV Rows */}
      <div className="max-md:mt-4 md:mt-[-40px] relative z-10 flex flex-col gap-10 pb-16">
        {language ? (
          /* ── When a specific Language is selected ── */
          <>
            <TVGenreRow
              key={`upcoming-${language}`}
              title={`Upcoming ${selectedGenre?.label} Shows`}
              genreId={undefined}
              language={language}
              sort="first_air_date.desc"
              fetchMore={makeFetchMore(undefined, language, "first_air_date.desc")}
            />
            <TVGenreRow
              key={`pop-${language}`}
              title={`Popular ${selectedGenre?.label} Shows`}
              genreId={undefined}
              language={language}
              sort="popularity.desc"
              fetchMore={makeFetchMore(undefined, language, "popularity.desc")}
            />
            <TVGenreRow
              key={`top-${language}`}
              title={`Top Rated ${selectedGenre?.label} Shows`}
              genreId={undefined}
              language={language}
              sort="vote_average.desc"
              fetchMore={makeFetchMore(undefined, language, "vote_average.desc")}
            />
            {ALL_TV_GENRES.map(g => (
              <TVGenreRow
                key={`${g.id}-${language}-pop`}
                title={`${selectedGenre?.label} ${g.label}`}
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
            <TVGenreRow
              key={`upcoming-${genreId}`}
              title={`New & Upcoming ${genreLabel} Shows`}
              genreId={genreId}
              language={undefined}
              sort="first_air_date.desc"
              fetchMore={makeFetchMore(genreId, undefined, "first_air_date.desc")}
            />
            <TVGenreRow
              key={`pop-${genreId}`}
              title={`Trending ${genreLabel} Shows`}
              genreId={genreId}
              language={undefined}
              sort="popularity.desc"
              fetchMore={makeFetchMore(genreId, undefined, "popularity.desc")}
            />
            <TVGenreRow
              key={`top-${genreId}`}
              title={`Critically Acclaimed ${genreLabel}`}
              genreId={genreId}
              language={undefined}
              sort="vote_average.desc"
              fetchMore={makeFetchMore(genreId, undefined, "vote_average.desc")}
            />

            {/* Regional & International rows for the selected Genre */}
            {LANGUAGE_ROWS.map(lang => (
              <TVGenreRow
                key={`${genreId}-${lang.id}-pop`}
                title={`${lang.label} ${genreLabel} Shows`}
                genreId={genreId}
                language={lang.id}
                sort="popularity.desc"
                fetchMore={makeFetchMore(genreId, lang.id, "popularity.desc")}
              />
            ))}

            {/* Sub-genre combinations */}
            {(String(genreId) === '80' || String(genreId) === '53') && (
              <>
                <TVGenreRow
                  title="Gritty Crime & Suspense Thrillers"
                  genreId="80|9648"
                  language={undefined}
                  sort="popularity.desc"
                  fetchMore={makeFetchMore("80|9648", undefined, "popularity.desc")}
                />
                <TVGenreRow
                  title="Action-Packed Crime Shows"
                  genreId="10759,80"
                  language={undefined}
                  sort="popularity.desc"
                  fetchMore={makeFetchMore("10759,80", undefined, "popularity.desc")}
                />
              </>
            )}

            {(String(genreId) === '27' || String(genreId) === '9648') && (
              <>
                <TVGenreRow
                  title="Supernatural & Mystery Horrors"
                  genreId="9648|10765"
                  language={undefined}
                  sort="popularity.desc"
                  fetchMore={makeFetchMore("9648|10765", undefined, "popularity.desc")}
                />
                <TVGenreRow
                  title="Dark Fantasy & Thrillers"
                  genreId="10765,9648"
                  language={undefined}
                  sort="popularity.desc"
                  fetchMore={makeFetchMore("10765,9648", undefined, "popularity.desc")}
                />
              </>
            )}

            {/* Related rows */}
            {ALL_TV_GENRES.filter(g => String(g.id) !== String(genreId)).slice(0, 4).map(g => (
              <TVGenreRow
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
          /* ── When All TV Shows is selected (Default) ── */
          <>
            {SORT_VARIANTS.map(({ label, sort }) => (
              <TVGenreRow
                key={`sort-${sort}`}
                title={`${genreLabel} — ${label}`}
                genreId={genreId}
                language={language}
                sort={sort}
                fetchMore={makeFetchMore(genreId, language, sort)}
              />
            ))}
            {ALL_TV_GENRES.map(g => (
              <TVGenreRow
                key={`all-${g.id}`}
                title={`${g.label}`}
                genreId={g.id}
                language={undefined}
                sort="popularity.desc"
                fetchMore={makeFetchMore(g.id, undefined, "popularity.desc")}
              />
            ))}
            {LANGUAGE_ROWS.map(l => (
              <TVGenreRow
                key={`all-lang-${l.id}`}
                title={`${l.label} Shows`}
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

// ─── Sub-component for each TV sort-variant row ────────────────────────────────
function TVGenreRow({
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
