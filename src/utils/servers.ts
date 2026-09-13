import type { Server } from '@/types/movie';

/**
 * Builds the embed servers for a given TMDB ID.
 * Server 1: Nxsha (Multi-Lang)
 * Server 2: FramexTV (2K)
 * Server 3: VidCore (4K / VidCore Player)
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
      { name: 'Server 1 (Multi-Lang)', status: 'online', sourceUrl: '' },
      { name: 'Server 2 (2k)', status: 'online', sourceUrl: '' },
      { name: 'Server 3 (VidCore)', status: 'online', sourceUrl: '' },
      { name: 'Server 4', status: 'online', sourceUrl: '' },
    ];
  }

  if (mediaType === 'movie') {
    let server1Url = `https://nxsha.space/embed/movie/${tmdbId}`;
    let server2Url = `https://framextv.tech/embed/${tmdbId}`;
    let server3Url = `https://vidcore.org/embed/movie/${tmdbId}?autoplay=true&theme=E50914`;
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
        name: 'Server 1 (Multi-Lang)',
        status: 'online',
        sourceUrl: server1Url,
      },
      {
        name: 'Server 2',
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
      name: 'Server 1 (Multi-Lang)',
      status: 'online',
      sourceUrl: `https://nxsha.space/embed/tv/${tmdbId}/${season}/${episode}`,
    },
    {
      name: 'Server 2',
      status: 'online',
      sourceUrl: `https://framextv.tech/embed/${tmdbId}/${season}/${episode}`,
    },
    {
      name: 'Server 3',
      status: 'online',
      sourceUrl: `https://vidcore.org/embed/tv/${tmdbId}/${season}/${episode}?autoplay=true&theme=E50914`,
    },
    {
      name: 'Server 4',
      status: 'online',
      sourceUrl: `https://vidsrc.wiki/embed/tv/${tmdbId}/${season}/${episode}/`,
    },
  ];
}
