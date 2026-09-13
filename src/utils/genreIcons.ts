/**
 * Helper to map movie/TV genres to corresponding icons/emojis
 */
export function getGenreIcon(genre: string): string {
  if (!genre) return '🎬';
  const g = genre.toLowerCase().trim();

  if (g.includes('romance') || g.includes('love')) return '❤️';
  if (g.includes('action')) return '⚔️';
  if (g.includes('adventure')) return '🧭';
  if (g.includes('animat')) return '🎨';
  if (g.includes('comedy')) return '😂';
  if (g.includes('crime')) return '🕵️';
  if (g.includes('document')) return '📽️';
  if (g.includes('drama')) return '🎭';
  if (g.includes('family') || g.includes('kids')) return '🧸';
  if (g.includes('fantasy')) return '🪄';
  if (g.includes('history')) return '📜';
  if (g.includes('horror')) return '👻';
  if (g.includes('music')) return '🎵';
  if (g.includes('mystery')) return '🔍';
  if (g.includes('sci-fi') || g.includes('science fiction') || g.includes('scifi')) return '🚀';
  if (g.includes('thrill')) return '⚡';
  if (g.includes('war')) return '🪖';
  if (g.includes('western')) return '🤠';
  if (g.includes('news')) return '📰';
  if (g.includes('reality')) return '📺';

  return '🎬';
}

export function formatGenreWithIcon(genre: string): string {
  if (!genre) return '';
  return `${getGenreIcon(genre)} ${genre}`;
}
