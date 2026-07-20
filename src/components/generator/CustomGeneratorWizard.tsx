"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomProgressBar } from "./CustomProgressBar";
import { 
  StepCustomClass, 
  StepCustomSubject, 
  StepCustomChapters 
} from "./StepCustomInputs";
import { StepExamType } from "./StepExamType";
import { StepConfiguration } from "./StepConfiguration";
import { StepQuestionDist } from "./StepQuestionDist";
import { StepPaperOptions } from "./StepPaperOptions";
import { PaperConfig } from "@/types";
import { useGeneratePaper } from "@/hooks/useGeneratePaper";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { clientRateLimiter } from "@/lib/rate-limiter";
import { toast } from "sonner";
import { GeneratingOverlay } from "../preview/GeneratingOverlay";

// Separate storage key for custom wizard configurations
const CUSTOM_LOCAL_STORAGE_KEY = "smart_paper_custom_form_config";
const TEXT_INPUTS_STORAGE_KEY = "smart_paper_custom_text_inputs";

const initialConfig: PaperConfig = {
  classId: "",
  subject: "",
  examType: "",
  difficulty: "Medium",
  language: "English",
  totalMarks: 40,
  duration: "1.5 Hours",
  questionDistribution: {
    mcq: 0,
    assertionReason: 0,
    vsa: 0,
    sa: 0,
    caseStudy: 0,
    la: 0,
  },
  options: {
    includeSchoolName: false,
    schoolName: "",
    includeTeacherName: false,
    teacherName: "",
    includeSchoolLogo: false,
    includeClass: true,
    includeSubject: true,
    includeTime: true,
    includeMaxMarks: true,
    includeInstructions: true,
    instructionsText: "1. All questions are compulsory.\n2. The question paper consists of standard sections.\n3. Section A contains 1 mark questions, Section B contains 2 marks questions.\n4. Write answers clearly and support with diagrams where needed.",
    includeInternalChoice: false,
  },
  selectedChapters: [],
};

export function CustomGeneratorWizard() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [config, setConfig] = useState<PaperConfig>(initialConfig);
  
  // Custom free-text states
  const [classText, setClassText] = useState("");
  const [subjectText, setSubjectText] = useState("");
  const [chaptersText, setChaptersText] = useState("");
  
  const [normalizing, setNormalizing] = useState(false);
  const { generatePaper, loading: generating } = useGeneratePaper();
  const [remainingCount, setRemainingCount] = useState(5);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedConfig = localStorage.getItem(CUSTOM_LOCAL_STORAGE_KEY);
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
        } catch (e) {
          console.error("Failed to parse saved config", e);
        }
      }
      
      const savedTexts = localStorage.getItem(TEXT_INPUTS_STORAGE_KEY);
      if (savedTexts) {
        try {
          const parsed = JSON.parse(savedTexts);
          setClassText(parsed.classText || "");
          setSubjectText(parsed.subjectText || "");
          setChaptersText(parsed.chaptersText || "");
        } catch (e) {
          console.error("Failed to parse saved texts", e);
        }
      }
      setRemainingCount(clientRateLimiter.getRemainingCount());
    }
  }, []);

  // Save changes to localStorage
  const updateConfig = (updater: (prev: PaperConfig) => PaperConfig) => {
    setConfig((prev) => {
      const updated = updater(prev);
      localStorage.setItem(CUSTOM_LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const saveTextInputs = (cls: string, sub: string, ch: string) => {
    localStorage.setItem(
      TEXT_INPUTS_STORAGE_KEY,
      JSON.stringify({ classText: cls, subjectText: sub, chaptersText: ch })
    );
  };

  const handleNext = async (
    classIdOverride?: string,
    subjectOverride?: string,
    examTypeOverride?: string
  ) => {
    const examType = examTypeOverride !== undefined ? examTypeOverride : config.examType;
    // Validation gating per step
    if (step === 1) {
      if (!classText.trim()) {
        toast.error("Please enter a target class/grade standard.");
        return;
      }
      saveTextInputs(classText, subjectText, chaptersText);
      setDirection(1);
      setStep(2);
      return;
    }
    
    if (step === 2) {
      if (!subjectText.trim()) {
        toast.error("Please enter a subject name.");
        return;
      }
      saveTextInputs(classText, subjectText, chaptersText);
      setDirection(1);
      setStep(3);
      return;
    }

    if (step === 3) {
      if (!chaptersText.trim()) {
        toast.error("Please enter chapter names or syllabus details.");
        return;
      }
      saveTextInputs(classText, subjectText, chaptersText);
      
      // Call Gemini API to normalize inputs
      setNormalizing(true);
      const toastId = toast.loading("Analyzing and normalizing syllabus using Gemini AI...");
      try {
        const response = await fetch("/api/normalize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ classText, subjectText, chaptersText }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to normalize inputs");
        }

        // Apply normalized config
        updateConfig((prev) => ({
          ...prev,
          classId: data.classId,
          subject: data.subject,
          selectedChapters: data.selectedChapters,
        }));

        toast.success(`Syllabus recognized successfully! Normalized to Class ${data.classId} ${data.subject.toUpperCase()}`, { id: toastId });
        
        setDirection(1);
        setStep(4);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to recognize chapters. Please check spelling.", { id: toastId });
      } finally {
        setNormalizing(false);
      }
      return;
    }

    if (step === 4 && !examType) {
      toast.error("Please choose an exam format to proceed.");
      return;
    }

    if (step === 6) {
      // Validate marks match
      const dist = config.questionDistribution;
      const currentMarks = 
        (dist.mcq * 1) + 
        (dist.assertionReason * 1) + 
        (dist.vsa * 2) + 
        (dist.sa * 3) + 
        (dist.caseStudy * 4) + 
        (dist.la * 5);
      
      if (currentMarks !== config.totalMarks) {
        toast.error(`Marks mismatch! Your allocated questions total ${currentMarks} Marks, but your target is ${config.totalMarks} Marks. Adjust counts before continuing.`);
        return;
      }
    }

    if (step < 7) {
      setDirection(1);
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((prev) => prev - 1);
    }
  };

  const handleGenerate = () => {
    generatePaper(config);
  };

  // Slide animations
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 350, damping: 30 },
        opacity: { duration: 0.3 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      transition: {
        x: { type: "spring" as const, stiffness: 350, damping: 30 },
        opacity: { duration: 0.3 },
      },
    }),
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {generating && <GeneratingOverlay />}
      
      {/* Normalization overlay spinner */}
      {normalizing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <span className="text-sm font-semibold font-heading text-foreground/80">
            Intelligently recognizing syllabus details with Gemini AI...
          </span>
        </div>
      )}

      {/* Steps indicator bar */}
      <CustomProgressBar currentStep={step} />

      {/* Limits indicator */}
      <div className="flex justify-between items-center text-xs text-muted-foreground mb-6 font-heading font-medium">
        <span>DAILY GENERATIONS LIMIT</span>
        <span>{remainingCount} OF 5 REMAINING</span>
      </div>

      {/* Steps Form Content */}
      <div className="min-h-[400px] mb-8 relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full"
          >
            {step === 1 && (
              <StepCustomClass
                value={classText}
                onChange={(val) => {
                  setClassText(val);
                  saveTextInputs(val, subjectText, chaptersText);
                }}
              />
            )}

            {step === 2 && (
              <StepCustomSubject
                value={subjectText}
                onChange={(val) => {
                  setSubjectText(val);
                  saveTextInputs(classText, val, chaptersText);
                }}
              />
            )}

            {step === 3 && (
              <StepCustomChapters
                value={chaptersText}
                onChange={(val) => {
                  setChaptersText(val);
                  saveTextInputs(classText, subjectText, val);
                }}
              />
            )}

            {step === 4 && (
              <StepExamType
                value={config.examType}
                onChange={(val, defaultMarks, defaultDuration) => 
                  updateConfig((prev) => ({ 
                    ...prev, 
                    examType: val, 
                    totalMarks: defaultMarks, 
                    duration: defaultDuration 
                  }))
                }
                onNext={handleNext}
              />
            )}

            {step === 5 && (
              <StepConfiguration
                difficulty={config.difficulty}
                setDifficulty={(val) => updateConfig((prev) => ({ ...prev, difficulty: val }))}
                language={config.language}
                setLanguage={(val) => updateConfig((prev) => ({ ...prev, language: val }))}
                totalMarks={config.totalMarks}
                setTotalMarks={(val) => updateConfig((prev) => ({ ...prev, totalMarks: val }))}
                duration={config.duration}
                setDuration={(val) => updateConfig((prev) => ({ ...prev, duration: val }))}
                subject={config.subject}
              />
            )}

            {step === 6 && (
              <StepQuestionDist
                value={config.questionDistribution}
                onChange={(val) => updateConfig((prev) => ({ ...prev, questionDistribution: val }))}
                targetMarks={config.totalMarks}
                examType={config.examType}
              />
            )}

            {step === 7 && (
              <StepPaperOptions
                value={config.options}
                onChange={(val) => updateConfig((prev) => ({ ...prev, options: val }))}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation action bar */}
      <div className="flex justify-between items-center mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
          className="rounded-full px-6 py-5 border-border/60 hover:bg-muted/40 hover:text-foreground text-muted-foreground transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {step < 7 ? (
          <Button
            type="button"
            onClick={() => handleNext()}
            className="rounded-full px-6 py-5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/10 cursor-pointer border-none hover:scale-[1.02] active:scale-95 transition-all duration-300"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={remainingCount === 0}
            className="rounded-full px-8 py-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-indigo-500/15 border-none hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
            Generate Paper
          </Button>
        )}
      </div>
    </div>
  );
}
