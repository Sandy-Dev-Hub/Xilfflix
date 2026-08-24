import { useState } from 'react';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import { getByType, getMoviesByGenre } from '@/data/movies';
import MovieCard from '@/components/MovieCard';
import Footer from '@/components/Footer';

const GENRES = ['All', 'Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi', 'Mystery', 'Horror', 'Adventure', 'Romance', 'Crime'];

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0 },
};

export default function Movies() {
  const [activeGenre, setActiveGenre] = useState('All');

  const allMovies = getByType('movie');
  const filtered =
    activeGenre === 'All'
      ? allMovies
      : allMovies.filter((m) =>
          m.genres.map((g) => g.toLowerCase()).includes(activeGenre.toLowerCase())
        );

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
        <p className="text-xf-muted text-sm">{allMovies.length} titles available</p>
      </div>

      {/* Genre filter tabs */}
      <div className="px-4 sm:px-8 lg:px-12 py-5 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                ${activeGenre === genre
                  ? 'bg-xf-red text-white shadow-lg shadow-xf-red/30'
                  : 'bg-xf-card border border-white/10 text-xf-muted hover:text-white hover:border-white/30'
                }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 sm:px-8 lg:px-12 pb-16">
        {filtered.length === 0 ? (
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
            {filtered.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </motion.div>
        )}
      </div>

      <Footer />
    </motion.div>
  );
}
