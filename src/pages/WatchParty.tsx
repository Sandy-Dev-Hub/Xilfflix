import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Users, MessageSquare, AlertCircle, RefreshCw, Tv2 } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
import { makeServers } from '@/utils/servers';

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

  // Prevent flash of JoinRoomModal on hard refresh
  const [isInitializing, setIsInitializing] = useState(true);

  // If we arrived with a roomCode in URL but no session, try to rejoin
  useEffect(() => {
    if (roomCode && !session && !error) {
      rejoinRoom(roomCode).finally(() => {
        setIsInitializing(false);
      });
    } else {
      setIsInitializing(false);
    }
  }, [roomCode, session, error, rejoinRoom]);

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
  const totalSeasons = 3; // Hardcoded fallback
  const episodesPerSeason = 12;

  return (
    <div className="flex flex-col h-screen bg-xf-bg overflow-hidden">
      {/* ── Top Nav (Custom for Watch Party) ── */}
      <div className="h-14 lg:h-16 flex items-center justify-between px-4 sm:px-6 border-b border-white/10 bg-black/50 z-40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/${room.movieType}/${room.movieId}`)}
            className="p-1.5 rounded-lg text-xf-muted hover:text-white hover:bg-white/10 transition-colors"
            title="Back to details"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="hidden sm:block">
            <h1 className="font-bold text-white leading-none">
              {room.movieTitle}
            </h1>
            {room.movieType === 'tv' && (
              <span className="text-xs text-xf-subtle">S{season} E{episode}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-xf-red/10 border border-xf-red/20 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-xf-red animate-pulse" />
            <span className="text-[10px] font-bold text-xf-red tracking-widest uppercase">
              Watch Party
            </span>
          </div>

          <button
            onClick={() => setMobileSheet('participants')}
            className="lg:hidden p-2 text-xf-muted hover:text-white transition-colors"
          >
            <Users size={18} />
          </button>
          <button
            onClick={() => setMobileSheet('chat')}
            className="lg:hidden p-2 text-xf-muted hover:text-white transition-colors"
          >
            <MessageSquare size={18} />
          </button>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Overlays */}
        <CountdownOverlay signal={latestSignal} isHost={isHost} />
        
        {/* The toast container should be positioned relative to the video area, so it goes inside the left flex col */}
        
        <div className="flex-1 flex flex-col relative bg-black">
          <SyncToastNotification toast={syncToast} />
          
          {/* Iframe container */}
          <div className="w-full relative bg-black flex-1 flex flex-col justify-center">
             {iframeError ? (
              <div className="aspect-video flex flex-col items-center justify-center gap-4 bg-xf-card">
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
                className="w-full aspect-video border-0 shadow-2xl shadow-black/80"
                allowFullScreen
                sandbox={serverIdx === 0 ? "allow-same-origin allow-scripts allow-presentation" : undefined}
                allow="autoplay; fullscreen; picture-in-picture"
                onError={() => setIframeError(true)}
              />
            )}
            
            {/* Sync status pill (below video, overlaying slightly) */}
            <div className="absolute bottom-4 left-4 z-10">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-full shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                <span className="text-[11px] font-medium text-white/90">
                  {isHost ? 'You are the host' : 'Watching independently'}
                </span>
              </div>
            </div>
          </div>

          {/* Player controls / Switchers (below video on desktop, hidden on very small mobile if space tight) */}
          <div className="h-32 sm:h-40 bg-xf-bg border-t border-white/10 p-4 overflow-y-auto">
            <div className="flex flex-col sm:flex-row gap-6 max-w-4xl mx-auto">
              
              {/* Servers */}
              <div className="flex-1">
                <p className="text-xf-subtle text-[10px] font-bold uppercase tracking-widest mb-2">Servers</p>
                <div className="flex flex-wrap gap-2">
                  {servers.map((s, i) => (
                    <button
                      key={s.name}
                      onClick={() => handleServerSwitch(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                        i === serverIdx
                          ? 'bg-xf-red border-xf-red text-white'
                          : 'bg-xf-card border-white/10 text-xf-muted hover:text-white'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* TV Episodes */}
              {room.movieType === 'tv' && (
                <div className="flex-1">
                  <p className="text-xf-subtle text-[10px] font-bold uppercase tracking-widest mb-2">Episodes</p>
                  <div className="flex flex-wrap gap-2">
                    <select 
                      value={season}
                      onChange={(e) => handleEpisodeChange(Number(e.target.value), 1)}
                      className="bg-xf-card border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                    >
                      {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                        <option key={s} value={s}>Season {s}</option>
                      ))}
                    </select>
                    <select
                      value={episode}
                      onChange={(e) => handleEpisodeChange(season, Number(e.target.value))}
                      className="bg-xf-card border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                    >
                      {Array.from({ length: episodesPerSeason }, (_, i) => i + 1).map((e) => (
                        <option key={e} value={e}>Ep {e}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Panel (Desktop/Tablet) ── */}
        <div className="hidden lg:block h-full relative z-30" style={{ width: panelCollapsed ? 0 : '340px' }}>
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

        {/* Uncollapse button when panel is closed */}
        {panelCollapsed && (
          <button
            onClick={() => setPanelCollapsed(false)}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-6 h-16 bg-xf-card border border-white/10 border-r-0 rounded-l-lg items-center justify-center text-xf-muted hover:text-white transition-colors z-40"
            title="Expand panel"
          >
            <ArrowLeft size={14} />
          </button>
        )}
      </div>

      {/* ── Mobile Bottom Sheets ── */}
      {/* We would use Framer Motion here to slide up the WatchPartyPanel content on mobile */}
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
              onCollapse={() => setMobileSheet(null)} // on mobile, collapse means close sheet
              onLeave={handleLeave}
            />
           </motion.div>
         </div>
      )}
    </div>
  );
}
