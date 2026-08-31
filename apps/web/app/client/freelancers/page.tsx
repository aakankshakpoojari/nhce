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

const TALENT_DIRECTORY = [
  {
    id: "tal-1",
    name: "Vikram Sharma",
    avatar: "VS",
    role: "Senior Solidity & Security Architect",
    rating: 4.95,
    completedJobs: 28,
    isPro: true,
    hourlyUSD: 95,
    hourlyINR: 7900,
    skills: ["Solidity", "Foundry", "Security Auditing", "Arbitrum", "DeFi"],
    bio: "Ex-Consensys contributor specializing in EVM smart contract audits, multisig architecture, and zero-knowledge escrow proofs.",
    didVerified: true,
  },
  {
    id: "tal-2",
    name: "Elena Rostova",
    avatar: "ER",
    role: "Web3 Frontend & UX Specialist",
    rating: 4.88,
    completedJobs: 19,
    isPro: true,
    hourlyUSD: 75,
    hourlyINR: 6240,
    skills: ["Next.js", "TypeScript", "Tailwind CSS", "Wagmi", "Ethers.js"],
    bio: "Crafting beautiful, high-converting crypto interfaces and dApp experiences with seamless MetaMask and WalletConnect integration.",
    didVerified: true,
  },
  {
    id: "tal-3",
    name: "Aakash Patel",
    avatar: "AP",
    role: "Rust & Solana Protocol Engineer",
    rating: 4.92,
    completedJobs: 22,
    isPro: true,
    hourlyUSD: 90,
    hourlyINR: 7490,
    skills: ["Rust", "Solana", "Anchor", "Smart Escrow"],
    bio: "High-performance protocol engineering, decentralized orderbooks, and cross-chain messaging contracts.",
    didVerified: true,
  },
  {
    id: "tal-4",
    name: "Samira Khan",
    avatar: "SK",
    role: "Junior Smart Contract Developer",
    rating: 3.9,
    completedJobs: 4,
    isPro: false,
    hourlyUSD: 45,
    hourlyINR: 3740,
    skills: ["Solidity", "Hardhat", "React"],
    bio: "Building test suites, token contracts, and basic NFT staking mechanics.",
    didVerified: false,
  },
];

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
    <div className="min-h-screen bg-transparent text-[#F5F5F4] flex flex-col selection:bg-[#84CC16] selection:text-[#101312]">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 px-6 py-3.5 border-b border-[#28332D] bg-[#181D1A]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/client" className="flex items-center gap-2 text-xs text-[#A3A3A3] hover:text-[#F5F5F4]">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Client Dashboard</span>
            </Link>
          </div>
          <span className="text-xs font-mono text-[#84CC16]">BROWSE VERIFIED TALENT</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        
        {/* Header Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-[#F5F5F4] tracking-tight">
            Verified Web3 Talent Directory
          </h1>
          <p className="text-xs text-[#A3A3A3]">
            Browse and filter through builders verified on-chain with Soulbound credentials and proven escrow milestone track records.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-[#181D1A] border border-[#28332D] flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 flex-1 min-w-[240px] bg-[#101312] px-3.5 py-2 rounded-xl border border-[#28332D]">
            <Search className="w-4 h-4 text-[#A3A3A3]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by skill, name or role..."
              className="bg-transparent text-xs text-[#F5F5F4] placeholder-[#A3A3A3]/50 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setProOnly(!proOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition border ${
                proOnly
                  ? "bg-[#84CC16] text-[#101312] border-[#84CC16] font-bold"
                  : "bg-[#101312] text-[#A3A3A3] border-[#28332D] hover:text-[#F5F5F4]"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>PRO Verified Only</span>
            </button>

            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="px-3 py-2 rounded-xl bg-[#101312] border border-[#28332D] text-xs font-mono text-[#F5F5F4] focus:outline-none"
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
              className="p-6 rounded-2xl bg-[#181D1A] border border-[#28332D] hover:border-[#84CC16]/50 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#101312] border border-[#28332D] flex items-center justify-center font-bold text-base text-[#84CC16]">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F5F5F4] text-base">{t.name}</span>
                        {t.isPro && (
                          <span className="px-2 py-0.5 rounded-full bg-[#84CC16]/20 border border-[#84CC16]/40 text-[#84CC16] font-mono text-[10px] font-bold flex items-center gap-1">
                            <Award className="w-3 h-3" /> PRO
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#A3A3A3]">{t.role}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-[#F5F5F4] font-mono">${t.hourlyUSD}/hr</span>
                    <span className="text-[11px] text-[#A3A3A3] block font-mono">₹{t.hourlyINR.toLocaleString("en-IN")}/hr</span>
                  </div>
                </div>

                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  {t.bio}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {t.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-[#101312] border border-[#28332D] text-[11px] font-mono text-[#A3A3A3]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Row */}
              <div className="pt-3 border-t border-[#28332D] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-[#BEF264] font-mono font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#BEF264]" />
                  <span>{t.rating.toFixed(2)}</span>
                  <span className="text-[#A3A3A3] font-normal">({t.completedJobs} projects completed)</span>
                </div>

                <Link
                  href="/client"
                  className="px-3.5 py-1.5 rounded-xl bg-[#101312] hover:bg-[#84CC16] text-[#F5F5F4] hover:text-[#101312] border border-[#28332D] hover:border-[#84CC16] transition text-xs font-semibold"
                >
                  Invite to Work
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
