import React from "react";
import { Navbar } from "@/components/shared/Navbar";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { GeneratorWizard } from "@/components/generator/GeneratorWizard";
import { Footer } from "@/components/landing/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Generate Paper Standard | Smart Paper Generator AI",
  description: "Select class, subjects, examination models, and AI question distributions to generate CBSE standard assessment sheets.",
};

export default function GeneratePage() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-7xl text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5" />
            <span>Wizard Setup</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading tracking-tight">
            Create Question Paper
          </h2>
        </div>
        <GeneratorWizard />
      </main>
      <Footer />
    </>
  );
}

// Inline custom icon for Sliders to avoid lucide imports in Server Component if needed,
// or just standard lucide sliders SVG
function Sliders(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="2" x2="6" y1="14" y2="14" />
      <line x1="10" x2="14" y1="8" y2="8" />
      <line x1="18" x2="22" y1="16" y2="16" />
    </svg>
  );
}
