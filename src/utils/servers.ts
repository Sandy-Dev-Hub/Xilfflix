import type { Server } from '@/types/movie';

/**
 * Builds the two real embed servers for a given TMDB ID.
 * For movies: vidsrc.wiki and vidsrc.sbs movie embed URLs.
 * For TV: vidsrc.wiki and vidsrc.sbs TV embed URLs (season/episode appended at Watch time).
 */
export function makeServers(
  tmdbId?: string,
  mediaType: 'movie' | 'tv' = 'movie',
  season = 1,
  episode = 1
): Server[] {
  if (!tmdbId) {
    // Fallback while ID is not yet known (e.g. before TMDB fetch completes)
    return [
      { name: 'Server 1', status: 'online', sourceUrl: '' },
      { name: 'Server 2', status: 'online', sourceUrl: '' },
    ];
  }

  if (mediaType === 'movie') {
    return [
      {
        name: 'Server 1',
        status: 'online',
        sourceUrl: tmdbId === '37941' 
          ? `https://vidsrc.wiki/embed/movie/37941` 
          : `https://v1.vidsrc.wiki/embed/movie/${tmdbId}/`,
      },
      {
        name: 'Server 2',
        status: 'online',
        sourceUrl: `https://vidsrc.sbs/embed/movie/${tmdbId}`,
      },
    ];
  }

  // TV Series
  return [
    {
      name: 'Server 1',
      status: 'online',
      sourceUrl: `https://v1.vidsrc.wiki/embed/tv/${tmdbId}/${season}/${episode}/`,
    },
    {
      name: 'Server 2',
      status: 'online',
      sourceUrl: `https://vidsrc.sbs/embed/tv/${tmdbId}/${season}/${episode}`,
    },
  ];
}
