"use client";

import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QuestionDistribution } from "@/types";
import { CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepQuestionDistProps {
  value?: QuestionDistribution;
  distribution?: QuestionDistribution;
  onChange?: (val: QuestionDistribution) => void;
  onChangeDistribution?: (val: QuestionDistribution) => void;
  targetMarks?: number;
  totalMarks?: number;
  examType?: string;
}

export function StepQuestionDist({
  value,
  distribution,
  onChange,
  onChangeDistribution,
  targetMarks,
  totalMarks,
  examType: _examType,
}: StepQuestionDistProps) {
  const currentDistribution = distribution || value || {
    mcq: 0,
    assertionReason: 0,
    vsa: 0,
    sa: 0,
    caseStudy: 0,
    la: 0,
  };

  const effectiveTotalMarks = totalMarks !== undefined ? totalMarks : (targetMarks !== undefined ? targetMarks : 40);

  const updateDistribution = (newDist: QuestionDistribution) => {
    if (onChange) onChange(newDist);
    if (onChangeDistribution) onChangeDistribution(newDist);
  };

  // Calculate current marks
  const currentMarks = 
    (currentDistribution.mcq * 1) + 
    (currentDistribution.assertionReason * 1) + 
    (currentDistribution.vsa * 2) + 
    (currentDistribution.sa * 3) + 
    (currentDistribution.caseStudy * 4) + 
    (currentDistribution.la * 5);

  const isBalanced = currentMarks === effectiveTotalMarks;

  const handleCountChange = (field: keyof QuestionDistribution, val: number) => {
    updateDistribution({
      ...currentDistribution,
      [field]: Math.max(0, val),
    });
  };

  const handleAutoBalance = () => {
    // Intelligent auto-balance strategy based on effectiveTotalMarks
    if (effectiveTotalMarks === 40) {
      updateDistribution({ mcq: 10, assertionReason: 2, vsa: 4, sa: 4, caseStudy: 2, la: 0 });
    } else if (effectiveTotalMarks === 70) {
      updateDistribution({ mcq: 16, assertionReason: 4, vsa: 5, sa: 5, caseStudy: 2, la: 3 });
    } else if (effectiveTotalMarks === 80) {
      updateDistribution({ mcq: 20, assertionReason: 4, vsa: 6, sa: 6, caseStudy: 3, la: 3 });
    } else {
      const mcqCount = Math.floor(effectiveTotalMarks * 0.3);
      const remaining = effectiveTotalMarks - mcqCount;
      const saCount = Math.floor(remaining / 3);
      const remAfterSa = remaining % 3;
      updateDistribution({
        mcq: mcqCount,
        assertionReason: 0,
        vsa: remAfterSa,
        sa: saCount,
        caseStudy: 0,
        la: 0,
      });
    }
  };

  const questionTypes: { field: keyof QuestionDistribution; title: string; marksEach: number; desc: string }[] = [
    { field: "mcq", title: "Multiple Choice (MCQ)", marksEach: 1, desc: "Single correct option out of four" },
    { field: "assertionReason", title: "Assertion & Reason", marksEach: 1, desc: "Two statement logic questions" },
    { field: "vsa", title: "Very Short Answer (VSA)", marksEach: 2, desc: "Brief 1-2 sentence answers" },
    { field: "sa", title: "Short Answer (SA)", marksEach: 3, desc: "3-4 mark conceptual explanations" },
    { field: "caseStudy", title: "Case Study / Passage", marksEach: 4, desc: "Contextual passage based questions" },
    { field: "la", title: "Long Answer (LA)", marksEach: 5, desc: "Detailed step-by-step derivations / essays" },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Status Bar */}
      <div className={cn(
        "p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300",
        isBalanced 
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          : "bg-amber-500/10 border-amber-500/30 text-amber-400"
      )}>
        <div className="flex items-center gap-3">
          {isBalanced ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <div>
            <h4 className="text-xs font-bold font-heading">
              Allocated Marks: {currentMarks} / {effectiveTotalMarks} Marks
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {isBalanced
                ? "Allocated questions perfectly match your total target marks!"
                : `Marks mismatch by ${Math.abs(effectiveTotalMarks - currentMarks)} marks. Adjust counts below.`}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAutoBalance}
          className="rounded-xl border-border/60 text-xs font-heading font-medium shrink-0 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          Auto Balance Counts
        </Button>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questionTypes.map((q) => {
          const count = currentDistribution[q.field] || 0;
          const subtotal = count * q.marksEach;

          return (
            <div
              key={q.field}
              className="p-4 rounded-2xl border border-border/40 bg-background/50 backdrop-blur-sm flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold font-heading">{q.title}</h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                    {q.marksEach} Mark{q.marksEach > 1 ? "s" : ""} each
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">{q.desc}</p>
                {count > 0 && (
                  <p className="text-[10px] text-blue-400 font-semibold pt-1">
                    Subtotal: {subtotal} Marks
                  </p>
                )}
              </div>

              <div className="w-20 shrink-0">
                <Input
                  type="number"
                  min={0}
                  max={50}
                  value={count}
                  onChange={(e) => handleCountChange(q.field, Number(e.target.value))}
                  className="text-center font-bold text-sm bg-background/80 rounded-xl border-border/60"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
