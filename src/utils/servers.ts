import type { Server } from '@/types/movie';

/**
 * Builds the embed servers for a given TMDB ID.
 * Server 1: VidLink (Fast HD)
 * Server 2: Nxsha (Multi-Lang)
 * Server 3: Fmov
 * Server 4: VidSrc
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
      { name: 'Server 2 (Multi-Lang)', status: 'online', sourceUrl: '' },
      { name: 'Server 3', status: 'online', sourceUrl: '' },
      { name: 'Server 4', status: 'online', sourceUrl: '' },
    ];
  }

  if (mediaType === 'movie') {
    let server1Url = `https://vidlink.pro/movie/${tmdbId}?primaryColor=E50914&autoplay=true`;
    let server2Url = `https://nxsha.space/embed/movie/${tmdbId}`;
    let server3Url = `https://fmov.my/embed/movie/${tmdbId}?color=E50914`;
    let server4Url = `https://vidsrc.wiki/embed/movie/${tmdbId}/`;
    let server2Status: 'online' | 'offline' = 'online';
    let server3Status: 'online' | 'offline' = 'online';
    
    // Custom overrides for specific movies if needed
    if (tmdbId === '37941') {
      server4Url = `https://vidsrc.wiki/embed/movie/37941`;
    } else if (tmdbId === '329135') {
      server4Url = `https://vidsrc.wiki/embed/movie/329135`;
    }

    return [
      {
        name: 'Server 1',
        status: 'online',
        sourceUrl: server1Url,
      },
      {
        name: 'Server 2 (Multi-Lang)',
        status: server2Status,
        sourceUrl: server2Url,
      },
      {
        name: 'Server 3',
        status: server3Status,
        sourceUrl: server3Url,
      },
      {
        name: 'Server 4',
        status: 'online',
        sourceUrl: server4Url,
      },
    ];
  }

  // TV Series
  return [
    {
      name: 'Server 1',
      status: 'online',
      sourceUrl: `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=E50914&autoplay=true`,
    },
    {
      name: 'Server 2 (Multi-Lang)',
      status: 'online',
      sourceUrl: `https://nxsha.space/embed/tv/${tmdbId}/${season}/${episode}`,
    },
    {
      name: 'Server 3',
      status: 'online',
      sourceUrl: `https://fmov.my/embed/tv/${tmdbId}/${season}/${episode}?color=E50914&nextEpisode=true&episodeSelector=true`,
    },
    {
      name: 'Server 4',
      status: 'online',
      sourceUrl: `https://vidsrc.wiki/embed/tv/${tmdbId}/${season}/${episode}/`,
    },
  ];
}
