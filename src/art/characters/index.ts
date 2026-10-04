import { hedwig } from './hedwig';
import { heroes } from './heroes';
import { hosts1 } from './hosts1';
import { hosts2 } from './hosts2';

/** Every character portrait, keyed by id. */
export const characters: Record<string, () => string> = {
  hedwig: () => hedwig(),
  ...heroes,
  ...hosts1,
  ...hosts2,
};
