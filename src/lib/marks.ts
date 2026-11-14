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

/**
 * Builds a question distribution whose marks sum exactly to `totalMarks`
 * (presets for common totals, otherwise ~30% MCQ + short answers, remainder absorbed by MCQs).
 */
export function autoBalanceDistribution(
  totalMarks: number,
  overrides?: Partial<MarksPerType> | null
): QuestionDistribution {
  const weights = resolveMarksPerType(overrides);
  let candidate: QuestionDistribution;
  if (totalMarks === 40) {
    candidate = { mcq: 10, assertionReason: 2, vsa: 4, sa: 4, caseStudy: 2, la: 0 };
  } else if (totalMarks === 70) {
    candidate = { mcq: 12, assertionReason: 4, vsa: 5, sa: 7, caseStudy: 2, la: 3 };
  } else if (totalMarks === 80) {
    candidate = { mcq: 18, assertionReason: 2, vsa: 5, sa: 6, caseStudy: 3, la: 4 };
  } else {
    const mcqCount = Math.floor(totalMarks * 0.3);
    const remaining = totalMarks - mcqCount;
    candidate = {
      mcq: mcqCount,
      assertionReason: 0,
      vsa: 0,
      sa: Math.floor(remaining / weights.sa),
      caseStudy: 0,
      la: 0,
    };
  }
  const diff = totalMarks - computeDistributionTotal(candidate, overrides);
  candidate.mcq = Math.max(0, candidate.mcq + Math.round(diff / weights.mcq));
  return candidate;
}
