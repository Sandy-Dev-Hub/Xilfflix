import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useOutsideClick } from '@/hooks/useOutsideClick';

export interface GenreOption {
  id: number | string;
  label: string;
  /** 'genre' maps to TMDB with_genres; 'language' maps to with_original_language */
  paramType: 'genre' | 'language';
}

const GENRE_COLUMNS: { heading: string; options: GenreOption[] }[] = [
  {
    heading: 'By Language',
    options: [
      { id: 'en', label: 'English', paramType: 'language' },
      { id: 'hi', label: 'Hindi', paramType: 'language' },
      { id: 'ta', label: 'Tamil', paramType: 'language' },
      { id: 'te', label: 'Telugu', paramType: 'language' },
      { id: 'ml', label: 'Malayalam', paramType: 'language' },
      { id: 'all', label: 'International', paramType: 'language' },
    ],
  },
  {
    heading: 'By Theme',
    options: [
      { id: 28, label: 'Action', paramType: 'genre' },
      { id: 35, label: 'Comedy', paramType: 'genre' },
      { id: 18, label: 'Drama', paramType: 'genre' },
      { id: 27, label: 'Horror', paramType: 'genre' },
      { id: 10749, label: 'Romance', paramType: 'genre' },
      { id: 878, label: 'Sci-Fi', paramType: 'genre' },
      { id: 53, label: 'Thriller', paramType: 'genre' },
    ],
  },
  {
    heading: 'By Category',
    options: [
      { id: 16, label: 'Animation', paramType: 'genre' },
      { id: 80, label: 'Crime', paramType: 'genre' },
      { id: 99, label: 'Documentary', paramType: 'genre' },
      { id: 10751, label: 'Family', paramType: 'genre' },
      { id: 9648, label: 'Mystery', paramType: 'genre' },
      { id: 12, label: 'Adventure', paramType: 'genre' },
    ],
  },
];

interface GenreDropdownProps {
  selected?: GenreOption | null;
  onSelect: (option: GenreOption | null) => void;
}

export default function GenreDropdown({ selected, onSelect }: GenreDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideClick(containerRef, () => setOpen(false));

  const handleSelect = (opt: GenreOption) => {
    onSelect(selected?.id === opt.id ? null : opt); // toggle off if same
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger pill */}
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200
          ${selected
            ? 'bg-white text-black border-white'
            : 'bg-transparent border-white/30 text-white hover:border-white/60'
          }`}
      >
        {selected ? selected.label : 'Genres'}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} />
        </motion.span>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute top-full mt-2 left-0 z-50 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl shadow-black/60 p-4 min-w-[480px] max-w-[calc(100vw-32px)]"
          >
            {selected && (
              <button
                onClick={() => { onSelect(null); setOpen(false); }}
                className="text-xf-red text-xs hover:underline mb-3 block"
              >
                ✕ Clear filter: {selected.label}
              </button>
            )}

            <div className="grid grid-cols-3 gap-6">
              {GENRE_COLUMNS.map((col) => (
                <div key={col.heading}>
                  <p className="text-xf-subtle text-[11px] font-semibold uppercase tracking-wider mb-2">
                    {col.heading}
                  </p>
                  <ul className="space-y-0.5">
                    {col.options.map((opt) => (
                      <li key={String(opt.id)}>
                        <button
                          onClick={() => handleSelect(opt)}
                          className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors duration-150
                            ${selected?.id === opt.id
                              ? 'text-white bg-white/10 font-medium'
                              : 'text-xf-muted hover:text-white hover:bg-white/5'
                            }`}
                        >
                          {opt.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
