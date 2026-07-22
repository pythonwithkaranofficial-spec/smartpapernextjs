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
  onChange?: (chapters: string[]) => void;
  onChaptersChange?: (chapters: string[]) => void;
}

export function StepChaptersSelect({
  classId,
  subject,
  selectedChapters = [],
  onChange,
  onChaptersChange,
}: StepChaptersSelectProps) {
  // Retrieve chapters from curriculum context
  const subjectData = CURRICULUM_DATA[classId]?.[subject];
  const chapters = subjectData?.chapters || [];

  const updateSelected = (newChapters: string[]) => {
    if (onChange) onChange(newChapters);
    if (onChaptersChange) onChaptersChange(newChapters);
  };

  const handleToggleChapter = (chapterTitle: string) => {
    if (selectedChapters.includes(chapterTitle)) {
      updateSelected(selectedChapters.filter((c) => c !== chapterTitle));
    } else {
      updateSelected([...selectedChapters, chapterTitle]);
    }
  };

  const handleSelectAll = () => {
    if (selectedChapters.length === chapters.length) {
      updateSelected([]);
    } else {
      updateSelected(chapters.map((c) => c.title));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold font-heading">
          Select Syllabus Chapters
        </h3>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Select specific units or chapters to include in your paper generator queue.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {/* Actions Bar */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-heading">
            <Layers className="w-4 h-4 text-blue-500" />
            <span>
              Selected: <strong className="text-foreground">{selectedChapters.length}</strong> of {chapters.length} Chapters
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-xl"
          >
            {selectedChapters.length === chapters.length ? "Deselect All" : "Select All"}
          </Button>
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {chapters.map((chap, index) => {
            const isSelected = selectedChapters.includes(chap.title);
            return (
              <GlassCard
                key={index}
                onClick={() => handleToggleChapter(chap.title)}
                className={cn(
                  "p-4 cursor-pointer border flex items-center justify-between gap-3 transition-all duration-300 relative group",
                  isSelected
                    ? "border-blue-500/50 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                    : "border-border/40 hover:border-blue-500/25"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-heading shrink-0 border",
                    isSelected
                      ? "bg-blue-500/15 border-blue-500/30 text-blue-500"
                      : "bg-muted border-border/50 text-muted-foreground"
                  )}>
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-heading text-foreground group-hover:text-blue-500 transition-colors">
                      {chap.title}
                    </h4>
                    {chap.weightage && (
                      <span className="text-[10px] text-muted-foreground">
                        Estimated Weightage: {chap.weightage}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300 shrink-0",
                    isSelected
                      ? "bg-blue-500 border-transparent text-white"
                      : "border-border text-transparent scale-90 group-hover:border-blue-500/30"
                  )}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
