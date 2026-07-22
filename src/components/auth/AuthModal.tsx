"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock, User as UserIcon, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

function getFriendlyErrorMessage(error: unknown): string {
  const errCode = (error as { code?: string })?.code || "";
  const errMessage = (error as { message?: string })?.message || "";

  switch (errCode) {
    case "auth/invalid-email":
      return "Invalid email address format.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password. Please try again.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters long.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completing.";
    case "auth/cancelled-popup-request":
      return "Sign-in request was cancelled.";
    case "auth/too-many-requests":
      return "Too many attempts. Access temporarily disabled. Try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    default:
      return errMessage || "An unexpected authentication error occurred.";
  }
}

export function AuthModal() {
  const {
    authModalOpen,
    authModalView,
    closeAuthModal,
    setAuthModalView,
    login,
    signUp,
    loginWithGoogle,
    forgotPassword,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setErrorMessage(null);
    setSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    closeAuthModal();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      resetForm();
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email || !password) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email, password, name || undefined);
      resetForm();
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setSubmitting(true);
    try {
      await forgotPassword(email);
      resetForm();
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleClick = async () => {
    setErrorMessage(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
      resetForm();
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={authModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md border border-white/10 bg-background/80 backdrop-blur-xl shadow-2xl rounded-2xl p-6">
        <DialogHeader className="flex flex-col items-center justify-center gap-2 text-center pb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.4)]">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <DialogTitle className="text-2xl font-bold font-heading bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
            {authModalView === "login" && "Welcome Back"}
            {authModalView === "signup" && "Create Account"}
            {authModalView === "forgot-password" && "Reset Password"}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {authModalView === "login" && "Sign in to access paper generation & saved history"}
            {authModalView === "signup" && "Sign up to start creating custom CBSE question papers"}
            {authModalView === "forgot-password" && "Enter your email to receive a password reset link"}
          </p>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium text-center animate-shake">
            {errorMessage}
          </div>
        )}

        {/* View Switcher: LOGIN */}
        {authModalView === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="teacher@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-muted/40 border-border/60 focus:border-blue-500 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setAuthModalView("forgot-password");
                  }}
                  className="text-xs text-blue-500 hover:text-blue-400 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-muted/40 border-border/60 focus:border-blue-500 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-[0_4px_14px_rgba(59,130,246,0.3)] transition-all duration-200"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </Button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-border/50 w-full" />
              <span className="bg-background px-3 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold absolute">
                Or Continue With
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleClick}
              disabled={submitting}
              className="w-full rounded-xl py-5 border-border/60 hover:bg-muted/40 font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google
            </Button>

            <p className="text-center text-xs text-muted-foreground pt-2">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setAuthModalView("signup");
                }}
                className="text-blue-500 hover:text-blue-400 font-semibold transition-colors"
              >
                Sign up
              </button>
            </p>
          </form>
        )}

        {/* View Switcher: SIGNUP */}
        {authModalView === "signup" && (
          <form onSubmit={handleSignUpSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-medium">
                Full Name
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Karan Saini"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 bg-muted/40 border-border/60 focus:border-blue-500 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-xs font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="teacher@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-muted/40 border-border/60 focus:border-blue-500 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-xs font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-muted/40 border-border/60 focus:border-blue-500 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-[0_4px_14px_rgba(59,130,246,0.3)] transition-all duration-200"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </Button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-border/50 w-full" />
              <span className="bg-background px-3 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold absolute">
                Or Register With
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleClick}
              disabled={submitting}
              className="w-full rounded-xl py-5 border-border/60 hover:bg-muted/40 font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google
            </Button>

            <p className="text-center text-xs text-muted-foreground pt-2">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setAuthModalView("login");
                }}
                className="text-blue-500 hover:text-blue-400 font-semibold transition-colors"
              >
                Sign in
              </button>
            </p>
          </form>
        )}

        {/* View Switcher: FORGOT PASSWORD */}
        {authModalView === "forgot-password" && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="text-xs font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="teacher@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-muted/40 border-border/60 focus:border-blue-500 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-[0_4px_14px_rgba(59,130,246,0.3)] transition-all duration-200"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setAuthModalView("login");
                }}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
