"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { Footer } from "@/components/landing/Footer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Key, 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  FileUp, 
  X, 
  Loader2, 
  SlidersHorizontal,
  Check,
  BookOpen,
  School,
  User,
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function GetAnswerKeyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste");
  const [pastedText, setPastedText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputMode, setOutputMode] = useState<"questions_and_answers" | "answers_only">("questions_and_answers");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");

  // Optional paper headers
  const [schoolName, setSchoolName] = useState("");
  const [examName, setExamName] = useState("ANSWER KEY & SOLUTIONS");
  const [subject, setSubject] = useState("General / Custom");
  const [classText, setClassText] = useState("Class X");
  const [teacherName, setTeacherName] = useState("");
  const [showAdvancedHeaders, setShowAdvancedHeaders] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'docx', 'doc', 'txt'].includes(ext || '')) {
        toast.error("Unsupported file type. Please upload a .pdf, .docx, .doc, or .txt file.");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        toast.error("File size too large. Maximum file size is 15MB.");
        return;
      }
      setSelectedFile(file);
      toast.success(`Selected file: ${file.name}`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'docx', 'doc', 'txt'].includes(ext || '')) {
        toast.error("Unsupported file type. Please upload a .pdf, .docx, .doc, or .txt file.");
        return;
      }
      setSelectedFile(file);
      toast.success(`Uploaded: ${file.name}`);
    }
  };

  const handleSubmit = async () => {
    if (activeTab === "paste" && !pastedText.trim()) {
      toast.error("Please type or paste your questions into the text box.");
      return;
    }
    if (activeTab === "upload" && !selectedFile && !pastedText.trim()) {
      toast.error("Please select a file to upload or paste questions.");
      return;
    }

    setLoading(true);
    setLoadingStep("Reading and analyzing questions...");

    try {
      const formData = new FormData();
      formData.append("textInput", pastedText);
      formData.append("outputMode", outputMode);
      formData.append("schoolName", schoolName);
      formData.append("examName", examName);
      formData.append("subject", subject);
      formData.append("classText", classText);
      formData.append("teacherName", teacherName);

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      setLoadingStep("Generating step-by-step AI solutions...");

      const res = await fetch("/api/get-answer-key", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate answer key.");
      }

      setLoadingStep("Formatting interactive preview...");

      // Store in sessionStorage so PreviewPage displays it seamlessly
      sessionStorage.setItem("generated_paper", JSON.stringify(data));
      sessionStorage.setItem("last_paper_config", JSON.stringify({
        subject: data.subject,
        classId: data.classText,
        examType: data.examName,
        totalMarks: data.totalMarks,
        duration: data.timeText,
        options: {
          includeAnswerKey: true,
        }
      }));

      toast.success("Answer Key Generated Successfully!");
      router.push("/preview?mode=solutions");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred while generating solutions.";
      console.error("Answer Key Error:", err);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  const sampleQuestions = `1. What is Photosynthesis? Explain the chemical equation involved in it.
2. A ball is thrown vertically upwards with a velocity of 20 m/s. Calculate the maximum height reached by the ball. (g = 10 m/s²)
3. Solve the quadratic equation: 2x² - 7x + 3 = 0.
4. Which of the following is a non-renewable source of energy?
(a) Solar energy
(b) Wind energy
(c) Coal
(d) Hydroelectric power`;

  return (
    <>
      <AnimatedBackground />
      <Navbar />

      <main className="flex-grow pt-28 pb-32 min-h-screen">
        <ProtectedRoute>
          <div className="container mx-auto px-4 max-w-5xl space-y-8">
            
            {/* Header Title Section */}
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(16,185,129,0.15)] mb-2">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>INSTANT AI QUESTION SOLVER & ANSWER KEY GENERATOR</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading tracking-tight text-foreground">
                Get <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Answer Key</span> for Any Questions
              </h1>
              
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Type, paste, or upload Word/PDF question papers. Our AI will analyze every question, generate step-by-step solutions, and provide an editable preview ready for Word and PDF download.
              </p>
            </div>

            {/* Main Interactive Form Card */}
            <Card className="glass-strong border-border/50 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-6 sm:p-8 space-y-8">
                
                {/* Custom Tab Selector */}
                <div className="w-full">
                  <div className="grid grid-cols-2 w-full max-w-md mx-auto p-1 bg-background/80 border border-border/60 rounded-2xl h-12">
                    <button
                      type="button"
                      onClick={() => setActiveTab("paste")}
                      className={cn(
                        "rounded-xl font-heading text-xs sm:text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2",
                        activeTab === "paste"
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <FileText className="w-4 h-4" />
                      Type / Paste Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("upload")}
                      className={cn(
                        "rounded-xl font-heading text-xs sm:text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2",
                        activeTab === "upload"
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Upload className="w-4 h-4" />
                      Upload PDF / Word
                    </button>
                  </div>

                  {/* Tab 1: Paste Text */}
                  {activeTab === "paste" && (
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
                          <span>Enter or Paste Your Questions</span>
                        </Label>
                        <button
                          type="button"
                          onClick={() => setPastedText(sampleQuestions)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          Load Sample Questions
                        </button>
                      </div>

                      <Textarea
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        placeholder="Paste your questions here... (e.g. 1. Explain the theory of relativity... 2. Calculate the area of a circle...)"
                        className="min-h-[220px] rounded-2xl bg-background/50 border-border/60 focus:border-indigo-500/50 p-4 text-sm font-mono leading-relaxed"
                      />
                      
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Supports any subject, MCQs, theory, numericals, & case studies.</span>
                        {pastedText.length > 0 && (
                          <button type="button" onClick={() => setPastedText("")} className="hover:text-foreground cursor-pointer">Clear text</button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Upload File */}
                  {activeTab === "upload" && (
                    <div className="mt-6 space-y-4">
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3",
                          selectedFile
                            ? "border-emerald-500/50 bg-emerald-500/5"
                            : "border-border/60 hover:border-indigo-500/50 hover:bg-indigo-500/5"
                        )}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.docx,.doc,.txt"
                          onChange={handleFileSelect}
                          className="hidden"
                        />

                        {selectedFile ? (
                          <div className="space-y-3">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                              <FileUp className="w-7 h-7" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-base">{selectedFile.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                              }}
                              className="rounded-full text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5 mr-1" />
                              Remove File
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                              <Upload className="w-7 h-7" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-sm sm:text-base">
                                Click or Drag & Drop your Question Paper file
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Supports PDF (.pdf), Word (.docx, .doc), or Text (.txt) up to 15MB
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Preferred Output Mode Selector */}
                <div className="space-y-3 pt-4 border-t border-border/40">
                  <Label className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                    <span>Choose Output Format Preference</span>
                  </Label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setOutputMode("questions_and_answers")}
                      className={cn(
                        "p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-3 relative group",
                        outputMode === "questions_and_answers"
                          ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                          : "border-border/60 hover:border-border"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-all",
                        outputMode === "questions_and_answers" ? "border-emerald-500 bg-emerald-500 text-white" : "border-border"
                      )}>
                        {outputMode === "questions_and_answers" && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <p className="font-bold text-xs sm:text-sm font-heading">Questions + Answer Key</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Shows full question paper with detailed solutions & marking scheme under each question.
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => setOutputMode("answers_only")}
                      className={cn(
                        "p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-3 relative group",
                        outputMode === "answers_only"
                          ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                          : "border-border/60 hover:border-border"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-all",
                        outputMode === "answers_only" ? "border-emerald-500 bg-emerald-500 text-white" : "border-border"
                      )}>
                        {outputMode === "answers_only" && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <p className="font-bold text-xs sm:text-sm font-heading">Answers & Solutions Only</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Direct numbered Answer Key format for fast grading and evaluation reference.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Paper Header Customization */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedHeaders(!showAdvancedHeaders)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{showAdvancedHeaders ? "Hide Header Branding Options" : "Optional: Add School / Subject Header Branding"}</span>
                  </button>

                  {showAdvancedHeaders && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/20 border border-border/40 animate-in fade-in">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                          <School className="w-3.5 h-3.5 text-blue-400" />
                          School Name
                        </Label>
                        <Input
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          placeholder="e.g. DELHI PUBLIC SCHOOL"
                          className="h-9 text-xs rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                          Subject Name
                        </Label>
                        <Input
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="e.g. Science / Mathematics"
                          className="h-9 text-xs rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                          Class
                        </Label>
                        <Input
                          value={classText}
                          onChange={(e) => setClassText(e.target.value)}
                          placeholder="e.g. Class 10th"
                          className="h-9 text-xs rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-cyan-400" />
                          Teacher Name
                        </Label>
                        <Input
                          value={teacherName}
                          onChange={(e) => setTeacherName(e.target.value)}
                          placeholder="e.g. Dr. A. Sharma"
                          className="h-9 text-xs rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Submit Button */}
                <div className="pt-4">
                  <Button
                    type="button"
                    disabled={loading}
                    onClick={handleSubmit}
                    className="w-full py-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-heading font-bold text-base shadow-[0_4px_25px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_30px_rgba(16,185,129,0.5)] transition-all duration-300 border-none cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{loadingStep || "Generating Answers..."}</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-5 h-5" />
                        <span>Get Answer Key & Detailed Solutions</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>

              </CardContent>
            </Card>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-5 rounded-2xl glass border border-border/40 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-sm">100% Accurate Step Solutions</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Generates precise answers, formulas, MCQ reasoning, and CBSE step marking scheme for every question.
                </p>
              </div>

              <div className="p-5 rounded-2xl glass border border-border/40 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-sm">Inline Preview & Editing</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Review and edit any question or answer text inline in the interactive preview screen before exporting.
                </p>
              </div>

              <div className="p-5 rounded-2xl glass border border-border/40 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                  <DownloadIcon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-sm">Word & PDF Exports</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Export your solutions to clean, professionally formatted Word (.docx) and PDF documents with 1 click.
                </p>
              </div>
            </div>

          </div>
        </ProtectedRoute>
      </main>

      <Footer />
    </>
  );
}

function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
