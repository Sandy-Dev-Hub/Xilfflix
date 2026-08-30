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
      { name: 'Server 1 (Multi-Lang)', status: 'online', sourceUrl: '' },
      { name: 'Server 2 (4K)', status: 'online', sourceUrl: '' },
      { name: 'Server 3', status: 'online', sourceUrl: '' },
    ];
  }

  if (mediaType === 'movie') {
    let server1Url = `https://nxsha.space/embed/movie/${tmdbId}`;
    let server2Url = `https://vidsrc.sbs/embed/movie/${tmdbId}`;
    let server3Url = `https://vidsrc.wiki/embed/movie/${tmdbId}/`;
    let server2Status: 'online' | 'offline' = 'online';
    
    // Custom overrides for specific movies
    if (tmdbId === '37941') {
      server3Url = `https://vidsrc.wiki/embed/movie/37941`;
      server2Status = 'offline'; // vidsrc.sbs plays wrong film for this ID
    } else if (tmdbId === '329135') {
      server3Url = `https://vidsrc.wiki/embed/movie/329135`;
    }

    return [
      {
        name: 'Server 1 (Multi-Lang)',
        status: 'online',
        sourceUrl: server1Url,
      },
      {
        name: 'Server 2 (4K)',
        status: server2Status,
        sourceUrl: server2Url,
      },
      {
        name: 'Server 3',
        status: 'online',
        sourceUrl: server3Url,
      },
    ];
  }

  // TV Series
  return [
    {
      name: 'Server 1 (Multi-Lang)',
      status: 'online',
      sourceUrl: `https://nxsha.space/embed/tv/${tmdbId}/${season}/${episode}`,
    },
    {
      name: 'Server 2 (4K)',
      status: 'online',
      sourceUrl: `https://vidsrc.sbs/embed/tv/${tmdbId}/${season}/${episode}`,
    },
    {
      name: 'Server 3',
      status: 'online',
      sourceUrl: `https://vidsrc.wiki/embed/tv/${tmdbId}/${season}/${episode}/`,
    },
  ];
}
