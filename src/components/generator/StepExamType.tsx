"use client";

import React from "react";
import * as Icons from "lucide-react";
import { EXAM_TYPES } from "@/lib/exam-types";
import { GlassCard } from "../shared/GlassCard";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepExamTypeProps {
  value: string;
  onChange: (val: string, defaultMarks: number, defaultDuration: string) => void;
  onNext: (classIdOverride?: string, subjectOverride?: string, examTypeOverride?: string) => void;
}

export function StepExamType({ value, onChange, onNext }: StepExamTypeProps) {
  const handleSelect = (id: string, defaultMarks: number, defaultDuration: string) => {
    onChange(id, defaultMarks, defaultDuration);
    onNext(undefined, undefined, id);
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold font-heading mb-2">Choose Assessment Type</h3>
        <p className="text-muted-foreground text-sm">
          Select the layout standard of the examination sheet you wish to create.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto pt-4">
        {EXAM_TYPES.map((type) => {
          const isSelected = value === type.id;
          
          // Dynamically get the icon component
          // @ts-expect-error: Dynamically mapping string names to icons
          const Icon = Icons[type.iconName] || Icons.FileText;

          return (
            <GlassCard
              key={type.id}
              onClick={() => handleSelect(type.id, type.defaultMarks, type.defaultDuration)}
              className={cn(
                "p-5 cursor-pointer text-left border flex flex-col justify-between items-start gap-4 transition-all duration-300 relative group h-44",
                isSelected
                  ? "border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                  : "border-border/40 hover:border-indigo-500/25"
              )}
            >
              <div className="flex justify-between items-start w-full">
                {/* Icon Wrapper */}
                <div className={cn(
                  "p-2.5 rounded-xl flex items-center justify-center border",
                  type.color
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
                <span className="text-sm font-bold font-heading block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-250 leading-tight mb-1">
                  {type.name}
                </span>
                <span className="text-[10px] text-muted-foreground block leading-tight">
                  {type.description}
                </span>
              </div>

              <div className="flex gap-2 mt-auto">
                <span className="text-[9px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/15">
                  {type.defaultMarks} Marks
                </span>
                <span className="text-[9px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/15">
                  {type.defaultDuration}
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
