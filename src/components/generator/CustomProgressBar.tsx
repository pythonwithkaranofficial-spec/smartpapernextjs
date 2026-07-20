import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
}

export function CustomProgressBar({ currentStep }: ProgressBarProps) {
  const steps = [
    { label: "Class", step: 1 },
    { label: "Subject", step: 2 },
    { label: "Chapters", step: 3 },
    { label: "Exam Type", step: 4 },
    { label: "Config", step: 5 },
    { label: "Structure", step: 6 },
    { label: "Options", step: 7 },
  ];

  // Calculate width percentage
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full py-4 mb-8">
      {/* Visual steps line */}
      <div className="relative flex items-center justify-between w-full">
        {/* Background track line */}
        <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-border -translate-y-1/2 -z-10" />
        
        {/* Fill progress track line */}
        <div 
          className="absolute left-0 top-1/2 h-[2.5px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 -translate-y-1/2 -z-10 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />

        {steps.map((item) => {
          const isActive = item.step === currentStep;
          const isCompleted = item.step < currentStep;
          
          return (
            <div key={item.step} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-heading text-xs font-semibold border transition-all duration-300",
                  isCompleted 
                    ? "bg-gradient-to-tr from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_0_15px_rgba(99,102,241,0.25)]" 
                    : isActive
                      ? "bg-background border-indigo-500 text-indigo-500 ring-4 ring-indigo-500/10 font-bold"
                      : "bg-background border-border text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <span>{item.step}</span>
                )}
              </div>
              
              <span 
                className={cn(
                  "text-[10px] sm:text-xs font-medium font-heading transition-colors duration-300 hidden sm:block",
                  isActive ? "text-indigo-600 dark:text-indigo-400 font-bold" : isCompleted ? "text-foreground/80" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
