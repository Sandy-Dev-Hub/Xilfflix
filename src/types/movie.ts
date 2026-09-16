export type MediaType = 'movie' | 'tv';

export interface Server {
  name: string;
  status: 'online' | 'offline';
  sourceUrl: string;
}

export interface SeasonInfo {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  posterPath?: string | null;
}

export interface EpisodeInfo {
  episodeNumber: number;
  name: string;
  overview: string;
  stillPath: string | null;
  airDate: string;
  runtime?: number;
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
  cast: { name: string; profilePic: string | null }[];
  director?: string;
  trailer?: string;
  servers: Server[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isNewRelease?: boolean;
  isTopRated?: boolean;
  // TV Series metadata
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  seasons?: SeasonInfo[];
  // Addendum fields
  tags?: string[];        // Mood tags derived from genres e.g. ["Tense", "Gritty", "Suspenseful"]
  topTenRank?: number;   // 1-10 for Top 10 rows
  region?: string;        // e.g. "US" for "Top 10 in US"
  similar?: Movie[];      // Similar movies suggestions
  badges?: string[];      // e.g. ["New Release", "Trending", "Top Rated"]
  originalLanguage?: string; // e.g. "ta", "te", "hi", "en", "ja", "ko"
  releaseDate?: string;
  budget?: number;
  revenue?: number;
  voteCount?: number;
  productionCompanies?: { name: string; logoPath: string | null }[];
}

export interface Notification {
  id: string;
  movieId?: string;
  headline: string;
  body: string;
  timestamp: number; // unix ms
  read: boolean;
  thumbnailUrl?: string;
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
    genres?: string[];
  };
}
