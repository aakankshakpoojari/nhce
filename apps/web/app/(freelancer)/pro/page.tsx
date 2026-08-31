"use client";

import { useState, useEffect } from "react";
import { freelancerStats, bounties } from "@/lib/mock-data";
import { CheckCircleIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import { Sparkles, ArrowRight } from "lucide-react";
import BountyCard from "@/components/BountyCard";

export default function ProPage() {
  const [isPro, setIsPro] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedPro = localStorage.getItem("w3hire_is_pro");
    if (storedPro === "true") {
      setIsPro(true);
    }
  }, []);

  const handleUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      localStorage.setItem("w3hire_is_pro", "true");
      setIsPro(true);
      setIsProcessing(false);
      // Force reload to apply changes everywhere (like Navbar, etc)
      window.location.reload();
    }, 1200);
  };

  const handleDowngrade = () => {
    localStorage.removeItem("w3hire_is_pro");
    setIsPro(false);
    // Force reload to apply changes everywhere
    window.location.reload();
  };

  // Check eligibility
  const meetsRating = freelancerStats.rating >= 4.5;
  const meetsProjects = freelancerStats.completedProjects >= 20;
  const meetsReviews = freelancerStats.reviewsCount >= 15;
  const isEligible = meetsRating && meetsProjects && meetsReviews;

  const proBounties = bounties.filter(b => b.proOnly);

  if (isPro) {
    return (
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col items-start mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2 flex items-center">
            W3HIRE Pro
            <span className="ml-3 h-3 w-3 rounded-full bg-moss"></span>
          </h1>
          <p className="text-muted text-sm">
            Exclusive opportunities for our top tier freelancers.
          </p>
        </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Pro Exclusive Bounties</h2>
            <button 
              onClick={handleDowngrade}
              className="text-xs font-mono font-semibold text-moss hover:underline"
            >
              Downgrade (Preview)
            </button>
          </div>
          <div className="grid gap-6">
            {proBounties.map(bounty => (
              <BountyCard key={bounty.id} {...bounty} />
            ))}
          </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex items-center justify-center">
      <div className="relative w-full max-w-lg bg-surface border-2 border-moss/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(132,204,22,0.2)] text-foreground">
        
        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-background border border-moss/40 flex items-center justify-center mx-auto text-moss shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
            Upgrade to W3HIRE <span className="text-moss">PRO</span>
          </h2>
          <p className="text-xs text-muted max-w-xs mx-auto">
            Unlimited applications, priority matching, and zero platform fees.
          </p>
        </div>

        {/* Pricing Selection */}
        <div className="p-4 rounded-2xl bg-background border border-surface-border flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-muted">Freelancer Pro Subscription</div>
            <div className="text-2xl font-extrabold text-foreground font-mono mt-0.5">
              $19 <span className="text-xs text-muted font-normal">/ month (₹1,580)</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-moss/20 border border-moss/40 text-moss font-mono text-[10px] font-bold uppercase">
            Zero Fees
          </span>
        </div>

        {/* Pro Benefits Checklist */}
        <div className="space-y-3 text-xs text-muted mb-8">
          <div className="flex items-center gap-2.5">
            <CheckCircleIcon className="w-4 h-4 text-moss shrink-0" />
            <span className="text-foreground">Apply to exclusive high-value Pro-Only Bounties</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircleIcon className="w-4 h-4 text-moss shrink-0" />
            <span className="text-foreground">Verified Pro Freelancer Badge on your profile</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircleIcon className="w-4 h-4 text-moss shrink-0" />
            <span className="text-foreground">0% platform fees on all escrow payouts</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircleIcon className="w-4 h-4 text-moss shrink-0" />
            <span className="text-foreground">Priority placement in client search results</span>
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
    </main>
  );
}
