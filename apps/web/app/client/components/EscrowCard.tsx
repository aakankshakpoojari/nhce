"use client";

import { Lock, CheckCircle2, AlertCircle, Clock, ExternalLink } from "lucide-react";

export interface EscrowItem {
  id: string;
  projectTitle: string;
  freelancerName: string;
  freelancerAvatar?: string;
  amountEth?: string | number;
  tokenSymbol?: string;
  amountUSD: number;
  amountINR: number;
  status: "locked" | "milestone_submitted" | "released";
  createdAt: string;
  txHash: string;
  escrowAddress?: string;
}

interface EscrowCardProps {
  escrow: EscrowItem;
  onRelease: (id: string) => void;
}

export default function EscrowCard({ escrow, onRelease }: EscrowCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-surface border border-surface-border hover:border-moss/40 transition space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-background border border-surface-border flex items-center justify-center font-bold text-xs text-moss">
            {escrow.freelancerAvatar || (escrow.freelancerName ? escrow.freelancerName.charAt(0).toUpperCase() : "F")}
          </div>
          <div>
            <div className="font-bold text-xs text-foreground">{escrow.projectTitle}</div>
            <div className="text-[11px] text-muted">Freelancer: {escrow.freelancerName}</div>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {escrow.status === "locked" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background border border-surface-border text-moss text-[10px] font-mono">
              <Lock className="w-3 h-3" /> Locked in Vault
            </span>
          )}
          {escrow.status === "milestone_submitted" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] text-[10px] font-mono">
              <Clock className="w-3 h-3" /> Deliverables Ready
            </span>
          )}
          {escrow.status === "released" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/40 text-[#22C55E] text-[10px] font-mono">
              <CheckCircle2 className="w-3 h-3" /> Released & Settled
            </span>
          )}
        </div>
      </div>

      {/* Amount & On-Chain Info */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div>
          <span className="text-muted block text-[10px] uppercase font-semibold">Escrow Value</span>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-moss font-mono">
              {escrow.amountEth !== undefined && escrow.amountEth !== null && String(escrow.amountEth).trim() !== ""
                ? `${escrow.amountEth} ${escrow.tokenSymbol || "ETH"}`
                : `$${escrow.amountUSD}`}
            </span>
            {escrow.amountUSD > 0 && (
              <span className="text-xs text-foreground font-semibold font-mono">
                (${escrow.amountUSD < 1 ? escrow.amountUSD.toFixed(2) : escrow.amountUSD.toLocaleString()})
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-muted block text-[10px] uppercase font-semibold">Contract Tx</span>
          <a
            href={escrow.txHash?.startsWith("0x") ? `https://sepolia.etherscan.io/tx/${escrow.txHash}` : "#"}
            target="_blank"
            rel="noreferrer"
            className="text-moss font-mono text-[11px] hover:underline inline-flex items-center gap-1"
          >
            {escrow.txHash ? (escrow.txHash.length > 22 ? `${escrow.txHash.slice(0, 10)}...${escrow.txHash.slice(-6)}` : escrow.txHash) : "View Tx"}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Action Area */}
      {escrow.status === "milestone_submitted" && (
        <div className="pt-2">
          <button
            onClick={() => onRelease(escrow.id)}
            className="w-full py-2.5 rounded-xl bg-[#22C55E] hover:bg-moss text-background font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-[#22C55E]/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve & Release Funds to {escrow.freelancerName}</span>
          </button>
        </div>
      )}
    </div>
  );
}
