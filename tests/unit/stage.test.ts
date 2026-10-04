import { describe, expect, it } from 'vitest';
import { fitScale, isPortrait } from '../../src/stage';

describe('stage scaling', () => {
  it('is exactly 1 on the iPad home-screen viewport', () => {
    expect(fitScale(1180, 820)).toBe(1);
  });

  it('shrinks to fit a Safari tab with the toolbar showing', () => {
    expect(fitScale(1180, 760)).toBeCloseTo(760 / 820);
  });

  it('keeps the aspect ratio on wider screens', () => {
    expect(fitScale(2360, 820)).toBe(1);
    expect(fitScale(2360, 1640)).toBe(2);
  });

  it('detects portrait', () => {
    expect(isPortrait(820, 1180)).toBe(true);
    expect(isPortrait(1180, 820)).toBe(false);
  });
});
