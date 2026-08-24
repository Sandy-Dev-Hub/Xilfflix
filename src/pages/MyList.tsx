import { motion, AnimatePresence } from 'framer-motion';
import { List, Trash2, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import MovieCard from '@/components/MovieCard';
import Footer from '@/components/Footer';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0 },
};

export default function MyList() {
  const { myList, removeFromList } = useAppStore();
  const navigate = useNavigate();

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
        <div className="flex items-center gap-3 mb-1">
          <List size={22} className="text-xf-red" />
          <h1 className="font-display font-black text-3xl text-white">My List</h1>
        </div>
        <p className="text-xf-muted text-sm">{myList.length} saved title{myList.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 py-8 pb-16">
        {myList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-5"
          >
            <div className="w-20 h-20 rounded-full bg-xf-card border border-white/10 flex items-center justify-center">
              <Film size={32} className="text-xf-subtle" />
            </div>
            <div className="text-center">
              <h3 className="text-white font-semibold text-lg mb-2">Your list is empty</h3>
              <p className="text-xf-muted text-sm max-w-xs">
                Browse movies and TV shows and add them to your list using the + button.
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-xf-red text-white font-semibold rounded-lg hover:bg-xf-red-hover transition-colors"
            >
              Browse Content
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="flex flex-wrap gap-4"
          >
            <AnimatePresence>
              {myList.map((movie) => (
                <motion.div
                  key={movie.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.25 }}
                  className="relative group"
                >
                  <MovieCard movie={movie} />
                  {/* Remove overlay */}
                  <button
                    onClick={() => removeFromList(movie.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-xf-red"
                    aria-label={`Remove ${movie.title} from My List`}
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Footer />
    </motion.div>
  );
}
