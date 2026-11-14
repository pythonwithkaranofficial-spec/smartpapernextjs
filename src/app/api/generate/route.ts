import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildGeminiPrompt } from "@/lib/prompt-builder";
import { paperConfigSchema } from "@/lib/validations";
import { formatScientificText, cleanInstructionText } from "@/lib/utils";
import { EXAM_TYPES } from "@/lib/exam-types";
import { requireUser, consumePaperQuota, quotaExceededResponse, QuotaTicket } from "@/lib/api-guard";
import { generateContentResilient, AIOverloadedError, AI_BUSY_MESSAGE } from "@/lib/gemini-call";
import { AppError, DatabaseError } from "@/lib/errors";
import { parseAiJson } from "@/lib/ai-json";
import { DEFAULT_MARKS_PER_TYPE, resolveMarksPerType } from "@/lib/marks";
import {
  detectFullExamKind,
  FULL_EXAM_SPECS,
  getEffectiveSubjectKey,
  isComputerSubjectKey,
  isHindiSubjectKey,
} from "@/lib/subject-detection";

// Initialize Gemini Client
// We use the official API key from env variable
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/** Each attempt can take ~1 min for a full paper; 3 keeps cost and request time bounded. */
const MAX_RETRIES = 3;
/**
 * Gemini 2.5 Flash's output ceiling. A full 80-mark paper with a detailed answer key
 * (plus thinking tokens, which count towards this budget) can be long; a lower cap
 * truncates the JSON and wastes the whole attempt.
 */
const MAX_OUTPUT_TOKENS = 65536;

/* eslint-disable @typescript-eslint/no-explicit-any -- the model output is untyped JSON */

function shuffleArray<T>(array: T[], seed: number): T[] {
  const arr = [...array];
  let m = arr.length;
  let t: T;
  let i: number;
  let pseudoRandom = seed;

  while (m) {
    pseudoRandom = (pseudoRandom * 9301 + 49297) % 233280;
    i = Math.floor((pseudoRandom / 233280) * m--);
    t = arr[m];
    arr[m] = arr[i];
    arr[i] = t;
  }
  return arr;
}

const LATIN_OPTION_LETTERS = ["A", "B", "C", "D"];
const HINDI_OPTION_LETTERS = ["क", "ख", "ग", "घ"];

/**
 * Rewrites option references in an MCQ solution after its choices were shuffled.
 * `newIndexOf[old]` is the new position of the option previously at index `old`.
 *
 * Always remapped: the leading answer token ("(B) ...", "B. ...", "Answer: (b)") and explicit
 * "Option C" / "Answer: D" phrases. Other parenthesised letters ("hence (B) is correct") are
 * remapped only when the question text itself does not use such labels (statement-based MCQs
 * label statements "(a)", "(b)" … and those references must stay untouched).
 */
function remapOptionLetters(solution: string, newIndexOf: number[], questionText: string): string {
  if (!solution) return solution;
  const mapLetter = (letter: string) => {
    const hindiIdx = HINDI_OPTION_LETTERS.indexOf(letter);
    if (hindiIdx >= 0) {
      return newIndexOf[hindiIdx] === undefined ? letter : HINDI_OPTION_LETTERS[newIndexOf[hindiIdx]];
    }
    const oldIdx = LATIN_OPTION_LETTERS.indexOf(letter.toUpperCase());
    if (oldIdx < 0 || newIndexOf[oldIdx] === undefined) return letter;
    const mapped = LATIN_OPTION_LETTERS[newIndexOf[oldIdx]];
    return letter === letter.toLowerCase() ? mapped.toLowerCase() : mapped;
  };

  const MARKER = "\u0001"; // protects already-remapped letters from the later passes
  const swap = (whole: string, letter: string) => whole.replace(letter, MARKER + mapLetter(letter));
  // A letter reference: "(b)" / "(B)" / "(ख)" in any case, or a bare UPPERCASE "B" — a bare
  // lowercase "a" is far too likely to be the English article.
  const LETTER = String.raw`(?:\([A-Da-dकखगघ]\)|[A-Dकखगघ](?![A-Za-z0-9]))`;
  const PHRASE = String.raw`(?:correct\s+)?(?:[Oo]ption|[Aa]nswer|[Aa]ns\.?)(?:\s+is)?\s*[:\-–]?\s*`;
  const letterOf = (token: string) => token.replace(/[()]/g, "");

  // 1. Explicit "Answer: (b)", "option C", "Correct answer is B" anywhere.
  let result = solution.replace(new RegExp(`\\b${PHRASE}${LETTER}`, "g"), (m) => {
    const token = m.match(new RegExp(`${LETTER}$`))?.[0] || "";
    return token ? m.slice(0, m.length - token.length) + swap(token, letterOf(token)) : m;
  });

  // 2. Leading answer token without a phrase: "(B) text", "B) text", "B. text".
  if (!result.includes(MARKER)) {
    result = result.replace(/^(\s*)(\(?)([A-Da-dकखगघ])(?=\)|\.(?:\s|$))/, (_m, ws: string, paren: string, l: string) =>
      `${ws}${paren}${MARKER}${mapLetter(l)}`
    );
  }

  // 3. Other "(B)" references, unless the question labels statements that way.
  if (!/\([A-Da-dकखगघ]\)/.test(questionText || "")) {
    result = result.replace(/\(([A-Da-dकखगघ])\)/g, (_m, l: string) => `(${MARKER}${mapLetter(l)})`);
  }
  return result.split(MARKER).join("");
}

function generatePaperSets(basePaper: any, numberOfSets: number): any[] {
  const setNames = ["SET A", "SET B", "SET C"];
  const sets: any[] = [];

  for (let s = 0; s < numberOfSets; s++) {
    const setName = setNames[s];
    let globalQNum = 1;

    const baseExamName = basePaper.examName
      ? basePaper.examName.replace(/\s*\((SET|CODE)\s*[A-Z0-9-]+\)/gi, "").trim()
      : "EXAMINATION";
    const setExamName = numberOfSets > 1 ? `${baseExamName} (${setName})` : baseExamName;

    const setSections = basePaper.sections.map((sec: any, secIdx: number) => {
      // Shuffle questions within section for Set B (seed=2) and Set C (seed=3)
      let questions = [...(sec.questions || [])];
      if (s > 0) {
        const hasVaryingMarks = questions.some((q, idx) => idx > 0 && q.marks !== questions[0].marks);
        if (hasVaryingMarks) {
          // If questions carry varying marks, shuffle only within identical marks & question types to preserve predefined structural slots
          const groups: Record<string, any[]> = {};
          questions.forEach(q => {
            const key = `${q.marks}_${q.type}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(q);
          });
          Object.keys(groups).forEach((key, gIdx) => {
            groups[key] = shuffleArray(groups[key], s * 100 + secIdx * 10 + gIdx);
          });
          const counters: Record<string, number> = {};
          questions = questions.map(q => {
            const key = `${q.marks}_${q.type}`;
            const idx = counters[key] || 0;
            counters[key] = idx + 1;
            return groups[key][idx];
          });
        } else {
          questions = shuffleArray(questions, s * 100 + secIdx * 10);
        }
      }

      const updatedQuestions = questions.map((q: any) => {
        const qNum = globalQNum++;
        let choices = q.choices ? [...q.choices] : null;
        let solution = q.solution;

        // Shuffle choices for MCQs in Set B and Set C, and keep the answer key pointing
        // at the same option text.
        if (s > 0 && choices && choices.length === 4 && q.type === "mcq") {
          const order = shuffleArray([0, 1, 2, 3], s * 50 + qNum); // order[newPos] = oldPos
          const newIndexOf: number[] = [];
          order.forEach((oldPos, newPos) => {
            newIndexOf[oldPos] = newPos;
          });
          choices = order.map((oldPos) => q.choices[oldPos]);
          if (typeof solution === "string") solution = remapOptionLetters(solution, newIndexOf, q.text || "");
        }

        return {
          ...q,
          number: qNum,
          choices,
          solution,
        };
      });

      return {
        ...sec,
        questions: updatedQuestions,
      };
    });

    sets.push({
      ...basePaper,
      examName: setExamName,
      setName,
      sections: setSections,
    });
  }

  return sets;
}

/** Official Class 10 Science slot layout per section, as marks multisets (sorted ascending). */
const CLASS10_SCIENCE_SECTIONS = [
  { name: "Section A", label: "Biology", marks: [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4, 5] }, // 16 Q, 30 M
  { name: "Section B", label: "Chemistry", marks: [1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 3, 4, 5] }, // 13 Q, 25 M
  { name: "Section C", label: "Physics", marks: [1, 1, 1, 2, 2, 3, 3, 3, 4, 5] }, // 10 Q, 25 M
];

const sameMultiset = (a: number[], b: number[]) =>
  a.length === b.length && [...a].sort((x, y) => x - y).every((v, i) => v === [...b].sort((x, y) => x - y)[i]);

/**
 * Validates and normalises the 3-section Class 10 Science paper. Marks are assigned from
 * each question's TYPE (mcq/AR 1, vsa 2, sa 3, caseStudy 4, la 5) — never by position — and
 * questions are then ordered into the official ascending-marks slots.
 */
function normaliseClass10SciencePaper(sections: any[]): void {
  if (sections.length < 3) {
    throw new Error(`Class 10 Science paper validation failed: Expected 3 sections (Biology, Chemistry, Physics), but received ${sections.length}.`);
  }

  let startNumber = 1;
  CLASS10_SCIENCE_SECTIONS.forEach((spec, idx) => {
    const section = sections[idx];
    const questions: any[] = section.questions || [];
    if (questions.length !== spec.marks.length) {
      throw new Error(`Class 10 Science question count mismatch in ${spec.label}: expected ${spec.marks.length}, got ${questions.length}.`);
    }

    const byType = questions.map((q) => DEFAULT_MARKS_PER_TYPE[q.type as keyof typeof DEFAULT_MARKS_PER_TYPE]);
    const byModel = questions.map((q) => (typeof q.marks === "number" ? q.marks : NaN));

    let assigned: number[];
    if (byType.every((m) => typeof m === "number") && sameMultiset(byType, spec.marks)) {
      assigned = byType;
    } else if (sameMultiset(byModel, spec.marks)) {
      // Types are off but the model's own marks match the official layout.
      assigned = byModel;
    } else {
      throw new Error(`Class 10 Science marks mismatch in ${spec.label}: question types/marks do not match the official ${spec.marks.reduce((a, b) => a + b, 0)}-mark layout.`);
    }

    questions.forEach((q, i) => {
      q.marks = assigned[i];
    });
    // Stable sort into the official ascending-marks slot order.
    const ordered = questions
      .map((q, i) => ({ q, i }))
      .sort((a, b) => a.q.marks - b.q.marks || a.i - b.i)
      .map((entry) => entry.q);

    const total = spec.marks.reduce((a, b) => a + b, 0);
    const endNumber = startNumber + ordered.length - 1;
    section.name = spec.name;
    section.description = `${spec.label}: Q${startNumber}–Q${endNumber} (${total} Marks)`;
    section.questions = ordered;
    startNumber = endNumber + 1;
  });
}

export async function POST(request: NextRequest) {
  let quota: QuotaTicket | null = null;
  try {
    // 1. Authentication (mandatory; the client pages are already sign-in only)
    const auth = await requireUser(request);
    if ("response" in auth) return auth.response;

    // 2. Validate Gemini Client
    if (!ai) {
      return NextResponse.json(
        { error: "AI API key is not configured on the server." },
        { status: 500 }
      );
    }

    // 3. Parse and validate request configuration
    const body = await request.json();
    const validation = paperConfigSchema.safeParse(body);
    if (!validation.success) {
      console.error("Paper config validation failed:", JSON.stringify(validation.error.format(), null, 2));
      return NextResponse.json(
        { error: "Invalid paper configuration.", details: validation.error.format() },
        { status: 400 }
      );
    }

    const config = validation.data;

    // 3b. Atomically consume one generation from the user's daily plan quota
    //     (refunded below if generation fails).
    quota = await consumePaperQuota(auth.ctx.uid, auth.ctx);
    if (!quota) return quotaExceededResponse();

    // Force Hindi subject language internally to Hindi
    const isHindiSubject = isHindiSubjectKey(config.subject);
    if (isHindiSubject) {
      config.language = "Hindi";
    }

    // Shared with the prompt builder so the specialised patterns can never drift apart.
    const fullExamKind = detectFullExamKind(config);
    const isFullClass10ScienceExam = fullExamKind === "class10Science";
    const codeSafe = isComputerSubjectKey(getEffectiveSubjectKey(config));
    const format = (text: string) => formatScientificText(text, { codeSafe });
    const marksPerType = resolveMarksPerType(config.marksPerType);

    // 4. Construct prompt
    const prompt = buildGeminiPrompt(config);

    let finalPaper: any = null;
    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Starting paper generation attempt ${attempt} of ${MAX_RETRIES}...`);

        // 5. Generate content using Gemini 2.5 Flash
        const response = await generateContentResilient(ai, {
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            // Enforce JSON response type
            responseMimeType: "application/json",
            maxOutputTokens: MAX_OUTPUT_TOKENS,
            // Vary temperature slightly on retries to prompt different completions
            temperature: attempt > 1 ? 0.7 + (attempt * 0.05) : 0.7,
          }
        });

        const responseText = response.text;
        if (process.env.NODE_ENV !== "production") {
          console.log("DEBUG - Raw Model Response (first 500 chars):", responseText?.slice(0, 500));
        }
        if (!responseText) {
          throw new Error("Empty response from AI.");
        }
        if (response.candidates?.[0]?.finishReason === "MAX_TOKENS") {
          throw new Error("AI response was truncated (output token limit reached).");
        }

        // 6. Parse JSON (strict first; string-aware repair only if that fails)
        const parsedPaper = parseAiJson<any>(responseText);

        if (!parsedPaper || !parsedPaper.sections || !Array.isArray(parsedPaper.sections) || parsedPaper.sections.length === 0) {
          throw new Error("Invalid paper structure returned: sections must be a non-empty array.");
        }

        if (isFullClass10ScienceExam) {
          normaliseClass10SciencePaper(parsedPaper.sections);
        }

        // 7. Structure final response
        let displaySubject = config.isCustom && config.customSubject ? config.customSubject : config.subject;
        if (config.subject === "hindi") displaySubject = "हिन्दी";
        if (config.subject === "hindi_core") displaySubject = "हिन्दी कोर";
        if (config.subject === "hindi_elective") displaySubject = "हिन्दी ऐच्छिक";

        const displayClassText = config.isCustom && config.customClass
          ? (config.customClass.toLowerCase().startsWith("class") ? config.customClass : `Class ${config.customClass}`)
          : `Class ${config.classId}`;

        const examTypeObj = EXAM_TYPES.find(e => e.id === config.examType);
        const displayExamName = examTypeObj
          ? examTypeObj.name.toUpperCase()
          : (config.examType ? config.examType.replace(/_/g, " ").toUpperCase() : "EXAMINATION");

        // Always number sequentially across sections; model-supplied numbers are ignored
        // because partial numbering restarted or duplicated question numbers.
        let globalQNum = 1;

        const sections = parsedPaper.sections.map((section: any) => {
          return {
            ...section,
            questions: (section.questions || []).map((q: any) => {
              const assignedNum = globalQNum++;

              let cleanedText = format(q.text || "");
              cleanedText = cleanedText.replace(/^\s*(?:Q\.?\s*)?\d+[\.\)\:\t]\s*/i, "").trim();

              let cleanedOrQuestion = q.orQuestion ? format(q.orQuestion) : null;
              if (cleanedOrQuestion) {
                cleanedOrQuestion = cleanedOrQuestion.replace(/^\s*(?:Q\.?\s*)?\d+[\.\)\:\t]\s*/i, "").trim();
              }

              const cleanedChoices = (q.choices && q.choices.length > 0)
                ? q.choices.map((choice: string) => {
                    const text = format(choice || "");
                    return text.replace(/^\s*(?:\([A-Da-d]\)|[A-Da-d][\.\)])\s*/, "").trim();
                  })
                : null;

              // Missing/invalid marks fall back to the (blueprint-aware) weight of the type.
              const typeMarks = marksPerType[q.type as keyof typeof marksPerType];
              const marks = typeof q.marks === "number" && q.marks > 0 ? q.marks : typeMarks || 1;

              return {
                ...q,
                id: q.id || `q_${Math.random().toString(36).slice(2, 11)}`,
                number: assignedNum,
                marks,
                text: cleanedText,
                orQuestion: cleanedOrQuestion,
                choices: cleanedChoices,
                solution: q.solution ? format(q.solution) : null,
                orSolution: q.orSolution ? format(q.orSolution) : null,
              };
            })
          };
        });

        // The header total reflects the generated paper, not the requested config: sum of
        // question marks. Specialised full-exam prompts always produce the official paper
        // (some, e.g. Physical Education, print extra "attempt any N" questions), so their
        // official theory total is used.
        const summedMarks = sections.reduce(
          (acc: number, sec: any) => acc + sec.questions.reduce((s: number, q: any) => s + (Number(q.marks) || 0), 0),
          0
        );
        const paperTotalMarks = fullExamKind
          ? FULL_EXAM_SPECS[fullExamKind].officialTotal
          : summedMarks > 0
            ? summedMarks
            : config.totalMarks;
        if (!fullExamKind && summedMarks !== config.totalMarks) {
          console.warn(`Generated paper totals ${summedMarks} marks (requested ${config.totalMarks}).`);
        }

        finalPaper = {
          schoolName: config.options.includeSchoolName && config.options.schoolName ? config.options.schoolName.toUpperCase() : undefined,
          teacherName: config.options.includeTeacherName && config.options.teacherName ? config.options.teacherName : undefined,
          examName: displayExamName,
          subject: displaySubject,
          classText: displayClassText,
          timeText: config.duration,
          maxMarksText: isHindiSubject ? `${paperTotalMarks} अंक` : `${paperTotalMarks} Marks`,
          instructions: config.options.includeInstructions
            ? (isFullClass10ScienceExam && (!config.options.instructionsText || config.options.instructionsText.includes("5 Sections") || config.options.instructionsText.includes("Section D") || config.options.instructionsText.includes("Section E")))
              ? [
                  "This question paper consists of 39 questions in 3 sections. Section A is Biology, Section B is Chemistry and Section C is Physics.",
                  "All questions are compulsory. However, an internal choice is provided in some questions. A student is expected to attempt only one of the alternatives in these questions.",
                  "Section A consists of Biology carrying 30 marks (Questions 1 to 16).",
                  "Section B consists of Chemistry carrying 25 marks (Questions 17 to 29).",
                  "Section C consists of Physics carrying 25 marks (Questions 30 to 39)."
                ]
              : (config.options.instructionsText
                ? config.options.instructionsText.split("\n").filter(line => line.trim().length > 0)
                : isHindiSubject
                  ? [
                      "सभी प्रश्न अनिवार्य हैं।",
                      "इस प्रश्नपत्र में विभिन्न खण्ड हैं।",
                      "खण्ड क में 1 अंक के बहुविकल्पीय प्रश्न हैं।",
                      "खण्ड ख में 2 अंकों के अति लघु उत्तरीय प्रश्न हैं।",
                      "खण्ड ग में 3 अंकों के लघु उत्तरीय प्रश्न हैं।",
                      "खण्ड घ में 4 अंकों के केस स्टडी प्रश्न हैं।",
                      "खण्ड ङ में 5 अंकों के दीर्घ उत्तरीय प्रश्न हैं।",
                      "परीक्षा के दौरान कैलकुलेटर या मोबाइल फोन का उपयोग सख्त वर्जित है।"
                    ]
                  : [
                      "All questions are compulsory.",
                      "The question paper consists of multiple sections.",
                      "Section A contains objective type questions carrying 1 mark each.",
                      "Section B contains very short answer questions carrying 2 marks each.",
                      "Section C contains short answer questions carrying 3 marks each.",
                      "Section D contains case study questions carrying 4 marks each.",
                      "Section E contains long answer questions carrying 5 marks each.",
                      "Use of calculators or cellphones is strictly prohibited."
                    ]
              ).map(line => cleanInstructionText(line))
            : [],
          sections,
          totalQuestions: sections.reduce((acc: number, sec: any) => acc + sec.questions.length, 0),
          totalMarks: paperTotalMarks,
          hasAnswerKey: config.options.includeAnswerKey !== false,
          // Recorded so question swaps can regenerate in the same language (incl. Bilingual).
          language: config.language,
        };

        // If multi-set generation is requested (2 or 3 sets)
        const requestedSets = config.options?.numberOfSets || 1;
        if (requestedSets > 1) {
          const generatedSets = generatePaperSets(finalPaper, requestedSets);
          finalPaper = {
            ...generatedSets[0],
            sets: generatedSets,
          };
        }

        break;
      } catch (err: any) {
        // Overload already had backoff + fallback inside generateContentResilient: stop retrying.
        if (err instanceof AIOverloadedError) throw err;
        console.error(`Attempt ${attempt} failed:`, err.message || err);
        lastError = err;
        finalPaper = null;
        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }

    if (!finalPaper) {
      throw new Error(lastError?.message || "Failed to generate valid paper layout after multiple retries.");
    }

    return NextResponse.json(finalPaper);
  } catch (error) {
    console.error("Silent generation error after retries:", error);
    if (quota) await quota.refund();
    if (error instanceof AIOverloadedError) {
      return NextResponse.json({ error: `${AI_BUSY_MESSAGE} This attempt was not counted against your daily limit.`, code: "AI_BUSY" }, { status: 503 });
    }
    if (error instanceof AppError && !(error instanceof DatabaseError)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    return NextResponse.json(
      { error: "Failed to generate the paper. Please try again — this attempt was not counted against your daily limit." },
      { status: 500 }
    );
  }
}
