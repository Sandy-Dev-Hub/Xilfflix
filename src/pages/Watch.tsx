import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, Tv2, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { getMovieDetails } from '@/services/tmdb';
import { useTMDB } from '@/hooks/useTMDB';
import { useAppStore } from '@/store/useAppStore';
import { makeServers } from '@/utils/servers';
import NotFound from '@/components/NotFound';
import LoadingSkeleton from '@/components/LoadingSkeleton';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit: { opacity: 0 },
};

export default function Watch({ type }: { type: 'movie' | 'tv' }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { saveProgress, getProgress, profile } = useAppStore();

  // TV-specific state
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [serverIdx, setServerIdx] = useState(0);
  const [iframeKey, setIframeKey] = useState(0); // force iframe reload on server/ep change
  const [iframeError, setIframeError] = useState(false);

  const { data: movie, loading, error } = useTMDB(() => {
    if (!id) return Promise.reject(new Error('No ID'));
    return getMovieDetails(id, type);
  }, [id, type]);

  // Save progress as a simple time-based snapshot (iframe doesn't expose currentTime)
  useEffect(() => {
    if (!movie) return;
    const interval = setInterval(() => {
      const prog = getProgress(movie.id);
      const elapsed = (prog?.progress ?? 0) + 30; // assume 30 s watched per tick
      const duration = movie.runtime ? movie.runtime * 60 : 5400;
      saveProgress(movie.id, Math.min(elapsed, duration), duration, {
        id: movie.id,
        title: movie.title,
        type: movie.type,
        poster: movie.poster,
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [movie, saveProgress, getProgress]);

  // Rebuild servers when movie ID or season/episode changes
  const servers = movie
    ? makeServers(movie.id, type, season, episode)
    : [];

  const activeServer = servers[serverIdx];

  const handleServerSwitch = useCallback((idx: number) => {
    setServerIdx(idx);
    setIframeError(false);
    setIframeKey((k) => k + 1);
  }, []);

  const handleNextServer = useCallback(() => {
    const next = (serverIdx + 1) % servers.length;
    handleServerSwitch(next);
  }, [serverIdx, servers.length, handleServerSwitch]);

  const handleEpisodeChange = useCallback((s: number, e: number) => {
    setSeason(s);
    setEpisode(e);
    setIframeError(false);
    setIframeKey((k) => k + 1);
  }, []);

  if (error) return <NotFound />;
  if (loading || !movie) {
    return (
      <div className="pt-20 bg-xf-bg min-h-screen">
        <LoadingSkeleton variant="hero" />
      </div>
    );
  }

  // Estimate total seasons for TV (TMDB detail returns number_of_seasons when fetched with full details)
  const totalSeasons = (movie as any).number_of_seasons ?? 3;
  const episodesPerSeason = 12; // reasonable default when we don't have episode list

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-xf-bg"
    >
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 lg:px-8 pt-20 pb-16">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <button
            onClick={() => navigate(`/${movie.type}/${movie.id}`)}
            className="flex items-center gap-2 text-xf-muted hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Details</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="flex items-center gap-2">
            {type === 'tv' && (
              <div className="flex items-center gap-1.5 text-xf-muted text-sm">
                <Tv2 size={14} />
                <span>S{season} E{episode}</span>
              </div>
            )}
            <button
              onClick={() => navigate(`/${movie.type}/${movie.id}`)}
              className="flex items-center gap-1.5 text-xf-muted hover:text-white transition-colors text-sm"
              aria-label="More info"
            >
              <Info size={16} />
              <span className="hidden sm:inline">More Info</span>
            </button>
          </div>
        </div>

        {/* ── Title ──────────────────────────────────────────────────────────── */}
        <div className="mb-4">
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white leading-tight">
            {movie.title}
            {type === 'tv' && (
              <span className="ml-2 text-xf-muted font-normal text-lg">
                S{season}:E{episode}
              </span>
            )}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-xf-muted flex-wrap">
            {movie.year > 0 && <span>{movie.year}</span>}
            {movie.year > 0 && <span>·</span>}
            <span>{type === 'tv' ? 'TV Series' : 'Movie'}</span>
            {movie.ageRating && <><span>·</span><span>{movie.ageRating}</span></>}
          </div>
        </div>

        {/* ── Embed Player ───────────────────────────────────────────────────── */}
        <div className="mb-5 rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl shadow-black/50">
          {iframeError ? (
            <div className="aspect-video flex flex-col items-center justify-center gap-4 bg-xf-card">
              <AlertCircle size={36} className="text-xf-red" />
              <p className="text-white font-medium text-center px-4">
                This server couldn't load. Try switching servers below.
              </p>
              <button
                onClick={handleNextServer}
                className="flex items-center gap-2 px-5 py-2.5 bg-xf-red hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <RefreshCw size={15} />
                Try Next Server
              </button>
            </div>
          ) : (
            <iframe
              key={iframeKey}
              src={activeServer?.sourceUrl}
              title={`${movie.title} — ${activeServer?.name}`}
              className="w-full aspect-video"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="origin"
              onError={() => setIframeError(true)}
            />
          )}
        </div>

        {/* ── Server Switcher ─────────────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-xf-subtle text-xs font-semibold uppercase tracking-wider mb-2">
            Servers
          </p>
          <div className="flex flex-wrap gap-2">
            {servers.map((server, i) => (
              <button
                key={server.name}
                onClick={() => handleServerSwitch(i)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border
                  ${i === serverIdx
                    ? 'bg-xf-red border-xf-red text-white shadow-lg shadow-xf-red/20'
                    : 'bg-xf-card border-white/10 text-xf-muted hover:text-white hover:border-white/30'
                  }`}
                aria-pressed={i === serverIdx}
                aria-label={`${server.name}${i === serverIdx ? ' (active)' : ''}`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    server.status === 'online' ? 'bg-green-400' : 'bg-red-500'
                  }`}
                />
                {server.name}
                {i === serverIdx && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="text-xf-subtle text-xs mt-2">
            If video doesn't load, switch to another server. Both servers stream the same content.
          </p>
        </div>

        {/* ── TV Season/Episode Picker ───────────────────────────────────────── */}
        {type === 'tv' && (
          <div className="mb-8">
            <p className="text-xf-subtle text-xs font-semibold uppercase tracking-wider mb-3">
              Episodes
            </p>

            {/* Season selector */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xf-muted text-sm">Season:</span>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleEpisodeChange(s, 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 border
                      ${s === season
                        ? 'bg-white text-black border-white'
                        : 'bg-xf-card text-xf-muted border-white/10 hover:border-white/30 hover:text-white'
                      }`}
                    aria-pressed={s === season}
                    aria-label={`Season ${s}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Episode selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xf-muted text-sm">Episode:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => episode > 1 && handleEpisodeChange(season, episode - 1)}
                  disabled={episode <= 1}
                  className="w-9 h-9 rounded-lg bg-xf-card border border-white/10 text-white flex items-center justify-center disabled:opacity-30 hover:border-white/30 transition-colors"
                  aria-label="Previous episode"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: Math.min(episodesPerSeason, 24) }, (_, i) => i + 1).map((e) => (
                    <button
                      key={e}
                      onClick={() => handleEpisodeChange(season, e)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 border
                        ${e === episode
                          ? 'bg-white text-black border-white'
                          : 'bg-xf-card text-xf-muted border-white/10 hover:border-white/30 hover:text-white'
                        }`}
                      aria-pressed={e === episode}
                      aria-label={`Episode ${e}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => episode < episodesPerSeason && handleEpisodeChange(season, episode + 1)}
                  disabled={episode >= episodesPerSeason}
                  className="w-9 h-9 rounded-lg bg-xf-card border border-white/10 text-white flex items-center justify-center disabled:opacity-30 hover:border-white/30 transition-colors"
                  aria-label="Next episode"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Description ────────────────────────────────────────────────────── */}
        <p className="text-xf-muted text-sm leading-relaxed max-w-3xl">
          {movie.description}
        </p>
      </div>
    </motion.div>
  );
}
