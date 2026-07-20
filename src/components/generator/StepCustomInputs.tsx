import React from "react";
import { GlassCard } from "../shared/GlassCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface StepCustomClassProps {
  value: string;
  onChange: (val: string) => void;
}

export function StepCustomClass({ value, onChange }: StepCustomClassProps) {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold font-heading mb-2">Enter Target Class</h3>
        <p className="text-muted-foreground text-sm">
          Type the class standard or grade you are compiling the paper for. Gemini AI will intelligently parse it (e.g. "IX", "XII", "Grade 10", "12").
        </p>
      </div>

      <div className="max-w-md mx-auto pt-4">
        <GlassCard className="p-6 border border-border/40">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2 font-heading">
            Class / Grade Standard
          </label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. Class 12, Grade 10, IX, First..."
            className="w-full text-lg py-6"
            autoFocus
          />
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
          Type the subject name. Abbreviations and variations are supported (e.g. "Math", "CS", "Accounts", "BST").
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
            placeholder="e.g. Math, Chemistry, Computer Science, Economics..."
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
        <h3 className="text-xl sm:text-2xl font-bold font-heading mb-2">Enter Chapters</h3>
        <p className="text-muted-foreground text-sm">
          Type the names of the chapters to include. You can use comma-separated list, newlines, or normal text. Spelling errors will be corrected automatically.
        </p>
      </div>

      <div className="max-w-lg mx-auto pt-4">
        <GlassCard className="p-6 border border-border/40">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2 font-heading">
            Chapter List / Syllabus Details
          </label>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. Chapter 1, Chapter 2, Matrices, Determinants, Vector algebra..."
            className="w-full text-sm min-h-[140px] resize-y py-3"
            autoFocus
          />
        </GlassCard>
      </div>
    </div>
  );
}
