"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { AlertCircle, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmailVerificationBanner() {
  const { isAuthenticated, isEmailVerified, firebaseUser, sendVerificationEmail } = useAuth();
  const [sending, setSending] = useState(false);

  if (!isAuthenticated || isEmailVerified || !firebaseUser) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    try {
      await sendVerificationEmail();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-md px-4 py-3 text-amber-200 text-xs font-medium flex items-center justify-between gap-4 z-30">
      <div className="flex items-center gap-2 max-w-3xl">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          Your email address <strong>{firebaseUser.email}</strong> is not verified. Please verify your email to unlock all paper generation features.
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleResend}
        disabled={sending}
        className="rounded-lg border-amber-500/40 hover:bg-amber-500/20 text-amber-200 text-xs h-8 px-3 shrink-0 flex items-center gap-1.5"
      >
        {sending ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Mail className="w-3.5 h-3.5" />
        )}
        Resend Email
      </Button>
    </div>
  );
}
