import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Netlify does not ship client/.env. The build still receives GOOGLE_CLIENT_ID from Netlify env;
 * we mirror it into VITE_GOOGLE_CLIENT_ID so the SPA bundle matches the server without a second secret.
 */
function resolveGoogleClientIdForBuild(mode) {
  const fileEnv = loadEnv(mode, __dirname, '');
  return (
    fileEnv.VITE_GOOGLE_CLIENT_ID ||
    process.env.VITE_GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID ||
    ''
  ).trim();
}

export default defineConfig(({ mode }) => {
  const googleClientId = resolveGoogleClientIdForBuild(mode);
  return {
    plugins: [react()],
    ...(googleClientId
      ? {
          define: {
            'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(googleClientId),
          },
        }
      : {}),
    server: {
      port: 5173,
      strictPort: false,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
