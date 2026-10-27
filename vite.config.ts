import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const local = loadEnv(mode, process.cwd(), '');
  for (const [key, value] of Object.entries(local)) if (process.env[key] === undefined) process.env[key] = value;
  return {
    plugins: [react(), tailwindcss(), {
      name: 'development-api',
      configureServer(server) {
        server.middlewares.use('/api', async (req, res) => {
          req.url = '/api' + (req.url || '/');
          const { default: handler } = await import('./server/router.ts');
          await handler(req, res);
        });
      },
    }],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

