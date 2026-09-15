import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
 *
 * The "aurora blob" is the movie's own backdrop image, blurred so heavily
 * (120px) and scaled (1.4×) that zero recognisable detail remains — only
 * dominant colour and mood bleed through.
 *
 * The hero's sharp image (PageBackground, inside the hero container at
 * z-[1] with overflow:hidden) naturally occludes this layer in the hero area.
 * Below the hero, as content rows scroll over it, transparent row backgrounds
 * let the aurora colour show through continuously — no flat dead zones.
 */
export default function AmbientBackground({ movie }: AmbientBackgroundProps) {
  const [readyId, setReadyId] = useState<string | null>(null);
  const imgCache = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!movie) return;
    if (imgCache.current[movie.id]) { setReadyId(movie.id); return; }
    const src = movie.backdrop || movie.poster;
    if (!src) return;
    const img = new Image();
    img.src = src;
    const done = () => { imgCache.current[movie.id] = true; setReadyId(movie.id); };
    img.onload = done;
    img.onerror = done;
  }, [movie]);

  const readyMovie = movie && movie.id === readyId ? movie : null;

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0, backgroundColor: '#050505' }}
      aria-hidden="true"
    >
      <AnimatePresence mode="sync">
        {readyMovie && (
          <motion.div
            key={readyMovie.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {/* ── Aurora blob ──────────────────────────────────────────────────────
                The backdrop, blurred into pure colour/mood. No recognisable
                detail at 120px blur + 1.4× scale. opacity:0.50 keeps it vivid
                without overpowering dark UI elements on top. */}
            <img
              src={readyMovie.backdrop || readyMovie.poster}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-top"
              style={{
                filter: 'blur(120px) saturate(2.0) brightness(0.80)',
                transform: 'scale(1.4)',
                opacity: 0.65,
              }}
            />

            {/* Soft gradient fade toward the bottom so the aurora eases off
                rather than abruptly ending at the viewport edge. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, transparent 35%, rgba(5,5,5,0.45) 65%, rgba(5,5,5,0.80) 100%)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
