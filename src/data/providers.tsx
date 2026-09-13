// All logo paths verified from TMDB /3/watch/providers/movie?watch_region=US
// Logo URLs: https://image.tmdb.org/t/p/original/<logoPath>

export interface ProviderItem {
  id: string;
  name: string;
  tmdbId: number;
  glowColor: string;
  tagline: string;
  /** Verified TMDB logo_path */
  logoPath: string;
  /** Fallback tile background colour */
  bgColor: string;
}

export const PROVIDERS_LIST: ProviderItem[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    tmdbId: 8,
    glowColor: 'rgba(229, 9, 20, 0.5)',
    tagline: 'Stream top-tier Netflix Originals, blockbuster movies, and award-winning series.',
    logoPath: '/rK1KljqmbvO9HQa1PBFLILWah72.png',
    bgColor: '#000000',
  },
  {
    id: 'prime',
    name: 'Amazon Prime Video',
    tmdbId: 9,
    glowColor: 'rgba(0, 168, 225, 0.45)',
    tagline: 'Watch Amazon Originals, hit movies, exclusive series, and premium entertainment.',
    logoPath: '/gMZdpavHmxFNnLpMHwVxfqeux2g.png',
    bgColor: '#00A8E1',
  },
  {
    id: 'disney',
    name: 'Disney Plus',
    tmdbId: 337,
    glowColor: 'rgba(19, 105, 218, 0.55)',
    tagline: 'Endless stories from Disney, Pixar, Marvel, Star Wars, and National Geographic.',
    logoPath: '/5eZ872CghnHFLB1j8grszbrx0dx.png',
    bgColor: '#0A2E8C',
  },
  {
    id: 'appletvplus',
    name: 'Apple TV+',
    tmdbId: 350,
    glowColor: 'rgba(255, 255, 255, 0.3)',
    tagline: 'Award-winning Apple Originals, gripping dramas, and star-studded cinema.',
    logoPath: '/9icYBfYFcwgCbky5VdGUIKJ4C5i.png',
    bgColor: '#000000',
  },
  {
    id: 'appletv',
    name: 'Apple TV Store',
    tmdbId: 2,
    glowColor: 'rgba(200, 200, 200, 0.3)',
    tagline: 'Rent or buy top box-office movies and stream your favorite TV collections.',
    logoPath: '/qdEGArH3lKfFnAtYXMkSYk5wxuG.png',
    bgColor: '#1C1C1E',
  },
  {
    id: 'hulu',
    name: 'Hulu',
    tmdbId: 15,
    glowColor: 'rgba(28, 231, 131, 0.5)',
    tagline: 'Stream next-day network TV, FX series, Hulu Originals, and classic hits.',
    logoPath: '/44uAnmSqvA4yBOdbPWN8YgQHjWm.png',
    bgColor: '#1CE783',
  },
  {
    id: 'hbomax',
    name: 'HBO Max',
    tmdbId: 1899,
    glowColor: 'rgba(100, 0, 200, 0.5)',
    tagline: 'Stream HBO masterpieces, Warner Bros. films, DC Universe, and Max Originals.',
    logoPath: '/skypuy7SXuugIQeYg0IglmzoKaS.png',
    bgColor: '#002B55',
  },
  {
    id: 'paramount',
    name: 'Paramount Plus',
    tmdbId: 2303,
    glowColor: 'rgba(30, 100, 255, 0.5)',
    tagline: 'A mountain of entertainment: CBS hits, Paramount movies, and sports.',
    logoPath: '/4N4BMd0Mm0kHAmF7RZgL5lW3cwc.png',
    bgColor: '#0064FF',
  },
  {
    id: 'peacock',
    name: 'Peacock Premium',
    tmdbId: 386,
    glowColor: 'rgba(200, 200, 200, 0.3)',
    tagline: 'Live sports, exclusive Peacock Originals, Bravo reality, and NBC favorites.',
    logoPath: '/a1UIdq5BrkcAxnxcUhFsNbXnxeu.png',
    bgColor: '#000000',
  },
  {
    id: 'crunchyroll',
    name: 'Crunchyroll',
    tmdbId: 283,
    glowColor: 'rgba(244, 117, 33, 0.5)',
    tagline: 'The world\'s largest anime library with simulcasts direct from Japan.',
    logoPath: '/uFL3c4Cq8M6WoLymlC5Y8bmGytV.png',
    bgColor: '#F47521',
  },
  {
    id: 'starz',
    name: 'Starz',
    tmdbId: 43,
    glowColor: 'rgba(56, 189, 248, 0.4)',
    tagline: 'Obsession-worthy drama series, blockbuster cinema, and STARZ Exclusives.',
    logoPath: '/h25xjouKmiSmFiiqw0aDXbxGZo7.png',
    bgColor: '#050505',
  },
  {
    id: 'amcplus',
    name: 'AMC+',
    tmdbId: 528,
    glowColor: 'rgba(0, 212, 197, 0.45)',
    tagline: 'The ultimate collection from AMC, BBC America, IFC, Sundance TV, and Shudder.',
    logoPath: '/tg5ufQ1GkYDCMxSSxemfeKWcvRe.png',
    bgColor: '#051B1D',
  },
  {
    id: 'mgmplus',
    name: 'MGM Plus',
    tmdbId: 34,
    glowColor: 'rgba(212, 175, 55, 0.45)',
    tagline: 'Iconic Hollywood cinema, thrilling MGM+ series, and timeless classic movies.',
    logoPath: '/q63Uzpu7JAs566vA2G23Lk7LcID.png',
    bgColor: '#14110C',
  },
  {
    id: 'ytpremium',
    name: 'YouTube Premium',
    tmdbId: 188,
    glowColor: 'rgba(255, 0, 0, 0.45)',
    tagline: 'Ad-free YouTube Originals, music streaming, and exclusive premium series.',
    logoPath: '/eWHpKZihdiY617s5LipWJWvN28U.png',
    bgColor: '#FFFFFF',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    tmdbId: 192,
    glowColor: 'rgba(255, 0, 0, 0.5)',
    tagline: 'Discover free movies, web series, trailers, and independent creators.',
    logoPath: '/5Maob4o5w8oZnNeYpCDyVFD3M7X.png',
    bgColor: '#FFFFFF',
  },
  {
    id: 'tubi',
    name: 'Tubi TV',
    tmdbId: 73,
    glowColor: 'rgba(168, 85, 247, 0.5)',
    tagline: 'Watch thousands of free hit movies and TV shows — no subscription required.',
    logoPath: '/9dEuvA8wg5TSeFBZlPxSVxFdimJ.png',
    bgColor: '#5B0FBF',
  },
  {
    id: 'pluto',
    name: 'Pluto TV',
    tmdbId: 300,
    glowColor: 'rgba(254, 240, 0, 0.45)',
    tagline: 'Drop in to 100s of free live TV channels and on-demand movies.',
    logoPath: '/fN4czqaMQNLeF6sSSIjGbAWzvwK.png',
    bgColor: '#0A0A0A',
  },
];
