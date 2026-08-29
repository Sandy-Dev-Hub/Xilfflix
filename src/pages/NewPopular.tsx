import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Flame, Sparkles, ChevronRight } from 'lucide-react';
import { getNewReleases, getTrending } from '@/services/tmdb';
import { useTMDB } from '@/hooks/useTMDB';
import MovieCard from '@/components/MovieCard';
import Footer from '@/components/Footer';
import LoadingSkeleton from '@/components/LoadingSkeleton';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0 },
};

async function fetchNewPopular() {
  const [newReleases, trending] = await Promise.all([
    getNewReleases(),
    getTrending('week'),
  ]);
  return { newReleases, trending };
}

export default function NewPopular() {
  const { data, loading, error } = useTMDB(fetchNewPopular);
  const [addonRoot, setAddonRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setAddonRoot(document.getElementById('navbar-addon'));
  }, []);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-xf-bg"
    >
      {addonRoot && createPortal(
        <div className="flex items-center gap-2 ml-4">
          <ChevronRight size={18} className="text-white/50" />
          <span className="font-display font-bold text-xl text-white">New & Popular</span>
        </div>,
        addonRoot
      )}

      <div className="flex flex-col gap-12 py-8 pb-16 min-h-[50vh] pt-24">
        {error ? (
          <div className="px-4 sm:px-8 lg:px-12">
            <p className="text-xf-red">Failed to load content.</p>
          </div>
        ) : loading || !data ? (
          <div className="px-4 sm:px-8 lg:px-12 mt-4">
            <LoadingSkeleton variant="row" count={2} />
          </div>
        ) : (
          <>
            {/* New Releases */}
            <section className="px-4 sm:px-8 lg:px-12">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={18} className="text-xf-red" />
                <h2 className="font-display font-bold text-xl text-white">New Releases</h2>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
                {data.newReleases.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <MovieCard movie={m} fluid />
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Trending */}
            <section className="px-4 sm:px-8 lg:px-12">
              <div className="flex items-center gap-2 mb-5">
                <Flame size={18} className="text-orange-400" />
                <h2 className="font-display font-bold text-xl text-white">Trending This Week</h2>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
                {data.trending.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <MovieCard movie={m} fluid />
                  </motion.div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <Footer />
    </motion.div>
  );
}
