import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import https from 'https';

function tmdbLocalProxy(env: Record<string, string>) {
  return {
    name: 'tmdb-local-proxy',
    configureServer(server: any) {
      server.middlewares.use('/api/tmdb', async (req: any, res: any) => {
        try {
          const token = env.TMDB_ACCESS_TOKEN;
          if (!token) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'TMDB_ACCESS_TOKEN is not configured' }));
            return;
          }

          const urlObj = new URL(req.url, `http://${req.headers.host}`);
          const tmdbPath = urlObj.searchParams.get('path');
          
          if (!tmdbPath) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'path query parameter is required' }));
            return;
          }

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

          if (!ALLOWED_PATHS.some(rx => rx.test(tmdbPath))) {
            res.statusCode = 403;
            res.end(JSON.stringify({ error: 'Forbidden TMDB path' }));
            return;
          }

          urlObj.searchParams.delete('path');
          const tmdbUrl = `https://api.themoviedb.org/3${tmdbPath}?${urlObj.searchParams.toString()}`;

          // Using native node https to avoid extra dependencies like node-fetch
          const options = {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'accept': 'application/json'
            }
          };

          const proxyReq = https.request(tmdbUrl, options, (proxyRes) => {
            res.statusCode = proxyRes.statusCode;
            Object.entries(proxyRes.headers).forEach(([key, value]) => {
              if (value) res.setHeader(key, value);
            });
            proxyRes.pipe(res);
          });

          proxyReq.on('error', (err) => {
            console.error('TMDB Proxy Error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to proxy request to TMDB' }));
          });

          proxyReq.end();
        } catch (err: any) {
          console.error(err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      tmdbLocalProxy(env)
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
