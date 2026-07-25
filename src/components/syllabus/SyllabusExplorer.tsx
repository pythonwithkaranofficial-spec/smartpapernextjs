"use client";

import React, { useState, useMemo } from "react";
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
  compact?: boolean;
}

export function SyllabusExplorer({
  initialClassId = "10",
  initialSubject = "maths",
  onSelectSyllabus,
  compact = false,
}: SyllabusExplorerProps) {
  const [selectedClass, setSelectedClass] = useState<string>(initialClassId);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [activeTab, setActiveTab] = useState<"syllabus" | "blueprint">("syllabus");
  const [searchQuery, setSearchQuery] = useState("");

  // Get available subjects for selected class
  const classCurriculum = CURRICULUM_DATA[selectedClass] || {};
  const availableSubjects = Object.keys(classCurriculum);

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
    if (!activeBlueprint) return;

    const prefilledConfig = {
      classId: selectedClass,
      subject: currentSubjectKey,
      examType: "annual_exam",
      difficulty: "Medium",
      language: "English",
      totalMarks: activeBlueprint.totalMarks || 80,
      duration: activeBlueprint.duration || "3 Hours",
      questionDistribution: activeBlueprint.questionDistribution,
      blueprintId: activeBlueprint.id,
      isBlueprintMode: true,
      unitWeightage: activeBlueprint.unitWeightage,
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
        instructionsText: activeBlueprint.defaultInstructions || "1. All questions are compulsory.",
        includeInternalChoice: false,
        includeAnswerKey: true,
        numberOfSets: 1,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selectedChapters: activeBlueprint.unitWeightage?.map((u: any) => u.topic) || [],
    };

    localStorage.setItem("smart_paper_form_config", JSON.stringify(prefilledConfig));
    sessionStorage.setItem("preset_step", "7");
    router.push("/generate?preset=blueprint&step=7");
  };

  // Filter chapters by search query
  const filteredChapters = useMemo(() => {
    if (!currentCurriculum?.chapters) return [];
    if (!searchQuery.trim()) return currentCurriculum.chapters;
    return currentCurriculum.chapters.filter((ch) =>
      ch.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [currentCurriculum, searchQuery]);

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
        <span className="text-xs font-bold font-heading text-muted-foreground mr-2 uppercase tracking-wider flex items-center gap-1">
          <GraduationCap className="w-4 h-4 text-indigo-500" />
          Class:
        </span>
        {AVAILABLE_CLASSES.map((c) => {
          const isSelected = selectedClass === c;
          return (
            <button
              key={c}
              onClick={() => setSelectedClass(c)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold font-heading transition-all duration-250 border",
                isSelected
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent shadow-[0_4px_14px_rgba(59,130,246,0.3)]"
                  : "bg-background/60 hover:bg-muted border-border/50 text-muted-foreground hover:text-foreground"
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
          const label = SUBJECT_NAMES[subKey] || subKey.toUpperCase();
          return (
            <button
              key={subKey}
              type="button"
              onClick={() => setSelectedSubject(subKey)}
              className={cn(
                "w-full h-10 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border flex items-center gap-2 min-w-0 justify-start text-left",
                isSelected
                  ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                  : "bg-background/40 hover:bg-muted/70 border-border/40 text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="w-3.5 h-3.5 opacity-70 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Subject Banner Card */}
      <GlassCard className="p-5 border-indigo-500/30 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                Class {selectedClass} • {SUBJECT_NAMES[currentSubjectKey] || currentSubjectKey}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 font-semibold border border-indigo-500/20">
                CBSE 2026 Pattern
              </span>
            </div>
            <h3 className="text-lg font-bold font-heading">
              {blueprint?.title || `Class ${selectedClass} ${SUBJECT_NAMES[currentSubjectKey] || currentSubjectKey} Official Curriculum`}
            </h3>
            {currentCurriculum?.notes && (
              <p className="text-xs text-muted-foreground mt-1">{currentCurriculum.notes}</p>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {onSelectSyllabus ? (
              <Button
                onClick={() => onSelectSyllabus(selectedClass, currentSubjectKey)}
                className="w-full md:w-auto rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-heading font-bold text-xs px-5 py-2.5 shadow-md hover:scale-[1.02] transition-all"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                Apply To Paper Generator
              </Button>
            ) : (
              <Link
                href={`/generate?classId=${selectedClass}&subject=${currentSubjectKey}`}
                className="w-full md:w-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-heading font-bold text-xs px-5 py-2.5 shadow-md hover:scale-[1.02] transition-all"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                Generate Paper From Syllabus
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Tabs Header */}
      <div className="flex border-b border-border/50 gap-6">
        <button
          onClick={() => setActiveTab("syllabus")}
          className={cn(
            "pb-3 text-xs sm:text-sm font-heading font-bold transition-all relative",
            activeTab === "syllabus"
              ? "text-indigo-400 border-b-2 border-indigo-500"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          📚 Syllabus Chapters ({currentCurriculum?.chapters.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("blueprint")}
          className={cn(
            "pb-3 text-xs sm:text-sm font-heading font-bold transition-all relative flex items-center gap-1.5",
            activeTab === "blueprint"
              ? "text-indigo-400 border-b-2 border-indigo-500"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Award className="w-4 h-4" />
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
            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search chapter or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/60 rounded-xl text-xs border-border/60"
              />
            </div>

            {/* Chapters List */}
            {filteredChapters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredChapters.map((ch, idx) => (
                  <GlassCard
                    key={idx}
                    className="p-3.5 border-border/40 hover:border-indigo-500/30 transition-all flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-heading font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground leading-snug">{ch}</h4>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        In CBSE 2026 Official Syllabus
                      </span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-xs bg-background/40 rounded-2xl border border-border/40">
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
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-xs font-extrabold uppercase font-heading text-indigo-300 tracking-wider">
                        Official CBSE Board Blueprint
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 uppercase">
                        Ready to Generate
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-foreground font-heading">
                      Class {selectedClass} — {SUBJECT_NAMES[currentSubjectKey] || currentSubjectKey}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Includes official unit weightages ({blueprint.totalMarks} Marks, {blueprint.duration}) and board section breakdown.
                    </p>
                  </div>

                  <Button
                    onClick={() => handleGenerateWithBlueprint(blueprint)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold font-heading px-6 py-5 rounded-xl shadow-lg shadow-indigo-500/25 hover:scale-[1.03] transition-all cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-4 h-4 mr-2 text-yellow-300 animate-pulse" />
                    Generate Paper With This Blueprint
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-background/60 border border-border/50 text-center">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                      Total Theory Marks
                    </span>
                    <span className="text-xl font-extrabold font-heading text-indigo-400">
                      {blueprint.totalMarks} Marks
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-background/60 border border-border/50 text-center">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                      Exam Duration
                    </span>
                    <span className="text-xl font-extrabold font-heading text-purple-400">
                      {blueprint.duration}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-background/60 border border-border/50 text-center">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                      Target Board
                    </span>
                    <span className="text-xl font-extrabold font-heading text-cyan-400">
                      {blueprint.board} 2026
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-background/60 border border-border/50 text-center">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                      Question Count
                    </span>
                    <span className="text-xl font-extrabold font-heading text-emerald-400">
                      {Object.values(blueprint.questionDistribution).reduce((a, b) => a + b, 0)} Qs
                    </span>
                  </div>
                </div>

                {/* Section Breakdown Table */}
                <GlassCard className="p-4 border-border/50 space-y-3">
                  <h4 className="text-xs font-bold font-heading uppercase text-muted-foreground flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Official Question Paper Structure & Distribution
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    <div className="p-3 rounded-lg bg-background/80 border border-border/40 text-center">
                      <span className="text-[10px] text-muted-foreground block">MCQs (1M)</span>
                      <span className="text-sm font-bold text-foreground">
                        {blueprint.questionDistribution.mcq} Qs
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-background/80 border border-border/40 text-center">
                      <span className="text-[10px] text-muted-foreground block">Assertion-Reason</span>
                      <span className="text-sm font-bold text-foreground">
                        {blueprint.questionDistribution.assertionReason} Qs
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-background/80 border border-border/40 text-center">
                      <span className="text-[10px] text-muted-foreground block">Very Short (2M)</span>
                      <span className="text-sm font-bold text-foreground">
                        {blueprint.questionDistribution.vsa} Qs
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-background/80 border border-border/40 text-center">
                      <span className="text-[10px] text-muted-foreground block">Short Answer (3M)</span>
                      <span className="text-sm font-bold text-foreground">
                        {blueprint.questionDistribution.sa} Qs
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-background/80 border border-border/40 text-center">
                      <span className="text-[10px] text-muted-foreground block">Long Answer (5M)</span>
                      <span className="text-sm font-bold text-foreground">
                        {blueprint.questionDistribution.la} Qs
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-background/80 border border-border/40 text-center">
                      <span className="text-[10px] text-muted-foreground block">Case Study (4M)</span>
                      <span className="text-sm font-bold text-foreground">
                        {blueprint.questionDistribution.caseStudy} Qs
                      </span>
                    </div>
                  </div>
                </GlassCard>

                {/* Unit Weightages List */}
                {blueprint.unitWeightage && blueprint.unitWeightage.length > 0 && (
                  <GlassCard className="p-4 border-border/50 space-y-3">
                    <h4 className="text-xs font-bold font-heading uppercase text-muted-foreground">
                      Unit-Wise Mark Weightage Allocations
                    </h4>
                    <div className="space-y-2">
                      {blueprint.unitWeightage.map((u, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-background/60 border border-border/40 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                              {u.unit}
                            </span>
                            <span className="font-medium text-foreground">{u.topic}</span>
                          </div>
                          <span className="font-extrabold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                            {u.marks} Marks
                          </span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

                {/* Default General Instructions */}
                <GlassCard className="p-4 border-border/50 space-y-2">
                  <h4 className="text-xs font-bold font-heading uppercase text-muted-foreground">
                    General Exam Instructions
                  </h4>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed bg-background/40 p-3 rounded-xl border border-border/40">
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
