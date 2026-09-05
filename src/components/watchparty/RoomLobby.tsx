import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, LogOut, Check, Play, Loader2, Crown } from 'lucide-react';
import type { WatchPartyRoom, Participant } from '@/types/watchparty';

interface RoomLobbyProps {
  room: WatchPartyRoom;
  participants: Participant[];
  myParticipantId: string;
  isHost: boolean;
  onStart: () => void;
  onLeave: () => void;
}

export default function RoomLobby({
  room,
  participants,
  myParticipantId,
  isHost,
  onStart,
  onLeave,
}: RoomLobbyProps) {
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  const url = `${window.location.origin}/watch-party/${room.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Join my Watch Party on Xilfflix`,
        text: `I'm watching ${room.movieTitle}. Join my Watch Party!`,
        url,
      });
    } catch {
      handleCopy();
    }
  };

  const handleStart = () => {
    setStarting(true);
    onStart();
    // we don't clear starting, it will unmount when room status changes
  };

  return (
    <div className="min-h-screen bg-xf-bg relative flex items-center justify-center p-4 sm:p-8">
      {/* Background backdrop */}
      {room.moviePoster && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${room.moviePoster})` }}
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl" />
        </>
      )}

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10"
        style={{ background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(24px)' }}
      >
        <div className="p-8 sm:p-10 flex flex-col items-center text-center">
          <p className="text-xf-red font-bold tracking-widest uppercase text-xs mb-6">
            Watch With Friends
          </p>

          {/* Movie info */}
          {room.moviePoster ? (
            <img
              src={room.moviePoster}
              alt={room.movieTitle ?? 'Movie'}
              className="w-24 h-36 object-cover rounded-xl shadow-lg border border-white/10 mb-4"
            />
          ) : (
            <div className="w-24 h-36 bg-xf-card rounded-xl border border-white/10 mb-4" />
          )}

          <h1 className="text-2xl sm:text-3xl font-display font-black text-white leading-tight mb-2">
            {room.movieTitle}
          </h1>

          <span className="px-2.5 py-0.5 bg-white/10 text-xf-muted text-[10px] font-bold uppercase tracking-wider rounded">
            {room.movieType === 'tv' ? 'TV Series' : 'Movie'}
          </span>

          {/* Share code */}
          <div className="w-full mt-8 mb-8">
            <p className="text-xf-subtle text-xs font-semibold uppercase tracking-wider mb-2">
              Room Code
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="font-mono text-lg font-bold tracking-[0.2em] text-white">
                  {room.id}
                </span>
                <button
                  onClick={handleCopy}
                  className="text-xf-muted hover:text-white transition-colors p-1"
                  title="Copy link"
                >
                  {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                </button>
              </div>
              <button
                onClick={handleShare}
                className="h-full px-4 bg-xf-card hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-xf-muted hover:text-white flex items-center justify-center"
                title="Share"
              >
                <Share2 size={18} />
              </button>
            </div>
            <p className="text-xf-subtle text-[11px] mt-2">
              Share this code or link with friends to let them join.
            </p>
          </div>

          {/* Minimal participant list */}
          <div className="w-full mb-8">
            <div className="flex justify-center -space-x-3 mb-2">
              {participants.slice(0, 5).map((p, i) => (
                <div
                  key={p.id}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-[#181818] relative"
                  style={{ backgroundColor: p.avatarColor, zIndex: 10 - i }}
                  title={p.displayName}
                >
                  {p.displayName.charAt(0).toUpperCase()}
                  {p.isHost && (
                    <div className="absolute -top-1 -right-1 bg-black rounded-full p-0.5">
                      <Crown size={10} className="text-yellow-400" />
                    </div>
                  )}
                </div>
              ))}
              {participants.length > 5 && (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-[#181818] bg-xf-card relative"
                  style={{ zIndex: 0 }}
                >
                  +{participants.length - 5}
                </div>
              )}
            </div>
            <p className="text-xf-muted text-sm font-medium">
              {participants.length} {participants.length === 1 ? 'person' : 'people'} joined
            </p>
          </div>

          {/* Action buttons */}
          <div className="w-full space-y-3">
            {isHost ? (
              <button
                onClick={handleStart}
                disabled={starting}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-xf-red hover:bg-xf-red-hover text-white font-bold rounded-xl transition-colors shadow-lg shadow-xf-red/20 disabled:opacity-50"
              >
                {starting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Play size={18} fill="white" />
                    Start Watching
                  </>
                )}
              </button>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/5 border border-white/10 text-white font-semibold rounded-xl">
                <Loader2 size={16} className="animate-spin text-xf-subtle" />
                Waiting for host to start…
              </div>
            )}

            <button
              onClick={onLeave}
              className="w-full flex items-center justify-center gap-2 py-3 bg-transparent text-xf-muted hover:text-white font-semibold rounded-xl transition-colors"
            >
              <LogOut size={16} />
              Leave Room
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
