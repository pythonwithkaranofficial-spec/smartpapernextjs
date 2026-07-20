"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressBar } from "./ProgressBar";
import { StepClassSelect } from "./StepClassSelect";
import { StepSubjectSelect } from "./StepSubjectSelect";
import { StepExamType } from "./StepExamType";
import { StepConfiguration } from "./StepConfiguration";
import { StepQuestionDist } from "./StepQuestionDist";
import { StepPaperOptions } from "./StepPaperOptions";
import { StepChaptersSelect } from "./StepChaptersSelect";
import { PaperConfig } from "@/types";
import { useGeneratePaper } from "@/hooks/useGeneratePaper";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { clientRateLimiter } from "@/lib/rate-limiter";
import { toast } from "sonner";
import { GeneratingOverlay } from "../preview/GeneratingOverlay";

const LOCAL_STORAGE_KEY = "smart_paper_form_config";

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

export function GeneratorWizard() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [config, setConfig] = useState<PaperConfig>(initialConfig);
  const { generatePaper, loading } = useGeneratePaper();
  const [remainingCount, setRemainingCount] = useState(5);

  // Load from localStorage on mount (Auto-save)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setConfig(parsed);
        } catch (e) {
          console.error("Failed to parse saved config", e);
        }
      }
      setRemainingCount(clientRateLimiter.getRemainingCount());
    }
  }, []);

  // Save to localStorage on change
  const updateConfig = (updater: (prev: PaperConfig) => PaperConfig) => {
    setConfig((prev) => {
      const updated = updater(prev);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleNext = (
    classIdOverride?: string,
    subjectOverride?: string,
    examTypeOverride?: string
  ) => {
    const classId = classIdOverride !== undefined ? classIdOverride : config.classId;
    const subject = subjectOverride !== undefined ? subjectOverride : config.subject;
    const examType = examTypeOverride !== undefined ? examTypeOverride : config.examType;

    // Validation gating per step
    if (step === 1 && !classId) {
      toast.error("Please select a target class to proceed.");
      return;
    }
    if (step === 2 && !subject) {
      toast.error("Please select a subject to proceed.");
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
      {loading && <GeneratingOverlay />}

      {/* Steps indicator bar */}
      <ProgressBar currentStep={step} totalSteps={7} />

      {/* Limits indicator (no-print) */}
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
              <StepClassSelect
                value={config.classId}
                onChange={(val) => updateConfig((prev) => ({ ...prev, classId: val, subject: "", selectedChapters: [] }))}
                onNext={handleNext}
              />
            )}

            {step === 2 && (
              <StepSubjectSelect
                classId={config.classId}
                value={config.subject}
                onChange={(val) => updateConfig((prev) => ({ ...prev, subject: val, selectedChapters: [] }))}
                onNext={handleNext}
              />
            )}

            {step === 3 && (
              <StepChaptersSelect
                classId={config.classId}
                subject={config.subject}
                selectedChapters={config.selectedChapters || []}
                onChange={(val) => updateConfig((prev) => ({ ...prev, selectedChapters: val }))}
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
