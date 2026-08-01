import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { formatScientificText, cleanInstructionText } from "@/lib/utils";
import mammoth from "mammoth";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Server-side rate limiting
const rateLimitMap = new Map<string, number[]>();
const DAILY_LIMIT = 15;
const DAY_MS = 24 * 60 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
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
  if (cleaned.includes("```")) {
    cleaned = cleaned.replace(/```json/g, "").replace(/```/g, "").trim();
  }
  cleaned = cleaned.replace(/(?<!\\)\\(?!["\\]|u[0-9a-fA-F]{4})/g, "\\\\");
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Daily limit reached. You can generate up to 15 answer keys per 24 hours." },
        { status: 429 }
      );
    }

    if (!ai) {
      return NextResponse.json(
        { error: "AI API key is not configured on the server." },
        { status: 500 }
      );
    }

    let rawQuestionsText = "";
    let fileBase64Pdf: string | null = null;
    let outputMode: "questions_and_answers" | "answers_only" = "questions_and_answers";
    let schoolName = "";
    let examName = "ANSWER KEY & SOLUTIONS";
    let subject = "General / Custom";
    let classText = "Class X";
    let teacherName = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const textInput = formData.get("textInput") as string || "";
      outputMode = (formData.get("outputMode") as "questions_and_answers" | "answers_only") || "questions_and_answers";
      schoolName = (formData.get("schoolName") as string || "").trim();
      examName = (formData.get("examName") as string || "ANSWER KEY & SOLUTIONS").trim();
      subject = (formData.get("subject") as string || "General / Custom").trim();
      classText = (formData.get("classText") as string || "Class X").trim();
      teacherName = (formData.get("teacherName") as string || "").trim();

      const file = formData.get("file") as File | null;
      if (file && file.size > 0) {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith(".pdf")) {
          try {
            const parsedPdf = await pdfParse(fileBuffer);
            rawQuestionsText = parsedPdf.text || "";
          } catch (e) {
            console.warn("pdf-parse fallback to inline base64 for Gemini:", e);
            fileBase64Pdf = fileBuffer.toString("base64");
          }
        } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
          const parsedDoc = await mammoth.extractRawText({ buffer: fileBuffer });
          rawQuestionsText = parsedDoc.value || "";
        } else {
          // Plain text or fallback
          rawQuestionsText = fileBuffer.toString("utf-8");
        }
      }

      if (textInput.trim()) {
        rawQuestionsText = (rawQuestionsText + "\n\n" + textInput).trim();
      }
    } else {
      const body = await request.json();
      rawQuestionsText = (body.textInput || "").trim();
      outputMode = body.outputMode || "questions_and_answers";
      schoolName = (body.schoolName || "").trim();
      examName = (body.examName || "ANSWER KEY & SOLUTIONS").trim();
      subject = (body.subject || "General / Custom").trim();
      classText = (body.classText || "Class X").trim();
      teacherName = (body.teacherName || "").trim();
    }

    if (!rawQuestionsText && !fileBase64Pdf) {
      return NextResponse.json(
        { error: "No questions or file content provided. Please type/paste questions or upload a document." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert CBSE/Academic Teacher and Exam Evaluator.
Your task is to analyze the provided set of questions (which can be typed text, pasted questions, or document contents) and generate complete, accurate, step-by-step answers and detailed marking schemes for EVERY single question.

RULES FOR THE AI:
1. Parse every question provided in the input text accurately.
2. Group the questions into logical sections (e.g. "Section A - Objective & MCQs", "Section B - Short Answer Questions", "Section C - Long Answer & Detailed Solutions", etc.). If no clear sections exist, create appropriate logical sections.
3. For EVERY question, write a comprehensive, accurate, step-by-step solution ("solution") with full explanation and marking breakdown.
4. If a question is an MCQ, extract all 4 options into the "choices" array and explicitly state the correct option + detailed reason in "solution".
5. If a question contains internal choices ("OR"), include the secondary question in "orQuestion" and its solution in "orSolution".
6. Format mathematical formulas using standard LaTeX notation ($...$ or \\(...\\)).
7. Return strictly a JSON object with this exact structure:

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

DO NOT wrap the JSON in extra text outside the JSON object. Return raw JSON.`;

    // Prepare contents array for Gemini
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contents: any[] = [];
    if (fileBase64Pdf) {
      contents.push({
        inlineData: {
          mimeType: "application/pdf",
          data: fileBase64Pdf,
        },
      });
    }
    contents.push({
      text: `${systemPrompt}\n\nUSER PROVIDED QUESTIONS DATA:\n${rawQuestionsText || "Please read the attached PDF document above and answer all questions."}`,
    });

    let finalPaper: Record<string, unknown> | null = null;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
          config: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const responseText = response.text;
        if (!responseText) throw new Error("Empty response from AI.");

        const cleanedJson = cleanJsonString(responseText);
        const parsedPaper = JSON.parse(cleanedJson);

        if (!parsedPaper || !parsedPaper.sections || !Array.isArray(parsedPaper.sections)) {
          throw new Error("Invalid paper structure generated.");
        }

        const isAnswersOnly = outputMode === "answers_only";
        let questionCounter = 1;

        // Structure into GeneratedPaper layout
        finalPaper = {
          schoolName: schoolName ? schoolName.toUpperCase() : undefined,
          teacherName: teacherName ? teacherName : undefined,
          examName: examName ? examName.toUpperCase() : "ANSWER KEY & SOLUTIONS",
          subject: subject,
          classText: classText.toLowerCase().startsWith("class") ? classText : `Class ${classText}`,
          timeText: "Flexible",
          maxMarksText: "As Assigned",
          instructions: isAnswersOnly
            ? [
                "Official Answer Key & Detailed Step-by-Step Marking Scheme.",
                "Review solutions thoroughly for evaluation and step marking.",
                "Editable inline before downloading or printing."
              ].map(i => cleanInstructionText(i))
            : [
                "Answer all questions compulsory according to section guidelines.",
                "Comprehensive Solutions & Answer Key attached below each question.",
                "Editable inline before downloading as PDF or Word document."
              ].map(i => cleanInstructionText(i)),
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
                  text: formatScientificText(q.text || ""),
                  marks: q.marks || section.marksPerQuestion || 1,
                  orQuestion: q.orQuestion ? formatScientificText(q.orQuestion) : null,
                  choices: (q.choices && q.choices.length > 0)
                    ? q.choices.map((choice: string) => formatScientificText(choice || ""))
                    : null,
                  solution: q.solution ? formatScientificText(q.solution) : "Solution provided above.",
                  orSolution: q.orSolution ? formatScientificText(q.orSolution) : null,
                };
              }),
            };
          }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          totalQuestions: parsedPaper.sections.reduce((acc: number, sec: any) => acc + (sec.questions || []).length, 0),
          totalMarks: 100,
          hasAnswerKey: true,
          outputMode: outputMode,
        };

        break;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`Get Answer Key Attempt ${attempt} failed:`, lastError.message);
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }

    if (!finalPaper) {
      throw new Error(lastError?.message || "Failed to generate answer key from AI.");
    }

    recordRequest(ip);
    return NextResponse.json(finalPaper);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Get Answer Key API error:", err);
    return NextResponse.json(
      { error: "Failed to generate answer key.", details: err.message },
      { status: 500 }
    );
  }
}
