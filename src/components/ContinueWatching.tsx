import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getMovieById } from '@/data/movies';

export default function ContinueWatching() {
  const { continueWatching, clearProgress } = useAppStore();
  const navigate = useNavigate();

  const entries = Object.entries(continueWatching)
    .filter(([, v]) => v.progress > 5 && v.duration > 0)
    .sort(([, a], [, b]) => b.lastWatched - a.lastWatched)
    .slice(0, 10);

  if (!entries.length) return null;

  return (
    <section className="px-4 sm:px-8 lg:px-12" aria-label="Continue Watching">
      <h2 className="mb-3 text-white font-display font-bold text-lg sm:text-xl tracking-tight">
        Continue Watching
      </h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {entries.map(([id, prog]) => {
          const movie = getMovieById(id);
          if (!movie) return null;
          const pct = Math.min((prog.progress / prog.duration) * 100, 100);

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative flex-shrink-0 w-[180px] sm:w-[200px] group cursor-pointer"
              onClick={() => navigate(`/watch/${movie.id}`)}
            >
              {/* Poster */}
              <div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-xf-card shadow-md">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Dark overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                  <Play
                    size={32}
                    fill="white"
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  />
                </div>
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div
                    className="h-full bg-xf-red transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="mt-2 flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{movie.title}</p>
                  <p className="text-xf-subtle text-xs mt-0.5">{Math.round(pct)}% watched</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearProgress(id);
                  }}
                  className="p-1 rounded text-xf-subtle hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label={`Remove ${movie.title} from continue watching`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
