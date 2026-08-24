import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Movie, Profile, WatchProgress } from '@/types/movie';

interface AppState {
  // My List
  myList: Movie[];
  addToList: (movie: Movie) => void;
  removeFromList: (id: string) => void;
  isInList: (id: string) => boolean;

  // Continue Watching
  continueWatching: Record<string, WatchProgress>;
  saveProgress: (id: string, progress: number, duration: number, movieMeta?: any) => void;
  getProgress: (id: string) => WatchProgress | undefined;
  clearProgress: (id: string) => void;

  // Profile
  profile: Profile;
  setProfile: (profile: Profile) => void;

  // Search overlay
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── My List ──────────────────────────────────────────────────────────
      myList: [],
      addToList: (movie) =>
        set((s) => ({
          myList: s.myList.find((m) => m.id === movie.id)
            ? s.myList
            : [...s.myList, movie],
        })),
      removeFromList: (id) =>
        set((s) => ({ myList: s.myList.filter((m) => m.id !== id) })),
      isInList: (id) => get().myList.some((m) => m.id === id),

      // ── Continue Watching ─────────────────────────────────────────────────
      continueWatching: {},
      saveProgress: (id, progress, duration, movieMeta) => {
        if (duration <= 0) return;
        set((s) => ({
          continueWatching: {
            ...s.continueWatching,
            [id]: { 
              progress, 
              duration, 
              lastWatched: Date.now(),
              ...(movieMeta ? { movieMeta } : {}),
            },
          },
        }));
      },
      getProgress: (id) => get().continueWatching[id],
      clearProgress: (id) =>
        set((s) => {
          const next = { ...s.continueWatching };
          delete next[id];
          return { continueWatching: next };
        }),

      // ── Profile ───────────────────────────────────────────────────────────
      profile: { name: 'Guest', avatarColor: '#E50914' },
      setProfile: (profile) => set({ profile }),

      // ── Search ────────────────────────────────────────────────────────────
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
    }),
    {
      name: 'xilfflix-state',
      partialize: (state) => ({
        myList: state.myList,
        continueWatching: state.continueWatching,
        profile: state.profile,
      }),
    }
  )
);
