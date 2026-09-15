import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PROVIDERS_LIST, type ProviderItem } from '@/data/providers';
import ProviderModal from './ProviderModal';

const TMDB_LOGO_BASE = 'https://image.tmdb.org/t/p/w154';

// Proximity detection zone from row edges
const EDGE_ZONE = 110;

interface ProviderRowProps {
  className?: string;
  title?: string;
}

export default function ProviderRow({
  className = '',
  title = 'Browse by Provider',
}: ProviderRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderItem | null>(null);

  /* ── Check scroll boundaries ── */
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isAtStart = el.scrollLeft <= 10;
    const isAtEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 10;
    setCanScrollLeft(!isAtStart);
    setCanScrollRight(!isAtEnd);
    if (isAtStart) setShowLeft(false);
    if (isAtEnd) setShowRight(false);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = 0;
    }
    updateScrollState();
    if (!el) return;
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScrollState]);

  /* ── Mouse proximity ── */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    const row = rowRef.current;
    if (!row || !el) return;

    const isAtStart = el.scrollLeft <= 10;
    const isAtEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 10;
    const { left, width } = row.getBoundingClientRect();
    const x = e.clientX - left;

    setShowLeft(!isAtStart && x <= EDGE_ZONE);
    setShowRight(!isAtEnd && x >= width - EDGE_ZONE);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowLeft(false);
    setShowRight(false);
  }, []);

  /* ── Scroll action ── */
  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    const target = dir === 'right'
      ? el.scrollLeft + scrollAmount
      : Math.max(0, el.scrollLeft - scrollAmount);

    el.scrollTo({ left: target, behavior: 'smooth' });
    setTimeout(updateScrollState, 450);
  }, [updateScrollState]);

  return (
    <>
      <div className={`relative select-none ${className}`}>

        {/* Title — flush with standard site padding */}
        <h2 className="px-4 sm:px-8 lg:px-12 mb-3.5 text-white font-display font-bold text-lg sm:text-xl tracking-tight">
          {title}
        </h2>

        {/* ── Row Container ── */}
        <div
          ref={rowRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative"
        >
          {/* ────────── LEFT ARROW (Centered on the icon tiles) ────────── */}
          <AnimatePresence>
            {showLeft && canScrollLeft && (
              <motion.button
                key="left-arrow"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={() => scroll('left')}
                aria-label="Scroll left"
                className="
                  absolute left-2 sm:left-4 top-[36px] sm:top-[42px] md:top-[46px] -translate-y-1/2 z-30
                  w-8 h-8 sm:w-10 sm:h-10
                  flex items-center justify-center
                  cursor-pointer bg-transparent border-0 outline-none
                  text-white hover:scale-120 active:scale-90
                  transition-transform duration-150
                "
              >
                <ChevronLeft
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-white"
                  style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.95)) drop-shadow(0 0 3px rgba(0,0,0,0.9))' }}
                  strokeWidth={2.8}
                />
              </motion.button>
            )}
          </AnimatePresence>

          {/* ────────── RIGHT ARROW (Centered on the icon tiles) ────────── */}
          <AnimatePresence>
            {showRight && canScrollRight && (
              <motion.button
                key="right-arrow"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={() => scroll('right')}
                aria-label="Scroll right"
                className="
                  absolute right-2 sm:right-4 top-[36px] sm:top-[42px] md:top-[46px] -translate-y-1/2 z-30
                  w-8 h-8 sm:w-10 sm:h-10
                  flex items-center justify-center
                  cursor-pointer bg-transparent border-0 outline-none
                  text-white hover:scale-120 active:scale-90
                  transition-transform duration-150
                "
              >
                <ChevronRight
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-white"
                  style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.95)) drop-shadow(0 0 3px rgba(0,0,0,0.9))' }}
                  strokeWidth={2.8}
                />
              </motion.button>
            )}
          </AnimatePresence>

          {/* ────────── Scrollable cards (First item starts exactly flush beneath heading) ────────── */}
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex items-start gap-6 sm:gap-7 md:gap-8 overflow-x-auto scrollbar-hide py-2 scroll-smooth"
          >
            {PROVIDERS_LIST.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.02 }}
                onClick={() => setSelectedProvider(provider)}
                className={`flex flex-col items-center flex-shrink-0 cursor-pointer group/card w-[72px] sm:w-[84px] md:w-[92px] ${
                  index === 0 ? 'ml-4 sm:ml-8 lg:ml-12' : ''
                } ${index === PROVIDERS_LIST.length - 1 ? 'mr-4 sm:mr-8 lg:mr-12' : ''}`}
              >
                {/* Icon tile */}
                <div
                  className="relative w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] md:w-[92px] md:h-[92px] rounded-[18px] sm:rounded-[22px] md:rounded-[24px] overflow-hidden transition-all duration-300 ease-out group-hover/card:scale-105 group-hover/card:-translate-y-1"
                  style={{
                    backgroundColor: provider.bgColor,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
                  }}
                >
                  <img
                    src={`${TMDB_LOGO_BASE}${provider.logoPath}`}
                    alt={provider.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.style.display = 'none';
                      const parent = el.parentElement;
                      if (parent && !parent.querySelector('.logo-fallback')) {
                        const fallback = document.createElement('div');
                        fallback.className =
                          'logo-fallback w-full h-full flex items-center justify-center text-white font-black text-xl';
                        fallback.textContent = provider.name.slice(0, 2).toUpperCase();
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                  {/* Subtle glass sheen */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/15 pointer-events-none" />
                </div>

                {/* Label */}
                <span className="mt-2.5 text-[11px] sm:text-xs text-[#a3a3a3] group-hover/card:text-white transition-colors duration-200 text-center leading-tight line-clamp-2 w-full px-0.5 font-medium">
                  {provider.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Provider Catalog Modal */}
      <ProviderModal
        provider={selectedProvider}
        onClose={() => setSelectedProvider(null)}
      />
    </>
  );
}
