"use client";

import React, { useState } from "react";
import { GeneratedPaper } from "@/types";
import { Trash2, Edit2, Check, ArrowUp, ArrowDown, ZoomIn, ZoomOut, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { formatScientificText } from "@/lib/utils";

interface PaperPreviewProps {
  paper: GeneratedPaper;
  onChange: (updatedPaper: GeneratedPaper) => void;
}

export function PaperPreview({ paper, onChange }: PaperPreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [editingField, setEditingField] = useState<{ type: "header" | "instruction" | "question"; id?: string; index?: number } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editChoices, setEditChoices] = useState<string[]>([]);

  const handleEditStart = (type: "header" | "instruction" | "question", initialVal: string, id?: string, index?: number, choices?: string[]) => {
    setEditingField({ type, id, index });
    setEditValue(initialVal);
    setEditChoices(choices ? [...choices] : []);
  };

  const handleEditSave = () => {
    if (!editingField) return;

    const updated = { ...paper };

    if (editingField.type === "header") {
      if (editingField.id === "schoolName") updated.schoolName = formatScientificText(editValue);
      if (editingField.id === "examName") updated.examName = formatScientificText(editValue);
      if (editingField.id === "subject") updated.subject = formatScientificText(editValue);
      if (editingField.id === "classText") updated.classText = formatScientificText(editValue);
      if (editingField.id === "timeText") updated.timeText = formatScientificText(editValue);
      if (editingField.id === "maxMarksText") updated.maxMarksText = formatScientificText(editValue);
    } else if (editingField.type === "instruction" && typeof editingField.index === "number") {
      updated.instructions[editingField.index] = formatScientificText(editValue);
    } else if (editingField.type === "question" && editingField.id) {
      // Find question and update text & choices
      updated.sections = updated.sections.map(section => {
        return {
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
        };
      });
    }

    onChange(updated);
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
      {/* Zoom and print toolbar (no-print) */}
      <div className="no-print flex items-center justify-between p-4 rounded-2xl border border-border/40 glass bg-card/45 backdrop-blur-sm max-w-5xl mx-auto">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-muted-foreground font-heading">
            ZOOM PREVIEW
          </span>
          <Button variant="ghost" size="icon" onClick={() => setZoom(prev => Math.max(50, prev - 10))} className="w-8 h-8 rounded-lg cursor-pointer">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <div className="w-32">
            <Slider
              value={[zoom]}
              onValueChange={(val) => {
                if (Array.isArray(val)) {
                  setZoom(val[0]);
                } else if (typeof val === "number") {
                  setZoom(val);
                }
              }}
              min={50}
              max={150}
              step={10}
            />
          </div>
          <Button variant="ghost" size="icon" onClick={() => setZoom(prev => Math.min(150, prev + 10))} className="w-8 h-8 rounded-lg cursor-pointer">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <span className="text-xs font-semibold text-muted-foreground font-heading w-10">
            {zoom}%
          </span>
        </div>
        
        <div className="hidden sm:flex items-center gap-2">
          <Button 
            onClick={() => window.print()}
            className="rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-4 h-8 text-xs font-heading cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Quick Print
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
          {paper.schoolName !== undefined && (
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
                  onClick={() => handleEditStart("header", paper.schoolName || "", "schoolName")}
                  className="cursor-pointer border-b border-dashed border-transparent hover:border-black/30 pb-0.5"
                >
                  {paper.schoolName || "YOUR SCHOOL NAME HERE"}
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
              <span onClick={() => handleEditStart("header", paper.examName, "examName")} className="cursor-pointer hover:underline decoration-dashed">
                {paper.examName}
              </span>
            )}
          </div>

          <div className="text-center font-semibold font-serif text-sm tracking-wide mt-1 group">
            Subject:{" "}
            {editingField?.type === "header" && editingField.id === "subject" ? (
              <div className="inline-flex gap-2">
                <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-40 h-7 text-black border-black" />
                <Button size="icon-xs" onClick={handleEditSave} className="bg-black hover:bg-black/85 text-white"><Check className="w-3 h-3" /></Button>
              </div>
            ) : (
              <span onClick={() => handleEditStart("header", paper.subject, "subject")} className="cursor-pointer hover:underline decoration-dashed">
                {paper.subject}
              </span>
            )}
            {" | "}
            Class:{" "}
            {editingField?.type === "header" && editingField.id === "classText" ? (
              <div className="inline-flex gap-2">
                <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-20 h-7 text-black border-black" />
                <Button size="icon-xs" onClick={handleEditSave} className="bg-black hover:bg-black/85 text-white"><Check className="w-3 h-3" /></Button>
              </div>
            ) : (
              <span onClick={() => handleEditStart("header", paper.classText, "classText")} className="cursor-pointer hover:underline decoration-dashed">
                {paper.classText}
              </span>
            )}
          </div>

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
                <span onClick={() => handleEditStart("header", paper.timeText, "timeText")} className="cursor-pointer hover:underline decoration-dashed">
                  {paper.timeText}
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
                <span onClick={() => handleEditStart("header", paper.maxMarksText, "maxMarksText")} className="cursor-pointer hover:underline decoration-dashed">
                  {paper.maxMarksText}
                </span>
              )}
            </div>
          </div>

          {/* Instructions */}
          {paper.instructions.length > 0 && (
            <div className="mt-4 p-3 border border-black/40 rounded bg-slate-50/50 text-[11px] font-sans space-y-1">
              <h4 className="font-bold uppercase tracking-wider text-[11px] font-serif">General Instructions:</h4>
              <ol className="list-decimal pl-4 space-y-1">
                {paper.instructions.map((inst, index) => (
                  <li key={index} className="group relative">
                    {editingField?.type === "instruction" && editingField.index === index ? (
                      <div className="flex gap-2 w-full pt-1">
                        <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-grow text-[11px] h-12 text-black border-black" />
                        <Button size="icon-xs" onClick={handleEditSave} className="bg-black hover:bg-black/85 text-white shrink-0"><Check className="w-3 h-3" /></Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pr-8">
                        <span onClick={() => handleEditStart("instruction", inst, undefined, index)} className="cursor-pointer flex-grow hover:bg-slate-100/50">
                          {inst}
                        </span>
                        
                        {/* Editor triggers (no-print) */}
                        <div className="no-print opacity-0 group-hover:opacity-100 flex gap-1 shrink-0 absolute right-0 top-1/2 -translate-y-1/2">
                          <button onClick={() => handleEditStart("instruction", inst, undefined, index)} className="p-0.5 text-muted-foreground hover:text-black cursor-pointer">
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Sections List */}
          <div className="mt-6 space-y-6">
            {paper.sections.map((section, sIdx) => {
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
                            onClick={() => handleEditStart("question", question.text, question.id, undefined, question.choices || undefined)} 
                            className="p-1 text-muted-foreground hover:text-indigo-500 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
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
