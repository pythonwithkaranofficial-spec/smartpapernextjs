"use client";

import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, Smile, Meh, Frown } from "lucide-react";

interface StepConfigurationProps {
  difficulty: "Easy" | "Medium" | "Hard";
  setDifficulty: (val: "Easy" | "Medium" | "Hard") => void;
  language: "English" | "Hindi" | "Bilingual";
  setLanguage: (val: "English" | "Hindi" | "Bilingual") => void;
  totalMarks: number;
  setTotalMarks: (val: number) => void;
  duration: string;
  setDuration: (val: string) => void;
  subject?: string;
}

export function StepConfiguration({
  difficulty,
  setDifficulty,
  language,
  setLanguage,
  totalMarks,
  setTotalMarks,
  duration,
  setDuration,
  subject,
}: StepConfigurationProps) {
  const isHindiSubject = 
    subject === "hindi" || 
    subject === "hindi_core" || 
    subject === "hindi_elective" || 
    subject === "हिन्दी" || 
    subject === "हिन्दी कोर" || 
    subject === "हिन्दी ऐच्छिक";

  // Automatically force language to Hindi if it's a Hindi subject
  useEffect(() => {
    if (isHindiSubject && language !== "Hindi") {
      setLanguage("Hindi");
    }
  }, [isHindiSubject, language, setLanguage]);

  const difficulties = [
    { id: "Easy", icon: Smile, label: "Easy", color: "text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5", desc: "Basic recall & simple direct questions" },
    { id: "Medium", icon: Meh, label: "Medium", color: "text-indigo-600 dark:text-indigo-400 border-indigo-500/20 bg-indigo-500/5", desc: "Application, understanding & analytical" },
    { id: "Hard", icon: Frown, label: "Hard", color: "text-rose-600 dark:text-rose-400 border-rose-500/20 bg-rose-500/5", desc: "High Order Thinking Skills (HOTS) & proofs" },
  ] as const;

  const languages = [
    { id: "English", label: "English Only", desc: "Questions drafted in English language" },
    { id: "Hindi", label: "Hindi Only", desc: "Questions drafted in Hindi language" },
    { id: "Bilingual", label: "Bilingual", desc: "Questions drafted in English with Hindi translation" },
  ] as const;

  const quickMarks = [10, 20, 30, 40, 50, 60, 70, 80, 100];
  const quickDurations = ["30 Minutes", "45 Minutes", "1 Hour", "1.5 Hours", "2 Hours", "3 Hours"];

  const handleCustomMarksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setTotalMarks(val);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center max-w-lg mx-auto mb-6">
        <h3 className="text-xl sm:text-2xl font-bold font-heading mb-2">Configure Parameters</h3>
        <p className="text-muted-foreground text-sm">
          Set the difficulty level, language, total marks, and examination time limit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
        {/* Left column: Difficulty & Language */}
        <div className="space-y-6 text-left">
          {/* Difficulty Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold tracking-wide font-heading text-foreground/90 uppercase">
              Difficulty Level
            </Label>
            <div className="flex flex-col gap-2.5">
              {difficulties.map((diff) => {
                const DiffIcon = diff.icon;
                const isSelected = difficulty === diff.id;
                return (
                  <div
                    key={diff.id}
                    onClick={() => setDifficulty(diff.id)}
                    className={cn(
                      "p-3.5 rounded-xl border cursor-pointer flex gap-4 items-center transition-all duration-300",
                      isSelected
                        ? cn("border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/20")
                        : "border-border/40 hover:border-indigo-500/20 bg-card"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg border", isSelected ? diff.color : "bg-muted text-muted-foreground border-border/50")}>
                      <DiffIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-grow">
                      <span className="text-sm font-bold font-heading block">{diff.label}</span>
                      <span className="text-[11px] text-muted-foreground block">{diff.desc}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-500" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold tracking-wide font-heading text-foreground/90 uppercase">
              Paper Language
            </Label>
            <div className="grid grid-cols-1 gap-2.5">
              {languages.map((lang) => {
                const isSelected = language === lang.id;
                const isDisabled = isHindiSubject && lang.id !== "Hindi";
                return (
                  <div
                    key={lang.id}
                    onClick={() => {
                      if (isDisabled) return;
                      setLanguage(lang.id);
                    }}
                    title={isDisabled ? "Hindi papers are available only in Hindi." : undefined}
                    className={cn(
                      "p-3.5 rounded-xl border flex items-center justify-between transition-all duration-300",
                      isSelected
                        ? "border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/20"
                        : "border-border/40 bg-card",
                      isDisabled
                        ? "opacity-40 cursor-not-allowed border-border/20"
                        : "hover:border-indigo-500/20 cursor-pointer"
                    )}
                  >
                    <div>
                      <span className="text-sm font-bold font-heading block">{lang.label}</span>
                      <span className="text-[11px] text-muted-foreground block">{lang.desc}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelected && <Check className="w-4 h-4 text-indigo-500" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Marks & Time */}
        <div className="space-y-6 text-left">
          {/* Total Marks */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold tracking-wide font-heading text-foreground/90 uppercase">
              Total Marks
            </Label>
            
            {/* Quick selectors */}
            <div className="flex flex-wrap gap-2 mb-3">
              {quickMarks.map((marks) => {
                const isSelected = totalMarks === marks;
                return (
                  <button
                    type="button"
                    key={marks}
                    onClick={() => setTotalMarks(marks)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 font-heading cursor-pointer",
                      isSelected
                        ? "bg-indigo-500 border-transparent text-white shadow-md shadow-indigo-500/20"
                        : "border-border/60 hover:border-indigo-500/20 bg-card text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {marks}
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <div className="relative max-w-[200px]">
              <Input
                type="number"
                value={totalMarks || ""}
                onChange={handleCustomMarksChange}
                placeholder="Custom marks"
                className="pl-8 rounded-xl border-border/50 glass hover:border-indigo-500/20 focus:border-indigo-500/40"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground font-heading">
                M
              </span>
            </div>
          </div>

          {/* Time Duration */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold tracking-wide font-heading text-foreground/90 uppercase">
              Examination Duration
            </Label>
            
            {/* Quick selectors */}
            <div className="flex flex-wrap gap-2 mb-3">
              {quickDurations.map((dur) => {
                const isSelected = duration === dur;
                return (
                  <button
                    type="button"
                    key={dur}
                    onClick={() => setDuration(dur)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 font-heading cursor-pointer",
                      isSelected
                        ? "bg-indigo-500 border-transparent text-white shadow-md shadow-indigo-500/20"
                        : "border-border/60 hover:border-indigo-500/20 bg-card text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {dur}
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <div className="relative max-w-[200px]">
              <Input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 2.5 Hours"
                className="pl-8 rounded-xl border-border/50 glass hover:border-indigo-500/20 focus:border-indigo-500/40"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground font-heading">
                T
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
