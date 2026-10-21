import type { Server } from '@/types/movie';

/**
 * Builds the embed servers for a given TMDB ID.
 * Server 1: VidSync (Multi-Audio)
 * Server 2: Fmov (Download option)
 * Server 3: VidLove
 * Server 4: AutoEmbed (HD)
 * Server 5: VidLink (Fast HD)
 * Server 6: Nxsha (Multi-Audio)
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
      { name: 'Server 1 (Download)', status: 'online', sourceUrl: '' },
      { name: 'Server 2', status: 'online', sourceUrl: '' },
      { name: 'Server 3', status: 'online', sourceUrl: '' },
      { name: 'Server 4 (HD)', status: 'online', sourceUrl: '' },
      { name: 'Server 5 (Fast HD)', status: 'online', sourceUrl: '' },
      { name: 'Server 6 (Multi-Audio)', status: 'online', sourceUrl: '' },
    ];
  }

  if (mediaType === 'movie') {
    let server1Url = `https://vidsync.pro/embed/movie/${tmdbId}?primarycolor=E50914`;
    let server2Url = `https://fmov.my/embed/movie/${tmdbId}?color=E50914`;
    let server3Url = `https://player.vidlove.cc/embed/movie/${tmdbId}`;
    let server4Url = `https://autoembed.sbs/embed/movie/${tmdbId}/`;
    let server5Url = `https://vidlink.pro/movie/${tmdbId}?primaryColor=E50914&autoplay=true`;
    let server6Url = `https://nxsha.space/embed/movie/${tmdbId}`;
    let server2Status: 'online' | 'offline' = 'online';
    let server6Status: 'online' | 'offline' = 'online';

    return [
      {
        name: 'Server 1 (Download)',
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
        status: 'online',
        sourceUrl: server3Url,
      },
      {
        name: 'Server 4 (HD)',
        status: 'online',
        sourceUrl: server4Url,
      },
      {
        name: 'Server 5 (Fast HD)',
        status: 'online',
        sourceUrl: server5Url,
      },
      {
        name: 'Server 6 (Multi-Audio)',
        status: server6Status,
        sourceUrl: server6Url,
      },
    ];
  }

  // TV Series
  return [
    {
      name: 'Server 1 (Download)',
      status: 'online',
      sourceUrl: `https://vidsync.pro/embed/tv/${tmdbId}/${season}/${episode}?primarycolor=E50914&autonext=true`,
    },
    {
      name: 'Server 2',
      status: 'online',
      sourceUrl: `https://fmov.my/embed/tv/${tmdbId}/${season}/${episode}?color=E50914&nextEpisode=true&episodeSelector=true`,
    },
    {
      name: 'Server 3',
      status: 'online',
      sourceUrl: `https://player.vidlove.cc/embed/tv/${tmdbId}/${season}/${episode}`,
    },
    {
      name: 'Server 4 (HD)',
      status: 'online',
      sourceUrl: `https://autoembed.sbs/embed/tv/${tmdbId}/${season}/${episode}/`,
    },
    {
      name: 'Server 5 (Fast HD)',
      status: 'online',
      sourceUrl: `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=E50914&autoplay=true`,
    },
    {
      name: 'Server 6 (Multi-Audio)',
      status: 'online',
      sourceUrl: `https://nxsha.space/embed/tv/${tmdbId}/${season}/${episode}`,
    },
  ];
}
