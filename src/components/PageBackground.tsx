import { AnimatePresence, motion } from 'framer-motion';
import type { Movie } from '@/types/movie';

interface PageBackgroundProps {
  movie: Movie | null;
}

/**
 * Cinejoy-style unified dynamic background.
 *
 * Layer stack (bottom → top):
 *  1. Dark base (#08080a) — set on the page wrapper.
 *  2. Blurred ambient poster colour glow — full-page tint from the movie backdrop.
 *  3. Crystal-clear crisp backdrop — covers the hero + first content row (85 vh).
 *     Masked away softly at the bottom so it dissolves into the ambient glow.
 *  4. Directional readability gradients inside the crisp layer.
 */
export default function PageBackground({ movie }: PageBackgroundProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <AnimatePresence mode="sync">
        {movie && (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {/* ── Layer 1: Full-page Ambient Poster Colour Glow ──────────────
                Blurred + heavily saturated backdrop that tints the entire page
                with the movie's dominant colour. Visible especially below the
                hero in the content row area. */}
            <img
              src={movie.backdrop || movie.poster}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-top"
              style={{
                filter: 'blur(55px) saturate(2.6) brightness(0.75)',
                transform: 'scale(1.18)',
                opacity: 0.95,
              }}
            />
            {/* Gradient overlay: lighter at bottom so poster colour bleeds
                through the content rows; darker at top to not compete with
                the crisp backdrop layer. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(8,8,10,0.10) 0%, rgba(8,8,10,0.20) 35%, rgba(8,8,10,0.38) 60%, rgba(8,8,10,0.45) 100%)',
              }}
            />

            {/* ── Layer 2: Crystal-Clear Cinematic Backdrop ──────────────────
                Full-resolution, zero blur. Covers hero + Browse/first row (85 vh).
                CSS mask dissolves it softly into the ambient glow below. */}
            <div
              className="absolute inset-x-0 top-0 overflow-hidden"
              style={{
                height: '85vh',
                minHeight: '600px',
                maxHeight: '920px',
                WebkitMaskImage:
                  'linear-gradient(to bottom, black 0%, black 72%, transparent 99%)',
                maskImage:
                  'linear-gradient(to bottom, black 0%, black 72%, transparent 99%)',
              }}
            >
              <img
                src={movie.backdrop || movie.poster}
                alt=""
                className="w-full h-full object-cover object-top"
                style={{ filter: 'brightness(0.93) contrast(1.05)' }}
              />

              {/* Horizontal gradient: dark left side for text readability */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.40) 30%, rgba(0,0,0,0.08) 55%, transparent 80%)',
                }}
              />

              {/* Top vignette: blends with the navbar */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.08) 12%, transparent 35%)',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
