import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownOverlayProps {
  signal: string | null;
  isHost: boolean;
}

const COUNTDOWN_MAP: Record<string, { display: string; color: string }> = {
  'countdown-3': { display: '3', color: 'text-white' },
  'countdown-2': { display: '2', color: 'text-white' },
  'countdown-1': { display: '1', color: 'text-white' },
  start: { display: '▶', color: 'text-green-400' },
};

export default function CountdownOverlay({ signal, isHost }: CountdownOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!signal || !COUNTDOWN_MAP[signal]) return;
    if (isHost) return; // host doesn't see overlay — they triggered it

    setCurrent(signal);
    setVisible(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    const duration = signal === 'start' ? 3000 : 1100;
    timerRef.current = setTimeout(() => setVisible(false), duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [signal, isHost]);

  return (
    <AnimatePresence>
      {visible && current && COUNTDOWN_MAP[current] && (
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.4 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none"
        >
          <motion.span
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`font-display font-black select-none leading-none ${COUNTDOWN_MAP[current].color} ${
              current === 'start' ? 'text-7xl sm:text-8xl' : 'text-[120px] sm:text-[180px]'
            }`}
            style={{ textShadow: current === 'start' ? '0 0 40px rgba(74,222,128,0.5)' : undefined }}
          >
            {COUNTDOWN_MAP[current].display}
          </motion.span>

          {current === 'start' && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-green-400 font-semibold text-lg sm:text-2xl text-center px-4"
              style={{ textShadow: '0 0 20px rgba(74,222,128,0.4)' }}
            >
              Start the video now
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
