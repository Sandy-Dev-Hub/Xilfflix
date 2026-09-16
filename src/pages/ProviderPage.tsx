import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Film,
  Tv,
  Search,
} from 'lucide-react';
import { PROVIDERS_LIST } from '@/data/providers';
import type { Movie } from '@/types/movie';
import { getProviderContentPage } from '@/services/tmdb';
import MovieCard from '@/components/MovieCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { useAppStore } from '@/store/useAppStore';

const TMDB_LOGO_BASE = 'https://image.tmdb.org/t/p/w154';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0 },
};

export default function ProviderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setSearchOpen } = useAppStore();

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
      style={{ backgroundColor: '#050505' }}
    >
      {/* ── Blurry Ambient Background ──────────────────────────────────────── */}
      <ProviderAmbientBackground glowColor={provider.glowColor} bgColor={provider.bgColor} />

      {/* ── Top Navigation Bar ─────────────────────────────────────────────── */}
      <ProviderNavbar onBack={() => navigate(-1)} onSearch={() => setSearchOpen(true)} />

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 pt-20 sm:pt-24">
        {/* ── Provider Brand Header ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="px-4 sm:px-8 lg:px-14 pt-6 pb-2"
        >
          {/* Logo + Name row */}
          <div className="flex items-center gap-5 sm:gap-7 mb-3">
            {/* Provider icon */}
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-[22px] sm:rounded-[26px] overflow-hidden shrink-0 shadow-lg"
              style={{
                backgroundColor: provider.bgColor,
              }}
            >
              <img
                src={`${TMDB_LOGO_BASE}${provider.logoPath}`}
                alt={provider.name}
                className="w-full h-full object-cover"
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

          {/* ── Filter Capsule ── */}
          <div className="mt-5 flex flex-wrap items-center gap-3 sm:gap-4 border-t border-white/10 pt-5">
            {/* Movies / Series glass capsule — mirrors floating navbar style */}
            <nav
              aria-label="Content type"
              className="relative flex items-center justify-between bg-black/40 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.12)] rounded-full p-1.5 border border-white/15 overflow-hidden select-none"
            >
              {/* Top glass reflection highlight */}
              <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

              {(
                [
                  { key: 'movie' as const, label: 'Movies', icon: Film },
                  { key: 'tv' as const, label: 'Series', icon: Tv },
                ] as { key: 'movie' | 'tv'; label: string; icon: React.ElementType }[]
              ).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setMediaType(key)}
                  aria-pressed={mediaType === key}
                  className={`relative flex items-center gap-1 px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                    mediaType === key ? 'text-white' : 'text-white/60 hover:text-white/90'
                  }`}
                >
                  {/* Active capsule indicator */}
                  {mediaType === key && (
                    <motion.div
                      layoutId="providerTabCapsule"
                      className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-md border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.3)]"
                      transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1 sm:gap-1.5">
                    <Icon size={13} className={mediaType === key ? 'text-white scale-110' : 'text-white/60'} />
                    {label}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* ── Content Grid ─────────────────────────────────────────────────── */}
        <div className="px-4 sm:px-8 lg:px-14 mt-8 pb-24">
          {movies.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5"
            >
              {movies.map((movie, i) => (
                <motion.div
                  key={`${movie.type}-${movie.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.025, 0.5) }}
                  className="w-full"
                >
                  <MovieCard movie={movie} posterMode={true} fluid={true} />
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

// ── Sub-component: Animated Blurry Ambient Background ──────────────────────────
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
      {/* Deep base layer */}
      <div className="absolute inset-0" style={{ backgroundColor: '#050505' }} />

      {/* Primary brand glow – top-left aurora blob */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute -top-20 -left-20 w-[70vw] h-[70vh] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${glowColor} 0%, transparent 70%)`,
          filter: 'blur(80px)',
          opacity: 0.75,
        }}
      />

      {/* Secondary accent glow – bottom-right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
        className="absolute bottom-0 right-0 w-[60vw] h-[50vh] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${glowColor} 0%, transparent 70%)`,
          filter: 'blur(100px)',
          opacity: 0.45,
        }}
      />

      {/* Subtle bg-color tint layer – mid-screen */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, delay: 0.3 }}
        className="absolute top-1/4 left-1/3 w-[50vw] h-[50vh] rounded-full pointer-events-none"
        style={{
          backgroundColor: bgColor,
          filter: 'blur(140px)',
          opacity: 0.08,
        }}
      />

      {/* Silky moving shimmer overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.012) 50%, transparent 100%)',
        }}
      />

      {/* Dark vignette – keeps text readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, transparent 40%, rgba(5,5,5,0.55) 100%)',
        }}
      />

      {/* Bottom fade-to-dark so grid content is readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent 30%, rgba(5,5,5,0.4) 60%, rgba(5,5,5,0.85) 100%)',
        }}
      />
    </div>
  );
}

// ── Sub-component: Provider Page Top Navbar ─────────────────────────────────
function ProviderNavbar({
  onBack,
  onSearch,
}: {
  onBack: () => void;
  onSearch: () => void;
}) {

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(5,5,5,0.80) 0%, rgba(5,5,5,0.40) 75%, transparent 100%)',
          backdropFilter: 'blur(0px)',
        }}
      />
      <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
        <div className="flex items-center h-16 sm:h-20 gap-4 sm:gap-6">
          {/* Back Button */}
          <button
            onClick={onBack}
            aria-label="Go back"
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 hover:border-white/35 text-white/80 hover:text-white transition-all duration-200 backdrop-blur-md shrink-0 cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150" />
            <span className="text-sm font-semibold hidden sm:inline">Back</span>
          </button>

          {/* Logo */}
          <Link
            to="/"
            aria-label="Xilfflix Home"
            className="flex-shrink-0 flex items-center hover:scale-105 active:scale-95 transition-transform duration-200 py-1"
          >
            <img
              src="/logo.png"
              alt="Xilfflix"
              className="h-8 sm:h-10 w-auto object-contain drop-shadow-xl"
            />
          </Link>

          {/* Right — Search */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onSearch}
              aria-label="Search"
              className="p-2.5 rounded-full bg-black/35 hover:bg-black/60 border border-white/10 hover:border-white/25 text-white/75 hover:text-white backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
