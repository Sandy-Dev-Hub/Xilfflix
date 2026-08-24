import { useState, useRef, useCallback, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title: string;
  startAt?: number;
  onProgress?: (played: number, playedSeconds: number, duration: number) => void;
  onError?: () => void;
}

export default function VideoPlayer({
  url,
  title,
  startAt = 0,
  onProgress,
  onError,
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [ready, setReady] = useState(false);

  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Seek to startAt once ready
  useEffect(() => {
    if (ready && startAt > 0) {
      playerRef.current?.seekTo(startAt, 'seconds');
    }
  }, [ready, startAt]);

  // Reset on URL change
  useEffect(() => {
    setError(false);
    setLoading(true);
    setPlayed(0);
    setReady(false);
  }, [url]);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  const handleProgress = useCallback(
    (state: { played: number; playedSeconds: number }) => {
      if (!seeking) {
        setPlayed(state.played);
        onProgress?.(state.played, state.playedSeconds, duration);
      }
    },
    [seeking, onProgress, duration]
  );

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value));
  };
  const handleSeekMouseDown = () => setSeeking(true);
  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    playerRef.current?.seekTo(parseFloat((e.target as HTMLInputElement).value));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setFullscreen(false));
    }
  };

  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="w-full aspect-video bg-xf-card rounded-2xl flex flex-col items-center justify-center gap-4 border border-white/10">
        <AlertTriangle size={40} className="text-xf-red" />
        <div className="text-center">
          <p className="text-white font-semibold">Playback Error</p>
          <p className="text-xf-muted text-sm mt-1">Unable to load this video source.</p>
        </div>
        <button
          onClick={() => { setError(false); setLoading(true); }}
          className="px-4 py-2 bg-xf-red text-white rounded-lg text-sm font-medium hover:bg-xf-red-hover transition-colors"
        >
          Try Again
        </button>
        {onError && (
          <button
            onClick={onError}
            className="text-xf-muted text-sm underline hover:text-white transition-colors"
          >
            Try another server
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group shadow-2xl shadow-black/50"
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={() => setPlaying((p) => !p)}
    >
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={playing}
        volume={volume}
        muted={muted}
        width="100%"
        height="100%"
        onReady={() => { setLoading(false); setReady(true); }}
        onBuffer={() => setLoading(true)}
        onBufferEnd={() => setLoading(false)}
        onProgress={handleProgress}
        onDuration={setDuration}
        onError={() => { setError(true); setLoading(false); }}
        progressInterval={1000}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload',
              disablePictureInPicture: false,
            },
          },
        }}
      />

      {/* Loading spinner */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50"
          >
            <Loader2 size={48} className="text-white animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col justify-end pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />

            {/* Title */}
            <div className="relative px-5 pb-1 pointer-events-auto">
              <p className="text-white font-semibold text-sm tracking-wide drop-shadow">{title}</p>
            </div>

            {/* Progress bar */}
            <div className="relative px-4 pb-2 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={played}
                onChange={handleSeekChange}
                onMouseDown={handleSeekMouseDown}
                onMouseUp={handleSeekMouseUp}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/20"
                style={{
                  background: `linear-gradient(to right, #E50914 ${played * 100}%, rgba(255,255,255,0.2) ${played * 100}%)`,
                }}
                aria-label="Seek"
              />
            </div>

            {/* Buttons row */}
            <div
              className="relative flex items-center gap-3 px-4 pb-4 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Play / Pause */}
              <button
                onClick={() => setPlaying((p) => !p)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMuted((m) => !m)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                  aria-label={muted ? 'Unmute' : 'Mute'}
                >
                  {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
                  className="w-20 h-1 rounded-full appearance-none cursor-pointer hidden sm:block"
                  style={{
                    background: `linear-gradient(to right, white ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(muted ? 0 : volume) * 100}%)`,
                  }}
                  aria-label="Volume"
                />
              </div>

              {/* Time */}
              <div className="text-white/80 text-xs font-mono ml-1">
                {formatTime(played * duration)} / {formatTime(duration)}
              </div>

              <div className="flex-1" />

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Big play icon when paused */}
      <AnimatePresence>
        {!playing && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Play size={28} fill="white" className="text-white ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
