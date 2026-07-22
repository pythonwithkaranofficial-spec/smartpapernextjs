"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "firebase/auth";
import { AuthService } from "@/lib/firebase/auth-service";
import { DatabaseUser } from "@/types/db";
import { toast } from "sonner";

export type AuthModalView = "login" | "signup" | "forgot-password";

interface AuthContextType {
  firebaseUser: User | null;
  dbUser: DatabaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  authModalOpen: boolean;
  authModalView: AuthModalView;
  openAuthModal: (view?: AuthModalView) => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: AuthModalView) => void;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (code: string, newPassword: string) => Promise<void>;
  syncUserWithTurso: () => Promise<DatabaseUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalView, setAuthModalView] = useState<AuthModalView>("login");

  const openAuthModal = (view: AuthModalView = "login") => {
    setAuthModalView(view);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  /**
   * Synchronize authenticated user record with Turso DB
   */
  const syncUserWithTurso = useCallback(async (): Promise<DatabaseUser | null> => {
    const user = AuthService.getCurrentUser();
    if (!user) {
      setDbUser(null);
      return null;
    }

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: user.displayName,
          photoURL: user.photoURL,
          email: user.email,
          providerId: user.providerData[0]?.providerId || "email",
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setDbUser(json.data);
        return json.data;
      }
    } catch (error) {
      console.error("[AuthProvider] Failed to sync user with Turso:", error);
    }
    return null;
  }, []);

  // Listen to Firebase Auth state updates
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChangedListener(async (user) => {
      setFirebaseUser(user);
      if (user) {
        await syncUserWithTurso();
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncUserWithTurso]);

  // Auth Operations
  const login = async (email: string, password: string) => {
    try {
      await AuthService.login(email, password);
      toast.success("Successfully logged in!");
      closeAuthModal();
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error("[Login Error]:", err);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const user = await AuthService.signUp(email, password, displayName);
      // Automatically send verification email
      await AuthService.sendVerificationEmail(user);
      toast.success("Account created! Verification email has been sent.");
      closeAuthModal();
    } catch (error: unknown) {
      console.error("[SignUp Error]:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await AuthService.loginWithGoogle();
      toast.success("Successfully signed in with Google!");
      closeAuthModal();
    } catch (error: unknown) {
      console.error("[Google Login Error]:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setFirebaseUser(null);
      setDbUser(null);
      toast.info("Logged out successfully.");
    } catch (error: unknown) {
      console.error("[Logout Error]:", error);
      toast.error("Failed to log out.");
    }
  };

  const sendVerificationEmail = async () => {
    try {
      await AuthService.sendVerificationEmail(firebaseUser);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error: unknown) {
      console.error("[Verification Email Error]:", error);
      toast.error("Failed to send verification email. Please try again.");
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await AuthService.forgotPassword(email);
      toast.success("Password reset email sent! Please check your inbox.");
      setAuthModalView("login");
    } catch (error: unknown) {
      console.error("[Forgot Password Error]:", error);
      throw error;
    }
  };

  const resetPassword = async (code: string, newPassword: string) => {
    try {
      await AuthService.resetPassword(code, newPassword);
      toast.success("Password reset successfully! You can now log in.");
      setAuthModalView("login");
    } catch (error: unknown) {
      console.error("[Reset Password Error]:", error);
      throw error;
    }
  };

  const isAuthenticated = !!firebaseUser;
  const isEmailVerified = firebaseUser?.emailVerified ?? false;

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        dbUser,
        loading,
        isAuthenticated,
        isEmailVerified,
        authModalOpen,
        authModalView,
        openAuthModal,
        closeAuthModal,
        setAuthModalView,
        login,
        signUp,
        loginWithGoogle,
        logout,
        sendVerificationEmail,
        forgotPassword,
        resetPassword,
        syncUserWithTurso,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
