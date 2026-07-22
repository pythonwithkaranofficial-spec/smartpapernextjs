"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { Footer } from "@/components/landing/Footer";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/AuthProvider";
import { Sparkles, Lock, Loader2, CheckCircle2, ArrowRight } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetPassword } = useAuth();

  const oobCode = searchParams.get("oobCode");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setErrorMessage("Invalid or missing password reset code.");
    }
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!oobCode) {
      setErrorMessage("Invalid or missing password reset code.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(oobCode, newPassword);
      setSuccess(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Password reset failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <Navbar />

      <main className="flex-grow pt-28 pb-20 flex items-center justify-center px-4">
        <GlassCard className="max-w-md w-full p-8 space-y-6">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.4)]">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <h1 className="text-3xl font-extrabold font-heading bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
              Reset Password
            </h1>
            <p className="text-xs text-muted-foreground">
              Enter your new password below to reset your account password.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium text-center">
              {errorMessage}
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold">Your password has been reset successfully!</p>
              <Button
                onClick={() => router.push("/login")}
                className="w-full rounded-xl py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-md"
              >
                Proceed to Sign In <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-xs font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 bg-muted/40 border-border/60 focus:border-blue-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-xs font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 bg-muted/40 border-border/60 focus:border-blue-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting || !oobCode}
                className="w-full rounded-xl py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-[0_4px_14px_rgba(59,130,246,0.3)] transition-all duration-200"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Reset Password"}
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  Cancel & Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </GlassCard>
      </main>

      <Footer />
    </>
  );
}
