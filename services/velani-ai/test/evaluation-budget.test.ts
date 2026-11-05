import { describe, expect, it } from 'vitest';
import { reserveEvaluationCost } from '../scripts/evaluation-budget.js';

describe('paid evaluation authorization', () => {
  const rates = { inputPerMillion: 12.5, outputPerMillion: 50 };
  it('reserves full completion and input framing cost before inference, including failed calls', () => {
    const first = reserveEvaluationCost(20_000, 3000, rates, 0, 3);
    expect(first).toBe(0.4128);
    // A failed or timed-out request remains reserved: it may have been billed upstream.
    expect(() => reserveEvaluationCost(20_000, 3000, rates, first, 0.8)).toThrow('budget exhausted');
  });
  it('allows the exact cap and rejects invalid or nonfinite prices rather than treating them as free', () => {
    const bound = reserveEvaluationCost(20_000, 3000, rates, 0, 3);
    expect(reserveEvaluationCost(20_000, 3000, rates, 0, bound)).toBe(bound);
    for (const inputPerMillion of [0, -1, NaN, Infinity]) {
      expect(() => reserveEvaluationCost(0, 3000, { ...rates, inputPerMillion }, 0, 3)).toThrow('Invalid');
    }
  });
});
