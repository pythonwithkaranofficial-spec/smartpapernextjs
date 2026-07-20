import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildGeminiPrompt } from "@/lib/prompt-builder";
import { paperConfigSchema } from "@/lib/validations";
import { formatScientificText } from "@/lib/utils";

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

        // 7. Structure final response
        const isHindiSubject = 
          config.subject === "hindi" || 
          config.subject === "hindi_core" || 
          config.subject === "hindi_elective" || 
          config.subject === "हिन्दी" || 
          config.subject === "हिन्दी कोर" || 
          config.subject === "हिन्दी ऐच्छिक";

        let displaySubject = config.subject;
        if (config.subject === "hindi") displaySubject = "हिन्दी";
        if (config.subject === "hindi_core") displaySubject = "हिन्दी कोर";
        if (config.subject === "hindi_elective") displaySubject = "हिन्दी ऐच्छिक";

        finalPaper = {
          schoolName: config.options.includeSchoolName ? config.options.schoolName : undefined,
          examName: config.examType,
          subject: displaySubject,
          classText: `Class ${config.classId}`,
          timeText: config.duration,
          maxMarksText: isHindiSubject ? `${config.totalMarks} अंक` : `${config.totalMarks} Marks`,
          instructions: config.options.includeInstructions
            ? config.options.instructionsText
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
            : [],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sections: parsedPaper.sections.map((section: any) => {
            return {
              ...section,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions: (section.questions || []).map((q: any, idx: number) => {
                return {
                  ...q,
                  id: q.id || `q_${Math.random().toString(36).substr(2, 9)}`,
                  number: idx + 1,
                  text: formatScientificText(q.text || ""),
                  orQuestion: q.orQuestion ? formatScientificText(q.orQuestion) : null,
                  choices: (q.choices && q.choices.length > 0)
                    ? q.choices.map((choice: string) => formatScientificText(choice || ""))
                    : null,
                };
              })
            };
          }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          totalQuestions: parsedPaper.sections.reduce((acc: number, sec: any) => acc + (sec.questions || []).length, 0),
          totalMarks: config.totalMarks,
        };

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
