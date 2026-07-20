"use client";

import { useState } from "react";
import { PaperConfig } from "@/types";
import { clientRateLimiter } from "@/lib/rate-limiter";
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
