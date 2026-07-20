"use client";

import React from "react";
import { CURRICULUM_DATA } from "@/lib/curriculum-data";
import { GlassCard } from "../shared/GlassCard";
import { Check, BookOpen, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StepChaptersSelectProps {
  classId: string;
  subject: string;
  selectedChapters: string[];
  onChange: (chapters: string[]) => void;
}

export function StepChaptersSelect({
  classId,
  subject,
  selectedChapters,
  onChange,
}: StepChaptersSelectProps) {
  // Retrieve chapters from curriculum context
  const subjectData = CURRICULUM_DATA[classId]?.[subject];
  const chapters = subjectData?.chapters || [];

  const handleToggle = (chapter: string) => {
    if (selectedChapters.includes(chapter)) {
      onChange(selectedChapters.filter((c) => c !== chapter));
    } else {
      onChange([...selectedChapters, chapter]);
    }
  };

  const handleSelectAll = () => {
    onChange([...chapters]);
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  if (chapters.length === 0) {
    return (
      <div className="space-y-6 text-center max-w-lg mx-auto py-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <BookOpen className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold font-heading">No Chapters Found</h3>
          <p className="text-sm text-muted-foreground">
            No specific chapter mappings are configured for Class {classId} {subject.toUpperCase()}. You can proceed to the next step to generate questions from the general curriculum.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>Curriculum Alignment</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold font-heading mb-2">Select Syllabus Chapters</h3>
        <p className="text-muted-foreground text-sm">
          Choose one or multiple chapters to restrict the AI to generate questions strictly from these topics.
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-3 no-print">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          className="rounded-full text-xs border-border/60 hover:bg-muted/40 cursor-pointer"
        >
          Select All Chapters
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeselectAll}
          className="rounded-full text-xs border-border/60 hover:bg-muted/40 cursor-pointer"
        >
          Clear Selection
        </Button>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto pt-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
        {chapters.map((chapter) => {
          const isSelected = selectedChapters.includes(chapter);
          return (
            <GlassCard
              key={chapter}
              onClick={() => handleToggle(chapter)}
              className={cn(
                "p-4 cursor-pointer text-left border flex justify-between items-center transition-all duration-300 relative group",
                isSelected
                  ? "border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.08)]"
                  : "border-border/40 hover:border-indigo-500/25"
              )}
            >
              <div className="space-y-1 pr-4">
                <span className="text-sm font-bold font-heading block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-250 leading-snug">
                  {chapter}
                </span>
              </div>
              
              <div
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition-all duration-300",
                  isSelected
                    ? "bg-indigo-500 border-transparent text-white scale-100"
                    : "border-border text-transparent scale-90 group-hover:border-indigo-500/30"
                )}
              >
                <Check className="w-3 h-3" />
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
