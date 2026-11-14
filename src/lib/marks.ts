import type { QuestionDistribution } from "@/types";

/**
 * Marks awarded per question of each distribution type.
 *
 * Kept dependency-free (type-only imports) so that `scripts/check-blueprints.mjs`
 * can transpile and import it directly.
 */
export type MarksPerType = Record<keyof QuestionDistribution, number>;

/** Generic CBSE weights used whenever a blueprint does not override them. */
export const DEFAULT_MARKS_PER_TYPE: Readonly<MarksPerType> = Object.freeze({
  mcq: 1,
  assertionReason: 1,
  vsa: 2,
  sa: 3,
  caseStudy: 4,
  la: 5,
});

export const QUESTION_TYPES: (keyof QuestionDistribution)[] = [
  "mcq",
  "assertionReason",
  "vsa",
  "sa",
  "caseStudy",
  "la",
];

/** Merges optional per-blueprint overrides (e.g. `{ caseStudy: 3 }`) over the defaults. */
export function resolveMarksPerType(
  overrides?: Partial<MarksPerType> | null
): MarksPerType {
  const resolved: MarksPerType = { ...DEFAULT_MARKS_PER_TYPE };
  if (overrides) {
    for (const type of QUESTION_TYPES) {
      const value = overrides[type];
      if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        resolved[type] = value;
      }
    }
  }
  return resolved;
}

/** Total marks produced by a question distribution, honouring overrides. */
export function computeDistributionTotal(
  dist: Partial<QuestionDistribution> | null | undefined,
  overrides?: Partial<MarksPerType> | null
): number {
  if (!dist) return 0;
  const weights = resolveMarksPerType(overrides);
  return QUESTION_TYPES.reduce(
    (sum, type) => sum + (Number(dist[type]) || 0) * weights[type],
    0
  );
}
