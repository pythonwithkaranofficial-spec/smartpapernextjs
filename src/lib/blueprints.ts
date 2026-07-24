import { QuestionDistribution } from "@/types";

export interface UnitWeightage {
  unit: string;
  topic: string;
  marks: number;
}

export interface Blueprint {
  id: string;
  classId: string;
  subject: string;
  examType: string[]; // e.g. ["annual_exam", "pre_board", "sample_paper"]
  title: string;
  board: string;
  year: number;
  totalMarks: number;
  duration: string;
  questionDistribution: QuestionDistribution;
  selectedChapters: string[];
  unitWeightage: UnitWeightage[];
  defaultInstructions: string;
}

export const BLUEPRINTS: Blueprint[] = [
  {
    id: "cbse-12-maths-2026",
    classId: "12",
    subject: "maths",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Mathematics Official Blueprint 2026",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 18,
      assertionReason: 2,
      vsa: 5,
      sa: 6,
      la: 4,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "I", topic: "Relations & Functions", marks: 8 },
      { unit: "II", topic: "Algebra", marks: 10 },
      { unit: "III", topic: "Calculus", marks: 35 },
      { unit: "IV", topic: "Vectors & 3D Geometry", marks: 14 },
      { unit: "V", topic: "Linear Programming", marks: 5 },
      { unit: "VI", topic: "Probability", marks: 8 },
    ],
    defaultInstructions: `1. This question paper contains 38 questions divided into 5 Sections: A, B, C, D and E.
2. Section A comprises 20 questions of 1 mark each (18 MCQs and 2 Assertion-Reason questions).
3. Section B comprises 5 Very Short Answer (VSA) type questions of 2 marks each.
4. Section C comprises 6 Short Answer (SA) type questions of 3 marks each.
5. Section D comprises 4 Long Answer (LA) type questions of 5 marks each.
6. Section E comprises 3 Case-Based integrated units of assessment (4 marks each) with sub-parts.
7. All questions are compulsory. Internal choices are provided in 2 questions of Section B, 2 questions of Section C, and 2 questions of Section D.
8. Use of calculators is not permitted.`,
  },
  {
    id: "cbse-12-physics-2026",
    classId: "12",
    subject: "physics",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Physics Official Blueprint 2026",
    board: "CBSE",
    year: 2026,
    totalMarks: 70,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 16,
      assertionReason: 0,
      vsa: 5,
      sa: 7,
      la: 3,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "I", topic: "Electrostatics", marks: 16 },
      { unit: "II", topic: "Magnetic Effects of Current", marks: 17 },
      { unit: "III", topic: "Electromagnetic Waves & Optics", marks: 18 },
      { unit: "IV", topic: "Dual Nature of Radiation", marks: 12 },
      { unit: "V", topic: "Electronic Devices", marks: 7 },
    ],
    defaultInstructions: `1. This question paper contains 33 questions divided into 5 Sections: A, B, C, D and E.
2. Section A comprises 16 MCQs of 1 mark each.
3. Section B comprises 5 Very Short Answer (VSA) type questions of 2 marks each.
4. Section C comprises 7 Short Answer (SA) type questions of 3 marks each.
5. Section D comprises 2 Case-Based questions of 4 marks each.
6. Section E comprises 3 Long Answer (LA) type questions of 5 marks each.
7. All questions are compulsory. Internal choices are provided in some questions.
8. Use of log tables and calculators is strictly prohibited.`,
  },
  {
    id: "cbse-12-chemistry-2026",
    classId: "12",
    subject: "chemistry",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Chemistry Official Blueprint 2026",
    board: "CBSE",
    year: 2026,
    totalMarks: 70,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 16,
      assertionReason: 0,
      vsa: 5,
      sa: 7,
      la: 3,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "1", topic: "Solutions", marks: 7 },
      { unit: "2", topic: "Electrochemistry", marks: 9 },
      { unit: "3", topic: "Chemical Kinetics", marks: 7 },
      { unit: "4", topic: "d & f Block Elements", marks: 7 },
      { unit: "5", topic: "Coordination Compounds", marks: 7 },
      { unit: "6", topic: "Haloalkanes & Haloarenes", marks: 6 },
      { unit: "7", topic: "Alcohols, Phenols & Ethers", marks: 6 },
      { unit: "8", topic: "Aldehydes & Ketones", marks: 8 },
      { unit: "9", topic: "Amines", marks: 6 },
      { unit: "10", topic: "Biomolecules", marks: 7 },
    ],
    defaultInstructions: `1. This question paper contains 33 questions divided into 5 Sections: A, B, C, D and E.
2. Section A comprises 16 MCQs of 1 mark each.
3. Section B comprises 5 Very Short Answer (VSA) type questions of 2 marks each.
4. Section C comprises 7 Short Answer (SA) type questions of 3 marks each.
5. Section D comprises 2 Case-Based questions of 4 marks each.
6. Section E comprises 3 Long Answer (LA) type questions of 5 marks each.
7. All questions are compulsory. Internal choices are provided in some questions.
8. Log tables may be used if necessary. Use of calculators is strictly prohibited.`,
  },
  {
    id: "cbse-12-biology-2026",
    classId: "12",
    subject: "biology",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Biology Official Blueprint 2026",
    board: "CBSE",
    year: 2026,
    totalMarks: 70,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 16,
      assertionReason: 0,
      vsa: 5,
      sa: 7,
      la: 3,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "VI", topic: "Reproduction", marks: 16 },
      { unit: "VII", topic: "Genetics & Evolution", marks: 20 },
      { unit: "VIII", topic: "Biology & Human Welfare", marks: 12 },
      { unit: "IX", topic: "Biotechnology", marks: 12 },
      { unit: "X", topic: "Ecology & Environment", marks: 10 },
    ],
    defaultInstructions: `1. This question paper contains 33 questions divided into 5 Sections: A, B, C, D and E.
2. Section A comprises 16 MCQs of 1 mark each.
3. Section B comprises 5 Very Short Answer (VSA) type questions of 2 marks each.
4. Section C comprises 7 Short Answer (SA) type questions of 3 marks each.
5. Section D comprises 2 Case-Based questions of 4 marks each.
6. Section E comprises 3 Long Answer (LA) type questions of 5 marks each.
7. All questions are compulsory. Internal choices are provided in some questions.
8. Diagrams should be drawn neatly and labeled clearly wherever required.`,
  },
  {
    id: "cbse-12-geography-2026",
    classId: "12",
    subject: "geography",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Geography Official Blueprint 2026",
    board: "CBSE",
    year: 2026,
    totalMarks: 70,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 17,
      assertionReason: 0,
      vsa: 2,
      sa: 4,
      la: 5,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "A", topic: "Fundamentals of Human Geography", marks: 30 },
      { unit: "B", topic: "India: People and Economy", marks: 30 },
      { unit: "C", topic: "Map Work (World & India)", marks: 10 },
    ],
    defaultInstructions: `1. This question paper contains 30 questions. All questions are compulsory.
2. Question Nos. 1 to 17 are Multiple Choice Questions of 1 mark each.
3. Question Nos. 18 and 19 are Source-based questions of 3 marks each.
4. Question Nos. 20 to 23 are Short Answer Type questions of 3 marks each.
5. Question Nos. 24 to 28 are Long Answer Type questions of 5 marks each.
6. Question Nos. 29 & 30 are Map-based questions carrying 5 marks each.`,
  },
  {
    id: "cbse-12-english-2026",
    classId: "12",
    subject: "english",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 English Core Official Blueprint 2026",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 16,
      assertionReason: 0,
      vsa: 6,
      sa: 7,
      la: 4,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Sec A", topic: "Reading Comprehension Skills", marks: 22 },
      { unit: "Sec B", topic: "Creative Writing Skills", marks: 18 },
      { unit: "Sec C", topic: "Literature Prose & Poetry", marks: 40 },
    ],
    defaultInstructions: `1. This question paper has 3 Sections: A (Reading Skills), B (Creative Writing Skills), and C (Literature).
2. Section A contains Reading Passages carrying 22 marks.
3. Section B contains Creative Writing Skills tasks carrying 18 marks.
4. Section C contains Literature Extracts, Short Answer Questions, and Long Answer Questions carrying 40 marks.
5. Adhere strictly to the prescribed word limit for each question.`,
  },
  {
    id: "cbse-12-hindi-2026",
    classId: "12",
    subject: "hindi",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Hindi Core / Elective Blueprint 2026",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 40,
      assertionReason: 0,
      vsa: 0,
      sa: 4,
      la: 4,
      caseStudy: 0,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "खण्ड क", topic: "अपठित बोध (गद्यांश व काव्यांश)", marks: 20 },
      { unit: "खण्ड ख", topic: "अभिव्यक्ति और माध्यम व रचनात्मक लेखन", marks: 20 },
      { unit: "खण्ड ग", topic: "पाठ्यपुस्तक (आरोह व वितान)", marks: 40 },
    ],
    defaultInstructions: `1. इस प्रश्नपत्र के दो खण्ड हैं - खण्ड 'अ' और खण्ड 'ब'।
2. खण्ड 'अ' में बहुविकल्पीय प्रश्न दिए गए हैं।
3. खण्ड 'ब' में वर्णनात्मक प्रश्न दिए गए हैं।
4. प्रश्नों के उत्तर देते समय क्रमानुसार एवं स्वच्छता का ध्यान रखें।`,
  },
  {
    id: "cbse-12-economics-2026",
    classId: "12",
    subject: "economics",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Economics Official Blueprint 2026",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 20,
      assertionReason: 0,
      vsa: 4,
      sa: 6,
      la: 4,
      caseStudy: 0,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Part A", topic: "Introductory Macroeconomics", marks: 40 },
      { unit: "Part B", topic: "Indian Economic Development", marks: 40 },
    ],
    defaultInstructions: `1. This question paper contains two parts: Part A (Introductory Macroeconomics) and Part B (Indian Economic Development).
2. Question Nos. 1 to 10 and 18 to 27 are Multiple Choice Questions of 1 mark each.
3. Question Nos. 11 to 12 and 28 to 29 are Short Answer Type I questions of 3 marks each.
4. Question Nos. 13 to 15 and 30 to 32 are Short Answer Type II questions of 4 marks each.
5. Question Nos. 16 to 17 and 33 to 34 are Long Answer Type questions of 6 marks each.`,
  },
  {
    id: "cbse-12-polscience-2026",
    classId: "12",
    subject: "polscience",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Political Science Official Blueprint 2026",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 12,
      assertionReason: 0,
      vsa: 6,
      sa: 5,
      la: 4,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "A1", topic: "The End of Bipolarity", marks: 6 },
      { unit: "A2", topic: "Contemporary Centres of Power", marks: 6 },
      { unit: "A3", topic: "Contemporary South Asia", marks: 6 },
      { unit: "A4", topic: "International Organizations", marks: 6 },
      { unit: "A5", topic: "Security in the Contemporary World", marks: 6 },
      { unit: "A6", topic: "Environment and Natural Resources", marks: 6 },
      { unit: "A7", topic: "Globalisation", marks: 4 },
      { unit: "B1", topic: "Challenges of Nation-Building", marks: 6 },
      { unit: "B2", topic: "Era of One-Party Dominance", marks: 4 },
      { unit: "B3", topic: "Politics of Planned Development", marks: 2 },
      { unit: "B4", topic: "India's External Relations", marks: 6 },
      { unit: "B5", topic: "Challenges to and Restoration of the Congress System", marks: 4 },
      { unit: "B6", topic: "The Crisis of Democratic Order", marks: 4 },
      { unit: "B7", topic: "Regional Aspirations", marks: 6 },
      { unit: "B8", topic: "Recent Developments in Indian Politics", marks: 8 },
    ],
    defaultInstructions: `1. The question paper contains 30 questions divided into 5 Sections: A, B, C, D and E.
2. Section A comprises Question Nos. 1-12 (MCQs of 1 mark each).
3. Section B comprises Question Nos. 13-18 (Very Short Answer Type of 2 marks each).
4. Section C comprises Question Nos. 19-23 (Short Answer Type of 4 marks each).
5. Section D comprises Question Nos. 24-26 (Passage/Cartoon/Map-based questions of 4 marks each).
6. Section E comprises Question Nos. 27-30 (Long Answer Type of 6 marks each).`,
  },
  {
    id: "cbse-11-polscience-2026",
    classId: "11",
    subject: "polscience",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 11 Political Science Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 12,
      assertionReason: 0,
      vsa: 6,
      sa: 5,
      la: 4,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "A1", topic: "Constitution: Why and How? & Rights in Indian Constitution", marks: 8 },
      { unit: "A2", topic: "Election and Representation", marks: 6 },
      { unit: "A3", topic: "Executive, Legislature & Judiciary", marks: 12 },
      { unit: "A4", topic: "Federalism", marks: 6 },
      { unit: "A5", topic: "Local Governments & Living Document", marks: 8 },
      { unit: "B1", topic: "Political Theory: An Introduction", marks: 4 },
      { unit: "B2", topic: "Freedom & Equality", marks: 12 },
      { unit: "B3", topic: "Social Justice", marks: 6 },
      { unit: "B4", topic: "Rights", marks: 4 },
      { unit: "B5", topic: "Citizenship", marks: 8 },
      { unit: "B6", topic: "Nationalism & Secularism", marks: 6 },
    ],
    defaultInstructions: `1. The question paper contains 30 questions divided into 5 Sections: A, B, C, D and E.
2. Section A comprises Question Nos. 1-12 (MCQs of 1 mark each).
3. Section B comprises Question Nos. 13-18 (Very Short Answer Type of 2 marks each).
4. Section C comprises Question Nos. 19-23 (Short Answer Type of 4 marks each).
5. Section D comprises Question Nos. 24-26 (Passage/Cartoon/Map-based questions of 4 marks each).
6. Section E comprises Question Nos. 27-30 (Long Answer Type of 6 marks each).`,
  },
  {
    id: "cbse-12-history-2026",
    classId: "12",
    subject: "history",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 History Official Blueprint 2026",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 20,
      assertionReason: 0,
      vsa: 0,
      sa: 6,
      la: 3,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Part I", topic: "Themes in Indian History Part I (Ancient)", marks: 25 },
      { unit: "Part II", topic: "Themes in Indian History Part II (Medieval)", marks: 25 },
      { unit: "Part III", topic: "Themes in Indian History Part III (Modern)", marks: 25 },
      { unit: "Map", topic: "Map Work", marks: 5 },
    ],
    defaultInstructions: `1. The question paper comprises 5 Sections: A, B, C, D and E. There are 34 questions in the question paper. All questions are compulsory.
2. Section A - Question 1 to 21 are MCQs of 1 mark each.
3. Section B - Question 22 to 27 are Short Answer Type Questions, carrying 3 marks each.
4. Section C - Question 28 to 30 are Long Answer Type Questions, carrying 8 marks each.
5. Section D - Question 31 to 33 are Source-based questions with three sub-questions and are of 4 marks each.
6. Section E - Question 34 is Map-based, carrying 5 marks.`,
  },
  {
    id: "cbse-10-maths-2026",
    classId: "10",
    subject: "maths",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 10 Mathematics Standard (Code 041) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 20,
      assertionReason: 0,
      vsa: 5,
      sa: 6,
      la: 4,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "I", topic: "Number Systems (Real Numbers)", marks: 6 },
      { unit: "II", topic: "Algebra (Polynomials, Linear Eq, Quadratic Eq, AP)", marks: 20 },
      { unit: "III", topic: "Coordinate Geometry", marks: 6 },
      { unit: "IV", topic: "Geometry (Triangles & Circles)", marks: 15 },
      { unit: "V", topic: "Trigonometry (Intro, Identities, Heights & Distances)", marks: 12 },
      { unit: "VI", topic: "Mensuration (Areas & Surface Areas/Volumes)", marks: 10 },
      { unit: "VII", topic: "Statistics & Probability", marks: 11 },
    ],
    defaultInstructions: `1. This question paper contains 38 questions divided into 5 Sections: A, B, C, D and E.
2. Section A comprises 20 MCQs of 1 mark each (Question Nos. 1 to 20).
3. Section B comprises 5 Short Answer Type-I (VSA) questions of 2 marks each (Question Nos. 21 to 25).
4. Section C comprises 6 Short Answer Type-II (SA) questions of 3 marks each (Question Nos. 26 to 31).
5. Section D comprises 4 Long Answer Type (LA) questions of 5 marks each (Question Nos. 32 to 35).
6. Section E comprises 3 Case-Based integrated units of assessment of 4 marks each (Question Nos. 36 to 38).
7. Typology Weightage: Remembering/Understanding 54% (43 Marks), Applying 24% (19 Marks), Analysing/Evaluating/Creating 22% (18 Marks).
8. Use of calculators is strictly prohibited.`,
  },
  {
    id: "cbse-10-mathsbasic-2026",
    classId: "10",
    subject: "mathsbasic",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 10 Mathematics Basic (Code 241) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 20,
      assertionReason: 0,
      vsa: 5,
      sa: 6,
      la: 4,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "I", topic: "Number Systems (Real Numbers)", marks: 6 },
      { unit: "II", topic: "Algebra (Polynomials, Linear Eq, Quadratic Eq, AP)", marks: 20 },
      { unit: "III", topic: "Coordinate Geometry", marks: 6 },
      { unit: "IV", topic: "Geometry (Triangles & Circles)", marks: 15 },
      { unit: "V", topic: "Trigonometry (Intro, Identities, Heights & Distances)", marks: 12 },
      { unit: "VI", topic: "Mensuration (Areas & Surface Areas/Volumes)", marks: 10 },
      { unit: "VII", topic: "Statistics & Probability", marks: 11 },
    ],
    defaultInstructions: "1. This question paper contains 38 questions divided into 5 Sections: A, B, C, D and E. Total theory marks: 80.",
  },
  {
    id: "cbse-10-englishlanglit-2026",
    classId: "10",
    subject: "englishlanglit",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 10 English Language & Literature (Code 184) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 20,
      assertionReason: 0,
      vsa: 4,
      sa: 6,
      la: 4,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Sec A", topic: "Reading Skills (Discursive Passage 10M + Case-Based Factual Passage 10M)", marks: 20 },
      { unit: "Sec B", topic: "Writing Skills & Grammar (Formal Letter 5M + Analytical Paragraph 5M + Grammar 10M)", marks: 20 },
      { unit: "Sec C", topic: "Language through Literature (First Flight & Footprints Without Feet)", marks: 40 },
    ],
    defaultInstructions: `1. This question paper contains 3 Sections: Section A (Reading 20 Marks), Section B (Writing & Grammar 20 Marks) and Section C (Literature 40 Marks).
2. Attempt questions based on specific instructions given for each section. Total theory marks: 80 (Internal Assessment: 20 Marks).`,
  },
  {
    id: "cbse-10-englishcommunicative-2026",
    classId: "10",
    subject: "englishcommunicative",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 10 English Communicative (Code 101) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 18,
      assertionReason: 0,
      vsa: 4,
      sa: 5,
      la: 4,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Sec A", topic: "Reading Skills (2 Unseen Passages)", marks: 22 },
      { unit: "Sec B", topic: "Writing Skills (Application 3M, Description 4M, Formal Letter 7M, Article 8M)", marks: 22 },
      { unit: "Sec C", topic: "Grammar (Gap filling 3M, Editing/Omission 4M, Transformation 3M)", marks: 10 },
      { unit: "Sec D", topic: "Literature Textbook (Interact in English Literature Reader)", marks: 26 },
    ],
    defaultInstructions: `1. This question paper contains 4 Sections: Section A (Reading 22 Marks), Section B (Writing 22 Marks), Section C (Grammar 10 Marks) and Section D (Literature 26 Marks). Total theory marks: 80.`,
  },
  {
    id: "cbse-10-science-2026",
    classId: "10",
    subject: "science",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 10 Science Official Blueprint 2026",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 20,
      assertionReason: 0,
      vsa: 6,
      sa: 7,
      la: 3,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "I", topic: "Chemical Substances - Nature and Behaviour", marks: 25 },
      { unit: "II", topic: "World of Living", marks: 25 },
      { unit: "III", topic: "Natural Phenomena", marks: 12 },
      { unit: "IV", topic: "Effects of Current", marks: 13 },
      { unit: "V", topic: "Natural Resources", marks: 5 },
    ],
    defaultInstructions: `1. This question paper consists of 39 questions in 5 Sections: A, B, C, D and E.
2. All questions are compulsory. However, an internal choice is provided in some questions.
3. Section A consists of 20 objective type questions carrying 1 mark each (MCQs and Assertion-Reason).
4. Section B consists of 6 Very Short Answer type questions carrying 02 marks each.
5. Section C consists of 7 Short Answer type questions carrying 03 marks each.
6. Section D consists of 3 Long Answer type questions carrying 05 marks each.
7. Section E consists of 3 Source-based / Case-based units of assessment of 04 marks each with sub-parts.`,
  },
  {
    id: "cbse-10-social-2026",
    classId: "10",
    subject: "social",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 10 Social Science Official Blueprint 2026",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 20,
      assertionReason: 0,
      vsa: 4,
      sa: 5,
      la: 4,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "I", topic: "India and the Contemporary World II (History)", marks: 20 },
      { unit: "II", topic: "Contemporary India II (Geography)", marks: 20 },
      { unit: "III", topic: "Democratic Politics II (Civics)", marks: 20 },
      { unit: "IV", topic: "Understanding Economic Development (Economics)", marks: 20 },
    ],
    defaultInstructions: `1. Question paper comprises 6 Sections: A, B, C, D, E and F. There are 37 questions in the paper. All questions are compulsory.
2. Section A - Question 1 to 20 are MCQs of 1 mark each.
3. Section B - Question 21 to 24 are Very Short Answer Type Questions, carrying 2 marks each.
4. Section C - Question 25 to 29 are Short Answer Type Questions, carrying 3 marks each.
5. Section D - Question 30 to 33 are Long Answer Type Questions, carrying 5 marks each.
6. Section E - Question 34 to 36 are Case-Based questions with three sub-questions carrying 4 marks each.
7. Section F - Question 37 is Map-based, carrying 5 marks with two parts (37a History 2 marks, 37b Geography 3 marks).`,
  },
  {
    id: "cbse-10-english-2026",
    classId: "10",
    subject: "english",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 10 English Language & Literature Official Blueprint 2026",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 20,
      assertionReason: 0,
      vsa: 4,
      sa: 7,
      la: 4,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Sec A", topic: "Reading Skills (Discursive & Case-based)", marks: 20 },
      { unit: "Sec B", topic: "Grammar & Creative Writing Skills", marks: 20 },
      { unit: "Sec C1", topic: "First Flight (Prose & Poetry)", marks: 26 },
      { unit: "Sec C2", topic: "Footprints Without Feet", marks: 14 },
    ],
    defaultInstructions: `1. The question paper contains 3 Sections: A (Reading Skills), B (Grammar & Creative Writing), and C (Literature).
2. Section A contains 2 Reading Passages carrying 20 marks (Discursive 10M + Case-based 10M).
3. Section B contains Grammar tasks (10M) and Creative Writing exercises (10M).
4. Section C contains Literature Extracts, Short Answer Questions, and Long Answer Questions from 'First Flight' and 'Footprints Without Feet' carrying 40 marks.
5. Questions cover all prescribed chapters including 'The Making of a Scientist' and 'Madam Rides the Bus'.`,
  },
  {
    id: "cbse-10-it-2026",
    classId: "10",
    subject: "it",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 10 Information Technology (Code 402) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 50,
    duration: "2 Hours",
    questionDistribution: {
      mcq: 12,
      assertionReason: 0,
      vsa: 6,
      sa: 4,
      la: 2,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "A1", topic: "Communication Skills-II", marks: 2 },
      { unit: "A2", topic: "Self-Management Skills-II", marks: 3 },
      { unit: "A3", topic: "ICT Skills-II", marks: 1 },
      { unit: "A4", topic: "Entrepreneurial Skills-II", marks: 3 },
      { unit: "A5", topic: "Green Skills-II", marks: 1 },
      { unit: "B1", topic: "Digital Documentation (Advanced) using LibreOffice Writer", marks: 8 },
      { unit: "B2", topic: "Electronic Spreadsheet (Advanced) using LibreOffice Calc", marks: 10 },
      { unit: "B3", topic: "Database Management System using LibreOffice Base", marks: 12 },
      { unit: "B4", topic: "Maintain Healthy, Safe and Secure Working Environment", marks: 10 },
    ],
    defaultInstructions: `1. The Question Paper is divided into 2 Parts: Part A (Employability Skills - 10 Marks) and Part B (Subject Specific Skills - 40 Marks).
2. Part A contains 5 Units: Communication, Self-Management, ICT, Entrepreneurial, and Green Skills.
3. Part B contains 4 Units covering LibreOffice Writer, Calc, Base, and Workplace Safety.
4. Total marks for Theory Examination is 50 Marks (Practical Examination: 50 Marks). Time allowed is 2 Hours.`,
  },
  {
    id: "cbse-11-physics-2026",
    classId: "11",
    subject: "physics",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 11 Physics (Code 042) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 70,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 12,
      assertionReason: 4,
      vsa: 5,
      sa: 7,
      la: 3,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "U1-2", topic: "Units and Measurements & Kinematics (Ch 1-3)", marks: 23 },
      { unit: "U3-6", topic: "Laws of Motion, Work/Energy/Power, System of Particles & Gravitation (Ch 4-7)", marks: 17 },
      { unit: "U7-9", topic: "Properties of Bulk Matter, Thermodynamics & Kinetic Theory (Ch 8-12)", marks: 20 },
      { unit: "U10", topic: "Oscillations and Waves (Ch 13-14)", marks: 10 },
    ],
    defaultInstructions: `1. The Question Paper contains 33 questions divided into 5 Sections: A, B, C, D and E. All questions are compulsory.
2. Section A contains 16 questions (12 MCQs and 4 Assertion-Reasoning) of 1 mark each.
3. Section B contains 5 Short Answer Type questions of 2 marks each.
4. Section C contains 7 Short Answer Type questions of 3 marks each.
5. Section D contains 2 Case-Based questions of 4 marks each.
6. Section E contains 3 Long Answer Type questions of 5 marks each.
7. Total marks for Theory Examination is 70 Marks (Practical Examination: 30 Marks). Time allowed is 3 Hours.`,
  },
  {
    id: "cbse-12-physics-2026",
    classId: "12",
    subject: "physics",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Physics (Code 042) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 70,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 12,
      assertionReason: 4,
      vsa: 5,
      sa: 7,
      la: 3,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "U1-2", topic: "Electrostatics & Current Electricity (Ch 1-3)", marks: 16 },
      { unit: "U3-4", topic: "Magnetic Effects of Current, Magnetism, EMI & AC (Ch 4-7)", marks: 17 },
      { unit: "U5-6", topic: "Electromagnetic Waves & Optics (Ch 8-10)", marks: 18 },
      { unit: "U7-8", topic: "Dual Nature of Radiation/Matter, Atoms & Nuclei (Ch 11-13)", marks: 12 },
      { unit: "U9", topic: "Semiconductor Electronics: Materials, Devices & Simple Circuits (Ch 14)", marks: 7 },
    ],
    defaultInstructions: `1. The Question Paper contains 33 questions divided into 5 Sections: A, B, C, D and E. All questions are compulsory.
2. Section A contains 16 questions (12 MCQs and 4 Assertion-Reasoning) of 1 mark each.
3. Section B contains 5 Short Answer Type questions of 2 marks each.
4. Section C contains 7 Short Answer Type questions of 3 marks each.
5. Section D contains 2 Case-Based questions of 4 marks each.
6. Section E contains 3 Long Answer Type questions of 5 marks each.
7. Total marks for Theory Examination is 70 Marks (Practical Examination: 30 Marks). Time allowed is 3 Hours.`,
  },
  {
    id: "cbse-11-phyedu-2026",
    classId: "11",
    subject: "phyedu",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 11 Physical Education (Code 048) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 70,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 18,
      assertionReason: 0,
      vsa: 5,
      sa: 5,
      la: 3,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "U1", topic: "Changing Trends & Career in Physical Education", marks: 4 },
      { unit: "U2", topic: "Olympic Value Education", marks: 5 },
      { unit: "U3", topic: "Yoga", marks: 6 },
      { unit: "U4", topic: "Physical Education & Sports for CWSN", marks: 4 },
      { unit: "U5", topic: "Physical Fitness, Wellness and Lifestyle", marks: 5 },
      { unit: "U6", topic: "Test, Measurements & Evaluation", marks: 8 },
      { unit: "U7", topic: "Fundamentals of Anatomy and Physiology in Sports", marks: 8 },
      { unit: "U8", topic: "Fundamentals of Kinesiology and Biomechanics in Sports", marks: 4 },
      { unit: "U9", topic: "Psychology and Sports", marks: 7 },
      { unit: "U10", topic: "Training & Doping in Sports", marks: 7 },
    ],
    defaultInstructions: `1. The question paper consists of 34 questions divided into 5 Sections: A, B, C, D and E.
2. Section A consists of Question 1 to 18 carrying 1 mark each and are Multiple Choice Questions.
3. Section B consists of Question 19 to 23 carrying 2 marks each and are Very Short Answer Type.
4. Section C consists of Question 24 to 28 carrying 3 marks each and are Short Answer Type.
5. Section D consists of Question 29 to 31 carrying 4 marks each and are Case-Based/Data-Based.
6. Section E consists of Question 32 to 34 carrying 5 marks each and are Long Answer Type.`,
  },
  {
    id: "cbse-12-phyedu-2026",
    classId: "12",
    subject: "phyedu",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Physical Education (Code 048) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 70,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 18,
      assertionReason: 0,
      vsa: 5,
      sa: 5,
      la: 3,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "U1", topic: "Management of Sporting Events", marks: 5 },
      { unit: "U2", topic: "Children and Women in Sports", marks: 7 },
      { unit: "U3", topic: "Yoga as Preventive measure for Lifestyle Disease", marks: 6 },
      { unit: "U4", topic: "Physical Education & Sports for CWSN", marks: 4 },
      { unit: "U5", topic: "Sports & Nutrition", marks: 7 },
      { unit: "U6", topic: "Test and Measurement in Sports", marks: 8 },
      { unit: "U7", topic: "Physiology & Injuries in Sport", marks: 4 },
      { unit: "U8", topic: "Biomechanics and Sports", marks: 10 },
      { unit: "U9", topic: "Psychology and Sports", marks: 7 },
      { unit: "U10", topic: "Training in Sports", marks: 9 },
    ],
    defaultInstructions: `1. The question paper consists of 34 questions divided into 5 Sections: A, B, C, D and E.
2. Section A consists of Question 1 to 18 carrying 1 mark each and are Multiple Choice Questions.
3. Section B consists of Question 19 to 23 carrying 2 marks each and are Very Short Answer Type.
4. Section C consists of Question 24 to 28 carrying 3 marks each and are Short Answer Type.
5. Section D consists of Question 29 to 31 carrying 4 marks each and are Case-Based/Data-Based.
6. Section E consists of Question 32 to 34 carrying 5 marks each and are Long Answer Type.`,
  },
  {
    id: "cbse-11-ip-2026",
    classId: "11",
    subject: "ip",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 11 Informatics Practices (Code 065) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 70,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 18,
      assertionReason: 0,
      vsa: 5,
      sa: 5,
      la: 3,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "U1", topic: "Introduction to Computer System", marks: 10 },
      { unit: "U2", topic: "Introduction to Python", marks: 25 },
      { unit: "U3", topic: "Database Concepts and Structured Query Language (SQL)", marks: 30 },
      { unit: "U4", topic: "Introduction to Emerging Trends", marks: 5 },
    ],
    defaultInstructions: `1. This Question Paper contains 35 questions divided into 5 Sections: A, B, C, D and E.
2. Section A contains 18 MCQs carrying 1 mark each.
3. Section B contains 5 Very Short Answer Type questions carrying 2 marks each.
4. Section C contains 5 Short Answer Type questions carrying 3 marks each.
5. Section D contains 3 Case Study/Data-based questions carrying 4 marks each.
6. Section E contains 4 Long Answer Type questions carrying 5 marks each. Total theory marks: 70.`,
  },
  {
    id: "cbse-12-ip-2026",
    classId: "12",
    subject: "ip",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Informatics Practices (Code 065) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 70,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 18,
      assertionReason: 0,
      vsa: 5,
      sa: 5,
      la: 3,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "U1", topic: "Data Handling using Pandas and Data Visualization", marks: 25 },
      { unit: "U2", topic: "Database Query using SQL", marks: 25 },
      { unit: "U3", topic: "Introduction to Computer Networks", marks: 10 },
      { unit: "U4", topic: "Societal Impacts", marks: 10 },
    ],
    defaultInstructions: `1. This Question Paper contains 35 questions divided into 5 Sections: A, B, C, D and E.
2. Section A contains 18 MCQs carrying 1 mark each.
3. Section B contains 5 Very Short Answer Type questions carrying 2 marks each.
4. Section C contains 5 Short Answer Type questions carrying 3 marks each.
5. Section D contains 3 Case Study/Data-based questions carrying 4 marks each.
6. Section E contains 4 Long Answer Type questions carrying 5 marks each. Total theory marks: 70.`,
  },
  {
    id: "cbse-11-history-2026",
    classId: "11",
    subject: "history",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 11 History (Code 027) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 21,
      assertionReason: 0,
      vsa: 6,
      sa: 3,
      la: 3,
      caseStudy: 1,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Sec I", topic: "Early Societies (Theme 1: Writing and City Life)", marks: 10 },
      { unit: "Sec II", topic: "Empires (Theme 2: Roman Empire & Theme 3: Nomadic Empires)", marks: 20 },
      { unit: "Sec III", topic: "Changing Traditions (Theme 4: Three Orders & Theme 5: Cultural Traditions)", marks: 20 },
      { unit: "Sec IV", topic: "Towards Modernisation (Theme 6: Indigenous People & Theme 7: Paths to Modernisation)", marks: 25 },
      { unit: "Map", topic: "Map Work of Related Themes", marks: 5 },
    ],
    defaultInstructions: `1. Question Paper is divided into 5 Sections: A, B, C, D and E. There are 34 questions in the paper. All questions are compulsory.
2. Section A - Question 1 to 21 are MCQs carrying 1 mark each.
3. Section B - Question 22 to 27 are Short Answer Type Questions carrying 3 marks each.
4. Section C - Question 28 to 30 are Long Answer Type Questions carrying 8 marks each.
5. Section D - Question 31 to 33 are Source-Based Questions carrying 4 marks each.
6. Section E - Question 34 is Map-based carrying 5 marks.`,
  },
  {
    id: "cbse-11-geography-2026",
    classId: "11",
    subject: "geography",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 11 Geography (Code 029) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 70,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 17,
      assertionReason: 0,
      vsa: 4,
      sa: 5,
      la: 4,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Part A", topic: "Fundamentals of Physical Geography (Units I-V & Map)", marks: 35 },
      { unit: "Part B", topic: "India Physical Environment (Units I-III & Map)", marks: 35 },
    ],
    defaultInstructions: `1. Question Paper contains 30 questions divided into 5 Sections: A, B, C, D and E.
2. Section A contains Question 1 to 17 MCQs carrying 1 mark each.
3. Section B contains Question 18 to 21 Short Answer Type Questions carrying 3 marks each.
4. Section C contains Question 22 to 25 Source/Case Based Questions carrying 4 marks each.
5. Section D contains Question 26 to 28 Long Answer Type Questions carrying 5 marks each.
6. Section E contains Question 29 & 30 Map-based questions carrying 5 marks each.`,
  },
  {
    id: "cbse-12-geography-2026",
    classId: "12",
    subject: "geography",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Geography (Code 029) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 70,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 17,
      assertionReason: 0,
      vsa: 4,
      sa: 5,
      la: 4,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Part A", topic: "Fundamentals of Human Geography (Units I-III & Map)", marks: 35 },
      { unit: "Part B", topic: "India: People and Economy (Units I-V & Map)", marks: 35 },
    ],
    defaultInstructions: `1. Question Paper contains 30 questions divided into 5 Sections: A, B, C, D and E.
2. Section A contains Question 1 to 17 MCQs carrying 1 mark each.
3. Section B contains Question 18 to 21 Short Answer Type Questions carrying 3 marks each.
4. Section C contains Question 22 to 25 Source/Case Based Questions carrying 4 marks each.
5. Section D contains Question 26 to 28 Long Answer Type Questions carrying 5 marks each.
6. Section E contains Question 29 & 30 Map-based questions carrying 5 marks each.`,
  },
  {
    id: "cbse-11-finearts-2026",
    classId: "11",
    subject: "finearts",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 11 Fine Arts / Painting (Code 049) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 30,
    duration: "2 Hours",
    questionDistribution: {
      mcq: 8,
      assertionReason: 0,
      vsa: 5,
      sa: 4,
      la: 2,
      caseStudy: 0,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "U1", topic: "Pre-Historic Rock Paintings & Art of Indus Valley", marks: 10 },
      { unit: "U2", topic: "Buddhist, Jain and Hindu Art", marks: 10 },
      { unit: "U3", topic: "Temple Sculptures, Bronzes and Indo-Islamic Architecture", marks: 10 },
    ],
    defaultInstructions: `1. The Question Paper contains 19 questions divided into 3 Sections: A, B, and C.
2. Section A contains 8 MCQs of 1 mark each.
3. Section B contains 5 Short Answer Questions of 2 marks each.
4. Section C contains 2 Long Answer Questions of 6 marks each. Total theory marks: 30 Marks (Practical: 70 Marks).`,
  },
  {
    id: "cbse-12-finearts-2026",
    classId: "12",
    subject: "finearts",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Fine Arts / Painting (Code 049) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 30,
    duration: "2 Hours",
    questionDistribution: {
      mcq: 8,
      assertionReason: 0,
      vsa: 5,
      sa: 4,
      la: 2,
      caseStudy: 0,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "U1", topic: "Rajasthani and Pahari Schools of Miniature Painting", marks: 10 },
      { unit: "U2", topic: "Mughal and Deccan Schools of Miniature Painting", marks: 10 },
      { unit: "U3", topic: "The Bengal School of Painting & Modern Trends in Indian Art", marks: 10 },
    ],
    defaultInstructions: `1. The Question Paper contains 19 questions divided into 3 Sections: A, B, and C.
2. Section A contains 8 MCQs of 1 mark each.
3. Section B contains 5 Short Answer Questions of 2 marks each.
4. Section C contains 2 Long Answer Questions of 6 marks each. Total theory marks: 30 Marks (Practical: 70 Marks).`,
  },
  {
    id: "cbse-11-maths-2026",
    classId: "11",
    subject: "maths",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 11 Mathematics (Code 041) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 18,
      assertionReason: 2,
      vsa: 5,
      sa: 6,
      la: 4,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "U1", topic: "Sets and Functions", marks: 23 },
      { unit: "U2", topic: "Algebra", marks: 25 },
      { unit: "U3", topic: "Coordinate Geometry", marks: 12 },
      { unit: "U4", topic: "Calculus", marks: 8 },
      { unit: "U5", topic: "Statistics and Probability", marks: 12 },
    ],
    defaultInstructions: `1. This question paper contains 38 questions divided into 5 Sections: A, B, C, D and E.
2. Section A comprises 20 MCQs (18 MCQs + 2 Assertion-Reason) of 1 mark each.
3. Section B comprises 5 Very Short Answer (VSA) type questions of 2 marks each.
4. Section C comprises 6 Short Answer (SA) type questions of 3 marks each.
5. Section D comprises 4 Long Answer (LA) type questions of 5 marks each.
6. Section E comprises 3 Case-Based integrated units of assessment (4 marks each) with sub-parts.`,
  },
  {
    id: "cbse-11-chemistry-2026",
    classId: "11",
    subject: "chemistry",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 11 Chemistry (Code 043) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 70,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 12,
      assertionReason: 4,
      vsa: 5,
      sa: 7,
      la: 3,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "U1", topic: "Some Basic Concepts of Chemistry", marks: 7 },
      { unit: "U2", topic: "Structure of Atom", marks: 9 },
      { unit: "U3", topic: "Classification of Elements & Periodicity", marks: 6 },
      { unit: "U4", topic: "Chemical Bonding & Molecular Structure", marks: 7 },
      { unit: "U5", topic: "Chemical Thermodynamics", marks: 9 },
      { unit: "U6", topic: "Equilibrium", marks: 7 },
      { unit: "U7", topic: "Redox Reactions", marks: 4 },
      { unit: "U8", topic: "Organic Chemistry: Basic Principles & Techniques", marks: 11 },
      { unit: "U9", topic: "Hydrocarbons", marks: 10 },
    ],
    defaultInstructions: `1. The Question Paper contains 33 questions divided into 5 Sections: A, B, C, D and E.
2. Section A contains 16 questions (12 MCQs and 4 Assertion-Reasoning) of 1 mark each.
3. Section B contains 5 Short Answer Type questions of 2 marks each.
4. Section C contains 7 Short Answer Type questions of 3 marks each.
5. Section D contains 2 Case-Based questions of 4 marks each.
6. Section E contains 3 Long Answer Type questions of 5 marks each. Total theory marks: 70.`,
  },
  {
    id: "cbse-12-chemistry-2026",
    classId: "12",
    subject: "chemistry",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Chemistry (Code 043) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 70,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 12,
      assertionReason: 4,
      vsa: 5,
      sa: 7,
      la: 3,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "U1", topic: "Solutions", marks: 7 },
      { unit: "U2", topic: "Electrochemistry", marks: 9 },
      { unit: "U3", topic: "Chemical Kinetics", marks: 7 },
      { unit: "U4", topic: "d- and f-Block Elements", marks: 7 },
      { unit: "U5", topic: "Coordination Compounds", marks: 7 },
      { unit: "U6", topic: "Haloalkanes and Haloarenes", marks: 6 },
      { unit: "U7", topic: "Alcohols, Phenols and Ethers", marks: 6 },
      { unit: "U8", topic: "Aldehydes, Ketones and Carboxylic Acids", marks: 8 },
      { unit: "U9", topic: "Amines", marks: 6 },
      { unit: "U10", topic: "Biomolecules", marks: 7 },
    ],
    defaultInstructions: `1. The Question Paper contains 33 questions divided into 5 Sections: A, B, C, D and E.
2. Section A contains 16 questions (12 MCQs and 4 Assertion-Reasoning) of 1 mark each.
3. Section B contains 5 Short Answer Type questions of 2 marks each.
4. Section C contains 7 Short Answer Type questions of 3 marks each.
5. Section D contains 2 Case-Based questions of 4 marks each.
6. Section E contains 3 Long Answer Type questions of 5 marks each. Total theory marks: 70.`,
  },
  {
    id: "cbse-11-business-2026",
    classId: "11",
    subject: "business",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 11 Business Studies (Code 054) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 20,
      assertionReason: 0,
      vsa: 4,
      sa: 6,
      la: 4,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Part A1", topic: "Nature and Purpose of Business & Forms of Business Organisations", marks: 16 },
      { unit: "Part A2", topic: "Public, Private & Global Enterprises & Business Services", marks: 14 },
      { unit: "Part A3", topic: "Emerging Modes of Business & Social Responsibility", marks: 10 },
      { unit: "Part B1", topic: "Sources of Business Finance & Small Business", marks: 20 },
      { unit: "Part B2", topic: "Internal Trade & International Business", marks: 20 },
    ],
    defaultInstructions: `1. This question paper contains 34 questions divided into 5 Sections: A, B, C, D and E.
2. Section A contains 20 MCQs of 1 mark each.
3. Section B contains 4 Short Answer Questions of 3 marks each.
4. Section C contains 6 Short Answer Questions of 4 marks each.
5. Section D contains 4 Long Answer Questions of 6 marks each. Total theory marks: 80.`,
  },
  {
    id: "cbse-12-business-2026",
    classId: "12",
    subject: "business",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Business Studies (Code 054) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 20,
      assertionReason: 0,
      vsa: 4,
      sa: 6,
      la: 4,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Part A1", topic: "Nature of Management, Principles & Business Environment", marks: 16 },
      { unit: "Part A2", topic: "Planning & Organising", marks: 14 },
      { unit: "Part A3", topic: "Staffing, Directing & Controlling", marks: 20 },
      { unit: "Part B1", topic: "Financial Management & Financial Markets", marks: 15 },
      { unit: "Part B2", topic: "Marketing Management & Consumer Protection", marks: 15 },
    ],
    defaultInstructions: `1. This question paper contains 34 questions divided into 5 Sections: A, B, C, D and E.
2. Section A contains 20 MCQs of 1 mark each.
3. Section B contains 4 Short Answer Questions of 3 marks each.
4. Section C contains 6 Short Answer Questions of 4 marks each.
5. Section D contains 4 Long Answer Questions of 6 marks each. Total theory marks: 80.`,
  },
  {
    id: "cbse-11-economics-2026",
    classId: "11",
    subject: "economics",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 11 Economics (Code 030) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 20,
      assertionReason: 0,
      vsa: 4,
      sa: 6,
      la: 4,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Part A", topic: "Statistics for Economics (Introduction, Collection, Statistical Tools)", marks: 40 },
      { unit: "Part B", topic: "Introductory Microeconomics (Demand, Supply, Consumer & Producer Equilibrium)", marks: 40 },
    ],
    defaultInstructions: `1. This question paper contains 34 questions. All questions are compulsory.
2. Section A contains 20 Multiple Choice Questions of 1 mark each.
3. Section B contains 4 Short Answer Questions of 3 marks each.
4. Section C contains 6 Short Answer Questions of 4 marks each.
5. Section D contains 4 Long Answer Questions of 6 marks each. Total theory marks: 80.`,
  },
  {
    id: "cbse-12-economics-2026",
    classId: "12",
    subject: "economics",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Economics (Code 030) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 20,
      assertionReason: 0,
      vsa: 4,
      sa: 6,
      la: 4,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Part A1", topic: "National Income and Related Aggregates", marks: 10 },
      { unit: "Part A2", topic: "Money and Banking", marks: 6 },
      { unit: "Part A3", topic: "Determination of Income and Employment", marks: 12 },
      { unit: "Part A4", topic: "Government Budget and the Economy", marks: 6 },
      { unit: "Part A5", topic: "Balance of Payments", marks: 6 },
      { unit: "Part B1", topic: "Development Experience (1947-90) & Economic Reforms since 1991", marks: 12 },
      { unit: "Part B2", topic: "Current Challenges facing Indian Economy", marks: 20 },
      { unit: "Part B3", topic: "Development Experience of India – A Comparison with Neighbours", marks: 8 },
    ],
    defaultInstructions: "1. This question paper contains 34 questions. All questions are compulsory. Total theory marks: 80.",
  },
  {
    id: "cbse-11-cs-2026",
    classId: "11",
    subject: "cs",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 11 Computer Science (Code 083) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 70,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 18,
      assertionReason: 0,
      vsa: 5,
      sa: 5,
      la: 3,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "U1", topic: "Computer Systems and Organisation", marks: 10 },
      { unit: "U2", topic: "Computational Thinking and Programming - I", marks: 45 },
      { unit: "U3", topic: "Society, Law, and Ethics", marks: 15 },
    ],
    defaultInstructions: "1. This Question Paper contains 35 questions divided into 5 Sections: A, B, C, D and E. Total theory marks: 70.",
  },
  {
    id: "cbse-12-cs-2026",
    classId: "12",
    subject: "cs",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Computer Science (Code 083) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 70,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 18,
      assertionReason: 0,
      vsa: 5,
      sa: 5,
      la: 3,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "U1", topic: "Computational Thinking and Programming - II", marks: 40 },
      { unit: "U2", topic: "Computer Networks", marks: 10 },
      { unit: "U3", topic: "Database Management", marks: 20 },
    ],
    defaultInstructions: "1. This Question Paper contains 35 questions divided into 5 Sections: A, B, C, D and E. Total theory marks: 70.",
  },
  {
    id: "cbse-11-biology-2026",
    classId: "11",
    subject: "biology",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 11 Biology (Code 044) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 70,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 12,
      assertionReason: 4,
      vsa: 5,
      sa: 7,
      la: 3,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "U1", topic: "Diversity of Living Organisms", marks: 15 },
      { unit: "U2", topic: "Structural Organization in Plants and Animals", marks: 10 },
      { unit: "U3", topic: "Cell: Structure and Function", marks: 15 },
      { unit: "U4", topic: "Plant Physiology", marks: 12 },
      { unit: "U5", topic: "Human Physiology", marks: 18 },
    ],
    defaultInstructions: "1. The Question Paper contains 33 questions divided into 5 Sections: A, B, C, D and E. Total theory marks: 70.",
  },
  {
    id: "cbse-12-biology-2026",
    classId: "12",
    subject: "biology",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Biology (Code 044) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 70,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 12,
      assertionReason: 4,
      vsa: 5,
      sa: 7,
      la: 3,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "U6", topic: "Reproduction", marks: 16 },
      { unit: "U7", topic: "Genetics and Evolution", marks: 20 },
      { unit: "U8", topic: "Biology and Human Welfare", marks: 12 },
      { unit: "U9", topic: "Biotechnology and its Applications", marks: 12 },
      { unit: "U10", topic: "Ecology and Environment", marks: 10 },
    ],
    defaultInstructions: "1. The Question Paper contains 33 questions divided into 5 Sections: A, B, C, D and E. Total theory marks: 70.",
  },
  {
    id: "cbse-11-accountancy-2026",
    classId: "11",
    subject: "accountancy",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 11 Accountancy (Code 055) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 20,
      assertionReason: 0,
      vsa: 4,
      sa: 6,
      la: 4,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Part A1", topic: "Theoretical Framework (Introduction & Theory Base)", marks: 12 },
      { unit: "Part A2", topic: "Accounting Process (Journal, Ledger, Cash Book, BRS, Depreciation, Trial Balance)", marks: 44 },
      { unit: "Part B", topic: "Financial Statements of Sole Proprietorship (Trading & PnL, Balance Sheet, Incomplete Records)", marks: 24 },
    ],
    defaultInstructions: "1. This question paper contains 34 questions divided into 5 Sections: A, B, C, D and E. Total theory marks: 80.",
  },
  {
    id: "cbse-12-accountancy-2026",
    classId: "12",
    subject: "accountancy",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Accountancy (Code 055) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 20,
      assertionReason: 0,
      vsa: 4,
      sa: 6,
      la: 4,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Part A1", topic: "Accounting for Partnership Firms (Fundamentals, Reconstitution & Dissolution)", marks: 36 },
      { unit: "Part A2", topic: "Accounting for Companies (Share Capital & Debentures)", marks: 24 },
      { unit: "Part B1", topic: "Analysis of Financial Statements (Financial Statements & Accounting Ratios)", marks: 12 },
      { unit: "Part B2", topic: "Cash Flow Statement", marks: 8 },
    ],
    defaultInstructions: "1. This question paper contains 34 questions divided into 5 Sections: A, B, C, D and E. Total theory marks: 80.",
  },
  {
    id: "cbse-11-englishcore-2026",
    classId: "11",
    subject: "englishcore",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 11 English Core (Code 301) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 18,
      assertionReason: 0,
      vsa: 4,
      sa: 5,
      la: 4,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Sec A", topic: "Reading Skills (Unseen Passages & Note Making/Summarization)", marks: 26 },
      { unit: "Sec B", topic: "Grammar & Creative Writing Skills (Ads, Posters, Speech, Debate)", marks: 23 },
      { unit: "Sec C", topic: "Literature Textbook & Supplementary Reader (Hornbill & Snapshots)", marks: 31 },
    ],
    defaultInstructions: "1. The question paper contains three sections: Section A (Reading 26 Marks), Section B (Grammar & Creative Writing 23 Marks) and Section C (Literature 31 Marks). Total theory marks: 80 (Internal Assessment: 20 Marks).",
  },
  {
    id: "cbse-12-englishcore-2026",
    classId: "12",
    subject: "englishcore",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 English Core (Code 301) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 16,
      assertionReason: 0,
      vsa: 4,
      sa: 7,
      la: 4,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Sec A", topic: "Reading Skills (Discursive Passage & Case-based Factual Passage)", marks: 22 },
      { unit: "Sec B", topic: "Creative Writing Skills (Notice, Invitation/Reply, Job App, Article/Report)", marks: 18 },
      { unit: "Sec C", topic: "Literature Text Book and Supplementary Reader (Flamingo & Vistas)", marks: 40 },
    ],
    defaultInstructions: "1. The question paper contains three sections: Section A (Reading 22 Marks), Section B (Creative Writing 18 Marks) and Section C (Literature 40 Marks). Total theory marks: 80 (Internal Assessment: 20 Marks).",
  },
  {
    id: "cbse-11-englishelective-2026",
    classId: "11",
    subject: "englishelective",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 11 English Elective (Code 001) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 25,
      assertionReason: 0,
      vsa: 4,
      sa: 5,
      la: 4,
      caseStudy: 1,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Sec A", topic: "Reading Comprehension (Unseen Passages & Poem)", marks: 25 },
      { unit: "Sec B", topic: "Creative Writing Skills (Essay, Article, Speech)", marks: 15 },
      { unit: "Sec C1", topic: "Textbook (Woven Words Prose & Poetry)", marks: 20 },
      { unit: "Sec C2", topic: "Drama (Arms and the Man)", marks: 10 },
      { unit: "Sec C3", topic: "Fiction (The Old Man and the Sea)", marks: 10 },
    ],
    defaultInstructions: "1. The question paper contains three sections: Section A (Reading 25 Marks), Section B (Creative Writing 15 Marks) and Section C (Literature, Drama & Fiction 40 Marks). Total theory marks: 80 (Seminar: 20 Marks).",
  },
  {
    id: "cbse-12-englishelective-2026",
    classId: "12",
    subject: "englishelective",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 English Elective (Code 001) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 20,
      assertionReason: 0,
      vsa: 4,
      sa: 5,
      la: 5,
      caseStudy: 1,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Sec A", topic: "Reading Comprehension (Unseen Passages & Poem)", marks: 20 },
      { unit: "Sec B1", topic: "Applied Grammar", marks: 8 },
      { unit: "Sec B2", topic: "Creative Writing Skills", marks: 20 },
      { unit: "Sec C1", topic: "Textbook (Kaleidoscope Prose, Poetry, Non-Fiction & Drama)", marks: 22 },
      { unit: "Sec C2", topic: "Fiction (A Tiger for Malgudi / The Financial Expert)", marks: 10 },
    ],
    defaultInstructions: "1. The question paper contains three sections: Section A (Reading 20 Marks), Section B (Grammar & Creative Writing 28 Marks) and Section C (Literature & Fiction 32 Marks). Total theory marks: 80 (Seminar: 20 Marks).",
  },
  {
    id: "cbse-11-hindielective-2026",
    classId: "11",
    subject: "hindi_elective",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 11 Hindi Elective (Code 002) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 16,
      assertionReason: 0,
      vsa: 4,
      sa: 6,
      la: 4,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "खण्ड क", topic: "अपठित बोध (अपठित गद्यांश 10 अंक + अपठित काव्यांश 8 अंक)", marks: 18 },
      { unit: "खण्ड ख", topic: "अभिव्यक्ति और माध्यम (जनसंचार, दृश्य लेखन, स्ववृत्त व प्रपत्र)", marks: 22 },
      { unit: "खण्ड ग", topic: "पाठ्यपुस्तक अंतरा भाग-1 एवं पूरक पुस्तक अंतराल भाग-1", marks: 40 },
    ],
    defaultInstructions: "1. प्रश्नपत्र में तीन खण्ड हैं: खण्ड क (अपठित बोध 18 अंक), खण्ड ख (अभिव्यक्ति और माध्यम 22 अंक) तथा खण्ड ग (अंतरा व अंतराल पाठ्यपुस्तक 40 अंक)।\n2. कुल लिखित परीक्षा अंक: 80 (आंतरिक मूल्यांकन: 20 अंक)।",
  },
  {
    id: "cbse-12-hindielective-2026",
    classId: "12",
    subject: "hindi_elective",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 12 Hindi Elective (Code 002) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 16,
      assertionReason: 0,
      vsa: 4,
      sa: 6,
      la: 4,
      caseStudy: 2,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "खण्ड क", topic: "अपठित बोध (अपठित गद्यांश 10 अंक + अपठित काव्यांश 8 अंक)", marks: 18 },
      { unit: "खण्ड ख", topic: "अभिव्यक्ति और माध्यम (जनसंचार माध्यम व व्यावहारिक/रचनात्मक लेखन)", marks: 22 },
      { unit: "खण्ड ग", topic: "पाठ्यपुस्तक अंतरा भाग-2 एवं पूरक पुस्तक अंतराल भाग-2", marks: 40 },
    ],
    defaultInstructions: "1. प्रश्नपत्र में तीन खण्ड हैं: खण्ड क (अपठित बोध 18 अंक), खण्ड ख (अभिव्यक्ति और माध्यम 22 अंक) तथा खण्ड ग (अंतरा व अंतराल पाठ्यपुस्तक 40 अंक)।\n2. कुल लिखित परीक्षा अंक: 80 (आंतरिक मूल्यांकन: 20 अंक)।",
  },
  {
    id: "cbse-9-ai-2026",
    classId: "9",
    subject: "ai",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 9 Artificial Intelligence (Code 417) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 50,
    duration: "2 Hours",
    questionDistribution: {
      mcq: 12,
      assertionReason: 0,
      vsa: 5,
      sa: 4,
      la: 3,
      caseStudy: 1,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Part A", topic: "Employability Skills (Communication, Self-Management, ICT, Entrepreneurial, Green)", marks: 10 },
      { unit: "Part B1", topic: "AI Reflection, Project Cycle and Ethics", marks: 10 },
      { unit: "Part B2", topic: "Data Literacy", marks: 10 },
      { unit: "Part B3", topic: "Math for AI (Statistics & Probability)", marks: 7 },
      { unit: "Part B4", topic: "Introduction to Generative AI", marks: 5 },
      { unit: "Part B5", topic: "Introduction to Python", marks: 8 },
    ],
    defaultInstructions: "1. Total theory paper: 50 Marks (Practical: 50 Marks). Duration: 2 Hours.\n2. Part A: Employability Skills (10 Marks). Part B: Subject Specific Skills (40 Marks).",
  },
  {
    id: "cbse-9-it-2026",
    classId: "9",
    subject: "it",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 9 Information Technology (Code 402) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 50,
    duration: "2 Hours",
    questionDistribution: {
      mcq: 12,
      assertionReason: 0,
      vsa: 5,
      sa: 4,
      la: 3,
      caseStudy: 1,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Part A", topic: "Employability Skills (Communication, Self-Management, ICT, Entrepreneurial, Green)", marks: 10 },
      { unit: "Part B1", topic: "Introduction to IT-ITeS Industry", marks: 4 },
      { unit: "Part B2", topic: "Data Entry & Keyboarding Skills", marks: 6 },
      { unit: "Part B3", topic: "Digital Documentation", marks: 10 },
      { unit: "Part B4", topic: "Electronic Spreadsheet", marks: 10 },
      { unit: "Part B5", topic: "Digital Presentation", marks: 10 },
    ],
    defaultInstructions: "1. Total theory paper: 50 Marks (Practical: 50 Marks). Duration: 2 Hours.\n2. Part A: Employability Skills (10 Marks). Part B: Subject Specific Skills (40 Marks).",
  },
  {
    id: "cbse-9-computerapplications-2026",
    classId: "9",
    subject: "computer_applications",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 9 Computer Applications (Code 165) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 50,
    duration: "2 Hours",
    questionDistribution: {
      mcq: 12,
      assertionReason: 0,
      vsa: 5,
      sa: 4,
      la: 3,
      caseStudy: 1,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Unit 1", topic: "Basics of Information Technology", marks: 20 },
      { unit: "Unit 2", topic: "Cyber-safety", marks: 15 },
      { unit: "Unit 3", topic: "Office Tools", marks: 15 },
    ],
    defaultInstructions: "1. Total theory marks: 50 (Lab Exercises: 50 Marks). Duration: 2 Hours.\n2. Unit 1: Basics of IT (20 Marks), Unit 2: Cyber Safety (15 Marks), Unit 3: Office Tools (15 Marks).",
  },
  {
    id: "cbse-9-social-2026",
    classId: "9",
    subject: "social",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 9 Social Science (Code 087) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 80,
    duration: "3 Hours",
    questionDistribution: {
      mcq: 20,
      assertionReason: 0,
      vsa: 4,
      sa: 5,
      la: 4,
      caseStudy: 3,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Part 1", topic: "Understanding Social Science, Shaping of Earth, Atmosphere/Climate, Early Humans, State & Society, Democracy, Elections, Economics & Price", marks: 40 },
      { unit: "Part 2", topic: "Oceans & Life, Life on Earth, Resistance (1000-1700 CE), India & World-I, Authority, Startups, Personal Finance", marks: 40 },
    ],
    defaultInstructions: "1. Total theory paper: 80 Marks (Internal Assessment: 20 Marks). Duration: 3 Hours.\n2. Aligned with NCF-SE 2023 and NEP 2020 competency standards.",
  },
  {
    id: "cbse-10-computerapplications-2026",
    classId: "10",
    subject: "computer_applications",
    examType: ["annual_exam", "pre_board", "sample_paper", "half_yearly"],
    title: "CBSE Class 10 Computer Applications (Code 165) Official Blueprint 2026-2027",
    board: "CBSE",
    year: 2026,
    totalMarks: 50,
    duration: "2 Hours",
    questionDistribution: {
      mcq: 12,
      assertionReason: 0,
      vsa: 5,
      sa: 4,
      la: 3,
      caseStudy: 1,
    },
    selectedChapters: ["all"],
    unitWeightage: [
      { unit: "Unit 1", topic: "Networking", marks: 15 },
      { unit: "Unit 2", topic: "HTML", marks: 25 },
      { unit: "Unit 3", topic: "Cyber-ethics", marks: 10 },
    ],
    defaultInstructions: "1. Total theory paper: 50 Marks (Lab Exercises: 50 Marks). Duration: 2 Hours.\n2. Unit 1: Networking (15 Marks), Unit 2: HTML (25 Marks), Unit 3: Cyber-ethics (10 Marks).",
  },
];

/**
 * Finds a matching blueprint for the given class, subject, and exam type.
 */
export function getBlueprint(
  classId: string,
  subject: string,
  examType: string
): Blueprint | null {
  if (!classId || !subject || !examType) return null;

  const normalizedSubject = subject.toLowerCase().trim();
  const normalizedExamType = examType.toLowerCase().trim();

  const match = BLUEPRINTS.find((bp) => {
    const classMatch = bp.classId === classId;
    const subjectMatch =
      bp.subject === normalizedSubject ||
      (normalizedSubject.includes("math") && bp.subject === "maths") ||
      (normalizedSubject.includes("sci") && bp.subject === "science") ||
      ((normalizedSubject.includes("soc") || normalizedSubject.includes("sst")) && bp.subject === "social") ||
      (normalizedSubject.includes("eng") && (bp.subject === "english" || bp.subject === "englishcore" || bp.subject === "englishelective")) ||
      (normalizedSubject.includes("core") && bp.subject === "englishcore") ||
      (normalizedSubject.includes("elective") && bp.subject === "englishelective") ||
      (normalizedSubject.includes("hindi") && bp.subject === "hindi") ||
      (normalizedSubject.includes("econ") && bp.subject === "economics") ||
      (normalizedSubject.includes("hist") && bp.subject === "history") ||
      ((normalizedSubject.includes("pol") || normalizedSubject.includes("politics")) && bp.subject === "polscience") ||
      ((normalizedSubject.includes("geo") || normalizedSubject.includes("geography")) && bp.subject === "geography") ||
      ((normalizedSubject.includes("art") || normalizedSubject.includes("paint") || normalizedSubject.includes("fine")) && bp.subject === "finearts") ||
      ((normalizedSubject.includes("chem") || normalizedSubject.includes("chemistry")) && bp.subject === "chemistry") ||
      ((normalizedSubject.includes("bus") || normalizedSubject.includes("bst") || normalizedSubject.includes("business")) && bp.subject === "business") ||
      ((normalizedSubject.includes("acc") || normalizedSubject.includes("account")) && bp.subject === "accountancy") ||
      ((normalizedSubject.includes("bio") || normalizedSubject.includes("biology")) && bp.subject === "biology") ||
      ((normalizedSubject.includes("comp") || normalizedSubject.includes("cs")) && bp.subject === "cs") ||
      (normalizedSubject.includes("computer_applications") && bp.subject === "computer_applications") ||
      (normalizedSubject.includes("ip") && bp.subject === "ip");
    const examMatch = bp.examType.includes(normalizedExamType);

    return classMatch && subjectMatch && examMatch;
  });

  return match || null;
}

/**
 * Finds a static blueprint OR dynamically generates an AI blueprint matching official board guidelines.
 */
export function getOrGenerateBlueprint(
  classId: string,
  subject: string,
  examType: string
): Blueprint | null {
  const staticBp = getBlueprint(classId, subject, examType);
  if (staticBp) return staticBp;

  const normalizedExamType = (examType || "").toLowerCase().trim();
  const isMajorExam = [
    "annual_exam",
    "pre_board",
    "sample_paper",
    "half_yearly",
  ].includes(normalizedExamType);

  if (!isMajorExam) return null;

  const normSub = (subject || "").toLowerCase().trim();
  const is50MarkSubject =
    normSub.includes("it") ||
    normSub.includes("ai") ||
    normSub.includes("information") ||
    normSub.includes("skill");
  const is70MarkSubject =
    normSub.includes("physics") ||
    normSub.includes("chemistry") ||
    normSub.includes("bio") ||
    normSub.includes("geography") ||
    normSub.includes("phyedu") ||
    normSub.includes("finearts");

  let totalMarks = 80;
  let duration = "3 Hours";
  let dist = { mcq: 20, assertionReason: 0, vsa: 5, sa: 6, la: 4, caseStudy: 3 };

  if (is50MarkSubject) {
    totalMarks = 50;
    duration = "2 Hours";
    dist = { mcq: 12, assertionReason: 0, vsa: 4, sa: 4, la: 2, caseStudy: 2 };
  } else if (is70MarkSubject) {
    totalMarks = 70;
    duration = "3 Hours";
    dist = { mcq: 16, assertionReason: 0, vsa: 5, sa: 7, la: 3, caseStudy: 2 };
  }

  const subjectTitle = subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : "Subject";

  return {
    id: `ai-blueprint-${classId}-${subject}-${examType}`,
    classId: classId || "10",
    subject: subject || "General",
    examType: [normalizedExamType],
    title: "CBSE Class " + (classId || "") + " " + subjectTitle + " Official AI Blueprint 2026",
    board: "CBSE",
    year: 2026,
    totalMarks,
    duration,
    questionDistribution: dist,
    selectedChapters: ["all"],
    unitWeightage: [],
    defaultInstructions: "1. This question paper is structured strictly according to official CBSE Class " + (classId || "") + " " + subjectTitle + " curriculum guidelines.\n2. Section A comprises MCQs.\n3. Section B comprises Short Answer Questions.\n4. Section C comprises Long Answer Questions.\n5. Section D comprises Case-Based Questions.\n6. All questions are compulsory.",
  };
}
