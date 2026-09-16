import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play,
  Plus,
  Check,
  ArrowLeft,
  Star,
  Users,
  Share2,
  Heart,
  Search,
} from 'lucide-react';
import { getMovieDetails, getMovieLogo } from '@/services/tmdb';
import { useTMDB } from '@/hooks/useTMDB';
import { useAppStore } from '@/store/useAppStore';
import MovieRow from '@/components/MovieRow';
import Footer from '@/components/Footer';
import NotFound from '@/components/NotFound';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import AmbientBackground from '@/components/AmbientBackground';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0 },
};

export default function MovieDetails({ type }: { type: 'movie' | 'tv' }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToList, removeFromList, isInList, setSearchOpen } = useAppStore();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [readMore, setReadMore] = useState(false);
  const [liked, setLiked] = useState(false);

  const { data: movie, loading, error } = useTMDB(() => {
    if (!id) return Promise.reject(new Error('No ID'));
    return getMovieDetails(id, type);
  }, [id, type]);

  // Fetch official title logo
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    getMovieLogo(id, type)
      .then((url) => {
        if (mounted) setLogoUrl(url);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [id, type]);

  if (error) return <NotFound />;
  if (loading || !movie) {
    return (
      <div className="pt-20 bg-[#111419] min-h-screen">
        <LoadingSkeleton variant="hero" />
      </div>
    );
  }

  const inList = isInList(movie.id);

  const toggleList = () => {
    if (inList) removeFromList(movie.id);
    else addToList(movie);
  };

  const formatRuntime = (min: number) => {
    if (!min) return null;
    const hours = Math.floor(min / 60);
    const minutes = min % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  };

  const getEndTime = (min: number) => {
    if (!min) return null;
    const end = new Date(Date.now() + min * 60000);
    return end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount || amount <= 0) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatReleaseDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const runtimeFormatted = formatRuntime(movie.runtime);
  const endTime = getEndTime(movie.runtime);
  const languageCode = (movie.originalLanguage || 'en').toUpperCase();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          text: movie.description,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen text-white relative selection:bg-white/20 selection:text-white bg-transparent"
    >
      {/* ── Fixed Aurora Atmospheric Wash Layer ────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: -1, backgroundColor: '#14171d' }}
        aria-hidden="true"
      >
        {movie.backdrop && (
          <img
            src={movie.backdrop || movie.poster}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-top"
            style={{
              filter: 'blur(90px) saturate(1.8) brightness(0.85)',
              transform: 'scale(1.35)',
              opacity: 0.85,
            }}
          />
        )}
        {/* Soft subtle tint wash that preserves the luminous poster aura across the whole screen */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(15,18,23,0.15) 0%, rgba(15,18,23,0.1) 45%, rgba(15,18,23,0.4) 80%, rgba(15,18,23,0.65) 100%)',
          }}
        />
      </div>

      {/* ── Top Navigation Bar ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 pointer-events-auto">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Left: Back button + Logo */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition-all duration-200 shrink-0 cursor-pointer group active:scale-95"
              >
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform duration-150" />
              </button>

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

            {/* Right: Pill Navigation Bar */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center p-1 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <Link
                  to="/"
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-white/70 hover:text-white transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/movies"
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    type === 'movie'
                      ? 'bg-white text-zinc-950 font-bold shadow-sm'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Movies
                </Link>
                <Link
                  to="/tv-shows"
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    type === 'tv'
                      ? 'bg-white text-zinc-950 font-bold shadow-sm'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Shows
                </Link>
                <Link
                  to="/my-list"
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-white/70 hover:text-white transition-colors"
                >
                  My List
                </Link>
              </div>

              {/* Search button (desktop/tablet only, mobile has search in bottom bar) */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="hidden sm:flex p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile View (< lg) ─────────────────────────────────────────────── */}
      <div className="lg:hidden w-full relative z-10">

        {/* 1. Backdrop image — seamlessly dissolves into background */}
        <div className="relative w-full overflow-hidden" style={{ height: '58vh', minHeight: '380px' }}>
          {/* Actual backdrop image with smooth alpha mask */}
          {movie.backdrop ? (
            <div
              className="absolute inset-0"
              style={{
                WebkitMaskImage:
                  'linear-gradient(to bottom, black 0%, black 40%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0.2) 88%, transparent 100%)',
                maskImage:
                  'linear-gradient(to bottom, black 0%, black 40%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0.2) 88%, transparent 100%)',
              }}
            >
              <img
                src={movie.backdrop}
                alt={movie.title}
                className="w-full h-full object-cover object-top"
                style={{ filter: 'brightness(0.92) contrast(1.02)' }}
                loading="eager"
              />
            </div>
          ) : null}

          {/* Transparent gradient overlay: top vignette for nav contrast and subtle dark behind title only */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 20%, transparent 45%, rgba(0,0,0,0.45) 75%, transparent 100%)',
            }}
          />

          {/* Title + Genres pinned to the bottom of the image */}
          <div className="absolute bottom-2 left-0 right-0 px-4 pb-2 flex flex-col items-center gap-1.5 z-10">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={movie.title}
                className="max-h-16 max-w-[75%] object-contain object-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] mx-auto"
              />
            ) : (
              <h1 className="text-[2rem] font-black tracking-tight text-white uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] leading-tight text-center">
                {movie.title}
              </h1>
            )}

            {movie.genres && movie.genres.length > 0 && (
              <p className="text-[13px] font-semibold text-white/85 drop-shadow flex items-center justify-center gap-2 flex-wrap">
                {movie.genres.slice(0, 3).map((g, idx) => (
                  <span key={g} className="flex items-center gap-2">
                    {idx > 0 && <span className="text-white/40">•</span>}
                    <span>{g}</span>
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>

        {/* 2. Content below image */}
        <div className="relative z-10 w-full px-4 pt-2 pb-6 flex flex-col gap-3.5">
          {/* Action Buttons row (Centered): [ (Like / Heart) ]  [ ▶ Play ]  [ (Share) ] */}
          <div className="flex items-center justify-center gap-3.5 flex-nowrap pt-2">
            {/* Left: Like button (saves to My List) */}
            <button
              onClick={toggleList}
              aria-label={inList ? 'Remove from My List' : 'Add to My List'}
              className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shrink-0 ${
                inList
                  ? 'bg-red-500/20 text-red-500 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                  : 'bg-white/10 border-white/15 text-white hover:bg-white/15'
              }`}
              id={`details-like-mobile-${movie.id}`}
              title={inList ? 'In My List' : 'Like & Add to My List'}
            >
              <Heart
                size={18}
                className={inList ? 'fill-red-500 text-red-500' : 'text-white'}
              />
            </button>

            {/* Center: Play button */}
            <button
              onClick={() => navigate(`/watch/${movie.type}/${movie.id}`)}
              className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-full bg-white text-zinc-950 font-bold text-sm hover:bg-white/90 transition-all duration-200 shadow-md active:scale-95 cursor-pointer shrink-0"
              id={`details-play-mobile-${movie.id}`}
            >
              <Play size={16} fill="currentColor" className="text-zinc-950" />
              <span>Play</span>
            </button>

            {/* Right: Share button */}
            <button
              onClick={handleShare}
              aria-label="Share"
              className="w-11 h-11 rounded-full bg-white/10 border border-white/15 hover:bg-white/15 flex items-center justify-center text-white transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
              title="Share"
            >
              <Share2 size={18} />
            </button>
          </div>

          {/* Metadata: Year  Runtime  [Rating]  ★Score (Centered with clean spacing) */}
          <div className="flex items-center justify-center gap-3 text-[13px] font-medium text-white/90 flex-wrap pt-1 pb-1">
            {movie.year > 0 && <span>{movie.year}</span>}
            {runtimeFormatted && <span>{runtimeFormatted}</span>}
            {movie.ageRating && (
              <span className="border border-white/40 px-1.5 py-0.5 rounded text-[11px] font-semibold text-white/90">
                {movie.ageRating}
              </span>
            )}
            {movie.rating > 0 && (
              <div className="flex items-center gap-1 text-white font-semibold">
                <Star size={13} fill="#EAB308" className="text-yellow-400" />
                <span>{Number(movie.rating).toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Director */}
          {movie.director && (
            <p className="text-[13px] text-white/60">
              <span className="text-white/45">Director: </span>
              <span className="text-white font-semibold">{movie.director}</span>
            </p>
          )}

          {/* Synopsis */}
          <div className="flex flex-col gap-1">
            <p
              className={`text-[13px] text-white/75 leading-relaxed ${
                !readMore ? 'line-clamp-3' : ''
              }`}
            >
              {movie.description}
            </p>
            {movie.description && movie.description.length > 160 && (
              <button
                onClick={() => setReadMore(!readMore)}
                className="text-[13px] font-semibold text-white/45 hover:text-white cursor-pointer self-start"
              >
                {readMore ? 'Read Less' : 'Read More'}
              </button>
            )}
          </div>

          {/* Frosted Glass Stats Card */}
          <div
            className="relative overflow-hidden w-full rounded-2xl p-4 space-y-3 text-xs select-none mt-2 backdrop-blur-2xl bg-white/[0.04] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.37)]"
          >
            {/* Top glass reflection highlight */}
            <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="text-zinc-400 font-medium">Runtime</span>
              <span className="text-white font-semibold">
                {runtimeFormatted || '—'}
                {endTime ? <span className="text-zinc-400 ml-1.5 font-normal">• ends {endTime}</span> : ''}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
              <span className="text-zinc-400 font-medium">Language</span>
              <span className="text-white font-semibold">{languageCode}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
              <span className="text-zinc-400 font-medium">Release Date</span>
              <span className="text-white font-semibold">{formatReleaseDate(movie.releaseDate)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
              <span className="text-zinc-400 font-medium">Budget</span>
              <span className="text-white font-semibold">{formatCurrency(movie.budget)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
              <span className="text-zinc-400 font-medium">Revenue</span>
              <span className="text-white font-semibold">{formatCurrency(movie.revenue)}</span>
            </div>
          </div>

          {/* Studio & Production Logos (Mobile) */}
          {movie.productionCompanies && movie.productionCompanies.length > 0 && (
            <div className="flex items-center justify-center gap-5 flex-wrap w-full pt-2">
              {movie.productionCompanies.slice(0, 3).map((comp) =>
                comp.logoPath ? (
                  <img
                    key={comp.name}
                    src={comp.logoPath}
                    alt={comp.name}
                    className="h-5 sm:h-6 w-auto object-contain brightness-0 invert opacity-75 hover:opacity-100 transition-opacity drop-shadow-md"
                    title={comp.name}
                  />
                ) : (
                  <span
                    key={comp.name}
                    className="text-[11px] font-bold uppercase tracking-wider text-white/50"
                  >
                    {comp.name}
                  </span>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop View (lg+) ──────────────────────────────────────────────── */}
      <div className="hidden lg:flex relative w-full min-h-[92vh] items-end overflow-hidden pb-12 pt-28">
        {/* Full-bleed Backdrop Image with soft bottom alpha mask dissolving into aurora */}
        <div className="absolute inset-0 z-0">
          {movie.backdrop ? (
            <div
              className="absolute inset-0"
              style={{
                WebkitMaskImage:
                  'linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,0.7) 78%, rgba(0,0,0,0.2) 95%, transparent 100%)',
                maskImage:
                  'linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,0.7) 78%, rgba(0,0,0,0.2) 95%, transparent 100%)',
              }}
            >
              <img
                src={movie.backdrop}
                alt={movie.title}
                className="w-full h-full object-cover object-center"
                style={{ filter: 'brightness(0.95) contrast(1.02)' }}
                loading="eager"
              />
              {/* Subtle left vignette for title readability */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 35%, transparent 70%)',
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full bg-[#14171d]" />
          )}
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-8 lg:px-12">
          <div className="grid grid-cols-12 gap-12 items-end">
            {/* ── Left Column: Title, Genres, Actions, Overview ─────────────── */}
            <div className="col-span-8 space-y-5 flex flex-col items-start text-left">
              {/* Title / Logo */}
              <div className="space-y-2 flex flex-col items-start w-full">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={movie.title}
                    className="max-h-28 md:max-h-36 max-w-[85%] object-contain object-left drop-shadow-[0_8px_24px_rgba(0,0,0,0.85)]"
                  />
                ) : (
                  <h1 className="text-6xl md:text-7xl font-black tracking-tight text-white uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] leading-none font-display">
                    {movie.title}
                  </h1>
                )}

                {/* Genres row */}
                {movie.genres && movie.genres.length > 0 && (
                  <p className="text-base font-semibold text-white/80 drop-shadow flex items-center justify-start gap-2 flex-wrap">
                    {movie.genres.map((g, idx) => (
                      <span key={g} className="flex items-center gap-2">
                        {idx > 0 && <span className="text-white/40">•</span>}
                        <span>{g}</span>
                      </span>
                    ))}
                  </p>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-start gap-4 flex-wrap pt-1 w-full">
                <button
                  onClick={() => navigate(`/watch/${movie.type}/${movie.id}`)}
                  className="px-8 py-3 rounded-full bg-white text-zinc-950 font-bold text-base flex items-center gap-2 hover:bg-white/90 transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                  id={`details-play-desktop-${movie.id}`}
                >
                  <Play size={18} fill="currentColor" className="text-zinc-950" />
                  <span>Play</span>
                </button>

                <button
                  onClick={toggleList}
                  aria-label={inList ? 'Remove from My List' : 'Add to My List'}
                  className={`w-12 h-12 rounded-full border backdrop-blur-xl flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-lg ${
                    inList
                      ? 'bg-white/30 text-white border-white/50'
                      : 'bg-black/40 hover:bg-black/60 border-white/20 text-white'
                  }`}
                  id={`details-list-desktop-${movie.id}`}
                  title={inList ? 'In My List' : 'Add to My List'}
                >
                  {inList ? <Check size={19} /> : <Plus size={20} />}
                </button>

                <button
                  onClick={() =>
                    navigate('/movie-party', {
                      state: {
                        createFor: {
                          movieId: movie.id,
                          movieType: movie.type,
                          movieTitle: movie.title,
                          moviePoster: movie.poster || '',
                        },
                      },
                    })
                  }
                  aria-label="Watch Party"
                  className="w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-xl flex items-center justify-center text-white transition-all duration-200 active:scale-95 cursor-pointer shadow-lg"
                  title="Watch Party"
                >
                  <Users size={19} />
                </button>

                <button
                  onClick={handleShare}
                  aria-label="Share"
                  className="w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-xl flex items-center justify-center text-white transition-all duration-200 active:scale-95 cursor-pointer shadow-lg"
                  title="Share"
                >
                  <Share2 size={18} />
                </button>
              </div>

              {/* Metadata row */}
              <div className="flex items-center justify-start gap-4 text-sm font-medium text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] flex-wrap pt-1">
                {movie.year > 0 && <span>{movie.year}</span>}
                {runtimeFormatted && <span>{runtimeFormatted}</span>}
                {movie.ageRating && (
                  <span className="border border-white/35 px-1.5 py-0.5 rounded text-[11px] font-semibold text-white/95 bg-black/40 backdrop-blur-sm">
                    {movie.ageRating}
                  </span>
                )}
                {movie.rating > 0 && (
                  <div className="flex items-center gap-1 text-white font-semibold">
                    <Star size={13} fill="#EAB308" className="text-yellow-400" />
                    <span>{movie.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Director */}
              {movie.director && (
                <p className="text-sm text-white/90 font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                  <span className="text-white/50">Director: </span>
                  <span className="text-white font-semibold">{movie.director}</span>
                </p>
              )}

              {/* Synopsis */}
              <div className="max-w-2xl text-left w-full">
                <p
                  className={`text-base text-white/80 leading-relaxed font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] ${
                    !readMore ? 'line-clamp-3' : ''
                  }`}
                >
                  {movie.description}
                </p>
                {movie.description && movie.description.length > 160 && (
                  <button
                    onClick={() => setReadMore(!readMore)}
                    className="mt-1 text-xs font-semibold text-white hover:text-white/80 underline cursor-pointer drop-shadow-md"
                  >
                    {readMore ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </div>
            </div>

            {/* ── Right Column: Frosted Glass Stats Card (Desktop) ─────────── */}
            <div className="col-span-4 w-full flex flex-col items-end justify-end space-y-4">
              <div
                className="relative overflow-hidden w-full max-w-sm rounded-2xl p-6 space-y-3.5 text-sm select-none transition-all duration-300 shadow-[0_20px_45px_rgba(0,0,0,0.5)]"
                style={{
                  background: 'rgba(15, 18, 24, 0.72)',
                  backdropFilter: 'blur(36px)',
                  WebkitBackdropFilter: 'blur(36px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                {/* Top glass reflection highlight */}
                <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

                {/* Runtime */}
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-medium">Runtime</span>
                  <span className="text-white font-bold tracking-tight">
                    {runtimeFormatted || '—'}
                    {endTime ? <span className="text-zinc-400 ml-1.5 font-normal">• Ends {endTime}</span> : ''}
                  </span>
                </div>

                {/* Language */}
                <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
                  <span className="text-zinc-300 font-medium">Language</span>
                  <span className="text-white font-bold tracking-tight">{languageCode}</span>
                </div>

                {/* Release Date */}
                <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
                  <span className="text-zinc-300 font-medium">Release Date</span>
                  <span className="text-white font-bold tracking-tight">{formatReleaseDate(movie.releaseDate)}</span>
                </div>

                {/* Budget */}
                <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
                  <span className="text-zinc-300 font-medium">Budget</span>
                  <span className="text-white font-bold tracking-tight">{formatCurrency(movie.budget)}</span>
                </div>

                {/* Revenue */}
                <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
                  <span className="text-zinc-300 font-medium">Revenue</span>
                  <span className="text-white font-bold tracking-tight">{formatCurrency(movie.revenue)}</span>
                </div>
              </div>

              {/* Studio & Production Logos */}
              {movie.productionCompanies && movie.productionCompanies.length > 0 && (
                <div className="hidden lg:flex items-center justify-center gap-5 flex-wrap w-full max-w-sm pt-2">
                  {movie.productionCompanies.slice(0, 3).map((comp) =>
                    comp.logoPath ? (
                      <img
                        key={comp.name}
                        src={comp.logoPath}
                        alt={comp.name}
                        className="h-6 sm:h-7 w-auto object-contain brightness-0 invert opacity-75 hover:opacity-100 transition-opacity drop-shadow-md"
                        title={comp.name}
                      />
                    ) : (
                      <span
                        key={comp.name}
                        className="text-[11px] font-bold uppercase tracking-wider text-white/50"
                      >
                        {comp.name}
                      </span>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Below Hero: Cast Section (With flowing aurora atmosphere) ──────── */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 mt-6 sm:mt-10 pb-16">
        {movie.cast && movie.cast.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <h2 className="text-white font-display font-bold text-lg sm:text-xl tracking-tight">
              Cast
            </h2>
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide py-2">
              {movie.cast.map((actor, i) => (
                <div key={actor.name} className="flex flex-col items-center gap-2 w-20 sm:w-24 shrink-0 group">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shadow-lg border border-white/10 bg-white/5 backdrop-blur-md group-hover:border-white/30 transition-all duration-200">
                    {actor.profilePic ? (
                      <img
                        src={actor.profilePic}
                        alt={actor.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                        style={{
                          background: `hsl(${(i * 53 + 12) % 360}, 55%, 35%)`,
                        }}
                      >
                        {actor.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-white/80 text-xs text-center leading-tight line-clamp-2 font-medium">
                    {actor.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Similar Movies / Recommendations ─────────────────────────────── */}
        {movie.similar && movie.similar.length > 0 && (
          <div className="mt-12 sm:mt-16 -mx-4 sm:-mx-8 lg:-mx-12">
            <MovieRow
              title="More Like This"
              movies={movie.similar.slice(0, 20)}
              variant="standard"
            />
          </div>
        )}
      </div>

      <Footer />
    </motion.div>
  );
}
