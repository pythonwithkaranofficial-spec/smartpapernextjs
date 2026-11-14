"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { PaperPreview } from "@/components/preview/PaperPreview";
import { DownloadBar } from "@/components/preview/DownloadBar";
import { Footer } from "@/components/landing/Footer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { GeneratedPaper, PaperConfig, PaperSection } from "@/types";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useGeneratePaper } from "@/hooks/useGeneratePaper";
import { GeneratingOverlay } from "@/components/preview/GeneratingOverlay";
import { formatScientificText, cleanInstructionText } from "@/lib/utils";
import { isComputerSubjectKey } from "@/lib/subject-detection";

interface PreviewState {
  paper: GeneratedPaper | null;
  lastConfig: PaperConfig | null;
  initialMode?: "paper" | "solutions";
}

/** A stored config is only usable for "Re-generate" if it is a complete wizard config. */
function isRegenerableConfig(value: unknown): value is PaperConfig {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<PaperConfig>;
  return (
    typeof c.classId === "string" && c.classId.length > 0 &&
    typeof c.subject === "string" && c.subject.length > 0 &&
    typeof c.examType === "string" && c.examType.length > 0 &&
    typeof c.totalMarks === "number" &&
    typeof c.duration === "string" &&
    !!c.questionDistribution && typeof c.questionDistribution === "object" &&
    !!c.options && typeof c.options === "object"
  );
}

type RawPaper = GeneratedPaper & { sections: PaperSection[] };

/** Applies scientific symbol formatting (code-safe for programming subjects). */
function formatPaperForDisplay<T extends RawPaper>(raw: T, codeSafe: boolean): T {
  const format = (text: string) => formatScientificText(text, { codeSafe });
  return {
    ...raw,
    instructions: (raw.instructions || []).map((ins) => cleanInstructionText(format(ins))),
    sections: (raw.sections || []).map((section) => ({
      ...section,
      questions: (section.questions || []).map((q) => ({
        ...q,
        text: format(q.text || ""),
        orQuestion: q.orQuestion ? format(q.orQuestion) : undefined,
        choices: q.choices && q.choices.length > 0 ? q.choices.map((choice) => format(choice || "")) : undefined,
      })),
    })),
  };
}

function loadPreviewState(): PreviewState {
  if (typeof window === "undefined") return { paper: null, lastConfig: null };
  const urlParams = new URLSearchParams(window.location.search);
  const initialMode = urlParams.get("mode") === "solutions" ? "solutions" : undefined;

  let paper: GeneratedPaper | null = null;
  try {
    const savedPaper = sessionStorage.getItem("generated_paper");
    const parsed = savedPaper ? JSON.parse(savedPaper) : null;
    if (parsed && parsed.sections) {
      const codeSafe = isComputerSubjectKey(parsed.subject);
      const base: RawPaper = {
        ...parsed,
        schoolName: parsed.schoolName ? parsed.schoolName.toUpperCase() : undefined,
        examName: parsed.examName ? parsed.examName.replace(/_/g, " ").toUpperCase() : "EXAMINATION",
        teacherName: parsed.teacherName ? parsed.teacherName : undefined,
        subject: parsed.subject || "",
        classText: parsed.classText || "",
        timeText: parsed.timeText || "",
        maxMarksText: parsed.maxMarksText || "",
      };
      paper = formatPaperForDisplay(base, codeSafe);
      if (Array.isArray(parsed.sets)) {
        paper.sets = parsed.sets.map((setObj: RawPaper) => formatPaperForDisplay(setObj, codeSafe));
      }
    } else if (parsed) {
      paper = parsed;
    }
  } catch (e) {
    console.error("Failed to parse generated paper", e);
  }

  let lastConfig: PaperConfig | null = null;
  try {
    const savedConfig = sessionStorage.getItem("last_paper_config");
    const parsedConfig = savedConfig ? JSON.parse(savedConfig) : null;
    lastConfig = isRegenerableConfig(parsedConfig) ? parsedConfig : null;
  } catch (e) {
    console.error("Failed to parse last config", e);
  }

  return { paper, lastConfig, initialMode };
}

export default function PreviewPage() {
  const router = useRouter();
  // Lazily read from sessionStorage. Content is rendered only after ProtectedRoute's client-side
  // auth check, so this does not cause a hydration mismatch.
  const [initialState] = useState(loadPreviewState);
  const [paper, setPaper] = useState<GeneratedPaper | null>(initialState.paper);
  const [activeSetIdx, setActiveSetIdx] = useState<number>(0);
  const lastConfig = initialState.lastConfig;
  const initialMode = initialState.initialMode;
  const { generatePaper, loading } = useGeneratePaper();

  const handlePaperChange = (updatedPaper: GeneratedPaper) => {
    setPaper(updatedPaper);
    sessionStorage.setItem("generated_paper", JSON.stringify(updatedPaper));
  };

  const handleRegenerate = lastConfig ? () => generatePaper(lastConfig) : undefined;

  if (loading) {
    return <GeneratingOverlay />;
  }

  const activePaperDisplay = (paper && paper.sets && paper.sets.length > 0 && paper.sets[activeSetIdx]) 
    ? paper.sets[activeSetIdx] 
    : paper;

  return (
    <>
      <AnimatedBackground />
      <Navbar />
      
      <main className="flex-grow pt-28 pb-32">
        <ProtectedRoute>
          {paper ? (
            <div className="container mx-auto px-4 max-w-7xl text-center space-y-8">
              <div className="no-print space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {paper.sets && paper.sets.length > 1
                      ? `Multi-Set Generation Complete (${paper.sets.length} Sets Created)`
                      : "AI Generation Complete"}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading tracking-tight">
                  Preview Question Paper
                </h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Review the questions below. Click on any text to edit details inline before downloading.
                </p>
              </div>

              {/* Render paper sheet */}
              <div className="relative pt-6">
                <PaperPreview 
                  paper={paper} 
                  onChange={handlePaperChange} 
                  activeSetIdx={activeSetIdx}
                  onSelectSet={(idx) => setActiveSetIdx(idx)}
                  initialViewMode={initialMode}
                />
              </div>

              {/* Sticky download actions bar */}
              <DownloadBar 
                paper={activePaperDisplay || paper} 
                onRegenerate={handleRegenerate} 
              />
            </div>
          ) : (
            <div className="container mx-auto px-4 max-w-md text-center py-20 space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <AlertCircle className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-heading">No Paper Generated</h3>
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t generated any CBSE question papers yet in this session. Go to the wizard setup to create one.
                </p>
              </div>

              <Button onClick={() => router.push("/generate")} className="rounded-full bg-indigo-500 text-white shadow-md w-full py-5 cursor-pointer border-none hover:scale-[1.02]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Generator
              </Button>
            </div>
          )}
        </ProtectedRoute>
      </main>

      <Footer />
    </>
  );
}
