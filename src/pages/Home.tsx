import { useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import Hero from '@/components/Hero';
import MovieRow from '@/components/MovieRow';
import ContinueWatching from '@/components/ContinueWatching';
import Footer from '@/components/Footer';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { useTMDB } from '@/hooks/useTMDB';
import { useAppStore } from '@/store/useAppStore';
import {
  getTrending,
  getNewReleases,
  getTopRated,
  getPresetPage,
} from '@/services/tmdb';
import { homeRowPresets, type RowPreset } from '@/data/rowPresets';
import type { Movie } from '@/types/movie';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// Compute 60-days-ago ISO date string once per render cycle
function recent60DaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 60);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Resolve the RECENT_60 placeholder in preset minReleaseDate
function resolvePreset(preset: RowPreset): RowPreset {
  if (preset.minReleaseDate === 'RECENT_60') {
    return { ...preset, minReleaseDate: recent60DaysAgo() };
  }
  return preset;
}

async function fetchAboveTheFoldData() {
  const [trending, topRatedMovies, topRatedTV] = await Promise.all([
    getTrending('day'),
    getTopRated('movie', 1),
    getTopRated('tv', 1),
  ]);
  return {
    trending,
    topRatedMovies: topRatedMovies.movies.slice(0, 10),
    topRatedTV: topRatedTV.movies.slice(0, 10),
  };
}

export default function Home() {
  const { data, loading, error } = useTMDB(fetchAboveTheFoldData);
  const { seedDynamicNotifications, profile, myList, continueWatching } = useAppStore();

  // Seed dynamic "Now Available" notifications once trending data loads
  useEffect(() => {
    if (data?.trending && data.trending.length > 0) {
      seedDynamicNotifications(data.trending);
    }
  }, [data?.trending, seedDynamicNotifications]);

  // ── "Your Next Watch" heuristic: genres from continue-watching history ────────
  const nextWatchGenres = useMemo(() => {
    const ids = Object.keys(continueWatching);
    if (ids.length === 0) return null;
    // The most recently watched title's genres (stored in movieMeta is minimal;
    // we just return null here if no genre data — the row will self-skip)
    return null; // Row falls back to Drama/Thriller when no history is available
  }, [continueWatching]);

  // ── "We Think You'll Love This" heuristic: genres from My List ───────────────
  const loveThisGenreId = useMemo(() => {
    if (myList.length === 0) return null;
    // Pick the most frequent genre across My List items
    const freq: Record<string, number> = {};
    const GENRE_TO_ID: Record<string, number> = {
      Action: 28, Comedy: 35, Drama: 18, Thriller: 53, 'Sci-Fi': 878,
      Horror: 27, Romance: 10749, Crime: 80, Mystery: 9648, Adventure: 12,
    };
    for (const m of myList) {
      for (const g of m.genres) {
        freq[g] = (freq[g] ?? 0) + 1;
      }
    }
    const topGenre = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
    return topGenre ? (GENRE_TO_ID[topGenre] ?? null) : null;
  }, [myList]);

  // ── Preset fetchMore factories ─────────────────────────────────────────────────
  const makeFetchMore = useCallback(
    (preset: RowPreset) => async (page: number): Promise<Movie[]> => {
      const resolved = resolvePreset(preset);
      const result = await getPresetPage(resolved, page);
      return result.movies;
    },
    []
  );

  if (error) {
    return (
      <div className="min-h-screen bg-xf-bg flex items-center justify-center">
        <p className="text-xf-red">Failed to load content. Please try again.</p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="pt-20 bg-xf-bg min-h-screen">
        <LoadingSkeleton variant="hero" />
        <div className="mt-8">
          <LoadingSkeleton variant="row" count={4} />
        </div>
      </div>
    );
  }

  const { trending, topRatedMovies, topRatedTV } = data;
  const heroMovies = trending.slice(0, 5);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-xf-bg"
    >
      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <Hero movies={heroMovies} />

      <div className="mt-[-60px] relative z-10 flex flex-col gap-10 pb-4">

        {/* ── 1. TV Action & Adventure (preset row) ─────────────────────────── */}
        <PresetRow preset={homeRowPresets[0]} makeFetchMore={makeFetchMore} />

        {/* ── 2. Continue Watching for {username} ───────────────────────────── */}
        <ContinueWatching />

        {/* ── 3. Your Next Watch (heuristic — Thriller fallback) ────────────── */}
        <PresetRow
          preset={{ title: `Your Next Watch`, mediaType: 'movie', genreIds: [53, 18] }}
          makeFetchMore={makeFetchMore}
        />

        {/* ── 4. Top 10 Movies in India ─────────────────────────────────────── */}
        <MovieRow
          title="Top 10 Movies in India"
          movies={topRatedMovies}
          variant="topTen"
        />

        {/* ── 5. My List (skip when empty) ──────────────────────────────────── */}
        {myList.length > 0 && (
          <MovieRow
            title={`My List`}
            movies={myList}
          />
        )}

        {/* ── 6. We Think You'll Love This ──────────────────────────────────── */}
        <PresetRow
          preset={{
            title: "We Think You'll Love This",
            mediaType: 'movie',
            genreIds: loveThisGenreId ? [loveThisGenreId] : [18, 35],
            sortBy: 'vote_average.desc',
          }}
          makeFetchMore={makeFetchMore}
        />

        {/* ── 7–21. Preset rows (items 1–21 from homeRowPresets, skipping index 0) */}
        {homeRowPresets.slice(1).map((preset) => (
          <PresetRow key={preset.title} preset={preset} makeFetchMore={makeFetchMore} />
        ))}

        {/* ── Top 10 Shows in India ─────────────────────────────────────────── */}
        <MovieRow
          title="Top 10 Shows in India"
          movies={topRatedTV}
          variant="topTen"
        />

      </div>

      <Footer />
    </motion.div>
  );
}

// ─── Preset Row sub-component ─────────────────────────────────────────────────
// Fetches page 1 for a given preset, then passes fetchMore for infinite scroll.
// Renders nothing if page 1 comes back empty.
function PresetRow({
  preset,
  makeFetchMore,
}: {
  preset: RowPreset;
  makeFetchMore: (preset: RowPreset) => (page: number) => Promise<Movie[]>;
}) {
  const resolved = resolvePreset(preset);

  const { data, loading } = useTMDB(
    () => getPresetPage(resolved, 1),
    [JSON.stringify(resolved)]
  );

  const fetchMore = useCallback(
    (page: number) => makeFetchMore(preset)(page),
    [preset, makeFetchMore]
  );

  if (loading) {
    return (
      <div className="px-4 sm:px-8 lg:px-12">
        <div className="h-5 w-52 bg-xf-card skeleton rounded mb-3" />
        <LoadingSkeleton variant="row" count={1} />
      </div>
    );
  }

  // Skip empty rows entirely
  if (!data || data.movies.length === 0) return null;

  return (
    <MovieRow
      title={preset.title}
      movies={data.movies}
      fetchMore={fetchMore}
    />
  );
}
