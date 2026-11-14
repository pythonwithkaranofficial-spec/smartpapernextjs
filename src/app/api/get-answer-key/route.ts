import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { formatScientificText } from "@/lib/utils";
import { parseAiJson } from "@/lib/ai-json";
import { isComputerSubjectKey } from "@/lib/subject-detection";
import mammoth from "mammoth";
import { requireUser, isUserThrottled } from "@/lib/api-guard";
import { generateContentResilient, AIOverloadedError, AI_BUSY_MESSAGE } from "@/lib/gemini-call";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_TEXT_CHARS = 60_000;
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc", ".txt"];

/** Total of the (top-level) question marks in the generated key. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sumQuestionMarks(sections: any[]): number {
  return sections.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (acc: number, sec: any) => acc + (sec.questions || []).reduce((s: number, q: any) => s + (Number(q.marks || sec.marksPerQuestion) || 1), 0),
    0
  );
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if ("response" in auth) return auth.response;
    if (isUserThrottled(`answerkey:${auth.ctx.uid}`, 25, 24 * 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Daily limit reached. You can generate up to 25 answer keys per 24 hours." },
        { status: 429 }
      );
    }

    if (!ai) {
      return NextResponse.json(
        { error: "AI API key (GEMINI_API_KEY) is not configured on the server." },
        { status: 500 }
      );
    }

    let rawQuestionsText = "";
    let fileBase64Pdf: string | null = null;
    let outputMode: "questions_and_answers" | "answers_only" = "questions_and_answers";
    let schoolName = "";
    let examName = "";
    let subject = "";
    let classText = "";
    let teacherName = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const textInput = (formData.get("textInput") as string || "").trim();
      outputMode = (formData.get("outputMode") as "questions_and_answers" | "answers_only") || "questions_and_answers";
      schoolName = (formData.get("schoolName") as string || "").trim();
      examName = (formData.get("examName") as string || "").trim();
      subject = (formData.get("subject") as string || "").trim();
      classText = (formData.get("classText") as string || "").trim();
      teacherName = (formData.get("teacherName") as string || "").trim();

      const file = formData.get("file") as File | null;
      if (file && file.size > 0) {
        const fileName = file.name.toLowerCase();
        if (file.size > MAX_UPLOAD_BYTES) {
          return NextResponse.json({ error: "File is too large. Maximum size is 10 MB." }, { status: 413 });
        }
        if (!ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext))) {
          return NextResponse.json({ error: "Unsupported file type. Upload a PDF, DOCX or TXT file." }, { status: 415 });
        }
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        if (fileName.endsWith(".pdf")) {
          fileBase64Pdf = fileBuffer.toString("base64");
          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdfParse = require("pdf-parse");
            const parsedPdf = await pdfParse(fileBuffer);
            if (parsedPdf && parsedPdf.text && parsedPdf.text.trim()) {
              rawQuestionsText = parsedPdf.text.trim();
            }
          } catch (e) {
            console.log("PDF parse fallback to Gemini native inline document reader:", e);
          }
        } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
          try {
            const parsedDoc = await mammoth.extractRawText({ buffer: fileBuffer });
            rawQuestionsText = parsedDoc.value || "";
          } catch (e) {
            console.error("DOCX extraction error:", e);
            rawQuestionsText = fileBuffer.toString("utf-8");
          }
        } else {
          rawQuestionsText = fileBuffer.toString("utf-8");
        }
      }

      if (textInput) {
        rawQuestionsText = (rawQuestionsText ? `${rawQuestionsText}\n\n${textInput}` : textInput).trim();
      }
    } else {
      const body = await request.json();
      rawQuestionsText = (body.textInput || "").trim();
      outputMode = body.outputMode || "questions_and_answers";
      schoolName = (body.schoolName || "").trim();
      examName = (body.examName || "").trim();
      subject = (body.subject || "").trim();
      classText = (body.classText || "").trim();
      teacherName = (body.teacherName || "").trim();
    }

    if (!rawQuestionsText && !fileBase64Pdf) {
      return NextResponse.json(
        { error: "No questions or file content provided. Please type/paste questions or upload a document." },
        { status: 400 }
      );
    }

    if (rawQuestionsText.length > MAX_TEXT_CHARS) {
      rawQuestionsText = rawQuestionsText.slice(0, MAX_TEXT_CHARS);
    }
    outputMode = outputMode === "answers_only" ? "answers_only" : "questions_and_answers";
    schoolName = schoolName.slice(0, 150);
    examName = examName.slice(0, 150);
    subject = subject.slice(0, 120);
    classText = classText.slice(0, 50);
    teacherName = teacherName.slice(0, 120);

    const systemPrompt = `You are an expert CBSE & Academic Teacher and Exam Evaluator.
Your task is to analyze the provided set of questions (typed text or uploaded question paper document) and generate complete, accurate, step-by-step answers and detailed marking schemes for EVERY single question.

RULES FOR THE AI:
1. Parse every question provided in the input text or document accurately.
2. Group the questions into logical sections (e.g. "Section A - Objective & MCQs", "Section B - Short Answer Questions", "Section C - Long Answer & Detailed Solutions").
3. For EVERY question, write a comprehensive, accurate, step-by-step solution ("solution") with full explanation and marking breakdown.
4. If a question is an MCQ, extract all choices into the "choices" array and explicitly state the correct option + detailed reason in "solution".
5. If a question contains internal choices ("OR"), include the secondary question in "orQuestion" and its solution in "orSolution".
6. Format mathematical formulas using standard LaTeX notation ($...$ or \\(...\\)).

Return strictly a JSON object matching this exact structure:

{
  "sections": [
    {
      "name": "SECTION A",
      "description": "OBJECTIVE TYPE & SHORT QUESTIONS",
      "marksPerQuestion": 1,
      "questions": [
        {
          "id": "q1",
          "number": 1,
          "text": "Question text here...",
          "marks": 1,
          "type": "mcq",
          "choices": ["(a) Option 1", "(b) Option 2", "(c) Option 3", "(d) Option 4"],
          "solution": "Correct Answer: (a) Option 1\\nExplanation: Detailed step-by-step reason..."
        }
      ]
    }
  ]
}

Return raw JSON only. Do not wrap in markdown or introductory text outside JSON.`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts: any[] = [];
    if (fileBase64Pdf) {
      parts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: fileBase64Pdf,
        },
      });
    }
    parts.push({
      text: `${systemPrompt}\n\nUSER PROVIDED QUESTIONS DATA:\n${rawQuestionsText || "Please read the attached PDF document and generate complete answers and marking scheme for all questions contained within it."}`,
    });

    let finalPaper: Record<string, unknown> | null = null;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await generateContentResilient(ai, {
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts }],
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const responseText = response.text;
        if (!responseText) throw new Error("Empty response from AI model.");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsedPaper = parseAiJson<any>(responseText);
        const format = (text: string) => formatScientificText(text, { codeSafe: isComputerSubjectKey(subject) });

        if (!parsedPaper || !parsedPaper.sections || !Array.isArray(parsedPaper.sections) || parsedPaper.sections.length === 0) {
          throw new Error("Invalid paper structure generated by AI.");
        }

        let questionCounter = 1;

        const cleanSubject = (subject && subject !== "General / Custom") ? subject : "";
        const cleanClass = (classText && classText !== "Class X") ? (classText.toLowerCase().startsWith("class") ? classText : `Class ${classText}`) : "";
        const finalExamName = examName ? examName.toUpperCase() : "ANSWER KEY & SOLUTIONS";

        finalPaper = {
          schoolName: schoolName ? schoolName.toUpperCase() : undefined,
          teacherName: teacherName ? teacherName : undefined,
          examName: finalExamName,
          subject: cleanSubject,
          classText: cleanClass,
          timeText: "",
          maxMarksText: "",
          instructions: [],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sections: parsedPaper.sections.map((section: any) => {
            return {
              ...section,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions: (section.questions || []).map((q: any) => {
                const qNum = questionCounter++;
                return {
                  ...q,
                  id: q.id || `q_ans_${Math.random().toString(36).substr(2, 9)}`,
                  number: qNum,
                  text: format(q.text || ""),
                  marks: q.marks || section.marksPerQuestion || 1,
                  orQuestion: q.orQuestion ? format(q.orQuestion) : null,
                  choices: (q.choices && q.choices.length > 0)
                    ? q.choices.map((choice: string) => format(choice || ""))
                    : null,
                  solution: q.solution ? format(q.solution) : "Solution provided above.",
                  orSolution: q.orSolution ? format(q.orSolution) : null,
                };
              }),
            };
          }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          totalQuestions: parsedPaper.sections.reduce((acc: number, sec: any) => acc + (sec.questions || []).length, 0),
          totalMarks: sumQuestionMarks(parsedPaper.sections),
          hasAnswerKey: true,
          outputMode: outputMode,
        };

        break;
      } catch (err: unknown) {
        if (err instanceof AIOverloadedError) throw err;
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`Get Answer Key Attempt ${attempt} failed:`, lastError.message);
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }

    if (!finalPaper) {
      throw new Error(lastError?.message || "Failed to generate answer key after multiple AI attempts.");
    }

    return NextResponse.json(finalPaper);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Get Answer Key API Error:", err);
    if (error instanceof AIOverloadedError) {
      return NextResponse.json({ error: AI_BUSY_MESSAGE, code: "AI_BUSY" }, { status: 503 });
    }
    return NextResponse.json(
      { error: "Failed to generate answer key. Please try again." },
      { status: 500 }
    );
  }
}
