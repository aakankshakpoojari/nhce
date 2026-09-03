"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Star,
  Award,
  ShieldCheck,
  Briefcase,
  ArrowLeft,
  ExternalLink,
  Zap,
} from "lucide-react";
import ClientNavbar from "../components/ClientNavbar";

import { freelancersList as TALENT_DIRECTORY } from "@/lib/mock-data";

export default function BrowseTalentPage() {
  const [proOnly, setProOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState(0);

  const filteredTalent = TALENT_DIRECTORY.filter((t) => {
    if (proOnly && !t.isPro) return false;
    if (minRating > 0 && t.rating < minRating) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSkill = t.skills.some((s) => s.toLowerCase().includes(q));
      const matchName = t.name.toLowerCase().includes(q);
      const matchRole = t.role.toLowerCase().includes(q);
      if (!matchSkill && !matchName && !matchRole) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col selection:bg-moss selection:text-background">
      
      {/* Top Navbar */}
      <ClientNavbar
        creditsRemaining={3}
        maxCredits={3}
        isPro={false}
        onPostProjectClick={() => {}}
        onUpgradeProClick={() => {}}
        notifications={[]}
        onMarkNotificationsRead={() => {}}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        
        {/* Header Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Verified Web3 Talent Directory
          </h1>
          <p className="text-xs text-muted">
            Browse and filter through builders verified on-chain with Soulbound credentials and proven escrow milestone track records.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-surface border border-surface-border flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 flex-1 min-w-[240px] bg-background px-3.5 py-2 rounded-xl border border-surface-border">
            <Search className="w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by skill, name or role..."
              className="bg-transparent text-xs text-foreground placeholder-[#A3A3A3]/50 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setProOnly(!proOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition border ${
                proOnly
                  ? "bg-moss text-background border-moss font-bold"
                  : "bg-background text-muted border-surface-border hover:text-foreground"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>PRO Verified Only</span>
            </button>

            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="px-3 py-2 rounded-xl bg-background border border-surface-border text-xs font-mono text-foreground focus:outline-none"
            >
              <option value={0}>All Ratings</option>
              <option value={4.0}>⭐ 4.0+ Rating (Pro Quality)</option>
              <option value={4.8}>⭐ 4.8+ Rating (Top Tier)</option>
            </select>
          </div>
        </div>

        {/* Talent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTalent.map((t) => (
            <div
              key={t.id}
              className="p-6 rounded-2xl bg-surface border border-surface-border hover:border-moss/50 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-background border border-surface-border flex items-center justify-center font-bold text-base text-moss">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-base">{t.name}</span>
                        {t.isPro && (
                          <span className="px-2 py-0.5 rounded-full bg-moss/20 border border-moss/40 text-moss font-mono text-[10px] font-bold flex items-center gap-1">
                            <Award className="w-3 h-3" /> PRO
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted">{t.role}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-foreground font-mono">${t.hourlyUSD}/hr</span>
                    <span className="text-[11px] text-muted block font-mono">₹{t.hourlyINR.toLocaleString("en-IN")}/hr</span>
                  </div>
                </div>

                <p className="text-xs text-muted leading-relaxed">
                  {t.bio}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {t.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-background border border-surface-border text-[11px] font-mono text-muted"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Row */}
              <div className="pt-3 border-t border-surface-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-[#BEF264] font-mono font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#BEF264]" />
                  <span>{t.rating.toFixed(2)}</span>
                  <span className="text-muted font-normal">({t.completedJobs} projects completed)</span>
                </div>

                <Link
                  href={`/client/freelancers/${t.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-background hover:bg-moss text-foreground hover:text-background border border-surface-border hover:border-moss transition text-xs font-semibold"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
