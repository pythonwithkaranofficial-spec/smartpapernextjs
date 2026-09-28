import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildGeminiPrompt } from "@/lib/prompt-builder";
import { paperConfigSchema } from "@/lib/validations";
import { formatScientificText, cleanInstructionText } from "@/lib/utils";
import { EXAM_TYPES } from "@/lib/exam-types";

// Initialize Gemini Client
// We use the official API key from env variable
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Server-side in-memory rate limiter
// Maps IP to array of request timestamps (ms)
const rateLimitMap = new Map<string, number[]>();
const DAILY_LIMIT = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  
  // Filter out timestamps older than 24 hours
  const activeTimestamps = timestamps.filter(ts => now - ts < DAY_MS);
  rateLimitMap.set(ip, activeTimestamps);

  return activeTimestamps.length >= DAILY_LIMIT;
}

function recordRequest(ip: string) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
}

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  
  // 1. Remove markdown code blocks if present
  if (cleaned.includes("```")) {
    cleaned = cleaned.replace(/```json/g, "").replace(/```/g, "").trim();
  }

  // 2. Double-escape any backslashes that are not part of a double-backslash (\\),
  // an escaped quote (\"), or a valid unicode escape sequence (\uXXXX)
  cleaned = cleaned.replace(/(?<!\\)\\(?!["\\]|u[0-9a-fA-F]{4})/g, "\\\\");

  // 3. Remove trailing commas in arrays/objects which break standard JSON.parse
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");

  return cleaned;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedQuestions = questions.map((q: any) => {
        const qNum = globalQNum++;
        let choices = q.choices ? [...q.choices] : null;

        // Shuffle choices for MCQs in Set B and Set C
        if (s > 0 && choices && choices.length === 4 && q.type === "mcq") {
          choices = shuffleArray(choices, s * 50 + qNum);
        }

        return {
          ...q,
          number: qNum,
          choices,
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

export async function POST(request: NextRequest) {
  try {
    // 1. IP Rate Limiting Check
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Daily generation limit reached. You can only generate 5 papers per 24 hours." },
        { status: 429 }
      );
    }

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

    // Force Hindi subject language internally to Hindi
    const isHindiSubject = 
      config.subject === "hindi" || 
      config.subject === "hindi_core" || 
      config.subject === "hindi_elective" || 
      config.subject === "हिन्दी" || 
      config.subject === "हिन्दी कोर" || 
      config.subject === "हिन्दी ऐच्छिक";
      
    if (isHindiSubject) {
      config.language = "Hindi";
    }

    // 4. Construct prompt
    const prompt = buildGeminiPrompt(config);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let finalPaper: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastError: any = null;
    const MAX_RETRIES = 5;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Starting paper generation attempt ${attempt} of ${MAX_RETRIES}...`);

        // 5. Generate content using Gemini 2.5 Flash
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            // Enforce JSON response type
            responseMimeType: "application/json",
            // Vary temperature slightly on retries to prompt different completions
            temperature: attempt > 1 ? 0.7 + (attempt * 0.05) : 0.7,
          }
        });

        const responseText = response.text;
        console.log("DEBUG - Raw Model Response:", responseText);
        if (!responseText) {
          throw new Error("Empty response from AI.");
        }

        // 6. Clean and parse JSON response
        let jsonText = responseText.trim();
        if (jsonText.includes("```")) {
          jsonText = jsonText.replace(/```json/g, "").replace(/```/g, "").trim();
        }

        // Run custom backslash cleaner to ensure mathematical expressions don't break JSON.parse
        jsonText = cleanJsonString(jsonText);

        const parsedPaper = JSON.parse(jsonText);

        if (!parsedPaper || !parsedPaper.sections || !Array.isArray(parsedPaper.sections) || parsedPaper.sections.length === 0) {
          throw new Error("Invalid paper structure returned: sections must be a non-empty array.");
        }

        const rawSubject = (config.isCustom ? (config.customSubject || config.subject) : config.subject) || "";
        const normSubject = rawSubject.toLowerCase().trim();
        const classStr = ((config.isCustom ? (config.customClass || config.classId) : config.classId) || "").toString().trim();
        const isClass10 = classStr === "10" || classStr.includes("10");
        const isScience = normSubject === "science" || normSubject.includes("science") || normSubject === "sci";
        const isClass10Science = isClass10 && isScience;
        const isFullClass10ScienceExam = isClass10Science && (
          config.totalMarks >= 70 ||
          ((config.examType === "annual_exam" ||
            config.examType === "pre_board" ||
            config.examType === "sample_paper" ||
            config.examType === "half_yearly") &&
            (config.totalMarks >= 60 || !config.totalMarks))
        );

        if (isFullClass10ScienceExam) {
          if (parsedPaper.sections.length < 3) {
            throw new Error(`Class 10 Science paper validation failed: Expected 3 sections (Biology, Chemistry, Physics), but received ${parsedPaper.sections.length}.`);
          }

          const bioSection = parsedPaper.sections[0];
          const chemSection = parsedPaper.sections[1];
          const phySection = parsedPaper.sections[2];

          const bioCount = (bioSection.questions || []).length;
          const chemCount = (chemSection.questions || []).length;
          const phyCount = (phySection.questions || []).length;

          if (bioCount !== 16 || chemCount !== 13 || phyCount !== 10) {
            throw new Error(`Class 10 Science question count mismatch: Expected Biology: 16Q (got ${bioCount}), Chemistry: 13Q (got ${chemCount}), Physics: 10Q (got ${phyCount}). Total must be 39.`);
          }

          const EXPECTED_BIO_MARKS = [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4, 5]; // Sum: 30
          const EXPECTED_CHEM_MARKS = [1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 3, 4, 5]; // Sum: 25
          const EXPECTED_PHY_MARKS = [1, 1, 1, 2, 2, 3, 3, 3, 4, 5]; // Sum: 25

          const bioMarksActual = bioSection.questions.reduce((sum: number, q: any) => sum + (typeof q.marks === "number" ? q.marks : 0), 0);
          const chemMarksActual = chemSection.questions.reduce((sum: number, q: any) => sum + (typeof q.marks === "number" ? q.marks : 0), 0);
          const phyMarksActual = phySection.questions.reduce((sum: number, q: any) => sum + (typeof q.marks === "number" ? q.marks : 0), 0);
          const totalMarksActual = bioMarksActual + chemMarksActual + phyMarksActual;

          if (bioMarksActual > 0 && bioMarksActual !== 30) {
            throw new Error(`Class 10 Science marks mismatch in Biology: Expected 30 marks, calculated ${bioMarksActual}.`);
          }
          if (chemMarksActual > 0 && chemMarksActual !== 25) {
            throw new Error(`Class 10 Science marks mismatch in Chemistry: Expected 25 marks, calculated ${chemMarksActual}.`);
          }
          if (phyMarksActual > 0 && phyMarksActual !== 25) {
            throw new Error(`Class 10 Science marks mismatch in Physics: Expected 25 marks, calculated ${phyMarksActual}.`);
          }
          if (totalMarksActual > 0 && totalMarksActual !== 80) {
            throw new Error(`Class 10 Science total marks mismatch: Expected 80 marks, calculated ${totalMarksActual}.`);
          }

          bioSection.name = "Section A";
          bioSection.description = "Biology: Q1–Q16 (30 Marks)";
          bioSection.questions.forEach((q: any, idx: number) => {
            q.number = idx + 1;
            q.marks = EXPECTED_BIO_MARKS[idx];
          });

          chemSection.name = "Section B";
          chemSection.description = "Chemistry: Q17–Q29 (25 Marks)";
          chemSection.questions.forEach((q: any, idx: number) => {
            q.number = 17 + idx;
            q.marks = EXPECTED_CHEM_MARKS[idx];
          });

          phySection.name = "Section C";
          phySection.description = "Physics: Q30–Q39 (25 Marks)";
          phySection.questions.forEach((q: any, idx: number) => {
            q.number = 30 + idx;
            q.marks = EXPECTED_PHY_MARKS[idx];
          });
        }

        // 7. Structure final response
        const isHindiSubject = 
          config.subject === "hindi" || 
          config.subject === "hindi_core" || 
          config.subject === "hindi_elective" || 
          config.subject === "हिन्दी" || 
          config.subject === "हिन्दी कोर" || 
          config.subject === "हिन्दी ऐच्छिक";

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

        let globalQNum = 1;

        finalPaper = {
          schoolName: config.options.includeSchoolName && config.options.schoolName ? config.options.schoolName.toUpperCase() : undefined,
          teacherName: config.options.includeTeacherName && config.options.teacherName ? config.options.teacherName : undefined,
          examName: displayExamName,
          subject: displaySubject,
          classText: displayClassText,
          timeText: config.duration,
          maxMarksText: isHindiSubject ? `${config.totalMarks} अंक` : `${config.totalMarks} Marks`,
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sections: parsedPaper.sections.map((section: any) => {
            return {
              ...section,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions: (section.questions || []).map((q: any) => {
                const assignedNum = typeof q.number === "number" && q.number > 0 ? q.number : globalQNum++;

                let cleanedText = formatScientificText(q.text || "");
                cleanedText = cleanedText.replace(/^\s*(?:Q\.?\s*)?\d+[\.\)\:\t]\s*/i, "").trim();

                let cleanedOrQuestion = q.orQuestion ? formatScientificText(q.orQuestion) : null;
                if (cleanedOrQuestion) {
                  cleanedOrQuestion = cleanedOrQuestion.replace(/^\s*(?:Q\.?\s*)?\d+[\.\)\:\t]\s*/i, "").trim();
                }

                const cleanedChoices = (q.choices && q.choices.length > 0)
                  ? q.choices.map((choice: string) => {
                      const text = formatScientificText(choice || "");
                      return text.replace(/^\s*(?:\([A-Da-d]\)|[A-Da-d][\.\)])\s*/, "").trim();
                    })
                  : null;

                return {
                  ...q,
                  id: q.id || `q_${Math.random().toString(36).substr(2, 9)}`,
                  number: assignedNum,
                  text: cleanedText,
                  orQuestion: cleanedOrQuestion,
                  choices: cleanedChoices,
                  solution: q.solution ? formatScientificText(q.solution) : null,
                  orSolution: q.orSolution ? formatScientificText(q.orSolution) : null,
                };
              })
            };
          }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          totalQuestions: parsedPaper.sections.reduce((acc: number, sec: any) => acc + (sec.questions || []).length, 0),
          totalMarks: config.totalMarks,
          hasAnswerKey: config.options.includeAnswerKey !== false,
        };

        // If multi-set generation is requested (2 or 3 sets)
        const requestedSets = config.options?.numberOfSets || (config as Record<string, unknown>).numberOfSets || 1;
        if (typeof requestedSets === "number" && requestedSets > 1) {
          const generatedSets = generatePaperSets(finalPaper, requestedSets);
          finalPaper = {
            ...generatedSets[0],
            sets: generatedSets,
          };
        }

        break;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(`Attempt ${attempt} failed:`, err.message || err);
        lastError = err;
        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }

    if (!finalPaper) {
      throw new Error(lastError?.message || "Failed to generate valid paper layout after multiple retries.");
    }

    // 8. Record request under rate limiter
    recordRequest(ip);

    return NextResponse.json(finalPaper);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Silent generation error after retries:", error);
    return NextResponse.json(
      { error: "Failed to generate paper from AI.", details: error.message || error },
      { status: 500 }
    );
  }
}
