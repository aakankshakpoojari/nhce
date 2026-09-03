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
  Lock,
} from "lucide-react";

export interface Applicant {
  id: string;
  name: string;
  avatar: string;
  role: string;
  rating: number;
  completedJobs: number;
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
  const [minRating, setMinRating] = useState<number>(0);
  const [skillFilter, setSkillFilter] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  if (!isOpen) return null;

  const filteredApplicants = applicants.filter((app) => {
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
      <div className="relative w-full max-w-4xl bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 shadow-2xl text-foreground max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted hover:text-foreground p-1 rounded-lg hover:bg-background transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 mb-5 border-b border-surface-border pb-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-background border border-surface-border text-moss">
              APPLICANT PIPELINE
            </span>
            <span className="text-xs text-muted">
              Budget: <span className="text-foreground font-bold">${budgetUSD}</span> (₹{budgetINR.toLocaleString("en-IN")})
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            Review Proposals for: <span className="text-moss">{projectTitle}</span>
          </h2>
        </div>

        {/* Filter Bar (PRO user, Min rating, Skills) */}
        <div className="p-3.5 rounded-2xl bg-background border border-surface-border flex flex-wrap items-center justify-between gap-3 mb-4">
          
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted" />
            <input
              type="text"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="Filter by skill, role or name..."
              className="bg-transparent text-xs text-foreground placeholder-[#A3A3A3]/50 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Rating Filter Dropdown */}
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs font-mono text-foreground focus:outline-none"
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
            <div className="text-center py-12 text-xs text-muted space-y-2">
              <Filter className="w-8 h-8 mx-auto text-surface-border" />
              <p>No applicants match the selected criteria.</p>
              <button
                onClick={() => {
                  setMinRating(0);
                  setSkillFilter("");
                }}
                className="text-moss hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredApplicants.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-surface border border-surface-border hover:border-moss/50 transition-all space-y-4 shadow-sm"
              >
                {/* Top Row: Info & Rate */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-background border border-surface-border flex items-center justify-center font-bold text-sm text-moss">
                      {app.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-base">{app.name}</span>
                      </div>
                      <span className="text-xs text-muted">{app.role}</span>
                    </div>
                  </div>

                  {/* Rating & Proposed Rate */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1 text-[#BEF264] bg-background px-2.5 py-1 rounded-lg border border-surface-border">
                      <Star className="w-3.5 h-3.5 fill-[#BEF264]" />
                      <span className="font-bold">{app.rating.toFixed(1)}</span>
                      <span className="text-muted">({app.completedJobs} jobs)</span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground font-mono">${app.proposedUSD}</span>
                      <span className="text-[11px] text-muted block font-mono">₹{app.proposedINR.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* Proposal Text */}
                <p className="text-xs text-muted leading-relaxed bg-background p-3.5 rounded-xl border border-surface-border">
                  "{app.proposal}"
                </p>

                {/* Skills tags & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap gap-1.5">
                    {app.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-background border border-surface-border text-[11px] font-mono text-muted"
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
                      className="px-4 py-2 rounded-xl bg-moss hover:bg-[#BEF264] text-background font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-[#84CC16]/20"
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
