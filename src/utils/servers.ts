import type { Server } from '@/types/movie';

/**
 * Builds the embed servers for a given TMDB ID.
 * Server 1: Fmov (Download option)
 * Server 2: AutoEmbed (HD)
 * Server 3: VidLink (Fast HD)
 * Server 4: Nxsha (Multi-Audio)
 * Server 5: VidLove
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
      { name: 'Server 1 (Download option)', status: 'online', sourceUrl: '' },
      { name: 'Server 2 (HD)', status: 'online', sourceUrl: '' },
      { name: 'Server 3 (Fast HD)', status: 'online', sourceUrl: '' },
      { name: 'Server 4 (Multi-Audio)', status: 'online', sourceUrl: '' },
      { name: 'Server 5', status: 'online', sourceUrl: '' },
    ];
  }

  if (mediaType === 'movie') {
    let server1Url = `https://fmov.my/embed/movie/${tmdbId}?color=E50914`;
    let server2Url = `https://autoembed.sbs/embed/movie/${tmdbId}/`;
    let server3Url = `https://vidlink.pro/movie/${tmdbId}?primaryColor=E50914&autoplay=true`;
    let server4Url = `https://nxsha.space/embed/movie/${tmdbId}`;
    let server5Url = `https://player.vidlove.cc/embed/movie/${tmdbId}`;
    let server1Status: 'online' | 'offline' = 'online';
    let server4Status: 'online' | 'offline' = 'online';

    return [
      {
        name: 'Server 1 (Download option)',
        status: server1Status,
        sourceUrl: server1Url,
      },
      {
        name: 'Server 2 (HD)',
        status: 'online',
        sourceUrl: server2Url,
      },
      {
        name: 'Server 3 (Fast HD)',
        status: 'online',
        sourceUrl: server3Url,
      },
      {
        name: 'Server 4 (Multi-Audio)',
        status: server4Status,
        sourceUrl: server4Url,
      },
      {
        name: 'Server 5 (VidLove)',
        status: 'online',
        sourceUrl: server5Url,
      },
    ];
  }

  // TV Series
  return [
    {
      name: 'Server 1 (Download option)',
      status: 'online',
      sourceUrl: `https://fmov.my/embed/tv/${tmdbId}/${season}/${episode}?color=E50914&nextEpisode=true&episodeSelector=true`,
    },
    {
      name: 'Server 2 (HD)',
      status: 'online',
      sourceUrl: `https://autoembed.sbs/embed/tv/${tmdbId}/${season}/${episode}/`,
    },
    {
      name: 'Server 3 (Fast HD)',
      status: 'online',
      sourceUrl: `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=E50914&autoplay=true`,
    },
    {
      name: 'Server 4 (Multi-Audio)',
      status: 'online',
      sourceUrl: `https://nxsha.space/embed/tv/${tmdbId}/${season}/${episode}`,
    },
    {
      name: 'Server 5 (VidLove)',
      status: 'online',
      sourceUrl: `https://player.vidlove.cc/embed/tv/${tmdbId}/${season}/${episode}`,
    },
  ];
}
