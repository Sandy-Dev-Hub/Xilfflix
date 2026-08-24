import { Suspense } from 'react';
import { motion } from 'framer-motion';
import Hero from '@/components/Hero';
import MovieRow from '@/components/MovieRow';
import ContinueWatching from '@/components/ContinueWatching';
import Footer from '@/components/Footer';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import {
  getTrending,
  getPopularMovies,
  getNewReleases,
  getTopRated,
  getMoviesByGenre,
  getRecommended,
  getByType,
} from '@/data/movies';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export default function Home() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-xf-bg"
    >
      <Hero />

      <div className="mt-[-60px] relative z-10 flex flex-col gap-10 pb-4">
        <ContinueWatching />

        <MovieRow title="Trending Now" movies={getTrending()} />
        <MovieRow title="Popular Movies" movies={getPopularMovies()} />
        <MovieRow title="New Releases" movies={getNewReleases()} />
        <MovieRow title="Top Rated" movies={getTopRated()} />
        <MovieRow title="Action & Thrill" movies={getMoviesByGenre('Action')} />
        <MovieRow title="Drama" movies={getMoviesByGenre('Drama')} />
        <MovieRow title="Comedy" movies={getMoviesByGenre('Comedy')} />
        <MovieRow title="Sci-Fi" movies={getMoviesByGenre('Sci-Fi')} />
        <MovieRow title="TV Shows" movies={getByType('tv')} />
        <MovieRow title="Recommended for You" movies={getRecommended()} />
      </div>

      <Footer />
    </motion.div>
  );
}
