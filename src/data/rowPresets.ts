/**
 * Home page row preset definitions.
 *
 * Each preset maps directly to a TMDB /discover/{mediaType} query via `getPresetPage`.
 * Adding or reordering rows here is all that's needed — no component edits required.
 *
 * Notes:
 * - `genreIds` are joined as AND unless using separate presets (TMDB treats comma as AND, pipe as OR).
 * - `originCountry` uses ISO 3166-1 alpha-2 codes. "International" rows use `originalLanguage` instead.
 * - `minReleaseDate` is computed at runtime by the Home page (60 days ago), not hardcoded here.
 * - "International Movies" is approximated as high-popularity non-English content via `with_original_language`
 *   exclusion being unavailable in TMDB; instead we pick the most common non-English languages.
 */

export interface RowPreset {
  title: string;
  mediaType: 'movie' | 'tv';
  genreIds?: number[];
  /** TMDB ISO 3166-1 origin country code */
  originCountry?: string;
  /** TMDB ISO 639-1 original language code */
  originalLanguage?: string;
  /** TMDB sort field, defaults to 'popularity.desc' */
  sortBy?: string;
  /** with_runtime.lte — for 90-minute films etc. */
  maxRuntime?: number;
  /**
   * ISO date string for primary_release_date.gte (movies) or first_air_date.gte (TV).
   * If set to the string 'RECENT_60', Home.tsx will substitute 60-days-ago at render time.
   */
  minReleaseDate?: string;
}

// TMDB Genre IDs (verified against /genre/movie/list and /genre/tv/list)
// Movies:  Action=28, Adventure=12, Animation=16, Comedy=35, Crime=80, Drama=18,
//          Family=10751, Fantasy=14, Horror=27, Mystery=9648, Romance=10749,
//          Sci-Fi=878, Thriller=53, Western=37
// TV:      Action & Adventure=10759, Sci-Fi & Fantasy=10765, Mystery=9648

export const homeRowPresets: RowPreset[] = [
  // 1. TV Action & Adventure
  { title: 'TV Action & Adventure', mediaType: 'tv', genreIds: [10759] },

  // 2. Malayalam Comedies
  { title: 'Malayalam Comedies', mediaType: 'movie', genreIds: [35], originalLanguage: 'ml' },

  // 3. English Movies
  { title: 'English Movies', mediaType: 'movie', originalLanguage: 'en' },

  // 4. New Movies — minReleaseDate replaced at runtime in Home.tsx with 60-days-ago
  {
    title: 'New Movies',
    mediaType: 'movie',
    sortBy: 'primary_release_date.desc',
    minReleaseDate: 'RECENT_60',
  },

  // 5. US TV Shows (Dubbed) — "(Dubbed)" is a display-only label; TMDB has no dub filter
  { title: 'US TV Shows (Dubbed)', mediaType: 'tv', originCountry: 'US' },

  // 6. Tamil Movies & TV — movie variant (TV Tamil added as separate if needed)
  { title: 'Tamil Movies & TV', mediaType: 'movie', originalLanguage: 'ta' },

  // 7. International Movies — Korean, Japanese, French, Spanish as proxy for "non-US/non-EN"
  //    TMDB doesn't support country exclusions, so we pick the largest non-English language tier.
  //    Korean cinema is extremely popular globally and a good proxy.
  { title: 'International Movies', mediaType: 'movie', originalLanguage: 'ko' },

  // 8. Inspiring Movies — Drama as closest genre (uplifting/inspiring isn't a TMDB genre)
  { title: 'Inspiring Movies', mediaType: 'movie', genreIds: [18], sortBy: 'vote_average.desc' },

  // 9. Crime Stories Set in India
  { title: 'Crime Stories Set in India', mediaType: 'movie', genreIds: [80], originCountry: 'IN' },

  // 10. Relentless Crime Dramas — Crime + Drama combined
  { title: 'Relentless Crime Dramas', mediaType: 'movie', genreIds: [80, 18] },

  // 11. Wrap Up Your Day With a Bang — Action + Adventure
  { title: 'Wrap Up Your Day With a Bang', mediaType: 'movie', genreIds: [28, 12] },

  // 12. Thriller With a Side of Action
  { title: 'Thriller With a Side of Action', mediaType: 'movie', genreIds: [53, 28] },

  // 13. Comedies
  { title: 'Comedies', mediaType: 'movie', genreIds: [35] },

  // 14. Crowd Pleasers — highest popularity across all genres
  { title: 'Crowd Pleasers', mediaType: 'movie', sortBy: 'popularity.desc' },

  // 15. TV Thrillers & Mysteries
  { title: 'TV Thrillers & Mysteries', mediaType: 'tv', genreIds: [9648] },

  // 16. Exciting Crime Movies — Crime by popularity
  { title: 'Exciting Crime Movies', mediaType: 'movie', genreIds: [80], sortBy: 'popularity.desc' },

  // 17. Violent Movies — Action + Crime, sorted by popularity
  { title: 'Violent Movies', mediaType: 'movie', genreIds: [28, 80] },

  // 18. TV Sci-Fi & Fantasy
  { title: 'TV Sci-Fi & Fantasy', mediaType: 'tv', genreIds: [10765] },

  // 19. Tamil Language Dramas
  { title: 'Tamil Language Dramas', mediaType: 'movie', genreIds: [18], originalLanguage: 'ta' },

  // 20. 90-Minute Films
  { title: '90-Minute Films', mediaType: 'movie', maxRuntime: 90 },

  // 21. Hollywood Movies — US origin, English language
  { title: 'Hollywood Movies', mediaType: 'movie', originCountry: 'US', originalLanguage: 'en' },
];
