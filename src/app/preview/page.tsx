"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { PaperPreview } from "@/components/preview/PaperPreview";
import { DownloadBar } from "@/components/preview/DownloadBar";
import { Footer } from "@/components/landing/Footer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { GeneratedPaper, PaperConfig } from "@/types";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useGeneratePaper } from "@/hooks/useGeneratePaper";
import { GeneratingOverlay } from "@/components/preview/GeneratingOverlay";
import { formatScientificText } from "@/lib/utils";

export default function PreviewPage() {
  const router = useRouter();
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [lastConfig, setLastConfig] = useState<PaperConfig | null>(null);
  const { generatePaper, loading } = useGeneratePaper();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPaper = sessionStorage.getItem("generated_paper");
      const savedConfig = sessionStorage.getItem("last_paper_config");

      if (savedPaper) {
        try {
          const parsed = JSON.parse(savedPaper);
          if (parsed && parsed.sections) {
            // Apply scientific symbol formatting to questions, choices, and instructions
            parsed.schoolName = parsed.schoolName ? parsed.schoolName.toUpperCase() : undefined;
            parsed.examName = parsed.examName ? parsed.examName.replace(/_/g, " ").toUpperCase() : "EXAMINATION";
            parsed.teacherName = parsed.teacherName ? parsed.teacherName : undefined;
            parsed.subject = parsed.subject || "";
            parsed.classText = parsed.classText || "";
            parsed.timeText = parsed.timeText || "";
            parsed.maxMarksText = parsed.maxMarksText || "";
            
            parsed.instructions = (parsed.instructions || []).map((ins: string) => formatScientificText(ins));
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parsed.sections = parsed.sections.map((section: any) => ({
              ...section,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions: (section.questions || []).map((q: any) => ({
                ...q,
                text: formatScientificText(q.text || ""),
                orQuestion: q.orQuestion ? formatScientificText(q.orQuestion) : null,
                choices: (q.choices && q.choices.length > 0)
                  ? q.choices.map((choice: string) => formatScientificText(choice || ""))
                  : null,
              }))
            }));
            
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPaper(parsed);
          } else {
            setPaper(parsed);
          }
        } catch (e) {
          console.error("Failed to parse generated paper", e);
        }
      }

      if (savedConfig) {
        try {
          setLastConfig(JSON.parse(savedConfig));
        } catch (e) {
          console.error("Failed to parse last config", e);
        }
      }
    }
  }, []);

  const handlePaperChange = (updatedPaper: GeneratedPaper) => {
    setPaper(updatedPaper);
    sessionStorage.setItem("generated_paper", JSON.stringify(updatedPaper));
  };

  const handleRegenerate = () => {
    if (lastConfig) {
      generatePaper(lastConfig);
    }
  };

  if (loading) {
    return <GeneratingOverlay />;
  }

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
                  <span>AI Generation Complete</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading tracking-tight">
                  Preview Question Paper
                </h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Review the questions below. Click on any text (school name, instruction, question body) to edit details inline before downloading.
                </p>
              </div>

              {/* Render paper sheet */}
              <div className="relative pt-6">
                <PaperPreview paper={paper} onChange={handlePaperChange} />
              </div>

              {/* Sticky download actions bar */}
              <DownloadBar paper={paper} onRegenerate={handleRegenerate} />
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
