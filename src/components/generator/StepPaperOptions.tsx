"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PaperOptions } from "@/types";
import { Sparkles, CheckCircle2 } from "lucide-react";

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
        <h3 className="text-xl sm:text-2xl font-bold font-heading mb-2">Configure Header & Options</h3>
        <p className="text-muted-foreground text-sm">
          Customize header metadata, school details, and general instructions on the generated paper.
        </p>
      </div>

      {isBlueprintMode && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-500/30 text-card-foreground shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-500 font-heading font-bold text-sm">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>{blueprintTitle || "Official Exam Blueprint Applied"}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Chapter distribution, question counts, section marks, and instructions have been automatically set according to the official curriculum pattern.
          </p>

          {unitWeightage && unitWeightage.length > 0 && (
            <div className="pt-2">
              <h5 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Unit Mark Allocations
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {unitWeightage.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-xl bg-background/60 border border-border/50 text-[11px]"
                  >
                    <span className="truncate font-medium text-foreground">{u.topic}</span>
                    <span className="ml-2 font-bold text-indigo-500">{u.marks}M</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* School Name Option */}
        <div className="p-4 rounded-2xl border border-border/40 bg-background/50 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold font-heading">Include School / Institution Header</h4>
              <p className="text-[10px] text-muted-foreground">Print custom school name on top of the paper</p>
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
              className="bg-background/80 rounded-xl border-border/60 text-xs"
            />
          )}
        </div>

        {/* Teacher Name Option */}
        <div className="p-4 rounded-2xl border border-border/40 bg-background/50 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold font-heading">Include Educator / Teacher Name</h4>
              <p className="text-[10px] text-muted-foreground">Print paper setter name in paper header</p>
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
              className="bg-background/80 rounded-xl border-border/60 text-xs"
            />
          )}
        </div>

        {/* General Instructions Text */}
        <div className="p-4 rounded-2xl border border-border/40 bg-background/50 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold font-heading">General Examination Instructions</h4>
              <p className="text-[10px] text-muted-foreground">Custom rules printed under the header</p>
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
              className="bg-background/80 rounded-xl border-border/60 text-xs font-mono"
            />
          )}
        </div>
      </div>
    </div>
  );
}
