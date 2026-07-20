"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, FileText, CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { MagneticButton } from "../shared/MagneticButton";
import { cn } from "@/lib/utils";

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section id="home" className="relative min-h-[92vh] flex items-center pt-28 pb-16 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/5 text-blue-400 text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(59,130,246,0.1)] mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>POWERED BY ADVANCED GEMINI AI</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-heading leading-[1.1] mb-6 text-foreground"
            >
              Generate{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(59,130,246,0.15)]">
                CBSE Question Papers
              </span>{" "}
              in Seconds
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mb-8 leading-relaxed font-normal"
            >
              Instantly create Unit Tests, Class Tests, Half Yearly, Annual, and Pre-Board question papers. Fully customized and strictly aligned with the latest CBSE curriculum.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-4 mb-10 w-full sm:w-auto"
            >
              <MagneticButton>
                <Link
                  href="/generate"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "rounded-full px-8 py-6 text-base font-heading font-medium tracking-wide bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_4px_20px_rgba(59,130,246,0.35)] hover:shadow-[0_6px_25px_rgba(59,130,246,0.5)] transition-all duration-300 border-none w-full sm:w-auto inline-flex items-center justify-center gap-2"
                  )}
                >
                  Generate Paper
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>

              <MagneticButton>
                <Link
                  href="/generate-custom"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "rounded-full px-8 py-6 text-base font-heading font-medium tracking-wide bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-[0_4px_20px_rgba(168,85,247,0.35)] hover:shadow-[0_6px_25px_rgba(168,85,247,0.5)] transition-all duration-300 border-none w-full sm:w-auto inline-flex items-center justify-center gap-2"
                  )}
                >
                  Custom AI Paper
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>

              <Link
                href="#features"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-full px-8 py-6 text-base font-heading border-border/60 hover:bg-foreground/[0.03] text-foreground/80 hover:text-foreground w-full sm:w-auto transition-all duration-300 inline-flex items-center justify-center"
                )}
              >
                Learn More
              </Link>
            </motion.div>

            {/* Trust Badges / Social Proof */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-border/50 text-sm text-muted-foreground"
            >
              <span className="font-semibold text-foreground/90">Highlights:</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero repetition</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Editable Word & PDF</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>CBSE curriculum aligned</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Right Visual (Mockup) */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 relative w-full flex justify-center"
          >
            {/* Visual background glow with subtle cursor parallax */}
            <div 
              className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/10 blur-[60px] top-1/2 left-1/2 -z-10 animate-pulse" 
              style={{
                transform: "translate3d(calc(var(--doc-mouse-percent-x, 0) * -15px - 50%), calc(var(--doc-mouse-percent-y, 0) * -15px - 50%), 0)",
              }}
            />
            
            {/* Question Paper Preview Mockup with cursor parallax */}
            <div 
              className="relative w-full max-w-[360px] md:max-w-[400px] h-[500px] rounded-3xl glass-strong border border-border/50 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden hover:scale-[1.02] hover:rotate-1 hover:shadow-[0_25px_60px_rgba(59,130,246,0.15)] transition-all duration-500 group select-none"
              style={{
                transform: "translate3d(calc(var(--doc-mouse-percent-x, 0) * 10px), calc(var(--doc-mouse-percent-y, 0) * 10px), 0)",
              }}
            >
              
              {/* Paper header decoration */}
              <div className="flex flex-col items-center border-b border-border/50 pb-4 mb-4 text-center">
                <div className="w-12 h-3 bg-foreground/10 rounded-md mb-2" />
                <div className="w-36 h-4 bg-foreground/70 rounded-md mb-3" />
                <div className="flex justify-between w-full text-[10px] text-foreground/50 px-2">
                  <div className="w-12 h-2.5 bg-foreground/10 rounded-sm" />
                  <div className="w-16 h-2.5 bg-foreground/10 rounded-sm" />
                </div>
              </div>

              {/* General Instructions */}
              <div className="space-y-1.5 mb-5">
                <div className="w-24 h-3 bg-foreground/60 rounded-sm" />
                <div className="w-full h-2 bg-foreground/10 rounded-sm" />
                <div className="w-5/6 h-2 bg-foreground/10 rounded-sm" />
              </div>

              {/* Sections & Questions */}
              <div className="space-y-5">
                {/* Section A */}
                <div className="space-y-2.5">
                  <div className="w-28 h-3.5 bg-blue-500/20 border border-blue-500/10 text-blue-400 font-semibold px-2 py-0.5 rounded text-[9px] inline-block">
                    SECTION A (MCQs)
                  </div>
                  
                  <div className="space-y-1.5 pl-1.5">
                    {/* Q1 */}
                    <div className="flex items-start gap-2">
                      <div className="text-[10px] font-bold text-foreground/50">Q1.</div>
                      <div className="flex-1 space-y-1">
                        <div className="w-11/12 h-2 bg-foreground/50 rounded-sm" />
                        <div className="w-3/4 h-2 bg-foreground/50 rounded-sm" />
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="w-5/6 h-2 bg-foreground/10 rounded-sm" />
                          <div className="w-4/5 h-2 bg-foreground/10 rounded-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section B */}
                <div className="space-y-2.5">
                  <div className="w-32 h-3.5 bg-purple-500/20 border border-purple-500/10 text-purple-400 font-semibold px-2 py-0.5 rounded text-[9px] inline-block">
                    SECTION B (Short Answers)
                  </div>
                  
                  <div className="space-y-1.5 pl-1.5">
                    {/* Q2 */}
                    <div className="flex items-start gap-2">
                      <div className="text-[10px] font-bold text-foreground/50">Q2.</div>
                      <div className="flex-1 space-y-1">
                        <div className="w-full h-2 bg-foreground/50 rounded-sm" />
                        <div className="w-5/6 h-2 bg-foreground/50 rounded-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom gradient fade overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />

              {/* Sparkle icon at bottom center */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2.5 rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/25 animate-bounce">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            {/* Little floating element with cursor parallax */}
            <div 
              className="absolute -top-6 -right-6 md:-right-8 p-3 rounded-2xl glass border border-border/50 shadow-lg flex items-center gap-3 hover:scale-105 transition-all duration-300"
              style={{
                transform: "translate3d(calc(var(--doc-mouse-percent-x, 0) * 18px), calc(var(--doc-mouse-percent-y, 0) * 18px), 0)",
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold text-foreground">AI Generation</div>
                <div className="text-[9px] text-foreground/50">100% Accurate</div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
