"use client";

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SyllabusExplorer } from "./SyllabusExplorer";
import { BookOpen } from "lucide-react";

interface SyllabusModalProps {
  open: boolean;
  onClose: () => void;
  classId?: string;
  subject?: string;
  onSelectSyllabus?: (classId: string, subject: string) => void;
}

export function SyllabusModal({
  open,
  onClose,
  classId = "10",
  subject = "maths",
  onSelectSyllabus,
}: SyllabusModalProps) {
  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto p-4 sm:p-6 bg-background/95 backdrop-blur-xl border-l border-border/50">
        <SheetHeader className="mb-4 pb-3 border-b border-border/40 text-left">
          <SheetTitle className="text-xl font-bold font-heading flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Official CBSE Syllabus & Blueprint Explorer
          </SheetTitle>
        </SheetHeader>

        <SyllabusExplorer
          initialClassId={classId}
          initialSubject={subject}
          onSelectSyllabus={(cId, sub) => {
            if (onSelectSyllabus) {
              onSelectSyllabus(cId, sub);
            }
            onClose();
          }}
          compact
        />
      </SheetContent>
    </Sheet>
  );
}
