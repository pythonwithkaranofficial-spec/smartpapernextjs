"use client";

import React, { useState } from "react";
import { GeneratedPaper } from "@/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { FileText, FileDown, Printer, Clipboard, Check, RotateCcw, Home } from "lucide-react";
import { toast } from "sonner";
import { generatePDF } from "@/lib/pdf-generator";
import { generateDOCX } from "@/lib/docx-generator";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DownloadBarProps {
  paper: GeneratedPaper;
  onRegenerate: () => void;
}

export function DownloadBar({ paper, onRegenerate }: DownloadBarProps) {
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingDOCX, setDownloadingDOCX] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    const toastId = toast.loading("Creating PDF document...");
    try {
      await generatePDF(paper);
      toast.success("PDF Downloaded Successfully", { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF. Please try again.", { id: toastId });
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDownloadDOCX = async () => {
    setDownloadingDOCX(true);
    const toastId = toast.loading("Compiling Word Document...");
    try {
      await generateDOCX(paper);
      toast.success("Word Downloaded Successfully", { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error("Failed to compile Word Document. Please try again.", { id: toastId });
    } finally {
      setDownloadingDOCX(false);
    }
  };

  const handleCopyText = () => {
    try {
      // Build plain text of the paper
      let text = "";
      if (paper.schoolName) text += `${paper.schoolName}\n`;
      text += `${paper.examName}\n`;
      text += `Subject: ${paper.subject} | Class: ${paper.classText}\n`;
      text += `Time Allowed: ${paper.timeText} | Max Marks: ${paper.maxMarksText}\n`;
      text += `-----------------------------------------------\n\n`;

      if (paper.instructions.length > 0) {
        text += `General Instructions:\n`;
        paper.instructions.forEach((ins) => {
          text += `- ${ins}\n`;
        });
        text += `\n`;
      }

      paper.sections.forEach((sec) => {
        if (sec.questions.length === 0) return;
        text += `${sec.name} — ${sec.description}\n`;
        text += `===============================================\n`;
        sec.questions.forEach((q) => {
          text += `${q.number}. ${q.text} [${q.marks} Marks]\n`;
          if (q.choices && q.choices.length > 0) {
            q.choices.forEach((choice, idx) => {
              text += `   (${String.fromCharCode(97 + idx)}) ${choice}\n`;
            });
          }
          if (q.orQuestion) {
            text += `   [OR]\n`;
            text += `   ${q.orQuestion}\n`;
          }
          text += `\n`;
        });
        text += `\n`;
      });

      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Questions copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast.error("Failed to copy. Please copy manually.");
    }
  };

  return (
    <div className="no-print fixed bottom-0 left-0 right-0 py-4 border-t border-border/40 glass bg-background/55 backdrop-blur-lg z-30 shadow-[0_-5px_25px_-10px_rgba(0,0,0,0.15)]">
      <div className="container mx-auto px-4 max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Paper details summary */}
        <div className="text-center sm:text-left">
          <span className="text-xs text-muted-foreground uppercase tracking-widest block font-heading">
            Previewing Document
          </span>
          <span className="text-sm font-bold block mt-0.5">
            {paper.subject} | {paper.classText} Standard ({paper.totalQuestions} Questions)
          </span>
        </div>

        {/* Action button triggers */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyText}
            className="rounded-full border-border/60 hover:bg-muted/40 cursor-pointer h-9 px-4 text-xs font-heading font-medium"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Clipboard className="w-3.5 h-3.5 mr-1.5" />
                Copy Text
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="rounded-full border-border/60 hover:bg-muted/40 cursor-pointer h-9 px-4 text-xs font-heading font-medium"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print Paper
          </Button>

          <Button
            disabled={downloadingDOCX}
            onClick={handleDownloadDOCX}
            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md cursor-pointer h-9 px-4 text-xs font-heading font-medium border-none"
          >
            <FileDown className="w-3.5 h-3.5 mr-1.5" />
            {downloadingDOCX ? "Downloading..." : "Download Word"}
          </Button>

          <Button
            disabled={downloadingPDF}
            onClick={handleDownloadPDF}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/10 cursor-pointer h-9 px-4 text-xs font-heading font-medium border-none"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            {downloadingPDF ? "Downloading..." : "Download PDF"}
          </Button>

          <div className="w-[1px] h-6 bg-border hidden sm:block mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            className="rounded-full text-muted-foreground hover:text-foreground cursor-pointer h-9 px-3.5 text-xs font-heading font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Re-generate
          </Button>

          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "rounded-full text-muted-foreground hover:text-foreground cursor-pointer h-9 px-3.5 text-xs font-heading font-medium inline-flex items-center justify-center gap-1.5"
            )}
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>

        </div>
      </div>
    </div>
  );
}
