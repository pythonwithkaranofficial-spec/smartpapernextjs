"use client";

import React, { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { Footer } from "@/components/landing/Footer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthService } from "@/lib/firebase/auth-service";
import { compressImageToBase64 } from "@/lib/utils";
import { UserPlan } from "@/types/auth";
import {
  User as UserIcon,
  ShieldCheck,
  AlertCircle,
  Crown,
  Sparkles,
  Check,
  Loader2,
  RefreshCw,
  Camera,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

const PLANS: { key: UserPlan; name: string; limit: string; price: string; features: string[] }[] = [
  {
    key: "FREE",
    name: "Free Plan",
    limit: "5 Papers / day",
    price: "₹0",
    features: ["5 Question Papers per day", "Standard AI Generator", "PDF & Word Export", "Standard Support"],
  },
  {
    key: "PRO",
    name: "Pro Educator",
    limit: "50 Papers / day",
    price: "₹499 / mo",
    features: ["50 Question Papers per day", "Custom AI Prompt Generator", "Priority AI Queue", "Saved History Cloud Sync", "Premium Support"],
  },
  {
    key: "PREMIUM",
    name: "Premium Institute",
    limit: "100 Papers / day",
    price: "₹999 / mo",
    features: ["100 Question Papers per day", "Custom School Watermarks", "Unlimited Saved History", "Custom Branding", "24/7 Dedicated Support"],
  },
];

export default function ProfilePage() {
  const { firebaseUser, dbUser, isEmailVerified, sendVerificationEmail, syncUserWithTurso } = useAuth();

  const [displayName, setDisplayName] = useState(firebaseUser?.displayName || dbUser?.name || "");
  const [updatingName, setUpdatingName] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState<UserPlan | null>(null);
  const [sendingVerification, setSendingVerification] = useState(false);

  const [usageInfo, setUsageInfo] = useState<{ usedToday: number; dailyLimit: number; remainingToday: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadUsage() {
      try {
        const token = await AuthService.getFirebaseToken();
        if (!token) return;

        const res = await fetch("/api/user/usage", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success && json.data) {
          setUsageInfo(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch user usage:", err);
      }
    }

    loadUsage();
  }, [dbUser?.plan]);

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setUpdatingName(true);
    try {
      const user = AuthService.getCurrentUser();
      if (user) {
        const { updateProfile } = await import("firebase/auth");
        await updateProfile(user, { displayName });
        await syncUserWithTurso();
        toast.success("Profile name updated successfully!");
      }
    } catch (err) {
      console.error("Name update error:", err);
      toast.error("Failed to update profile name.");
    } finally {
      setUpdatingName(false);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const base64Photo = await compressImageToBase64(file, 150, 150, 0.85);
      const user = AuthService.getCurrentUser();

      if (user) {
        const { updateProfile } = await import("firebase/auth");
        await updateProfile(user, { photoURL: base64Photo });
        await syncUserWithTurso();
        toast.success("Profile photo updated & saved to Turso DB!");
      }
    } catch (err) {
      console.error("Photo upload error:", err);
      toast.error("Failed to upload profile photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePlanUpgrade = async (newPlan: UserPlan) => {
    setUpdatingPlan(newPlan);
    try {
      const token = await AuthService.getFirebaseToken();
      if (!token) return;

      const res = await fetch("/api/user/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: newPlan }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Plan updated to ${newPlan}!`);
        await syncUserWithTurso();
      } else {
        toast.error(json.error?.message || "Failed to update plan.");
      }
    } catch (err) {
      console.error("Plan upgrade error:", err);
      toast.error("Failed to update plan.");
    } finally {
      setUpdatingPlan(null);
    }
  };

  const handleResendEmail = async () => {
    setSendingVerification(true);
    try {
      await sendVerificationEmail();
    } finally {
      setSendingVerification(false);
    }
  };

  const userPhoto = firebaseUser?.photoURL || dbUser?.photo_url;
  const currentPlan = dbUser?.plan || "FREE";
  const usedToday = usageInfo?.usedToday ?? 0;
  const dailyLimit = usageInfo?.dailyLimit ?? 5;
  const usagePercentage = Math.min(100, Math.round((usedToday / dailyLimit) * 100));

  return (
    <>
      <AnimatedBackground />
      <Navbar />

      <main className="flex-grow pt-28 pb-20">
        <ProtectedRoute requireEmailVerification={false}>
          <div className="container mx-auto px-4 max-w-6xl space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <UserIcon className="w-3.5 h-3.5" />
                <span>User Dashboard</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading tracking-tight">
                Account & Subscription
              </h1>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Manage your profile details, upload avatar, view daily quotas, and upgrade your plan.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Details Card */}
              <GlassCard className="p-6 space-y-6 lg:col-span-1">
                <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-border/40">
                  {/* Avatar Upload Container */}
                  <div className="relative group">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/*"
                      className="hidden"
                    />

                    {userPhoto ? (
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-500/40 shadow-lg relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={userPhoto}
                          alt="User Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                        {(displayName || firebaseUser?.email || "U").substring(0, 2).toUpperCase()}
                      </div>
                    )}

                    {/* Camera Change Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md transition-all group-hover:scale-110"
                      title="Upload profile photo"
                    >
                      {uploadingPhoto ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Camera className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="rounded-xl border-border/60 text-xs flex items-center gap-1.5 h-8 px-3"
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-blue-400" />
                    )}
                    Upload Photo
                  </Button>

                  <div>
                    <h3 className="text-lg font-bold font-heading">{displayName || "User"}</h3>
                    <p className="text-xs text-muted-foreground">{firebaseUser?.email}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {isEmailVerified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Email
                      </span>
                    ) : (
                      <button
                        onClick={handleResendEmail}
                        disabled={sendingVerification}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
                      >
                        {sendingVerification ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        Unverified (Resend Link)
                      </button>
                    )}
                  </div>
                </div>

                {/* Edit Display Name Form */}
                <form onSubmit={handleNameUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name" className="text-xs font-medium">
                      Display Name
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="display-name"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-9 bg-background/50 border-border/60 rounded-xl"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={updatingName}
                    className="w-full rounded-xl py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium"
                  >
                    {updatingName ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                  </Button>
                </form>

                {/* Daily Quota Card */}
                <div className="pt-4 border-t border-border/40 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      Daily Generation Quota
                    </span>
                    <span className="text-blue-400">
                      {usedToday} / {dailyLimit}
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-muted/60 overflow-hidden p-0.5 border border-border/40">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-muted-foreground text-center">
                    Resets daily. Upgrade to Pro or Premium for higher daily paper limits.
                  </p>
                </div>
              </GlassCard>

              {/* Plans & Subscriptions Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-bold font-heading">Choose Your Plan</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PLANS.map((plan) => {
                    const isCurrent = currentPlan === plan.key;
                    const isSelected = updatingPlan === plan.key;

                    return (
                      <GlassCard
                        key={plan.key}
                        className={`p-6 flex flex-col justify-between space-y-6 relative transition-all ${
                          isCurrent ? "border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.2)]" : ""
                        }`}
                      >
                        {isCurrent && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                            Active Plan
                          </span>
                        )}

                        <div className="space-y-3">
                          <h3 className="text-lg font-bold font-heading">{plan.name}</h3>
                          <div className="text-2xl font-extrabold">{plan.price}</div>
                          <p className="text-xs text-blue-400 font-semibold">{plan.limit}</p>

                          <ul className="space-y-2 pt-2 border-t border-border/40 text-xs">
                            {plan.features.map((feat, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button
                          onClick={() => handlePlanUpgrade(plan.key)}
                          disabled={isCurrent || isSelected}
                          className={`w-full rounded-xl py-4 text-xs font-medium ${
                            isCurrent
                              ? "bg-muted/40 text-muted-foreground border-none"
                              : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-sm"
                          }`}
                        >
                          {isSelected ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isCurrent ? (
                            "Current Plan"
                          ) : (
                            `Switch to ${plan.name}`
                          )}
                        </Button>
                      </GlassCard>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </main>

      <Footer />
    </>
  );
}
