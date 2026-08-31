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
    <div className="min-h-screen bg-transparent text-[#F5F5F4] flex flex-col selection:bg-[#84CC16] selection:text-[#101312]">
      
      {/* Header */}
      <header className="sticky top-0 z-40 px-6 py-3.5 border-b border-[#28332D] bg-[#181D1A]/95 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/client" className="flex items-center gap-2 text-xs text-[#A3A3A3] hover:text-[#F5F5F4]">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Client Dashboard</span>
          </Link>
          <span className="text-xs font-mono text-[#84CC16]">DEPLOY NEW SMART ESCROW</span>
        </div>
      </header>

      {/* Form Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10">
        <div className="bg-[#181D1A] border border-[#28332D] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#101312] border border-[#28332D] text-[#84CC16] text-xs font-mono mb-1">
              <Lock className="w-3.5 h-3.5" /> Multisig Milestone Vault
            </div>
            <h1 className="text-2xl font-extrabold text-[#F5F5F4]">Create Smart Contract Escrow</h1>
            <p className="text-xs text-[#A3A3A3]">
              Funds will be locked directly into an audited smart contract on Ethereum or Arbitrum.
            </p>
          </div>

          <form onSubmit={handleDeployEscrow} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F5F5F4]">Project / Work Title</label>
              <input
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Smart Contract Security Audit"
                className="w-full px-4 py-3 rounded-xl bg-[#101312] border border-[#28332D] focus:border-[#84CC16] text-sm text-[#F5F5F4] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F5F5F4]">Freelancer Wallet Address</label>
              <input
                type="text"
                required
                value={freelancerAddress}
                onChange={(e) => setFreelancerAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 rounded-xl bg-[#101312] border border-[#28332D] focus:border-[#84CC16] text-xs font-mono text-[#F5F5F4] focus:outline-none"
              />
            </div>

            {/* Dual Currency Amount */}
            <div className="p-4 rounded-2xl bg-[#101312] border border-[#28332D] space-y-3">
              <span className="text-xs font-semibold text-[#F5F5F4] block">Escrow Amount (Dual Currency)</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-[#A3A3A3] font-mono">Amount (USD)</span>
                  <input
                    type="number"
                    min={50}
                    value={amountUSD}
                    onChange={(e) => setAmountUSD(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#181D1A] border border-[#28332D] text-sm font-mono font-bold text-[#F5F5F4]"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-[#A3A3A3] font-mono">Equivalent (INR)</span>
                  <input
                    type="text"
                    readOnly
                    value={`₹${amountINR.toLocaleString("en-IN")}`}
                    className="w-full px-3 py-2 rounded-xl bg-[#181D1A] border border-[#28332D] text-sm font-mono font-bold text-[#22C55E]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F5F5F4]">Milestone Deliverable Criteria</label>
              <textarea
                rows={3}
                required
                value={milestoneDesc}
                onChange={(e) => setMilestoneDesc(e.target.value)}
                placeholder="Describe what deliverables are required before escrow release..."
                className="w-full px-4 py-3 rounded-xl bg-[#101312] border border-[#28332D] focus:border-[#84CC16] text-xs text-[#F5F5F4] focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isDeploying}
              className="w-full py-3.5 px-4 rounded-xl font-bold bg-[#84CC16] hover:bg-[#BEF264] text-[#101312] text-xs uppercase tracking-wider transition shadow-lg shadow-[#84CC16]/20 flex items-center justify-center gap-2"
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
