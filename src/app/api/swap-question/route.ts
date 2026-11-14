import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { formatScientificText } from "@/lib/utils";
import { parseAiJson } from "@/lib/ai-json";
import { isComputerSubjectKey, isHindiSubjectKey } from "@/lib/subject-detection";
import { Question } from "@/types";
import { requireUser, isUserThrottled, throttledResponse } from "@/lib/api-guard";
import { generateContentResilient, AIOverloadedError, AI_BUSY_MESSAGE } from "@/lib/gemini-call";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if ("response" in auth) return auth.response;
    // 60 swaps per hour per user
    if (isUserThrottled(`swap:${auth.ctx.uid}`, 60, 60 * 60 * 1000)) return throttledResponse();

    if (!ai) {
      return NextResponse.json(
        { error: "AI Service Error: GEMINI_API_KEY is missing." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { 
      questionToReplace, 
      subject = "General", 
      classText = "Class 10", 
      language = "English", 
      excludeQuestionTexts = [] 
    }: {
      questionToReplace: Question;
      subject: string;
      classText: string;
      language?: string;
      excludeQuestionTexts?: string[];
    } = body;

    if (!questionToReplace || !questionToReplace.type) {
      return NextResponse.json(
        { error: "Invalid request payload: questionToReplace is required." },
        { status: 400 }
      );
    }

    const exclusionList = excludeQuestionTexts.length > 0
      ? excludeQuestionTexts.map(t => `- ${t}`).join("\n")
      : "- None";

    const isHindi = language === "Hindi" || isHindiSubjectKey(subject) || subject.includes("हिन्दी");
    const langInstruction = isHindi
      ? "Generate the entire question, choices, and solution strictly in HINDI language (Devanagari script)."
      : language === "Bilingual"
        ? "Write the question and each choice bilingually: first the English version, then the Hindi translation (Devanagari script) directly below it, separated by a newline. The solution may be in English."
        : "Generate the question, choices, and solution in ENGLISH language.";

    const prompt = `You are a senior CBSE examination paper author.
Task: Create ONE SINGLE fresh replacement question for CBSE ${classText} ${subject}.

TARGET QUESTION SPECIFICATIONS:
- Question Type: ${questionToReplace.type}
- Marks: ${questionToReplace.marks} Marks
- ${langInstruction}

EXCLUSION RULE (CRITICAL):
Do NOT repeat, duplicate, or rephrase any of these existing questions:
${exclusionList}

REQUIREMENTS:
1. Generate 1 single high-quality, concept-testing question matching CBSE guidelines.
2. If Question Type is "mcq", provide exactly 4 plausible choices in the "choices" array.
3. If Question Type is "assertionReason", choices MUST be standard 4 Assertion-Reason options (A, B, C, D).
4. Provide a detailed, step-by-step solution in the "solution" field.
5. If the original question had an internal choice (orQuestion), generate a replacement "orQuestion" and "orSolution" as well; otherwise set them to null.
6. Return strictly valid JSON following the schema below.

JSON SCHEMA:
{
  "id": "q_swap_${Math.random().toString(36).substring(2, 9)}",
  "text": "Question text...",
  "marks": ${questionToReplace.marks},
  "type": "${questionToReplace.type}",
  "choices": ["Choice A", "Choice B", "Choice C", "Choice D"], // null if not MCQ/AR
  "orQuestion": null, // string if internal choice, null otherwise
  "solution": "Step-by-step solution and marking scheme breakdown",
  "orSolution": null
}`;

    const response = await generateContentResilient(ai, {
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
        // One question; generous enough for thinking tokens, bounded for cost.
        maxOutputTokens: 16384,
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from AI for question swap.");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsedNewQ = parseAiJson<any>(responseText);
    const format = (text: string) => formatScientificText(text, { codeSafe: isComputerSubjectKey(subject) });

    const formattedQuestion: Question = {
      id: questionToReplace.id || `q_${Math.random().toString(36).substring(2, 9)}`,
      number: questionToReplace.number,
      text: format(parsedNewQ.text || ""),
      marks: questionToReplace.marks,
      type: questionToReplace.type,
      choices: (parsedNewQ.choices && Array.isArray(parsedNewQ.choices))
        ? parsedNewQ.choices.map((c: string) => format(c))
        : undefined,
      orQuestion: parsedNewQ.orQuestion ? format(parsedNewQ.orQuestion) : undefined,
      solution: parsedNewQ.solution ? format(parsedNewQ.solution) : undefined,
      orSolution: parsedNewQ.orSolution ? format(parsedNewQ.orSolution) : undefined,
    };

    return NextResponse.json({
      success: true,
      question: formattedQuestion,
    });

  } catch (error: unknown) {
    console.error("Swap Question Error:", error);
    if (error instanceof AIOverloadedError) {
      return NextResponse.json({ error: AI_BUSY_MESSAGE, code: "AI_BUSY" }, { status: 503 });
    }
    return NextResponse.json(
      { error: "Failed to swap the question. Please try again." },
      { status: 500 }
    );
  }
}
