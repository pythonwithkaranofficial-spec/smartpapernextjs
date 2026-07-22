"use client";

import React from "react";
import * as Icons from "lucide-react";
import { CLASS_SUBJECTS } from "@/lib/subjects-data";
import { GlassCard } from "../shared/GlassCard";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepSubjectSelectProps {
  classId: string;
  value?: string;
  selectedSubject?: string;
  onChange?: (val: string) => void;
  onSelectSubject?: (val: string) => void;
  onNext?: (classIdOverride?: string, subjectOverride?: string) => void;
}

export function StepSubjectSelect({ classId, value, selectedSubject, onChange, onSelectSubject, onNext }: StepSubjectSelectProps) {
  const subjects = CLASS_SUBJECTS[classId] || [];
  const currentValue = selectedSubject || value || "";

  const handleSelect = (subjectId: string) => {
    if (onChange) onChange(subjectId);
    if (onSelectSubject) onSelectSubject(subjectId);
    if (onNext) onNext(undefined, subjectId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold font-heading mb-2">Select Subject</h3>
        <p className="text-muted-foreground text-sm">
          Choose the subject curriculum for Class {classId}.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto pt-4">
        {subjects.map((subj) => {
          const isSelected = currentValue === subj.id;
          
          // Dynamically get the icon component
          // @ts-expect-error: Dynamically mapping string names to icons
          const Icon = Icons[subj.iconName] || Icons.BookOpen;

          return (
            <GlassCard
              key={subj.id}
              onClick={() => handleSelect(subj.id)}
              className={cn(
                "p-5 cursor-pointer text-left border flex flex-col justify-between items-start gap-4 transition-all duration-300 relative group h-36",
                isSelected
                  ? "border-blue-500/50 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                  : "border-border/40 hover:border-blue-500/25"
              )}
            >
              <div className="flex justify-between items-start w-full">
                {/* Icon Wrapper */}
                <div className={cn(
                  "p-2.5 rounded-xl flex items-center justify-center border",
                  subj.color
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                
                {/* Selection Checkmark */}
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300",
                    isSelected
                      ? "bg-blue-500 border-transparent text-white"
                      : "border-border text-transparent scale-90 group-hover:border-blue-500/30"
                  )}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <span className="text-sm font-bold font-heading block group-hover:text-blue-500 transition-colors leading-tight">
                  {subj.name}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  {subj.description}
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
