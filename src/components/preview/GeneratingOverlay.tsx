"use client";

import React, { useEffect, useState } from "react";
import { Brain } from "lucide-react";

export function GeneratingOverlay() {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    "Analyzing paper parameters and CBSE guidelines...",
    "Securing connection to our AI model...",
    "Drafting curriculum-aligned Section A questions...",
    "Structuring Section B short-answer descriptors...",
    "Formulating analytical Section C Case Study questions...",
    "Aligning questions to target difficulty levels...",
    "Validating marks distributions...",
    "Finalizing printable paper layout formatting..."
  ];

  const teacherQuotes = [
    "Teachers spend an average of 4 hours drafting a single exam sheet.",
    "A structured curriculum improves learning retention by 15%.",
    "Bilingual assessments help students build vocabulary in both languages.",
    "CBSE guidelines recommend balancing HOTS and recall questions.",
    "Our AI compiles questions in seconds, preserving academic quality."
  ];

  const [activeQuote, setActiveQuote] = useState(0);

  useEffect(() => {
    // Increment steps
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 1800);

    // Progress bar simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 96) return prev + 1;
        return prev;
      });
    }, 120);

    // Rotate teacher quotes
    const quoteInterval = setInterval(() => {
      setActiveQuote((prev) => (prev + 1) % teacherQuotes.length);
    }, 4500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearInterval(quoteInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#070B14]/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      {/* Visual background glows */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[110px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute w-[350px] h-[350px] rounded-full bg-purple-600/10 blur-[90px] top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        
        {/* Animated Icon Ring */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping duration-1000 opacity-60" />
          <div className="absolute -inset-2 rounded-full border border-purple-500/10 animate-pulse" />
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] text-white border border-white/10">
            <Brain className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        {/* Text Headers */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold font-heading text-white">Generating Question Paper</h3>
          <p className="text-xs text-cyan-400 uppercase tracking-widest font-bold font-heading animate-pulse">
            AI ENGINE COMPILING CONTENT
          </p>
        </div>

        {/* Steps display list */}
        <div className="bg-white/[0.04] border border-white/8 p-6 rounded-2xl text-left min-h-[110px] flex items-center shadow-2xl backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 mt-0.5 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-relaxed text-white">
                {steps[stepIndex]}
              </p>
              <p className="text-[10px] text-white/50 mt-1">
                Completed {stepIndex} of {steps.length} steps
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 text-left">
          <div className="flex justify-between text-xs font-semibold text-white/60 font-heading">
            <span>Overall Compilation Progress</span>
            <span className="text-cyan-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Classroom Quotes / Tip Banner */}
        <div className="pt-6 border-t border-white/8 text-center animate-in fade-in duration-500">
          <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase font-heading block mb-1">
            Teacher Fact
          </span>
          <p className="text-xs text-white/60 max-w-xs mx-auto leading-relaxed italic">
            &ldquo;{teacherQuotes[activeQuote]}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
