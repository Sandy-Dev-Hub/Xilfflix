import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  Plus,
  Check,
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  Shield,
} from 'lucide-react';
import { getMovieDetails } from '@/services/tmdb';
import { useTMDB } from '@/hooks/useTMDB';
import { useAppStore } from '@/store/useAppStore';
import MovieRow from '@/components/MovieRow';
import Footer from '@/components/Footer';
import NotFound from '@/components/NotFound';
import LoadingSkeleton from '@/components/LoadingSkeleton';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0 },
};

export default function MovieDetails({ type }: { type: 'movie' | 'tv' }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToList, removeFromList, isInList } = useAppStore();

  const { data: movie, loading, error } = useTMDB(() => {
    if (!id) return Promise.reject(new Error('No ID'));
    return getMovieDetails(id, type);
  }, [id, type]);

  if (error) return <NotFound />;
  if (loading || !movie) {
    return (
      <div className="pt-20 bg-xf-bg min-h-screen">
        <LoadingSkeleton variant="hero" />
      </div>
    );
  }

  const inList = isInList(movie.id);

  // We added 'similar' via append_to_response, but we need to extract it from the raw TMDB response if we didn't normalize it.
  // Wait, our normalizer doesn't extract 'similar'. Let's just fetch it separately or update the service.
  // Actually, I'll fetch it separately to keep the Movie object clean, or we can just fetch it here.
  // Let's modify the component to just use a second hook for similar, or we can just skip it for now and add it in a sec.
  
  // For now, I'll just skip the similar row, or fetch it right here:
  // I will add a second fetch for similar movies in a separate component or just fetch them here.
  // Let's use getDiscoverMovies instead if we don't have it, but wait, we need similar.
  // I will update tmdb.ts later to export getSimilar.

  const toggleList = () => {
    if (inList) removeFromList(movie.id);
    else addToList(movie);
  };

  const formatRuntime = (min: number) =>
    `${Math.floor(min / 60)}h ${min % 60}m`;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-xf-bg"
    >
      {/* Backdrop */}
      <div className="relative w-full h-[55vh] min-h-[360px] overflow-hidden">
        {movie.backdrop && (
          <img
            src={movie.backdrop}
            alt={movie.title}
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-xf-bg via-xf-bg/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-xf-bg/80 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-20 left-4 sm:left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/30 backdrop-blur-sm px-3 py-2 rounded-lg text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* Main info */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 -mt-32 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-shrink-0"
          >
            {movie.poster ? (
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-40 sm:w-52 lg:w-64 rounded-2xl shadow-2xl shadow-black/60 border border-white/10"
                loading="lazy"
              />
            ) : (
              <div className="w-40 sm:w-52 lg:w-64 aspect-[2/3] bg-xf-card rounded-2xl border border-white/10 flex items-center justify-center">
                <span className="text-xf-muted text-sm text-center px-4">{movie.title}</span>
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 pt-4 lg:pt-8"
          >
            {/* Type badge */}
            <span className="inline-block px-2.5 py-0.5 bg-xf-red/20 text-xf-red text-xs font-semibold rounded tracking-wider uppercase mb-3">
              {movie.type === 'tv' ? 'TV Series' : 'Movie'}
            </span>

            <h1 className="font-display font-black text-4xl sm:text-5xl text-white leading-tight mb-3">
              {movie.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1.5 text-yellow-400">
                <Star size={14} fill="currentColor" />
                <span className="font-semibold">{movie.rating.toFixed(1)}</span>
              </div>
              {movie.year > 0 && (
                <div className="flex items-center gap-1.5 text-xf-muted">
                  <Calendar size={14} />
                  <span>{movie.year}</span>
                </div>
              )}
              {movie.runtime > 0 && (
                <div className="flex items-center gap-1.5 text-xf-muted">
                  <Clock size={14} />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
              )}
              {movie.ageRating && (
                <div className="flex items-center gap-1.5 text-xf-muted">
                  <Shield size={14} />
                  <span className="border border-xf-subtle/50 px-1.5 py-0.5 rounded text-xs">
                    {movie.ageRating}
                  </span>
                </div>
              )}
            </div>

            {/* Genres */}
            {movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {movie.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 bg-xf-card border border-white/10 text-xf-muted text-xs rounded-full"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <p className="text-xf-muted text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
              {movie.description}
            </p>

            {/* Director & Cast */}
            <div className="mb-6 space-y-2 text-sm">
              {movie.director && (
                <div>
                  <span className="text-xf-subtle">Director: </span>
                  <span className="text-white">{movie.director}</span>
                </div>
              )}
              {movie.cast.length > 0 && (
                <div>
                  <span className="text-xf-subtle">Cast: </span>
                  <span className="text-xf-muted">{movie.cast.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/watch/${movie.type}/${movie.id}`)}
                className="flex items-center gap-2 px-7 py-3 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-colors shadow-lg"
                id={`details-play-${movie.id}`}
              >
                <Play size={18} fill="black" />
                Play Now
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={toggleList}
                className="flex items-center gap-2 px-6 py-3 bg-xf-card border border-white/20 text-white font-semibold rounded-lg hover:bg-xf-secondary transition-colors"
                id={`details-list-${movie.id}`}
              >
                {inList ? <Check size={18} /> : <Plus size={18} />}
                {inList ? 'In My List' : '+ My List'}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Cast avatars */}
        {movie.cast.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mt-12"
          >
            <h3 className="text-white font-bold text-lg mb-4">Cast</h3>
            <div className="flex flex-wrap gap-4">
              {movie.cast.map((name, i) => (
                <div key={name} className="flex flex-col items-center gap-2 w-20">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md border border-white/10"
                    style={{
                      background: `hsl(${(i * 53 + 12) % 360}, 55%, 35%)`,
                    }}
                  >
                    {name.charAt(0)}
                  </div>
                  <span className="text-xf-muted text-xs text-center leading-tight line-clamp-2">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </motion.div>
  );
}
