"use client";

import { freelancerStats } from "@/lib/mock-data";
import { StarIcon } from "@heroicons/react/20/solid";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import Link from "next/link";
import WalletNoticeBanner from "@/components/ui/WalletNoticeBanner";

export default function ProfilePage() {
  const [isPro, setIsPro] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedPro = localStorage.getItem("w3hire_is_pro");
    if (storedPro === "true") {
      setIsPro(true);
    }
  }, []);
  if (!isClient) return null;

  if (!isPro) {
    return (
      <main className="flex-1 w-full mx-auto px-6 py-8 space-y-8">
        <WalletNoticeBanner role="freelancer" />

        <div className="flex flex-col items-start mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
            Decentralized Identity (DID)
          </h1>
          <p className="text-muted text-sm">
            Manage your on-chain reputation and verified credentials.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-background p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#84CC16]/5 to-transparent pointer-events-none" />
          <svg className="w-16 h-16 text-moss mb-6 drop-shadow-[0_0_15px_rgba(132,204,22,0.3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">Pro Member Access Only</h3>
          <p className="text-muted max-w-md mx-auto mb-8 text-sm leading-relaxed">
            Building and showcasing a decentralized identity is an exclusive feature for our verified Pro freelancers. Upgrade your account to unlock this directory.
          </p>
          <Link href="/pro" className="inline-flex items-center px-6 py-3 rounded-xl bg-moss hover:bg-[#65A30D] text-background font-bold text-sm transition-all shadow-[0_0_20px_rgba(132,204,22,0.2)] hover:shadow-[0_0_25px_rgba(132,204,22,0.4)]">
            Upgrade to Pro
            <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14m-7-7 7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full mx-auto px-6 py-8 space-y-8">
      <WalletNoticeBanner role="freelancer" />

      <div className="flex flex-col items-start mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
          Decentralized Identity (DID)
        </h1>
        <p className="text-muted text-sm">
          Manage your on-chain reputation and verified credentials.
        </p>
      </div>


      <div className="bg-surface border border-surface-border rounded-2xl p-8 space-y-8 text-left">
        <div className="flex items-center space-x-8 mb-8 pb-8 border-b border-surface-border">
          <div className="h-24 w-24 rounded-full bg-background border-4 border-surface-border flex items-center justify-center text-moss">
            <span className="text-2xl font-bold">W3</span>
          </div>
          
          <div className="flex items-center space-x-8 text-foreground">
            <div>
              <div className="text-2xl font-bold tracking-tight">{freelancerStats.completedProjects}</div>
              <div className="text-[10px] font-mono text-muted uppercase tracking-wider">Completed</div>
            </div>
            <div className="h-10 w-px bg-surface-border"></div>
            <div>
              <div className="text-2xl font-bold tracking-tight flex items-center">
                {freelancerStats.rating} 
                <StarIcon className="w-5 h-5 text-[#F59E0B] ml-1" />
              </div>
              <div className="text-[10px] font-mono text-muted uppercase tracking-wider">{freelancerStats.reviewsCount} Reviews</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-semibold text-muted uppercase tracking-wider">Display Name</label>
            <div className="h-12 w-full bg-background rounded-lg border border-surface-border px-4 flex items-center">
              <span className="text-foreground text-sm opacity-50">Enter display name...</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-semibold text-muted uppercase tracking-wider">Verified Skills</label>
            <div className="h-12 w-full bg-background rounded-lg border border-surface-border px-4 flex items-center">
              <span className="text-foreground text-sm opacity-50">e.g., Solidity, Next.js</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-mono font-semibold text-muted uppercase tracking-wider">Wallet Address</label>
            <div className="h-12 w-full bg-background rounded-lg border border-surface-border px-4 flex items-center">
              <span className="text-foreground font-mono text-sm opacity-50">0x...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-surface border border-surface-border rounded-2xl p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-surface-border pb-6">
          <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center">
            <CheckBadgeIcon className="w-6 h-6 text-moss mr-2" />
            Client Reviews
          </h2>
          <div className="text-muted text-[10px] font-mono uppercase bg-background border border-surface-border px-3 py-1 rounded-md">
            Showing recent
          </div>
        </div>

        <div className="space-y-4">
          {freelancerStats.reviews.map((review) => (
            <div key={review.id} className="bg-background border border-surface-border rounded-xl p-6 hover:border-moss/50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-sm font-bold text-foreground">{review.author}</h4>
                  <span className="text-xs font-mono text-muted">{review.date}</span>
                </div>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon 
                      key={i} 
                      className={`w-4 h-4 ${i < review.rating ? "text-[#F59E0B]" : "text-surface-border"}`} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-muted text-sm leading-relaxed">
                "{review.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
