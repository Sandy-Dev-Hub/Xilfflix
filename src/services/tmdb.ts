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

  const cast = item.credits?.cast?.slice(0, 10).map((c: any) => ({
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
  const recData = item.recommendations?.results?.length > 0 ? item.recommendations.results : item.similar?.results;
  const similar = recData?.map((s: any) => normalizeTMDB(s, type)) || [];

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

  const seasons: any[] = (item.seasons || [])
    .filter((s: any) => s.season_number > 0)
    .map((s: any) => ({
      seasonNumber: s.season_number,
      name: s.name || `Season ${s.season_number}`,
      episodeCount: s.episode_count || 1,
      posterPath: s.poster_path ? `https://image.tmdb.org/t/p/w300${s.poster_path}` : null,
    }));

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
    numberOfSeasons: item.number_of_seasons ?? (seasons.length > 0 ? seasons.length : undefined),
    numberOfEpisodes: item.number_of_episodes,
    seasons: seasons.length > 0 ? seasons : undefined,
    tags,
    badges,
    region: 'US',
    similar,
    originalLanguage: item.original_language || item.original_language_code || 'en',
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

export function resolveLanguageCode(lang?: string): string | undefined {
  if (!lang) return undefined;
  if (lang === 'all' || lang === 'international') {
    return 'ko|ja|es|fr|zh|de|it';
  }
  return lang;
}

const MOVIE_TO_TV_GENRE_MAP: Record<number, string> = {
  28: '10759',        // Action -> Action & Adventure
  12: '10759',        // Adventure -> Action & Adventure
  878: '10765',       // Sci-Fi -> Sci-Fi & Fantasy
  14: '10765',        // Fantasy -> Sci-Fi & Fantasy
  53: '9648|80',      // Thriller -> Mystery | Crime (Thrillers)
  27: '9648|10765',   // Horror -> Mystery | Supernatural / Sci-Fi Horror
  10749: '18|35',     // Romance -> Drama | Comedy Romance
  10752: '10768',     // War -> War & Politics
};

export function resolveTVGenreId(genreId?: number | string): string | undefined {
  if (!genreId) return undefined;
  const num = typeof genreId === 'number' ? genreId : parseInt(genreId, 10);
  if (!isNaN(num) && MOVIE_TO_TV_GENRE_MAP[num]) {
    return MOVIE_TO_TV_GENRE_MAP[num];
  }
  return String(genreId);
}

export async function getDiscoverMovies(genreId?: number | string, language?: string): Promise<Movie[]> {
  const params: Record<string, string> = {};
  if (genreId) params.with_genres = String(genreId);
  const lang = resolveLanguageCode(language);
  if (lang) params.with_original_language = lang;
  const data = await fetchTMDB('/discover/movie', params);
  return data.results.map((item: any) => normalizeTMDB(item, 'movie'));
}

export async function getDiscoverTV(genreId?: number | string, language?: string): Promise<Movie[]> {
  const params: Record<string, string> = {};
  const resolved = resolveTVGenreId(genreId);
  if (resolved) params.with_genres = resolved;
  const lang = resolveLanguageCode(language);
  if (lang) params.with_original_language = lang;
  const data = await fetchTMDB('/discover/tv', params);
  return data.results.map((item: any) => normalizeTMDB(item, 'tv'));
}

/** Paginated discover for infinite-scroll rows. Results are cached in-memory. */
export async function getDiscoverMoviesPage(
  genreId: number | string | undefined,
  page: number,
  sortBy = 'popularity.desc',
  language?: string
): Promise<{ movies: Movie[]; totalPages: number }> {
  const lang = resolveLanguageCode(language);
  const cacheKey = `discover-movie-${genreId ?? 'all'}-${lang ?? 'all'}-${page}-${sortBy}`;
  if (pageCache.has(cacheKey)) return pageCache.get(cacheKey)!;

  const params: Record<string, string> = { page: String(page), sort_by: sortBy };
  if (genreId) params.with_genres = String(genreId);
  if (lang) params.with_original_language = lang;
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
  genreId: number | string | undefined,
  page: number,
  sortBy = 'popularity.desc',
  language?: string
): Promise<{ movies: Movie[]; totalPages: number }> {
  const resolved = resolveTVGenreId(genreId);
  const lang = resolveLanguageCode(language);
  const cacheKey = `discover-tv-${resolved ?? 'all'}-${lang ?? 'all'}-${page}-${sortBy}`;
  if (pageCache.has(cacheKey)) return pageCache.get(cacheKey)!;

  const params: Record<string, string> = { page: String(page), sort_by: sortBy };
  if (resolved) params.with_genres = resolved;
  if (lang) params.with_original_language = lang;
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

  // Use discover with sort by popularity to get real-time trending global movies/shows
  // instead of the static all-time global top 10.
  const data = await fetchTMDB(`/discover/${type}`, {
    sort_by: 'popularity.desc',
    page: String(page)
  });

  const movies: Movie[] = data.results.slice(0, 10).map((item: any, idx: number) => ({
    ...normalizeTMDB(item, type),
    topTenRank: (page - 1) * 20 + idx + 1,
    // Exactly one badge: this IS the top-rated list, so always 'Top Rated'.
    // TopTenCard adds its own 'TOP 10' ribbon separately — it's not in badges[].
    badges: ['Top 10'] as string[],
  }));
  const result = { movies, totalPages: data.total_pages ?? 1 };
  pageCache.set(cacheKey, result);
  return result;
}

export async function getMovieDetails(id: string, type: 'movie' | 'tv'): Promise<Movie> {
  const append = type === 'movie' ? 'credits,release_dates,similar,recommendations' : 'credits,content_ratings,similar,recommendations';
  const data = await fetchTMDB(`/${type}/${id}`, { append_to_response: append });
  return normalizeTMDB(data, type);
}

export async function getTVSeason(tvId: string, seasonNumber: number): Promise<any[]> {
  try {
    const data = await fetchTMDB(`/tv/${tvId}/season/${seasonNumber}`);
    if (!data.episodes) return [];
    return data.episodes.map((ep: any) => ({
      episodeNumber: ep.episode_number,
      name: ep.name || `Episode ${ep.episode_number}`,
      overview: ep.overview || '',
      stillPath: ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : null,
      airDate: ep.air_date || '',
      runtime: ep.runtime,
    }));
  } catch (e) {
    console.error(`Failed to fetch season ${seasonNumber} for tv ${tvId}:`, e);
    return [];
  }
}

export async function getMovieLogo(id: string, type: 'movie' | 'tv'): Promise<string | null> {
  try {
    // Fetch all images without language restriction to ensure we don't miss foreign logos
    const data = await fetchTMDB(`/${type}/${id}/images`);
    const logos = data.logos || [];
    if (logos.length > 0) {
      // Prioritize English, then language-agnostic (null), then fallback to whatever is available
      const logo = logos.find((l: any) => l.iso_639_1 === 'en') || 
                   logos.find((l: any) => l.iso_639_1 === null) || 
                   logos[0];
      if (logo?.file_path) {
        return `https://image.tmdb.org/t/p/w500${logo.file_path}`;
      }
    }
  } catch (e) {
    console.error('Failed to fetch movie logo:', e);
  }
  return null;
}

// ─── Trailer video cache & fetcher ───────────────────────────────────────────
const trailerCache = new Map<string, string | null>();

const LANG_KEYWORDS: Record<string, string[]> = {
  ta: ['tamil', 'ta'],
  te: ['telugu', 'te'],
  hi: ['hindi', 'hi', 'bollywood'],
  ml: ['malayalam', 'ml'],
  kn: ['kannada', 'kn'],
  ja: ['japanese', 'japan', 'ja', 'anime'],
  ko: ['korean', 'korea', 'ko'],
  es: ['spanish', 'es', 'español'],
  fr: ['french', 'fr', 'français'],
  de: ['german', 'de', 'deutsch'],
  it: ['italian', 'it', 'italiano'],
  zh: ['chinese', 'mandarin', 'cantonese', 'zh'],
  en: ['english', 'en'],
};

export async function getMovieTrailer(
  id: string,
  type: 'movie' | 'tv',
  originalLanguage?: string
): Promise<string | null> {
  const targetLang = originalLanguage?.toLowerCase().trim() || '';
  const cacheKey = `trailer-${type}-${id}-${targetLang || 'any'}`;
  if (trailerCache.has(cacheKey)) return trailerCache.get(cacheKey)!;

  try {
    let rawVideos: any[] = [];

    // Step 1: Multi-language video query
    try {
      const langList = targetLang && targetLang !== 'en'
        ? `${targetLang},ta,te,hi,ml,kn,ja,ko,es,fr,de,it,zh,en,null`
        : 'en,null,ta,te,hi,ml,kn,ja,ko,es,fr,de,it,zh';

      const data = await fetchTMDB(`/${type}/${id}/videos`, {
        include_video_language: langList,
      });
      if (data?.results && Array.isArray(data.results)) {
        rawVideos.push(...data.results);
      }
    } catch {}

    // Step 2: Unfiltered videos fallback if empty
    if (rawVideos.length === 0) {
      try {
        const data = await fetchTMDB(`/${type}/${id}/videos`);
        if (data?.results && Array.isArray(data.results)) {
          rawVideos.push(...data.results);
        }
      } catch {}
    }

    // Step 3: TV show season videos fallback
    if (rawVideos.length === 0 && type === 'tv') {
      try {
        const s1 = await fetchTMDB(`/tv/${id}/season/1/videos`);
        if (s1?.results && Array.isArray(s1.results)) {
          rawVideos.push(...s1.results);
        }
      } catch {}
    }

    // Step 4: Details append_to_response fallback
    if (rawVideos.length === 0) {
      try {
        const details = await fetchTMDB(`/${type}/${id}`, { append_to_response: 'videos' });
        if (details?.videos?.results && Array.isArray(details.videos.results)) {
          rawVideos.push(...details.videos.results);
        }
      } catch {}
    }

    // Filter valid YouTube videos
    const ytVideos = rawVideos.filter((v: any) => v && v.site === 'YouTube' && typeof v.key === 'string' && v.key.trim().length > 0);
    if (ytVideos.length === 0) {
      trailerCache.set(cacheKey, null);
      return null;
    }

    // Score videos according to native language relevance and trailer type
    const keywords = targetLang ? (LANG_KEYWORDS[targetLang] || [targetLang]) : [];

    const scored = ytVideos.map((v: any) => {
      let score = 0;
      const name = (v.name || '').toLowerCase();
      const vLang = (v.iso_639_1 || '').toLowerCase();
      const vType = (v.type || '').toLowerCase();

      const isTargetLang = targetLang && (
        vLang === targetLang ||
        keywords.some(kw => kw && name.includes(kw))
      );

      // Target language bonus
      if (targetLang && targetLang !== 'en') {
        if (isTargetLang) score += 150;
        else if (vLang === 'en' || !vLang) score += 30; // secondary English fallback
      } else {
        if (vLang === 'en' || !vLang) score += 50;
      }

      // Video type priority
      if (vType === 'trailer' || name.includes('trailer')) score += 70;
      else if (vType === 'teaser' || name.includes('teaser') || name.includes('glimpse') || name.includes('promo')) score += 45;
      else if (vType === 'clip' || name.includes('clip') || name.includes('sneak peek') || name.includes('scene')) score += 25;
      else if (vType === 'featurette') score += 15;
      else score += 10;

      // Official trailer bonus
      if (v.official) score += 30;

      return { key: v.key, score };
    });

    // Sort highest score first
    scored.sort((a, b) => b.score - a.score);

    const bestKey = scored[0]?.key || null;
    trailerCache.set(cacheKey, bestKey);
    return bestKey;
  } catch (e) {
    console.error(`Failed to fetch trailer for ${type} ${id}:`, e);
    trailerCache.set(cacheKey, null);
    return null;
  }
}

export async function searchContent(rawQuery: string): Promise<Movie[]> {
  const query = rawQuery?.trim();
  if (!query) return [];

  // Helper to title-case words (e.g. "stranger things" -> "Stranger Things")
  const toTitleCase = (str: string) =>
    str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());

  try {
    // 1. Fetch search/multi with query
    const data = await fetchTMDB('/search/multi', { query });
    let rawItems = (data.results || []).filter((i: any) => i.media_type !== 'person');

    // 2. If no results or very few results, try title-cased query as fallback
    const titleCased = toTitleCase(query);
    if (rawItems.length === 0 && query !== titleCased) {
      try {
        const fallbackData = await fetchTMDB('/search/multi', { query: titleCased });
        rawItems = (fallbackData.results || []).filter((i: any) => i.media_type !== 'person');
      } catch {}
    }

    // 3. Direct movie & tv search fallback if still empty
    if (rawItems.length === 0) {
      try {
        const [movieRes, tvRes] = await Promise.allSettled([
          fetchTMDB('/search/movie', { query }),
          fetchTMDB('/search/tv', { query }),
        ]);
        const movieItems = movieRes.status === 'fulfilled' ? (movieRes.value.results || []).map((m: any) => ({ ...m, media_type: 'movie' })) : [];
        const tvItems = tvRes.status === 'fulfilled' ? (tvRes.value.results || []).map((t: any) => ({ ...t, media_type: 'tv' })) : [];
        rawItems = [...movieItems, ...tvItems];
      } catch {}
    }

    // Deduplicate by ID and media type
    const seen = new Set<string>();
    const uniqueItems: any[] = [];
    for (const item of rawItems) {
      const key = `${item.media_type || (item.first_air_date ? 'tv' : 'movie')}-${item.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueItems.push(item);
      }
    }

    const normalized = uniqueItems.map((item: any) => normalizeTMDB(item));
    const qLower = query.toLowerCase();

    // Case-insensitive relevance sorting
    return normalized.sort((a, b) => {
      const aTitle = (a.title || '').toLowerCase();
      const bTitle = (b.title || '').toLowerCase();

      // 1. Exact match (case-insensitive)
      const aExact = aTitle === qLower ? 1 : 0;
      const bExact = bTitle === qLower ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;

      // 2. Starts with query (case-insensitive)
      const aStarts = aTitle.startsWith(qLower) ? 1 : 0;
      const bStarts = bTitle.startsWith(qLower) ? 1 : 0;
      if (aStarts !== bStarts) return bStarts - aStarts;

      // 3. Includes query (case-insensitive)
      const aContains = aTitle.includes(qLower) ? 1 : 0;
      const bContains = bTitle.includes(qLower) ? 1 : 0;
      if (aContains !== bContains) return bContains - aContains;

      // 4. Sort by popularity / rating
      return (b.rating || 0) - (a.rating || 0);
    });
  } catch (err) {
    console.error('Search error:', err);
    return [];
  }
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

