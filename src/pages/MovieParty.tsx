import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, LogIn, Copy, ExternalLink, Check,
  Crown, Loader2, AlertCircle, RefreshCw, X,
} from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
import { useAuthStore } from '@/store/useAuthStore';
import MoviePickerStep from '@/components/watchparty/MoviePickerStep';
import RoomConfigStep from '@/components/watchparty/RoomConfigStep';
import type { Movie } from '@/types/movie';

type View = 'loading' | 'no-room' | 'active-room' | 'create-pick' | 'create-config' | 'join';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const SESSION_PREFIX = 'xf-room-';

function findActiveSession() {
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(SESSION_PREFIX)) {
      try {
        const s = JSON.parse(sessionStorage.getItem(key)!);
        if (s?.roomId) return s;
      } catch { /* ignore */ }
    }
  }
  return null;
}

function extractRoomCode(input: string): string {
  const trimmed = input.trim();
  // Match 8-char alphanumeric suffix of a URL or raw code
  const match = trimmed.match(/([A-Z0-9]{8})$/i);
  return match ? match[1].toUpperCase() : trimmed.toUpperCase();
}

// ─── Rejoin Card ─────────────────────────────────────────────────────────────
function RejoinCard({
  session,
  participants,
  room,
  onRejoin,
  onLeave,
}: {
  session: any;
  participants: any[];
  room: any | null;
  onRejoin: () => void;
  onLeave: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/watch-party/${session.roomId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="rounded-2xl border border-xf-red/30 bg-xf-card/60 backdrop-blur-md overflow-hidden shadow-xl shadow-black/40">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-xf-red/5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-xf-red animate-pulse" />
            <span className="text-xf-red font-bold text-xs uppercase tracking-widest">Active Room</span>
          </div>
          {session.hostToken && (
            <div className="flex items-center gap-1 text-yellow-400">
              <Crown size={11} />
              <span className="text-[10px] font-bold">Host</span>
            </div>
          )}
        </div>

        <div className="p-5">
          {/* Movie info */}
          {room ? (
            <div className="flex items-center gap-3 mb-4">
              {room.moviePoster && (
                <img
                  src={`https://image.tmdb.org/t/p/w154${room.moviePoster}`}
                  alt={room.movieTitle ?? ''}
                  className="w-12 h-[72px] object-cover rounded-lg border border-white/10 flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="text-white font-bold text-sm leading-tight truncate">
                  {room.roomName || room.movieTitle}
                </p>
                {room.roomName && (
                  <p className="text-xf-subtle text-[11px] truncate mt-0.5">{room.movieTitle}</p>
                )}
                <p className="text-xf-subtle text-xs mt-1 flex items-center gap-1">
                  <Users size={10} />
                  {participants.length} participant{participants.length !== 1 ? 's' : ''}
                  {room.participantLimit > 0 && ` / ${room.participantLimit}`}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-12 flex items-center mb-4">
              <Loader2 size={16} className="animate-spin text-xf-muted mr-2" />
              <span className="text-xf-muted text-sm">Loading room info…</span>
            </div>
          )}

          {/* Room code */}
          <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-4 py-3 mb-4">
            <span className="font-mono text-base font-bold tracking-[0.2em] text-white flex-1">
              {session.roomId}
            </span>
            <button onClick={handleCopy} className="text-xf-muted hover:text-white transition-colors">
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
          </div>

          {/* Actions */}
          <button
            onClick={onRejoin}
            className="w-full flex items-center justify-center gap-2 py-3 bg-xf-red hover:bg-xf-red-hover text-white font-bold rounded-xl transition-colors mb-2"
            id="rejoin-btn"
          >
            <ExternalLink size={16} />
            Rejoin Room
          </button>
          <button
            onClick={onLeave}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xf-muted hover:text-white font-semibold text-sm rounded-xl transition-colors border border-white/10 hover:border-white/30"
          >
            {session.hostToken ? 'End Room' : 'Leave Room'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Join Form ────────────────────────────────────────────────────────────────
function JoinForm({ onCancel }: { onCancel: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { joinRoom } = useRoomStore();
  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = extractRoomCode(code);
    if (clean.length !== 8) {
      setError('Please enter a valid 8-character room code.');
      return;
    }
    setLoading(true);
    setError('');
    const displayName = user?.user_metadata?.display_name || '';
    const res = await joinRoom(clean, displayName);
    if ('ok' in res) {
      navigate(`/watch-party/${clean}`);
    } else {
      setError(res.error);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onCancel} className="p-1.5 rounded-lg text-xf-muted hover:text-white hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
        <h2 className="text-lg font-bold text-white">Join a Room</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-xf-subtle uppercase tracking-wider mb-2">
            Room Code or Link
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(''); }}
            placeholder="e.g. A7KR3Q9B or paste a room link"
            className="w-full bg-xf-card border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-xf-subtle focus:outline-none focus:border-xf-red/50 transition-colors"
            id="join-code-input"
            autoFocus
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2.5 p-3 bg-red-950/40 border border-red-800/50 rounded-xl"
            >
              <AlertCircle size={15} className="text-xf-red flex-shrink-0 mt-0.5" />
              <p className="text-xf-red text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-gray-100 text-black font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Join Room'}
        </button>
      </form>
    </motion.div>
  );
}

// ─── Choice Screen ────────────────────────────────────────────────────────────
function ChoiceScreen({
  onCreate,
  onJoin,
}: {
  onCreate: () => void;
  onJoin: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-sm mx-auto space-y-4"
    >
      <button
        onClick={onCreate}
        id="mp-create-btn"
        className="w-full flex items-center gap-4 p-5 bg-xf-card border border-white/10 hover:border-xf-red/40 rounded-2xl transition-all group hover:bg-xf-card/80"
      >
        <div className="w-10 h-10 rounded-xl bg-xf-red/10 flex items-center justify-center flex-shrink-0 group-hover:bg-xf-red/20 transition-colors">
          <Plus size={20} className="text-xf-red" />
        </div>
        <div className="text-left">
          <p className="text-white font-bold text-sm">Create a Room</p>
          <p className="text-xf-subtle text-xs mt-0.5">Pick a movie and invite friends</p>
        </div>
      </button>

      <button
        onClick={onJoin}
        id="mp-join-btn"
        className="w-full flex items-center gap-4 p-5 bg-xf-card border border-white/10 hover:border-white/30 rounded-2xl transition-all group hover:bg-xf-card/80"
      >
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
          <LogIn size={20} className="text-xf-muted group-hover:text-white transition-colors" />
        </div>
        <div className="text-left">
          <p className="text-white font-bold text-sm">Join a Room</p>
          <p className="text-xf-subtle text-xs mt-0.5">Enter a room code or paste a link</p>
        </div>
      </button>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MovieParty() {
  const navigate = useNavigate();
  const location = useLocation();

  const { createRoom, leaveRoom, rejoinRoom, room, participants, session } = useRoomStore();
  const { user } = useAuthStore();

  const [view, setView] = useState<View>('loading');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // State passed from MovieDetails "Watch With Friends" button
  const createFor = (location.state as any)?.createFor as {
    movieId: string; movieType: 'movie' | 'tv'; movieTitle: string; moviePoster: string;
  } | undefined;

  useEffect(() => {
    const stored = findActiveSession();
    if (stored) {
      setActiveSession(stored);
      rejoinRoom(stored.roomId).catch(() => {});
      setView('active-room');
    } else if (createFor) {
      // Came from MovieDetails — skip picker, pre-fill movie
      setSelectedMovie({
        id: createFor.movieId,
        type: createFor.movieType,
        title: createFor.movieTitle,
        poster: createFor.moviePoster,
      } as Movie);
      setView('create-config');
    } else {
      setView('no-room');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateConfirm = async (roomName: string, participantLimit: number) => {
    if (!selectedMovie) return;
    setCreateLoading(true);
    setCreateError('');
    const displayName = user?.user_metadata?.display_name || 'Host';
    const res = await createRoom(
      selectedMovie.id,
      selectedMovie.type as 'movie' | 'tv',
      selectedMovie.title,
      selectedMovie.poster ?? '',
      displayName,
      roomName,
      participantLimit
    );
    if ('roomId' in res) {
      navigate(`/watch-party/${res.roomId}`);
    } else {
      setCreateError(res.error);
      setCreateLoading(false);
    }
  };

  const handleLeave = async () => {
    await leaveRoom();
    setActiveSession(null);
    setView('no-room');
  };

  const handleRejoin = () => {
    if (activeSession?.roomId) navigate(`/watch-party/${activeSession.roomId}`);
  };

  // Whether to show full-page (movie picker needs more space)
  const isFullPage = view === 'create-pick';

  return (
    <div className="min-h-screen bg-xf-bg">
      {/* Page header */}
      {!isFullPage && (
        <div className="pt-20 pb-4 px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users size={20} className="text-xf-red" />
            <h1 className="text-2xl font-display font-black text-white">Movie Party</h1>
          </div>
          <p className="text-xf-subtle text-sm">Watch movies together with friends — anywhere</p>
        </div>
      )}

      <div className={`px-4 ${isFullPage ? 'pt-20 pb-8 h-screen flex flex-col' : 'py-8 max-w-lg mx-auto'}`}>
        {/* Error banner for createRoom */}
        <AnimatePresence>
          {createError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2.5 p-3 mb-4 bg-red-950/40 border border-red-800/50 rounded-xl"
            >
              <AlertCircle size={15} className="text-xf-red flex-shrink-0" />
              <p className="text-xf-red text-sm">{createError}</p>
              <button onClick={() => setCreateError('')} className="ml-auto text-xf-subtle hover:text-white">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* Loading */}
          {view === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-xf-red mb-3" />
              <p className="text-xf-muted text-sm">Checking your rooms…</p>
            </motion.div>
          )}

          {/* No active room → choice screen */}
          {view === 'no-room' && (
            <motion.div key="no-room" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ChoiceScreen
                onCreate={() => setView('create-pick')}
                onJoin={() => setView('join')}
              />
            </motion.div>
          )}

          {/* Active room rejoin */}
          {view === 'active-room' && activeSession && (
            <motion.div key="active-room" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RejoinCard
                session={activeSession}
                participants={participants}
                room={room}
                onRejoin={handleRejoin}
                onLeave={handleLeave}
              />

              <div className="mt-6 text-center">
                <button
                  onClick={() => { setActiveSession(null); setView('no-room'); }}
                  className="flex items-center gap-1.5 mx-auto text-xf-subtle hover:text-white text-xs font-semibold transition-colors"
                >
                  <RefreshCw size={12} />
                  Start a new room instead
                </button>
              </div>
            </motion.div>
          )}

          {/* Create → step 1: pick movie */}
          {view === 'create-pick' && (
            <motion.div key="create-pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col flex-1 h-full pt-4">
              <MoviePickerStep
                onBack={() => setView('no-room')}
                onSelect={(movie) => {
                  setSelectedMovie(movie);
                  setView('create-config');
                }}
              />
            </motion.div>
          )}

          {/* Create → step 2: configure */}
          {view === 'create-config' && selectedMovie && (
            <motion.div key="create-config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RoomConfigStep
                movie={selectedMovie}
                onBack={() => createFor ? navigate(-1) : setView('create-pick')}
                onConfirm={handleCreateConfirm}
                loading={createLoading}
              />
            </motion.div>
          )}

          {/* Join flow */}
          {view === 'join' && (
            <motion.div key="join" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <JoinForm onCancel={() => setView('no-room')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
