import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import { getPopularMovies, getDiscoverMovies } from '@/services/tmdb';
import { useTMDB } from '@/hooks/useTMDB';
import MovieCard from '@/components/MovieCard';
import Footer from '@/components/Footer';
import LoadingSkeleton from '@/components/LoadingSkeleton';

const MOVIE_GENRES = [
  { id: 0, name: 'All' },
  { id: 28, name: 'Action' },
  { id: 18, name: 'Drama' },
  { id: 35, name: 'Comedy' },
  { id: 53, name: 'Thriller' },
  { id: 878, name: 'Sci-Fi' },
  { id: 9648, name: 'Mystery' },
  { id: 27, name: 'Horror' },
  { id: 12, name: 'Adventure' },
  { id: 10749, name: 'Romance' },
  { id: 80, name: 'Crime' }
];

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0 },
};

export default function Movies() {
  const [activeGenre, setActiveGenre] = useState(0);

  const fetchMovies = useCallback(() => {
    return activeGenre === 0 ? getPopularMovies() : getDiscoverMovies(activeGenre);
  }, [activeGenre]);

  const { data: movies, loading, error } = useTMDB(fetchMovies, [activeGenre]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-xf-bg"
    >
      {/* Header */}
      <div className="pt-24 pb-6 px-4 sm:px-8 lg:px-12 border-b border-white/8">
        <div className="flex items-center gap-3 mb-2">
          <Film size={22} className="text-xf-red" />
          <h1 className="font-display font-black text-3xl text-white">Movies</h1>
        </div>
        <p className="text-xf-muted text-sm">Explore popular feature films</p>
      </div>

      {/* Genre filter tabs */}
      <div className="px-4 sm:px-8 lg:px-12 py-5 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {MOVIE_GENRES.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setActiveGenre(genre.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                ${activeGenre === genre.id
                  ? 'bg-xf-red text-white shadow-lg shadow-xf-red/30'
                  : 'bg-xf-card border border-white/10 text-xf-muted hover:text-white hover:border-white/30'
                }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 sm:px-8 lg:px-12 pb-16 min-h-[50vh]">
        {error ? (
          <p className="text-xf-red">Failed to load movies.</p>
        ) : loading ? (
          <div className="mt-4">
            <LoadingSkeleton variant="row" count={2} />
          </div>
        ) : !movies || movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Film size={40} className="text-xf-subtle" />
            <p className="text-xf-muted">No movies found in this genre</p>
          </div>
        ) : (
          <motion.div
            key={activeGenre}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-wrap gap-4"
          >
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </motion.div>
        )}
      </div>

      <Footer />
    </motion.div>
  );
}
