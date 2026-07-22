"use client";

import { useState } from "react";
import { PaperConfig } from "@/types";
import { clientRateLimiter } from "@/lib/rate-limiter";
import { AuthService } from "@/lib/firebase/auth-service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useGeneratePaper() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const generatePaper = async (config: PaperConfig) => {
    // 1. Client-side rate limiting check
    if (!clientRateLimiter.canGenerate()) {
      const resetTime = clientRateLimiter.getResetTime();
      toast.error(`Daily limit reached. You can generate more papers in ${resetTime}.`);
      setError("Daily limit reached");
      return;
    }

    setLoading(true);
    setError(null);
    const toastId = toast.loading("We are creating your paper with our AI...");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate paper");
      }

      // Save to sessionStorage for preview page
      sessionStorage.setItem("generated_paper", JSON.stringify(data));
      
      // Save configuration used
      sessionStorage.setItem("last_paper_config", JSON.stringify(config));

      // Record count in client rate limiter
      clientRateLimiter.recordGeneration();

      // If user is authenticated, save paper to Turso DB history and increment usage count
      const firebaseToken = await AuthService.getFirebaseToken();
      if (firebaseToken) {
        // Background DB history save
        fetch("/api/user/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${firebaseToken}`,
          },
          body: JSON.stringify({
            class: config.isCustom && config.customClass ? config.customClass : config.classId,
            subject: config.isCustom && config.customSubject ? config.customSubject : config.subject,
            paper_type: config.examType,
            marks: config.totalMarks,
            difficulty: config.difficulty,
            paper_json: data,
          }),
        }).catch((err) => console.error("[History Save Error]:", err));

        // Background usage increment
        fetch("/api/user/usage/increment", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firebaseToken}`,
          },
        }).catch((err) => console.error("[Usage Increment Error]:", err));
      }

      toast.success("Question paper generated successfully!", { id: toastId });
      
      // Navigate to preview page
      router.push("/preview");
    } catch (e) {
      console.error(e);
      const errMsg = e instanceof Error ? e.message : "Something went wrong";
      setError(errMsg);
      toast.error(errMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return {
    generatePaper,
    loading,
    error,
  };
}
