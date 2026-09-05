import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VolumeX, Volume2, Crown, LogOut, Loader2 } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
import type { Participant } from '@/types/watchparty';

interface ParticipantsPanelProps {
  participants: Participant[];
  myParticipantId: string;
  isHost: boolean;
  onLeave: () => void;
}

function AvatarCircle({
  name,
  color,
  size = 'sm',
}: {
  name: string;
  color: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div
      className={`flex-shrink-0 rounded-full flex items-center justify-center font-bold text-white uppercase ${
        size === 'md' ? 'w-9 h-9 text-sm' : 'w-8 h-8 text-xs'
      }`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {name.charAt(0)}
    </div>
  );
}

export default function ParticipantsPanel({
  participants,
  myParticipantId,
  isHost,
  onLeave,
}: ParticipantsPanelProps) {
  const { muteParticipant } = useRoomStore();
  const [mutingId, setMutingId] = useState<string | null>(null);

  const handleMute = async (p: Participant) => {
    setMutingId(p.id);
    await muteParticipant(p.id, !p.isMuted);
    setMutingId(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Participant list */}
      <div className="flex-1 overflow-y-auto space-y-1 p-3">
        <AnimatePresence initial={false}>
          {participants.map((p) => {
            const isMe = p.id === myParticipantId;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center gap-2.5 px-2 py-2 rounded-xl transition-colors ${
                  isMe ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
                }`}
              >
                <div className="relative">
                  <AvatarCircle name={p.displayName} color={p.avatarColor} />
                  {/* Online indicator */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-xf-card" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {p.isHost && (
                      <Crown size={11} className="text-yellow-400 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium text-white truncate">
                      {p.displayName}
                      {isMe && (
                        <span className="text-xf-subtle text-xs ml-1">(You)</span>
                      )}
                    </span>
                  </div>
                  {p.isMuted && (
                    <span className="text-xf-subtle text-[10px] flex items-center gap-1">
                      <VolumeX size={9} />
                      Muted
                    </span>
                  )}
                </div>

                {/* Host-only mute button (not for other host or self if host) */}
                {isHost && !p.isHost && (
                  <button
                    onClick={() => handleMute(p)}
                    disabled={mutingId === p.id}
                    title={p.isMuted ? 'Unmute' : 'Mute'}
                    className="flex-shrink-0 p-1.5 rounded-lg text-xf-subtle hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                    aria-label={`${p.isMuted ? 'Unmute' : 'Mute'} ${p.displayName}`}
                  >
                    {mutingId === p.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : p.isMuted ? (
                      <Volume2 size={14} />
                    ) : (
                      <VolumeX size={14} />
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {participants.length === 0 && (
          <p className="text-center text-xf-subtle text-xs py-6">
            Loading participants…
          </p>
        )}
      </div>

      {/* Leave button */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={onLeave}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-xf-muted border border-white/10 hover:text-white hover:border-white/30 transition-colors"
          id="wp-leave-btn"
        >
          <LogOut size={15} />
          Leave Room
        </button>
      </div>
    </div>
  );
}
