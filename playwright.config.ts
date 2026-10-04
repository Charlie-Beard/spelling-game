import { defineConfig } from '@playwright/test';

/** The game targets one device: iPad (11th gen), landscape. */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:4173',
    hasTouch: true,
    isMobile: false,
    deviceScaleFactor: 2,
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  projects: [
    { name: 'home-screen', use: { viewport: { width: 1180, height: 820 } } },
    { name: 'safari-tab', use: { viewport: { width: 1180, height: 760 } } },
  ],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
