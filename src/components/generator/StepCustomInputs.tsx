"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "../shared/GlassCard";

interface StepCustomClassProps {
  value: string;
  onChange: (val: string) => void;
}

export function StepCustomClass({ value, onChange }: StepCustomClassProps) {
  const presets = [
    "Class 1", "Class 2", "Class 3", "Class 4",
    "Class 5", "Class 6", "Class 7", "Class 8",
    "Class 9", "Class 10", "Class 11", "Class 12"
  ];

  // Determine current dropdown state
  const isPreset = presets.includes(value);
  const [selectedOption, setSelectedOption] = React.useState<string>(
    isPreset ? value : (value ? "custom" : "Class 10")
  );
  const [customText, setCustomText] = React.useState<string>(
    isPreset ? "" : value
  );

  // Sync state if value changes externally
  React.useEffect(() => {
    if (presets.includes(value)) {
      setSelectedOption(value);
    } else if (value) {
      setSelectedOption("custom");
      setCustomText(value);
    }
  }, [value]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedOption(val);
    if (val === "custom") {
      onChange(customText || "Custom Class");
    } else {
      onChange(val);
    }
  };

  const handleCustomTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomText(val);
    onChange(val);
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold font-heading mb-2">Select Target Class</h3>
        <p className="text-muted-foreground text-sm">
          Choose a class from the list below or select &quot;Custom / Other&quot; to specify your own target grade.
        </p>
      </div>

      <div className="max-w-md mx-auto pt-4">
        <GlassCard className="p-6 border border-border/40 space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2 font-heading">
              Select Class Standard
            </label>
            <select
              value={selectedOption}
              onChange={handleSelectChange}
              className="w-full bg-background/80 text-foreground border border-border/60 rounded-xl p-3 text-base font-medium focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            >
              {presets.map((cls) => (
                <option key={cls} value={cls} className="bg-card text-foreground">
                  {cls}
                </option>
              ))}
              <option value="custom" className="bg-card text-foreground font-bold">
                Custom / Other Class...
              </option>
            </select>
          </div>

          {selectedOption === "custom" && (
            <div className="pt-2 animate-in fade-in-50 duration-200">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2 font-heading">
                Enter Custom Class Name
              </label>
              <Input
                value={customText}
                onChange={handleCustomTextChange}
                placeholder="e.g. Grade 10 - Advanced, Nursery, B.Sc Physics..."
                className="w-full text-base py-5"
                autoFocus
              />
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

interface StepCustomSubjectProps {
  value: string;
  onChange: (val: string) => void;
}

export function StepCustomSubject({ value, onChange }: StepCustomSubjectProps) {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold font-heading mb-2">Enter Subject</h3>
        <p className="text-muted-foreground text-sm">
          Type the subject name. Abbreviations and variations are supported (e.g. &quot;Math&quot;, &quot;CS&quot;, &quot;Accounts&quot;, &quot;BST&quot;).
        </p>
      </div>

      <div className="max-w-md mx-auto pt-4">
        <GlassCard className="p-6 border border-border/40">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2 font-heading">
            Subject Name
          </label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. Applied Mathematics, Computer Science..."
            className="w-full text-lg py-6"
            autoFocus
          />
        </GlassCard>
      </div>
    </div>
  );
}

interface StepCustomChaptersProps {
  value: string;
  onChange: (val: string) => void;
}

export function StepCustomChapters({ value, onChange }: StepCustomChaptersProps) {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold font-heading mb-2">Enter Syllabus & Chapters</h3>
        <p className="text-muted-foreground text-sm">
          List the custom units, topics, or chapters you want the questions to cover.
        </p>
      </div>

      <div className="max-w-xl mx-auto pt-4">
        <GlassCard className="p-6 border border-border/40">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2 font-heading">
            Chapters & Topic List
          </label>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. Chapter 1: Real Numbers&#10;Chapter 2: Polynomials&#10;Unit 3: Trigonometry..."
            rows={5}
            className="w-full text-sm font-mono"
            autoFocus
          />
        </GlassCard>
      </div>
    </div>
  );
}
