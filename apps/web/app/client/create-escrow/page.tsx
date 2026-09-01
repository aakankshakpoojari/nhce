"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, DollarSign } from "lucide-react";

const USD_TO_INR_RATE = 83.25;

export default function CreateEscrowPage() {
  const router = useRouter();
  const [freelancerAddress, setFreelancerAddress] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [amountUSD, setAmountUSD] = useState(1000);
  const [milestoneDesc, setMilestoneDesc] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);

  const amountINR = Math.round(amountUSD * USD_TO_INR_RATE);

  const handleDeployEscrow = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      router.push("/client/escrows");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col selection:bg-moss selection:text-background">
      
      

      {/* Form Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10">
        <div className="bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-surface-border text-moss text-xs font-mono mb-1">
              <Lock className="w-3.5 h-3.5" /> Multisig Milestone Vault
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Create Smart Contract Escrow</h1>
            <p className="text-xs text-muted">
              Funds will be locked directly into an audited smart contract on Ethereum or Arbitrum.
            </p>
          </div>

          <form onSubmit={handleDeployEscrow} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Project / Work Title</label>
              <input
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Smart Contract Security Audit"
                className="w-full px-4 py-3 rounded-xl bg-background border border-surface-border focus:border-moss text-sm text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Freelancer Wallet Address</label>
              <input
                type="text"
                required
                value={freelancerAddress}
                onChange={(e) => setFreelancerAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 rounded-xl bg-background border border-surface-border focus:border-moss text-xs font-mono text-foreground focus:outline-none"
              />
            </div>

            {/* Dual Currency Amount */}
            <div className="p-4 rounded-2xl bg-background border border-surface-border space-y-3">
              <span className="text-xs font-semibold text-foreground block">Escrow Amount (Dual Currency)</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-muted font-mono">Amount (USD)</span>
                  <input
                    type="number"
                    min={50}
                    value={amountUSD}
                    onChange={(e) => setAmountUSD(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-sm font-mono font-bold text-foreground"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-muted font-mono">Equivalent (INR)</span>
                  <input
                    type="text"
                    readOnly
                    value={`₹${amountINR.toLocaleString("en-IN")}`}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-sm font-mono font-bold text-[#22C55E]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Milestone Deliverable Criteria</label>
              <textarea
                rows={3}
                required
                value={milestoneDesc}
                onChange={(e) => setMilestoneDesc(e.target.value)}
                placeholder="Describe what deliverables are required before escrow release..."
                className="w-full px-4 py-3 rounded-xl bg-background border border-surface-border focus:border-moss text-xs text-foreground focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isDeploying}
              className="w-full py-3.5 px-4 rounded-xl font-bold bg-moss hover:bg-[#BEF264] text-background text-xs uppercase tracking-wider transition shadow-lg shadow-[#84CC16]/20 flex items-center justify-center gap-2"
            >
              {isDeploying ? (
                <span>Locking Escrow on Blockchain...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Deposit & Lock Escrow</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
