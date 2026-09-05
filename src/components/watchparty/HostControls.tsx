import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { useRoomStore } from '@/store/useRoomStore';
import type { SyncSignalType } from '@/types/watchparty';

interface HostControlsProps {
  roomStatus: 'lobby' | 'watching' | 'ended';
}

export default function HostControls({ roomStatus }: HostControlsProps) {
  const { sendSyncSignal, updateRoomStatus } = useRoomStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [error, setError] = useState('');

  const run = async (label: string, fn: () => Promise<{ error?: string }>) => {
    setLoading(label);
    setError('');
    const res = await fn();
    if (res.error) setError(res.error);
    setLoading(null);
  };

  const triggerCountdown = async () => {
    setLoading('start');
    setError('');
    // First, update room status
    const statusRes = await updateRoomStatus('watching');
    if (statusRes.error) { setError(statusRes.error); setLoading(null); return; }
    // Fire countdown signals 1s apart
    for (const sig of ['countdown-3', 'countdown-2', 'countdown-1', 'start'] as SyncSignalType[]) {
      await sendSyncSignal(sig);
      await new Promise((r) => setTimeout(r, 1000));
    }
    setLoading(null);
  };

  const Btn = ({
    id,
    icon,
    label,
    onClick,
    variant = 'default',
    disabled,
  }: {
    id: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'danger';
    disabled?: boolean;
  }) => (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled || loading !== null}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
        variant === 'primary'
          ? 'bg-xf-red border-xf-red text-white hover:bg-xf-red-hover'
          : variant === 'danger'
          ? 'bg-transparent border-red-800 text-red-400 hover:bg-red-900/30 hover:border-red-600'
          : 'bg-xf-card border-white/10 text-xf-muted hover:text-white hover:border-white/30'
      }`}
    >
      {loading === id ? <Loader2 size={15} className="animate-spin" /> : icon}
      {label}
    </button>
  );

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-white/[0.03]">
        <p className="text-white font-semibold text-sm">Host Controls</p>
        <p className="text-xf-subtle text-xs mt-0.5">
          {roomStatus === 'lobby'
            ? 'Your signals guide the party.'
            : "You're the host · Your signals guide the party."}
        </p>
      </div>

      <div className="p-3 space-y-2">
        {roomStatus === 'lobby' && (
          <Btn
            id="start"
            icon={<Play size={15} />}
            label={loading === 'start' ? 'Starting…' : '▶ Start Watching'}
            onClick={triggerCountdown}
            variant="primary"
          />
        )}

        {roomStatus === 'watching' && (
          <>
            <Btn
              id="pause"
              icon={<Pause size={15} />}
              label="Send Pause Signal"
              onClick={() => run('pause', () => sendSyncSignal('pause'))}
            />
            <Btn
              id="resume"
              icon={<Play size={15} />}
              label="Send Resume Signal"
              onClick={() => run('resume', () => sendSyncSignal('resume'))}
            />
            <Btn
              id="sync"
              icon={<RefreshCw size={15} />}
              label="Sync Now"
              onClick={() => run('sync', () => sendSyncSignal('sync'))}
            />

            {/* End Party with confirmation */}
            <div className="pt-1 border-t border-white/10">
              <AnimatePresence mode="wait">
                {!confirmEnd ? (
                  <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Btn
                      id="end"
                      icon={<AlertTriangle size={15} />}
                      label="End Party"
                      onClick={() => setConfirmEnd(true)}
                      variant="danger"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-red-950/40 border border-red-800/50 rounded-xl p-3 space-y-2"
                  >
                    <p className="text-red-300 text-xs font-medium">
                      End the party for everyone?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmEnd(false)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-xf-muted bg-xf-card border border-white/10 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setConfirmEnd(false);
                          run('end', () => updateRoomStatus('ended'));
                        }}
                        disabled={loading !== null}
                        className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white bg-red-700 hover:bg-red-600 transition-colors disabled:opacity-50"
                        id="host-end-confirm"
                      >
                        End Party
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}

        {error && (
          <p className="text-xf-red text-xs px-1">{error}</p>
        )}
      </div>
    </div>
  );
}
