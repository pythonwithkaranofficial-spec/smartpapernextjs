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
import { AuthService } from "@/lib/firebase/auth-service";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { clientRateLimiter } from "@/lib/rate-limiter";
import { isSuperAdminEmail } from "@/lib/auth/helpers";
import { toast } from "sonner";
import { GeneratingOverlay } from "../preview/GeneratingOverlay";
import { DailyLimitModal } from "../auth/DailyLimitModal";

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

  const [usageInfo, setUsageInfo] = useState<{ usedToday: number; dailyLimit: number; remainingToday: number; isAdmin?: boolean } | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Load usage details from API or local fallback
  useEffect(() => {
    async function checkUsage() {
      const user = AuthService.getCurrentUser();
      const userEmail = user?.email || null;
      const isSuperAdmin = isSuperAdminEmail(userEmail);

      if (isSuperAdmin) {
        setUsageInfo({
          usedToday: 0,
          dailyLimit: 999999,
          remainingToday: 999999,
          isAdmin: true,
        });
        return;
      }

      try {
        const token = await AuthService.getFirebaseToken();
        if (token) {
          const res = await fetch("/api/user/usage", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const json = await res.json();
          if (json.success && json.data) {
            setUsageInfo(json.data);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to fetch user usage:", e);
      }

      const remaining = clientRateLimiter.getRemainingCount(userEmail, false);
      setUsageInfo({
        usedToday: Math.max(0, 5 - remaining),
        dailyLimit: 5,
        remainingToday: remaining,
        isAdmin: false,
      });
    }

    checkUsage();
  }, []);


  // Load from localStorage on mount (Auto-save)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setConfig(parsed);
        } catch (e) {
          console.error("Failed to parse saved config", e);
        }
      }
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
    if (usageInfo && !usageInfo.isAdmin && usageInfo.remainingToday <= 0) {
      setShowLimitModal(true);
      return;
    }
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

  const remaining = usageInfo?.remainingToday ?? 5;
  const limit = usageInfo?.dailyLimit ?? 5;
  const used = usageInfo?.usedToday ?? 0;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {loading && <GeneratingOverlay />}
      <DailyLimitModal
        open={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        usedToday={used}
        dailyLimit={limit}
      />

      {/* Steps indicator bar */}
      <ProgressBar currentStep={step} totalSteps={7} />

      {/* Limits indicator (no-print) */}
      <div className="flex justify-between items-center text-xs text-muted-foreground mb-6 font-heading font-medium">
        <span>DAILY GENERATIONS LIMIT</span>
        <span className={remaining <= 0 ? "text-rose-500 font-bold" : "text-blue-400"}>
          {remaining} OF {limit} REMAINING
        </span>
      </div>

      {/* Wizard Steps Container */}
      <div className="relative min-h-[460px] flex flex-col justify-between overflow-hidden p-1">
        <AnimatePresence custom={direction} mode="wait">
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
                selectedClass={config.classId}
                onSelectClass={(classId) => {
                  updateConfig((prev) => ({ ...prev, classId }));
                  handleNext(classId, undefined, undefined);
                }}
              />
            )}
            {step === 2 && (
              <StepSubjectSelect
                classId={config.classId}
                selectedSubject={config.subject}
                onSelectSubject={(subject) => {
                  updateConfig((prev) => ({ ...prev, subject }));
                  handleNext(undefined, subject, undefined);
                }}
              />
            )}
            {step === 3 && (
              <StepChaptersSelect
                classId={config.classId}
                subject={config.subject}
                selectedChapters={config.selectedChapters || []}
                onChaptersChange={(selectedChapters) =>
                  updateConfig((prev) => ({ ...prev, selectedChapters }))
                }
              />
            )}
            {step === 4 && (
              <StepExamType
                selectedExamType={config.examType}
                onSelectExamType={(examType) => {
                  updateConfig((prev) => ({ ...prev, examType }));
                  handleNext(undefined, undefined, examType);
                }}
              />
            )}
            {step === 5 && (
              <StepConfiguration
                difficulty={config.difficulty}
                language={config.language}
                totalMarks={config.totalMarks}
                duration={config.duration}
                isHindiSubject={
                  config.subject === "hindi" ||
                  config.subject === "hindi_core" ||
                  config.subject === "hindi_elective"
                }
                onChangeDifficulty={(difficulty) =>
                  updateConfig((prev) => ({ ...prev, difficulty }))
                }
                onChangeLanguage={(language) =>
                  updateConfig((prev) => ({ ...prev, language }))
                }
                onChangeTotalMarks={(totalMarks) =>
                  updateConfig((prev) => ({ ...prev, totalMarks }))
                }
                onChangeDuration={(duration) =>
                  updateConfig((prev) => ({ ...prev, duration }))
                }
              />
            )}
            {step === 6 && (
              <StepQuestionDist
                totalMarks={config.totalMarks}
                distribution={config.questionDistribution}
                onChangeDistribution={(questionDistribution) =>
                  updateConfig((prev) => ({ ...prev, questionDistribution }))
                }
              />
            )}
            {step === 7 && (
              <StepPaperOptions
                options={config.options}
                onChangeOptions={(options) =>
                  updateConfig((prev) => ({ ...prev, options }))
                }
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Action Controls */}
        <div className="flex justify-between items-center pt-8 border-t border-border/40 mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || loading}
            className="rounded-full px-6 py-5 border-border/60 hover:bg-muted/40 font-heading font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < 7 ? (
            <Button
              onClick={() => handleNext()}
              disabled={loading}
              className="rounded-full px-8 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.45)] hover:scale-[1.02] transition-all font-heading font-medium border-none"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-full px-9 py-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-[0_6px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.6)] hover:scale-[1.03] transition-all font-heading font-bold text-base border-none animate-pulse-glow"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Paper AI
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
