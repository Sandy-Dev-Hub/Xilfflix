import type { Server } from '@/types/movie';

/**
 * Builds the embed servers for a given TMDB ID.
 * Server 1: VidSync (Multi-Audio)
 * Server 2: Fmov (Download option)
 * Server 3: VidLink (Fast HD)
 * Server 4: Nxsha (Multi-Lang)
 * Server 5: VidSrc
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
      { name: 'Server 1 (Multi-Audio And Download Option)', status: 'online', sourceUrl: '' },
      { name: 'Server 2 (Download option)', status: 'online', sourceUrl: '' },
      { name: 'Server 3 (Fast HD)', status: 'online', sourceUrl: '' },
      { name: 'Server 4 (Multi-Lang)', status: 'online', sourceUrl: '' },
      { name: 'Server 5', status: 'online', sourceUrl: '' },
    ];
  }

  if (mediaType === 'movie') {
    let server1Url = `https://vidsync.pro/embed/movie/${tmdbId}`;
    let server2Url = `https://fmov.my/embed/movie/${tmdbId}?color=E50914`;
    let server3Url = `https://vidlink.pro/movie/${tmdbId}?primaryColor=E50914&autoplay=true`;
    let server4Url = `https://nxsha.space/embed/movie/${tmdbId}`;
    let server5Url = `https://vidsrc.wiki/embed/movie/${tmdbId}/`;
    let server2Status: 'online' | 'offline' = 'online';
    let server4Status: 'online' | 'offline' = 'online';
    
    // Custom overrides for specific movies if needed
    if (tmdbId === '37941') {
      server5Url = `https://vidsrc.wiki/embed/movie/37941`;
    } else if (tmdbId === '329135') {
      server5Url = `https://vidsrc.wiki/embed/movie/329135`;
    }

    return [
      {
        name: 'Server 1 (Multi-Audio)',
        status: 'online',
        sourceUrl: server1Url,
      },
      {
        name: 'Server 2 (Download option)',
        status: server2Status,
        sourceUrl: server2Url,
      },
      {
        name: 'Server 3 (Fast HD)',
        status: 'online',
        sourceUrl: server3Url,
      },
      {
        name: 'Server 4 (Multi-Lang)',
        status: server4Status,
        sourceUrl: server4Url,
      },
      {
        name: 'Server 5',
        status: 'online',
        sourceUrl: server5Url,
      },
    ];
  }

  // TV Series
  return [
    {
      name: 'Server 1 (Multi-Audio)',
      status: 'online',
      sourceUrl: `https://vidsync.pro/embed/tv/${tmdbId}/${season}/${episode}`,
    },
    {
      name: 'Server 2 (Download option)',
      status: 'online',
      sourceUrl: `https://fmov.my/embed/tv/${tmdbId}/${season}/${episode}?color=E50914&nextEpisode=true&episodeSelector=true`,
    },
    {
      name: 'Server 3 (Fast HD)',
      status: 'online',
      sourceUrl: `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=E50914&autoplay=true`,
    },
    {
      name: 'Server 4 (Multi-Lang)',
      status: 'online',
      sourceUrl: `https://nxsha.space/embed/tv/${tmdbId}/${season}/${episode}`,
    },
    {
      name: 'Server 5',
      status: 'online',
      sourceUrl: `https://vidsrc.wiki/embed/tv/${tmdbId}/${season}/${episode}/`,
    },
  ];
}
