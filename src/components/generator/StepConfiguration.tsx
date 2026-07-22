"use client";

import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, Smile, Meh, Frown } from "lucide-react";

interface StepConfigurationProps {
  difficulty: "Easy" | "Medium" | "Hard";
  setDifficulty?: (val: "Easy" | "Medium" | "Hard") => void;
  onChangeDifficulty?: (val: "Easy" | "Medium" | "Hard") => void;
  language: "English" | "Hindi" | "Bilingual";
  setLanguage?: (val: "English" | "Hindi" | "Bilingual") => void;
  onChangeLanguage?: (val: "English" | "Hindi" | "Bilingual") => void;
  totalMarks: number;
  setTotalMarks?: (val: number) => void;
  onChangeTotalMarks?: (val: number) => void;
  duration: string;
  setDuration?: (val: string) => void;
  onChangeDuration?: (val: string) => void;
  subject?: string;
  isHindiSubject?: boolean;
}

export function StepConfiguration({
  difficulty,
  setDifficulty,
  onChangeDifficulty,
  language,
  setLanguage,
  onChangeLanguage,
  totalMarks,
  setTotalMarks,
  onChangeTotalMarks,
  duration,
  setDuration,
  onChangeDuration,
  subject,
  isHindiSubject: isHindiOverride,
}: StepConfigurationProps) {
  const isHindiSubjectCalculated = 
    subject === "hindi" || 
    subject === "hindi_core" || 
    subject === "hindi_elective" || 
    subject === "हिन्दी" || 
    subject === "हिन्दी कोर" || 
    subject === "हिन्दी ऐच्छिक";

  const isHindiSubject = isHindiOverride !== undefined ? isHindiOverride : isHindiSubjectCalculated;

  const handleDifficulty = (val: "Easy" | "Medium" | "Hard") => {
    if (setDifficulty) setDifficulty(val);
    if (onChangeDifficulty) onChangeDifficulty(val);
  };

  const handleLanguage = (val: "English" | "Hindi" | "Bilingual") => {
    if (setLanguage) setLanguage(val);
    if (onChangeLanguage) onChangeLanguage(val);
  };

  const handleTotalMarks = (val: number) => {
    if (setTotalMarks) setTotalMarks(val);
    if (onChangeTotalMarks) onChangeTotalMarks(val);
  };

  const handleDuration = (val: string) => {
    if (setDuration) setDuration(val);
    if (onChangeDuration) onChangeDuration(val);
  };

  // Automatically force language to Hindi if it's a Hindi subject
  useEffect(() => {
    if (isHindiSubject && language !== "Hindi") {
      handleLanguage("Hindi");
    }
  }, [isHindiSubject]);

  const difficulties: { id: "Easy" | "Medium" | "Hard"; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    { id: "Easy", label: "Easy", desc: "Basic recall & direct conceptual questions", icon: <Smile className="w-5 h-5" />, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { id: "Medium", label: "Medium", desc: "Standard CBSE/Board balanced difficulty", icon: <Meh className="w-5 h-5" />, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    { id: "Hard", label: "Hard", desc: "Advanced analytical & HOTS questions", icon: <Frown className="w-5 h-5" />, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  ];

  const languages: { id: "English" | "Hindi" | "Bilingual"; label: string; desc: string }[] = [
    { id: "English", label: "English", desc: "Standard English Medium" },
    { id: "Hindi", label: "Hindi (हिंदी)", desc: "Devanagari Script Medium" },
    { id: "Bilingual", label: "Bilingual", desc: "English & Hindi Side-by-Side" },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 1. Difficulty Selector */}
      <div className="space-y-3">
        <Label className="text-sm font-bold font-heading">1. Select Target Difficulty Level</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {difficulties.map((item) => {
            const isSelected = difficulty === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleDifficulty(item.id)}
                className={cn(
                  "p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between gap-3 bg-background/50 backdrop-blur-sm",
                  isSelected
                    ? "border-blue-500/50 bg-blue-500/5 ring-1 ring-blue-500/20 shadow-md"
                    : "border-border/40 hover:border-border/80"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-xl border shrink-0", item.color)}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-heading">{item.label}</h4>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Language Medium Selector */}
      <div className="space-y-3">
        <Label className="text-sm font-bold font-heading">
          2. Language Medium {isHindiSubject && <span className="text-xs font-normal text-amber-500">(Locked to Hindi for Hindi subjects)</span>}
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {languages.map((item) => {
            const isSelected = language === item.id;
            const isDisabled = isHindiSubject && item.id !== "Hindi";

            return (
              <div
                key={item.id}
                onClick={() => !isDisabled && handleLanguage(item.id)}
                className={cn(
                  "p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 bg-background/50 backdrop-blur-sm",
                  isDisabled
                    ? "opacity-40 cursor-not-allowed border-border/20 bg-muted/20"
                    : isSelected
                      ? "border-blue-500/50 bg-blue-500/5 ring-1 ring-blue-500/20 shadow-md cursor-pointer"
                      : "border-border/40 hover:border-border/80 cursor-pointer"
                )}
              >
                <div>
                  <h4 className="text-xs font-bold font-heading">{item.label}</h4>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Paper Duration and Total Marks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-2">
          <Label htmlFor="total-marks" className="text-xs font-bold font-heading">
            Total Paper Marks
          </Label>
          <Input
            id="total-marks"
            type="number"
            value={totalMarks}
            onChange={(e) => handleTotalMarks(Number(e.target.value))}
            min={10}
            max={100}
            className="bg-background/50 border-border/60 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration" className="text-xs font-bold font-heading">
            Allowed Exam Duration
          </Label>
          <Input
            id="duration"
            type="text"
            value={duration}
            onChange={(e) => handleDuration(e.target.value)}
            placeholder="e.g. 1.5 Hours, 3 Hours"
            className="bg-background/50 border-border/60 rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
