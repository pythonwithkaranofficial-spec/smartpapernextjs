import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { Footer } from "@/components/landing/Footer";
import { GlassCard } from "@/components/shared/GlassCard";
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  Cpu, 
  Cookie, 
  Mail, 
  ArrowLeft, 
  Eye, 
  Server, 
  CheckCircle2 
} from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Smart Paper AI",
  description: "Privacy Policy for Smart Paper AI - Learn how we collect, protect, and use your data.",
};

export default function PrivacyPolicyPage() {
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
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Data Protection & Transparency
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight text-foreground">
              Privacy <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              At Smart Paper AI, we prioritize the privacy and security of educators, school teachers, and students. This policy outlines how we handle your information.
            </p>
          </div>

          {/* Main Privacy Content Cards */}
          <div className="space-y-6">

            {/* 1. Introduction & Overview */}
            <GlassCard className="p-6 sm:p-8 border-border/50 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400 font-heading font-bold text-lg">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Eye className="w-5 h-5" />
                </div>
                <span>1. Overview & Commitment</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Smart Paper AI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates as an AI-powered question paper generator specifically tailored for CBSE Class 9 to 12 curricula. We are committed to transparency in how data is processed, ensuring that school educators can generate examination material safely without exposing sensitive student or institution data.
              </p>
            </GlassCard>

            {/* 2. Information We Collect */}
            <GlassCard className="p-6 sm:p-8 border-border/50 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400 font-heading font-bold text-lg">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Database className="w-5 h-5" />
                </div>
                <span>2. Information We Collect</span>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>We collect minimal information necessary to deliver and improve our question paper generation service:</p>
                <ul className="list-disc pl-5 space-y-2 text-foreground/90">
                  <li>
                    <strong className="text-indigo-400">Account Credentials (Optional):</strong> When you sign in via Google or Firebase Authentication, we store your name, email address, and profile picture to maintain your generation history and daily usage quota.
                  </li>
                  <li>
                    <strong className="text-indigo-400">Paper Customization Inputs:</strong> Data entered during wizard steps (Class ID, Subject, Chapter selections, total marks, difficulty level, school name, and teacher name) are used exclusively to construct the paper configuration.
                  </li>
                  <li>
                    <strong className="text-indigo-400">Technical & Rate-Limiting Data:</strong> IP addresses and timestamps are recorded in temporary server logs to enforce daily generation limits (e.g. 5 papers per day) and prevent malicious bot abuse.
                  </li>
                </ul>
              </div>
            </GlassCard>

            {/* 3. AI Processing & Third-Party Services */}
            <GlassCard className="p-6 sm:p-8 border-border/50 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400 font-heading font-bold text-lg">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Cpu className="w-5 h-5" />
                </div>
                <span>3. AI Generation & Google Gemini API</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Question paper contents are generated using Google&apos;s Gemini AI API. When you generate a paper, only academic directives (class level, subject, list of chapters, mark distribution) are transmitted to the AI endpoint. <strong className="text-foreground">No personal email addresses or private passwords are sent to third-party AI models.</strong>
              </p>
            </GlassCard>

            {/* 4. Local Storage & Session Management */}
            <GlassCard className="p-6 sm:p-8 border-border/50 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400 font-heading font-bold text-lg">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Cookie className="w-5 h-5" />
                </div>
                <span>4. Cookies & Local Storage</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use browser <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded font-mono text-xs">localStorage</code> and <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded font-mono text-xs">sessionStorage</code> to store your in-progress form selections and save your generated paper history locally on your device. This allows instant offline retrieval without requiring continuous server queries.
              </p>
            </GlassCard>

            {/* 5. Data Security & Storage */}
            <GlassCard className="p-6 sm:p-8 border-border/50 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400 font-heading font-bold text-lg">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Lock className="w-5 h-5" />
                </div>
                <span>5. Data Security Measures</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All client-server communications are protected using end-to-end HTTPS/TLS encryption. User authentication is secured via Firebase Authentication protocols. Database history for signed-in users is maintained using encrypted database tokens.
              </p>
            </GlassCard>

            {/* 6. User Rights & Data Deletion */}
            <GlassCard className="p-6 sm:p-8 border-border/50 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400 font-heading font-bold text-lg">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Server className="w-5 h-5" />
                </div>
                <span>6. Your Rights & Data Control</span>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>As a user, you retain full rights over your data:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-background/60 border border-border/50 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Clear local paper history directly from your browser settings at any time.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-background/60 border border-border/50 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Sign out of your account to clear session credentials and tokens.</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* 7. Contact Information */}
            <GlassCard className="p-6 sm:p-8 border-indigo-500/30 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400 font-heading font-bold text-lg">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Mail className="w-5 h-5" />
                </div>
                <span>7. Contact & Privacy Inquiries</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you have questions or concerns regarding this Privacy Policy or wish to request data removal, please contact the administrator:
              </p>
              <div className="p-4 rounded-xl bg-background/80 border border-border/50 inline-block font-mono text-xs text-foreground">
                Email: <a href="mailto:tpaofficial1999@gmail.com" className="text-indigo-400 hover:underline">tpaofficial1999@gmail.com</a> (Karan Sir)
              </div>
            </GlassCard>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
