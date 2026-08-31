"use client";

import { freelancerStats } from "@/lib/mock-data";
import { StarIcon } from "@heroicons/react/20/solid";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

export default function ProfilePage() {
  return (
    <div className="w-full flex flex-col items-center justify-center pb-20">
      <div className="w-full max-w-3xl space-y-12 text-center">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-[#F5F5F4] mb-4 tracking-tight animate-float">
            Decentralized Identity (DID)
          </h1>
          <p className="text-[#A3A3A3] text-xl font-light">
            Manage your on-chain reputation and verified credentials.
          </p>
        </div>

        <div className="bg-[#181D1A] border border-white/5 rounded-[2.5rem] p-12 text-left space-y-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center space-y-6 mb-12">
            <div className="h-32 w-32 rounded-full bg-gradient-to-tr from-[#22C55E] to-[#BEF264] flex items-center justify-center border-8 border-[#101312] shadow-xl interactive hover:scale-105 transition-transform duration-500 ease-[var(--ease-fluid)]">
              <span className="text-3xl font-bold text-[#101312]">W3</span>
            </div>
            
            <div className="flex items-center space-x-6 text-[#F5F5F4]">
              <div className="text-center">
                <div className="text-3xl font-bold tracking-tight">{freelancerStats.completedProjects}</div>
                <div className="text-sm text-[#A3A3A3] uppercase tracking-wider">Completed</div>
              </div>
              <div className="h-10 w-px bg-white/10"></div>
              <div className="text-center flex flex-col items-center">
                <div className="text-3xl font-bold tracking-tight flex items-center">
                  {freelancerStats.rating} 
                  <StarIcon className="w-6 h-6 text-[#F59E0B] ml-1" />
                </div>
                <div className="text-sm text-[#A3A3A3] uppercase tracking-wider">{freelancerStats.reviewsCount} Reviews</div>
              </div>
            </div>
          </div>

          <div className="space-y-8 relative z-10">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider ml-2">Display Name</label>
              <div className="h-16 w-full bg-[#101312] rounded-2xl border border-white/5 px-6 flex items-center interactive hover:border-white/20 transition-colors">
                <span className="text-[#F5F5F4] text-lg opacity-50">Enter display name...</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider ml-2">Verified Skills</label>
              <div className="h-16 w-full bg-[#101312] rounded-2xl border border-white/5 px-6 flex items-center interactive hover:border-white/20 transition-colors">
                <span className="text-[#F5F5F4] text-lg opacity-50">e.g., Solidity, Next.js</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider ml-2">Wallet Address</label>
              <div className="h-16 w-full bg-[#101312] rounded-2xl border border-white/5 px-6 flex items-center interactive hover:border-white/20 transition-colors">
                <span className="text-[#F5F5F4] font-mono opacity-50">0x...</span>
              </div>
            </div>
          </div>

        </div>

        {/* Reviews Section */}
        <div className="bg-[#181D1A] border border-white/5 rounded-[2.5rem] p-12 text-left space-y-8 shadow-2xl relative overflow-hidden group mt-12">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#F5F5F4] tracking-tight flex items-center">
              <CheckBadgeIcon className="w-8 h-8 text-[#84CC16] mr-3" />
              Client Reviews
            </h2>
            <div className="text-[#A3A3A3] text-sm bg-white/5 px-4 py-2 rounded-full">
              Showing recent
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            {freelancerStats.reviews.map((review) => (
              <div key={review.id} className="bg-[#101312] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors interactive">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-[#F5F5F4]">{review.author}</h4>
                    <span className="text-sm text-[#A3A3A3]">{review.date}</span>
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon 
                        key={i} 
                        className={`w-5 h-5 ${i < review.rating ? "text-[#F59E0B]" : "text-white/10"}`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[#D4D4D4] font-light leading-relaxed">
                  "{review.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
