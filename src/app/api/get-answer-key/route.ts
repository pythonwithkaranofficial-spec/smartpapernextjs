import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { formatScientificText } from "@/lib/utils";
import mammoth from "mammoth";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Server-side rate limiting
const rateLimitMap = new Map<string, number[]>();
const DAILY_LIMIT = 25;
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
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileName = file.name.toLowerCase();

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
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts }],
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const responseText = response.text;
        if (!responseText) throw new Error("Empty response from AI model.");

        const cleanedJson = cleanJsonString(responseText);
        const parsedPaper = JSON.parse(cleanedJson);

        if (!parsedPaper || !parsedPaper.sections || !Array.isArray(parsedPaper.sections) || parsedPaper.sections.length === 0) {
          throw new Error("Invalid paper structure generated by AI.");
        }

        let questionCounter = 1;

        // Default exam header title is strictly "ANSWER KEY" unless user specified custom exam title
        const finalExamName = examName ? examName.toUpperCase() : "ANSWER KEY";

        finalPaper = {
          schoolName: schoolName ? schoolName.toUpperCase() : undefined,
          teacherName: teacherName ? teacherName : undefined,
          examName: finalExamName,
          subject: subject ? subject : "",
          classText: classText ? (classText.toLowerCase().startsWith("class") ? classText : `Class ${classText}`) : "",
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
      throw new Error(lastError?.message || "Failed to generate answer key after multiple AI attempts.");
    }

    recordRequest(ip);
    return NextResponse.json(finalPaper);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Get Answer Key API Error:", err);
    return NextResponse.json(
      { error: "Failed to generate answer key.", details: err.message },
      { status: 500 }
    );
  }
}
