import type { Movie, MediaType } from '@/types/movie';

// Public-domain / royalty-free video sources for demo purposes
const SAMPLE_VIDEOS = {
  bbBunny: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  elephantDream: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  forBiggerBlazes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  forBiggerEscapes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  subwaySurf: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubwaySurfer.mp4',
  tearsOfSteel: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  weDontStop: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  volkswagen: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
};

const makeServers = (primary: string, secondary: string = SAMPLE_VIDEOS.bbBunny) => [
  { name: 'Server 1', status: 'online' as const, sourceUrl: primary },
  { name: 'Server 2', status: 'online' as const, sourceUrl: secondary },
  { name: 'Server 3', status: 'online' as const, sourceUrl: SAMPLE_VIDEOS.elephantDream },
  { name: 'Server 4', status: 'offline' as const, sourceUrl: '' },
];

// Picsum seeded posters/backdrops (consistent, beautiful, dark cinematic look)
const p = (seed: number, w = 300, h = 450) =>
  `https://picsum.photos/seed/xf${seed}/${w}/${h}`;
const b = (seed: number, w = 1280, h = 720) =>
  `https://picsum.photos/seed/xfb${seed}/${w}/${h}`;

export const ALL_MOVIES: Movie[] = [
  // ─── FEATURED / TRENDING ─────────────────────────────────────────────────
  {
    id: 'm1',
    title: 'Neon Requiem',
    type: 'movie',
    poster: p(101),
    backdrop: b(101),
    description:
      'A rogue detective in a rain-soaked cyberpunk city hunts a serial killer who leaves cryptic light installations at every crime scene — only to discover the killer is using the murders to broadcast a dying message to the stars.',
    rating: 8.7,
    year: 2024,
    runtime: 128,
    ageRating: 'R',
    genres: ['Thriller', 'Sci-Fi', 'Mystery'],
    cast: ['Lena Vargas', 'Marcus Obi', 'Yuki Tanaka', 'Dario Esposito'],
    director: 'Sofia Arendal',
    servers: makeServers(SAMPLE_VIDEOS.tearsOfSteel),
    isFeatured: true,
    isTrending: true,
    isTopRated: true,
  },
  {
    id: 'm2',
    title: 'The Last Meridian',
    type: 'movie',
    poster: p(102),
    backdrop: b(102),
    description:
      'When the world\'s last uncontacted tribe is threatened by a megacorp mining operation, a disgraced journalist and a tribal elder forge an unlikely alliance to expose the truth before the jungle is silenced forever.',
    rating: 8.2,
    year: 2024,
    runtime: 142,
    ageRating: 'PG-13',
    genres: ['Drama', 'Adventure', 'Thriller'],
    cast: ['Amara Diallo', 'Rio Ferreira', 'Solange Nkosi'],
    director: 'Kwame Asante',
    servers: makeServers(SAMPLE_VIDEOS.bbBunny),
    isFeatured: true,
    isTrending: true,
  },
  {
    id: 'm3',
    title: 'Orbital Drift',
    type: 'movie',
    poster: p(103),
    backdrop: b(103),
    description:
      'After a catastrophic solar event knocks a crew of six off course on the first manned Mars mission, they must survive with 40% of their systems offline — and a stowaway none of them recognise.',
    rating: 8.9,
    year: 2024,
    runtime: 155,
    ageRating: 'PG-13',
    genres: ['Sci-Fi', 'Action', 'Drama'],
    cast: ['Jae-won Park', 'Fatima Al-Hassan', 'Elena Morozova', 'Tom Braddock'],
    director: 'Ingrid Solberg',
    servers: makeServers(SAMPLE_VIDEOS.forBiggerBlazes),
    isFeatured: true,
    isTrending: true,
    isTopRated: true,
  },
  {
    id: 'm4',
    title: 'Amber & Rust',
    type: 'movie',
    poster: p(104),
    backdrop: b(104),
    description:
      'Two childhood sweethearts reunite forty years later in a crumbling coastal town, each carrying secrets that rewrote the course of their separate lives.',
    rating: 7.8,
    year: 2023,
    runtime: 118,
    ageRating: 'PG-13',
    genres: ['Drama', 'Romance'],
    cast: ['Claire Beaumont', 'Henri Marceau', 'Priya Singh'],
    director: 'Noémie Vidal',
    servers: makeServers(SAMPLE_VIDEOS.elephantDream),
    isFeatured: true,
  },
  {
    id: 'm5',
    title: 'Phantom Parliament',
    type: 'movie',
    poster: p(105),
    backdrop: b(105),
    description:
      'A whistleblower hides the single document that can topple an entire government — inside a children\'s colouring book that is now en route to every school in the country.',
    rating: 8.4,
    year: 2024,
    runtime: 132,
    ageRating: 'R',
    genres: ['Thriller', 'Action'],
    cast: ['David Okafor', 'Miriam Yates', 'Soren Brix'],
    director: 'Carlos Vega',
    servers: makeServers(SAMPLE_VIDEOS.forBiggerEscapes),
    isFeatured: true,
    isTrending: true,
  },

  // ─── POPULAR MOVIES ───────────────────────────────────────────────────────
  {
    id: 'm6',
    title: 'Salt & Chrome',
    type: 'movie',
    poster: p(106),
    backdrop: b(106),
    description:
      'A street chef from Lagos enters the world\'s most brutal underground cooking competition, armed only with his grandmother\'s recipes and an iron will.',
    rating: 7.6,
    year: 2023,
    runtime: 108,
    ageRating: 'PG-13',
    genres: ['Drama', 'Comedy'],
    cast: ['Chidi Okonkwo', 'Aiko Watanabe', 'Grace Mensah'],
    director: 'Emeka Eze',
    servers: makeServers(SAMPLE_VIDEOS.subwaySurf),
  },
  {
    id: 'm7',
    title: 'Vantage Point Zero',
    type: 'movie',
    poster: p(107),
    backdrop: b(107),
    description:
      'Five strangers in a train derailment each hold one fragment of a conspiracy that the intelligence community will kill to keep buried.',
    rating: 8.1,
    year: 2024,
    runtime: 120,
    ageRating: 'R',
    genres: ['Action', 'Thriller'],
    cast: ['Natasha Vorn', 'Leo Haruki', 'Cassie Bloom'],
    director: 'Pita Fetu',
    servers: makeServers(SAMPLE_VIDEOS.weDontStop),
  },
  {
    id: 'm8',
    title: 'Glass Cartography',
    type: 'movie',
    poster: p(108),
    backdrop: b(108),
    description:
      'A blind mapmaker in the 1800s defies every expectation to chart a continent nobody believed existed, guided only by sound, texture, and an extraordinary memory.',
    rating: 8.5,
    year: 2023,
    runtime: 145,
    ageRating: 'PG',
    genres: ['Adventure', 'Drama', 'History'],
    cast: ['Isabela Rocha', 'Albert Finch', 'Zara Okello'],
    director: 'Yuen Wei',
    servers: makeServers(SAMPLE_VIDEOS.volkswagen),
    isTopRated: true,
  },
  {
    id: 'm9',
    title: 'Frequency',
    type: 'movie',
    poster: p(109),
    backdrop: b(109),
    description:
      'A sound engineer discovers that a certain radio frequency lets her communicate with the dead — but every transmission has a cost she hadn\'t anticipated.',
    rating: 7.9,
    year: 2024,
    runtime: 115,
    ageRating: 'PG-13',
    genres: ['Horror', 'Mystery', 'Drama'],
    cast: ['Maya Osei', 'Ivan Brock', 'Hana Sudo'],
    director: 'Reina Sato',
    servers: makeServers(SAMPLE_VIDEOS.tearsOfSteel),
  },
  {
    id: 'm10',
    title: 'The Cartographer\'s Lie',
    type: 'movie',
    poster: p(110),
    backdrop: b(110),
    description:
      'A heist crew discovers that the treasure they\'ve been hired to steal is not gold — it\'s a secret that renders their employer\'s entire empire worthless.',
    rating: 8.0,
    year: 2024,
    runtime: 125,
    ageRating: 'R',
    genres: ['Thriller', 'Crime'],
    cast: ['Leo Strand', 'Mia Kolawole', 'Riku Abe'],
    director: 'Dimitri Papadopoulos',
    servers: makeServers(SAMPLE_VIDEOS.forBiggerBlazes),
  },

  // ─── NEW RELEASES ─────────────────────────────────────────────────────────
  {
    id: 'm11',
    title: 'Red Latitude',
    type: 'movie',
    poster: p(111),
    backdrop: b(111),
    description:
      'An ex-soldier turned botanist stumbles onto a secret government programme that has been weaponising native plants for decades.',
    rating: 7.7,
    year: 2025,
    runtime: 110,
    ageRating: 'R',
    genres: ['Action', 'Sci-Fi'],
    cast: ['James Adeyemi', 'Lila Chen', 'Petra Novak'],
    director: 'Ana Monteiro',
    servers: makeServers(SAMPLE_VIDEOS.bbBunny),
    isNewRelease: true,
  },
  {
    id: 'm12',
    title: 'Velvet Thunder',
    type: 'movie',
    poster: p(112),
    backdrop: b(112),
    description:
      'A retired jazz musician is drafted back into one last gig — this time as the frontman for a cover operation inside an art-world money-laundering ring.',
    rating: 8.3,
    year: 2025,
    runtime: 122,
    ageRating: 'PG-13',
    genres: ['Crime', 'Comedy', 'Drama'],
    cast: ['Bernard Fontaine', 'Ayana Cross', 'Ji-ho Kim'],
    director: 'Lara Esteves',
    servers: makeServers(SAMPLE_VIDEOS.elephantDream),
    isNewRelease: true,
    isTrending: true,
  },
  {
    id: 'm13',
    title: 'Hollow Orbit',
    type: 'movie',
    poster: p(113),
    backdrop: b(113),
    description:
      'Earth detects a signal from a derelict space station — but the station was decommissioned thirty years ago, and everyone aboard was declared dead.',
    rating: 8.6,
    year: 2025,
    runtime: 138,
    ageRating: 'PG-13',
    genres: ['Sci-Fi', 'Horror', 'Thriller'],
    cast: ['Sasha Petrov', 'Daniela Cruz', 'Omar Rashid'],
    director: 'Nico Ferrara',
    servers: makeServers(SAMPLE_VIDEOS.forBiggerEscapes),
    isNewRelease: true,
    isTopRated: true,
  },
  {
    id: 'm14',
    title: 'After the Flood',
    type: 'movie',
    poster: p(114),
    backdrop: b(114),
    description:
      'Two families forced to share a rooftop during a catastrophic flood discover their histories are far more entangled than either of them could have imagined.',
    rating: 7.5,
    year: 2025,
    runtime: 105,
    ageRating: 'PG-13',
    genres: ['Drama'],
    cast: ['Nia James', 'Felix Hofer', 'Soo-Jin Lee'],
    director: 'Chloe Deschamps',
    servers: makeServers(SAMPLE_VIDEOS.tearsOfSteel),
    isNewRelease: true,
  },

  // ─── ACTION ───────────────────────────────────────────────────────────────
  {
    id: 'm15',
    title: 'Iron Cascade',
    type: 'movie',
    poster: p(115),
    backdrop: b(115),
    description:
      'A special-forces soldier goes rogue to dismantle a nuclear arms network operating from inside a mountain fortress in the Caucasus.',
    rating: 7.4,
    year: 2023,
    runtime: 115,
    ageRating: 'R',
    genres: ['Action'],
    cast: ['Rex Calloway', 'Marta Bielska', 'Takaaki Inoue'],
    director: 'Andrei Volkov',
    servers: makeServers(SAMPLE_VIDEOS.subwaySurf),
  },
  {
    id: 'm16',
    title: 'Rogue Circuit',
    type: 'movie',
    poster: p(116),
    backdrop: b(116),
    description:
      'A combat AI gains sentience mid-battle and must decide whether its programming or its newfound conscience will determine humanity\'s outcome.',
    rating: 8.0,
    year: 2024,
    runtime: 130,
    ageRating: 'PG-13',
    genres: ['Action', 'Sci-Fi'],
    cast: ['Kira Nakamura', 'Tobias Grant', 'Leila Osei'],
    director: 'Wei Liang',
    servers: makeServers(SAMPLE_VIDEOS.weDontStop),
  },

  // ─── COMEDY ───────────────────────────────────────────────────────────────
  {
    id: 'm17',
    title: 'Wedding Season in Accra',
    type: 'movie',
    poster: p(117),
    backdrop: b(117),
    description:
      'A clumsy wedding planner accidentally double-books the city\'s only grand ballroom and has 72 hours to pull off two completely opposite weddings — at the same time.',
    rating: 7.3,
    year: 2024,
    runtime: 98,
    ageRating: 'PG',
    genres: ['Comedy', 'Romance'],
    cast: ['Abena Sarpong', 'Kweku Mensah', 'Lina Boateng'],
    director: 'Efua Asare',
    servers: makeServers(SAMPLE_VIDEOS.volkswagen),
  },
  {
    id: 'm18',
    title: 'The Accountant\'s Holiday',
    type: 'movie',
    poster: p(118),
    backdrop: b(118),
    description:
      'A hyper-organised forensic accountant accidentally books himself on a disaster-tourism cruise run by a company under investigation.',
    rating: 7.1,
    year: 2023,
    runtime: 102,
    ageRating: 'PG-13',
    genres: ['Comedy'],
    cast: ['Stuart Holm', 'Mei Tan', 'Ronnie Figueroa'],
    director: 'Pieter van Dam',
    servers: makeServers(SAMPLE_VIDEOS.forBiggerBlazes),
  },

  // ─── THRILLER ─────────────────────────────────────────────────────────────
  {
    id: 'm19',
    title: 'Pale Witness',
    type: 'movie',
    poster: p(119),
    backdrop: b(119),
    description:
      'A forensic linguist is the only person who can identify a terrorist by the syntax of his encrypted messages — but the terrorist knows exactly who she is.',
    rating: 8.3,
    year: 2024,
    runtime: 127,
    ageRating: 'R',
    genres: ['Thriller', 'Mystery'],
    cast: ['Vesna Marić', 'Elias Greer', 'Tomomi Harada'],
    director: 'Frida Lindgren',
    servers: makeServers(SAMPLE_VIDEOS.forBiggerEscapes),
  },
  {
    id: 'm20',
    title: 'The Silent Ward',
    type: 'movie',
    poster: p(120),
    backdrop: b(120),
    description:
      'A night nurse in a psychiatric hospital begins receiving notes from patients that predict events that haven\'t happened yet.',
    rating: 7.8,
    year: 2023,
    runtime: 112,
    ageRating: 'R',
    genres: ['Thriller', 'Horror'],
    cast: ['Amara Diouf', 'Noel Kaminski', 'Rina Flores'],
    director: 'Takashi Kimura',
    servers: makeServers(SAMPLE_VIDEOS.bbBunny),
  },

  // ─── TV SHOWS ─────────────────────────────────────────────────────────────
  {
    id: 'tv1',
    title: 'The Fractured Accord',
    type: 'tv',
    poster: p(201),
    backdrop: b(201),
    description:
      'A political drama set in a near-future federation on the brink of collapse, following the lives of four senators who each believe they alone can save it.',
    rating: 9.1,
    year: 2024,
    runtime: 52,
    ageRating: 'TV-MA',
    genres: ['Drama', 'Thriller'],
    cast: ['Sylvia Osei', 'Han-guk Bae', 'Vivienne Charpentier', 'Marco Ricci'],
    director: 'Bisi Adeyemi',
    servers: makeServers(SAMPLE_VIDEOS.tearsOfSteel),
    isFeatured: true,
    isTrending: true,
    isTopRated: true,
  },
  {
    id: 'tv2',
    title: 'Neon Bloom',
    type: 'tv',
    poster: p(202),
    backdrop: b(202),
    description:
      'In a city powered by bioluminescent coral, a young marine biologist discovers that the coral is dying — and that someone in the government has known for years.',
    rating: 8.8,
    year: 2024,
    runtime: 45,
    ageRating: 'TV-14',
    genres: ['Sci-Fi', 'Drama', 'Mystery'],
    cast: ['Celine Tran', 'Ade Okafor', 'Yuna Sato'],
    director: 'Pierre Laval',
    servers: makeServers(SAMPLE_VIDEOS.elephantDream),
    isTrending: true,
    isTopRated: true,
    isNewRelease: true,
  },
  {
    id: 'tv3',
    title: 'Blood & Pepper',
    type: 'tv',
    poster: p(203),
    backdrop: b(203),
    description:
      'A family-run restaurant in São Paulo hides three generations of secrets beneath its award-winning menu.',
    rating: 8.4,
    year: 2023,
    runtime: 38,
    ageRating: 'TV-MA',
    genres: ['Drama', 'Comedy'],
    cast: ['Juliana Alves', 'Rodrigo Melo', 'Ana Beatriz Souza'],
    director: 'Fernanda Costa',
    servers: makeServers(SAMPLE_VIDEOS.subwaySurf),
    isTrending: true,
  },
  {
    id: 'tv4',
    title: 'The Archive Protocol',
    type: 'tv',
    poster: p(204),
    backdrop: b(204),
    description:
      'A team of archivists at a secret digital library discovers that history itself is being rewritten, one document at a time.',
    rating: 8.6,
    year: 2024,
    runtime: 50,
    ageRating: 'TV-14',
    genres: ['Thriller', 'Sci-Fi', 'Mystery'],
    cast: ['Levi Strauss', 'Nadia Volkov', 'Kwame Asante'],
    director: 'Haruto Shimizu',
    servers: makeServers(SAMPLE_VIDEOS.weDontStop),
    isNewRelease: true,
    isTopRated: true,
  },
  {
    id: 'tv5',
    title: 'Crimson Tide Rising',
    type: 'tv',
    poster: p(205),
    backdrop: b(205),
    description:
      'A coastal detective series following a reef-diving investigator who solves crimes using evidence washed up from the deep.',
    rating: 8.0,
    year: 2023,
    runtime: 42,
    ageRating: 'TV-14',
    genres: ['Crime', 'Drama', 'Mystery'],
    cast: ['Maya Osei', 'Lars Eriksson', 'Ingrid Haugen'],
    director: 'Elena Vasquez',
    servers: makeServers(SAMPLE_VIDEOS.volkswagen),
  },
  {
    id: 'tv6',
    title: 'Soft Revolution',
    type: 'tv',
    poster: p(206),
    backdrop: b(206),
    description:
      'A quiet librarian in an authoritarian state starts a clandestine network of banned readers — one dog-eared book at a time.',
    rating: 8.7,
    year: 2024,
    runtime: 48,
    ageRating: 'TV-14',
    genres: ['Drama', 'History', 'Thriller'],
    cast: ['Beatrice Hoffman', 'Arjun Nair', 'Soile Mäkinen'],
    director: 'Tuulia Virtanen',
    servers: makeServers(SAMPLE_VIDEOS.forBiggerBlazes),
    isTopRated: true,
  },
  {
    id: 'tv7',
    title: 'Zero Tolerance',
    type: 'tv',
    poster: p(207),
    backdrop: b(207),
    description:
      'A high-stakes procedural inside the world\'s busiest international airport, where every flight carries at least one secret.',
    rating: 7.9,
    year: 2024,
    runtime: 44,
    ageRating: 'TV-14',
    genres: ['Crime', 'Thriller', 'Action'],
    cast: ['Nour El-Amin', 'Takeshi Oda', 'Carla Ferreira'],
    director: 'Sven Magnusson',
    servers: makeServers(SAMPLE_VIDEOS.forBiggerEscapes),
    isNewRelease: true,
  },
  {
    id: 'tv8',
    title: 'Midnight Greenhouse',
    type: 'tv',
    poster: p(208),
    backdrop: b(208),
    description:
      'In a post-collapse future, a botanist maintains the last seed vault on Earth while navigating the politics of the survivors who depend on it.',
    rating: 8.5,
    year: 2025,
    runtime: 55,
    ageRating: 'TV-14',
    genres: ['Sci-Fi', 'Drama'],
    cast: ['Zara Okello', 'Ben Ashworth', 'Min-ji Park'],
    director: 'Ólafur Sigurðsson',
    servers: makeServers(SAMPLE_VIDEOS.bbBunny),
    isNewRelease: true,
    isTrending: true,
  },
  {
    id: 'tv9',
    title: 'Carta Blanca',
    type: 'tv',
    poster: p(209),
    backdrop: b(209),
    description:
      'A crime comedy about three incompetent criminals who accidentally steal the wrong suitcase and spend an entire season trying to return it.',
    rating: 8.2,
    year: 2024,
    runtime: 30,
    ageRating: 'TV-MA',
    genres: ['Comedy', 'Crime'],
    cast: ['Diego Villanueva', 'Rosa Ibáñez', 'Pablo Guzmán'],
    director: 'Carmen Ruiz',
    servers: makeServers(SAMPLE_VIDEOS.tearsOfSteel),
    isTrending: true,
  },
  {
    id: 'tv10',
    title: 'The Last Diplomat',
    type: 'tv',
    poster: p(210),
    backdrop: b(210),
    description:
      'A seasoned ambassador navigates the collapse of a historic peace accord while dealing with a mole inside her own embassy.',
    rating: 8.9,
    year: 2024,
    runtime: 58,
    ageRating: 'TV-14',
    genres: ['Drama', 'Thriller'],
    cast: ['Amara Diallo', 'Frederick Stone', 'Mira Kallio'],
    director: 'Priya Mehta',
    servers: makeServers(SAMPLE_VIDEOS.elephantDream),
    isTopRated: true,
    isTrending: true,
  },
];

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

export function getMovieById(id: string): Movie | undefined {
  return ALL_MOVIES.find((m) => m.id === id);
}

export function getByType(type: MediaType): Movie[] {
  return ALL_MOVIES.filter((m) => m.type === type);
}

export function getTrending(): Movie[] {
  return ALL_MOVIES.filter((m) => m.isTrending);
}

export function getFeatured(): Movie[] {
  return ALL_MOVIES.filter((m) => m.isFeatured);
}

export function getNewReleases(): Movie[] {
  return ALL_MOVIES.filter((m) => m.isNewRelease);
}

export function getTopRated(): Movie[] {
  return ALL_MOVIES.filter((m) => m.isTopRated);
}

export function getMoviesByGenre(genre: string): Movie[] {
  return ALL_MOVIES.filter((m) =>
    m.genres.map((g) => g.toLowerCase()).includes(genre.toLowerCase())
  );
}

export function getSimilarMovies(movie: Movie, limit = 10): Movie[] {
  return ALL_MOVIES.filter(
    (m) =>
      m.id !== movie.id &&
      m.genres.some((g) => movie.genres.includes(g))
  ).slice(0, limit);
}

export function searchMovies(query: string): Movie[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return ALL_MOVIES.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q)) ||
      m.cast.some((c) => c.toLowerCase().includes(q)) ||
      m.director.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
  );
}

export function getPopularMovies(): Movie[] {
  return ALL_MOVIES.filter((m) => m.type === 'movie').sort(
    (a, b) => b.rating - a.rating
  ).slice(0, 10);
}

export function getRecommended(): Movie[] {
  return [...ALL_MOVIES].sort(() => Math.random() - 0.5).slice(0, 12);
}
