"use client";

import { useState } from "react";
import { X, DollarSign, Sparkles, AlertCircle, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

interface PostProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditsRemaining: number;
  isPro: boolean;
  onSubmit: (project: {
    title: string;
    description: string;
    skills: string[];
    budgetUSD: number;
    budgetINR: number;
    duration: string;
  }) => void;
  onUpgradePro: () => void;
}

const USD_TO_INR_RATE = 83.25;

export default function PostProjectModal({
  isOpen,
  onClose,
  creditsRemaining,
  isPro,
  onSubmit,
  onUpgradePro,
}: PostProjectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [budgetUSD, setBudgetUSD] = useState<number>(1500);
  const [duration, setDuration] = useState("2-4 weeks");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const budgetINR = Math.round(budgetUSD * USD_TO_INR_RATE);
  const hasCredits = isPro || creditsRemaining > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasCredits) {
      setError("No free credits remaining. Upgrade to PRO to post more projects.");
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError("Please provide both a project title and description.");
      return;
    }

    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    onSubmit({
      title,
      description,
      skills: skills.length > 0 ? skills : ["Solidity", "Web3", "Next.js"],
      budgetUSD,
      budgetINR,
      duration,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 shadow-2xl text-foreground max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted hover:text-foreground p-1 rounded-lg hover:bg-background transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-surface-border text-moss text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              {isPro ? "PRO Unlimited Plan" : `${creditsRemaining} Credit(s) Left This Month`}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
            Post a New Work / Project
          </h2>
          <p className="text-xs text-muted">
            Define deliverables, set budget in USD & INR, and receive proposals from top verified builders.
          </p>
        </div>

        {!hasCredits ? (
          /* Out of Credits State */
          <div className="p-6 rounded-2xl bg-background border border-[#EF4444]/40 text-center space-y-4 my-4">
            <div className="w-12 h-12 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Monthly Free Credits Limit Reached
              </h3>
              <p className="text-xs text-muted mt-1 max-w-md mx-auto">
                You have used all 3 free project posts for this month. Upgrade to PRO to enjoy unlimited job posts and priority talent matching.
              </p>
            </div>
            <button
              type="button"
              onClick={onUpgradePro}
              className="py-3 px-6 rounded-xl font-semibold bg-moss hover:bg-[#BEF264] text-background text-xs uppercase tracking-wider transition shadow-lg shadow-[#84CC16]/20"
            >
              Upgrade to PRO Subscription
            </button>
          </div>
        ) : (
          /* Main Project Creation Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Project Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Audit Smart Contract Escrow on Arbitrum"
                required
                className="w-full px-4 py-3 rounded-xl bg-background border border-surface-border focus:border-moss text-sm text-foreground placeholder-[#A3A3A3]/50 focus:outline-none transition"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Project Scope & Deliverables</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe milestone requirements, tech stack, and acceptance criteria..."
                required
                className="w-full px-4 py-3 rounded-xl bg-background border border-surface-border focus:border-moss text-sm text-foreground placeholder-[#A3A3A3]/50 focus:outline-none transition resize-none"
              />
            </div>

            {/* Skills */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Required Skills (comma separated)</label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="e.g. Solidity, Foundry, TypeScript, Next.js, Security"
                className="w-full px-4 py-3 rounded-xl bg-background border border-surface-border focus:border-moss text-sm text-foreground placeholder-[#A3A3A3]/50 focus:outline-none transition"
              />
            </div>

            {/* Dual Currency Budget Box (USD & INR) */}
            <div className="p-4 rounded-2xl bg-background border border-surface-border space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Milestone Budget (Dual Currency)</span>
                <span className="text-muted font-mono text-[11px]">Rate: 1 USD ≈ ₹{USD_TO_INR_RATE}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* USD Input */}
                <div className="space-y-1">
                  <span className="text-[11px] text-muted font-mono">Price in USD ($)</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-moss font-mono font-bold">$</span>
                    <input
                      type="number"
                      min={50}
                      step={50}
                      value={budgetUSD}
                      onChange={(e) => setBudgetUSD(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-surface border border-surface-border focus:border-moss text-sm text-foreground font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live INR Conversion */}
                <div className="space-y-1">
                  <span className="text-[11px] text-muted font-mono">Equivalent in INR (₹)</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#22C55E] font-mono font-bold">₹</span>
                    <input
                      type="text"
                      readOnly
                      value={budgetINR.toLocaleString("en-IN")}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-surface border border-surface-border text-sm text-[#22C55E] font-mono font-bold focus:outline-none cursor-default"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Estimated Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Expected Delivery Timeline</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-surface-border focus:border-moss text-xs text-foreground focus:outline-none"
              >
                <option value="1-2 weeks">1-2 weeks (Quick Sprint)</option>
                <option value="2-4 weeks">2-4 weeks (Standard Milestone)</option>
                <option value="1-3 months">1-3 months (Extensive Architecture)</option>
                <option value="Ongoing / Retainer">Ongoing / Monthly Retainer</option>
              </select>
            </div>

            {/* Form Footer */}
            <div className="pt-3 border-t border-surface-border flex items-center justify-between">
              <span className="text-xs font-mono text-muted">
                Cost: <span className="text-moss font-bold">1 Credit</span>
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-background hover:bg-surface-hover border border-surface-border text-xs text-foreground transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-semibold bg-moss hover:bg-[#BEF264] text-background text-xs uppercase tracking-wider transition shadow-lg shadow-[#84CC16]/20 flex items-center gap-1.5"
                >
                  <span>Publish Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
