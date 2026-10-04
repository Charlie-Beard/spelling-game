import { hedwig } from './hedwig';

/** Every character portrait, keyed by id. */
export const characters: Record<string, () => string> = {
  hedwig: () => hedwig(),
};
