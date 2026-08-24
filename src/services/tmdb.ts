import type { Movie } from '@/types/movie';
import { makeServers } from '@/utils/servers';

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
  return undefined; // Do not default to PG-13 per user instructions
}

export function normalizeTMDB(item: any, forceType?: 'movie' | 'tv'): Movie {
  const type = forceType || item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const yearStr = item.release_date || item.first_air_date || '';
  const year = yearStr ? parseInt(yearStr.split('-')[0]) : 0;
  
  const cast = item.credits?.cast?.map((c: any) => c.name).slice(0, 5) || [];
  const directorObj = item.credits?.crew?.find((c: any) => c.job === 'Director');
  
  return {
    id: String(item.id),
    title: item.title || item.name || 'Unknown',
    type,
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
    backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : '',
    description: item.overview || 'No description available.',
    rating: item.vote_average || 0,
    year,
    runtime: item.runtime || (item.episode_run_time && item.episode_run_time[0]) || 0,
    ageRating: resolveAgeRating(item, type),
    genres: resolveGenres(item.genre_ids, item.genres),
    cast,
    director: directorObj ? directorObj.name : undefined,
    servers: makeServers(),
  };
}

async function fetchTMDB(path: string, params: Record<string, string> = {}) {
  const query = new URLSearchParams({ path, ...params });
  const url = `/api/tmdb?${query.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch TMDB data from ${path}`);
  }
  return response.json();
}

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

export async function getDiscoverMovies(genreId?: number): Promise<Movie[]> {
  const params: Record<string, string> = {};
  if (genreId) params.with_genres = String(genreId);
  const data = await fetchTMDB('/discover/movie', params);
  return data.results.map((item: any) => normalizeTMDB(item, 'movie'));
}

export async function getDiscoverTV(genreId?: number): Promise<Movie[]> {
  const params: Record<string, string> = {};
  if (genreId) params.with_genres = String(genreId);
  const data = await fetchTMDB('/discover/tv', params);
  return data.results.map((item: any) => normalizeTMDB(item, 'tv'));
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
