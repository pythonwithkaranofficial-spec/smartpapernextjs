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
  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold font-heading mb-2">Enter Target Class</h3>
        <p className="text-muted-foreground text-sm">
          Type the class standard or grade you are compiling the paper for. Gemini AI will intelligently parse it (e.g. &quot;IX&quot;, &quot;XII&quot;, &quot;Grade 10&quot;, &quot;12&quot;).
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
