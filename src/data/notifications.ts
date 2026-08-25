import type { Notification } from '@/types/movie';

// Static baseline notifications. Dynamic "New Release: ..." notifications
// are prepended at runtime by useAppStore when fresh TMDB data is seeded.
export const STATIC_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-welcome',
    headline: 'Welcome to Xilfflix!',
    body: 'Your personalized streaming experience starts here. Add titles to your list and we\'ll remember where you left off.',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7,
    read: false,
    thumbnailUrl: undefined,
  },
  {
    id: 'notif-picks',
    headline: 'New picks based on your watching',
    body: 'We\'ve curated fresh titles we think you\'ll love. Check out the "Trending Now" row on your homepage.',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
    read: false,
    thumbnailUrl: undefined,
  },
  {
    id: 'notif-topten',
    headline: 'Top 10 just updated',
    body: 'The Top 10 list has been refreshed — see what\'s trending in the US today.',
    timestamp: Date.now() - 1000 * 60 * 60 * 12,
    read: false,
    thumbnailUrl: undefined,
  },
  {
    id: 'notif-mylist',
    headline: 'Continue where you left off',
    body: 'You have titles saved to your list. Ready to pick up where you stopped?',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    read: true,
    thumbnailUrl: undefined,
  },
];
