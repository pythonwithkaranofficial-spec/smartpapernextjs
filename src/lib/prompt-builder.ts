import { PaperConfig } from "@/types";
import { getCurriculumContext } from "./curriculum-data";

export function buildGeminiPrompt(config: PaperConfig): string {
  const curriculumContext = getCurriculumContext(config.classId, config.subject);

  const isHindiSubject = 
    config.subject === "hindi" || 
    config.subject === "hindi_core" || 
    config.subject === "hindi_elective" || 
    config.subject === "हिन्दी" || 
    config.subject === "हिन्दी कोर" || 
    config.subject === "हिन्दी ऐच्छिक";

  // Parse distribution counts
  const dist = config.questionDistribution;
  const distributionDetails = `
  - Multiple Choice Questions (MCQ): ${dist.mcq} questions (1 mark each)
  - Assertion-Reason (AR): ${dist.assertionReason} questions (1 mark each)
  - Very Short Answer (VSA): ${dist.vsa} questions (2 marks each)
  - Short Answer (SA): ${dist.sa} questions (3 marks each)
  - Case Study / Source-Based (CS): ${dist.caseStudy} questions (4 marks each)
  - Long Answer (LA): ${dist.la} questions (5 marks each)
  `;

  // Language instructions
  let languagePrompt = "";
  if (config.language === "English") {
    languagePrompt = "All questions must be written strictly in the English language.";
  } else if (config.language === "Hindi") {
    languagePrompt = "All questions must be written strictly in the Hindi language (Devanagari script).";
  } else {
    languagePrompt = `Each question and its choices must be written bilingually: first write the English version, then write the Hindi translation directly below it (separated by a newline). 
    Example question text:
    "Evaluate the expression x^2 + 5x + 6 when x = 2.\nव्यंजक x^2 + 5x + 6 का मान ज्ञात कीजिए जब x = 2."`;
  }

  // Internal choice instructions
  const internalChoicePrompt = config.options.includeInternalChoice
    ? `For Short Answer (SA) and Long Answer (LA) questions, provide a choice option for at least 1 question in each section. Set the "orQuestion" field with the choice question text. If no choice is provided, set "orQuestion" to null.`
    : `Do not include any choice options. Set "orQuestion" to null for all questions.`;

  const hindiConstraint = isHindiSubject
    ? `9. HINDI SUBJECT SPECIAL DIRECTIVE: The entire output MUST be generated in formal, standard CBSE Hindi (Devanagari script).
       - Section names MUST be in Devanagari (e.g. "खण्ड क", "खण्ड ख", "खण्ड ग", "खण्ड घ", "खण्ड ङ").
       - Section descriptions MUST be in Devanagari (e.g. "बहुविकल्पीय प्रश्न", "अति लघु उत्तरीय प्रश्न", "केस स्टडी प्रश्न").
       - All question text, reading comprehensions, passages, poem verses, multiple-choice options, and choices must be written in natural, grammatically correct, and official CBSE Hindi language. Do not use English translations or english subtitles.
       - Assertion-Reason options must be translated to standard Hindi:
         (A) A और R दोनों सत्य हैं और R, A की सही व्याख्या करता है।
         (B) A और R दोनों सत्य हैं लेकिन R, A की सही व्याख्या नहीं करता है।
         (C) A सत्य है लेकिन R असत्य है।
         (D) A असत्य है लेकिन R सत्य है।`
    : "";

  return `
You are a Senior CBSE Examination Paper Setter with 20+ years of experience.
Your task is to generate a professional, curriculum-compliant question paper based on the following configurations.

--- CONFIGURATION ---
- Class: CBSE Class ${config.classId}
- Subject: ${config.subject}
- Exam Type: ${config.examType}
- Target Difficulty Level: ${config.difficulty} (Note: questions must match this cognitive load standard)
- Language: ${config.language}
- Target Total Marks: ${config.totalMarks}

--- QUESTION DISTRIBUTION LIST ---
${distributionDetails}

--- CURRICULUM SYLLABUS BACKGROUND ---
${curriculumContext}

--- TARGET CHAPTERS FOR GENERATION ---
You must generate questions ONLY from the following selected chapters:
${config.selectedChapters && config.selectedChapters.length > 0
  ? config.selectedChapters.map(c => `- ${c}`).join("\n")
  : "All chapters in the curriculum background above"
}

--- LANGUAGE INSTRUCTIONS ---
${languagePrompt}

--- INTERNAL CHOICE OPTIONS ---
${internalChoicePrompt}

--- CRITICAL CONSTRAINTS ---
1. STRICT CHAPTER ALIGNMENT: Only generate questions from the chapters listed in the target chapters section above. Never generate questions from any other chapters or topics.
2. UNIQUE QUESTIONS: There must be no repetition of concepts or questions across sections.
3. ANSWERS INSTRUCTION: Do NOT generate answers, marking schemes, or solutions. Only generate the questions.
4. MCQ FORMAT: MCQs must have exactly 4 plausible choices. Only generate choices for MCQs (the "choices" array must be null or empty for all other types).
5. CASE STUDY FORMAT: Case Study / Source-based questions must consist of a reading passage (or description) followed by 2 sub-questions (2 marks each, totaling 4 marks). Compile the sub-questions directly into the text field (e.g. "Read the passage and answer... \n\n(i) Subquestion 1 \n(ii) Subquestion 2").
6. JSON ESCAPING: Every backslash character (\) in mathematical formulas, LaTeX, or other texts MUST be double-escaped as (\\\\). For example, write \\\\theta instead of \\theta, and \\\\Delta instead of \\Delta. Failure to double-escape backslashes will break JSON parsing. Do not output invalid escape sequences like \\u unless followed by 4 hexadecimal digits.
6. ASSERTION REASON FORMAT: Assertion-Reason questions must follow the standard CBSE format with 4 options:
   (A) Both A and R are true and R is the correct explanation of A.
   (B) Both A and R are true but R is not the correct explanation of A.
   (C) A is true but R is false.
   (D) A is false but R is true.
   Set these 4 options in the "choices" array for Assertion-Reason questions.
7. NUMBERING: Keep question indices sequential (1, 2, 3...) globally across sections.
8. FORMAT OUTPUT: You must output strictly a single valid JSON object following the schema defined below. Do not wrap the JSON in markdown code blocks, do not write markdown descriptions, just output raw JSON text.
${hindiConstraint}

--- JSON SCHEMA FORMAT ---
{
  "sections": [
    {
      "name": "Section A",
      "description": "Multiple Choice Questions (1 Mark each)",
      "marksPerQuestion": 1,
      "questions": [
        {
          "id": "uq_1", // unique string identifier
          "text": "Question text here...",
          "marks": 1,
          "type": "mcq", // "mcq" | "assertionReason" | "vsa" | "sa" | "caseStudy" | "la"
          "choices": ["Option 1", "Option 2", "Option 3", "Option 4"], // string[] for MCQs and ARs, null for others
          "orQuestion": null // string if internal choice is enabled, null otherwise
        }
      ]
    }
  ]
}
`;
}
