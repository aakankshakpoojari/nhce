"use client";

import { useState } from "react";
import { X, CheckCircle2, Sparkles, Zap, ShieldCheck, ArrowRight } from "lucide-react";

interface UpgradeProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPro: () => void;
}

export default function UpgradeProModal({
  isOpen,
  onClose,
  onConfirmPro,
}: UpgradeProModalProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmPro();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-surface border-2 border-moss/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(132,204,22,0.2)] text-foreground">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted hover:text-foreground p-1 rounded-lg hover:bg-background transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-background border border-moss/40 flex items-center justify-center mx-auto text-moss shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
            Upgrade to W3HIRE <span className="text-moss">PRO</span>
          </h2>
          <p className="text-xs text-muted max-w-xs mx-auto">
            Unlimited job posts, priority talent matching, and zero escrow protocol fee deductions.
          </p>
        </div>

        {/* Pricing Selection */}
        <div className="p-4 rounded-2xl bg-background border border-surface-border flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-muted">Client Pro Subscription</div>
            <div className="text-2xl font-extrabold text-foreground font-mono mt-0.5">
              $49 <span className="text-xs text-muted font-normal">/ month (₹4,075)</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-moss/20 border border-moss/40 text-moss font-mono text-[10px] font-bold uppercase">
            Unlimited Posts
          </span>
        </div>

        {/* Pro Benefits Checklist */}
        <div className="space-y-3 text-xs text-muted mb-6">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-moss shrink-0" />
            <span className="text-foreground">Unlimited project postings (no 3/month limit)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-moss shrink-0" />
            <span className="text-foreground">Verified Pro Client Badge on listings</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-moss shrink-0" />
            <span className="text-foreground">Instant Telegram & Web3 push application notifications</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-moss shrink-0" />
            <span className="text-foreground">Access to top 1% PRO verified talent directory</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleUpgrade}
          disabled={isProcessing}
          className="w-full py-3.5 px-4 rounded-xl font-bold bg-moss hover:bg-[#BEF264] text-background text-xs uppercase tracking-wider transition shadow-lg shadow-[#84CC16]/25 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isProcessing ? (
            <span>Processing Web3 Subscription...</span>
          ) : (
            <>
              <span>Activate Pro Membership</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
