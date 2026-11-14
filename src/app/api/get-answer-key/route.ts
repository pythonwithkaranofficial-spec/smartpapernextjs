import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import mammoth from "mammoth";
import { extractDocxText } from "@/lib/docx-text";
import { requireUser, isUserThrottled } from "@/lib/api-guard";
import { AIOverloadedError, AI_BUSY_MESSAGE } from "@/lib/gemini-call";
import { generateAnswerKey, AnswerKeyTruncatedError } from "@/lib/answer-key";

// Long answer keys can take a few minutes (Fluid Compute allows up to 300 s on Hobby).
export const maxDuration = 300;

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const MAX_UPLOAD_BYTES = 4.4 * 1024 * 1024; // Vercel caps request bodies at 4.5 MB
const MAX_TEXT_CHARS = 60_000;
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

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
          return NextResponse.json({ error: "File is too large. Maximum size is 4 MB: compress the PDF or split it." }, { status: 413 });
        }
        if (!ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext))) {
          return NextResponse.json({
            error: fileName.endsWith(".doc")
              ? "Old .doc files are not supported. In Word, use File > Save As > Word Document (.docx), or upload a PDF."
              : "Unsupported file type. Upload a PDF, DOCX or TXT file.",
          }, { status: 415 });
        }
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        if (fileName.endsWith(".pdf")) {
          // Gemini reads the PDF natively (text, equations, diagrams and scanned pages), which is far
          // more faithful than plain-text extraction of math-heavy papers.
          fileBase64Pdf = fileBuffer.toString("base64");
        } else if (fileName.endsWith(".docx")) {
          try {
            // Keeps Word auto-numbering, option letters, equations and tables (mammoth drops them).
            rawQuestionsText = await extractDocxText(fileBuffer);
          } catch (e) {
            console.error("DOCX extraction error, falling back to mammoth:", e);
            try {
              const parsedDoc = await mammoth.extractRawText({ buffer: fileBuffer });
              rawQuestionsText = parsedDoc.value || "";
            } catch {
              return NextResponse.json({ error: "Could not read this Word file. Please re-save it as .docx or upload a PDF." }, { status: 422 });
            }
          }
          if (!rawQuestionsText.trim()) {
            return NextResponse.json({ error: "No text was found in this Word file. If it only contains images, upload it as a PDF instead." }, { status: 422 });
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

    const finalPaper = await generateAnswerKey(ai, {
      rawQuestionsText,
      pdfBase64: fileBase64Pdf,
      outputMode,
      schoolName,
      examName,
      subject,
      classText,
      teacherName,
    });

    return NextResponse.json(finalPaper);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Get Answer Key API Error:", err);
    if (error instanceof AIOverloadedError) {
      return NextResponse.json({ error: AI_BUSY_MESSAGE, code: "AI_BUSY" }, { status: 503 });
    }
    if (error instanceof AnswerKeyTruncatedError) {
      return NextResponse.json({
        error: "This paper is too long to solve in one go. Please split it into two parts (for example Sections A-C, then D-E) and generate each separately.",
        code: "TOO_LONG",
      }, { status: 413 });
    }
    return NextResponse.json(
      { error: "Failed to generate answer key. Please try again." },
      { status: 500 }
    );
  }
}
