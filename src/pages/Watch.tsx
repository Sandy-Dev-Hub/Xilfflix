import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Info } from 'lucide-react';
import { getMovieById } from '@/data/movies';
import { useAppStore } from '@/store/useAppStore';
import VideoPlayer from '@/components/VideoPlayer';
import ServerSelector from '@/components/ServerSelector';
import NotFound from '@/components/NotFound';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit: { opacity: 0 },
};

export default function Watch() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { saveProgress, getProgress } = useAppStore();
  const [serverIdx, setServerIdx] = useState(0);

  const movie = id ? getMovieById(id) : undefined;
  if (!movie) return <NotFound />;

  const savedProgress = getProgress(movie.id);
  const startAt = savedProgress?.progress ?? 0;

  const onlineServers = movie.servers.filter((s) => s.status === 'online');
  const activeServer = movie.servers[serverIdx];

  const handleProgress = useCallback(
    (_played: number, playedSeconds: number, duration: number) => {
      saveProgress(movie.id, playedSeconds, duration);
    },
    [movie.id, saveProgress]
  );

  const handleTryNextServer = () => {
    const nextOnline = movie.servers.findIndex(
      (s, i) => i !== serverIdx && s.status === 'online'
    );
    if (nextOnline !== -1) setServerIdx(nextOnline);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-xf-bg"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 pt-20 pb-16">
        {/* Back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(`/movie/${movie.id}`)}
            className="flex items-center gap-2 text-xf-muted hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back to Details
          </button>
          <button
            onClick={() => navigate(`/movie/${movie.id}`)}
            className="flex items-center gap-2 text-xf-muted hover:text-white transition-colors text-sm"
            aria-label="View movie info"
          >
            <Info size={16} />
            <span className="hidden sm:inline">More Info</span>
          </button>
        </div>

        {/* Title */}
        <div className="mb-5">
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            {movie.title}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-xf-muted">
            <span>{movie.year}</span>
            <span>·</span>
            <span>{movie.type === 'tv' ? 'TV Series' : 'Movie'}</span>
            <span>·</span>
            <span>{movie.ageRating}</span>
          </div>
        </div>

        {/* Player */}
        <div className="mb-8">
          {activeServer?.status === 'online' ? (
            <VideoPlayer
              url={activeServer.sourceUrl}
              title={movie.title}
              startAt={startAt}
              onProgress={handleProgress}
              onError={handleTryNextServer}
            />
          ) : (
            <div className="aspect-video bg-xf-card rounded-2xl flex items-center justify-center border border-white/10">
              <p className="text-xf-muted">Selected server is offline. Choose another below.</p>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-xf-muted text-sm leading-relaxed mb-8 max-w-3xl">
          {movie.description}
        </p>

        {/* Server selector */}
        <ServerSelector
          servers={movie.servers}
          selectedIndex={serverIdx}
          onSelect={setServerIdx}
        />
      </div>
    </motion.div>
  );
}
