"use client";

import Link from "next/link";
import { ArrowLeft, UserCheck, Sparkles, ShieldCheck } from "lucide-react";

export default function FreelancerDashboardPlaceholder() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center selection:bg-moss selection:text-background">
      <div className="max-w-md w-full bg-surface border border-surface-border rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-background border border-surface-border text-[#22C55E] flex items-center justify-center mx-auto shadow-inner">
          <UserCheck className="w-8 h-8" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-surface-border text-[#22C55E] text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5" /> FREELANCER PORTAL
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">
            Freelancer Dashboard
          </h1>
          <p className="text-xs text-muted mt-2 leading-relaxed">
            Workspace ready for integration. Ready to configure gig feeds, escrow claims, and verified Soulbound reputation badges.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-moss hover:bg-[#BEF264] text-background font-semibold text-sm transition shadow-lg shadow-[#84CC16]/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to W3HIRE Home
        </Link>
      </div>
    </div>
  );
}
