"use client";

import React from "react";
import { ClipboardList, BookOpen, Layers, Settings, Cpu, ArrowDownToLine } from "lucide-react";
import { ScrollReveal } from "../shared/ScrollReveal";

interface Step {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

export function HowItWorks() {
  const steps: Step[] = [
    {
      number: "01",
      icon: ClipboardList,
      title: "Select Class",
      description: "Choose CBSE Class 9, 10, 11, or 12 to filter appropriate subject options.",
      color: "from-blue-500 to-indigo-500",
    },
    {
      number: "02",
      icon: BookOpen,
      title: "Pick Subject",
      description: "Select from core subjects like Science, Maths, AI, Computer Science, or Accountancy.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      number: "03",
      icon: Layers,
      title: "Choose Exam Type",
      description: "Select assessment formats like Periodic Tests, Half Yearly, or Sample Board Papers.",
      color: "from-purple-500 to-pink-500",
    },
    {
      number: "04",
      icon: Settings,
      title: "Configure Paper",
      description: "Configure difficulty, total marks, duration, and question distribution.",
      color: "from-amber-500 to-orange-500",
    },
    {
      number: "05",
      icon: Cpu,
      title: "AI Generates",
      description: "Our advanced AI compiles syllabus-relevant questions aligned to CBSE standards.",
      color: "from-violet-500 to-indigo-500",
    },
    {
      number: "06",
      icon: ArrowDownToLine,
      title: "Download Document",
      description: "Preview questions, edit details inline, and download in editable Word or PDF formats.",
      color: "from-rose-500 to-red-500",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-muted/10 relative overflow-hidden">
      {/* Background decoration lines */}
      <div className="absolute inset-0 pointer-events-none -z-10 opacity-30 dark:opacity-10">
        <div className="absolute top-[20%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute bottom-[20%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <span>Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading mb-6 tracking-tight">
            How It Works
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Create standard CBSE exam sheets in less than a minute. Let AI do the heavy lifting of question compilation.
          </p>
        </ScrollReveal>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <ScrollReveal
                key={idx}
                direction="up"
                delay={idx * 0.08}
                className="relative"
              >
                {/* Visual Connector Line for Desktop */}
                {idx < 5 && (
                  <div className="hidden lg:block absolute top-12 left-[80%] w-[40%] h-[2px] bg-gradient-to-r from-indigo-500/50 to-transparent z-0 pointer-events-none" />
                )}
                
                <div className="relative flex flex-col items-start p-6 md:p-8 rounded-2xl glass border border-border/40 hover:border-indigo-500/20 bg-background/40 backdrop-blur-md transition-all duration-300 z-10 group h-full">
                  {/* Top line with Number and Icon */}
                  <div className="flex items-center justify-between w-full mb-6">
                    <span className="text-4xl md:text-5xl font-heading font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent opacity-85 group-hover:scale-105 transition-transform duration-300">
                      {step.number}
                    </span>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${step.color} flex items-center justify-center text-white shadow-lg shadow-primary/10 group-hover:rotate-6 transition-all duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg md:text-xl font-heading font-bold mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
