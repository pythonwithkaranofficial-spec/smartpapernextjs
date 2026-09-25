"use client";

import React, { useState, useMemo, useEffect } from "react";
import { CURRICULUM_DATA } from "@/lib/curriculum-data";
import { GlassCard } from "../shared/GlassCard";
import { Check, BookOpen, Layers, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StepChaptersSelectProps {
  classId: string;
  subject: string;
  selectedChapters: string[];
  onChange?: (chapters: string[]) => void;
  onChaptersChange?: (chapters: string[]) => void;
}

export function StepChaptersSelect({
  classId,
  subject,
  selectedChapters = [],
  onChange,
  onChaptersChange,
}: StepChaptersSelectProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Retrieve chapters from curriculum context with fallback for english/englishcore
  const resolvedSubject =
    (classId === "12" || classId === "11") && subject === "english" && !CURRICULUM_DATA[classId]?.[subject]
      ? "englishcore"
      : subject;
  const subjectData = CURRICULUM_DATA[classId]?.[subject] || CURRICULUM_DATA[classId]?.[resolvedSubject];
  const rawChapters = subjectData?.chapters || [];

  const getChapterTitle = (chap: string | { title: string }): string => {
    return typeof chap === "string" ? chap : chap.title;
  };

  // Helper to extract category/book from chapter title
  const parseChapterInfo = (chapTitle: string) => {
    if (chapTitle.includes(":")) {
      const idx = chapTitle.indexOf(":");
      const category = chapTitle.substring(0, idx).trim();
      const title = chapTitle.substring(idx + 1).trim();
      return { category, title, full: chapTitle };
    }
    return { category: null, title: chapTitle, full: chapTitle };
  };

  // Extract unique categories (e.g. Flamingo (Prose), Flamingo (Poetry), Vistas, etc.)
  const categories = useMemo(() => {
    const cats = new Set<string>();
    rawChapters.forEach((ch) => {
      const info = parseChapterInfo(getChapterTitle(ch));
      if (info.category) {
        cats.add(info.category);
      }
    });
    return Array.from(cats);
  }, [rawChapters]);

  // Only consider chapters that actually belong to the current subject curriculum
  const validChapterTitles = useMemo(() => {
    return new Set(rawChapters.map(getChapterTitle));
  }, [rawChapters]);

  const validSelectedChapters = useMemo(() => {
    return selectedChapters.filter((c) => validChapterTitles.has(c));
  }, [selectedChapters, validChapterTitles]);

  const updateSelected = (newChapters: string[]) => {
    if (onChange) onChange(newChapters);
    if (onChaptersChange) onChaptersChange(newChapters);
  };

  // Clean out any stale or non-existent chapters
  useEffect(() => {
    if (selectedChapters.some((c) => !validChapterTitles.has(c))) {
      updateSelected(validSelectedChapters);
    }
  }, [selectedChapters, validSelectedChapters, validChapterTitles]);

  const handleToggleChapter = (chapterTitle: string) => {
    if (validSelectedChapters.includes(chapterTitle)) {
      updateSelected(validSelectedChapters.filter((c) => c !== chapterTitle));
    } else {
      updateSelected([...validSelectedChapters, chapterTitle]);
    }
  };

  const handleSelectAll = () => {
    if (validSelectedChapters.length === rawChapters.length) {
      updateSelected([]);
    } else {
      updateSelected(rawChapters.map(getChapterTitle));
    }
  };

  // Filtered chapters for display
  const filteredChapters = useMemo(() => {
    return rawChapters.filter((chap) => {
      const fullTitle = getChapterTitle(chap);
      const info = parseChapterInfo(fullTitle);

      // Category filter
      if (activeCategory !== "All" && info.category !== activeCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return fullTitle.toLowerCase().includes(q);
      }

      return true;
    });
  }, [rawChapters, activeCategory, searchQuery]);

  // Toggle all chapters in the currently selected category
  const handleToggleCurrentCategory = () => {
    if (activeCategory === "All") {
      handleSelectAll();
      return;
    }

    const categoryChapters = rawChapters
      .map(getChapterTitle)
      .filter((title) => parseChapterInfo(title).category === activeCategory);

    const allCatSelected = categoryChapters.every((ch) => validSelectedChapters.includes(ch));

    if (allCatSelected) {
      updateSelected(validSelectedChapters.filter((ch) => !categoryChapters.includes(ch)));
    } else {
      const newlySelected = new Set([...validSelectedChapters, ...categoryChapters]);
      updateSelected(Array.from(newlySelected));
    }
  };

  // Category badge color helper
  const getCategoryColor = (cat: string | null) => {
    if (!cat) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (cat.includes("Flamingo (Prose)") || cat.includes("क्षितिज (गद्य खंड)")) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    if (cat.includes("Flamingo (Poetry)") || cat.includes("क्षितिज (काव्य खंड)")) return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    if (cat.includes("Vistas") || cat.includes("कृतिका")) return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    if (cat.includes("Creative Writing") || cat.includes("रचनात्मक लेखन")) return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    if (cat.includes("Reading Skills") || cat.includes("अपठित बोध")) return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    if (cat.includes("Reproduction")) return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    if (cat.includes("Genetics") || cat.includes("Evolution")) return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    if (cat.includes("Biology and Human Welfare") || cat.includes("Human Welfare")) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    if (cat.includes("Biotechnology")) return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    if (cat.includes("Ecology") || cat.includes("Environment")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (cat.includes("Unit I") || cat.includes("Electrostatics")) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (cat.includes("Unit II") || cat.includes("Current Electricity")) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    if (cat.includes("Unit III") || cat.includes("Magnetic")) return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    if (cat.includes("Unit IV") || cat.includes("Induction") || cat.includes("Alternating")) return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    if (cat.includes("Unit V") || cat.includes("Electromagnetic Waves")) return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    if (cat.includes("Unit VI") || cat.includes("Optics")) return "bg-teal-500/10 text-teal-400 border-teal-500/20";
    if (cat.includes("Unit VII") || cat.includes("Dual Nature")) return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    if (cat.includes("Unit VIII") || cat.includes("Atoms") || cat.includes("Nuclei")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (cat.includes("Unit IX") || cat.includes("Electronic Devices")) return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    if (cat.includes("Computational Thinking") || cat.includes("Programming")) return "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20";
    if (cat.includes("Computer Networks") || cat.includes("Networks")) return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    if (cat.includes("Database Management") || cat.includes("Database")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (cat.includes("Macroeconomics")) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (cat.includes("Indian Economic Development")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (cat.includes("Human Geography") || cat.includes("Fundamentals of Human Geography")) return "bg-teal-500/10 text-teal-400 border-teal-500/20";
    if (cat.includes("People and Economy") || cat.includes("India - People and Economy")) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    if (cat.includes("Geography Practical")) return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold font-heading">
          Select Syllabus Chapters
        </h3>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Select specific books, units, or chapters to include in your paper generator queue.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {/* Book / Category Filter Tabs (if subject has books/units) */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveCategory("All")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0",
                activeCategory === "All"
                  ? "bg-blue-500 text-white border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.25)]"
                  : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted/70 hover:text-foreground"
              )}
            >
              All ({rawChapters.length})
            </button>
            {categories.map((cat) => {
              const catChapters = rawChapters
                .map(getChapterTitle)
                .filter((t) => parseChapterInfo(t).category === cat);
              const selectedCount = catChapters.filter((t) => validSelectedChapters.includes(t)).length;
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 shrink-0",
                    isActive
                      ? "bg-blue-500 text-white border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.25)]"
                      : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted/70 hover:text-foreground"
                  )}
                >
                  <span>{cat}</span>
                  {selectedCount > 0 && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                        isActive ? "bg-white/20 text-white" : "bg-blue-500/20 text-blue-400"
                      )}
                    >
                      {selectedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search chapters or books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs rounded-xl border-border/50 bg-muted/20"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground font-heading">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>
                Selected: <strong className="text-foreground">{validSelectedChapters.length}</strong> of {rawChapters.length}
              </span>
            </div>

            {activeCategory !== "All" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleCurrentCategory}
                className="text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl h-8 px-2.5"
              >
                {rawChapters
                  .map(getChapterTitle)
                  .filter((t) => parseChapterInfo(t).category === activeCategory)
                  .every((t) => validSelectedChapters.includes(t))
                  ? `Deselect ${activeCategory}`
                  : `Select ${activeCategory}`}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-xl h-8 px-2.5"
            >
              {validSelectedChapters.length === rawChapters.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {filteredChapters.map((chap, index) => {
            const fullTitle = getChapterTitle(chap);
            const { category, title } = parseChapterInfo(fullTitle);
            const isSelected = validSelectedChapters.includes(fullTitle);

            return (
              <GlassCard
                key={index}
                onClick={() => handleToggleChapter(fullTitle)}
                className={cn(
                  "p-3.5 cursor-pointer border flex items-center justify-between gap-3 transition-all duration-300 relative group",
                  isSelected
                    ? "border-blue-500/50 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                    : "border-border/40 hover:border-blue-500/25"
                )}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-heading shrink-0 border mt-0.5",
                      isSelected
                        ? "bg-blue-500/15 border-blue-500/30 text-blue-500"
                        : "bg-muted border-border/50 text-muted-foreground"
                    )}
                  >
                    <BookOpen className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    {category && (
                      <span
                        className={cn(
                          "inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold tracking-wide border mb-1 truncate max-w-full",
                          getCategoryColor(category)
                        )}
                      >
                        {category}
                      </span>
                    )}
                    <h4 className="text-xs font-bold font-heading text-foreground group-hover:text-blue-500 transition-colors leading-snug">
                      {title}
                    </h4>
                  </div>
                </div>

                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300 shrink-0",
                    isSelected
                      ? "bg-blue-500 border-transparent text-white"
                      : "border-border text-transparent scale-90 group-hover:border-blue-500/30"
                  )}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              </GlassCard>
            );
          })}
        </div>

        {filteredChapters.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-xs">
            No chapters match your search query &ldquo;{searchQuery}&rdquo;.
          </div>
        )}
      </div>
    </div>
  );
}
