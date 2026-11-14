"use client";

import { useState } from "react";
import { PaperConfig } from "@/types";
import { AuthService } from "@/lib/firebase/auth-service";
import { saveLocalPaperHistory } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useGeneratePaper() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const generatePaper = async (config: PaperConfig) => {
    setLoading(true);
    setError(null);
    const toastId = toast.loading("We are creating your paper with our AI...");

    try {
      const firebaseToken = await AuthService.getFirebaseToken();
      if (!firebaseToken) {
        throw new Error("Please sign in to generate papers.");
      }

      // Daily limits are enforced on the server (per account, per plan).
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify(config),
      });

      const rawText = await response.text();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          response.status === 504
            ? "The AI took too long to respond. Please try again."
            : `Server error (${response.status}). Please try again.`
        );
      }

      if (!response.ok) {
        if (response.status === 429 && typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("paper_generated"));
        }
        // Surface the validation reason (e.g. a marks-distribution mismatch) when present.
        const detail = data?.details?.questionDistribution?._errors?.[0];
        throw new Error(detail || data?.error || "Failed to generate paper");
      }

      // Save to sessionStorage for preview page
      sessionStorage.setItem("generated_paper", JSON.stringify(data));
      
      // Save configuration used
      sessionStorage.setItem("last_paper_config", JSON.stringify(config));

      // Save locally to browser paper history for lifetime offline/instant access
      // The server reports the generated paper's real total (may differ from the request
      // for official full-exam patterns).
      const paperMarks = typeof data?.totalMarks === "number" ? data.totalMarks : config.totalMarks;

      saveLocalPaperHistory({
        class: config.isCustom && config.customClass ? config.customClass : config.classId,
        subject: config.isCustom && config.customSubject ? config.customSubject : config.subject,
        paper_type: config.examType,
        marks: paperMarks,
        difficulty: config.difficulty,
        paper_json: data,
      });

      // Dispatch custom event for real-time profile & UI updates
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("paper_generated"));
      }

      // Background DB history save (usage was already counted by the server)
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
          marks: paperMarks,
          difficulty: config.difficulty,
          paper_json: data,
        }),
      }).catch((err) => console.error("[History Save Error]:", err));

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
