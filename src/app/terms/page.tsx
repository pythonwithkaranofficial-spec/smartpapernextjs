import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { Footer } from "@/components/landing/Footer";
import { GlassCard } from "@/components/shared/GlassCard";
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  BookOpen, 
  Zap, 
  Copyright, 
  ShieldAlert, 
  ArrowLeft,
  Mail
} from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | Smart Paper AI",
  description: "Terms and Conditions of Service for Smart Paper AI question paper generator.",
};

export default function TermsPage() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      
      <main className="min-h-screen pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          
          {/* Top Breadcrumb & Navigation */}
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-indigo-500 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Home
            </Link>
            <span className="text-xs text-muted-foreground bg-secondary/60 px-3 py-1 rounded-full border border-border/50 font-mono">
              Last Updated: July 2026
            </span>
          </div>

          {/* Page Header */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Scale className="w-4 h-4 text-indigo-400" />
              Terms & Operational Policy
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight text-foreground">
              Terms & <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Conditions</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Please read these Terms and Conditions carefully before using the Smart Paper AI platform for question paper generation.
            </p>
          </div>

          {/* Main Terms Content Cards */}
          <div className="space-y-6">

            {/* 1. Acceptance of Terms */}
            <GlassCard className="p-6 sm:p-8 border-border/50 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400 font-heading font-bold text-lg">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span>1. Acceptance of Terms</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By accessing, browsing, or using Smart Paper AI (&quot;the Platform&quot;), you confirm that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must discontinue use of the Platform immediately.
              </p>
            </GlassCard>

            {/* 2. Description of Service */}
            <GlassCard className="p-6 sm:p-8 border-border/50 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400 font-heading font-bold text-lg">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span>2. Scope & Description of Service</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Smart Paper AI provides automated tools for school teachers, tutors, and coaching institutions to generate CBSE-compliant examination question papers for Classes 9, 10, 11, and 12 across various core and elective subjects. The Platform offers web preview, PDF generation, and Word (.docx) export features.
              </p>
            </GlassCard>

            {/* 3. Daily Usage Quota & Fair Use */}
            <GlassCard className="p-6 sm:p-8 border-border/50 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400 font-heading font-bold text-lg">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Zap className="w-5 h-5" />
                </div>
                <span>3. Daily Generation Limits & Fair Use Policy</span>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>To ensure fair availability and maintain server performance for all educators, the Platform enforces daily usage quotas:</p>
                <ul className="list-disc pl-5 space-y-2 text-foreground/90">
                  <li>Standard accounts and anonymous visitors are subject to a daily limit of <strong className="text-indigo-400">5 question papers per 24-hour window</strong>.</li>
                  <li>Automated scraping, bulk generation scripts, or attempts to bypass rate limiters using IP proxies are strictly prohibited and may result in permanent IP blocks.</li>
                </ul>
              </div>
            </GlassCard>

            {/* 4. Intellectual Property & Ownership */}
            <GlassCard className="p-6 sm:p-8 border-border/50 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400 font-heading font-bold text-lg">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Copyright className="w-5 h-5" />
                </div>
                <span>4. Intellectual Property & Rights to Generated Papers</span>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>Ownership of generated educational assets is structured as follows:</p>
                <ul className="list-disc pl-5 space-y-2 text-foreground/90">
                  <li>
                    <strong className="text-indigo-400">Your Generated Papers:</strong> Educators and institutions retain full rights to use, edit, print, distribute, and conduct tests using question papers generated through their session.
                  </li>
                  <li>
                    <strong className="text-indigo-400">Platform Ownership:</strong> Smart Paper AI retains all intellectual property rights over the software source code, branding, custom UI components, algorithms, and prompt templates.
                  </li>
                </ul>
              </div>
            </GlassCard>

            {/* 5. Educational Disclaimer & Accuracy */}
            <GlassCard className="p-6 sm:p-8 border-border/50 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400 font-heading font-bold text-lg">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span>5. Educational Accuracy Disclaimer</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                While Smart Paper AI utilizes official CBSE 2026 blueprint data and advanced AI models to ensure question accuracy, <strong className="text-foreground">educators are advised to review and verify all generated questions, figures, and internal choices prior to administering final examinations</strong>. The Platform is an aid for teachers, not a substitute for professional academic verification.
              </p>
            </GlassCard>

            {/* 6. Limitation of Liability */}
            <GlassCard className="p-6 sm:p-8 border-border/50 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400 font-heading font-bold text-lg">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span>6. Limitation of Liability</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind. Smart Paper AI shall not be held liable for any indirect, incidental, or consequential damages resulting from AI generation delays, minor syllabus discrepancies, or server downtime.
              </p>
            </GlassCard>

            {/* 7. Modifications & Support */}
            <GlassCard className="p-6 sm:p-8 border-indigo-500/30 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400 font-heading font-bold text-lg">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Mail className="w-5 h-5" />
                </div>
                <span>7. Modifications & Inquiries</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time to reflect updates in CBSE guidelines or platform capabilities. Continued use of the platform constitutes acceptance of revised terms.
              </p>
              <div className="p-4 rounded-xl bg-background/80 border border-border/50 inline-block font-mono text-xs text-foreground">
                Support Email: <a href="mailto:tpaofficial1999@gmail.com" className="text-indigo-400 hover:underline">tpaofficial1999@gmail.com</a> (Karan Sir)
              </div>
            </GlassCard>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
