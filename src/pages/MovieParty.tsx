import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, LogIn, Copy, ExternalLink, Check,
  Crown, Loader2, AlertCircle, RefreshCw, X, Play,
  Clock, Tv2, Film, Radio
} from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import MoviePickerStep from '@/components/watchparty/MoviePickerStep';
import RoomConfigStep from '@/components/watchparty/RoomConfigStep';
import JoinRoomModal from '@/components/watchparty/JoinRoomModal';
import type { Movie } from '@/types/movie';

type View = 'lobby' | 'create-pick' | 'create-config';

export interface PublicParty {
  id: string;
  movieId: string;
  movieType: 'movie' | 'tv';
  movieTitle: string;
  moviePoster: string;
  backdrop: string;
  hostName: string;
  participantCount: number;
  timeLeft: string;
  season?: number;
  episode?: number;
  status: 'lobby' | 'watching';
}

const SESSION_PREFIX = 'xf-room-';

function findActiveSession() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(SESSION_PREFIX)) {
      try {
        const s = JSON.parse(localStorage.getItem(key)!);
        if (s?.roomId) return s;
      } catch { /* ignore */ }
    }
  }
  return null;
}

export default function MovieParty() {
  const navigate = useNavigate();
  const location = useLocation();

  const { createRoom, joinRoom, leaveRoom, rejoinRoom, room, participants } = useRoomStore();
  const { user } = useAuthStore();

  const [view, setView] = useState<View>('lobby');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [publicParties, setPublicParties] = useState<PublicParty[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // State passed from MovieDetails "Watch With Friends" button
  const createFor = (location.state as any)?.createFor as {
    movieId: string; movieType: 'movie' | 'tv'; movieTitle: string; moviePoster: string;
  } | undefined;

  // Load real active rooms from Supabase
  const loadPublicRooms = useCallback(async () => {
    setRefreshing(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: dbRooms } = await supabase
          .from('rooms')
          .select('*, participants(id, display_name, is_host)')
          .neq('status', 'ended')
          .order('created_at', { ascending: false })
          .limit(20);

        if (dbRooms && dbRooms.length > 0) {
          const mapped: PublicParty[] = dbRooms.map((r: any) => {
            const host = r.participants?.find((p: any) => p.is_host)?.display_name || 'Host';
            const count = r.participants?.length || 1;
            return {
              id: r.id,
              movieId: r.movie_id,
              movieType: r.movie_type as 'movie' | 'tv',
              movieTitle: r.room_name || r.movie_title || 'Watch Party',
              moviePoster: r.movie_poster
                ? (r.movie_poster.startsWith('http') ? r.movie_poster : `https://image.tmdb.org/t/p/w300${r.movie_poster}`)
                : '',
              backdrop: r.movie_poster
                ? (r.movie_poster.startsWith('http') ? r.movie_poster : `https://image.tmdb.org/t/p/w780${r.movie_poster}`)
                : '',
              hostName: host,
              participantCount: count,
              timeLeft: r.status === 'watching' ? 'Live Now' : 'In Lobby',
              status: r.status,
            };
          });

          setPublicParties(mapped);
          setRefreshing(false);
          return;
        }
      }
    } catch {
      // Ignore network errors
    }
    setPublicParties([]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadPublicRooms();

    // Subscribe to realtime room updates
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('public-rooms-live-feed')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'rooms' },
          () => {
            loadPublicRooms();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [loadPublicRooms]);

  useEffect(() => {
    const stored = findActiveSession();
    if (stored) {
      setActiveSession(stored);
      rejoinRoom(stored.roomId).catch(() => {});
    } else if (createFor) {
      setSelectedMovie({
        id: createFor.movieId,
        type: createFor.movieType,
        title: createFor.movieTitle,
        poster: createFor.moviePoster,
      } as Movie);
      setView('create-config');
    }
  }, [createFor, rejoinRoom]);

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
  };

  const handlePartyCardClick = async (party: PublicParty) => {
    const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Guest';
    await joinRoom(party.id, displayName);
    navigate(`/watch-party/${party.id}`);
  };

  const isFullPage = view === 'create-pick';

  return (
    <div className="min-h-screen bg-xf-bg text-white pb-24">
      {/* ── Top Header / Hero ── */}
      {!isFullPage && (
        <div className="pt-20 sm:pt-24 pb-6 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-white/10 pb-8">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1.5 rounded-lg bg-xf-red/10 text-xf-red">
                  <Users size={20} />
                </span>
                <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
                  Movie Party
                </h1>
              </div>
              <p className="text-xf-subtle text-xs sm:text-sm">
                Watch movies and shows in sync with friends — anywhere in the world
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setView('create-pick')}
                className="flex items-center gap-2 px-5 py-2.5 bg-xf-red hover:bg-xf-red-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-xf-red/20 text-sm active:scale-95"
                id="header-create-room-btn"
              >
                <Plus size={18} />
                Create a Room
              </button>

              <button
                onClick={() => setJoinModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold rounded-xl transition-colors text-sm"
                id="header-join-room-btn"
              >
                <LogIn size={16} className="text-xf-muted" />
                Join with Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Body Container ── */}
      <div className={`px-4 sm:px-8 max-w-7xl mx-auto ${isFullPage ? 'pt-20 h-screen flex flex-col' : ''}`}>
        
        {/* Error Alert */}
        <AnimatePresence>
          {createError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2.5 p-4 mb-6 bg-red-950/40 border border-red-800/50 rounded-2xl"
            >
              <AlertCircle size={18} className="text-xf-red flex-shrink-0" />
              <p className="text-xf-red text-sm font-medium flex-1">{createError}</p>
              <button onClick={() => setCreateError('')} className="text-xf-subtle hover:text-white p-1">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Active Rejoin Banner (if user is currently in a room) ── */}
        {activeSession && view === 'lobby' && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl border border-xf-red/40 bg-xf-card/80 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-xf-red/10 border border-xf-red/30 flex items-center justify-center flex-shrink-0">
                <Radio size={20} className="text-xf-red animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-xf-red uppercase tracking-wider">You Have an Active Room</span>
                  {activeSession.hostToken && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-yellow-400/20 text-yellow-400 rounded">Host</span>
                  )}
                </div>
                <p className="text-white font-bold text-sm truncate mt-0.5">
                  Room Code: <span className="font-mono text-emerald-400 font-black tracking-widest">{activeSession.roomId}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => navigate(`/watch-party/${activeSession.roomId}`)}
                className="px-5 py-2 bg-xf-red hover:bg-xf-red-hover text-white font-bold text-sm rounded-xl transition-colors shadow-md"
              >
                Rejoin Room
              </button>
              <button
                onClick={handleLeave}
                className="px-3.5 py-2 text-xf-muted hover:text-white font-medium text-xs rounded-xl border border-white/10 hover:border-white/20 transition-colors"
              >
                Leave
              </button>
            </div>
          </div>
        )}

        {/* ── View Switcher ── */}
        <AnimatePresence mode="wait">
          {/* 1. LOBBY / PUBLIC WATCH PARTIES GRID */}
          {view === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] flex-shrink-0">
                    <Users size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-white leading-tight">
                      Public watch parties
                    </h2>
                    <p className="text-xf-subtle text-xs sm:text-sm">
                      Jump into a party someone else already started
                    </p>
                  </div>
                </div>

                <button
                  onClick={loadPublicRooms}
                  disabled={refreshing}
                  className="p-2 text-xf-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  title="Refresh live rooms"
                >
                  <RefreshCw size={16} className={refreshing ? 'animate-spin text-emerald-400' : ''} />
                </button>
              </div>

              {/* Grid of Public Parties or Empty State */}
              {publicParties.length === 0 ? (
                <div className="py-16 px-6 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] max-w-xl mx-auto flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-xf-red/10 border border-xf-red/25 flex items-center justify-center text-xf-red mb-4 shadow-lg shadow-xf-red/10">
                    <Radio size={28} className="animate-pulse" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                    No Live Watch Parties Right Now
                  </h3>
                  <p className="text-xf-subtle text-xs sm:text-sm mb-6 max-w-md leading-relaxed">
                    There are no open rooms at the moment. Create a room for any movie or TV show and invite your friends to watch together!
                  </p>
                  <button
                    onClick={() => setView('create-pick')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-xf-red hover:bg-xf-red-hover text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-xf-red/25 active:scale-95"
                  >
                    <Plus size={18} />
                    Start a Watch Party
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {publicParties.map((party) => (
                    <motion.div
                      key={party.id}
                      onClick={() => handlePartyCardClick(party)}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="group relative bg-[#13161a] hover:bg-[#181d22] border border-white/10 hover:border-emerald-500/40 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-emerald-950/20 transition-all duration-300 flex flex-col"
                    >
                      {/* Top Image Banner */}
                      <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-black/60">
                        {party.backdrop ? (
                          <img
                            src={party.backdrop}
                            alt={party.movieTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-75 group-hover:opacity-90"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-xf-card flex items-center justify-center">
                            <Film size={28} className="text-white/20" />
                          </div>
                        )}

                        {/* Backdrop Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#13161a] via-black/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

                        {/* Floating Poster on left */}
                        <div className="absolute left-3.5 top-3 z-10">
                          {party.moviePoster ? (
                            <img
                              src={party.moviePoster}
                              alt={party.movieTitle}
                              className="w-13 h-20 sm:w-14 sm:h-22 rounded-lg object-cover shadow-2xl border border-white/20"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-13 h-20 rounded-lg bg-black/80 border border-white/10 flex items-center justify-center">
                              <Film size={18} className="text-white/40" />
                            </div>
                          )}
                        </div>

                        {/* Title on banner */}
                        <div className="absolute left-20 sm:left-22 top-3 right-16 z-10">
                          <h3 className="text-white font-bold text-sm sm:text-base leading-snug line-clamp-2 drop-shadow-md">
                            {party.movieTitle}
                          </h3>
                        </div>

                        {/* Participant Count Pill */}
                        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-xs text-white/95 font-semibold shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                          <Users size={12} className="text-white/70" />
                          <span>{party.participantCount}</span>
                        </div>

                        {/* Play Action Hover Button */}
                        <div className="absolute right-3.5 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-xl">
                          <Play size={14} fill="black" className="ml-0.5" />
                        </div>
                      </div>

                      {/* Bottom Metadata */}
                      <div className="p-4 pt-2.5 flex-1 flex flex-col justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-xs text-xf-muted">
                            Hosted by <span className="font-semibold text-white/90">{party.hostName}</span>
                          </p>
                          <p className="text-xs text-xf-subtle flex items-center gap-1">
                            {party.season && (
                              <span className="font-semibold text-white/80">
                                S{party.season} · E{party.episode} ·{' '}
                              </span>
                            )}
                            <Clock size={11} className="inline text-xf-subtle" />
                            <span>{party.timeLeft}</span>
                          </p>
                        </div>

                        {/* Room Code */}
                        <div className="flex items-center justify-between border-t border-white/5 pt-2.5 mt-1">
                          <span className="text-xs font-mono font-bold tracking-[0.2em] text-emerald-400 group-hover:text-emerald-300 transition-colors uppercase">
                            {party.id}
                          </span>
                          <span className="text-[11px] font-semibold text-xf-muted group-hover:text-white transition-colors flex items-center gap-1">
                            Join Party →
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* 2. CREATE ROOM: STEP 1 - PICK MOVIE */}
          {view === 'create-pick' && (
            <motion.div
              key="create-pick"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col flex-1 h-full"
            >
              <MoviePickerStep
                onBack={() => setView('lobby')}
                onSelect={(movie) => {
                  setSelectedMovie(movie);
                  setView('create-config');
                }}
              />
            </motion.div>
          )}

          {/* 3. CREATE ROOM: STEP 2 - CONFIGURE */}
          {view === 'create-config' && selectedMovie && (
            <motion.div
              key="create-config"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-lg mx-auto w-full py-6"
            >
              <RoomConfigStep
                movie={selectedMovie}
                onBack={() => (createFor ? navigate(-1) : setView('create-pick'))}
                onConfirm={handleCreateConfirm}
                loading={createLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Join with Code Modal ── */}
      {joinModalOpen && (
        <JoinRoomModal onClose={() => setJoinModalOpen(false)} />
      )}
    </div>
  );
}
