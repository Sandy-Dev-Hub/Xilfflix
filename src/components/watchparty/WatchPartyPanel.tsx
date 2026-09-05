import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, ChevronRight, Crown } from 'lucide-react';
import type { Participant, DisplayMessage } from '@/types/watchparty';
import ParticipantsPanel from './ParticipantsPanel';
import ChatPanel from './ChatPanel';
import HostControls from './HostControls';

type Tab = 'participants' | 'chat';

interface WatchPartyPanelProps {
  participants: Participant[];
  messages: DisplayMessage[];
  myParticipantId: string;
  isHost: boolean;
  isMuted: boolean;
  roomStatus: 'lobby' | 'watching' | 'ended';
  unreadChat: number;
  collapsed: boolean;
  onCollapse: () => void;
  onLeave: () => void;
}

export default function WatchPartyPanel({
  participants,
  messages,
  myParticipantId,
  isHost,
  isMuted,
  roomStatus,
  unreadChat,
  collapsed,
  onCollapse,
  onLeave,
}: WatchPartyPanelProps) {
  const [tab, setTab] = useState<Tab>('chat');

  const hostParticipant = participants.find((p) => p.isHost);

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 0 : undefined, opacity: collapsed ? 0 : 1 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex flex-col h-full border-l border-white/10 bg-xf-bg overflow-hidden"
      style={{ minWidth: collapsed ? 0 : undefined }}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-xf-card/40 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-xf-red" />
          <span className="font-semibold text-sm text-white uppercase tracking-wide">
            Watch Party
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-xf-red uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-xf-red animate-pulse" />
            {roomStatus === 'lobby' ? 'LOBBY' : 'LIVE'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xf-subtle text-xs">
          <span>{participants.length} watching</span>
          <button
            onClick={onCollapse}
            className="p-1 rounded hover:text-white transition-colors"
            aria-label="Collapse panel"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Host badge */}
      {hostParticipant && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border-b border-white/10 flex-shrink-0">
          <Crown size={11} className="text-yellow-400" />
          <span className="text-xf-subtle text-[11px]">
            Host:{' '}
            <span className="text-xf-muted font-medium">{hostParticipant.displayName}</span>
          </span>
        </div>
      )}

      {/* Host controls (if I am host) */}
      {isHost && (
        <div className="px-3 pt-3 flex-shrink-0">
          <HostControls roomStatus={roomStatus} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/10 flex-shrink-0">
        {(['participants', 'chat'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors relative ${
              tab === t ? 'text-white' : 'text-xf-muted hover:text-white'
            }`}
          >
            {t === 'participants' ? (
              <>
                <Users size={13} />
                Participants
                <span className="ml-0.5 text-[10px] bg-white/10 rounded-full px-1.5">
                  {participants.length}
                </span>
              </>
            ) : (
              <>
                <MessageSquare size={13} />
                Chat
                {unreadChat > 0 && tab !== 'chat' && (
                  <span className="ml-0.5 text-[10px] bg-xf-red rounded-full px-1.5">
                    {unreadChat}
                  </span>
                )}
              </>
            )}
            {tab === t && (
              <motion.div
                layoutId="panel-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-xf-red"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {tab === 'participants' ? (
            <motion.div
              key="participants"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <ParticipantsPanel
                participants={participants}
                myParticipantId={myParticipantId}
                isHost={isHost}
                onLeave={onLeave}
              />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <ChatPanel
                myParticipantId={myParticipantId}
                isHost={isHost}
                isMuted={isMuted}
                messages={messages}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
