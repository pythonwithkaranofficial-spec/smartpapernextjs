"use client";

import React, { useEffect, useState, useRef } from "react";
import Script from "next/script";
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
  Zap,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface RazorpayResponse {
  razorpay_order_id?: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

async function safeParseJsonResponse(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any = null;
  if (contentType.includes("application/json")) {
    try {
      json = await res.json();
    } catch (e) {
      console.error("Failed to parse JSON response", e);
    }
  }

  if (!res.ok) {
    const errorMsg = json?.error?.message || json?.message || `Server request failed (${res.status})`;
    throw new Error(errorMsg);
  }

  if (!json) {
    throw new Error("Invalid or empty response received from server.");
  }

  return json;
}

interface PlanCardData {
  key: UserPlan;
  name: string;
  badge: string;
  limit: string;
  price: string;
  billingText: string;
  icon: React.ElementType;
  gradient: string;
  badgeGradient: string;
  features: string[];
  popular?: boolean;
}

const PLANS: PlanCardData[] = [
  {
    key: "FREE",
    name: "Free Tier",
    badge: "Basic Access",
    limit: "5 Papers / day",
    price: "₹0",
    billingText: "Forever Free",
    icon: UserIcon,
    gradient: "from-slate-500/20 to-zinc-500/10 border-border/50",
    badgeGradient: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    features: [
      "5 Question Papers per day",
      "Standard Board Curriculum",
      "PDF & Word DOCX Export",
      "Daily Reset at Midnight",
    ],
  },
  {
    key: "PRO",
    name: "1-Day Unlimited Pass",
    badge: "Instant 24-Hour Pass",
    limit: "Unlimited Papers / day",
    price: "₹21",
    billingText: "Valid for 24 Hours",
    icon: Zap,
    gradient: "from-amber-500/20 via-orange-500/15 to-yellow-500/10 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)]",
    badgeGradient: "bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold",
    popular: true,
    features: [
      "Unlimited Question Papers for 24 hrs",
      "Instant Activation on Payment",
      "Custom AI Generator Prompts",
      "Priority Fast AI Queue",
      "All Class & Subject Curriculums",
    ],
  },
  {
    key: "PREMIUM",
    name: "1-Year Educator Plan",
    badge: "Annual Value Pass",
    limit: "50 Papers / day for 1 Year",
    price: "₹399",
    billingText: "Per Year (Billed Annually)",
    icon: Calendar,
    gradient: "from-blue-500/20 via-indigo-500/15 to-purple-500/10 border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.2)]",
    badgeGradient: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold",
    features: [
      "50 Question Papers per day for 1 Year",
      "Full 365 Days Uninterrupted Access",
      "Custom School Watermark & Logo",
      "Saved History Cloud Storage",
      "24/7 Dedicated Support",
    ],
  },
];

export default function ProfilePage() {
  const { firebaseUser, dbUser, isEmailVerified, sendVerificationEmail, syncUserWithTurso } = useAuth();

  const [displayName, setDisplayName] = useState(firebaseUser?.displayName || dbUser?.name || "");
  const [updatingName, setUpdatingName] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState<UserPlan | null>(null);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<UserPlan | null>(null);

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
        const json = await safeParseJsonResponse(res);
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
        toast.success("Profile photo updated & saved!");
      }
    } catch (err) {
      console.error("Photo upload error:", err);
      toast.error("Failed to upload profile photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePlanUpgrade = async (newPlan: UserPlan) => {
    if (newPlan === "FREE") {
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

        const json = await safeParseJsonResponse(res);
        if (json.success) {
          toast.success("Plan updated to FREE!");
          await syncUserWithTurso();
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to update plan.");
      } finally {
        setUpdatingPlan(null);
      }
      return;
    }

    // Direct Instant Razorpay Checkout Flow for PRO (₹21) or PREMIUM (₹399)
    setUpdatingPlan(newPlan);
    try {
      const token = await AuthService.getFirebaseToken();
      if (!token) {
        toast.error("Please log in to upgrade your subscription.");
        setUpdatingPlan(null);
        return;
      }

      if (typeof window === "undefined" || !window.Razorpay) {
        toast.error("Razorpay SDK is loading. Please try again in a moment.");
        setUpdatingPlan(null);
        return;
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TGd0ItjJBk6QgH";
      const amountInPaise = newPlan === "PRO" ? 2100 : 39900;
      const planTitle = newPlan === "PRO" ? "₹21 1-Day Pass (Unlimited)" : "₹399 1-Year Educator Plan (50/day)";

      const options: RazorpayOptions = {
        key: keyId,
        amount: amountInPaise,
        currency: "INR",
        name: "Smart Paper AI",
        description: `Upgrade to ${planTitle}`,
        prefill: {
          name: displayName || firebaseUser?.displayName || "",
          email: firebaseUser?.email || "",
        },
        theme: {
          color: newPlan === "PRO" ? "#f59e0b" : "#3b82f6",
        },
        handler: async (response: RazorpayResponse) => {
          toast.loading("Verifying payment transaction...");
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || `ord_${Date.now()}`,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature || "",
                plan: newPlan,
              }),
            });

            const verifyJson = await safeParseJsonResponse(verifyRes);
            if (verifyJson.success) {
              toast.dismiss();
              toast.success(`🎉 Payment verified! Account upgraded to ${newPlan} plan instantly!`);
              await syncUserWithTurso();
            } else {
              toast.dismiss();
              toast.error(verifyJson.error?.message || "Payment verification failed.");
            }
          } catch (verifyErr) {
            console.error("Payment verification error:", verifyErr);
            toast.dismiss();
            toast.error(verifyErr instanceof Error ? verifyErr.message : "Payment verification error.");
          } finally {
            setUpdatingPlan(null);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rzp.on("payment.failed", function (response: any) {
        console.error("Razorpay payment failed:", response.error);
        toast.error(`Payment failed: ${response.error?.description || "Transaction cancelled"}`);
        setUpdatingPlan(null);
      });

      rzp.open();
    } catch (err) {
      console.error("Razorpay Checkout Error:", err);
      toast.error(err instanceof Error ? err.message : "Payment initialization failed.");
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
  const displayLimitText = dailyLimit > 9000 ? "Unlimited" : dailyLimit;
  const usagePercentage = dailyLimit > 9000 ? 100 : Math.min(100, Math.round((usedToday / dailyLimit) * 100));

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <AnimatedBackground />
      <Navbar />

      <main className="flex-grow pt-28 pb-20">
        <ProtectedRoute requireEmailVerification={false}>
          <div className="container mx-auto px-4 max-w-6xl space-y-10">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                <UserIcon className="w-3.5 h-3.5" />
                <span>User Dashboard & Subscriptions</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading tracking-tight text-foreground">
                Account & Subscription Plans
              </h1>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                Manage your account details and instantly upgrade your paper generation limits with Razorpay.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Info Sidebar */}
              <GlassCard className="p-6 space-y-6 lg:col-span-1 border border-border/50">
                <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-border/40">
                  {/* Avatar Photo */}
                  <div className="relative group">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/*"
                      className="hidden"
                    />

                    {userPhoto ? (
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500/50 shadow-xl relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={userPhoto}
                          alt="User Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-xl">
                        {(displayName || firebaseUser?.email || "U").substring(0, 2).toUpperCase()}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-all group-hover:scale-110"
                      title="Upload photo"
                    >
                      {uploadingPhoto ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="rounded-xl border-border/60 text-xs flex items-center gap-1.5 h-8 px-3.5 font-medium"
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-blue-400" />
                    )}
                    Upload Custom Photo
                  </Button>

                  <div>
                    <h3 className="text-xl font-extrabold font-heading text-foreground">{displayName || "User"}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{firebaseUser?.email}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {isEmailVerified ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Verified Account
                      </span>
                    ) : (
                      <button
                        onClick={handleResendEmail}
                        disabled={sendingVerification}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
                      >
                        {sendingVerification ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        Unverified (Resend Link)
                      </button>
                    )}
                  </div>
                </div>

                {/* Edit Display Name Form */}
                <form onSubmit={handleNameUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
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
                    className="w-full rounded-xl py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md transition-all"
                  >
                    {updatingName ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                  </Button>
                </form>

                {/* Daily Quota Counter */}
                <div className="pt-4 border-t border-border/40 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold font-heading">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Daily Paper Quota
                    </span>
                    <span className="text-blue-400 font-extrabold">
                      {usedToday} / {displayLimitText}
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-muted/60 overflow-hidden p-0.5 border border-border/40">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 transition-all duration-500"
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-muted-foreground text-center">
                    Quotas reset every midnight. Upgrade to 1-Day Pass (₹21) for unlimited papers or 1-Year Pass (₹399) for 50 papers/day!
                  </p>
                </div>
              </GlassCard>

              {/* Interactive Subscription Plans Grid */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">
                    Subscription & Educator Plans
                  </h2>
                </div>

                {/* Interactive Cards Container with Hover Blur Focus */}
                <div
                  className="grid grid-cols-1 md:grid-cols-3 gap-5"
                  onMouseLeave={() => setHoveredPlan(null)}
                >
                  {PLANS.map((plan) => {
                    const isCurrent = currentPlan === plan.key;
                    const isSelected = updatingPlan === plan.key;
                    const isHovered = hoveredPlan === plan.key;
                    const isAnyHovered = hoveredPlan !== null;

                    const IconComp = plan.icon;

                    return (
                      <GlassCard
                        key={plan.key}
                        onMouseEnter={() => setHoveredPlan(plan.key)}
                        className={`p-6 flex flex-col justify-between space-y-6 relative transition-all duration-300 transform border ${plan.gradient} ${
                          isHovered
                            ? "scale-105 z-20 shadow-[0_0_35px_rgba(59,130,246,0.35)] ring-2 ring-blue-500/60"
                            : isAnyHovered
                            ? "blur-[2.5px] opacity-40 scale-95"
                            : "opacity-100 scale-100"
                        } ${isCurrent ? "ring-2 ring-emerald-500/80" : ""}`}
                      >
                        {/* Badges */}
                        <div className="flex justify-between items-center w-full">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold border ${plan.badgeGradient}`}>
                            {plan.badge}
                          </span>
                          {isCurrent && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1">
                              <Check className="w-3 h-3" /> Active
                            </span>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-background/60 border border-border/50 text-amber-400 shadow-inner">
                              <IconComp className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-lg font-extrabold font-heading text-foreground">{plan.name}</h3>
                              <p className="text-xs font-bold text-amber-400">{plan.limit}</p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border/40">
                            <div className="text-3xl font-black font-heading text-foreground">
                              {plan.price}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-medium">
                              {plan.billingText}
                            </div>
                          </div>

                          {/* Features List */}
                          <ul className="space-y-2 pt-2 text-xs">
                            {plan.features.map((feat, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-foreground/90 font-medium">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Interactive Upgrade Button */}
                        <Button
                          onClick={() => handlePlanUpgrade(plan.key)}
                          disabled={isCurrent || isSelected}
                          className={`w-full rounded-xl py-5 text-xs font-extrabold tracking-wide uppercase shadow-lg transition-all duration-200 ${
                            isCurrent
                              ? "bg-muted/40 text-muted-foreground border-none cursor-default"
                              : plan.key === "PRO"
                              ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white shadow-[0_4px_16px_rgba(245,158,11,0.4)]"
                              : plan.key === "PREMIUM"
                              ? "bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-[0_4px_16px_rgba(59,130,246,0.4)]"
                              : "bg-muted text-foreground hover:bg-muted/80"
                          }`}
                        >
                          {isSelected ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : isCurrent ? (
                            "Current Active Plan"
                          ) : (
                            `Pay ${plan.price} & Upgrade Now`
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
