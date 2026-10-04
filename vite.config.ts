import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { voiceReview } from './scripts/voice/review-server.ts';

/**
 * Writes sw.js after the build with every output file pre-cached, so the
 * game works fully offline once it has been opened on the iPad.
 */
function serviceWorker(): Plugin {
  let outDir = 'dist';
  return {
    name: 'wizard-words-sw',
    apply: 'build',
    configResolved(c) {
      outDir = c.build.outDir;
    },
    generateBundle(_opts, bundle) {
      const files = new Set<string>(Object.keys(bundle));
      // Bundle names already carry content hashes; public files (audio) don't,
      // so hash their bytes too, or a re-recorded clip would never reach a
      // device that has the old one cached.
      const contents = createHash('sha1');
      const walk = (dir: string) => {
        for (const f of readdirSync(dir).sort()) {
          const p = join(dir, f);
          if (statSync(p).isDirectory()) walk(p);
          else {
            files.add(relative('public', p).split('\\').join('/'));
            contents.update(readFileSync(p));
          }
        }
      };
      walk('public');
      files.delete('sw.js');
      const list = ['./', ...[...files].filter((f) => !f.endsWith('.map')).sort()];
      const version = contents.update(list.join('|')).digest('hex').slice(0, 10);
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: `// Generated at build time. Cache-first, fully offline.
const CACHE = 'wizard-words-${version}';
const FILES = ${JSON.stringify(list)};
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(e.request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        }),
    ),
  );
});
`,
      });
      void outDir;
    },
  };
}

export default defineConfig({
  // Relative paths so it works at https://charlie-beard.github.io/spelling-game/
  base: './',
  build: {
    target: 'safari16',
    assetsInlineLimit: 0,
    rollupOptions: { input: { main: 'index.html' } },
  },
  server: { host: true },
  plugins: [serviceWorker(), voiceReview()],
});
