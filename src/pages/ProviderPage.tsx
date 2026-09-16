import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Film,
} from 'lucide-react';
import { PROVIDERS_LIST } from '@/data/providers';
import type { Movie } from '@/types/movie';
import { getProviderContentPage } from '@/services/tmdb';
import MovieCard from '@/components/MovieCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';

const TMDB_LOGO_BASE = 'https://image.tmdb.org/t/p/w154';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0 },
};

export default function ProviderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const provider = PROVIDERS_LIST.find((p) => p.id === id) ?? null;

  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');

  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Redirect if provider not found
  useEffect(() => {
    if (!provider && id) navigate('/', { replace: true });
  }, [provider, id, navigate]);

  // Reset & load page 1 when filters change
  useEffect(() => {
    if (!provider) return;

    let isMounted = true;
    setLoading(true);
    setMovies([]);
    setPage(1);
    setHasMore(true);

    getProviderContentPage({
      providerId: provider.tmdbId,
      mediaType,
      page: 1,
    })
      .then((res) => {
        if (!isMounted) return;
        setMovies(res.movies);
        setHasMore(res.movies.length > 0 && res.totalPages > 1);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoading(false);
        setHasMore(false);
      });

    return () => {
      isMounted = false;
    };
  }, [provider, mediaType]);

  // Infinite scroll — load next page
  const loadMore = useCallback(() => {
    if (loading || !hasMore || !provider) return;
    const nextPage = page + 1;
    setLoading(true);

    getProviderContentPage({
      providerId: provider.tmdbId,
      mediaType,
      page: nextPage,
    })
      .then((res) => {
        if (res.movies.length === 0) {
          setHasMore(false);
        } else {
          setMovies((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            return [...prev, ...res.movies.filter((m) => !existingIds.has(m.id))];
          });
          setPage(nextPage);
          if (nextPage >= res.totalPages) setHasMore(false);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [loading, hasMore, provider, mediaType, page]);

  // IntersectionObserver sentinel
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore, hasMore, loading]);

  if (!provider) return null;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen relative overflow-x-hidden"
      style={{ backgroundColor: '#060709' }}
    >
      {/* ── Aurora Transparency Ambient Background ─────────────────────────── */}
      <ProviderAmbientBackground glowColor={provider.glowColor} bgColor={provider.bgColor} />

      {/* ── Top Navigation Bar ─────────────────────────────────────────────── */}
      <ProviderNavbar onBack={() => navigate(-1)} />

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 pt-12 sm:pt-14 md:pt-16">
        {/* ── Provider Brand Header ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 pt-1 sm:pt-2 pb-2"
        >
          {/* Logo + Name row */}
          <div className="flex items-center gap-4 sm:gap-6 mb-5">
            {/* Curvy Provider icon */}
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-[28px] sm:rounded-[34px] overflow-hidden shrink-0 shadow-2xl ring-1 ring-white/15 flex items-center justify-center p-1 transition-transform duration-300 hover:scale-105"
              style={{
                backgroundColor: provider.bgColor,
              }}
            >
              <img
                src={`${TMDB_LOGO_BASE}${provider.logoPath}`}
                alt={provider.name}
                className="w-full h-full object-cover rounded-[24px] sm:rounded-[30px]"
              />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-none">
                  {provider.name}
                </h1>
              </div>
              {/* Hidden on mobile, visible sm+ */}
              <p className="hidden sm:block mt-1.5 text-sm sm:text-base text-white/60 max-w-2xl leading-relaxed">
                {provider.tagline}
              </p>
            </div>
          </div>

          {/* ── Filter Capsule (Seamless Pill Switcher without divider line) ── */}
          <div className="mt-4 sm:mt-5 flex items-center">
            <nav
              aria-label="Content type"
              className="relative inline-flex items-center p-1 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)] select-none"
            >
              {(
                [
                  { key: 'movie' as const, label: 'Movies' },
                  { key: 'tv' as const, label: 'Series' },
                ] as const
              ).map(({ key, label }) => {
                const isActive = mediaType === key;
                return (
                  <button
                    key={key}
                    onClick={() => setMediaType(key)}
                    aria-pressed={isActive}
                    className={`relative px-5 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                      isActive ? 'text-zinc-950 font-bold' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {/* Active white capsule */}
                    {isActive && (
                      <motion.div
                        layoutId="providerTabCapsule"
                        className="absolute inset-0 rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
                        transition={{ type: 'spring', stiffness: 450, damping: 35, mass: 0.8 }}
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* ── Content Grid ─────────────────────────────────────────────────── */}
        <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 mt-6 sm:mt-8 pb-32">
          {movies.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 sm:gap-5"
            >
              {movies.map((movie, i) => (
                <motion.div
                  key={`${movie.type}-${movie.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.025, 0.5) }}
                  className="w-full"
                >
                  <MovieCard movie={movie} posterMode={true} fluid={true} showInfo={true} hideBadges={true} />
                </motion.div>
              ))}
            </motion.div>
          ) : !loading ? (
            <div className="py-32 flex flex-col items-center justify-center text-center">
              <Film className="w-14 h-14 text-white/15 mb-4" />
              <p className="text-white/50 text-base font-medium">
                No titles found. Try switching between Movies and Series.
              </p>
            </div>
          ) : null}

          {/* Loading Skeleton */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6"
              >
                <LoadingSkeleton variant="row" count={2} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Infinite Scroll Sentinel */}
          <div ref={sentinelRef} className="h-16 w-full" />
        </div>
      </div>
    </motion.div>
  );
}

// ── Sub-component: Fluid Animated Aurora Transparency Background ───────────────
function ProviderAmbientBackground({
  glowColor,
  bgColor,
}: {
  glowColor: string;
  bgColor: string;
}) {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Dark organic base canvas */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #0c1017 0%, #060709 100%)',
        }}
      />

      {/* Aurora Wave 1: Flowing Northern Lights Curtain (Top Left -> Center) */}
      <div
        className="absolute -top-[10%] -left-[10%] w-[90vw] h-[85vh] rounded-[40%] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${glowColor} 0%, rgba(255,255,255,0.06) 35%, transparent 70%)`,
          filter: 'blur(90px)',
          opacity: 0.85,
          animation: 'aurora-drift-1 16s ease-in-out infinite alternate',
        }}
      />

      {/* Aurora Wave 2: Sweeping Luminous Ribbon (Mid Right -> Center) */}
      <div
        className="absolute top-[20%] -right-[15%] w-[85vw] h-[75vh] rounded-[45%] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${bgColor !== '#000000' ? bgColor : glowColor} 0%, ${glowColor} 40%, transparent 72%)`,
          filter: 'blur(100px)',
          opacity: 0.6,
          animation: 'aurora-drift-2 20s ease-in-out infinite alternate',
        }}
      />

      {/* Aurora Wave 3: Ambient Depth Stream (Lower screen glow) */}
      <div
        className="absolute bottom-[-10%] left-[15%] w-[80vw] h-[65vh] rounded-[50%] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${glowColor} 0%, transparent 65%)`,
          filter: 'blur(120px)',
          opacity: 0.4,
          animation: 'aurora-wave 14s ease-in-out infinite alternate',
        }}
      />

      {/* Aurora Plasma Highlight Band: Organic light streak */}
      <div
        className="absolute top-0 inset-x-0 h-[60vh] pointer-events-none opacity-40 mix-blend-screen"
        style={{
          background: `conic-gradient(from 180deg at 50% 20%, transparent 0deg, ${glowColor} 120deg, transparent 240deg)`,
          filter: 'blur(85px)',
          transform: 'scaleX(1.4)',
        }}
      />

      {/* Soft translucent sheen overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            'radial-gradient(circle at 50% 15%, transparent 35%, rgba(6,7,9,0.3) 70%, rgba(6,7,9,0.75) 100%)',
        }}
      />
    </div>
  );
}

// ── Sub-component: Clean Transparent Provider Page Top Navbar ─────────────────
function ProviderNavbar({ onBack }: { onBack: () => void }) {
  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
    >
      <div className="relative max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 pointer-events-auto">
        <div className="flex items-center h-14 sm:h-16 gap-2">
          {/* Clean Back Button */}
          <button
            onClick={onBack}
            aria-label="Go back"
            className="p-1.5 -ml-1.5 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition-all duration-200 shrink-0 cursor-pointer group active:scale-95"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform duration-150" />
          </button>

          {/* Logo next to arrow */}
          <Link
            to="/"
            aria-label="Xilfflix Home"
            className="flex-shrink-0 flex items-center hover:opacity-90 active:scale-95 transition-all duration-200 py-1"
          >
            <img
              src="/logo.png"
              alt="Xilfflix"
              className="h-7 sm:h-8 w-auto object-contain drop-shadow-md"
            />
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
