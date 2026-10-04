import { defineConfig } from 'vite';

export default defineConfig({
  // Served from https://charlie-beard.github.io/spelling-game/
  base: './',
  build: {
    target: 'safari16',
    assetsInlineLimit: 0,
  },
  server: { host: true },
});
