"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PaperOptions } from "@/types";
import { Sparkles } from "lucide-react";

interface StepPaperOptionsProps {
  value?: PaperOptions;
  options?: PaperOptions;
  onChange?: (val: PaperOptions) => void;
  onChangeOptions?: (val: PaperOptions) => void;
  isBlueprintMode?: boolean;
  unitWeightage?: { unit: string; topic: string; marks: number }[];
  blueprintTitle?: string;
}

export function StepPaperOptions({
  value,
  options,
  onChange,
  onChangeOptions,
  isBlueprintMode,
  unitWeightage,
  blueprintTitle,
}: StepPaperOptionsProps) {
  const currentOptions = options || value || {
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
    instructionsText: "1. All questions are compulsory.\n2. Write answers clearly.",
    includeInternalChoice: false,
  };

  const updateOptions = (newOptions: PaperOptions) => {
    if (onChange) onChange(newOptions);
    if (onChangeOptions) onChangeOptions(newOptions);
  };

  const handleToggle = (field: keyof PaperOptions) => {
    updateOptions({
      ...currentOptions,
      [field]: !currentOptions[field],
    });
  };

  const handleInputChange = (field: keyof PaperOptions, val: string) => {
    updateOptions({
      ...currentOptions,
      [field]: val,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center max-w-lg mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold font-heading mb-2 text-foreground">Configure Header & Options</h3>
        <p className="text-slate-600 dark:text-muted-foreground text-sm">
          Customize header metadata, school details, and general instructions on the generated paper.
        </p>
      </div>

      {isBlueprintMode && (
        <div className="p-5 rounded-2xl bg-indigo-50/80 dark:bg-[#0c1322] border border-indigo-200 dark:border-indigo-500/30 text-card-foreground shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-heading font-bold text-sm">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{blueprintTitle || "Official Exam Blueprint Applied"}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Chapter distribution, question counts, section marks, and instructions have been automatically set according to the official curriculum pattern.
          </p>

          {unitWeightage && unitWeightage.length > 0 && (
            <div className="pt-2">
              <h5 className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Unit Mark Allocations
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {unitWeightage.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#131c31] border border-slate-200 dark:border-indigo-500/20 text-[11px] shadow-2xs"
                  >
                    <span className="truncate font-medium text-foreground">{u.topic}</span>
                    <span className="ml-2 font-bold text-indigo-600 dark:text-indigo-400">{u.marks}M</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* School Name Option */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-border/40 bg-white/80 dark:bg-background/50 shadow-xs backdrop-blur-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold font-heading text-slate-900 dark:text-foreground">Include School / Institution Header</h4>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Print custom school name on top of the paper</p>
            </div>
            <Switch
              checked={currentOptions.includeSchoolName}
              onCheckedChange={() => handleToggle("includeSchoolName")}
            />
          </div>
          {currentOptions.includeSchoolName && (
            <Input
              type="text"
              placeholder="e.g. St. Xavier's Senior Secondary School"
              value={currentOptions.schoolName || ""}
              onChange={(e) => handleInputChange("schoolName", e.target.value)}
              className="bg-white dark:bg-background/80 rounded-xl border-slate-300 dark:border-border/60 text-xs shadow-xs text-foreground focus-visible:ring-blue-500/40"
            />
          )}
        </div>

        {/* Teacher Name Option */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-border/40 bg-white/80 dark:bg-background/50 shadow-xs backdrop-blur-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold font-heading text-slate-900 dark:text-foreground">Include Educator / Teacher Name</h4>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Print paper setter name in paper header</p>
            </div>
            <Switch
              checked={currentOptions.includeTeacherName}
              onCheckedChange={() => handleToggle("includeTeacherName")}
            />
          </div>
          {currentOptions.includeTeacherName && (
            <Input
              type="text"
              placeholder="e.g. Prepared by: Karan Sir"
              value={currentOptions.teacherName || ""}
              onChange={(e) => handleInputChange("teacherName", e.target.value)}
              className="bg-white dark:bg-background/80 rounded-xl border-slate-300 dark:border-border/60 text-xs shadow-xs text-foreground focus-visible:ring-blue-500/40"
            />
          )}
        </div>

        {/* Answer Key & Marking Scheme Option */}
        <div className="p-4 rounded-2xl border border-indigo-300/80 dark:border-indigo-500/40 bg-indigo-50/70 dark:bg-[#0c1322] shadow-xs backdrop-blur-sm space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold font-heading text-slate-900 dark:text-foreground">
                  Generate Answer Key & Detailed Marking Scheme
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-500/40 uppercase tracking-wider">
                  Recommended
                </span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                Generate step-by-step solutions, MCQ rationale, and mark allocations per question
              </p>
            </div>
            <Switch
              checked={Boolean(currentOptions.includeAnswerKey)}
              onCheckedChange={() => handleToggle("includeAnswerKey")}
            />
          </div>
        </div>

        {/* Multi-Set Paper Generation Option */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-border/40 bg-white/80 dark:bg-background/50 shadow-xs backdrop-blur-sm space-y-3 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold font-heading text-slate-900 dark:text-foreground">Multi-Set Paper Generation (Exam Security)</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-500/30 uppercase tracking-wider">
                  Anti-Cheating
                </span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                Generate parallel paper variants (Set A, Set B, Set C) with shuffled questions and randomized MCQ choices
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
              {[1, 2, 3].map((num) => {
                const isSelected = (currentOptions.numberOfSets || 1) === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => updateOptions({ ...currentOptions, numberOfSets: num })}
                    className={`px-3 py-1 rounded-lg text-xs font-heading font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    {num === 1 ? "1 Set" : num === 2 ? "2 Sets (A & B)" : "3 Sets (A, B, C)"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* General Instructions Text */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-border/40 bg-white/80 dark:bg-background/50 shadow-xs backdrop-blur-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold font-heading text-slate-900 dark:text-foreground">General Examination Instructions</h4>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Custom rules printed under the header</p>
            </div>
            <Switch
              checked={currentOptions.includeInstructions}
              onCheckedChange={() => handleToggle("includeInstructions")}
            />
          </div>
          {currentOptions.includeInstructions && (
            <Textarea
              rows={3}
              value={currentOptions.instructionsText || ""}
              onChange={(e) => handleInputChange("instructionsText", e.target.value)}
              className="bg-white dark:bg-background/80 rounded-xl border-slate-300 dark:border-border/60 text-xs font-mono shadow-xs text-foreground focus-visible:ring-blue-500/40"
            />
          )}
        </div>
      </div>
    </div>
  );
}
