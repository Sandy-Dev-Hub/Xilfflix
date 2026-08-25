import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Movie, Notification, Profile, WatchProgress } from '@/types/movie';
import { STATIC_NOTIFICATIONS } from '@/data/notifications';

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

  // Notifications
  notifications: Notification[];
  unreadCount: () => number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  seedDynamicNotifications: (movies: Movie[]) => void;
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

      // ── Notifications ─────────────────────────────────────────────────────
      notifications: STATIC_NOTIFICATIONS,
      unreadCount: () => get().notifications.filter((n) => !n.read).length,
      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      // Called once when TMDB new-release data loads — injects dynamic notifications
      seedDynamicNotifications: (movies) => {
        set((s) => {
          const existingIds = new Set(s.notifications.map((n) => n.id));
          const dynamic: Notification[] = movies.slice(0, 3).map((m) => ({
            id: `notif-newrelease-${m.id}`,
            movieId: m.id,
            headline: `Now Available: ${m.title}`,
            body: `${m.genres.slice(0, 2).join(' · ')} · ${m.year}. Just added to Xilfflix.`,
            timestamp: Date.now() - Math.random() * 1000 * 60 * 60, // within last hour
            read: false,
            thumbnailUrl: m.poster || undefined,
          })).filter((n) => !existingIds.has(n.id));

          if (dynamic.length === 0) return {};
          return {
            notifications: [...dynamic, ...s.notifications].sort(
              (a, b) => b.timestamp - a.timestamp
            ),
          };
        });
      },
    }),
    {
      name: 'xilfflix-state',
      partialize: (state) => ({
        myList: state.myList,
        continueWatching: state.continueWatching,
        profile: state.profile,
        notifications: state.notifications,
      }),
    }
  )
);
