"use client";

import React from "react";
import { User, Target, Lightbulb, Compass, Sparkles, ExternalLink } from "lucide-react";
import { GlassCard } from "../shared/GlassCard";
import { ScrollReveal } from "../shared/ScrollReveal";

export function About() {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <span>About</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading mb-6 tracking-tight">
            Who Behind the Project?
          </h2>
        </ScrollReveal>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-stretch">
          
          {/* Developer Card (Left side) */}
          <div className="lg:col-span-5">
            <ScrollReveal direction="left" className="h-full">
              <GlassCard className="p-8 h-full flex flex-col justify-between border-primary/20 dark:border-primary/10 relative overflow-hidden group">
                {/* Decorative glow inside */}
                <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/10 blur-[40px] pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                
                <div>
                  {/* Icon profile */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/20 border border-white/15">
                    <User className="w-7 h-7" />
                  </div>
                  
                  {/* Title & Bio */}
                  <h3 className="text-2xl font-heading font-extrabold mb-1">
                    <a
                      href="https://seminarkaran.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group/name cursor-pointer"
                    >
                      <span>Karan Saini</span>
                      <ExternalLink className="w-4 h-4 opacity-60 group-hover/name:opacity-100 transition-opacity" />
                    </a>
                  </h3>
                  <p className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold tracking-wide uppercase mb-6">Computer Teacher & Developer</p>
                  
                  <blockquote className="text-muted-foreground italic mb-6 leading-relaxed border-l-2 border-indigo-500 pl-4">
                    &ldquo;As an educator, I understand how many hours teachers spend manually drafting testing sheets, designing unique questions, and cross-referencing syllabi. I built Smart Paper Generator AI to simplify this workload, giving teachers hours back for what matters most: helping students succeed.&rdquo;
                  </blockquote>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-6 border-t border-border/40">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                  <span>Empowering teachers with ethical, syllabus-accurate AI tools.</span>
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>

          {/* Mission / Vision / Value Cards (Right side) */}
          <div className="lg:col-span-7 flex flex-col gap-6 justify-between">
            {/* Card 1: Mission */}
            <ScrollReveal direction="right" delay={0.1}>
              <GlassCard className="p-6 flex gap-5 items-start text-left">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-heading font-bold mb-2">Our Mission</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    To make class testing and assessment creation seamless. By leveraging advanced AI, we generate high-quality questions in seconds, matching standard CBSE boards.
                  </p>
                </div>
              </GlassCard>
            </ScrollReveal>

            {/* Card 2: Vision */}
            <ScrollReveal direction="right" delay={0.2}>
              <GlassCard className="p-6 flex gap-5 items-start text-left">
                <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/15 text-violet-600 dark:text-violet-400">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-heading font-bold mb-2">Our Vision</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    To be the go-to smart assistant for school teachers, tutoring centers, and educational bodies, helping reduce prep times from days to seconds while keeping questions original.
                  </p>
                </div>
              </GlassCard>
            </ScrollReveal>

            {/* Card 3: Values / Why This Exists */}
            <ScrollReveal direction="right" delay={0.3}>
              <GlassCard className="p-6 flex gap-5 items-start text-left">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-heading font-bold mb-2">Why This Exists</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Testing shouldn&apos;t be tedious. By using server-side prompts pre-programmed with CBSE guidelines, we ensure quality control so educators don&apos;t have to study prompt engineering.
                  </p>
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>
          
        </div>
      </div>
    </section>
  );
}
