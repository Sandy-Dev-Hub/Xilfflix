export default async function handler(req, res) {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'TMDB_ACCESS_TOKEN is not configured on the server.' });
  }

  const { path } = req.query;
  if (!path) {
    return res.status(400).json({ error: 'path query parameter is required' });
  }

  // Whitelist of allowed TMDB API paths to prevent open proxy abuse
  const ALLOWED_PATHS = [
    /^\/trending\/(all|movie|tv)\/(day|week)$/,
    /^\/(movie|tv)\/(popular|top_rated|now_playing|upcoming|airing_today|on_the_air)$/,
    /^\/discover\/(movie|tv)$/,
    /^\/search\/multi$/,
    /^\/(movie|tv)\/\d+$/,
    /^\/(movie|tv)\/\d+\/similar$/,
    /^\/genre\/(movie|tv)\/list$/,
    /^\/movie\/\d+\/release_dates$/,
    /^\/tv\/\d+\/content_ratings$/
  ];

  const isAllowed = ALLOWED_PATHS.some(rx => rx.test(path));
  if (!isAllowed) {
    return res.status(403).json({ error: 'Forbidden TMDB path' });
  }

  // Forward all query parameters (except 'path') to TMDB
  const urlObj = new URL('http://localhost' + req.url); // Use dummy base to parse URL
  const searchParams = urlObj.searchParams;
  searchParams.delete('path');
  
  const tmdbUrl = `https://api.themoviedb.org/3${path}?${searchParams.toString()}`;

  try {
    const response = await fetch(tmdbUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: 'application/json'
      }
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('TMDB Proxy Error:', error);
    res.status(500).json({ error: 'Failed to fetch from TMDB API' });
  }
}
