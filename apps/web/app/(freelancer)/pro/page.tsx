"use client";

import { useState } from "react";
import { freelancerStats, bounties } from "@/lib/mock-data";
import { CheckCircleIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import BountyCard from "@/components/BountyCard";

export default function ProPage() {
  // TODO: toggle to true to preview the Pro dashboard
  const [isPro, setIsPro] = useState(false);

  // Check eligibility
  const meetsRating = freelancerStats.rating >= 4.5;
  const meetsProjects = freelancerStats.completedProjects >= 20;
  const meetsReviews = freelancerStats.reviewsCount >= 15;
  const isEligible = meetsRating && meetsProjects && meetsReviews;

  const proBounties = bounties.filter(b => b.proOnly);

  if (isPro) {
    return (
      <div className="w-full flex flex-col items-center justify-center pb-20">
        <div className="w-full max-w-4xl space-y-12 text-center">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-[#BEF264] mb-4 tracking-tight animate-float flex items-center justify-center">
              W3HIRE Pro
              <span className="ml-4 h-4 w-4 rounded-full bg-[#BEF264] shadow-[0_0_12px_rgba(190,242,100,0.8)]"></span>
            </h1>
            <p className="text-[#A3A3A3] text-xl font-light">
              Exclusive opportunities for our top tier freelancers.
            </p>
          </div>

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[#F5F5F4] tracking-tight">Pro Exclusive Bounties</h2>
            <button 
              onClick={() => setIsPro(false)}
              className="text-sm text-[#A3A3A3] hover:text-[#BEF264] transition-colors"
            >
              Downgrade (Preview)
            </button>
          </div>
          <div className="text-left space-y-8">
            <div className="grid gap-6">
              {proBounties.map(bounty => (
                <BountyCard key={bounty.id} {...bounty} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center pb-20">
      <div className="w-full max-w-3xl space-y-12 text-center">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-[#F5F5F4] mb-4 tracking-tight animate-float flex items-center justify-center">
            Unlock W3HIRE <span className="text-[#BEF264] ml-3">Pro</span>
          </h1>
          <p className="text-[#A3A3A3] text-xl font-light">
            Gain access to premium features, exclusive bounties, and priority placement.
          </p>
        </div>

        <div className="bg-[#181D1A] border border-white/5 rounded-[2.5rem] p-12 text-left space-y-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left: Pitch */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-[#F5F5F4]">What Pro Unlocks</h3>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <CheckCircleIcon className="w-6 h-6 text-[#BEF264] mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#F5F5F4] block">Unlimited Projects</strong>
                    <span className="text-[#A3A3A3] text-sm">Accept more than 3 projects a month.</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-6 h-6 text-[#BEF264] mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#F5F5F4] block">Pro-Only Bounties</strong>
                    <span className="text-[#A3A3A3] text-sm">Access exclusive high-value opportunities.</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-6 h-6 text-[#BEF264] mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#F5F5F4] block">Priority Placement</strong>
                    <span className="text-[#A3A3A3] text-sm">Stand out in client search results.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Right: Eligibility */}
            <div className="bg-[#101312] rounded-2xl border border-white/5 p-8 space-y-6">
              <h3 className="text-xl font-bold text-[#F5F5F4]">Your Eligibility</h3>
              
              <div className="space-y-5">
                {/* Rating */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#D4D4D4]">Maintain 4.5+ Rating</span>
                    {meetsRating ? (
                      <CheckCircleIcon className="w-5 h-5 text-[#84CC16]" />
                    ) : (
                      <span className="text-xs text-[#A3A3A3]">{freelancerStats.rating} / 4.5</span>
                    )}
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#BEF264] rounded-full" style={{ width: `${Math.min((freelancerStats.rating / 4.5) * 100, 100)}%` }}></div>
                  </div>
                </div>

                {/* Projects */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#D4D4D4]">20+ Completed Projects</span>
                    {meetsProjects ? (
                      <CheckCircleIcon className="w-5 h-5 text-[#84CC16]" />
                    ) : (
                      <span className="text-xs text-[#A3A3A3]">{freelancerStats.completedProjects} / 20</span>
                    )}
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#BEF264] rounded-full" style={{ width: `${Math.min((freelancerStats.completedProjects / 20) * 100, 100)}%` }}></div>
                  </div>
                </div>

                {/* Reviews */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#D4D4D4]">15+ Client Reviews</span>
                    {meetsReviews ? (
                      <CheckCircleIcon className="w-5 h-5 text-[#84CC16]" />
                    ) : (
                      <span className="text-xs text-[#A3A3A3]">{freelancerStats.reviewsCount} / 15</span>
                    )}
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#BEF264] rounded-full" style={{ width: `${Math.min((freelancerStats.reviewsCount / 15) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => setIsPro(true)}
                  className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center ${
                    isEligible 
                      ? "bg-[#BEF264] text-[#101312] hover:bg-[#A3E635] shadow-[0_0_15px_rgba(190,242,100,0.3)] interactive" 
                      : "bg-[#BEF264] text-[#101312] hover:bg-[#A3E635] shadow-[0_0_15px_rgba(190,242,100,0.3)] interactive"
                  }`}
                >
                  {!isEligible && <LockClosedIcon className="w-5 h-5 mr-2 hidden" />}
                  {isEligible ? "Upgrade to Pro" : "Mock Upgrade to Pro"}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
