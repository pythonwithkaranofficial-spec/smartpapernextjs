import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { formatScientificText } from "@/lib/utils";
import { Question } from "@/types";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

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

    const isHindi = language === "Hindi" || subject.includes("हिन्दी") || subject.toLowerCase().includes("hindi");
    const langInstruction = isHindi 
      ? "Generate the entire question, choices, and solution strictly in HINDI language (Devanagari script)."
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from AI for question swap.");
    }

    const jsonText = cleanJsonString(responseText);
    const parsedNewQ = JSON.parse(jsonText);

    const formattedQuestion: Question = {
      id: questionToReplace.id || `q_${Math.random().toString(36).substring(2, 9)}`,
      number: questionToReplace.number,
      text: formatScientificText(parsedNewQ.text || ""),
      marks: questionToReplace.marks,
      type: questionToReplace.type,
      choices: (parsedNewQ.choices && Array.isArray(parsedNewQ.choices))
        ? parsedNewQ.choices.map((c: string) => formatScientificText(c))
        : undefined,
      orQuestion: parsedNewQ.orQuestion ? formatScientificText(parsedNewQ.orQuestion) : undefined,
      solution: parsedNewQ.solution ? formatScientificText(parsedNewQ.solution) : undefined,
      orSolution: parsedNewQ.orSolution ? formatScientificText(parsedNewQ.orSolution) : undefined,
    };

    return NextResponse.json({
      success: true,
      question: formattedQuestion,
    });

  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to swap question.";
    console.error("Swap Question Error:", errMessage);
    return NextResponse.json(
      { error: errMessage },
      { status: 500 }
    );
  }
}
