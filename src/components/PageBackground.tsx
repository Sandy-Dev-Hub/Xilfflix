import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Movie } from '@/types/movie';

interface PageBackgroundProps {
  movie: Movie | null;
}

/**
 * Hero-scoped crisp backdrop — rendered inside the hero container
 * (position: relative; z-[1]; overflow: hidden).
 *
 * Implements a persistent two-layer stack where the previous image stays at 100% opacity
 * underneath while the new image smoothly fades in on top, guaranteeing ZERO brightness dip,
 * blackout or flicker during slide transitions.
 */
export default function PageBackground({ movie }: PageBackgroundProps) {
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
      // Keep only previous layer underneath and new layer on top
      return [...prev.slice(-1), newLayer];
    });
  }, [movie?.id, movie?.backdrop, movie?.poster]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
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
            {/* ── Sharp hero image — bottom fade via CSS mask ─────────────────── */}
            <div
              className="absolute inset-0"
              style={{
                WebkitMaskImage:
                  'linear-gradient(to bottom, black 0%, black 50%, transparent 100%)',
                maskImage:
                  'linear-gradient(to bottom, black 0%, black 50%, transparent 100%)',
              }}
            >
              <img
                src={layer.src}
                alt=""
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-top"
                style={{ filter: 'brightness(0.84) contrast(1.08) saturate(1.06)' }}
              />
              {/* Left subtle vignette for text readability */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 30%, transparent 60%)',
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
