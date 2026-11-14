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
import { AuthService } from "@/lib/firebase/auth-service";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { clientRateLimiter } from "@/lib/rate-limiter";
import { isSuperAdminEmail } from "@/lib/auth/super-admin";
import { toast } from "sonner";
import { GeneratingOverlay } from "../preview/GeneratingOverlay";
import { DailyLimitModal } from "../auth/DailyLimitModal";
import { SyllabusModal } from "../syllabus/SyllabusModal";
import { getOrGenerateBlueprint } from "@/lib/blueprints";
import { computeDistributionTotal } from "@/lib/marks";
import { detectFullExamKind } from "@/lib/subject-detection";

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
    includeAnswerKey: false,
  },
  selectedChapters: [],
};

interface CustomTextInputs {
  classText: string;
  subjectText: string;
  chaptersText: string;
}

function readStoredJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (e) {
    console.error(`Failed to parse saved ${key}`, e);
    return null;
  }
}

export function CustomGeneratorWizard() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  // Lazily restored from localStorage. The wizard only mounts on the client (behind
  // ProtectedRoute's auth check), so this does not cause a hydration mismatch.
  const [config, setConfig] = useState<PaperConfig>(
    () => readStoredJson<PaperConfig>(CUSTOM_LOCAL_STORAGE_KEY) || initialConfig
  );

  // Custom free-text states stored locally
  const [savedInputs] = useState(() => readStoredJson<Partial<CustomTextInputs>>(TEXT_INPUTS_STORAGE_KEY));
  const [classText, setClassText] = useState(savedInputs?.classText || "");
  const [subjectText, setSubjectText] = useState(savedInputs?.subjectText || "");
  const [chaptersText, setChaptersText] = useState(savedInputs?.chaptersText || "");
  
  const { generatePaper, loading: generating } = useGeneratePaper();
  const [usageInfo, setUsageInfo] = useState<{ usedToday: number; dailyLimit: number; remainingToday: number; isAdmin?: boolean } | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);

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

  // Save to localStorage on change
  const updateConfig = (updater: (prev: PaperConfig) => PaperConfig) => {
    setConfig((prev) => {
      const updated = updater(prev);
      localStorage.setItem(CUSTOM_LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const saveTextInputs = (cls: string, sbj: string, chps: string) => {
    localStorage.setItem(
      TEXT_INPUTS_STORAGE_KEY,
      JSON.stringify({ classText: cls, subjectText: sbj, chaptersText: chps })
    );
  };

  const buildFinalConfig = (): PaperConfig => ({
    ...config,
    isCustom: true,
    classId: "custom",
    subject: subjectText.trim(),
    customClass: classText.trim(),
    customSubject: subjectText.trim(),
    customChapters: chaptersText.trim(),
  });

  /** Distribution (with blueprint marks overrides) must match the target unless a full-exam prompt applies. */
  const validateMarksSum = (finalConfig: PaperConfig): boolean => {
    if (detectFullExamKind(finalConfig)) return true;
    const currentMarks = computeDistributionTotal(finalConfig.questionDistribution, finalConfig.marksPerType);
    if (currentMarks !== finalConfig.totalMarks) {
      toast.error(`Marks mismatch! Your allocated questions total ${currentMarks} Marks, but your target is ${finalConfig.totalMarks} Marks. Adjust counts before continuing.`);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    // Validation gating per step
    if (step === 1 && !classText.trim()) {
      toast.error("Please enter a target class to proceed.");
      return;
    }
    if (step === 2 && !subjectText.trim()) {
      toast.error("Please enter a subject name to proceed.");
      return;
    }
    if (step === 3 && !chaptersText.trim()) {
      toast.error("Please enter syllabus / chapter names to proceed.");
      return;
    }
    if (step === 4 && !config.examType) {
      toast.error("Please choose an assessment format to proceed.");
      return;
    }
    if (step === 6 && !validateMarksSum(buildFinalConfig())) {
      return;
    }

    if (step < 7) {
      setDirection(1);
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step === 7 && config.isBlueprintMode) {
      setDirection(-1);
      setStep(4);
      return;
    }
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

    // Construct final custom paper configuration
    const finalCustomConfig = buildFinalConfig();

    // Blueprint presets and progress-bar jumps can bypass step 6, so always re-check here.
    if (!validateMarksSum(finalCustomConfig)) {
      setDirection(-1);
      setStep(6);
      return;
    }

    generatePaper(finalCustomConfig);
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

  const handleStepClick = (targetStep: number) => {
    if (targetStep === step || generating) return;
    setDirection(targetStep > step ? 1 : -1);
    setStep(targetStep);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {generating && <GeneratingOverlay />}
      <DailyLimitModal
        open={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        usedToday={used}
        dailyLimit={limit}
      />
      <SyllabusModal
        open={showSyllabusModal}
        onClose={() => setShowSyllabusModal(false)}
        classId={classText.replace(/\D/g, "") || "10"}
        subject={subjectText || "maths"}
        onSelectSyllabus={(cId, sub) => {
          setClassText(`Class ${cId}`);
          setSubjectText(sub);
        }}
        onSelectBlueprint={(blueprintConfig) => {
          updateConfig(() => blueprintConfig);
          setClassText(`Class ${blueprintConfig.classId}`);
          setSubjectText(blueprintConfig.subject);
          setStep(7);
          setShowSyllabusModal(false);
          toast.success(
            `Loaded official CBSE blueprint preset: ${(blueprintConfig.subject || "").toUpperCase()} (${blueprintConfig.totalMarks} Marks)`
          );
        }}
      />

      {/* Header Bar with Syllabus Explorer Trigger & Limits */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground mb-6 font-heading font-medium">
        <button
          type="button"
          onClick={() => setShowSyllabusModal(true)}
          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold font-heading bg-indigo-500/10 hover:bg-indigo-500/20 px-3.5 py-1.5 rounded-full border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.15)] transition-all hover:scale-105"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>📖 View Subject Syllabus & Blueprint</span>
        </button>

        <div className="flex items-center gap-2">
          <span>DAILY LIMIT:</span>
          <span className={remaining <= 0 ? "text-rose-500 font-bold" : "text-blue-400 font-bold"}>
            {remaining} OF {limit} REMAINING
          </span>
        </div>
      </div>

      {/* Steps indicator bar */}
      <CustomProgressBar currentStep={step} totalSteps={7} onStepClick={handleStepClick} />

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
                selectedExamType={config.examType}
                onSelectExamType={(examType) => {
                  const cleanClass = classText.replace(/\D/g, "") || classText || "10";
                  const bp = getOrGenerateBlueprint(cleanClass, subjectText, examType);
                  if (bp) {
                    updateConfig((prev) => ({
                      ...prev,
                      examType,
                      totalMarks: bp.totalMarks,
                      duration: bp.duration,
                      questionDistribution: bp.questionDistribution,
                      selectedChapters: bp.selectedChapters,
                      unitWeightage: bp.unitWeightage,
                      marksPerType: bp.marksPerType,
                      blueprintId: bp.id,
                      isBlueprintMode: true,
                      options: {
                        ...prev.options,
                        instructionsText: bp.defaultInstructions,
                      },
                    }));
                    toast.success(`Blueprint applied: ${bp.title}`);
                    setDirection(1);
                    setStep(7);
                  } else {
                    // No blueprint: drop every setting a previous blueprint applied.
                    updateConfig((prev) => {
                      const hadBlueprint = prev.isBlueprintMode || !!prev.blueprintId;
                      return {
                        ...prev,
                        examType,
                        isBlueprintMode: false,
                        blueprintId: undefined,
                        unitWeightage: undefined,
                        marksPerType: undefined,
                        ...(hadBlueprint
                          ? {
                              totalMarks: initialConfig.totalMarks,
                              duration: initialConfig.duration,
                              questionDistribution: { ...initialConfig.questionDistribution },
                              selectedChapters: [],
                              options: {
                                ...prev.options,
                                instructionsText: initialConfig.options.instructionsText,
                              },
                            }
                          : {}),
                      };
                    });
                    setDirection(1);
                    setStep(5);
                  }
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
                  subjectText.toLowerCase().includes("hindi") ||
                  subjectText.includes("हिन्दी")
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
                marksPerType={config.marksPerType}
                onChangeDistribution={(questionDistribution) =>
                  updateConfig((prev) => ({ ...prev, questionDistribution }))
                }
              />
            )}
            {step === 7 && (
              <StepPaperOptions
                options={config.options}
                isBlueprintMode={config.isBlueprintMode}
                unitWeightage={config.unitWeightage}
                blueprintTitle={
                  getOrGenerateBlueprint(classText.replace(/\D/g, "") || classText || "10", subjectText, config.examType)?.title ||
                  "Official Exam Blueprint Applied"
                }
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
            disabled={step === 1 || generating}
            className="rounded-full px-6 py-5 border-border/60 hover:bg-muted/40 font-heading font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < 7 ? (
            <Button
              onClick={handleNext}
              disabled={generating}
              className="rounded-full px-8 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.45)] hover:scale-[1.02] transition-all font-heading font-medium border-none"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="rounded-full px-9 py-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-[0_6px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.6)] hover:scale-[1.03] transition-all font-heading font-bold text-base border-none animate-pulse-glow"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Custom Paper AI
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
