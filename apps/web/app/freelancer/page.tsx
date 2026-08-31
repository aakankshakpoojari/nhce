"use client";

import Link from "next/link";
import { ArrowLeft, UserCheck, Sparkles, ShieldCheck } from "lucide-react";

export default function FreelancerDashboardPlaceholder() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center selection:bg-[#84CC16] selection:text-[#101312]">
      <div className="max-w-md w-full bg-[#181D1A] border border-[#28332D] rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#101312] border border-[#28332D] text-[#22C55E] flex items-center justify-center mx-auto shadow-inner">
          <UserCheck className="w-8 h-8" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101312] border border-[#28332D] text-[#22C55E] text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5" /> FREELANCER PORTAL
          </div>
          <h1 className="text-2xl font-extrabold text-[#F5F5F4]">
            Freelancer Dashboard
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-2 leading-relaxed">
            Workspace ready for integration. Ready to configure gig feeds, escrow claims, and verified Soulbound reputation badges.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#84CC16] hover:bg-[#BEF264] text-[#101312] font-semibold text-sm transition shadow-lg shadow-[#84CC16]/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to W3HIRE Home
        </Link>
      </div>
    </div>
  );
}
