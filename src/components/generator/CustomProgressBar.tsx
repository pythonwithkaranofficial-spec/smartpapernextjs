import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
}

export function CustomProgressBar({ currentStep, totalSteps = 7, onStepClick }: ProgressBarProps) {
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
  const progressPercent = ((currentStep - 1) / ((totalSteps || steps.length) - 1)) * 100;

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
          const isClickable = Boolean(onStepClick);
          
          return (
            <button 
              key={item.step} 
              type="button"
              onClick={() => onStepClick?.(item.step)}
              disabled={!isClickable}
              className={cn(
                "flex flex-col items-center group outline-none select-none transition-transform duration-200",
                isClickable ? "cursor-pointer" : "cursor-default"
              )}
              title={`Step ${item.step}: ${item.label}`}
              aria-label={`Go to step ${item.step}: ${item.label}`}
            >
              {/* Step indicator circle */}
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-heading transition-all duration-300 shadow-sm",
                  isCompleted 
                    ? "bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-indigo-500/20 group-hover:scale-110" 
                    : isActive 
                      ? "bg-background border-2 border-purple-500 text-purple-400 ring-4 ring-purple-500/15 scale-110 shadow-lg" 
                      : "bg-muted border border-border text-muted-foreground group-hover:border-purple-400/50 group-hover:scale-105"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  item.step
                )}
              </div>

              {/* Step label text */}
              <span 
                className={cn(
                  "text-[11px] font-heading font-medium mt-2 transition-colors duration-300 hidden sm:block",
                  isActive 
                    ? "text-purple-400 font-semibold" 
                    : isCompleted 
                      ? "text-foreground/80 group-hover:text-purple-400" 
                      : "text-muted-foreground/60 group-hover:text-foreground"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
