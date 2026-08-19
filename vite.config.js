import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  // The backend's CORS list is pinned to this exact origin (Server/.env
  // FRONTEND_URL). strictPort makes Vite fail loudly instead of silently
  // moving to 5174/5175, where every API call would be blocked by CORS and
  // surface in the browser as a bare "Failed to fetch".
  server: {
    port: 5173,
    strictPort: true,
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
});
