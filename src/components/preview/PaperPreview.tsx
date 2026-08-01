"use client";

import React, { useState } from "react";
import { GeneratedPaper } from "@/types";
import { Trash2, Edit2, Check, ArrowUp, ArrowDown, ZoomIn, ZoomOut, Printer, Key, FileText, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { formatScientificText, cleanInstructionText } from "@/lib/utils";
import { toast } from "sonner";

interface PaperPreviewProps {
  paper: GeneratedPaper;
  onChange: (updatedPaper: GeneratedPaper) => void;
  onSelectSet?: (setIdx: number) => void;
  activeSetIdx?: number;
  initialViewMode?: "paper" | "solutions";
}

export function PaperPreview({ paper, onChange, onSelectSet, activeSetIdx = 0, initialViewMode }: PaperPreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState<"paper" | "solutions">(
    initialViewMode || (paper.hasAnswerKey && (paper.examName?.includes("ANSWER KEY") || (paper as unknown as Record<string, unknown>).outputMode === "answers_only") ? "solutions" : "paper")
  );
  const [editingField, setEditingField] = useState<{ type: "header" | "instruction" | "question" | "solution"; id?: string; index?: number } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editChoices, setEditChoices] = useState<string[]>([]);
  const [swappingId, setSwappingId] = useState<string | null>(null);

  const activePaper = (paper.sets && paper.sets.length > 0 && paper.sets[activeSetIdx]) ? paper.sets[activeSetIdx] : paper;

  const handleSwapQuestion = async (qToSwap: any) => {
    setSwappingId(qToSwap.id);
    const toastId = toast.loading(`Generating replacement for Question #${qToSwap.number}...`);

    try {
      const excludeQuestionTexts: string[] = [];
      activePaper.sections.forEach(sec => {
        sec.questions.forEach(q => {
          if (q.text) excludeQuestionTexts.push(q.text);
        });
      });

      const res = await fetch("/api/swap-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionToReplace: qToSwap,
          subject: activePaper.subject,
          classText: activePaper.classText,
          excludeQuestionTexts,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.question) {
        throw new Error(data.error || "Failed to swap question.");
      }

      const newQuestion = data.question;

      const updatedTarget = { ...activePaper };
      updatedTarget.sections = updatedTarget.sections.map(sec => ({
        ...sec,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        questions: sec.questions.map((q: any) => q.id === qToSwap.id ? newQuestion : q),
      }));

      if (paper.sets && paper.sets.length > 0) {
        const newSets = [...paper.sets];
        newSets[activeSetIdx] = updatedTarget;
        onChange({ ...paper, sets: newSets });
      } else {
        onChange(updatedTarget);
      }

      toast.success(`Question #${qToSwap.number} replaced with new AI question!`, { id: toastId });
    } catch (err: any) {
      console.error("Swap error:", err);
      toast.error(err.message || "Could not replace question.", { id: toastId });
    } finally {
      setSwappingId(null);
    }
  };

  const handleEditStart = (type: "header" | "instruction" | "question" | "solution", initialVal: string, id?: string, index?: number, choices?: string[]) => {
    setEditingField({ type, id, index });
    setEditValue(initialVal);
    setEditChoices(choices ? [...choices] : []);
  };

  const handleEditSave = () => {
    if (!editingField) return;

    // Work on active paper
    const updatedTarget = { ...activePaper };

    if (editingField.type === "header") {
      if (editingField.id === "schoolName") updatedTarget.schoolName = editValue.toUpperCase();
      if (editingField.id === "examName") updatedTarget.examName = editValue.replace(/_/g, " ").toUpperCase();
      if (editingField.id === "teacherName") updatedTarget.teacherName = editValue;
      if (editingField.id === "subject") updatedTarget.subject = editValue;
      if (editingField.id === "classText") updatedTarget.classText = editValue;
      if (editingField.id === "timeText") updatedTarget.timeText = editValue;
      if (editingField.id === "maxMarksText") updatedTarget.maxMarksText = editValue;
    } else if (editingField.type === "instruction" && typeof editingField.index === "number") {
      updatedTarget.instructions[editingField.index] = formatScientificText(editValue);
    } else if (editingField.type === "question" && editingField.id) {
      updatedTarget.sections = updatedTarget.sections.map(section => ({
        ...section,
        questions: section.questions.map(q => {
          if (q.id === editingField.id) {
            return { 
              ...q, 
              text: formatScientificText(editValue), 
              choices: q.choices && q.choices.length > 0 
                ? editChoices.map(c => formatScientificText(c)) 
                : undefined 
            };
          }
          return q;
        })
      }));
    } else if (editingField.type === "solution" && editingField.id) {
      const isOr = editingField.id.endsWith("_or");
      const targetId = isOr ? editingField.id.replace("_or", "") : editingField.id;

      updatedTarget.sections = updatedTarget.sections.map(section => ({
        ...section,
        questions: section.questions.map(q => {
          if (q.id === targetId) {
            if (isOr) {
              return { ...q, orSolution: formatScientificText(editValue) };
            } else {
              return { ...q, solution: formatScientificText(editValue) };
            }
          }
          return q;
        })
      }));
    }

    if (paper.sets && paper.sets.length > 0) {
      const newSets = [...paper.sets];
      newSets[activeSetIdx] = updatedTarget;
      onChange({ ...paper, sets: newSets });
    } else {
      onChange(updatedTarget);
    }

    setEditingField(null);
  };

  // Reorder questions or delete questions
  const handleDeleteQuestion = (sectionIndex: number, questionId: string) => {
    const updated = { ...paper };
    const section = updated.sections[sectionIndex];
    section.questions = section.questions.filter(q => q.id !== questionId);
    
    // Re-index question numbers in this section
    let currentIdx = 1;
    updated.sections.forEach(sec => {
      sec.questions = sec.questions.map(q => {
        const num = currentIdx;
        currentIdx++;
        return { ...q, number: num };
      });
    });

    onChange(updated);
  };

  const handleMoveQuestion = (sectionIndex: number, questionIndex: number, direction: "up" | "down") => {
    const updated = { ...paper };
    const questions = [...updated.sections[sectionIndex].questions];
    
    if (direction === "up" && questionIndex > 0) {
      const temp = questions[questionIndex];
      questions[questionIndex] = questions[questionIndex - 1];
      questions[questionIndex - 1] = temp;
    } else if (direction === "down" && questionIndex < questions.length - 1) {
      const temp = questions[questionIndex];
      questions[questionIndex] = questions[questionIndex + 1];
      questions[questionIndex + 1] = temp;
    }

    updated.sections[sectionIndex].questions = questions;
    
    // Re-index question numbers globally
    let currentIdx = 1;
    updated.sections.forEach(sec => {
      sec.questions = sec.questions.map(q => {
        const num = currentIdx;
        currentIdx++;
        return { ...q, number: num };
      });
    });

    onChange(updated);
  };

  const zoomStyle = {
    transform: `scale(${zoom / 100})`,
    transformOrigin: "top center",
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector and Zoom/Print toolbar (no-print) */}
      <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-border/40 glass bg-card/45 backdrop-blur-sm max-w-5xl mx-auto">
        
        {/* Mode Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-background/80 border border-border/60 shadow-inner">
          <button
            onClick={() => setViewMode("paper")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all cursor-pointer ${
              viewMode === "paper"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Question Paper</span>
          </button>

          <button
            onClick={() => setViewMode("solutions")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all cursor-pointer ${
              viewMode === "solutions"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Answer Key & Solutions</span>
          </button>
        </div>

        {/* Set Selector Pills (if multi-set paper) */}
        {paper.sets && paper.sets.length > 1 && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-inner">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider px-2 font-heading">
              Paper Variant:
            </span>
            {paper.sets.map((setObj, idx) => {
              const label = setObj.setName || `SET ${String.fromCharCode(65 + idx)}`;
              const isSelected = activeSetIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectSet && onSelectSet(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md scale-105"
                      : "text-indigo-400 hover:bg-indigo-500/20"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Zoom controls */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-muted-foreground font-heading uppercase tracking-wider">
            ZOOM
          </span>
          <Button variant="ghost" size="icon" onClick={() => setZoom(prev => Math.max(50, prev - 10))} className="w-7 h-7 rounded-lg cursor-pointer">
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <div className="w-24">
            <Slider
              value={[zoom]}
              onValueChange={(val) => {
                if (Array.isArray(val)) setZoom(val[0]);
                else if (typeof val === "number") setZoom(val);
              }}
              min={50}
              max={150}
              step={10}
            />
          </div>
          <Button variant="ghost" size="icon" onClick={() => setZoom(prev => Math.min(150, prev + 10))} className="w-7 h-7 rounded-lg cursor-pointer">
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs font-semibold text-muted-foreground font-heading w-8">
            {zoom}%
          </span>
          
          <Button 
            onClick={() => window.print()}
            className="rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-3.5 h-7 text-xs font-heading cursor-pointer ml-2"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            Print
          </Button>
        </div>
      </div>

      {/* Main A4 container */}
      <div className="overflow-x-auto pb-12">
        <div 
          className="print-page w-[210mm] min-h-[297mm] mx-auto bg-white dark:bg-white text-black p-[20mm] border border-border/40 dark:border-transparent shadow-2xl transition-all duration-300 relative text-left"
          style={zoomStyle}
        >
          {/* School Name */}
          {activePaper.schoolName !== undefined && (
            <div className="text-center font-bold font-serif text-lg tracking-wide uppercase group relative pr-12 pl-12">
              {editingField?.type === "header" && editingField.id === "schoolName" ? (
                <div className="flex gap-2 justify-center w-full">
                  <Input 
                    value={editValue} 
                    onChange={(e) => setEditValue(e.target.value)} 
                    className="max-w-md h-7 text-center font-bold text-black border-black" 
                  />
                  <Button size="icon-xs" onClick={handleEditSave} className="bg-black hover:bg-black/85 text-white"><Check className="w-3 h-3" /></Button>
                </div>
              ) : (
                <span 
                  onClick={() => handleEditStart("header", activePaper.schoolName || "", "schoolName")}
                  className="cursor-pointer border-b border-dashed border-transparent hover:border-black/30 pb-0.5"
                >
                  {activePaper.schoolName ? activePaper.schoolName.toUpperCase() : "YOUR SCHOOL NAME HERE"}
                </span>
              )}
            </div>
          )}

          {/* Exam Headers */}
          <div className="text-center font-bold font-serif text-md tracking-wider mt-1 group relative">
            {editingField?.type === "header" && editingField.id === "examName" ? (
              <div className="flex gap-2 justify-center w-full">
                <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="max-w-xs h-7 text-center text-black border-black" />
                <Button size="icon-xs" onClick={handleEditSave} className="bg-black hover:bg-black/85 text-white"><Check className="w-3 h-3" /></Button>
              </div>
            ) : (
              <span onClick={() => handleEditStart("header", activePaper.examName, "examName")} className="cursor-pointer hover:underline decoration-dashed">
                {activePaper.examName ? activePaper.examName.replace(/_/g, ' ').toUpperCase() : ""}
              </span>
            )}
          </div>

          {(activePaper.subject || activePaper.classText || (activePaper.teacherName && activePaper.teacherName.trim() !== "")) && (
            <div className="text-center font-semibold font-serif text-sm tracking-wide mt-1 group flex flex-wrap items-center justify-center gap-x-2">
              {activePaper.subject && (
                <span>
                  Subject:{" "}
                  {editingField?.type === "header" && editingField.id === "subject" ? (
                    <div className="inline-flex gap-2">
                      <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-40 h-7 text-black border-black" />
                      <Button size="icon-xs" onClick={handleEditSave} className="bg-black hover:bg-black/85 text-white"><Check className="w-3 h-3" /></Button>
                    </div>
                  ) : (
                    <span onClick={() => handleEditStart("header", activePaper.subject, "subject")} className="cursor-pointer hover:underline decoration-dashed">
                      {activePaper.subject}
                    </span>
                  )}
                </span>
              )}

              {activePaper.subject && activePaper.classText && <span className="text-black/50">|</span>}

              {activePaper.classText && (
                <span>
                  Class:{" "}
                  {editingField?.type === "header" && editingField.id === "classText" ? (
                    <div className="inline-flex gap-2">
                      <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-20 h-7 text-black border-black" />
                      <Button size="icon-xs" onClick={handleEditSave} className="bg-black hover:bg-black/85 text-white"><Check className="w-3 h-3" /></Button>
                    </div>
                  ) : (
                    <span onClick={() => handleEditStart("header", activePaper.classText, "classText")} className="cursor-pointer hover:underline decoration-dashed">
                      {activePaper.classText}
                    </span>
                  )}
                </span>
              )}

              {(activePaper.subject || activePaper.classText) && activePaper.teacherName && activePaper.teacherName.trim() !== "" && <span className="text-black/50">|</span>}

              {activePaper.teacherName !== undefined && activePaper.teacherName.trim() !== "" && (
                <span>
                  {editingField?.type === "header" && editingField.id === "teacherName" ? (
                    <div className="inline-flex gap-2">
                      <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-40 h-7 text-black border-black" />
                      <Button size="icon-xs" onClick={handleEditSave} className="bg-black hover:bg-black/85 text-white"><Check className="w-3 h-3" /></Button>
                    </div>
                  ) : (
                    <span onClick={() => handleEditStart("header", activePaper.teacherName || "", "teacherName")} className="cursor-pointer hover:underline decoration-dashed">
                      {activePaper.teacherName.toLowerCase().startsWith("teacher") || activePaper.teacherName.toLowerCase().startsWith("prepared by")
                        ? activePaper.teacherName
                        : `Teacher: ${activePaper.teacherName}`}
                    </span>
                  )}
                </span>
              )}
            </div>
          )}

          {/* Subheader: Time & Marks */}
          <div className="flex justify-between items-center border-b border-black pb-2 mt-4 text-xs font-bold font-serif">
            <div>
              Time Allowed:{" "}
              {editingField?.type === "header" && editingField.id === "timeText" ? (
                <div className="inline-flex gap-2">
                  <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-28 h-6 text-xs text-black border-black px-1" />
                  <Button size="icon-xs" onClick={handleEditSave} className="bg-black hover:bg-black/85 text-white"><Check className="w-3 h-3" /></Button>
                </div>
              ) : (
                <span onClick={() => handleEditStart("header", activePaper.timeText, "timeText")} className="cursor-pointer hover:underline decoration-dashed">
                  {activePaper.timeText}
                </span>
              )}
            </div>
            <div>
              Maximum Marks:{" "}
              {editingField?.type === "header" && editingField.id === "maxMarksText" ? (
                <div className="inline-flex gap-2">
                  <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-20 h-6 text-xs text-black border-black px-1" />
                  <Button size="icon-xs" onClick={handleEditSave} className="bg-black hover:bg-black/85 text-white"><Check className="w-3 h-3" /></Button>
                </div>
              ) : (
                <span onClick={() => handleEditStart("header", activePaper.maxMarksText, "maxMarksText")} className="cursor-pointer hover:underline decoration-dashed">
                  {activePaper.maxMarksText}
                </span>
              )}
            </div>
          </div>

          {/* Instructions */}
          {activePaper.instructions && activePaper.instructions.length > 0 && (
            <div className="mt-4 p-3 border border-black/40 rounded bg-slate-50/50 text-[11px] font-sans space-y-1">
              <h4 className="font-bold uppercase tracking-wider text-[11px] font-serif">General Instructions:</h4>
              <ol className="list-decimal pl-4 space-y-1">
                {activePaper.instructions.map((inst, index) => {
                  const displayInst = cleanInstructionText(inst);
                  return (
                    <li key={index} className="group relative">
                      {editingField?.type === "instruction" && editingField.index === index ? (
                        <div className="flex gap-2 w-full pt-1">
                          <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-grow text-[11px] h-12 text-black border-black" />
                          <Button size="icon-xs" onClick={handleEditSave} className="bg-black hover:bg-black/85 text-white shrink-0"><Check className="w-3 h-3" /></Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pr-8">
                          <span onClick={() => handleEditStart("instruction", displayInst, undefined, index)} className="cursor-pointer flex-grow hover:bg-slate-100/50">
                            {displayInst}
                          </span>
                          
                          {/* Editor triggers (no-print) */}
                          <div className="no-print opacity-0 group-hover:opacity-100 flex gap-1 shrink-0 absolute right-0 top-1/2 -translate-y-1/2">
                            <button onClick={() => handleEditStart("instruction", displayInst, undefined, index)} className="p-0.5 text-muted-foreground hover:text-black cursor-pointer">
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {/* Sections List */}
          <div className="mt-6 space-y-6">
            {activePaper.sections && activePaper.sections.map((section, sIdx) => {
              if (section.questions.length === 0) return null;
              
              return (
                <div key={section.name} className="space-y-4">
                  {/* Section Title */}
                  <div className="border-b border-black/50 pb-1 mt-6">
                    <h3 className="font-serif font-bold text-xs uppercase tracking-widest text-black">
                      {section.name} — {section.description}
                    </h3>
                  </div>

                  {/* Section Questions */}
                  <div className="space-y-4 pl-1">
                    {section.questions.map((question, qIdx) => (
                      <div key={question.id} className="group relative pr-12 pl-1 leading-normal text-xs font-serif flex items-start gap-3">
                        {/* Question Number */}
                        <span className="font-bold w-6 text-right shrink-0">{question.number}.</span>
                        
                        {/* Question content */}
                        <div className="flex-grow space-y-2">
                          {editingField?.type === "question" && editingField.id === question.id ? (
                            <div className="space-y-3 w-full">
                              <div className="flex gap-2 w-full">
                                <Textarea 
                                  value={editValue} 
                                  onChange={(e) => setEditValue(e.target.value)} 
                                  className="flex-grow text-xs text-black border-black h-20" 
                                />
                                <Button 
                                  size="icon-xs" 
                                  onClick={handleEditSave} 
                                  className="bg-black hover:bg-black/85 text-white shrink-0"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                              
                              {/* Edit Choices if MCQ/AssertionReason */}
                              {editChoices.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 pl-3">
                                  {editChoices.map((choice, oIdx) => (
                                    <div key={oIdx} className="flex items-center gap-2 text-xs">
                                      <span className="font-semibold font-sans text-muted-foreground">({String.fromCharCode(97 + oIdx)})</span>
                                      <Input
                                        value={choice}
                                        onChange={(e) => {
                                          const updated = [...editChoices];
                                          updated[oIdx] = e.target.value;
                                          setEditChoices(updated);
                                        }}
                                        className="h-8 text-xs text-black border-black px-2 py-1 bg-white"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <p 
                                onClick={() => handleEditStart("question", question.text, question.id, undefined, question.choices || undefined)} 
                                className="cursor-pointer hover:bg-slate-100/50 pr-4 whitespace-pre-wrap"
                              >
                                {question.text}
                              </p>
                              
                              {/* Option list if MCQ */}
                              {question.choices && question.choices.length > 0 && (
                                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-2 pl-3 list-[lower-alpha] text-[11px]">
                                  {question.choices.map((choice, oIdx) => (
                                    <div 
                                      key={oIdx} 
                                      className="flex gap-1.5 cursor-pointer hover:bg-slate-100/50"
                                      onClick={() => handleEditStart("question", question.text, question.id, undefined, question.choices || undefined)}
                                    >
                                      <span className="font-semibold font-sans">({String.fromCharCode(97 + oIdx)})</span>
                                      <span className="whitespace-pre-wrap">{choice}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
 
                              {/* OR optional question if enabled */}
                              {question.orQuestion && (
                                <div className="mt-2.5 pl-3 border-l border-black/30 italic space-y-1 text-[11px]">
                                  <span className="font-bold uppercase tracking-wider block text-[9px] text-muted-foreground font-sans">
                                    OR
                                  </span>
                                  <p className="whitespace-pre-wrap">{question.orQuestion}</p>
                                </div>
                              )}

                              {/* Solution & Marking Scheme Box */}
                              {viewMode === "solutions" && (
                                <div className="mt-3 p-3 rounded-lg bg-emerald-50/80 border border-emerald-500/40 text-emerald-950 text-xs font-sans space-y-1.5 shadow-xs">
                                  <div className="flex items-center justify-between text-[11px] font-bold font-heading text-emerald-900 border-b border-emerald-500/20 pb-1">
                                    <span className="flex items-center gap-1.5">
                                      <Key className="w-3.5 h-3.5 text-emerald-600" />
                                      Official Solution & Marking Scheme:
                                    </span>
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono border border-emerald-300">
                                      [{question.marks} Marks Allocation]
                                    </span>
                                  </div>

                                  {editingField?.type === "solution" && editingField.id === question.id ? (
                                    <div className="flex gap-2 pt-1">
                                      <Textarea
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="flex-grow text-xs text-black border-emerald-600 bg-white"
                                      />
                                      <Button size="icon-xs" onClick={handleEditSave} className="bg-emerald-700 hover:bg-emerald-800 text-white shrink-0">
                                        <Check className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <p 
                                      onClick={() => handleEditStart("solution", question.solution || "", question.id)}
                                      className="cursor-pointer hover:bg-emerald-100/60 p-1 rounded whitespace-pre-wrap leading-relaxed"
                                    >
                                      {question.solution || "No detailed solution recorded for this question. Click to add solution."}
                                    </p>
                                  )}

                                  {/* OR Question Solution if applicable */}
                                  {question.orQuestion && (
                                    <div className="mt-2 pt-2 border-t border-emerald-500/20 space-y-1">
                                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block font-heading">
                                        OR CHOICE SOLUTION:
                                      </span>
                                      {editingField?.type === "solution" && editingField.id === `${question.id}_or` ? (
                                        <div className="flex gap-2 pt-1">
                                          <Textarea
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="flex-grow text-xs text-black border-emerald-600 bg-white"
                                          />
                                          <Button size="icon-xs" onClick={handleEditSave} className="bg-emerald-700 hover:bg-emerald-800 text-white shrink-0">
                                            <Check className="w-3.5 h-3.5" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <p 
                                          onClick={() => handleEditStart("solution", question.orSolution || "", `${question.id}_or`)}
                                          className="cursor-pointer hover:bg-emerald-100/60 p-1 rounded whitespace-pre-wrap leading-relaxed italic"
                                        >
                                          {question.orSolution || "No detailed solution recorded for internal choice question. Click to add solution."}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
 
                        {/* Marks */}
                        <span className="font-bold text-[11px] shrink-0 text-right w-10">
                          [{question.marks} M]
                        </span>
 
                        {/* Action buttons (no-print) */}
                        <div className="no-print opacity-0 group-hover:opacity-100 absolute right-0 top-0 flex flex-col gap-1 items-center bg-white border border-border rounded-lg p-1 shadow-md z-10">
                          <button 
                            title="Edit Question"
                            onClick={() => handleEditStart("question", question.text, question.id, undefined, question.choices || undefined)} 
                            className="p-1 text-muted-foreground hover:text-indigo-500 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button 
                            title="AI Re-roll / Swap Question"
                            onClick={() => handleSwapQuestion(question)} 
                            disabled={swappingId === question.id}
                            className="p-1 text-muted-foreground hover:text-purple-600 disabled:opacity-40 cursor-pointer"
                          >
                            {swappingId === question.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                            ) : (
                              <RefreshCw className="w-3.5 h-3.5" />
                            )}
                          </button>
                          
                          <button onClick={() => handleMoveQuestion(sIdx, qIdx, "up")} disabled={qIdx === 0} className="p-1 text-muted-foreground hover:text-indigo-500 disabled:opacity-30 cursor-pointer">
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          
                          <button onClick={() => handleMoveQuestion(sIdx, qIdx, "down")} disabled={qIdx === section.questions.length - 1} className="p-1 text-muted-foreground hover:text-indigo-500 disabled:opacity-30 cursor-pointer">
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          
                          <button onClick={() => handleDeleteQuestion(sIdx, question.id)} className="p-1 text-muted-foreground hover:text-red-500 cursor-pointer border-t border-border mt-1 pt-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
