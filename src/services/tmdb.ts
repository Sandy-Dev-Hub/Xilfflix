import type { Movie } from '@/types/movie';
import { makeServers } from '@/utils/servers';

// ─── Genre mappings ───────────────────────────────────────────────────────────

const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10765: 'Sci-Fi & Fantasy',
  10768: 'War & Politics',
};

/** Mood tags derived from genre names — shown in the hover preview popup */
const GENRE_MOOD_TAGS: Record<string, string> = {
  'Action': 'Exciting',
  'Adventure': 'Epic',
  'Animation': 'Creative',
  'Comedy': 'Funny',
  'Crime': 'Gritty',
  'Documentary': 'Eye-opening',
  'Drama': 'Compelling',
  'Family': 'Wholesome',
  'Fantasy': 'Magical',
  'History': 'Captivating',
  'Horror': 'Chilling',
  'Music': 'Uplifting',
  'Mystery': 'Intriguing',
  'Romance': 'Heartfelt',
  'Sci-Fi': 'Futuristic',
  'Sci-Fi & Fantasy': 'Mind-bending',
  'Thriller': 'Tense',
  'War': 'Intense',
  'Western': 'Classic',
  'Action & Adventure': 'Thrilling',
  'War & Politics': 'Powerful',
};

// ─── In-memory page cache ─────────────────────────────────────────────────────
// Prevents re-fetching already-loaded pages when the user scrolls back and forth.
const pageCache = new Map<string, { movies: Movie[]; totalPages: number }>();

// ─── Helper utilities ─────────────────────────────────────────────────────────

function resolveGenres(genreIds?: number[], genres?: any[]): string[] {
  if (genres && genres.length > 0) {
    return genres.map((g) => g.name);
  }
  if (genreIds && genreIds.length > 0) {
    return genreIds.map((id) => GENRE_MAP[id] || 'Unknown').filter(Boolean);
  }
  return [];
}

function resolveAgeRating(item: any, type: 'movie' | 'tv'): string | undefined {
  if (type === 'movie' && item.release_dates?.results) {
    const usRelease = item.release_dates.results.find((r: any) => r.iso_3166_1 === 'US');
    if (usRelease && usRelease.release_dates.length > 0) {
      const certification = usRelease.release_dates.find((r: any) => r.certification)?.certification;
      if (certification) return certification;
    }
  } else if (type === 'tv' && item.content_ratings?.results) {
    const usRating = item.content_ratings.results.find((r: any) => r.iso_3166_1 === 'US');
    if (usRating?.rating) return usRating.rating;
  }
  return undefined; // Do not default — omit when unavailable
}

/**
 * Returns at most ONE badge string for a movie/show, following a strict
 * priority order so the data model stays honest: a card "has one badge".
 * Priority: New (just released) > Top Rated > Trending
 */
function deriveBadges(item: any): string[] {
  const releaseDate = item.release_date || item.first_air_date;
  if (releaseDate) {
    const daysOld = (Date.now() - new Date(releaseDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld < 45) return ['New'];
  }
  if ((item.vote_average ?? 0) >= 8.0 && (item.vote_count ?? 0) > 500) {
    return ['Top Rated'];
  }
  if ((item.popularity ?? 0) > 800) {
    return ['Trending'];
  }
  return [];
}

// ─── Normalizer ───────────────────────────────────────────────────────────────

export function normalizeTMDB(item: any, forceType?: 'movie' | 'tv'): Movie {
  const type = forceType || item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const yearStr = item.release_date || item.first_air_date || '';
  const year = yearStr ? parseInt(yearStr.split('-')[0]) : 0;

  const cast = item.credits?.cast?.slice(0, 5).map((c: any) => ({
    name: c.name,
    profilePic: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null,
  })) || [];
  const directorObj = item.credits?.crew?.find((c: any) => c.job === 'Director');
  const resolvedGenres = resolveGenres(item.genre_ids, item.genres);
  const tags = resolvedGenres
    .map((g) => GENRE_MOOD_TAGS[g])
    .filter(Boolean)
    .slice(0, 3) as string[];
  const badges = deriveBadges(item);

  // Resolve full-size image URLs with mutual fallback so no card ever has empty thumbnails:
  // poster falls back to backdrop if missing, and vice versa.
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : item.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
    : '';
  const backdropUrl = item.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
    : item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : '';

  return {
    id: String(item.id),
    title: item.title || item.name || 'Unknown',
    type,
    poster: posterUrl,
    backdrop: backdropUrl,
    description: item.overview || 'No description available.',
    rating: item.vote_average || 0,
    year,
    runtime: item.runtime || (item.episode_run_time && item.episode_run_time[0]) || 0,
    ageRating: resolveAgeRating(item, type),
    genres: resolvedGenres,
    cast,
    director: directorObj ? directorObj.name : undefined,
    servers: makeServers(String(item.id), type),
    tags,
    badges,
    region: 'US',
  };
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function fetchTMDB(path: string, params: Record<string, string> = {}) {
  const query = new URLSearchParams({ path, ...params });
  const url = `/api/tmdb?${query.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch TMDB data from ${path}`);
  }
  return response.json();
}

// ─── Public API endpoints ─────────────────────────────────────────────────────

export async function getTrending(timeWindow: 'day' | 'week' = 'day'): Promise<Movie[]> {
  const data = await fetchTMDB(`/trending/all/${timeWindow}`);
  return data.results.filter((i: any) => i.media_type !== 'person').map((item: any) => normalizeTMDB(item));
}

export async function getPopularMovies(): Promise<Movie[]> {
  const data = await fetchTMDB('/movie/popular');
  return data.results.map((item: any) => normalizeTMDB(item, 'movie'));
}

export async function getPopularTVShows(): Promise<Movie[]> {
  const data = await fetchTMDB('/tv/popular');
  return data.results.map((item: any) => normalizeTMDB(item, 'tv'));
}

export async function getNewReleases(): Promise<Movie[]> {
  const data = await fetchTMDB('/movie/now_playing');
  return data.results.map((item: any) => normalizeTMDB(item, 'movie'));
}

export async function getDiscoverMovies(genreId?: number, language?: string): Promise<Movie[]> {
  const params: Record<string, string> = {};
  if (genreId) params.with_genres = String(genreId);
  if (language) params.with_original_language = language;
  const data = await fetchTMDB('/discover/movie', params);
  return data.results.map((item: any) => normalizeTMDB(item, 'movie'));
}

export async function getDiscoverTV(genreId?: number, language?: string): Promise<Movie[]> {
  const params: Record<string, string> = {};
  if (genreId) params.with_genres = String(genreId);
  if (language) params.with_original_language = language;
  const data = await fetchTMDB('/discover/tv', params);
  return data.results.map((item: any) => normalizeTMDB(item, 'tv'));
}

/** Paginated discover for infinite-scroll rows. Results are cached in-memory. */
export async function getDiscoverMoviesPage(
  genreId: number | undefined,
  page: number,
  sortBy = 'popularity.desc',
  language?: string
): Promise<{ movies: Movie[]; totalPages: number }> {
  const cacheKey = `discover-movie-${genreId ?? 'all'}-${language ?? 'all'}-${page}-${sortBy}`;
  if (pageCache.has(cacheKey)) return pageCache.get(cacheKey)!;

  const params: Record<string, string> = { page: String(page), sort_by: sortBy };
  if (genreId) params.with_genres = String(genreId);
  if (language) params.with_original_language = language;
  const data = await fetchTMDB('/discover/movie', params);
  const result = {
    movies: data.results.map((item: any) => normalizeTMDB(item, 'movie')),
    totalPages: data.total_pages ?? 1,
  };
  pageCache.set(cacheKey, result);
  return result;
}

/** Paginated discover TV for infinite-scroll rows. Results are cached in-memory. */
export async function getDiscoverTVPage(
  genreId: number | undefined,
  page: number,
  sortBy = 'popularity.desc',
  language?: string
): Promise<{ movies: Movie[]; totalPages: number }> {
  const cacheKey = `discover-tv-${genreId ?? 'all'}-${language ?? 'all'}-${page}-${sortBy}`;
  if (pageCache.has(cacheKey)) return pageCache.get(cacheKey)!;

  const params: Record<string, string> = { page: String(page), sort_by: sortBy };
  if (genreId) params.with_genres = String(genreId);
  if (language) params.with_original_language = language;
  const data = await fetchTMDB('/discover/tv', params);
  const result = {
    movies: data.results.map((item: any) => normalizeTMDB(item, 'tv')),
    totalPages: data.total_pages ?? 1,
  };
  pageCache.set(cacheKey, result);
  return result;
}

/** Fetch top-rated content (movie or tv). Used for Top 10 row. Results cached. */
export async function getTopRated(
  type: 'movie' | 'tv' = 'movie',
  page = 1
): Promise<{ movies: Movie[]; totalPages: number }> {
  const cacheKey = `topRated-${type}-${page}`;
  if (pageCache.has(cacheKey)) return pageCache.get(cacheKey)!;

  const data = await fetchTMDB(`/${type}/top_rated`, { page: String(page) });
  const movies: Movie[] = data.results.slice(0, 10).map((item: any, idx: number) => ({
    ...normalizeTMDB(item, type),
    topTenRank: (page - 1) * 20 + idx + 1,
    // Exactly one badge: this IS the top-rated list, so always 'Top Rated'.
    // TopTenCard adds its own 'TOP 10' ribbon separately — it's not in badges[].
    badges: ['Top Rated'] as string[],
  }));
  const result = { movies, totalPages: data.total_pages ?? 1 };
  pageCache.set(cacheKey, result);
  return result;
}

export async function getMovieDetails(id: string, type: 'movie' | 'tv'): Promise<Movie> {
  const append = type === 'movie' ? 'credits,release_dates,similar' : 'credits,content_ratings,similar';
  const data = await fetchTMDB(`/${type}/${id}`, { append_to_response: append });
  return normalizeTMDB(data, type);
}

export async function searchContent(query: string): Promise<Movie[]> {
  if (!query) return [];
  const data = await fetchTMDB('/search/multi', { query });
  return data.results.filter((i: any) => i.media_type !== 'person').map((item: any) => normalizeTMDB(item));
}

/**
 * Universal paginated discover for RowPreset-driven rows.
 * Maps every RowPreset field to its corresponding TMDB query parameter.
 * Returns movies (or TV shows) normalized via normalizeTMDB with in-memory caching.
 */
export async function getPresetPage(
  preset: {
    mediaType: 'movie' | 'tv';
    genreIds?: number[];
    originCountry?: string;
    originalLanguage?: string;
    sortBy?: string;
    maxRuntime?: number;
    minReleaseDate?: string;
  },
  page: number
): Promise<{ movies: Movie[]; totalPages: number }> {
  const sortBy = preset.sortBy ?? 'popularity.desc';
  const cacheKey = `preset-${JSON.stringify(preset)}-${page}`;
  if (pageCache.has(cacheKey)) return pageCache.get(cacheKey)!;

  const params: Record<string, string> = { page: String(page), sort_by: sortBy };

  if (preset.genreIds && preset.genreIds.length > 0) {
    params.with_genres = preset.genreIds.join(',');
  }
  if (preset.originalLanguage) {
    params.with_original_language = preset.originalLanguage;
  }
  if (preset.originCountry) {
    params.with_origin_country = preset.originCountry;
  }
  if (preset.maxRuntime) {
    params['with_runtime.lte'] = String(preset.maxRuntime);
  }
  if (preset.minReleaseDate) {
    const field = preset.mediaType === 'tv' ? 'first_air_date.gte' : 'primary_release_date.gte';
    params[field] = preset.minReleaseDate;
  }
  // Require at least 10 votes to filter out obscure entries
  params['vote_count.gte'] = '10';

  const path = `/discover/${preset.mediaType}`;
  const data = await fetchTMDB(path, params);
  const result = {
    movies: (data.results ?? []).map((item: any) => normalizeTMDB(item, preset.mediaType)),
    totalPages: data.total_pages ?? 1,
  };
  pageCache.set(cacheKey, result);
  return result;
}

