import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, Tv2, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { getMovieDetails, getTVSeason } from '@/services/tmdb';
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
  const { saveProgress, getProgress } = useAppStore();

  // TV-specific state
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [serverIdx, setServerIdx] = useState(0);
  const [iframeKey, setIframeKey] = useState(0); // force iframe reload on server/ep change
  const [iframeError, setIframeError] = useState(false);
  const [autoSwitch, setAutoSwitch] = useState(true);
  const [autoSwitchNotice, setAutoSwitchNotice] = useState<string | null>(null);
  const triedServersRef = useRef<Set<number>>(new Set([0]));
  const [seasonEpisodes, setSeasonEpisodes] = useState<any[]>([]);

  const { data: movie, loading, error } = useTMDB(() => {
    if (!id) return Promise.reject(new Error('No ID'));
    return getMovieDetails(id, type);
  }, [id, type]);

  // Fetch actual season episodes when TV show ID or season changes
  useEffect(() => {
    if (type !== 'tv' || !movie?.id) return;
    let isMounted = true;
    getTVSeason(movie.id, season)
      .then((eps) => {
        if (isMounted) {
          setSeasonEpisodes(eps);
        }
      })
      .catch(() => {
        if (isMounted) setSeasonEpisodes([]);
      });
    return () => {
      isMounted = false;
    };
  }, [type, movie?.id, season]);

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
        genres: movie.genres,
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [movie, saveProgress, getProgress]);

  // Rebuild servers when movie ID or season/episode changes
  const servers = movie
    ? makeServers(movie.id, type, season, episode)
    : [];

  const activeServer = servers[serverIdx];

  const triggerAutoSwitch = useCallback((reason?: string) => {
    if (!servers.length) return;

    if (!autoSwitch) {
      setIframeError(true);
      return;
    }

    const nextIdx = (serverIdx + 1) % servers.length;

    // If all servers have been tried, stop auto-switching and present error state
    if (triedServersRef.current.size >= servers.length) {
      setAutoSwitchNotice(null);
      setIframeError(true);
      return;
    }

    triedServersRef.current.add(nextIdx);
    const currentName = servers[serverIdx]?.name || `Server ${serverIdx + 1}`;
    const nextName = servers[nextIdx]?.name || `Server ${nextIdx + 1}`;

    setAutoSwitchNotice(`${currentName} unavailable. Auto-switching to ${nextName}...`);
    setServerIdx(nextIdx);
    setIframeError(false);
    setIframeKey((k) => k + 1);
  }, [autoSwitch, serverIdx, servers]);

  const handleServerSwitch = useCallback((idx: number) => {
    setServerIdx(idx);
    triedServersRef.current = new Set([idx]);
    setAutoSwitchNotice(null);
    setIframeError(false);
    setIframeKey((k) => k + 1);
  }, []);

  const handleNextServer = useCallback(() => {
    if (triedServersRef.current.size >= servers.length) {
      triedServersRef.current = new Set([0]);
    }
    triggerAutoSwitch('Manual next server');
  }, [servers.length, triggerAutoSwitch]);

  const handleSeasonChange = useCallback((s: number) => {
    setSeason(s);
    setEpisode(1);
    setServerIdx(0);
    triedServersRef.current = new Set([0]);
    setAutoSwitchNotice(null);
    setIframeError(false);
    setIframeKey((k) => k + 1);
  }, []);

  const handleEpisodeChange = useCallback((s: number, e: number) => {
    setSeason(s);
    setEpisode(e);
    setServerIdx(0);
    triedServersRef.current = new Set([0]);
    setAutoSwitchNotice(null);
    setIframeError(false);
    setIframeKey((k) => k + 1);
  }, []);

  // Dismiss auto switch notice after 4.5 seconds
  useEffect(() => {
    if (!autoSwitchNotice) return;
    const timer = setTimeout(() => {
      setAutoSwitchNotice(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [autoSwitchNotice]);

  // Listen for iframe postMessage error events from embed providers
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (
          data?.event === 'error' ||
          data?.type === 'error' ||
          data?.status === 'error' ||
          data?.event === 'not_found' ||
          data?.event === 'media_error' ||
          data?.error === true ||
          (typeof data === 'string' && (data.toLowerCase().includes('not found') || data.toLowerCase().includes('media error')))
        ) {
          triggerAutoSwitch('Player error reported');
        }
      } catch {
        // Ignore unparseable messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [triggerAutoSwitch]);

  if (error) return <NotFound />;
  if (loading || !movie) {
    return (
      <div className="pt-6 bg-xf-bg min-h-screen">
        <LoadingSkeleton variant="hero" />
      </div>
    );
  }

  // Real season and episode counts from TMDB
  const seasons = movie.seasons || [];
  const totalSeasons = seasons.length > 0 ? seasons.length : (movie.numberOfSeasons ?? 1);
  const currentSeasonObj = seasons.find((s) => s.seasonNumber === season);
  const episodeCount = seasonEpisodes.length > 0 
    ? seasonEpisodes.length 
    : (currentSeasonObj?.episodeCount ?? 8);

  const currentEpDetail = seasonEpisodes.find((ep) => ep.episodeNumber === episode);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-xf-bg"
    >
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-16">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xf-muted hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Home</span>
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
            <span>{type === 'tv' ? `${totalSeasons} Season${totalSeasons > 1 ? 's' : ''}` : 'Movie'}</span>
            {movie.ageRating && <><span>·</span><span>{movie.ageRating}</span></>}
          </div>
        </div>

        {/* ── Auto-Switch Notice Banner ─────────────────────────────────────── */}
        {autoSwitchNotice && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-3 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-medium shadow-lg backdrop-blur-sm"
          >
            <div className="flex items-center gap-2.5">
              <RefreshCw size={14} className="animate-spin text-amber-400 flex-shrink-0" />
              <span>{autoSwitchNotice}</span>
            </div>
            <button
              onClick={() => setAutoSwitchNotice(null)}
              className="text-amber-400/80 hover:text-white text-xs px-2 py-0.5 rounded bg-black/40 transition-colors"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* ── Embed Player ───────────────────────────────────────────────────── */}
        <div className="mb-5 rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl shadow-black/50">
          {iframeError ? (
            <div className="aspect-video flex flex-col items-center justify-center gap-4 bg-xf-card">
              <AlertCircle size={36} className="text-xf-red" />
              <p className="text-white font-medium text-center px-4 max-w-md">
                {triedServersRef.current.size >= servers.length
                  ? 'All servers were checked and could not load this video. Try again later or pick a server below.'
                  : `${activeServer?.name || 'This server'} couldn't load. Auto-switching to next server or choose below.`}
              </p>
              <button
                onClick={handleNextServer}
                className="flex items-center gap-2 px-5 py-2.5 bg-xf-red hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <RefreshCw size={15} />
                {triedServersRef.current.size >= servers.length ? 'Retry From Server 1' : 'Try Next Server'}
              </button>
            </div>
          ) : (
            <div className="relative w-full aspect-video">
              <iframe
                key={iframeKey}
                src={activeServer?.sourceUrl}
                title={`${movie.title} — ${activeServer?.name}`}
                className="w-full h-full aspect-video border-0"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; web-share"
                sandbox={activeServer?.sandbox ?? ((activeServer?.sourceUrl?.includes('vidlink.pro') || activeServer?.sourceUrl?.includes('autoembed.sbs') || activeServer?.sourceUrl?.includes('vidlove.cc')) ? undefined : "allow-scripts allow-same-origin allow-forms allow-presentation")}
                onError={() => triggerAutoSwitch('Iframe failed to load')}
              />
              {/* Shields over watermark links to block hover link URL status bar & tooltips */}
              <div
                className="absolute top-0 left-0 w-36 h-16 z-20 cursor-default bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              />
              {activeServer?.sourceUrl?.includes('fmov.my') && (
                <div
                  className="absolute bottom-1.5 sm:bottom-2 right-[225px] sm:right-[230px] w-20 sm:w-24 h-8 sm:h-9 z-20 cursor-default bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* ── Current Episode Info (TV) ── */}
        {type === 'tv' && currentEpDetail && (
          <div className="mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <p className="text-white font-semibold text-base">
              <span className="text-xf-red font-bold mr-2">S{season} E{episode}</span>
              {currentEpDetail.name}
            </p>
            {currentEpDetail.overview && (
              <p className="text-xf-muted text-xs sm:text-sm mt-1.5 leading-relaxed line-clamp-3">
                {currentEpDetail.overview}
              </p>
            )}
          </div>
        )}

        {/* ── Server Switcher ─────────────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
            <p className="text-xf-subtle text-xs font-semibold uppercase tracking-wider">
              Servers
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerAutoSwitch('Manual auto-switch')}
                className="flex items-center gap-1.5 text-xs text-xf-muted hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10 transition-colors"
                title="Automatically switch to the next server"
              >
                <RefreshCw size={12} />
                <span>Auto-Switch Next</span>
              </button>

              <button
                onClick={() => setAutoSwitch((prev) => !prev)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                  autoSwitch
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-xf-subtle'
                }`}
                title="Toggle automatic switching when a server doesn't respond"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    autoSwitch ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-gray-500'
                  }`}
                />
                <span>Auto-Switch: {autoSwitch ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>
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
        </div>

        {/* ── TV Season/Episode Picker ───────────────────────────────────────── */}
        {type === 'tv' && (
          <div className="mb-8">
            <p className="text-xf-subtle text-xs font-semibold uppercase tracking-wider mb-3">
              Episodes
            </p>

            {/* Season selector */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xf-muted text-sm font-medium">Season:</span>
              <div className="flex flex-wrap gap-1.5">
                {(seasons.length > 0
                  ? seasons
                  : Array.from({ length: totalSeasons }, (_, i) => ({
                      seasonNumber: i + 1,
                      name: `Season ${i + 1}`,
                      episodeCount: 8,
                    }))
                ).map((s) => (
                  <button
                    key={s.seasonNumber}
                    onClick={() => handleSeasonChange(s.seasonNumber)}
                    className={`px-3.5 h-9 rounded-lg text-sm font-semibold transition-all duration-200 border flex items-center justify-center
                      ${s.seasonNumber === season
                        ? 'bg-white text-black border-white shadow-md'
                        : 'bg-xf-card text-xf-muted border-white/10 hover:border-white/30 hover:text-white'
                      }`}
                    aria-pressed={s.seasonNumber === season}
                    aria-label={`Season ${s.seasonNumber}`}
                  >
                    {s.seasonNumber}
                  </button>
                ))}
              </div>
            </div>

            {/* Episode selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xf-muted text-sm font-medium">Episode:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => episode > 1 && handleEpisodeChange(season, episode - 1)}
                  disabled={episode <= 1}
                  className="w-9 h-9 rounded-lg bg-xf-card border border-white/10 text-white flex items-center justify-center disabled:opacity-30 hover:border-white/30 transition-colors"
                  aria-label="Previous episode"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-0.5">
                  {Array.from({ length: episodeCount }, (_, i) => i + 1).map((e) => {
                    const epDetail = seasonEpisodes.find((ep) => ep.episodeNumber === e);
                    return (
                      <button
                        key={e}
                        onClick={() => handleEpisodeChange(season, e)}
                        title={epDetail?.name ? `E${e}: ${epDetail.name}` : `Episode ${e}`}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 border flex items-center justify-center
                          ${e === episode
                            ? 'bg-white text-black border-white shadow-md'
                            : 'bg-xf-card text-xf-muted border-white/10 hover:border-white/30 hover:text-white'
                          }`}
                        aria-pressed={e === episode}
                        aria-label={`Episode ${e}`}
                      >
                        {e}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => episode < episodeCount && handleEpisodeChange(season, episode + 1)}
                  disabled={episode >= episodeCount}
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
