import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Movie } from '@/types/movie';

interface PageBackgroundProps {
  movie: Movie | null;
}

/**
 * Hero-scoped crisp backdrop — rendered inside the hero container
 * (position: relative; z-[1]; overflow: hidden).
 *
 * The bottom of the hero image dissolves into the fixed aurora layer
 * USING A CSS MASK, not a dark gradient overlay. This is the key difference:
 *   - mask-image fade  → image alpha goes to 0, aurora colour shows through
 *   - dark gradient    → paints black on top, kills colour, creates dead zone
 *
 * Layer stack:
 *  1. Sharp image inside mask-image wrapper   → fades bottom via alpha mask
 *  2. Left vignette (separate, not masked)    → title/text readability only
 *  3. Top vignette  (separate, not masked)    → navbar area blend
 *
 * Nothing here fades to black. The aurora (AmbientBackground) provides the
 * colour wash wherever the mask makes the hero image transparent.
 */
export default function PageBackground({ movie }: PageBackgroundProps) {
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
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
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
            {/* ── Sharp hero image — bottom fade via CSS mask ───────────────────
                mask-image: the image stays fully opaque (black mask = visible)
                from 0%→42%, then alpha-fades to fully transparent at 96%.
                "Transparent" in the mask = the image pixel is invisible →
                the aurora layer beneath shows through with full colour.
                NO dark overlay is placed here for the bottom fade. */}
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
                src={readyMovie.backdrop || readyMovie.poster}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-top"
                style={{ filter: 'brightness(0.84) contrast(1.08) saturate(1.06)' }}
              />
              {/* Left subtle vignette for text readability without creating a heavy black bar/patch */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 30%, transparent 60%)',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
