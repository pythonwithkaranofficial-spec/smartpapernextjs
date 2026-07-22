"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PaperOptions } from "@/types";

interface StepPaperOptionsProps {
  value?: PaperOptions;
  options?: PaperOptions;
  onChange?: (val: PaperOptions) => void;
  onChangeOptions?: (val: PaperOptions) => void;
}

export function StepPaperOptions({ value, options, onChange, onChangeOptions }: StepPaperOptionsProps) {
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
