"use client";

import React from "react";
import {
  Cpu,
  BookOpen,
  FileSpreadsheet,
  FileText,
  FileDown,
  Sliders,
  Award,
  Zap,
  Eye,
  Percent,
  Palette,
  ShieldCheck,
} from "lucide-react";
import { GlassCard } from "../shared/GlassCard";
import { ScrollReveal } from "../shared/ScrollReveal";

interface FeatureItem {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

export function Features() {
  const featuresList: FeatureItem[] = [
    {
      icon: Cpu,
      title: "AI Powered Generation",
      description: "Harness the power of our advanced AI to generate unique and highly relevant questions.",
      color: "text-violet-600 dark:text-violet-400 bg-violet-500/10 dark:bg-violet-500/5",
    },
    {
      icon: BookOpen,
      title: "CBSE Curriculum Based",
      description: "Generates questions strictly aligned with the latest CBSE syllabus for Classes 9, 10, 11, and 12.",
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/5",
    },
    {
      icon: FileSpreadsheet,
      title: "Multiple Exam Types",
      description: "Generate Class Tests, Unit Tests, Periodic Tests, Half Yearly, Annual, Pre-Board and Custom papers.",
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/5",
    },
    {
      icon: FileDown,
      title: "Editable Word Download",
      description: "Export directly to Microsoft Word (.docx) with clean, standard formatting for quick customizations.",
      color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/5",
    },
    {
      icon: FileText,
      title: "Professional PDF Download",
      description: "Get print-ready, beautifully designed PDF documents complete with instructions and marks annotation.",
      color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-500/5",
    },
    {
      icon: Sliders,
      title: "Difficulty Selection",
      description: "Fine-tune question difficulty between Easy, Medium, and Hard depending on classroom testing needs.",
      color: "text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-500/10 dark:bg-fuchsia-500/5",
    },
    {
      icon: Award,
      title: "Custom Marks & Time",
      description: "Quick marks selection (10 to 100) and duration configuration to match school examination schedules.",
      color: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 dark:bg-yellow-500/5",
    },
    {
      icon: Zap,
      title: "Instant Generation",
      description: "No more spending hours drafting test sheets. Get high-quality, comprehensive papers in under 10 seconds.",
      color: "text-sky-600 dark:text-sky-400 bg-sky-500/10 dark:bg-sky-500/5",
    },
    {
      icon: Eye,
      title: "Real-time Preview",
      description: "Check the layout, edit questions inline, or drag/reorder questions directly within the browser.",
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/5",
    },
    {
      icon: Percent,
      title: "Question Distribution",
      description: "Design specific structure configurations. Exact counts of MCQs, Short Answers, and Case Studies.",
      color: "text-teal-600 dark:text-teal-400 bg-teal-500/10 dark:bg-teal-500/5",
    },
    {
      icon: Palette,
      title: "Premium Glassmorphic UI",
      description: "A state-of-the-art visual experience with smooth animations, custom gradients, and mouse glow effects.",
      color: "text-pink-600 dark:text-pink-400 bg-pink-500/10 dark:bg-pink-500/5",
    },
    {
      icon: ShieldCheck,
      title: "Secure & Limit-based",
      description: "100% secure. No login, no databases. Generates directly via localStorage with a limit of 5 papers/day.",
      color: "text-green-600 dark:text-green-400 bg-green-500/10 dark:bg-green-500/5",
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <span>Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading mb-6 tracking-tight">
            Designed for Modern Educators
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Smart Paper Generator AI packs all the parameters and capabilities teachers need to build professional examinations in moments.
          </p>
        </ScrollReveal>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {featuresList.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal
                key={idx}
                direction="up"
                delay={idx * 0.05}
                className="h-full"
              >
                <GlassCard className="p-6 md:p-8 h-full flex flex-col items-start text-left group animate-glow">
                  {/* Icon Wrapper */}
                  <div className={`p-3 rounded-2xl ${feature.color} flex items-center justify-center mb-6 shadow-lg border border-border/50`}>
                    <Icon className="w-6 h-6 group-hover:rotate-6 transition-all duration-300" />
                  </div>
                  {/* Text */}
                  <h3 className="text-lg md:text-xl font-heading font-bold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
