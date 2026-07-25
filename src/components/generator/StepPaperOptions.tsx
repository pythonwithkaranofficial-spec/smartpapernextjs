"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PaperOptions, SchoolProfile } from "@/types";
import { Sparkles, CheckCircle2, Building, BookmarkPlus, Trash2 } from "lucide-react";
import { ProfileService } from "@/lib/profile-service";
import { toast } from "sonner";

interface StepPaperOptionsProps {
  value?: PaperOptions;
  options?: PaperOptions;
  onChange?: (val: PaperOptions) => void;
  onChangeOptions?: (val: PaperOptions) => void;
  isBlueprintMode?: boolean;
  unitWeightage?: { unit: string; topic: string; marks: number }[];
  blueprintTitle?: string;
}

export function StepPaperOptions({
  value,
  options,
  onChange,
  onChangeOptions,
  isBlueprintMode,
  unitWeightage,
  blueprintTitle,
}: StepPaperOptionsProps) {
  const [savedProfiles, setSavedProfiles] = useState<SchoolProfile[]>([]);

  useEffect(() => {
    setSavedProfiles(ProfileService.getProfiles());
  }, []);

  const currentOptions = options || value || {
    includeSchoolName: false,
    schoolName: "",
    includeTeacherName: false,
    teacherName: "",
    includeSchoolLogo: false,
    includeClass: true,
    includeSubject: true,
    includeTime: true,
    includeMaxMarks: true,
    includeInstructions: true,
    instructionsText: "1. All questions are compulsory.\n2. Write answers clearly.",
    includeInternalChoice: false,
  };

  const updateOptions = (newOptions: PaperOptions) => {
    if (onChange) onChange(newOptions);
    if (onChangeOptions) onChangeOptions(newOptions);
  };

  const handleApplyProfile = (p: SchoolProfile) => {
    updateOptions({
      ...currentOptions,
      includeSchoolName: true,
      schoolName: p.schoolName,
      includeTeacherName: true,
      teacherName: p.teacherName,
      includeInstructions: true,
      instructionsText: p.instructionsText || currentOptions.instructionsText,
    });
    toast.success(`Applied institution profile: ${p.profileName}`);
  };

  const handleSaveCurrentProfile = () => {
    if (!currentOptions.schoolName && !currentOptions.teacherName) {
      toast.error("Please enter a School Name or Teacher Name before saving profile.");
      return;
    }

    const defaultName = currentOptions.schoolName || currentOptions.teacherName || "Custom Profile";
    const profileName = window.prompt("Enter a name for this Institution Profile:", defaultName);

    if (profileName) {
      const created = ProfileService.saveProfile({
        profileName,
        schoolName: currentOptions.schoolName || "",
        teacherName: currentOptions.teacherName || "",
        instructionsText: currentOptions.instructionsText,
      });

      setSavedProfiles(ProfileService.getProfiles());
      toast.success(`Saved profile "${created.profileName}" successfully!`);
    }
  };

  const handleDeleteProfile = (id: string) => {
    ProfileService.deleteProfile(id);
    setSavedProfiles(ProfileService.getProfiles());
    toast.success("Profile deleted.");
  };

  const handleToggle = (field: keyof PaperOptions) => {
    updateOptions({
      ...currentOptions,
      [field]: !currentOptions[field],
    });
  };

  const handleInputChange = (field: keyof PaperOptions, val: string) => {
    updateOptions({
      ...currentOptions,
      [field]: val,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center max-w-lg mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold font-heading mb-2">Configure Header & Options</h3>
        <p className="text-muted-foreground text-sm">
          Customize header metadata, school details, and general instructions on the generated paper.
        </p>
      </div>

      {isBlueprintMode && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-500/30 text-card-foreground shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-500 font-heading font-bold text-sm">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>{blueprintTitle || "Official Exam Blueprint Applied"}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Chapter distribution, question counts, section marks, and instructions have been automatically set according to the official curriculum pattern.
          </p>

          {unitWeightage && unitWeightage.length > 0 && (
            <div className="pt-2">
              <h5 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Unit Mark Allocations
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {unitWeightage.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-xl bg-background/60 border border-border/50 text-[11px]"
                  >
                    <span className="truncate font-medium text-foreground">{u.topic}</span>
                    <span className="ml-2 font-bold text-indigo-500">{u.marks}M</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* Saved Institution Profiles Bar */}
        <div className="p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-pink-500/5 backdrop-blur-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold font-heading text-indigo-300">Saved Institution Profiles</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 uppercase tracking-wider">
                  1-Click Apply
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Select a saved profile to fill School Name, Educator Name, and Instructions in 1 click
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleSaveCurrentProfile}
              className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-heading cursor-pointer shrink-0"
            >
              <BookmarkPlus className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              Save Current Details as Preset
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {savedProfiles.map((p) => (
              <div key={p.id} className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleApplyProfile(p)}
                  className="px-3 py-1.5 rounded-xl bg-background/80 hover:bg-indigo-500/20 text-xs font-heading font-semibold text-foreground border border-border/60 hover:border-indigo-500/40 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Building className="w-3 h-3 text-indigo-400" />
                  <span>{p.profileName}</span>
                </button>
                {p.id !== "preset_karan_sir" && (
                  <button
                    type="button"
                    onClick={() => handleDeleteProfile(p.id)}
                    className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                    title="Delete profile"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* School Name Option */}
        <div className="p-4 rounded-2xl border border-border/40 bg-background/50 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold font-heading">Include School / Institution Header</h4>
              <p className="text-[10px] text-muted-foreground">Print custom school name on top of the paper</p>
            </div>
            <Switch
              checked={currentOptions.includeSchoolName}
              onCheckedChange={() => handleToggle("includeSchoolName")}
            />
          </div>
          {currentOptions.includeSchoolName && (
            <Input
              type="text"
              placeholder="e.g. St. Xavier's Senior Secondary School"
              value={currentOptions.schoolName || ""}
              onChange={(e) => handleInputChange("schoolName", e.target.value)}
              className="bg-background/80 rounded-xl border-border/60 text-xs"
            />
          )}
        </div>

        {/* Teacher Name Option */}
        <div className="p-4 rounded-2xl border border-border/40 bg-background/50 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold font-heading">Include Educator / Teacher Name</h4>
              <p className="text-[10px] text-muted-foreground">Print paper setter name in paper header</p>
            </div>
            <Switch
              checked={currentOptions.includeTeacherName}
              onCheckedChange={() => handleToggle("includeTeacherName")}
            />
          </div>
          {currentOptions.includeTeacherName && (
            <Input
              type="text"
              placeholder="e.g. Prepared by: Karan Sir"
              value={currentOptions.teacherName || ""}
              onChange={(e) => handleInputChange("teacherName", e.target.value)}
              className="bg-background/80 rounded-xl border-border/60 text-xs"
            />
          )}
        </div>

        {/* Answer Key & Marking Scheme Option */}
        <div className="p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-pink-500/5 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-heading text-indigo-400">
                  Generate Answer Key & Detailed Marking Scheme
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 uppercase tracking-wider">
                  Recommended
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Generate step-by-step solutions, MCQ rationale, and mark allocations per question
              </p>
            </div>
            <Switch
              checked={Boolean(currentOptions.includeAnswerKey)}
              onCheckedChange={() => handleToggle("includeAnswerKey")}
            />
          </div>
        </div>

        {/* Multi-Set Paper Generation Option */}
        <div className="p-4 rounded-2xl border border-border/40 bg-background/50 backdrop-blur-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold font-heading">Multi-Set Paper Generation (Exam Security)</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30 uppercase tracking-wider">
                  Anti-Cheating
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Generate parallel paper variants (Set A, Set B, Set C) with shuffled questions and randomized MCQ choices
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-background/80 p-1 rounded-xl border border-border/60 shrink-0">
              {[1, 2, 3].map((num) => {
                const isSelected = (currentOptions.numberOfSets || 1) === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => updateOptions({ ...currentOptions, numberOfSets: num })}
                    className={`px-3 py-1 rounded-lg text-xs font-heading font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    {num === 1 ? "1 Set" : num === 2 ? "2 Sets (A & B)" : "3 Sets (A, B, C)"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* General Instructions Text */}
        <div className="p-4 rounded-2xl border border-border/40 bg-background/50 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold font-heading">General Examination Instructions</h4>
              <p className="text-[10px] text-muted-foreground">Custom rules printed under the header</p>
            </div>
            <Switch
              checked={currentOptions.includeInstructions}
              onCheckedChange={() => handleToggle("includeInstructions")}
            />
          </div>
          {currentOptions.includeInstructions && (
            <Textarea
              rows={3}
              value={currentOptions.instructionsText || ""}
              onChange={(e) => handleInputChange("instructionsText", e.target.value)}
              className="bg-background/80 rounded-xl border-border/60 text-xs font-mono"
            />
          )}
        </div>
      </div>
    </div>
  );
}
