"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PaperOptions } from "@/types";

interface StepPaperOptionsProps {
  value: PaperOptions;
  onChange: (val: PaperOptions) => void;
}

export function StepPaperOptions({ value, onChange }: StepPaperOptionsProps) {
  const handleToggle = (field: keyof PaperOptions) => {
    onChange({
      ...value,
      [field]: !value[field],
    });
  };

  const handleInputChange = (field: keyof PaperOptions, val: string) => {
    onChange({
      ...value,
      [field]: val,
    });
  };

  const toggleItems = [
    { id: "includeClass", label: "Include Class Label", desc: "Show standard Class standard in subheader" },
    { id: "includeSubject", label: "Include Subject Label", desc: "Show active Subject name in subheader" },
    { id: "includeTime", label: "Include Time Duration", desc: "Show allowed examination time limit" },
    { id: "includeMaxMarks", label: "Include Maximum Marks", desc: "Show total maximum paper marks" },
    { id: "includeSchoolLogo", label: "Include School Logo Placeholder", desc: "Adds logo layout slot at top center" },
    { id: "includeInternalChoice", label: "Provide Internal Choices", desc: "Adds fallback optional questions ('OR' options)" },
  ] as const;

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-left">
      <div className="text-center max-w-lg mx-auto mb-6">
        <h3 className="text-xl sm:text-2xl font-bold font-heading mb-2">Paper Sheet Layout Toggles</h3>
        <p className="text-muted-foreground text-sm">
          Customize what information labels and formatting segments should be included in the header of the printed sheet.
        </p>
      </div>

      <div className="space-y-5">
        {/* School Name Toggle Group */}
        <div className="p-4 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold font-heading block">Include School Name</span>
              <span className="text-[11px] text-muted-foreground block">Renders school title centered at the very top</span>
            </div>
            <Switch
              checked={value.includeSchoolName}
              onCheckedChange={() => handleToggle("includeSchoolName")}
            />
          </div>
          
          {value.includeSchoolName && (
            <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <Input
                type="text"
                value={value.schoolName}
                onChange={(e) => handleInputChange("schoolName", e.target.value)}
                placeholder="Enter School Name (e.g. Saint Xavier Senior Secondary School)"
                className="rounded-lg border-border/60"
              />
            </div>
          )}
        </div>

        {/* Teacher Name Toggle Group */}
        <div className="p-4 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold font-heading block">Include Teacher Name</span>
              <span className="text-[11px] text-muted-foreground block">Renders examiner label in subheader</span>
            </div>
            <Switch
              checked={value.includeTeacherName}
              onCheckedChange={() => handleToggle("includeTeacherName")}
            />
          </div>
          
          {value.includeTeacherName && (
            <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <Input
                type="text"
                value={value.teacherName}
                onChange={(e) => handleInputChange("teacherName", e.target.value)}
                placeholder="Enter Examiner/Teacher Name (e.g. Karan Saini)"
                className="rounded-lg border-border/60"
              />
            </div>
          )}
        </div>

        {/* Other toggles in a neat 2-column layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {toggleItems.map((item) => {
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm flex items-center justify-between gap-4"
              >
                <div className="pr-2">
                  <span className="text-sm font-bold font-heading block leading-tight">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5 leading-tight">{item.desc}</span>
                </div>
                <Switch
                  checked={value[item.id] as boolean}
                  onCheckedChange={() => handleToggle(item.id as keyof PaperOptions)}
                />
              </div>
            );
          })}
        </div>

        {/* Instructions Toggle Group */}
        <div className="p-4 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold font-heading block">Include Examination Instructions</span>
              <span className="text-[11px] text-muted-foreground block">Renders general guidelines box under subheader</span>
            </div>
            <Switch
              checked={value.includeInstructions}
              onCheckedChange={() => handleToggle("includeInstructions")}
            />
          </div>
          
          {value.includeInstructions && (
            <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <Textarea
                value={value.instructionsText}
                onChange={(e) => handleInputChange("instructionsText", e.target.value)}
                placeholder="Enter general instructions (separated by lines, e.g. 1. All questions are compulsory. 2. Section A contains MCQs...)"
                rows={4}
                className="rounded-lg border-border/60"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
