"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { Footer } from "@/components/landing/Footer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthService } from "@/lib/firebase/auth-service";
import { PaperHistoryRecord } from "@/types/db";
import { History, Search, FileText, Calendar, Award, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<PaperHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        const token = await AuthService.getFirebaseToken();
        if (!token) return;

        const res = await fetch("/api/user/history?limit=50", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (json.success && json.data) {
          setHistory(json.data);
        }
      } catch (error) {
        console.error("Failed to load paper history:", error);
        toast.error("Failed to load paper history.");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.subject.toLowerCase().includes(q) ||
      item.class.toLowerCase().includes(q) ||
      item.paper_type.toLowerCase().includes(q)
    );
  });

  const handleOpenPaper = (record: PaperHistoryRecord) => {
    try {
      const parsedPaper = JSON.parse(record.paper_json);
      sessionStorage.setItem("generated_paper", JSON.stringify(parsedPaper));
      toast.success(`Loaded ${record.subject} paper into previewer.`);
      router.push("/preview");
    } catch (e) {
      console.error("Failed to parse paper json:", e);
      toast.error("Failed to open selected paper.");
    }
  };

  return (
    <>
      <AnimatedBackground />
      <Navbar />

      <main className="flex-grow pt-28 pb-20">
        <ProtectedRoute>
          <div className="container mx-auto px-4 max-w-7xl space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <History className="w-3.5 h-3.5" />
                <span>Saved Question Papers</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading tracking-tight">
                Paper History
              </h1>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Access, view, and re-download all your previously generated question papers stored in Turso DB.
              </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by subject, class, or exam type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border/60 focus:border-blue-500 rounded-xl"
              />
            </div>

            {/* History Loading State */}
            {loading ? (
              <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-xs text-muted-foreground font-medium">Loading saved history from database...</p>
              </div>
            ) : filteredHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHistory.map((item) => {
                  const dateStr = new Date(item.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <GlassCard key={item.id} className="p-6 flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-all group">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Class {item.class}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {dateStr}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold font-heading group-hover:text-blue-400 transition-colors">
                            {item.subject}
                          </h3>
                          <p className="text-xs text-muted-foreground">{item.paper_type}</p>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/40">
                          <span className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                            {item.marks} Marks
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-purple-400" />
                            {item.difficulty}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleOpenPaper(item)}
                        className="w-full rounded-xl py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-medium flex items-center justify-center gap-2 shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Preview & Download
                      </Button>
                    </GlassCard>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 space-y-4 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center mx-auto text-muted-foreground">
                  <History className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-heading">No History Found</h3>
                  <p className="text-xs text-muted-foreground">
                    {searchQuery
                      ? "No question papers match your search query."
                      : "You haven't generated any question papers yet. Create your first paper using the wizard!"}
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/generate")}
                  className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium px-6 py-4 inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Paper
                </Button>
              </div>
            )}
          </div>
        </ProtectedRoute>
      </main>

      <Footer />
    </>
  );
}
