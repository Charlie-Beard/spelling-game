/**
 * The grown-ups' gate: a times-table or division sum (6 × 8, 50 ÷ 5) that
 * a grown-up answers in a moment and a six-year-old can't, yet.
 */

export interface Sum {
  text: string;
  answer: number;
}

/** Picks a sum. `rand` returns 0..1 (Math.random by default). */
export function makeSum(rand: () => number = Math.random): Sum {
  const pick = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
  // No 1s, 2s or 10s: those he might know.
  const a = pick(3, 9);
  const b = pick(3, 9);
  return rand() < 0.5 ? { text: `${a} × ${b}`, answer: a * b } : { text: `${a * b} ÷ ${a}`, answer: b };
}
