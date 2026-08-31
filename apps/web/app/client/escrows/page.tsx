"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, ArrowLeft, CheckCircle2, Clock, Plus, ExternalLink, ShieldCheck, Briefcase } from "lucide-react";
import EscrowCard, { EscrowItem } from "../components/EscrowCard";

export default function ClientEscrowsPage() {
  const [escrows, setEscrows] = useState<EscrowItem[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEscrows = localStorage.getItem("w3hire_client_escrows");
      if (savedEscrows) {
        try {
          setEscrows(JSON.parse(savedEscrows));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleRelease = (id: string) => {
    const updated = escrows.map((e) => (e.id === id ? { ...e, status: "released" as const } : e));
    setEscrows(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("w3hire_client_escrows", JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F5F5F4] flex flex-col selection:bg-[#84CC16] selection:text-[#101312]">
      
      {/* Header */}
      <header className="sticky top-0 z-40 px-6 py-3.5 border-b border-[#28332D] bg-[#181D1A]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/client" className="flex items-center gap-2 text-xs text-[#A3A3A3] hover:text-[#F5F5F4]">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Client Dashboard</span>
          </Link>
          <span className="text-xs font-mono text-[#84CC16]">SMART ESCROW VAULTS</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-[#F5F5F4] tracking-tight">
              Active Milestone Escrows
            </h1>
            <p className="text-xs text-[#A3A3A3]">
              Non-custodial smart contracts securing all client funds until deliverables are verified.
            </p>
          </div>

          <Link
            href="/client/create-escrow"
            className="px-4 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#BEF264] text-[#101312] text-xs font-semibold flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Escrow</span>
          </Link>
        </div>

        {escrows.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#181D1A] border border-[#28332D] text-center space-y-3">
            <Lock className="w-8 h-8 mx-auto text-[#28332D]" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#F5F5F4]">No Active Escrows</h3>
              <p className="text-xs text-[#A3A3A3] max-w-sm mx-auto">
                When you hire a freelancer on a project or create a custom milestone vault, it will appear here.
              </p>
            </div>
            <Link
              href="/client"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#84CC16] text-[#101312] text-xs font-semibold"
            >
              <Briefcase className="w-4 h-4" />
              <span>Go to Projects</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {escrows.map((escrow) => (
              <EscrowCard key={escrow.id} escrow={escrow} onRelease={handleRelease} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
