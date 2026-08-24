import { motion } from 'framer-motion';
import Hero from '@/components/Hero';
import MovieRow from '@/components/MovieRow';
import ContinueWatching from '@/components/ContinueWatching';
import Footer from '@/components/Footer';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { useTMDB } from '@/hooks/useTMDB';
import {
  getTrending,
  getPopularMovies,
  getNewReleases,
  getDiscoverMovies,
  getPopularTVShows,
} from '@/services/tmdb';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

async function fetchHomeData() {
  const [trending, popular, newRel, action, drama, comedy, sciFi, tv] = await Promise.all([
    getTrending('day'),
    getPopularMovies(),
    getNewReleases(),
    getDiscoverMovies(28), // Action
    getDiscoverMovies(18), // Drama
    getDiscoverMovies(35), // Comedy
    getDiscoverMovies(878), // Sci-Fi
    getPopularTVShows(),
  ]);
  return { trending, popular, newRel, action, drama, comedy, sciFi, tv };
}

export default function Home() {
  const { data, loading, error } = useTMDB(fetchHomeData);

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

  const { trending, popular, newRel, action, drama, comedy, sciFi, tv } = data;
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
        <MovieRow title="Action & Thrill" movies={action} />
        <MovieRow title="Drama" movies={drama} />
        <MovieRow title="Comedy" movies={comedy} />
        <MovieRow title="Sci-Fi" movies={sciFi} />
        <MovieRow title="TV Shows" movies={tv} />
      </div>

      <Footer />
    </motion.div>
  );
}
