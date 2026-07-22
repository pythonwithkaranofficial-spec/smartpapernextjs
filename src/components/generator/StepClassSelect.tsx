"use client";

import React from "react";
import { GlassCard } from "../shared/GlassCard";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepClassSelectProps {
  value?: string;
  selectedClass?: string;
  onChange?: (val: string) => void;
  onSelectClass?: (val: string) => void;
  onNext?: (classId: string) => void;
}

export function StepClassSelect({ value, selectedClass, onChange, onSelectClass, onNext }: StepClassSelectProps) {
  const currentValue = selectedClass || value || "";

  const classes = [
    { id: "9", label: "Class 9", desc: "Secondary School Curriculum" },
    { id: "10", label: "Class 10", desc: "Board Exam Preparation" },
    { id: "11", label: "Class 11", desc: "Senior Secondary Foundation" },
    { id: "12", label: "Class 12", desc: "Senior Board Exam Standards" },
  ];

  const handleSelect = (id: string) => {
    if (onChange) onChange(id);
    if (onSelectClass) onSelectClass(id);
    if (onNext) onNext(id);
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold font-heading mb-2">Select Target Class</h3>
        <p className="text-muted-foreground text-sm">
          Choose the educational standard for which you want to generate the question paper.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-4">
        {classes.map((cls) => {
          const isSelected = currentValue === cls.id;
          return (
            <GlassCard
              key={cls.id}
              onClick={() => handleSelect(cls.id)}
              className={cn(
                "p-6 cursor-pointer text-left border flex flex-col justify-between items-start gap-4 transition-all duration-300 relative group h-40",
                isSelected
                  ? "border-blue-500/50 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                  : "border-border/40 hover:border-blue-500/25"
              )}
            >
              <div className="flex justify-between items-start w-full">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-blue-500 transition-colors">
                  Standard
                </span>
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
                <h4 className="text-lg font-bold font-heading group-hover:text-blue-500 transition-colors">
                  {cls.label}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">{cls.desc}</p>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
