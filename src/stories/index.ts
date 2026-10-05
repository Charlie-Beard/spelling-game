/**
 * Every chapter's reward story, loaded only when it plays. The Battle of
 * Hogwarts (b7c4) has its own ending inside the battle scene.
 */
import type { Story } from './kit';

export const STORIES: Record<string, () => Promise<{ default: Story }>> = {
  b1c1: () => import('./b1c1'),
  b1c2: () => import('./b1c2'),
  b1c3: () => import('./b1c3'),
  b1c4: () => import('./b1c4'),
  b1c5: () => import('./b1c5'),
  b2c1: () => import('./b2c1'),
  b2c2: () => import('./b2c2'),
  b2c3: () => import('./b2c3'),
  b2c4: () => import('./b2c4'),
  b2c5: () => import('./b2c5'),
  b3c1: () => import('./b3c1'),
  b3c2: () => import('./b3c2'),
  b3c3: () => import('./b3c3'),
  b3c4: () => import('./b3c4'),
  b4c1: () => import('./b4c1'),
  b4c2: () => import('./b4c2'),
  b4c3: () => import('./b4c3'),
  b4c4: () => import('./b4c4'),
  b5c1: () => import('./b5c1'),
  b5c2: () => import('./b5c2'),
  b5c3: () => import('./b5c3'),
  b5c4: () => import('./b5c4'),
  b6c1: () => import('./b6c1'),
  b6c2: () => import('./b6c2'),
  b6c3: () => import('./b6c3'),
  b6c4: () => import('./b6c4'),
  b7c1: () => import('./b7c1'),
  b7c2: () => import('./b7c2'),
  b7c3: () => import('./b7c3'),
};
