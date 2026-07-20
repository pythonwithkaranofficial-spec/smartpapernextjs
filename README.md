# Smart Paper Generator AI

> "Generate CBSE Question Papers in Seconds using Artificial Intelligence."

Smart Paper Generator AI is an enterprise-grade, luxury-themed SaaS web application designed for school teachers, private tutors, and educational organizations to instantly compile CBSE board-standard question papers using Google's Gemini 2.5 Flash model.

---

## 🚀 Key Features

* **AI-Powered Paper Generation:** Integrated with Google Gemini 2.5 Flash model for unique, curriculum-aligned questions.
* **CBSE Syllabus Core:** Hardcoded chapters and topics for Classes 9, 10, 11, and 12 across major subjects.
* **6-Step Setup Wizard:** Elegant step-by-step form (Class → Subject → Exam Type → Parameters → Question Structure → Header Toggles) with auto-save.
* **Client-Side Limits:** Restricts paper generation to 5 papers/day per browser to avoid API abuse.
* **Real-time Print Preview:** View sheets in A4 proportions with zoom control and inline editing. Reorder or delete questions on the fly.
* **Professional Downloads:** Export to PDF (built via jsPDF) and Word Document (built via `docx` npm package) with no tables and standard board layouts.
* **Luxury Glassmorphism UI:** Built with animated background blobs, magnetic button pulls, and cursor tracking glows using Framer Motion and Tailwind CSS v4.

---

## 🛠️ Tech Stack

* **Core Framework:** Next.js 15 (App Router) + React 19 + TypeScript
* **Styling & UI:** Tailwind CSS v4 + Base UI (shadcn) + Framer Motion (for step transitions and pointer-glows)
* **AI Model:** Google Gen AI SDK (`@google/genai`) - Gemini 2.5 Flash
* **Document Generation:** jsPDF (Client PDF) + docx & file-saver (Client Word DOCX)
* **Notifications & Forms:** Sonner (Toast notifications) + Zod (Validation schemas)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layouts with fonts, dark theme provider
│   ├── page.tsx                    # Landing page containing all scroll sections
│   ├── generate/
│   │   └── page.tsx                # Multi-step wizard setup
│   ├── preview/
│   │   └── page.tsx                # Paper preview sheet + download actions
│   ├── api/
│   │   └── generate/
│   │       └── route.ts            # Server-side Gemini API route + rate limits
│   └── globals.css                 # Custom glass utilities & blob animations
├── components/
│   ├── ui/                         # shadcn components (button, card, input, etc.)
│   ├── landing/                    # Hero, Features, How It Works, About, CTA, Footer
│   ├── generator/                  # Wizard step subcomponents (1 through 6)
│   ├── preview/                    # Preview container, generating loading overlays
│   └── shared/                     # Navbar, MagneticButton, PointerGlow, AnimatedBackground
├── lib/
│   ├── gemini.ts                   # Gemini SDK configuration
│   ├── prompt-builder.ts           # System prompt context compilers
│   ├── pdf-generator.ts            # jsPDF client compiler
│   ├── docx-generator.ts           # docx package client compiler
│   ├── rate-limiter.ts             # Client-side daily check helpers
│   ├── curriculum-data.ts          # CBSE chapter index context
│   └── subjects-data.ts            # Class to subject listings
├── hooks/
│   ├── useGeneratePaper.ts         # Handles API calls & session cache
│   ├── useMousePosition.ts         # Pointer coordinates tracker
│   └── useScrollProgress.ts        # Scroll coordinates tracker
└── types/
    └── index.ts                    # TypeScript interface type definitions
```

---

## 📝 API Documentation

### POST `/api/generate`

Generates a CBSE-compliant question paper using parameters provided in the request body.

* **Headers:** `Content-Type: application/json`
* **Request Payload (`PaperConfig`):**
```json
{
  "classId": "10",
  "subject": "science",
  "examType": "half_yearly",
  "difficulty": "Medium",
  "language": "Bilingual",
  "totalMarks": 80,
  "duration": "3 Hours",
  "questionDistribution": {
    "mcq": 20,
    "assertionReason": 4,
    "vsa": 5,
    "sa": 6,
    "caseStudy": 3,
    "la": 4
  },
  "options": {
    "includeSchoolName": true,
    "schoolName": "Modern Public School",
    "includeTeacherName": true,
    "teacherName": "Karan Saini",
    "includeSchoolLogo": false,
    "includeClass": true,
    "includeSubject": true,
    "includeTime": true,
    "includeMaxMarks": true,
    "includeInstructions": true,
    "instructionsText": "1. All questions are compulsory.\n2. Section A contains 1 mark questions.",
    "includeInternalChoice": true
  }
}
```

* **Response Payload (`GeneratedPaper`):**
```json
{
  "schoolName": "Modern Public School",
  "examName": "Half Yearly",
  "subject": "Science",
  "classText": "Class 10",
  "timeText": "3 Hours",
  "maxMarksText": "80 Marks",
  "instructions": [
    "All questions are compulsory.",
    "Section A contains 1 mark questions."
  ],
  "sections": [
    {
      "name": "Section A",
      "description": "Multiple Choice Questions",
      "marksPerQuestion": 1,
      "questions": [
        {
          "id": "q_1",
          "number": 1,
          "text": "What is the chemical name of baking soda?",
          "marks": 1,
          "type": "mcq",
          "choices": ["Sodium bicarbonate", "Sodium carbonate", "Calcium chloride", "Sodium hydroxide"],
          "orQuestion": null
        }
      ]
    }
  ],
  "totalQuestions": 38,
  "totalMarks": 80
}
```

---

## 🔧 Environment Variables

Create a `.env.local` file at the root:
```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## ⚡ Deployment Guide (Vercel)

Deploy this project on Vercel in 3 simple steps:

1. **Push to Github / Git:** Ensure you commit all files except `.env.local`.
2. **Import to Vercel:** Connect Vercel to your repository.
3. **Configure Settings:**
   * Framework Preset: **Next.js**
   * Environment Variable: Add `GEMINI_API_KEY` under Settings -> Environment Variables.
4. **Deploy:** Click deploy. Vercel compiles the build and routes `/api/generate` into Vercel Functions.

---

## 🧪 Testing & Verification Guide

### 1. Verification Commands
To check type safety, code styles, and compile bundle outputs:
```bash
# Verify TypeScript compile safety
npx tsc --noEmit

# Lint code conventions
npm run lint

# Compile production bundle
npm run build
```

### 2. Manual Test Procedures
* **Limits verification:** Check that you can create up to 5 papers. Generate 6 papers and verify that the 6th blocks with a Sonner toast notification stating "Daily limit reached".
* **Print Layout:** Compile a test paper and click **Download PDF**. Open the file, check that margins are consistent and no overlapping text overlaps page boundaries.
* **Inline Edits:** Double-click on the "Maximum Marks" header or a question body in the preview page. Check that a text entry input opens, and clicking the checkmark updates the layout in real-time.
