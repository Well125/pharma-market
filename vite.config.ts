import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Em desenvolvimento, atende /api/* com a mesma lógica das Vercel Functions,
// para que `npm run dev` funcione sem expor a chave ao navegador.
function devApi(): Plugin {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (!url.startsWith('/api/')) return next();
        try {
          const { routes } = await server.ssrLoadModule('/server/gemini.ts');
          const { readJsonBody, sendResult } = await server.ssrLoadModule('/server/http.ts');
          const route = routes[url];
          if (!route) return sendResult(res, { status: 404, body: { error: 'not_found' } });
          if (req.method !== 'POST') {
            res.setHeader('Allow', 'POST');
            return sendResult(res, { status: 405, body: { error: 'method_not_allowed' } });
          }
          return sendResult(res, await route(await readJsonBody(req)));
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Disponibiliza GEMINI_API_KEY (do .env.local) só para o código do servidor de dev.
  // Nada aqui é injetado no bundle do navegador.
  const env = loadEnv(mode, '.', '');
  if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  }

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), devApi()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
