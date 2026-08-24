import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tv } from 'lucide-react';
import { getPopularTVShows, getDiscoverTV } from '@/services/tmdb';
import { useTMDB } from '@/hooks/useTMDB';
import MovieCard from '@/components/MovieCard';
import Footer from '@/components/Footer';
import LoadingSkeleton from '@/components/LoadingSkeleton';

const TV_GENRES = [
  { id: 0, name: 'All' },
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 9648, name: 'Mystery' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
];

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0 },
};

export default function TVShows() {
  const [activeGenre, setActiveGenre] = useState(0);

  const fetchShows = useCallback(() => {
    return activeGenre === 0 ? getPopularTVShows() : getDiscoverTV(activeGenre);
  }, [activeGenre]);

  const { data: shows, loading, error } = useTMDB(fetchShows, [activeGenre]);

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
          <Tv size={22} className="text-xf-red" />
          <h1 className="font-display font-black text-3xl text-white">TV Shows</h1>
        </div>
        <p className="text-xf-muted text-sm">Explore popular television series</p>
      </div>

      {/* Genre filter tabs */}
      <div className="px-4 sm:px-8 lg:px-12 py-5 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {TV_GENRES.map((genre) => (
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
          <p className="text-xf-red">Failed to load TV shows.</p>
        ) : loading ? (
          <div className="mt-4">
            <LoadingSkeleton variant="row" count={2} />
          </div>
        ) : !shows || shows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Tv size={40} className="text-xf-subtle" />
            <p className="text-xf-muted">No TV shows found in this genre</p>
          </div>
        ) : (
          <motion.div
            key={activeGenre}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-wrap gap-4"
          >
            {shows.map((show) => (
              <MovieCard key={show.id} movie={show} />
            ))}
          </motion.div>
        )}
      </div>

      <Footer />
    </motion.div>
  );
}
