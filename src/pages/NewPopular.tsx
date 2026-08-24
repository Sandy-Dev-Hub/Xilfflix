import { motion } from 'framer-motion';
import { Flame, Sparkles } from 'lucide-react';
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

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-xf-bg"
    >
      <div className="pt-24 pb-6 px-4 sm:px-8 lg:px-12 border-b border-white/8">
        <h1 className="font-display font-black text-3xl text-white mb-1">New & Popular</h1>
        <p className="text-xf-muted text-sm">What everyone's watching right now</p>
      </div>

      <div className="flex flex-col gap-12 py-8 pb-16 min-h-[50vh]">
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
              <div className="flex flex-wrap gap-4">
                {data.newReleases.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <MovieCard movie={m} />
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
              <div className="flex flex-wrap gap-4">
                {data.trending.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <MovieCard movie={m} />
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
