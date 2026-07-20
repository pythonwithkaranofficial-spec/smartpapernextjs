import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { CURRICULUM_DATA } from "@/lib/curriculum-data";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(request: NextRequest) {
  try {
    if (!ai) {
      return NextResponse.json(
        { error: "AI API key is not configured on the server." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { classText, subjectText, chaptersText } = body;

    if (!classText || !classText.trim()) {
      return NextResponse.json({ error: "Class input is required." }, { status: 400 });
    }
    if (!subjectText || !subjectText.trim()) {
      return NextResponse.json({ error: "Subject input is required." }, { status: 400 });
    }
    if (!chaptersText || !chaptersText.trim()) {
      return NextResponse.json({ error: "Chapters input is required." }, { status: 400 });
    }

    const systemPrompt = `
You are a CBSE Curriculum Normalization assistant. Your job is to parse raw user inputs for a question paper (Class, Subject, and Chapters) and normalize them to match the exact keys and chapter names in the system's curriculum database.

Here is the entire CURRICULUM_DATA catalog of supported standards:
${JSON.stringify(CURRICULUM_DATA, null, 2)}

Instructions:
1. Normalize Class:
   - Map the user's class input (e.g. "IX", "Grade 10", "12", "First") to one of the valid Class IDs: "9", "10", "11", "12".
   - If it is not in the list, map to the closest one.
2. Normalize Subject:
   - Map the user's subject input (e.g. "Math", "CS", "IP", "Bio", "Accounts", "BST", "Socio") to the valid subject key in CURRICULUM_DATA for the resolved Class ID.
   - Example keys: "maths", "science", "it", "ai", "english", "social", "physics", "chemistry", "biology", "cs", "ip", "economics", "accountancy", "bst", "history", "geography", "polscience".
3. Normalize Chapters:
   - Parse the user's chapter input (which can be comma-separated, newlines, raw phrases, or bullet points).
   - Resolve and correct any spelling mistakes, abbreviations, or shorthand forms.
   - For each chapter the user mentions, find the closest matching chapter name from the resolved subject's chapters list in the catalog.
   - Only return chapter names that are EXACT matches to the strings in the catalog's chapters list. Do not invent new chapter names. If a user chapter cannot be mapped to any chapter in the catalog, omit it.

Response Format:
You must output strictly a single valid JSON object containing:
{
  "classId": "9" | "10" | "11" | "12",
  "subject": "string (the matched subject key, e.g. 'maths', 'science', 'physics')",
  "selectedChapters": ["Chapter Name 1", "Chapter Name 2", ...] (array of matched chapter names from the catalog)
}

Do not wrap the JSON in markdown code blocks, do not write markdown descriptions, just output raw JSON text.
`;

    const userPrompt = `
User Inputs to Normalize:
- Class Input: "${classText}"
- Subject Input: "${subjectText}"
- Chapters Input: "${chaptersText}"
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.1, // low temperature for deterministic matching
      }
    });

    const responseText = response.text?.trim() || "";
    let jsonText = responseText;
    if (jsonText.includes("```")) {
      jsonText = jsonText.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    const parsed = JSON.parse(jsonText);

    // Final sanity validation: Make sure classId is one of 9, 10, 11, 12 and subject is valid
    const validClasses = ["9", "10", "11", "12"];
    const classId = validClasses.includes(parsed.classId) ? parsed.classId : "10"; // fallback
    
    const classCurriculum = CURRICULUM_DATA[classId];
    let subject = parsed.subject;
    if (!classCurriculum || !classCurriculum[subject]) {
      // Fallback to first available subject key for that class
      subject = Object.keys(classCurriculum || CURRICULUM_DATA["10"])[0];
    }

    const matchedChapters = parsed.selectedChapters || [];
    const validChapters = CURRICULUM_DATA[classId][subject].chapters;
    const selectedChapters = matchedChapters.filter((ch: string) => validChapters.includes(ch));

    // If no chapters matched, fallback to selecting all chapters or at least one
    const finalSelectedChapters = selectedChapters.length > 0 ? selectedChapters : [];

    return NextResponse.json({
      classId,
      subject,
      selectedChapters: finalSelectedChapters
    });

  } catch (error: any) {
    console.error("Normalization error:", error);
    return NextResponse.json(
      { error: "Failed to normalize inputs using AI.", details: error.message || error },
      { status: 500 }
    );
  }
}
