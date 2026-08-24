import type { Server } from '@/types/movie';

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

export const makeServers = (primary: string = SAMPLE_VIDEOS.tearsOfSteel, secondary: string = SAMPLE_VIDEOS.bbBunny): Server[] => [
  { name: 'Server 1', status: 'online', sourceUrl: primary },
  { name: 'Server 2', status: 'online', sourceUrl: secondary },
  { name: 'Server 3', status: 'online', sourceUrl: SAMPLE_VIDEOS.elephantDream },
  { name: 'Server 4', status: 'offline', sourceUrl: '' },
];
