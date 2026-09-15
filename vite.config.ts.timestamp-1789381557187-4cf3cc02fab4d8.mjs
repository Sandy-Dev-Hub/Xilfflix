// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/cvbha/Downloads/xilfflix/Xilfflix/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/cvbha/Downloads/xilfflix/Xilfflix/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
import https from "https";
var __vite_injected_original_dirname = "C:\\Users\\cvbha\\Downloads\\xilfflix\\Xilfflix";
function tmdbLocalProxy(env) {
  return {
    name: "tmdb-local-proxy",
    configureServer(server) {
      server.middlewares.use("/api/tmdb", async (req, res) => {
        try {
          const currentEnv = loadEnv("", process.cwd(), "");
          const token = currentEnv.TMDB_ACCESS_TOKEN || process.env.TMDB_ACCESS_TOKEN || env.TMDB_ACCESS_TOKEN;
          if (!token) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "TMDB_ACCESS_TOKEN is not configured" }));
            return;
          }
          const urlObj = new URL(req.url, `http://${req.headers.host}`);
          const tmdbPath = urlObj.searchParams.get("path");
          if (!tmdbPath) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "path query parameter is required" }));
            return;
          }
          const ALLOWED_PATHS = [
            /^\/trending\/(all|movie|tv)\/(day|week)$/,
            /^\/(movie|tv)\/(popular|top_rated|now_playing|upcoming|airing_today|on_the_air)$/,
            /^\/discover\/(movie|tv)$/,
            /^\/search\/(multi|movie|tv)$/,
            /^\/(movie|tv)\/\d+$/,
            /^\/(movie|tv)\/\d+\/(similar|credits|videos|recommendations)$/,
            /^\/genre\/(movie|tv)\/list$/,
            /^\/movie\/\d+\/release_dates$/,
            /^\/tv\/\d+\/content_ratings$/,
            /^\/tv\/\d+\/season\/\d+$/,
            /^\/(movie|tv)\/\d+\/images$/
          ];
          if (!ALLOWED_PATHS.some((rx) => rx.test(tmdbPath))) {
            res.statusCode = 403;
            res.end(JSON.stringify({ error: "Forbidden TMDB path" }));
            return;
          }
          urlObj.searchParams.delete("path");
          const tmdbUrl = `https://api.themoviedb.org/3${tmdbPath}?${urlObj.searchParams.toString()}`;
          const options = {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "accept": "application/json"
            }
          };
          const proxyReq = https.request(tmdbUrl, options, (proxyRes) => {
            res.statusCode = proxyRes.statusCode;
            Object.entries(proxyRes.headers).forEach(([key, value]) => {
              if (value) res.setHeader(key, value);
            });
            proxyRes.pipe(res);
          });
          proxyReq.on("error", (err) => {
            console.error("TMDB Proxy Error:", err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Failed to proxy request to TMDB" }));
          });
          proxyReq.end();
        } catch (err) {
          console.error(err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      tmdbLocalProxy(env)
    ],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxjdmJoYVxcXFxEb3dubG9hZHNcXFxceGlsZmZsaXhcXFxcWGlsZmZsaXhcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGN2YmhhXFxcXERvd25sb2Fkc1xcXFx4aWxmZmxpeFxcXFxYaWxmZmxpeFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvY3ZiaGEvRG93bmxvYWRzL3hpbGZmbGl4L1hpbGZmbGl4L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgaHR0cHMgZnJvbSAnaHR0cHMnO1xuXG5mdW5jdGlvbiB0bWRiTG9jYWxQcm94eShlbnY6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAndG1kYi1sb2NhbC1wcm94eScsXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcjogYW55KSB7XG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL3RtZGInLCBhc3luYyAocmVxOiBhbnksIHJlczogYW55KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgY3VycmVudEVudiA9IGxvYWRFbnYoJycsIHByb2Nlc3MuY3dkKCksICcnKTtcbiAgICAgICAgICBjb25zdCB0b2tlbiA9IGN1cnJlbnRFbnYuVE1EQl9BQ0NFU1NfVE9LRU4gfHwgcHJvY2Vzcy5lbnYuVE1EQl9BQ0NFU1NfVE9LRU4gfHwgZW52LlRNREJfQUNDRVNTX1RPS0VOO1xuICAgICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnVE1EQl9BQ0NFU1NfVE9LRU4gaXMgbm90IGNvbmZpZ3VyZWQnIH0pKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB1cmxPYmogPSBuZXcgVVJMKHJlcS51cmwsIGBodHRwOi8vJHtyZXEuaGVhZGVycy5ob3N0fWApO1xuICAgICAgICAgIGNvbnN0IHRtZGJQYXRoID0gdXJsT2JqLnNlYXJjaFBhcmFtcy5nZXQoJ3BhdGgnKTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoIXRtZGJQYXRoKSB7XG4gICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMDtcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ3BhdGggcXVlcnkgcGFyYW1ldGVyIGlzIHJlcXVpcmVkJyB9KSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgQUxMT1dFRF9QQVRIUyA9IFtcbiAgICAgICAgICAgIC9eXFwvdHJlbmRpbmdcXC8oYWxsfG1vdmllfHR2KVxcLyhkYXl8d2VlaykkLyxcbiAgICAgICAgICAgIC9eXFwvKG1vdmllfHR2KVxcLyhwb3B1bGFyfHRvcF9yYXRlZHxub3dfcGxheWluZ3x1cGNvbWluZ3xhaXJpbmdfdG9kYXl8b25fdGhlX2FpcikkLyxcbiAgICAgICAgICAgIC9eXFwvZGlzY292ZXJcXC8obW92aWV8dHYpJC8sXG4gICAgICAgICAgICAvXlxcL3NlYXJjaFxcLyhtdWx0aXxtb3ZpZXx0dikkLyxcbiAgICAgICAgICAgIC9eXFwvKG1vdmllfHR2KVxcL1xcZCskLyxcbiAgICAgICAgICAgIC9eXFwvKG1vdmllfHR2KVxcL1xcZCtcXC8oc2ltaWxhcnxjcmVkaXRzfHZpZGVvc3xyZWNvbW1lbmRhdGlvbnMpJC8sXG4gICAgICAgICAgICAvXlxcL2dlbnJlXFwvKG1vdmllfHR2KVxcL2xpc3QkLyxcbiAgICAgICAgICAgIC9eXFwvbW92aWVcXC9cXGQrXFwvcmVsZWFzZV9kYXRlcyQvLFxuICAgICAgICAgICAgL15cXC90dlxcL1xcZCtcXC9jb250ZW50X3JhdGluZ3MkLyxcbiAgICAgICAgICAgIC9eXFwvdHZcXC9cXGQrXFwvc2Vhc29uXFwvXFxkKyQvLFxuICAgICAgICAgICAgL15cXC8obW92aWV8dHYpXFwvXFxkK1xcL2ltYWdlcyQvXG4gICAgICAgICAgXTtcblxuICAgICAgICAgIGlmICghQUxMT1dFRF9QQVRIUy5zb21lKHJ4ID0+IHJ4LnRlc3QodG1kYlBhdGgpKSkge1xuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDM7XG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdGb3JiaWRkZW4gVE1EQiBwYXRoJyB9KSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdXJsT2JqLnNlYXJjaFBhcmFtcy5kZWxldGUoJ3BhdGgnKTtcbiAgICAgICAgICBjb25zdCB0bWRiVXJsID0gYGh0dHBzOi8vYXBpLnRoZW1vdmllZGIub3JnLzMke3RtZGJQYXRofT8ke3VybE9iai5zZWFyY2hQYXJhbXMudG9TdHJpbmcoKX1gO1xuXG4gICAgICAgICAgLy8gVXNpbmcgbmF0aXZlIG5vZGUgaHR0cHMgdG8gYXZvaWQgZXh0cmEgZGVwZW5kZW5jaWVzIGxpa2Ugbm9kZS1mZXRjaFxuICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHt0b2tlbn1gLFxuICAgICAgICAgICAgICAnYWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGNvbnN0IHByb3h5UmVxID0gaHR0cHMucmVxdWVzdCh0bWRiVXJsLCBvcHRpb25zLCAocHJveHlSZXMpID0+IHtcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gcHJveHlSZXMuc3RhdHVzQ29kZTtcbiAgICAgICAgICAgIE9iamVjdC5lbnRyaWVzKHByb3h5UmVzLmhlYWRlcnMpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgICAgICAgICBpZiAodmFsdWUpIHJlcy5zZXRIZWFkZXIoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByb3h5UmVzLnBpcGUocmVzKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHByb3h5UmVxLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RNREIgUHJveHkgRXJyb3I6JywgZXJyKTtcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnRmFpbGVkIHRvIHByb3h5IHJlcXVlc3QgdG8gVE1EQicgfSkpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcHJveHlSZXEuZW5kKCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogZXJyLm1lc3NhZ2UgfSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW1xuICAgICAgcmVhY3QoKSxcbiAgICAgIHRtZGJMb2NhbFByb3h5KGVudilcbiAgICBdLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgICB9LFxuICAgIH0sXG4gIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFQsU0FBUyxjQUFjLGVBQWU7QUFDbFcsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixPQUFPLFdBQVc7QUFIbEIsSUFBTSxtQ0FBbUM7QUFLekMsU0FBUyxlQUFlLEtBQTZCO0FBQ25ELFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLGdCQUFnQixRQUFhO0FBQzNCLGFBQU8sWUFBWSxJQUFJLGFBQWEsT0FBTyxLQUFVLFFBQWE7QUFDaEUsWUFBSTtBQUNGLGdCQUFNLGFBQWEsUUFBUSxJQUFJLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFDaEQsZ0JBQU0sUUFBUSxXQUFXLHFCQUFxQixRQUFRLElBQUkscUJBQXFCLElBQUk7QUFDbkYsY0FBSSxDQUFDLE9BQU87QUFDVixnQkFBSSxhQUFhO0FBQ2pCLGdCQUFJLElBQUksS0FBSyxVQUFVLEVBQUUsT0FBTyxzQ0FBc0MsQ0FBQyxDQUFDO0FBQ3hFO0FBQUEsVUFDRjtBQUVBLGdCQUFNLFNBQVMsSUFBSSxJQUFJLElBQUksS0FBSyxVQUFVLElBQUksUUFBUSxJQUFJLEVBQUU7QUFDNUQsZ0JBQU0sV0FBVyxPQUFPLGFBQWEsSUFBSSxNQUFNO0FBRS9DLGNBQUksQ0FBQyxVQUFVO0FBQ2IsZ0JBQUksYUFBYTtBQUNqQixnQkFBSSxJQUFJLEtBQUssVUFBVSxFQUFFLE9BQU8sbUNBQW1DLENBQUMsQ0FBQztBQUNyRTtBQUFBLFVBQ0Y7QUFFQSxnQkFBTSxnQkFBZ0I7QUFBQSxZQUNwQjtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBRUEsY0FBSSxDQUFDLGNBQWMsS0FBSyxRQUFNLEdBQUcsS0FBSyxRQUFRLENBQUMsR0FBRztBQUNoRCxnQkFBSSxhQUFhO0FBQ2pCLGdCQUFJLElBQUksS0FBSyxVQUFVLEVBQUUsT0FBTyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ3hEO0FBQUEsVUFDRjtBQUVBLGlCQUFPLGFBQWEsT0FBTyxNQUFNO0FBQ2pDLGdCQUFNLFVBQVUsK0JBQStCLFFBQVEsSUFBSSxPQUFPLGFBQWEsU0FBUyxDQUFDO0FBR3pGLGdCQUFNLFVBQVU7QUFBQSxZQUNkLFFBQVE7QUFBQSxZQUNSLFNBQVM7QUFBQSxjQUNQLGlCQUFpQixVQUFVLEtBQUs7QUFBQSxjQUNoQyxVQUFVO0FBQUEsWUFDWjtBQUFBLFVBQ0Y7QUFFQSxnQkFBTSxXQUFXLE1BQU0sUUFBUSxTQUFTLFNBQVMsQ0FBQyxhQUFhO0FBQzdELGdCQUFJLGFBQWEsU0FBUztBQUMxQixtQkFBTyxRQUFRLFNBQVMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEtBQUssS0FBSyxNQUFNO0FBQ3pELGtCQUFJLE1BQU8sS0FBSSxVQUFVLEtBQUssS0FBSztBQUFBLFlBQ3JDLENBQUM7QUFDRCxxQkFBUyxLQUFLLEdBQUc7QUFBQSxVQUNuQixDQUFDO0FBRUQsbUJBQVMsR0FBRyxTQUFTLENBQUMsUUFBUTtBQUM1QixvQkFBUSxNQUFNLHFCQUFxQixHQUFHO0FBQ3RDLGdCQUFJLGFBQWE7QUFDakIsZ0JBQUksSUFBSSxLQUFLLFVBQVUsRUFBRSxPQUFPLGtDQUFrQyxDQUFDLENBQUM7QUFBQSxVQUN0RSxDQUFDO0FBRUQsbUJBQVMsSUFBSTtBQUFBLFFBQ2YsU0FBUyxLQUFVO0FBQ2pCLGtCQUFRLE1BQU0sR0FBRztBQUNqQixjQUFJLGFBQWE7QUFDakIsY0FBSSxJQUFJLEtBQUssVUFBVSxFQUFFLE9BQU8sSUFBSSxRQUFRLENBQUMsQ0FBQztBQUFBLFFBQ2hEO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7QUFDRjtBQUVBLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUMzQyxTQUFPO0FBQUEsSUFDTCxTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixlQUFlLEdBQUc7QUFBQSxJQUNwQjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3RDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
