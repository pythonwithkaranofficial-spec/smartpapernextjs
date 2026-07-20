"use client";

import React from "react";
import * as Icons from "lucide-react";
import { CLASS_SUBJECTS } from "@/lib/subjects-data";
import { GlassCard } from "../shared/GlassCard";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepSubjectSelectProps {
  classId: string;
  value: string;
  onChange: (val: string) => void;
  onNext: (classIdOverride?: string, subjectOverride?: string) => void;
}

export function StepSubjectSelect({ classId, value, onChange, onNext }: StepSubjectSelectProps) {
  const subjects = CLASS_SUBJECTS[classId] || [];

  const handleSelect = (subjectId: string) => {
    onChange(subjectId);
    onNext(undefined, subjectId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold font-heading mb-2">Select Subject</h3>
        <p className="text-muted-foreground text-sm">
          Select the subject syllabus context for the generated questions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
        {subjects.map((sub) => {
          const isSelected = value === sub.id;
          
          // Dynamically get the icon component
          // @ts-expect-error: Dynamically mapping string names to icons
          const Icon = Icons[sub.iconName] || Icons.BookOpen;

          return (
            <GlassCard
              key={sub.id}
              onClick={() => handleSelect(sub.id)}
              className={cn(
                "p-5 cursor-pointer text-left border flex flex-col justify-between items-start gap-4 transition-all duration-300 relative group h-36",
                isSelected
                  ? "border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                  : "border-border/40 hover:border-indigo-500/25"
              )}
            >
              <div className="flex justify-between items-start w-full">
                {/* Icon Wrapper */}
                <div className={cn(
                  "p-2.5 rounded-xl bg-gradient-to-tr flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-105",
                  sub.color
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                
                {/* Selection Checkmark */}
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300",
                    isSelected
                      ? "bg-indigo-500 border-transparent text-white"
                      : "border-border text-transparent scale-90 group-hover:border-indigo-500/30"
                  )}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <span className="text-sm font-bold font-heading block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-250 leading-tight">
                  {sub.name}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5 uppercase tracking-wider font-medium">
                  Syllabus Ready
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
