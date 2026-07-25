import { z } from "zod";

export const questionDistributionSchema = z.object({
  mcq: z.number().min(0, "Must be 0 or more"),
  vsa: z.number().min(0, "Must be 0 or more"),
  sa: z.number().min(0, "Must be 0 or more"),
  la: z.number().min(0, "Must be 0 or more"),
  caseStudy: z.number().min(0, "Must be 0 or more"),
  assertionReason: z.number().min(0, "Must be 0 or more"),
});

export const paperOptionsSchema = z.object({
  includeSchoolName: z.boolean(),
  schoolName: z.string().max(100, "School Name is too long").default(""),
  includeTeacherName: z.boolean(),
  teacherName: z.string().max(50, "Teacher Name is too long").default(""),
  includeSchoolLogo: z.boolean().default(false),
  includeClass: z.boolean().default(true),
  includeSubject: z.boolean().default(true),
  includeTime: z.boolean().default(true),
  includeMaxMarks: z.boolean().default(true),
  includeInstructions: z.boolean().default(true),
  instructionsText: z.string().max(3000, "Instructions are too long").default(""),
  includeInternalChoice: z.boolean().default(false),
  includeAnswerKey: z.boolean().default(true),
  numberOfSets: z.number().min(1).max(3).default(1),
});

export const paperConfigSchema = z.object({
  classId: z.string().min(1, "Please select a class"),
  subject: z.string().min(1, "Please select a subject"),
  examType: z.string().min(1, "Please select an exam type"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  language: z.enum(["English", "Hindi", "Bilingual"]),
  totalMarks: z.number().min(5, "Marks must be at least 5").max(100, "Marks cannot exceed 100"),
  duration: z.string().min(1, "Duration is required"),
  questionDistribution: questionDistributionSchema,
  options: paperOptionsSchema,
  selectedChapters: z.array(z.string()).optional(),
  isCustom: z.boolean().optional(),
  customClass: z.string().optional(),
  customSubject: z.string().optional(),
  customChapters: z.string().optional(),
  blueprintId: z.string().optional(),
  isBlueprintMode: z.boolean().optional(),
  unitWeightage: z
    .array(
      z.object({
        unit: z.string(),
        topic: z.string(),
        marks: z.number(),
      })
    )
    .optional(),
});

export type PaperConfigInput = z.infer<typeof paperConfigSchema>;
