"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ScrollReveal } from "../shared/ScrollReveal";
import { MagneticButton } from "../shared/MagneticButton";
import { cn } from "@/lib/utils";

export function CTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Decorative glow inside */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" />

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <ScrollReveal>
          <div className="relative rounded-3xl overflow-hidden border border-border/50 bg-gradient-to-tr from-indigo-500/5 via-purple-500/5 to-slate-500/5 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900/30 backdrop-blur-xl p-12 md:p-16 text-center shadow-2xl">
            {/* Top decorative badge */}
            <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] md:text-xs font-semibold tracking-wide shadow-lg mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>START SAVING MANUAL PREPARATION HOURS</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading mb-6 tracking-tight leading-tight max-w-2xl mx-auto">
              Ready to Generate Your First CBSE Paper?
            </h2>

            {/* Subheading */}
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
              No registration required. Get 5 free high-quality paper generations per day directly in your browser.
            </p>

            {/* Action */}
            <MagneticButton>
              <Link
                href="/generate"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "rounded-full px-8 py-6 text-base font-heading font-medium tracking-wide bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 border-none inline-flex items-center justify-center gap-2"
                )}
              >
                Create Paper Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </MagneticButton>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
