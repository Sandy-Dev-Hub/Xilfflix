import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Movie } from '@/types/movie';

interface AmbientBackgroundProps {
  movie: Movie | null;
}

/**
 * Fixed aurora/ambient background — the bottom-most layer of the entire UI.
 *
 * position: fixed  → stays behind ALL scrollable content; never scrolls away.
 * z-index: 0       → below the hero (z-[1]), content rows (z-10), navbar (z-50).
 * backgroundColor  → #050505 fallback so the canvas is never pure white.
 */
export default function AmbientBackground({ movie }: AmbientBackgroundProps) {
  const [layers, setLayers] = useState<{ id: string; src: string; key: number }[]>([]);
  const layerKey = useRef(0);

  useEffect(() => {
    if (!movie) return;
    const src = movie.backdrop || movie.poster;
    if (!src) return;

    setLayers((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].id === movie.id) return prev;
      layerKey.current += 1;
      const newLayer = { id: movie.id, src, key: layerKey.current };
      return [...prev.slice(-1), newLayer];
    });
  }, [movie?.id, movie?.backdrop, movie?.poster]);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0, backgroundColor: '#050505' }}
      aria-hidden="true"
    >
      {layers.map((layer, index) => {
        const isTop = index === layers.length - 1;
        const shouldFadeIn = isTop && layers.length > 1;

        return (
          <motion.div
            key={layer.key}
            initial={shouldFadeIn ? { opacity: 0 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            onAnimationComplete={() => {
              if (isTop && layers.length > 1) {
                setLayers([layer]);
              }
            }}
            className="absolute inset-0"
            style={{ zIndex: index }}
          >
            {/* ── Aurora blob ────────────────────────────────────────────────────── */}
            <img
              src={layer.src}
              alt=""
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-top"
              style={{
                filter: 'blur(120px) saturate(2.0) brightness(0.80)',
                transform: 'scale(1.4)',
                opacity: 0.65,
              }}
            />

            {/* Soft gradient fade toward the bottom */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, transparent 35%, rgba(5,5,5,0.45) 65%, rgba(5,5,5,0.80) 100%)',
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
