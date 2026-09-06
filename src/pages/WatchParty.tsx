import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Users, MessageSquare, AlertCircle,
  RefreshCw, PanelRightClose, PanelRightOpen, Maximize
} from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
import { useAuthStore } from '@/store/useAuthStore';
import { makeServers } from '@/utils/servers';
import { useTMDB } from '@/hooks/useTMDB';
import { getMovieDetails, getTVSeason } from '@/services/tmdb';
import type { SeasonInfo } from '@/types/movie';

import RoomLobby from '@/components/watchparty/RoomLobby';
import WatchPartyPanel from '@/components/watchparty/WatchPartyPanel';
import CountdownOverlay from '@/components/watchparty/CountdownOverlay';
import SyncToastNotification from '@/components/watchparty/SyncToast';
import RoomEndedScreen from '@/components/watchparty/RoomEndedScreen';
import JoinRoomModal from '@/components/watchparty/JoinRoomModal';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function WatchParty() {
  const { roomCode } = useParams<{ roomCode?: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    room,
    participants,
    messages,
    session,
    isMuted,
    connecting,
    error,
    latestSignal,
    syncToast,
    joinRoom,
    rejoinRoom,
    leaveRoom,
    updateRoomStatus,
  } = useRoomStore();

  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [mobileSheet, setMobileSheet] = useState<'participants' | 'chat' | null>(null);
  
  // TV specific state
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [serverIdx, setServerIdx] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeError, setIframeError] = useState(false);

  // Fetch TV Show details for accurate seasons & episodes in WatchParty
  const { data: tvDetails } = useTMDB(() => {
    if (room?.movieType !== 'tv' || !room?.movieId) return Promise.resolve(null);
    return getMovieDetails(room.movieId, 'tv');
  }, [room?.movieId, room?.movieType]);

  const [tvEpisodes, setTvEpisodes] = useState<any[]>([]);
  useEffect(() => {
    if (room?.movieType !== 'tv' || !room?.movieId) return;
    getTVSeason(room.movieId, season)
      .then(setTvEpisodes)
      .catch(() => setTvEpisodes([]));
  }, [room?.movieId, room?.movieType, season]);

  // Prevent flash of JoinRoomModal on hard refresh
  const [isInitializing, setIsInitializing] = useState(true);

  // Auto-join or rejoin when visiting /watch-party/:roomCode
  useEffect(() => {
    if (!roomCode) {
      setIsInitializing(false);
      return;
    }

    if (session && session.roomId.toUpperCase() === roomCode.toUpperCase() && room) {
      setIsInitializing(false);
      return;
    }

    let isMounted = true;
    const doAutoJoin = async () => {
      try {
        const res = await rejoinRoom(roomCode);
        if ('error' in res) {
          const defaultName =
            user?.user_metadata?.display_name ||
            user?.email?.split('@')[0] ||
            `Guest ${Math.floor(1000 + Math.random() * 9000)}`;
          await joinRoom(roomCode, defaultName);
        }
      } catch (err) {
        console.error('Failed to auto join room:', err);
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };

    doAutoJoin();

    return () => {
      isMounted = false;
    };
  }, [roomCode, user]);

  // Sync TV season and episode from room metadata if available
  useEffect(() => {
    if (room?.season) setSeason(room.season);
    if (room?.episode) setEpisode(room.episode);
  }, [room?.season, room?.episode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't auto-leave, they might just be refreshing. We rely on session storage for persistence.
    };
  }, []);

  const handleLeave = async () => {
    await leaveRoom();
    navigate('/');
  };

  const handleStartParty = async () => {
    // Only host can do this, handled inside HostControls/RoomLobby
    await updateRoomStatus('watching');
  };

  const handleServerSwitch = useCallback((idx: number) => {
    setServerIdx(idx);
    setIframeError(false);
    setIframeKey((k) => k + 1);
  }, []);

  const handleEpisodeChange = useCallback((s: number, e: number) => {
    setSeason(s);
    setEpisode(e);
    setIframeError(false);
    setIframeKey((k) => k + 1);
  }, []);

  // ─── Render States ───────────────────────────────────────────────────────────

  // 1. Standalone /watch-party (no code in URL) → Show Join/Create Modal
  if (!roomCode) {
    return (
      <div className="min-h-screen bg-xf-bg">
        <JoinRoomModal onClose={() => navigate(-1)} />
      </div>
    );
  }

  // 2. Connecting or fetching room
  if (connecting || isInitializing) {
    return (
      <div className="min-h-screen bg-xf-bg pt-20">
        <LoadingSkeleton variant="hero" />
      </div>
    );
  }

  // 3. Not a participant — show Join form pre-filled with this room's code
  if (!session && !room) {
    return (
      <div className="min-h-screen bg-xf-bg">
        <JoinRoomModal onClose={() => navigate('/')} initialCode={roomCode} />
      </div>
    );
  }

  // 4. Room exists but we don't have data yet
  if (!room || !session) return null;

  const isHost = session.hostToken !== undefined;
  const myParticipantId = session.participantId;
  const unreadChat = 0; // We'll manage this locally or pass it from ChatPanel state in a real app

  // 5. Room Ended
  if (room.status === 'ended') {
    return <RoomEndedScreen room={room} participantCount={participants.length} />;
  }

  // 6. Lobby
  if (room.status === 'lobby') {
    return (
      <RoomLobby
        room={room}
        participants={participants}
        myParticipantId={myParticipantId}
        isHost={isHost}
        onStart={handleStartParty}
        onLeave={handleLeave}
      />
    );
  }

  // 7. Watching (Main interface)
  const servers = makeServers(room.movieId, room.movieType, season, episode);
  const activeServer = servers[serverIdx];
  const tvSeasons: SeasonInfo[] = tvDetails?.seasons || [];
  const totalSeasons = tvSeasons.length > 0 ? tvSeasons.length : (tvDetails?.numberOfSeasons ?? 1);
  const currentSeasonObj = tvSeasons.find((s: SeasonInfo) => s.seasonNumber === season);
  const episodesPerSeason = tvEpisodes.length > 0 
    ? tvEpisodes.length 
    : (currentSeasonObj?.episodeCount ?? 8);

  return (
    <div className="flex flex-col h-screen bg-xf-bg overflow-hidden">
      {/* ── Top Nav (Custom for Watch Party) ── */}
      <div className="h-14 lg:h-16 flex items-center justify-between px-4 sm:px-6 border-b border-white/10 bg-black/50 z-40 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(`/${room.movieType}/${room.movieId}`)}
            className="p-1.5 rounded-lg text-xf-muted hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            title="Back to details"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="font-bold text-white leading-none truncate text-sm sm:text-base">
              {room.movieTitle}
            </h1>
            {room.movieType === 'tv' && (
              <span className="text-xs text-xf-subtle">S{season} E{episode}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-xf-red/10 border border-xf-red/20 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-xf-red animate-pulse" />
            <span className="text-[10px] font-bold text-xf-red tracking-widest uppercase">
              Watch Party
            </span>
          </div>

          {/* Desktop Show/Hide Chat Button */}
          <button
            onClick={() => setPanelCollapsed((c) => !c)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/90 hover:text-white transition-colors"
            title={panelCollapsed ? 'Open Side Panel' : 'Collapse Side Panel'}
          >
            {panelCollapsed ? (
              <>
                <PanelRightOpen size={14} className="text-emerald-400" />
                <span>Show Panel</span>
              </>
            ) : (
              <>
                <PanelRightClose size={14} className="text-xf-muted" />
                <span>Hide Panel</span>
              </>
            )}
          </button>

          {/* Mobile Buttons */}
          <button
            onClick={() => setMobileSheet('participants')}
            className="lg:hidden p-2 text-xf-muted hover:text-white transition-colors"
            title="View participants"
          >
            <Users size={18} />
          </button>
          <button
            onClick={() => setMobileSheet('chat')}
            className="lg:hidden p-2 text-xf-muted hover:text-white transition-colors"
            title="View chat"
          >
            <MessageSquare size={18} />
          </button>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Overlays */}
        <CountdownOverlay signal={latestSignal} isHost={isHost} />
        
        {/* Left Video + Controls Column */}
        <div className="flex-1 flex flex-col min-w-0 bg-black overflow-hidden relative">
          <SyncToastNotification toast={syncToast} />
          
          {/* Iframe Container with perfect 16:9 bounds fitting */}
          <div className="flex-1 min-h-0 relative bg-black flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
            <div
              className="relative w-full h-full flex items-center justify-center"
              style={{ maxHeight: '100%', maxWidth: '100%' }}
            >
              <div
                className="relative w-full h-full max-h-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10 flex items-center justify-center"
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  aspectRatio: '16/9',
                }}
              >
                {iframeError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-xf-card p-6">
                    <AlertCircle size={36} className="text-xf-red" />
                    <p className="text-white font-medium text-center px-4">
                      This server couldn't load. Try switching servers below.
                    </p>
                    <button
                      onClick={() => handleServerSwitch((serverIdx + 1) % servers.length)}
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
                    title="Watch Party Player"
                    className="w-full h-full border-0"
                    allowFullScreen
                    sandbox={serverIdx === 0 ? "allow-same-origin allow-scripts allow-presentation" : undefined}
                    allow="autoplay; fullscreen; picture-in-picture"
                    onError={() => setIframeError(true)}
                  />
                )}

                {/* Sync status pill */}
                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-black/80 backdrop-blur-md border border-white/15 rounded-full shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                    <span className="text-[11px] font-medium text-white/90">
                      {isHost ? 'You are the host' : 'Watching in sync'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compact bottom toolbar for Servers & Episodes */}
          <div className="bg-[#111317] border-t border-white/10 px-4 py-2.5 sm:py-3 flex-shrink-0 z-20">
            <div className="flex flex-wrap items-center justify-between gap-3 max-w-6xl mx-auto">
              
              {/* Servers Switcher */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xf-subtle text-[11px] font-bold uppercase tracking-wider mr-1">
                  Servers:
                </span>
                {servers.map((s, i) => (
                  <button
                    key={s.name}
                    onClick={() => handleServerSwitch(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      i === serverIdx
                        ? 'bg-xf-red border-xf-red text-white shadow-md shadow-xf-red/20'
                        : 'bg-white/5 border-white/10 text-xf-muted hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>

              {/* TV Episodes (if tv) */}
              {room.movieType === 'tv' && (
                <div className="flex items-center gap-2">
                  <span className="text-xf-subtle text-[11px] font-bold uppercase tracking-wider">
                    Episodes:
                  </span>
                  <select
                    value={season}
                    onChange={(e) => handleEpisodeChange(Number(e.target.value), 1)}
                    className="bg-black/60 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-xf-red"
                  >
                    {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                      <option key={s} value={s}>Season {s}</option>
                    ))}
                  </select>
                  <select
                    value={episode}
                    onChange={(e) => handleEpisodeChange(season, Number(e.target.value))}
                    className="bg-black/60 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-xf-red"
                  >
                    {Array.from({ length: episodesPerSeason }, (_, i) => i + 1).map((e) => (
                      <option key={e} value={e}>Episode {e}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Collapsed side panel restore button */}
              {panelCollapsed && (
                <button
                  onClick={() => setPanelCollapsed(false)}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
                >
                  <MessageSquare size={13} />
                  <span>Show Chat ({messages.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Panel (Desktop/Tablet) ── */}
        <div
          className="hidden lg:block h-full relative z-30 transition-all duration-300 ease-in-out border-l border-white/10"
          style={{ width: panelCollapsed ? 0 : '340px', overflow: panelCollapsed ? 'hidden' : 'visible' }}
        >
          <WatchPartyPanel
            participants={participants}
            messages={messages}
            myParticipantId={myParticipantId}
            isHost={isHost}
            isMuted={isMuted}
            roomStatus={room.status}
            unreadChat={unreadChat}
            collapsed={panelCollapsed}
            onCollapse={() => setPanelCollapsed(true)}
            onLeave={handleLeave}
          />
        </div>

        {/* Floating open button when panel is collapsed */}
        {panelCollapsed && (
          <button
            onClick={() => setPanelCollapsed(false)}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-7 h-16 bg-xf-card hover:bg-[#20252c] border border-white/15 border-r-0 rounded-l-xl items-center justify-center text-emerald-400 hover:text-emerald-300 transition-colors z-40 shadow-xl"
            title="Open Chat & Participants"
          >
            <PanelRightOpen size={16} />
          </button>
        )}
      </div>

      {/* ── Mobile Bottom Sheets ── */}
      {mobileSheet && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSheet(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative h-[80vh] bg-xf-bg rounded-t-2xl overflow-hidden border-t border-white/10"
          >
            <WatchPartyPanel
              participants={participants}
              messages={messages}
              myParticipantId={myParticipantId}
              isHost={isHost}
              isMuted={isMuted}
              roomStatus={room.status}
              unreadChat={0}
              collapsed={false}
              onCollapse={() => setMobileSheet(null)}
              onLeave={handleLeave}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
