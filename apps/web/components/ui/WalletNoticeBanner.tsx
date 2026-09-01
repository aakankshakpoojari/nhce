"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import MetaMaskModal from "@/components/metamask-modal";
import { AlertCircle, Wallet, ArrowRight, CheckCircle2 } from "lucide-react";

interface WalletNoticeBannerProps {
  role?: "client" | "freelancer";
  customMessage?: string;
}

export default function WalletNoticeBanner({
  role = "freelancer",
  customMessage,
}: WalletNoticeBannerProps) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If user is connected to a wallet, show green connected badge instead of notice
  if (user?.walletAddress) {
    return (
      <div className="w-full bg-surface/80 border border-[#22C55E]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground flex items-center gap-2">
              <span>Web3 Wallet Connected</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30">
                UNIQUE ID
              </span>
            </div>
            <p className="text-xs font-mono text-muted">
              {`${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const defaultMsg =
    role === "client"
      ? "Please connect your wallet to post projects, initialize escrow contracts, and release milestones."
      : "Please connect your wallet to submit proposals, claim project bounties, and receive instant payouts.";

  return (
    <>
      <div className="w-full bg-gradient-to-r from-amber-500/10 via-surface to-background border-2 border-amber-500/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md shadow-xl shadow-amber-500/5 animate-in fade-in">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">Wallet Required for On-Chain Actions</h4>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Action Needed
              </span>
            </div>
            <p className="text-xs text-muted mt-1 leading-relaxed max-w-2xl">
              {customMessage || defaultMsg}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 py-2.5 px-5 rounded-xl font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs transition-all shadow-md hover:shadow-amber-400/20 flex items-center gap-2 cursor-pointer"
        >
          <Wallet className="w-4 h-4" />
          <span>Connect Wallet</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <MetaMaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        role={role}
      />
    </>
  );
}
