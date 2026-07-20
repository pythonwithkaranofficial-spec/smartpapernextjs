"use client";

import React from "react";
import { GlassCard } from "../shared/GlassCard";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepClassSelectProps {
  value: string;
  onChange: (val: string) => void;
  onNext: (classId: string) => void;
}

export function StepClassSelect({ value, onChange, onNext }: StepClassSelectProps) {
  const classes = [
    { id: "9", label: "Class 9", desc: "Secondary School Curriculum" },
    { id: "10", label: "Class 10", desc: "Board Exam Preparation" },
    { id: "11", label: "Class 11", desc: "Senior Secondary Foundation" },
    { id: "12", label: "Class 12", desc: "Senior Board Exam Standards" },
  ];

  const handleSelect = (id: string) => {
    onChange(id);
    onNext(id);
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold font-heading mb-2">Select Target Class</h3>
        <p className="text-muted-foreground text-sm">
          Select the class standard you are compiling the question paper for.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-4">
        {classes.map((cls) => {
          const isSelected = value === cls.id;
          return (
            <GlassCard
              key={cls.id}
              onClick={() => handleSelect(cls.id)}
              className={cn(
                "p-6 cursor-pointer text-left border flex justify-between items-center transition-all duration-300 relative group",
                isSelected
                  ? "border-indigo-500/50 bg-indigo-500/5 dark:bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                  : "border-border/40 hover:border-indigo-500/25"
              )}
            >
              <div className="space-y-1">
                <span className="text-lg font-bold font-heading block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-250">
                  {cls.label}
                </span>
                <span className="text-xs text-muted-foreground block">{cls.desc}</span>
              </div>
              
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300",
                  isSelected
                    ? "bg-indigo-500 border-transparent text-white scale-100"
                    : "border-border text-transparent scale-90 group-hover:border-indigo-500/30"
                )}
              >
                <Check className="w-3.5 h-3.5" />
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
