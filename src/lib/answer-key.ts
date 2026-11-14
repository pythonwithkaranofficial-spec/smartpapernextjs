import type { GoogleGenAI } from '@google/genai';
import { parseAiJson } from './ai-json';
import { formatScientificText } from './utils';
import { isComputerSubjectKey } from './subject-detection';
import { generateContentResilient, AIOverloadedError } from './gemini-call';

export type AnswerKeyOutputMode = 'questions_and_answers' | 'answers_only';

export interface AnswerKeyInput {
  rawQuestionsText: string;
  pdfBase64?: string | null;
  outputMode: AnswerKeyOutputMode;
  schoolName?: string;
  examName?: string;
  subject?: string;
  classText?: string;
  teacherName?: string;
}

export class AnswerKeyTruncatedError extends Error {
  constructor() {
    super('The answer key was too long for a single AI response.');
    this.name = 'AnswerKeyTruncatedError';
  }
}

export const ANSWER_KEY_MODEL = 'gemini-2.5-flash';

const SYSTEM_PROMPT = `You are an expert CBSE / school examiner. Produce a complete, accurate answer key with a marking scheme for the question paper provided (typed text or an attached document).

COMPLETENESS (most important):
1. Include EVERY question from the input exactly once, in the ORIGINAL order. Never skip, merge, summarise or invent questions.
2. Keep each question's ORIGINAL number from the paper in "number" (e.g. 1, 2, 3 ...). Sub-parts such as (a)/(b)/(i)/(ii) of a case study or long question belong to ONE question: copy all sub-parts into "text" and answer each sub-part, labelled, inside the same "solution".
3. Keep the paper's own sections (SECTION A, B, ...) when the paper has them; otherwise group logically (Objective, Short Answer, Long Answer).
4. Marks: use the marks printed in the paper (per question, or the section header such as "(2 marks each)"). Only estimate when the paper gives none.

QUALITY:
5. MCQ / Assertion-Reason: put the options in "choices" WITHOUT their labels (write "4", not "(a) 4"). Start the solution with "Correct Answer: (x) <option text>" and then a short reason.
6. Internal choice ("OR"): an OR alternative is NEVER a separate question and NEVER gets its own number. Put the main question in "text" with its answer in "solution", and the alternative in "orQuestion" with its own complete answer in "orSolution". Check the whole paper for every "OR" and handle each one this way.
7. Solutions must be correct and step-by-step, with the key steps a teacher awards marks for, e.g. "[1 mark]" after a step for 3- and 5-mark questions. Length should match the marks: about 1-3 lines for 1 mark, 4-8 lines for 2-3 marks, and a full structured answer (given, formula, working, final answer, units) for 4-5 marks. Do not pad.
8. Plain text only: NO markdown (no **bold**, no # headings, no tables). Write maths with simple LaTeX inside $...$ (\\frac{a}{b}, \\sqrt{x}, x^{2}). Use "\\n" for line breaks and "• " for bullet points. For diagrams, describe what to draw and the labels.
9. If a question is unclear or missing data, still answer with a reasonable stated assumption — never drop it.

Return ONLY a JSON object (no markdown fences) of this shape:
{
  "sections": [
    {
      "name": "SECTION A",
      "description": "Multiple Choice Questions",
      "marksPerQuestion": 1,
      "questions": [
        {
          "number": 1,
          "text": "Question text (with all sub-parts)",
          "marks": 1,
          "type": "mcq",
          "choices": ["option 1", "option 2", "option 3", "option 4"],
          "solution": "Correct Answer: (b) option 2\\nReason: ...",
          "orQuestion": null,
          "orSolution": null
        }
      ]
    }
  ]
}
"type" is one of: "mcq", "assertionReason", "vsa", "sa", "la", "caseStudy".`;

const OPTION_LABEL = /^\s*(?:\([A-Da-d]\)|[A-Da-d][.)])\s*/;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQuestion = Record<string, any>;

/** Removes markdown the preview/PDF/DOCX would otherwise show literally (**bold**, # headings, * bullets). */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/(^|\n)\s{0,3}#{1,6}\s+/g, '$1')
    .replace(/(^|\n)(\s*)[*-]\s+/g, '$1$2• ')
    .replace(/(^|[\s(])\*([^*\n]+?)\*(?=[\s).,;:!?]|$)/g, '$1$2')
    .replace(/`([^`\n]+)`/g, '$1');
}

const normForCompare = (t: unknown) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 80);
const isPlaceholder = (sol: unknown) =>
  !sol || String(sol).trim().length < 40 || /not provided|see above|provided above/i.test(String(sol));
const OR_PREFIX = /^\s*\(?or\)?\s*[:-]?\s+/i;

/**
 * Models sometimes emit an OR alternative as an extra question (a duplicate of the previous one
 * carrying "orQuestion", or a stray entry whose text starts with "OR"). Fold those back into the
 * question they belong to so numbering and counts match the paper.
 */
export function mergeOrDuplicates(sections: { questions: AnyQuestion[] }[]): void {
  let prev: AnyQuestion | null = null;
  for (const sec of sections) {
    const kept: AnyQuestion[] = [];
    for (const q of sec.questions || []) {
      const textNorm = normForCompare(q.text);
      if (prev && q.orQuestion && textNorm && textNorm === normForCompare(prev.text)) {
        if (!prev.orQuestion) prev.orQuestion = q.orQuestion;
        if (isPlaceholder(prev.orSolution)) {
          prev.orSolution = !isPlaceholder(q.orSolution) ? q.orSolution : !isPlaceholder(q.solution) ? q.solution : prev.orSolution;
        }
        continue;
      }
      if (prev && !prev.orQuestion && !q.orQuestion && OR_PREFIX.test(String(q.text || ''))) {
        prev.orQuestion = String(q.text).replace(OR_PREFIX, '');
        prev.orSolution = q.solution;
        continue;
      }
      kept.push(q);
      prev = q;
    }
    sec.questions = kept;
  }
}

/** Converts the model's JSON into the app's GeneratedPaper shape. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeAnswerKey(parsed: any, input: AnswerKeyInput) {
  if (!parsed || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
    throw new Error('Invalid answer key structure generated by AI.');
  }
  const codeSafe = isComputerSubjectKey(input.subject || '');
  const format = (text: string) => formatScientificText(stripMarkdown(text || ''), { codeSafe });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawSections: { questions: AnyQuestion[]; [k: string]: any }[] = parsed.sections.map((s: any) => ({
    ...s,
    questions: Array.isArray(s.questions) ? [...s.questions] : [],
  }));
  mergeOrDuplicates(rawSections);

  // Keep the paper's numbers only when they run consecutively (e.g. 1,2,3 or 14,15,16); otherwise renumber.
  const modelNumbers = rawSections.flatMap((s) => s.questions.map((q) => Number(q.number)));
  const keepOriginal =
    modelNumbers.length > 0 &&
    Number.isInteger(modelNumbers[0]) &&
    modelNumbers[0] >= 1 &&
    modelNumbers.every((n, i) => n === modelNumbers[0] + i);

  let counter = 1;
  const sections = rawSections.map((section) => ({
    name: String(section.name || 'SECTION'),
    description: String(section.description || ''),
    marksPerQuestion: Number(section.marksPerQuestion) || undefined,
    questions: section.questions.map((q: AnyQuestion) => {
      const number = keepOriginal ? Number(q.number) : counter;
      counter++;
      const marks = Number(q.marks) > 0 ? Number(q.marks) : Number(section.marksPerQuestion) > 0 ? Number(section.marksPerQuestion) : 1;
      return {
        ...q,
        id: `q_ans_${number}_${Math.random().toString(36).slice(2, 8)}`,
        number,
        marks,
        type: q.type || (Array.isArray(q.choices) && q.choices.length ? 'mcq' : marks >= 4 ? 'la' : 'sa'),
        text: format(String(q.text || '')),
        choices: Array.isArray(q.choices) && q.choices.length > 0
          ? q.choices.map((c: unknown) => format(String(c ?? '')).replace(OPTION_LABEL, '').trim())
          : null,
        solution: q.solution ? format(String(q.solution)) : 'Solution not provided.',
        orQuestion: q.orQuestion ? format(String(q.orQuestion)) : null,
        orSolution: q.orSolution ? format(String(q.orSolution)) : null,
      };
    }),
  })).filter((s: { questions: unknown[] }) => s.questions.length > 0);

  const totalQuestions = sections.reduce((acc: number, s: { questions: unknown[] }) => acc + s.questions.length, 0);
  const totalMarks = sections.reduce(
    (acc: number, s: { questions: { marks: number }[] }) => acc + s.questions.reduce((m, q) => m + q.marks, 0),
    0
  );
  const subject = input.subject && input.subject !== 'General / Custom' ? input.subject : '';
  const classText = input.classText && input.classText !== 'Class X'
    ? (input.classText.toLowerCase().startsWith('class') ? input.classText : `Class ${input.classText}`)
    : '';

  return {
    schoolName: input.schoolName ? input.schoolName.toUpperCase() : undefined,
    teacherName: input.teacherName || undefined,
    examName: input.examName ? input.examName.toUpperCase() : 'ANSWER KEY & SOLUTIONS',
    subject,
    classText,
    timeText: '',
    maxMarksText: totalMarks ? `${totalMarks} Marks` : '',
    instructions: [],
    sections,
    totalQuestions,
    totalMarks,
    hasAnswerKey: true,
    outputMode: input.outputMode,
  };
}

/** Runs the AI with overload handling, truncation detection and validation retries. */
export async function generateAnswerKey(ai: GoogleGenAI, input: AnswerKeyInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = [];
  if (input.pdfBase64) {
    parts.push({ inlineData: { mimeType: 'application/pdf', data: input.pdfBase64 } });
  }
  const source = input.rawQuestionsText.trim()
    ? `QUESTION PAPER:\n${input.rawQuestionsText}`
    : 'QUESTION PAPER: the attached PDF document. Read every page, including equations, tables and diagrams.';
  parts.push({ text: `${SYSTEM_PROMPT}\n\n${source}` });

  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await generateContentResilient(ai, {
        model: ANSWER_KEY_MODEL,
        contents: [{ role: 'user', parts }],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          maxOutputTokens: 65536,
          // Enough reasoning for correct maths without starving the (long) answer output.
          thinkingConfig: { thinkingBudget: 2048 },
        },
      });
      const finish = response.candidates?.[0]?.finishReason;
      if (finish === 'MAX_TOKENS') throw new AnswerKeyTruncatedError();
      const text = response.text;
      if (!text) throw new Error('Empty response from AI model.');
      return normalizeAnswerKey(parseAiJson(text), input);
    } catch (err) {
      if (err instanceof AIOverloadedError || err instanceof AnswerKeyTruncatedError) throw err;
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`Answer key attempt ${attempt} failed:`, lastError.message);
    }
  }
  throw lastError || new Error('Failed to generate answer key.');
}
