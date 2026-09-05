import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RefreshCw } from 'lucide-react';
import type { SyncToast } from '@/types/watchparty';
import { useRoomStore } from '@/store/useRoomStore';

const TOAST_CONFIG: Record<
  string,
  { icon: React.ReactNode; text: string; action?: string }
> = {
  pause: {
    icon: <Pause size={15} className="text-yellow-400" />,
    text: 'Host paused the party',
    action: 'Resume',
  },
  resume: {
    icon: <Play size={15} className="text-green-400" />,
    text: 'Host is playing',
    action: 'Sync Up',
  },
  sync: {
    icon: <RefreshCw size={15} className="text-blue-400" />,
    text: 'Host sent a sync signal',
    action: 'Got it',
  },
  start: {
    icon: <Play size={15} className="text-green-400" />,
    text: 'Host started the party',
    action: 'Sync Up',
  },
};

interface SyncToastProps {
  toast: SyncToast | null;
}

export default function SyncToastNotification({ toast }: SyncToastProps) {
  const dismissToast = useRoomStore((s) => s.dismissToast);

  // Auto-dismiss after 8s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismissToast, 8000);
    return () => clearTimeout(t);
  }, [toast, dismissToast]);

  const config = toast ? TOAST_CONFIG[toast.signal] : null;

  return (
    <AnimatePresence>
      {toast && config && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute top-3 right-3 z-20 w-64 rounded-xl border border-white/10 shadow-2xl shadow-black/60 overflow-hidden"
          style={{ background: 'rgba(31,31,31,0.95)', backdropFilter: 'blur(16px)' }}
        >
          <div className="p-3">
            <div className="flex items-start gap-2.5 mb-2">
              <span className="mt-0.5 flex-shrink-0">{config.icon}</span>
              <p className="text-white text-sm font-medium leading-snug flex-1">
                {config.text}
              </p>
              <button
                onClick={dismissToast}
                className="flex-shrink-0 text-xf-subtle hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>

            {toast.signal === 'sync' && (
              <p className="text-xf-muted text-xs mb-2 pl-5">
                Match your player to the host's position.
              </p>
            )}

            {config.action && (
              <button
                onClick={dismissToast}
                className="ml-5 text-xf-red hover:text-red-400 text-xs font-semibold transition-colors"
              >
                {config.action}
              </button>
            )}
          </div>

          {/* Auto-dismiss progress bar */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 8, ease: 'linear' }}
            style={{ transformOrigin: 'left' }}
            className="h-0.5 bg-xf-red/60"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
