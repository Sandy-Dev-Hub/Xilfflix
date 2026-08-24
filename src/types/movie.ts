export type MediaType = 'movie' | 'tv';

export interface Server {
  name: string;
  status: 'online' | 'offline';
  sourceUrl: string;
}

export interface Movie {
  id: string;
  title: string;
  type: MediaType;
  poster: string;
  backdrop: string;
  description: string;
  rating: number;
  year: number;
  runtime: number; // minutes for movies, minutes per episode for TV
  ageRating?: string;
  genres: string[];
  cast: string[];
  director?: string;
  trailer?: string;
  servers: Server[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isNewRelease?: boolean;
  isTopRated?: boolean;
}

export interface Profile {
  name: string;
  avatarColor: string;
}

export interface WatchProgress {
  progress: number;   // seconds watched
  duration: number;   // total seconds
  lastWatched: number; // timestamp
  movieMeta?: {       // Added for async TMDB support so ContinueWatching doesn't need to fetch
    id: string;
    title: string;
    type: MediaType;
    poster: string;
  };
}
