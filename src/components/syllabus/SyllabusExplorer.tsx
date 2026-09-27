"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  FileText,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Layers,
  Award,
  GraduationCap,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CURRICULUM_DATA } from "@/lib/curriculum-data";
import { BLUEPRINTS, getOrGenerateBlueprint } from "@/lib/blueprints";
import { PaperConfig } from "@/types";
import { toast } from "sonner";

const AVAILABLE_CLASSES = ["9", "10", "11", "12"];

const SUBJECT_NAMES: Record<string, string> = {
  maths: "Mathematics Standard (Code 041)",
  mathsbasic: "Mathematics Basic (Code 241)",
  science: "Science (Class 9-10)",
  physics: "Physics (Code 042)",
  chemistry: "Chemistry (Code 043)",
  biology: "Biology (Code 044)",
  social: "Social Science (Class 9-10)",
  english: "English",
  englishlanglit: "English Language & Literature (Code 184)",
  englishcommunicative: "English Communicative (Code 101)",
  englishcore: "English Core (Code 301)",
  englishelective: "English Elective (Code 001)",
  hindi: "Hindi",
  hindi_core: "Hindi Core (Code 302)",
  hindi_elective: "Hindi Elective (Code 002)",
  economics: "Economics (Code 030)",
  history: "History (Code 027)",
  polscience: "Political Science (Code 028)",
  geography: "Geography (Code 029)",
  it: "Information Technology (Code 402)",
  ai: "Artificial Intelligence (Code 417)",
  ip: "Informatics Practices (Code 065)",
  cs: "Computer Science (Code 083)",
  accounts: "Accountancy (Code 055)",
  business: "Business Studies (Code 054)",
  phyedu: "Physical Education (Code 048)",
  sanskrit: "Sanskrit (Code 122)",
  computer_applications: "Computer Applications (Code 165)",
  applied_maths: "Applied Mathematics (Code 241)",
  psychology: "Psychology (Code 037)",
  sociology: "Sociology (Code 039)",
  entrepreneurship: "Entrepreneurship (Code 066)",
  sanskrit_core: "Sanskrit Core (Code 322)",
};

interface SyllabusExplorerProps {
  initialClassId?: string;
  initialSubject?: string;
  onSelectSyllabus?: (classId: string, subject: string) => void;
  onSelectBlueprint?: (config: PaperConfig) => void;
  compact?: boolean;
}

export function SyllabusExplorer({
  initialClassId = "10",
  initialSubject = "maths",
  onSelectSyllabus,
  onSelectBlueprint,
  compact = false,
}: SyllabusExplorerProps) {
  const [selectedClass, setSelectedClass] = useState<string>(initialClassId);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [activeTab, setActiveTab] = useState<"syllabus" | "blueprint">("syllabus");
  const [searchQuery, setSearchQuery] = useState("");

  // Get available subjects for selected class with deduplication of aliases
  const classCurriculum = CURRICULUM_DATA[selectedClass] || {};
  const rawSubjects = Object.keys(classCurriculum);
  const availableSubjects = rawSubjects.filter((subKey) => {
    if (subKey === "englishcore" && rawSubjects.includes("english")) return false;
    return true;
  });

  const getSubjectLabel = (subKey: string) => {
    if (subKey === "english" && (selectedClass === "12" || selectedClass === "11")) {
      return "English Core (Code 301)";
    }
    if (subKey === "hindi" && selectedClass === "10") {
      return "Hindi 'A' / हिन्दी 'अ' (Code 002)";
    }
    return SUBJECT_NAMES[subKey] || subKey.toUpperCase();
  };

  // If selected subject is not in current class subjects, fallback to first available
  const currentSubjectKey = availableSubjects.includes(selectedSubject)
    ? selectedSubject
    : availableSubjects[0] || "maths";

  const currentCurriculum = classCurriculum[currentSubjectKey];
  const blueprint = useMemo(
    () => getOrGenerateBlueprint(selectedClass, currentSubjectKey, "annual_exam"),
    [selectedClass, currentSubjectKey]
  );

  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGenerateWithBlueprint = (activeBlueprint: any) => {
    const active =
      activeBlueprint ||
      blueprint ||
      getOrGenerateBlueprint(selectedClass, currentSubjectKey, "annual_exam");
    if (!active) return;

    const isHindi =
      currentSubjectKey.toLowerCase().includes("hindi") ||
      currentSubjectKey.includes("हिन्दी");

    // Gather all chapters for this subject to ensure full coverage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allChapters =
      currentCurriculum?.chapters && currentCurriculum.chapters.length > 0
        ? currentCurriculum.chapters.map((ch: any) =>
            typeof ch === "string" ? ch : ch.title
          )
        : active?.selectedChapters && active.selectedChapters.length > 0
        ? active.selectedChapters
        : ["all"];

    const prefilledConfig: PaperConfig = {
      classId: selectedClass,
      subject: currentSubjectKey,
      examType: "annual_exam",
      difficulty: "Medium",
      language: isHindi ? "Hindi" : "English",
      totalMarks: active.totalMarks || 80,
      duration: active.duration || "3 Hours",
      questionDistribution: active.questionDistribution,
      blueprintId: active.id,
      isBlueprintMode: true,
      unitWeightage: active.unitWeightage || [],
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
        instructionsText: active.defaultInstructions || "1. All questions are compulsory.",
        includeInternalChoice: false,
        includeAnswerKey: false,
        numberOfSets: 1,
      },
      selectedChapters: allChapters,
    };

    try {
      localStorage.setItem("smart_paper_form_config", JSON.stringify(prefilledConfig));
      sessionStorage.setItem("preset_step", "7");
    } catch (e) {
      console.error("Failed to store blueprint config in storage:", e);
    }

    if (onSelectBlueprint) {
      toast.success(
        `Loaded official CBSE blueprint: ${SUBJECT_NAMES[currentSubjectKey] || currentSubjectKey.toUpperCase()} (${prefilledConfig.totalMarks} Marks)`
      );
      onSelectBlueprint(prefilledConfig);
      return;
    }

    if (onSelectSyllabus) {
      toast.success(
        `Applied CBSE syllabus & blueprint: ${SUBJECT_NAMES[currentSubjectKey] || currentSubjectKey.toUpperCase()}`
      );
      onSelectSyllabus(selectedClass, currentSubjectKey);
      return;
    }

    toast.success(
      `Opening paper generator with official ${SUBJECT_NAMES[currentSubjectKey] || currentSubjectKey.toUpperCase()} blueprint...`
    );
    if (typeof window !== "undefined") {
      window.location.href = "/generate?preset=blueprint&step=7";
    } else {
      router.push("/generate?preset=blueprint&step=7");
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    setSelectedCategory("All");
  }, [selectedClass, currentSubjectKey]);

  // Extract categories (e.g. History, Geography, Political Science, Economics)
  const categories = useMemo(() => {
    if (!currentCurriculum?.chapters) return [];
    const cats = new Set<string>();
    currentCurriculum.chapters.forEach((ch) => {
      if (ch.includes(":")) {
        cats.add(ch.split(":")[0].trim());
      }
    });
    return Array.from(cats);
  }, [currentCurriculum]);

  // Filter chapters by category and search query
  const filteredChapters = useMemo(() => {
    if (!currentCurriculum?.chapters) return [];
    let list = currentCurriculum.chapters;
    if (selectedCategory !== "All") {
      list = list.filter((ch) => ch.startsWith(`${selectedCategory}:`));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((ch) => ch.toLowerCase().includes(q));
    }
    return list;
  }, [currentCurriculum, selectedCategory, searchQuery]);

  const getCategoryColor = (cat: string) => {
    if (cat.includes("History")) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25";
    if (cat.includes("Geography")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25";
    if (cat.includes("Political Science")) return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25";
    if (cat.includes("Economics")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25";
    if (cat.includes("Management of Sporting Events")) return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25";
    if (cat.includes("Children and Women")) return "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/25";
    if (cat.includes("Yoga as Preventive")) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25";
    if (cat.includes("CWSN") || cat.includes("Special Needs")) return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25";
    if (cat.includes("Sports and Nutrition") || cat.includes("Nutrition")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25";
    if (cat.includes("Test and Measurement")) return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25";
    if (cat.includes("Physiology and Injuries")) return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25";
    if (cat.includes("Biomechanics and Sports")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25";
    if (cat.includes("Psychology and Sports")) return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25";
    if (cat.includes("Training in Sports")) return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25";
    if (cat.includes("Physical Chemistry")) return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25";
    if (cat.includes("Inorganic Chemistry")) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25";
    if (cat.includes("Organic Chemistry")) return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25";
    if (cat.includes("Reproduction")) return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25";
    if (cat.includes("Genetics") || cat.includes("Evolution")) return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25";
    if (cat.includes("Biology and Human Welfare") || cat.includes("Human Welfare")) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25";
    if (cat.includes("Biotechnology")) return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25";
    if (cat.includes("Ecology") || cat.includes("Environment")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25";
    if (cat.includes("Unit I") || cat.includes("Electrostatics")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25";
    if (cat.includes("Unit II") || cat.includes("Current Electricity")) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25";
    if (cat.includes("Unit III") || cat.includes("Magnetic")) return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25";
    if (cat.includes("Unit IV") || cat.includes("Induction") || cat.includes("Alternating")) return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25";
    if (cat.includes("Unit V") || cat.includes("Electromagnetic Waves")) return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25";
    if (cat.includes("Unit VI") || cat.includes("Optics")) return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25";
    if (cat.includes("Unit VII") || cat.includes("Dual Nature")) return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25";
    if (cat.includes("Unit VIII") || cat.includes("Atoms") || cat.includes("Nuclei")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25";
    if (cat.includes("Unit IX") || cat.includes("Electronic Devices")) return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25";
    if (cat === "Physics" || cat.startsWith("Physics")) return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25";
    if (cat === "Chemistry" || cat.startsWith("Chemistry")) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25";
    if (cat === "Biology" || cat.startsWith("Biology")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25";
    if (cat.includes("Partnership")) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25";
    if (cat.includes("Companies")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25";
    if (cat.includes("Financial Statement")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25";
    if (cat.includes("Cash Flow")) return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25";
    return "bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
  };

  return (
    <div className={cn("w-full space-y-6", compact ? "p-2" : "max-w-6xl mx-auto px-4 py-6")}>
      {/* Header & Title */}
      {!compact && (
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>CBSE Official Syllabus & Blueprints 2026</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight">
            Class & Subject Syllabus Explorer
          </h2>
          <p className="text-sm text-muted-foreground">
            Inspect chapter weightages, official unit mark allocations, and question paper structures for all classes.
          </p>
        </div>
      )}

      {/* Class Selection Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-extrabold font-heading text-slate-700 dark:text-slate-200 mr-2 uppercase tracking-wider flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Class:
        </span>
        {AVAILABLE_CLASSES.map((c) => {
          const isSelected = selectedClass === c;
          return (
            <button
              key={c}
              onClick={() => setSelectedClass(c)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold font-heading transition-all duration-250 border cursor-pointer",
                isSelected
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-[0_4px_14px_rgba(59,130,246,0.35)] dark:shadow-[0_0_18px_rgba(59,130,246,0.5)]"
                  : "bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white shadow-2xs font-semibold"
              )}
            >
              Class {c}
            </button>
          );
        })}
      </div>

      {/* Subject Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-w-4xl mx-auto w-full">
        {availableSubjects.map((subKey) => {
          const isSelected = currentSubjectKey === subKey;
          const label = getSubjectLabel(subKey);
          return (
            <button
              key={subKey}
              type="button"
              onClick={() => setSelectedSubject(subKey)}
              className={cn(
                "w-full h-10 px-3.5 py-2 rounded-xl text-xs transition-all duration-200 border flex items-center gap-2.5 min-w-0 justify-start text-left cursor-pointer",
                isSelected
                  ? "bg-indigo-50 dark:bg-indigo-500/20 border-2 border-indigo-600 dark:border-indigo-400 text-indigo-950 dark:text-indigo-200 shadow-sm dark:shadow-[0_0_16px_rgba(99,102,241,0.3)] font-bold"
                  : "bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white shadow-2xs font-semibold"
              )}
            >
              <FileText className={cn(
                "w-3.5 h-3.5 shrink-0 transition-colors",
                isSelected ? "text-indigo-600 dark:text-indigo-400 opacity-100" : "text-slate-500 dark:text-slate-400 opacity-80"
              )} />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Subject Banner Card */}
      <GlassCard className="p-4 sm:p-5 border-indigo-200/80 dark:border-indigo-500/30 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 dark:from-blue-500/5 dark:via-indigo-500/5 dark:to-purple-500/5 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Class {selectedClass} • {getSubjectLabel(currentSubjectKey)}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-500/20 whitespace-nowrap shrink-0">
                CBSE 2026 Pattern
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-foreground leading-snug">
              {blueprint?.title || `Class ${selectedClass} ${getSubjectLabel(currentSubjectKey)} Official Curriculum`}
            </h3>
            {currentCurriculum?.notes && (
              <p className="text-xs text-slate-600 dark:text-muted-foreground mt-1 font-medium leading-relaxed">{currentCurriculum.notes}</p>
            )}
          </div>

          <div className="w-full lg:w-auto shrink-0 flex items-center">
            {onSelectSyllabus ? (
              <Button
                onClick={() => onSelectSyllabus(selectedClass, currentSubjectKey)}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-heading font-bold text-xs px-5 py-2.5 shadow-md hover:scale-[1.02] transition-all cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 mr-1.5 shrink-0" />
                Apply To Paper Generator
              </Button>
            ) : (
              <Link
                href={`/generate?classId=${selectedClass}&subject=${currentSubjectKey}`}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-heading font-bold text-xs px-5 py-2.5 shadow-md hover:scale-[1.02] transition-all whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 mr-1.5 shrink-0" />
                Generate Paper From Syllabus
                <ArrowRight className="w-4 h-4 ml-1.5 shrink-0" />
              </Link>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 dark:border-border/50 gap-6">
        <button
          onClick={() => setActiveTab("syllabus")}
          className={cn(
            "pb-3 text-xs sm:text-sm font-heading font-bold transition-all relative",
            activeTab === "syllabus"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-500"
              : "text-slate-600 hover:text-slate-900 dark:text-muted-foreground dark:hover:text-foreground"
          )}
        >
          📚 Syllabus Chapters ({currentCurriculum?.chapters.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("blueprint")}
          className={cn(
            "pb-3 text-xs sm:text-sm font-heading font-bold transition-all relative flex items-center gap-1.5",
            activeTab === "blueprint"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-500"
              : "text-slate-600 hover:text-slate-900 dark:text-muted-foreground dark:hover:text-foreground"
          )}
        >
          <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          🎯 Exam Blueprint & Marking Scheme ({blueprint?.totalMarks || 80} Marks)
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "syllabus" ? (
          <motion.div
            key="syllabus-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Category Filter Pills (if subject has books/units like Class 10 Social Science) */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("All")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0 cursor-pointer",
                    selectedCategory === "All"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.25)]"
                      : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted/70 hover:text-foreground"
                  )}
                >
                  All ({currentCurriculum?.chapters.length || 0})
                </button>
                {categories.map((cat) => {
                  const catCount = currentCurriculum?.chapters.filter((ch) => ch.startsWith(`${cat}:`)).length || 0;
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 shrink-0 cursor-pointer",
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.25)]"
                          : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted/70 hover:text-foreground"
                      )}
                    >
                      <span>{cat}</span>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                          isActive ? "bg-white/20 text-white" : "bg-indigo-500/20 text-indigo-400"
                        )}
                      >
                        {catCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search chapter or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-card dark:bg-background/60 rounded-xl text-xs border-slate-200 dark:border-border/60 text-foreground"
              />
            </div>

            {/* Chapters List */}
            {filteredChapters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredChapters.map((ch, idx) => (
                  <GlassCard
                    key={idx}
                    className="p-3.5 border-slate-200/80 dark:border-border/40 hover:border-indigo-500/40 transition-all flex items-start gap-3 bg-card/80 dark:bg-card/40 shadow-2xs"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-heading font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      {ch.includes(":") ? (
                        <>
                          <span
                            className={cn(
                              "inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold border mb-1",
                              getCategoryColor(ch.split(":")[0].trim())
                            )}
                          >
                            {ch.split(":")[0].trim()}
                          </span>
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-foreground leading-snug">
                            {ch.split(":").slice(1).join(":").trim()}
                          </h4>
                        </>
                      ) : (
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-foreground leading-snug">{ch}</h4>
                      )}
                      <span className="text-[10px] text-slate-500 dark:text-muted-foreground font-medium flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        In CBSE 2026 Official Syllabus
                      </span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-muted-foreground text-xs bg-background/40 rounded-2xl border border-border/40">
                No matching chapters found for &quot;{searchQuery}&quot;.
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="blueprint-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {blueprint ? (
              <div className="space-y-5">
                {/* 1-Click Action Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-600/20 dark:via-indigo-600/20 dark:to-purple-600/20 border border-indigo-200/80 dark:border-indigo-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 backdrop-blur-md shadow-xs overflow-hidden">
                  <div className="min-w-0 flex-1 space-y-1 text-left">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-extrabold uppercase font-heading text-indigo-700 dark:text-indigo-300 tracking-wider whitespace-nowrap">
                        Official CBSE Board Blueprint
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/30 uppercase whitespace-nowrap shrink-0">
                        Ready to Generate
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-foreground font-heading leading-snug">
                      Class {selectedClass} — {SUBJECT_NAMES[currentSubjectKey] || currentSubjectKey}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-muted-foreground font-medium leading-relaxed">
                      Includes official unit weightages ({blueprint.totalMarks} Marks, {blueprint.duration}) and board section breakdown.
                    </p>
                  </div>

                  <div className="w-full lg:w-auto shrink-0">
                    <Button
                      onClick={() => handleGenerateWithBlueprint(blueprint)}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold font-heading px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/25 hover:scale-[1.02] transition-all cursor-pointer whitespace-nowrap text-xs sm:text-sm flex items-center justify-center"
                    >
                      <Sparkles className="w-4 h-4 mr-2 text-yellow-300 animate-pulse shrink-0" />
                      Generate Paper With This Blueprint
                      <ArrowRight className="w-4 h-4 ml-2 shrink-0" />
                    </Button>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-card dark:bg-background/60 border border-slate-200/80 dark:border-border/50 text-center shadow-xs">
                    <span className="text-[10px] text-slate-500 dark:text-muted-foreground uppercase font-bold tracking-wider block mb-1">
                      Total Theory Marks
                    </span>
                    <span className="text-xl font-extrabold font-heading text-indigo-600 dark:text-indigo-400">
                      {blueprint.totalMarks} Marks
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-card dark:bg-background/60 border border-slate-200/80 dark:border-border/50 text-center shadow-xs">
                    <span className="text-[10px] text-slate-500 dark:text-muted-foreground uppercase font-bold tracking-wider block mb-1">
                      Exam Duration
                    </span>
                    <span className="text-xl font-extrabold font-heading text-purple-600 dark:text-purple-400">
                      {blueprint.duration}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-card dark:bg-background/60 border border-slate-200/80 dark:border-border/50 text-center shadow-xs">
                    <span className="text-[10px] text-slate-500 dark:text-muted-foreground uppercase font-bold tracking-wider block mb-1">
                      Target Board
                    </span>
                    <span className="text-xl font-extrabold font-heading text-cyan-600 dark:text-cyan-400">
                      {blueprint.board} 2026
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-card dark:bg-background/60 border border-slate-200/80 dark:border-border/50 text-center shadow-xs">
                    <span className="text-[10px] text-slate-500 dark:text-muted-foreground uppercase font-bold tracking-wider block mb-1">
                      Question Count
                    </span>
                    <span className="text-xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400">
                      {Object.values(blueprint.questionDistribution).reduce((a, b) => a + b, 0)} Qs
                    </span>
                  </div>
                </div>

                {/* Section Breakdown Table */}
                <GlassCard className="p-4 border-slate-200/80 dark:border-border/50 space-y-3 bg-card/80 dark:bg-card/40">
                  <h4 className="text-xs font-extrabold font-heading uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5 tracking-wide">
                    <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Official Question Paper Structure & Distribution
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    <div className="p-3 rounded-lg bg-background/90 dark:bg-background/80 border border-slate-200/80 dark:border-border/40 text-center shadow-2xs">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">MCQs (1M)</span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-foreground">
                        {blueprint.questionDistribution.mcq} Qs
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-background/90 dark:bg-background/80 border border-slate-200/80 dark:border-border/40 text-center shadow-2xs">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">Assertion-Reason</span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-foreground">
                        {blueprint.questionDistribution.assertionReason} Qs
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-background/90 dark:bg-background/80 border border-slate-200/80 dark:border-border/40 text-center shadow-2xs">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">Very Short (2M)</span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-foreground">
                        {blueprint.questionDistribution.vsa} Qs
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-background/90 dark:bg-background/80 border border-slate-200/80 dark:border-border/40 text-center shadow-2xs">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">Short Answer (3M)</span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-foreground">
                        {blueprint.questionDistribution.sa} Qs
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-background/90 dark:bg-background/80 border border-slate-200/80 dark:border-border/40 text-center shadow-2xs">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">Long Answer (5M)</span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-foreground">
                        {blueprint.questionDistribution.la} Qs
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-background/90 dark:bg-background/80 border border-slate-200/80 dark:border-border/40 text-center shadow-2xs">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">Case Study (4M)</span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-foreground">
                        {blueprint.questionDistribution.caseStudy} Qs
                      </span>
                    </div>
                  </div>
                </GlassCard>

                {/* Unit Weightages List */}
                {blueprint.unitWeightage && blueprint.unitWeightage.length > 0 && (
                  <GlassCard className="p-4 border-slate-200/80 dark:border-border/50 space-y-3 bg-card/80 dark:bg-card/40">
                    <h4 className="text-xs font-extrabold font-heading uppercase text-slate-700 dark:text-slate-300 tracking-wide">
                      Unit-Wise Mark Weightage Allocations
                    </h4>
                    <div className="space-y-2">
                      {blueprint.unitWeightage.map((u, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-background/80 border border-slate-200/70 dark:border-border/40 text-xs shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                              {u.unit}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-foreground">{u.topic}</span>
                          </div>
                          <span className="font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-500/25">
                            {u.marks} Marks
                          </span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

                {/* Default General Instructions */}
                <GlassCard className="p-4 border-slate-200/80 dark:border-border/50 space-y-2 bg-card/80 dark:bg-card/40">
                  <h4 className="text-xs font-extrabold font-heading uppercase text-slate-700 dark:text-slate-300 tracking-wide">
                    General Exam Instructions
                  </h4>
                  <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed bg-slate-50/80 dark:bg-background/40 p-3 rounded-xl border border-slate-200/80 dark:border-border/40">
                    {blueprint.defaultInstructions}
                  </pre>
                </GlassCard>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-xs bg-background/40 rounded-2xl border border-border/40">
                Blueprint loading...
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
