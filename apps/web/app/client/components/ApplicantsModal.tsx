"use client";

import { useState } from "react";
import {
  X,
  Star,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Search,
  Zap,
  ArrowRight,
  ExternalLink,
  Award,
  Lock,
} from "lucide-react";

export interface Applicant {
  id: string;
  name: string;
  avatar: string;
  role: string;
  rating: number;
  completedJobs: number;
  isPro: boolean;
  skills: string[];
  proposedUSD: number;
  proposedINR: number;
  proposal: string;
  githubUrl: string;
  portfolioUrl: string;
}

interface ApplicantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  budgetUSD: number;
  budgetINR: number;
  applicants: Applicant[];
  onHire: (applicant: Applicant) => void;
}

export default function ApplicantsModal({
  isOpen,
  onClose,
  projectTitle,
  budgetUSD,
  budgetINR,
  applicants,
  onHire,
}: ApplicantsModalProps) {
  const [proOnly, setProOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [skillFilter, setSkillFilter] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  if (!isOpen) return null;

  const filteredApplicants = applicants.filter((app) => {
    if (proOnly && !app.isPro) return false;
    if (minRating > 0 && app.rating < minRating) return false;
    if (skillFilter.trim()) {
      const query = skillFilter.toLowerCase();
      const hasSkill = app.skills.some((s) => s.toLowerCase().includes(query));
      const hasRole = app.role.toLowerCase().includes(query);
      const hasName = app.name.toLowerCase().includes(query);
      if (!hasSkill && !hasRole && !hasName) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-[#181D1A] border border-[#28332D] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#F5F5F4] max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#A3A3A3] hover:text-[#F5F5F4] p-1 rounded-lg hover:bg-[#101312] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 mb-5 border-b border-[#28332D] pb-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#101312] border border-[#28332D] text-[#84CC16]">
              APPLICANT PIPELINE
            </span>
            <span className="text-xs text-[#A3A3A3]">
              Budget: <span className="text-[#F5F5F4] font-bold">${budgetUSD}</span> (₹{budgetINR.toLocaleString("en-IN")})
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#F5F5F4] tracking-tight">
            Review Proposals for: <span className="text-[#84CC16]">{projectTitle}</span>
          </h2>
        </div>

        {/* Filter Bar (PRO user, Min rating, Skills) */}
        <div className="p-3.5 rounded-2xl bg-[#101312] border border-[#28332D] flex flex-wrap items-center justify-between gap-3 mb-4">
          
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#A3A3A3]" />
            <input
              type="text"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="Filter by skill, role or name..."
              className="bg-transparent text-xs text-[#F5F5F4] placeholder-[#A3A3A3]/50 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Pro Only Toggle */}
            <button
              onClick={() => setProOnly(!proOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition border ${
                proOnly
                  ? "bg-[#84CC16] text-[#101312] border-[#84CC16] font-bold"
                  : "bg-[#181D1A] text-[#A3A3A3] border-[#28332D] hover:text-[#F5F5F4]"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>PRO Talent Only</span>
            </button>

            {/* Rating Filter Dropdown */}
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-[#181D1A] border border-[#28332D] text-xs font-mono text-[#F5F5F4] focus:outline-none"
            >
              <option value={0}>All Ratings</option>
              <option value={4.0}>⭐ 4.0+ Rating (Pro Quality)</option>
              <option value={4.8}>⭐ 4.8+ Rating (Top Tier)</option>
            </select>
          </div>
        </div>

        {/* Applicants List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {filteredApplicants.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#A3A3A3] space-y-2">
              <Filter className="w-8 h-8 mx-auto text-[#28332D]" />
              <p>No applicants match the selected criteria.</p>
              <button
                onClick={() => {
                  setProOnly(false);
                  setMinRating(0);
                  setSkillFilter("");
                }}
                className="text-[#84CC16] hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredApplicants.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-[#181D1A] border border-[#28332D] hover:border-[#84CC16]/50 transition-all space-y-4 shadow-sm"
              >
                {/* Top Row: Info & Rate */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#101312] border border-[#28332D] flex items-center justify-center font-bold text-sm text-[#84CC16]">
                      {app.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F5F5F4] text-base">{app.name}</span>
                        {app.isPro && (
                          <span className="px-2 py-0.5 rounded-full bg-[#84CC16]/20 border border-[#84CC16]/40 text-[#84CC16] font-mono text-[10px] font-bold flex items-center gap-1">
                            <Award className="w-3 h-3" /> PRO
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#A3A3A3]">{app.role}</span>
                    </div>
                  </div>

                  {/* Rating & Proposed Rate */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1 text-[#BEF264] bg-[#101312] px-2.5 py-1 rounded-lg border border-[#28332D]">
                      <Star className="w-3.5 h-3.5 fill-[#BEF264]" />
                      <span className="font-bold">{app.rating.toFixed(1)}</span>
                      <span className="text-[#A3A3A3]">({app.completedJobs} jobs)</span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-[#F5F5F4] font-mono">${app.proposedUSD}</span>
                      <span className="text-[11px] text-[#A3A3A3] block font-mono">₹{app.proposedINR.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* Proposal Text */}
                <p className="text-xs text-[#A3A3A3] leading-relaxed bg-[#101312] p-3.5 rounded-xl border border-[#28332D]">
                  "{app.proposal}"
                </p>

                {/* Skills tags & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap gap-1.5">
                    {app.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#101312] border border-[#28332D] text-[11px] font-mono text-[#A3A3A3]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        onHire(app);
                        onClose();
                      }}
                      className="px-4 py-2 rounded-xl bg-[#84CC16] hover:bg-[#BEF264] text-[#101312] font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-[#84CC16]/20"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Select & Lock Escrow</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
