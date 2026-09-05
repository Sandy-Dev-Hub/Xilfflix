import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, VolumeX, Trash2, ChevronDown } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
import type { DisplayMessage, ChatMessage, SystemMessage } from '@/types/watchparty';

const MAX_CHARS = 500;
const WARN_CHARS = 400;

function isSystem(m: DisplayMessage): m is SystemMessage {
  return m.type === 'system';
}

function isUser(m: DisplayMessage): m is ChatMessage {
  return m.type === 'user';
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface ChatPanelProps {
  myParticipantId: string;
  isHost: boolean;
  isMuted: boolean;
  messages: DisplayMessage[];
}

export default function ChatPanel({
  myParticipantId,
  isHost,
  isMuted,
  messages,
}: ChatPanelProps) {
  const { sendMessage, clearChat } = useRoomStore();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [inputError, setInputError] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [atBottom, setAtBottom] = useState(true);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevLenRef = useRef(messages.length);

  // Auto-scroll & unread tracking
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (atBottom) {
      el.scrollTop = el.scrollHeight;
      setUnreadCount(0);
    } else {
      const newMsgs = messages.length - prevLenRef.current;
      if (newMsgs > 0) setUnreadCount((c) => c + newMsgs);
    }
    prevLenRef.current = messages.length;
  }, [messages, atBottom]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setAtBottom(near);
    if (near) setUnreadCount(0);
  }, []);

  const scrollToBottom = () => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    setUnreadCount(0);
    setAtBottom(true);
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || isMuted) return;
    setSending(true);
    setInputError('');
    const res = await sendMessage(trimmed);
    if (res.error) {
      setInputError(res.error);
    } else {
      setText('');
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = async () => {
    setConfirmClear(false);
    await clearChat();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-1 px-3 py-3 scrollbar-hide"
      >
        {messages.length === 0 && (
          <p className="text-center text-xf-subtle text-xs py-8">
            No messages yet. Say hello!
          </p>
        )}

        {messages.map((msg) => {
          if (isSystem(msg)) {
            return (
              <div key={msg.id} className="flex items-center gap-2 py-0.5">
                <div className="flex-1 h-px bg-white/10" />
                <p className="text-xf-subtle text-[11px] italic text-center whitespace-nowrap px-1 shrink-0">
                  {msg.body}
                </p>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            );
          }

          if (isUser(msg)) {
            const isMe = msg.participantId === myParticipantId;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2 group ${isMe ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: msg.avatarColor }}
                  aria-hidden="true"
                >
                  {msg.senderName.charAt(0).toUpperCase()}
                </div>

                <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : ''}`}>
                  <div className={`flex items-baseline gap-1.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs font-medium text-white">{msg.senderName}</span>
                    <span className="text-[10px] text-xf-subtle opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatTime(msg.sentAt)}
                    </span>
                  </div>
                  <p
                    className={`text-sm text-xf-muted leading-relaxed mt-0.5 px-3 py-2 rounded-xl break-words ${
                      isMe
                        ? 'bg-xf-red/20 text-white rounded-tr-none'
                        : 'bg-white/[0.07] rounded-tl-none'
                    }`}
                  >
                    {msg.body}
                  </p>
                </div>
              </motion.div>
            );
          }

          return null;
        })}
      </div>

      {/* Scroll-to-bottom pill */}
      <AnimatePresence>
        {!atBottom && unreadCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={scrollToBottom}
            className="mx-3 mb-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-xf-red/90 text-white text-xs font-semibold border border-xf-red/50"
          >
            <ChevronDown size={13} />
            {unreadCount} new message{unreadCount !== 1 ? 's' : ''}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="border-t border-white/10 p-3 space-y-2">
        {isMuted ? (
          <div className="flex items-center gap-2 px-3 py-3 bg-xf-card rounded-xl border border-white/10">
            <VolumeX size={15} className="text-xf-subtle flex-shrink-0" />
            <span className="text-xf-subtle text-sm">
              You've been muted by the host
            </span>
          </div>
        ) : (
          <div className="relative">
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value.slice(0, MAX_CHARS));
                setInputError('');
              }}
              onKeyDown={handleKey}
              placeholder="Message everyone…"
              rows={1}
              disabled={sending}
              className="w-full bg-xf-card border border-white/10 rounded-xl pl-3 pr-10 py-2.5 text-sm text-white placeholder-xf-subtle resize-none focus:outline-none focus:border-xf-red/50 transition-colors max-h-24 overflow-y-auto disabled:opacity-60 scrollbar-hide"
              id="chat-input"
              style={{ lineHeight: '1.4' }}
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              className="absolute right-2 bottom-2 p-1.5 rounded-lg text-xf-subtle hover:text-xf-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </div>
        )}

        {/* Char counter */}
        {text.length >= WARN_CHARS && (
          <p className="text-right text-xf-subtle text-[10px] pr-1">
            <span className={text.length >= MAX_CHARS ? 'text-xf-red' : ''}>
              {text.length}
            </span>
            /{MAX_CHARS}
          </p>
        )}

        {/* Error feedback */}
        <AnimatePresence>
          {inputError && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xf-red text-xs px-1"
            >
              {inputError}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Host: clear chat */}
        {isHost && (
          <div className="border-t border-white/10 pt-2">
            <AnimatePresence mode="wait">
              {!confirmClear ? (
                <motion.button
                  key="clear-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-1.5 text-xf-subtle hover:text-white text-xs transition-colors"
                >
                  <Trash2 size={12} />
                  Clear Chat
                </motion.button>
              ) : (
                <motion.div
                  key="clear-confirm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-xf-muted text-xs">Clear all messages?</span>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="text-xf-subtle text-xs hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearChat}
                    className="text-xf-red text-xs font-semibold hover:text-red-400 transition-colors"
                    id="chat-clear-confirm"
                  >
                    Clear
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
