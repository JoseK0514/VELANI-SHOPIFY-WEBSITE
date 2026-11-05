export interface EvaluationRates { inputPerMillion: number; outputPerMillion: number }

export function reserveEvaluationCost(inputBytes: number, maxOutputTokens: number, rates: EvaluationRates, reservedUsd: number, budgetUsd: number): number {
  if (![inputBytes, maxOutputTokens, rates.inputPerMillion, rates.outputPerMillion, reservedUsd, budgetUsd].every(Number.isFinite)
    || inputBytes < 0 || maxOutputTokens <= 0 || rates.inputPerMillion <= 0 || rates.outputPerMillion <= 0 || reservedUsd < 0 || budgetUsd <= 0) {
    throw new Error('Invalid evaluation budget');
  }
  // A deliberately conservative byte bound, plus framing allowance for three text messages.
  const upperBound = Math.ceil(((inputBytes + 1024) * rates.inputPerMillion + maxOutputTokens * rates.outputPerMillion) / 1_000_000 * 1_000_000) / 1_000_000;
  if (reservedUsd + upperBound > budgetUsd) throw new Error('Evaluation budget exhausted');
  return upperBound;
}
