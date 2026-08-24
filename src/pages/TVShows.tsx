import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tv } from 'lucide-react';
import { getByType } from '@/data/movies';
import MovieCard from '@/components/MovieCard';
import Footer from '@/components/Footer';

const GENRES = ['All', 'Drama', 'Thriller', 'Comedy', 'Sci-Fi', 'Crime', 'Mystery', 'Action', 'History'];

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0 },
};

export default function TVShows() {
  const [activeGenre, setActiveGenre] = useState('All');

  const allShows = getByType('tv');
  const filtered =
    activeGenre === 'All'
      ? allShows
      : allShows.filter((m) =>
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
      <div className="pt-24 pb-6 px-4 sm:px-8 lg:px-12 border-b border-white/8">
        <div className="flex items-center gap-3 mb-2">
          <Tv size={22} className="text-xf-red" />
          <h1 className="font-display font-black text-3xl text-white">TV Shows</h1>
        </div>
        <p className="text-xf-muted text-sm">{allShows.length} series available</p>
      </div>

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

      <div className="px-4 sm:px-8 lg:px-12 pb-16">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Tv size={40} className="text-xf-subtle" />
            <p className="text-xf-muted">No shows found in this genre</p>
          </div>
        ) : (
          <motion.div
            key={activeGenre}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-wrap gap-4"
          >
            {filtered.map((show) => (
              <MovieCard key={show.id} movie={show} />
            ))}
          </motion.div>
        )}
      </div>

      <Footer />
    </motion.div>
  );
}
