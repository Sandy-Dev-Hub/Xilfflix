import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface NotificationPanelProps {
  onClose: () => void;
}

function formatTimestamp(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return 'Just now';
  if (hours < 1) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return '1 week ago';
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { notifications, markRead, markAllRead } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute top-12 right-0 w-[380px] max-w-[calc(100vw-24px)] bg-[#181818] rounded-xl shadow-2xl shadow-black/60 border border-white/10 overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-white font-bold text-sm">Notifications</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={markAllRead}
            className="text-xf-muted hover:text-white text-xs transition-colors"
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="text-xf-muted hover:text-white transition-colors"
            aria-label="Close notifications"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="overflow-y-auto" style={{ maxHeight: 480 }}>
        {notifications.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-2">
            <p className="text-xf-muted text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => markRead(notif.id)}
              className={`w-full text-left flex gap-3 px-4 py-3 transition-colors relative
                ${notif.read
                  ? 'hover:bg-white/5'
                  : 'bg-white/[0.04] hover:bg-white/[0.07]'
                }`}
            >
              {/* Unread indicator */}
              {!notif.read && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-10 bg-xf-red rounded-r-full" />
              )}

              {/* Thumbnail */}
              <div className="flex-shrink-0 w-12 h-[68px] rounded-sm overflow-hidden bg-xf-card">
                {notif.thumbnailUrl ? (
                  <img
                    src={notif.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-xf-red/20 to-xf-card flex items-center justify-center">
                    <span className="text-xf-red font-black text-lg font-display">X</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className={`text-sm font-semibold leading-tight mb-0.5 line-clamp-1 ${notif.read ? 'text-white/80' : 'text-white'}`}>
                  {notif.headline}
                </p>
                <p className="text-xf-muted text-xs leading-relaxed line-clamp-2">
                  {notif.body}
                </p>
                <p className="text-xf-subtle text-[11px] mt-1">{formatTimestamp(notif.timestamp)}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </motion.div>
  );
}
