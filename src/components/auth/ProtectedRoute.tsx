"use client";

import React from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/GlassCard";
import { Lock, MailCheck, Loader2, Sparkles } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

export function ProtectedRoute({ children, requireEmailVerification = true }: ProtectedRouteProps) {
  const {
    loading,
    isAuthenticated,
    isEmailVerified,
    openAuthModal,
    firebaseUser,
    sendVerificationEmail,
  } = useAuth();
  const [resending, setResending] = React.useState(false);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-xs text-muted-foreground font-medium">Verifying authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <GlassCard className="max-w-md w-full text-center p-8 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500/20 via-purple-500/20 to-cyan-400/20 border border-blue-500/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <Lock className="w-7 h-7 text-blue-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-heading">Authentication Required</h2>
            <p className="text-sm text-muted-foreground">
              Please sign in or create an account to access paper generation, customization, and saved history.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Button
              onClick={() => openAuthModal("login")}
              className="w-full rounded-xl py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:scale-[1.02] transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Sign In / Register
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (requireEmailVerification && !isEmailVerified) {
    const handleResend = async () => {
      setResending(true);
      try {
        await sendVerificationEmail();
      } finally {
        setResending(false);
      }
    };

    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <GlassCard className="max-w-md w-full text-center p-8 space-y-6 border-amber-500/30">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <MailCheck className="w-7 h-7 text-amber-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-heading">Verify Your Email</h2>
            <p className="text-sm text-muted-foreground">
              We sent a verification link to <strong>{firebaseUser?.email}</strong>. Please check your inbox and verify your email to continue.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Button
              onClick={handleResend}
              disabled={resending}
              className="w-full rounded-xl py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium shadow-[0_4px_14px_rgba(245,158,11,0.3)] hover:scale-[1.02] transition-all"
            >
              {resending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MailCheck className="w-4 h-4 mr-2" />}
              Resend Verification Email
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full rounded-xl py-5 border-border/60"
            >
              I&apos;ve Verified My Email
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return <>{children}</>;
}
