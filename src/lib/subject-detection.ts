import type { PaperConfig } from "@/types";

/**
 * Single source of truth for subject / class detection.
 *
 * Shared by the blueprint lookup, the prompt builder and the generate route so they
 * can never disagree about which specialised paper pattern applies. Matching is done
 * on canonical subject keys (exact), never on loose substrings — "Social Science",
 * "Computer Science" and "Political Science" must not be treated as Science, and
 * "economics" must not match "cs".
 *
 * Kept dependency-free (type-only imports) so scripts/check-blueprints.mjs can
 * transpile it.
 */

/** Synonyms / display names → canonical subject key used by the app (subjects-data.ts). */
const SUBJECT_ALIASES: Record<string, string> = {
  math: "maths",
  mathematics: "maths",
  maths_standard: "maths",
  mathematics_standard: "maths",
  maths_basic: "mathsbasic",
  mathematics_basic: "mathsbasic",
  basic_maths: "mathsbasic",
  sci: "science",
  sst: "social",
  social_science: "social",
  socialscience: "social",
  social_studies: "social",
  english_core: "englishcore",
  english_elective: "englishelective",
  english_language_and_literature: "englishlanglit",
  english_lang_lit: "englishlanglit",
  english_communicative: "englishcommunicative",
  "हिन्दी": "hindi",
  "हिंदी": "hindi",
  "हिन्दी_कोर": "hindi_core",
  "हिंदी_कोर": "hindi_core",
  hindicore: "hindi_core",
  "हिन्दी_ऐच्छिक": "hindi_elective",
  "हिंदी_ऐच्छिक": "hindi_elective",
  hindielective: "hindi_elective",
  chem: "chemistry",
  bio: "biology",
  computer_science: "cs",
  computerscience: "cs",
  informatics_practices: "ip",
  informaticspractices: "ip",
  computer_application: "computer_applications",
  computerapplications: "computer_applications",
  information_technology: "it",
  artificial_intelligence: "ai",
  accountancy: "accounts",
  accounting: "accounts",
  acc: "accounts",
  business_studies: "business",
  businessstudies: "business",
  bst: "business",
  eco: "economics",
  econ: "economics",
  hist: "history",
  geo: "geography",
  political_science: "polscience",
  politicalscience: "polscience",
  pol_science: "polscience",
  pol_sci: "polscience",
  physical_education: "phyedu",
  physicaleducation: "phyedu",
  phy_edu: "phyedu",
  pe: "phyedu",
  fine_arts: "finearts",
  painting: "finearts",
};

/** Lowercases, trims and canonicalises a subject id / display name. */
export function normalizeSubjectKey(subject?: string | null): string {
  const key = (subject || "")
    .toLowerCase()
    .trim()
    .replace(/[\s\-]+/g, "_");
  return SUBJECT_ALIASES[key] || key;
}

const HINDI_SUBJECT_KEYS = new Set(["hindi", "hindi_core", "hindi_elective"]);
export function isHindiSubjectKey(subject?: string | null): boolean {
  return HINDI_SUBJECT_KEYS.has(normalizeSubjectKey(subject));
}

/** Subjects whose papers contain program code (identifiers with underscores, `1/2` etc.). */
const COMPUTER_SUBJECT_KEYS = new Set(["cs", "ip", "computer_applications", "it", "ai"]);
export function isComputerSubjectKey(subject?: string | null): boolean {
  return COMPUTER_SUBJECT_KEYS.has(normalizeSubjectKey(subject));
}

const ROMAN_CLASSES: Record<string, string> = { ix: "9", x: "10", xi: "11", xii: "12" };

/** Extracts a class number ("9".."12") from ids like "10", "Class 10", "Class XII". */
export function normalizeClassId(classId?: string | number | null): string {
  const raw = String(classId ?? "").toLowerCase().replace(/class|std\.?|grade/g, "").trim();
  if (ROMAN_CLASSES[raw]) return ROMAN_CLASSES[raw];
  const num = raw.match(/\d+/);
  return num ? String(parseInt(num[0], 10)) : raw;
}

type SubjectConfig = Pick<
  PaperConfig,
  "classId" | "subject" | "examType" | "totalMarks" | "isCustom" | "customClass" | "customSubject"
>;

/** Subject key actually being generated (custom papers use the free-text subject). */
export function getEffectiveSubjectKey(config: SubjectConfig): string {
  return normalizeSubjectKey(
    config.isCustom ? config.customSubject || config.subject : config.subject
  );
}

export function getEffectiveClassId(config: SubjectConfig): string {
  return normalizeClassId(config.isCustom ? config.customClass || config.classId : config.classId);
}

export type FullExamKind =
  | "class12English"
  | "class10Hindi"
  | "class12Physics"
  | "class12CS"
  | "class12Biology"
  | "class12Economics"
  | "class12Geography"
  | "class10Social"
  | "class12PhyEdu"
  | "class10Science"
  | "class12Chemistry"
  | "class12Accounts";

interface FullExamSpec {
  classId: string;
  subjects: string[];
  /** Official theory total the specialised full-exam prompt generates. */
  officialTotal: number;
  /** A non-major exam type still triggers the full exam at/above this target. */
  minMarks: number;
}

/** Order matters only for readability — subject sets are disjoint. */
export const FULL_EXAM_SPECS: Record<FullExamKind, FullExamSpec> = {
  class12English: { classId: "12", subjects: ["english", "englishcore"], officialTotal: 80, minMarks: 70 },
  class10Hindi: { classId: "10", subjects: ["hindi"], officialTotal: 80, minMarks: 70 },
  class12Physics: { classId: "12", subjects: ["physics"], officialTotal: 70, minMarks: 65 },
  class12CS: { classId: "12", subjects: ["cs"], officialTotal: 70, minMarks: 65 },
  class12Biology: { classId: "12", subjects: ["biology"], officialTotal: 70, minMarks: 65 },
  class12Economics: { classId: "12", subjects: ["economics"], officialTotal: 80, minMarks: 70 },
  class12Geography: { classId: "12", subjects: ["geography"], officialTotal: 70, minMarks: 65 },
  class10Social: { classId: "10", subjects: ["social"], officialTotal: 80, minMarks: 70 },
  class12PhyEdu: { classId: "12", subjects: ["phyedu"], officialTotal: 70, minMarks: 65 },
  class10Science: { classId: "10", subjects: ["science"], officialTotal: 80, minMarks: 70 },
  class12Chemistry: { classId: "12", subjects: ["chemistry"], officialTotal: 70, minMarks: 65 },
  class12Accounts: { classId: "12", subjects: ["accounts"], officialTotal: 80, minMarks: 70 },
};

export const MAJOR_EXAM_TYPES = ["annual_exam", "pre_board", "sample_paper", "half_yearly"];

/** Which specialised subject (class + subject) the config targets, regardless of exam type. */
export function detectSubjectKind(config: SubjectConfig): FullExamKind | null {
  const classId = getEffectiveClassId(config);
  const subject = getEffectiveSubjectKey(config);
  for (const [kind, spec] of Object.entries(FULL_EXAM_SPECS) as [FullExamKind, FullExamSpec][]) {
    if (spec.classId === classId && spec.subjects.includes(subject)) return kind;
  }
  return null;
}

/** The specialised full-exam prompt that will be used for this config, if any. */
export function detectFullExamKind(config: SubjectConfig): FullExamKind | null {
  const kind = detectSubjectKind(config);
  if (!kind) return null;
  const spec = FULL_EXAM_SPECS[kind];
  const isMajor = MAJOR_EXAM_TYPES.includes(config.examType);
  const marks = config.totalMarks;

  if (kind === "class10Science") {
    // Class 10 Science historically also triggered for major exams with an unset target.
    return marks >= spec.minMarks || (isMajor && (marks >= 60 || !marks)) ? kind : null;
  }
  return isMajor || marks >= spec.minMarks ? kind : null;
}
