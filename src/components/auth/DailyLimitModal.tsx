"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, ArrowRight } from "lucide-react";

interface DailyLimitModalProps {
  open: boolean;
  onClose: () => void;
  usedToday?: number;
  dailyLimit?: number;
}

export function DailyLimitModal({ open, onClose, usedToday = 5, dailyLimit = 5 }: DailyLimitModalProps) {
  const router = useRouter();

  const handleUpgradeClick = () => {
    onClose();
    router.push("/profile");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md border border-amber-500/30 bg-background/90 backdrop-blur-xl shadow-2xl rounded-2xl p-6 text-center space-y-4">
        <DialogHeader className="flex flex-col items-center justify-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            <Crown className="w-7 h-7 text-amber-400 animate-pulse" />
          </div>
          <DialogTitle className="text-2xl font-bold font-heading">
            Daily Paper Limit Reached
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            You have generated <strong>{usedToday} of {dailyLimit} papers</strong> allowed on your current plan today.
          </p>
        </DialogHeader>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
          <p className="font-semibold">Upgrade to Pro or Premium for Higher Daily Limits!</p>
          <p className="text-amber-200/80">
            Pro Plan gives you <strong>50 papers/day</strong> and Premium gives you <strong>100 papers/day</strong>.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Button
            onClick={handleUpgradeClick}
            className="w-full rounded-xl py-5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium shadow-[0_4px_14px_rgba(245,158,11,0.3)]"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Upgrade Plan Now
          </Button>

          <Button
            variant="outline"
            onClick={onClose}
            className="w-full rounded-xl py-4 border-border/60 text-xs"
          >
            I&apos;ll Wait Until Tomorrow
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
