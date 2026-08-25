import { useEffect, useCallback } from 'react';
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
  getPopularMovies,
  getNewReleases,
  getDiscoverMovies,
  getPopularTVShows,
  getTopRated,
  getDiscoverMoviesPage,
  getDiscoverTVPage,
} from '@/services/tmdb';
import type { Movie } from '@/types/movie';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

async function fetchHomeData() {
  const [trending, popular, newRel, action, drama, comedy, sciFi, tv, topRated] = await Promise.all([
    getTrending('day'),
    getPopularMovies(),
    getNewReleases(),
    getDiscoverMovies(28),   // Action
    getDiscoverMovies(18),   // Drama
    getDiscoverMovies(35),   // Comedy
    getDiscoverMovies(878),  // Sci-Fi
    getPopularTVShows(),
    getTopRated('movie', 1),
  ]);
  return { trending, popular, newRel, action, drama, comedy, sciFi, tv, topRated: topRated.movies.slice(0, 10) };
}

export default function Home() {
  const { data, loading, error } = useTMDB(fetchHomeData);
  const { seedDynamicNotifications } = useAppStore();

  // Seed dynamic "New Release: ..." notifications once data loads
  useEffect(() => {
    if (data?.newRel && data.newRel.length > 0) {
      seedDynamicNotifications(data.newRel);
    }
  }, [data?.newRel, seedDynamicNotifications]);

  // Infinite-scroll fetchers for genre rows
  const fetchMoreAction = useCallback(async (page: number): Promise<Movie[]> => {
    const result = await getDiscoverMoviesPage(28, page);
    return result.movies;
  }, []);

  const fetchMoreDrama = useCallback(async (page: number): Promise<Movie[]> => {
    const result = await getDiscoverMoviesPage(18, page);
    return result.movies;
  }, []);

  const fetchMoreComedy = useCallback(async (page: number): Promise<Movie[]> => {
    const result = await getDiscoverMoviesPage(35, page);
    return result.movies;
  }, []);

  const fetchMoreSciFi = useCallback(async (page: number): Promise<Movie[]> => {
    const result = await getDiscoverMoviesPage(878, page);
    return result.movies;
  }, []);

  const fetchMoreTV = useCallback(async (page: number): Promise<Movie[]> => {
    const result = await getDiscoverTVPage(undefined, page);
    return result.movies;
  }, []);

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
          <LoadingSkeleton variant="row" count={3} />
        </div>
      </div>
    );
  }

  const { trending, popular, newRel, action, drama, comedy, sciFi, tv, topRated } = data;
  const heroMovies = trending.slice(0, 5);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-xf-bg"
    >
      <Hero movies={heroMovies} />

      <div className="mt-[-60px] relative z-10 flex flex-col gap-10 pb-4">
        <ContinueWatching />

        <MovieRow title="Trending Now" movies={trending} />
        <MovieRow title="Popular Movies" movies={popular} />
        <MovieRow title="New Releases" movies={newRel} />

        {/* Top 10 row — no infinite scroll, only show 10 */}
        <MovieRow
          title="Top 10 in the US Today"
          movies={topRated}
          variant="topTen"
        />

        <MovieRow
          title="Action & Thrill"
          movies={action}
          fetchMore={fetchMoreAction}
        />
        <MovieRow
          title="Drama"
          movies={drama}
          fetchMore={fetchMoreDrama}
        />
        <MovieRow
          title="Comedy"
          movies={comedy}
          fetchMore={fetchMoreComedy}
        />
        <MovieRow
          title="Sci-Fi"
          movies={sciFi}
          fetchMore={fetchMoreSciFi}
        />
        <MovieRow
          title="TV Shows"
          movies={tv}
          fetchMore={fetchMoreTV}
        />
      </div>

      <Footer />
    </motion.div>
  );
}
