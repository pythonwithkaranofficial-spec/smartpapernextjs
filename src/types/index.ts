export interface QuestionDistribution {
  mcq: number;          // 1 Mark
  vsa: number;          // 2 Marks (Very Short Answer)
  sa: number;           // 3 Marks (Short Answer)
  la: number;           // 5 Marks (Long Answer)
  caseStudy: number;    // 4 Marks (Case Study / Source Based)
  assertionReason: number; // 1 Mark (Assertion Reason)
}

export interface PaperOptions {
  includeSchoolName: boolean;
  schoolName: string;
  includeTeacherName: boolean;
  teacherName: string;
  includeSchoolLogo: boolean;
  includeClass: boolean;
  includeSubject: boolean;
  includeTime: boolean;
  includeMaxMarks: boolean;
  includeInstructions: boolean;
  instructionsText: string;
  includeInternalChoice: boolean;
  includeAnswerKey?: boolean;
  numberOfSets?: number; // 1, 2, or 3 sets
}

export interface PaperConfig {
  classId: string;
  subject: string;
  examType: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: 'English' | 'Hindi' | 'Bilingual';
  totalMarks: number;
  duration: string;
  questionDistribution: QuestionDistribution;
  options: PaperOptions;
  selectedChapters?: string[];
  isCustom?: boolean;
  customClass?: string;
  customSubject?: string;
  customChapters?: string;
  blueprintId?: string;
  isBlueprintMode?: boolean;
  unitWeightage?: { unit: string; topic: string; marks: number }[];
  numberOfSets?: number;
}

export interface Question {
  id: string;
  number: number;
  text: string;
  marks: number;
  type: keyof QuestionDistribution;
  subQuestions?: string[]; // For Case study / Source based questions
  hint?: string;
  choices?: string[]; // For MCQ choices
  orQuestion?: string; // For internal choices
  solution?: string; // Detailed step-by-step solution / answer & marking scheme
  orSolution?: string; // Solution for internal choice question
}

export interface PaperSection {
  name: string; // "Section A", "Section B", etc.
  description: string; // e.g. "Multiple Choice Questions (1 Mark each)"
  marksPerQuestion: number;
  questions: Question[];
}

export interface GeneratedPaper {
  schoolName?: string;
  teacherName?: string;
  examName: string;
  subject: string;
  classText: string;
  timeText: string;
  maxMarksText: string;
  instructions: string[];
  sections: PaperSection[];
  totalQuestions: number;
  totalMarks: number;
  hasAnswerKey?: boolean;
  setName?: string; // e.g. "SET A", "SET B", "SET C"
  sets?: GeneratedPaper[]; // Array of parallel paper variants if multi-set is enabled
}

export interface SchoolProfile {
  id: string;
  profileName: string;
  schoolName: string;
  teacherName: string;
  instructionsText?: string;
  logoUrl?: string;
  isDefault?: boolean;
}
