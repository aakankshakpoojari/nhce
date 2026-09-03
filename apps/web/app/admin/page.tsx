"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, ADMIN_TEAM_ACCOUNTS, User } from "@/contexts/AuthContext";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Users,
  Vote,
  History,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  LogOut,
  Scale,
  Award,
  Clock,
  UserCheck,
  AlertCircle,
  FolderGit2,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface DisputeCase {
  id: string;
  projectTitle: string;
  milestoneTitle: string;
  milestoneIndex: number;
  totalMilestones: number;
  clientName: string;
  clientAddress: string;
  freelancerName: string;
  freelancerAddress: string;
  freelancerRating: number;
  freelancerWarnings: number;
  totalProjectUSD: number;
  disputedAmountUSD: number;
  alreadyReleasedUSD: number;
  remainingEscrowUSD: number;
  clientReason: string;
  freelancerResponse: string;
  evidenceFiles: string[];
  status: "AWAITING_REVIEW" | "VOTING" | "RESOLVED_FREELANCER" | "RESOLVED_CLIENT";
  createdAt: string;
  votes: Record<string, "APPROVE_FREELANCER" | "SIDE_WITH_CLIENT">;
}

interface AuditRecord {
  id: string;
  timestamp: string;
  event: string;
  actor: string;
  project: string;
  amount?: string;
  details: string;
}

export default function AdminPortalPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"disputes" | "overview" | "users" | "audit">("disputes");
  const [adminTeam, setAdminTeam] = useState<any[]>(ADMIN_TEAM_ACCOUNTS);
  const [isSyncingAdmins, setIsSyncingAdmins] = useState(false);

  // Dynamically load admin arbitrators from Supabase public.admins table
  useEffect(() => {
    setIsSyncingAdmins(true);
    fetch("/api/admins")
      .then((res) => res.json())
      .then((data) => {
        if (data.admins && data.admins.length > 0) {
          setAdminTeam(data.admins);
        }
      })
      .catch((err) => console.warn("Using local admin seed", err))
      .finally(() => setIsSyncingAdmins(false));
  }, []);

  // Sample Disputes in Queue
  const [disputes, setDisputes] = useState<DisputeCase[]>([
    {
      id: "DISP-2026-089",
      projectTitle: "DeFi Cross-Chain Lending Interface",
      milestoneTitle: "Milestone 2: Solana Anchor & Web3 React Integration",
      milestoneIndex: 2,
      totalMilestones: 3,
      clientName: "Aura Capital",
      clientAddress: "0x38B4...f102",
      freelancerName: "Devon Vance",
      freelancerAddress: "0x91F2...c401",
      freelancerRating: 4.7,
      freelancerWarnings: 1,
      totalProjectUSD: 3500,
      disputedAmountUSD: 1400,
      alreadyReleasedUSD: 1050,
      remainingEscrowUSD: 1050,
      clientReason:
        "The submitted frontend code fails to trigger wallet approvals on Devnet and misses the agreed responsiveness specifications on mobile viewports.",
      freelancerResponse:
        "The pull request includes complete unit tests and a live deployment preview. Devnet wallet reverts were caused by client custom RPC timeout, not client code. Mobile layout has been updated.",
      evidenceFiles: ["LendingDashboard.tsx", "test_report.pdf", "pr_diff_42.patch"],
      status: "VOTING",
      createdAt: "Today at 11:24 AM",
      votes: {
        "adm-1": "APPROVE_FREELANCER",
        "adm-2": "SIDE_WITH_CLIENT",
        "adm-3": "APPROVE_FREELANCER",
      },
    },
    {
      id: "DISP-2026-088",
      projectTitle: "Zero-Knowledge Membership Protocol",
      milestoneTitle: "Milestone 1: Circom Circuit Compilation & Snarkjs",
      milestoneIndex: 1,
      totalMilestones: 3,
      clientName: "Nexus Labs",
      clientAddress: "0x12A9...e843",
      freelancerName: "Elena Rostova",
      freelancerAddress: "0x74B1...9120",
      freelancerRating: 5.0,
      freelancerWarnings: 0,
      totalProjectUSD: 6000,
      disputedAmountUSD: 2000,
      alreadyReleasedUSD: 0,
      remainingEscrowUSD: 4000,
      clientReason: "Milestone deliverable was submitted 3 days after the agreed deadline without prior warning.",
      freelancerResponse: "Client requested circuit verification key additions that were out of original scope.",
      evidenceFiles: ["circuit_spec.pdf", "gas_benchmarks.csv"],
      status: "RESOLVED_FREELANCER",
      createdAt: "Yesterday at 04:15 PM",
      votes: {
        "adm-1": "APPROVE_FREELANCER",
        "adm-2": "APPROVE_FREELANCER",
        "adm-3": "APPROVE_FREELANCER",
        "adm-4": "APPROVE_FREELANCER",
        "adm-5": "SIDE_WITH_CLIENT",
      },
    },
  ]);

  // Selected Dispute for deep review
  const [selectedDisputeId, setSelectedDisputeId] = useState<string>("DISP-2026-089");

  // Platform Users & Reputation List
  const [platformUsers, setPlatformUsers] = useState([
    {
      id: "u-1",
      name: "Devon Vance",
      role: "FREELANCER",
      email: "devon@web3dev.xyz",
      wallet: "0x91F2...c401",
      rating: 4.7,
      warnings: 1,
      status: "ACTIVE",
      totalEarned: "$18,400",
      projectsCount: 8,
    },
    {
      id: "u-2",
      name: "Alexey Sorokin",
      role: "FREELANCER",
      email: "alexey@blockchain.io",
      wallet: "0x44A1...9822",
      rating: 4.4,
      warnings: 4,
      status: "RESTRICTED",
      totalEarned: "$6,200",
      projectsCount: 3,
    },
    {
      id: "u-3",
      name: "Samir Patel",
      role: "FREELANCER",
      email: "samir@smartsol.com",
      wallet: "0x88F3...aa19",
      rating: 4.1,
      warnings: 5,
      status: "BLOCKED",
      totalEarned: "$3,100",
      projectsCount: 2,
    },
    {
      id: "u-4",
      name: "Aura Capital",
      role: "CLIENT",
      email: "bounties@auracap.vc",
      wallet: "0x38B4...f102",
      rating: 4.9,
      warnings: 0,
      status: "ACTIVE",
      totalEarned: "$42,000 Spent",
      projectsCount: 14,
    },
  ]);

  // Immutable Audit Log
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([
    {
      id: "AUD-104",
      timestamp: "Today, 12:45 PM",
      event: "ADMIN_VOTED",
      actor: "Sarah Chen (Seat 3)",
      project: "DeFi Cross-Chain Lending Interface",
      amount: "$1,400",
      details: "Cast vote for APPROVE_FREELANCER on Milestone 2 dispute.",
    },
    {
      id: "AUD-103",
      timestamp: "Today, 11:24 AM",
      event: "DISPUTE_CREATED",
      actor: "Aura Capital (Client)",
      project: "DeFi Cross-Chain Lending Interface",
      amount: "$1,400",
      details: "Client contested Milestone 2 submission citing wallet revert issues.",
    },
    {
      id: "AUD-102",
      timestamp: "Yesterday, 05:20 PM",
      event: "PAYMENT_RELEASED",
      actor: "Smart Contract Escrow",
      project: "Zero-Knowledge Membership Protocol",
      amount: "$2,000",
      details: "Dispute resolved in favor of Freelancer (4-1 majority). Funds disbursed.",
    },
    {
      id: "AUD-101",
      timestamp: "Yesterday, 02:10 PM",
      event: "WARNING_ISSUED",
      actor: "Arbitration System",
      project: "NFT Staking Vault Engine",
      amount: "$800",
      details: "Dispute resolved in favor of Client. Freelancer received +1 warning (total 4). Rating adjusted.",
    },
  ]);

  const activeDispute = disputes.find((d) => d.id === selectedDisputeId) || disputes[0];

  // Cast an Admin Vote
  const handleCastVote = (choice: "APPROVE_FREELANCER" | "SIDE_WITH_CLIENT") => {
    if (!activeDispute || !user) return;

    const currentAdminId = user.id || "adm-1";
    const currentAdminName = user.name || "Administrator";

    const updatedVotes = {
      ...activeDispute.votes,
      [currentAdminId]: choice,
    };

    const approveCount = Object.values(updatedVotes).filter((v) => v === "APPROVE_FREELANCER").length;
    const clientCount = Object.values(updatedVotes).filter((v) => v === "SIDE_WITH_CLIENT").length;

    let nextStatus = activeDispute.status;
    let auditMessage = "";

    // 3 out of 5 majority rule
    if (approveCount >= 3) {
      nextStatus = "RESOLVED_FREELANCER";
      auditMessage = `Dispute resolved in favor of FREELANCER with ${approveCount}/5 majority. $${activeDispute.disputedAmountUSD} released.`;
    } else if (clientCount >= 3) {
      nextStatus = "RESOLVED_CLIENT";
      auditMessage = `Dispute resolved in favor of CLIENT with ${clientCount}/5 majority. $${activeDispute.disputedAmountUSD} returned to escrow. +1 warning issued to ${activeDispute.freelancerName}.`;
      
      // Increment warning count and apply rating penalty
      setPlatformUsers((prev) =>
        prev.map((u) => {
          if (u.name === activeDispute.freelancerName) {
            const nextWarnings = u.warnings + 1;
            const nextRating = nextWarnings > 3 ? Math.max(3.0, Number((u.rating - 0.3).toFixed(1))) : u.rating;
            const nextAccStatus = nextWarnings >= 5 ? "BLOCKED" : nextWarnings >= 3 ? "RESTRICTED" : "WARNING";
            return {
              ...u,
              warnings: nextWarnings,
              rating: nextRating,
              status: nextAccStatus,
            };
          }
          return u;
        })
      );
    }

    const updatedDispute: DisputeCase = {
      ...activeDispute,
      votes: updatedVotes,
      status: nextStatus,
    };

    setDisputes((prev) => prev.map((d) => (d.id === activeDispute.id ? updatedDispute : d)));

    // Create Audit Log
    const newLog: AuditRecord = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: "Just now",
      event: nextStatus !== activeDispute.status ? "DISPUTE_RESOLVED" : "ADMIN_VOTED",
      actor: `${currentAdminName} (${user.email})`,
      project: activeDispute.projectTitle,
      amount: `$${activeDispute.disputedAmountUSD}`,
      details: auditMessage || `Voted ${choice.replace("_", " ")} on milestone dispute.`,
    };

    setAuditLogs([newLog, ...auditLogs]);
  };

  // 1. Authoritative Server-Side / Client-Side Access Check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-moss animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-muted">
          Verifying Cryptographic Admin Credentials...
        </p>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-surface border border-red-900/40 shadow-2xl space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-800/40 text-red-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold">
              HTTP 403 • RESTRICTED CONSOLE
            </span>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Administrative Access Denied
            </h1>
            <p className="text-xs text-muted leading-relaxed">
              This route is restricted strictly to the 5 designated dispute-review team arbitrators. Non-admin users cannot access the arbitration operations console.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-background border border-surface-border text-xs text-left space-y-2">
            <div className="flex items-center justify-between text-muted font-mono text-[11px]">
              <span>Current Account:</span>
              <span className="text-foreground">{user ? user.email : "Unauthenticated"}</span>
            </div>
            <div className="flex items-center justify-between text-muted font-mono text-[11px]">
              <span>Authenticated Role:</span>
              <span className="text-red-400 uppercase font-bold">{user ? user.role : "NONE"}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/"
              className="w-full py-3 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-xs font-semibold text-foreground transition"
            >
              Return to Landing Page
            </Link>
            <button
              onClick={logout}
              className="w-full py-3 rounded-xl bg-moss hover:bg-[#BEF264] text-background text-xs font-bold transition shadow-sm"
            >
              Sign In with Team Admin Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate vote progress for active dispute
  const totalVotesCast = Object.keys(activeDispute.votes).length;
  const approveCount = Object.values(activeDispute.votes).filter((v) => v === "APPROVE_FREELANCER").length;
  const clientCount = Object.values(activeDispute.votes).filter((v) => v === "SIDE_WITH_CLIENT").length;
  const currentAdminVote = activeDispute.votes[user.id || "adm-1"];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-moss selection:text-background font-sans">
      
      {/* Top Header */}
      <header className="sticky top-0 z-50 px-6 py-4 border-b border-surface-border bg-background/90 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-surface border border-surface-border flex items-center justify-center font-black text-sm">
              <span className="text-foreground">W</span>
              <span className="text-moss">3</span>
            </div>
            <span className="font-extrabold text-lg text-foreground tracking-tight">
              W3HIRE
            </span>
          </Link>

          <span className="text-surface-border font-mono">/</span>

          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface border border-purple-500/30 text-xs font-mono text-purple-400">
            <Scale className="w-3.5 h-3.5" />
            <span className="font-bold">ARBITRATION CONSOLE</span>
          </div>

          <span className="hidden md:inline-flex text-xs font-mono text-muted">
            5-Admin Dispute Moderation Team
          </span>
        </div>

        {/* Right Admin Controls */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* Active Admin Pill */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs">
            <div className="w-2 h-2 rounded-full bg-moss animate-pulse" />
            <span className="font-mono text-foreground font-semibold">{user.name || user.email}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold uppercase">
              ADMIN SEAT
            </span>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-surface hover:bg-surface-hover text-muted hover:text-foreground border border-surface-border transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 5-Seat Arbitrator Panel Bar */}
      <section className="border-b border-surface-border bg-surface/50 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-muted font-mono">
            <Users className="w-4 h-4 text-moss" />
            <span className="uppercase tracking-wider font-semibold text-[11px]">
              Dispute Panel Seats ({adminTeam.length} Active in Supabase):
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {adminTeam.map((adm, i) => {
              const isMe = user.email.toLowerCase() === adm.email.toLowerCase();
              return (
                <div
                  key={adm.id || i}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 ${
                    isMe
                      ? "bg-purple-950/40 border-purple-500/60 text-purple-300 font-bold"
                      : "bg-background border-surface-border text-muted"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-moss" />
                  <span>{adm.name.split(" ")[0]}</span>
                  <span className="text-[10px] opacity-70">(Seat {adm.seat_number || i + 1})</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Admin Console Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-surface-border pb-4">
          <button
            onClick={() => setActiveTab("disputes")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "disputes"
                ? "bg-moss text-background shadow-md shadow-[#84CC16]/20"
                : "bg-surface hover:bg-surface-hover text-muted hover:text-foreground border border-surface-border"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Active Disputes Queue</span>
            <span className="px-1.5 py-0.5 rounded-full bg-background/20 text-[10px] font-mono">
              {disputes.filter((d) => d.status === "VOTING" || d.status === "AWAITING_REVIEW").length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-moss text-background shadow-md shadow-[#84CC16]/20"
                : "bg-surface hover:bg-surface-hover text-muted hover:text-foreground border border-surface-border"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Operations Metrics</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "users"
                ? "bg-moss text-background shadow-md shadow-[#84CC16]/20"
                : "bg-surface hover:bg-surface-hover text-muted hover:text-foreground border border-surface-border"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users & Warning Health</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "audit"
                ? "bg-moss text-background shadow-md shadow-[#84CC16]/20"
                : "bg-surface hover:bg-surface-hover text-muted hover:text-foreground border border-surface-border"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Financial Audit Trail</span>
          </button>
        </div>

        {/* TAB 1: ACTIVE DISPUTES CASE-REVIEW CONSOLE */}
        {activeTab === "disputes" && (
          <div className="space-y-6">
            
            {/* Dispute Case Header & Case Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-moss font-semibold">
                  Multi-Admin Arbitration Docket
                </span>
                <h2 className="text-2xl font-black text-foreground tracking-tight">
                  Case Review: {activeDispute.projectTitle}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted font-mono">Case ID:</span>
                <select
                  value={selectedDisputeId}
                  onChange={(e) => setSelectedDisputeId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs font-mono text-foreground focus:outline-none focus:border-moss"
                >
                  {disputes.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.id} — {d.status.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Case Review Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Comprehensive Case Information */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Financial Overview Card */}
                <div className="p-6 rounded-3xl bg-surface border border-surface-border space-y-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted font-bold">
                    Financial Escrow Accounting
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3.5 rounded-2xl bg-background border border-surface-border">
                      <span className="text-[10px] font-mono text-muted uppercase">Total Contract</span>
                      <div className="text-xl font-black font-mono text-foreground">${activeDispute.totalProjectUSD}</div>
                      <span className="text-[10px] text-muted">USDC Locked</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-background border border-surface-border">
                      <span className="text-[10px] font-mono text-muted uppercase">Disputed Milestone</span>
                      <div className="text-xl font-black font-mono text-amber-400">${activeDispute.disputedAmountUSD}</div>
                      <span className="text-[10px] text-amber-400/80 font-mono">Milestone {activeDispute.milestoneIndex}/{activeDispute.totalMilestones}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-background border border-surface-border">
                      <span className="text-[10px] font-mono text-muted uppercase">Already Released</span>
                      <div className="text-xl font-black font-mono text-moss">${activeDispute.alreadyReleasedUSD}</div>
                      <span className="text-[10px] text-moss/80 font-mono">Milestone 1 Approved</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-background border border-surface-border">
                      <span className="text-[10px] font-mono text-muted uppercase">Remaining Vault</span>
                      <div className="text-xl font-black font-mono text-foreground">${activeDispute.remainingEscrowUSD}</div>
                      <span className="text-[10px] text-muted font-mono">Milestone 3 Pending</span>
                    </div>
                  </div>
                </div>

                {/* Conflict Evidence: Client Reason vs Freelancer Submission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Client Argument */}
                  <div className="p-6 rounded-3xl bg-surface border border-red-950/40 space-y-3">
                    <div className="flex items-center justify-between border-b border-surface-border pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="text-xs font-bold text-foreground">Client Claim</span>
                      </div>
                      <span className="text-xs font-mono text-muted">{activeDispute.clientName}</span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      "{activeDispute.clientReason}"
                    </p>
                    <div className="pt-2 text-[11px] font-mono text-muted">
                      Wallet: <span className="text-foreground">{activeDispute.clientAddress}</span>
                    </div>
                  </div>

                  {/* Freelancer Response */}
                  <div className="p-6 rounded-3xl bg-surface border border-moss/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-surface-border pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-moss" />
                        <span className="text-xs font-bold text-foreground">Freelancer Response</span>
                      </div>
                      <span className="text-xs font-mono text-moss font-bold">{activeDispute.freelancerName}</span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      "{activeDispute.freelancerResponse}"
                    </p>
                    <div className="pt-2 text-[11px] font-mono text-muted flex items-center justify-between">
                      <span>Rating: <strong className="text-foreground">{activeDispute.freelancerRating} ★</strong></span>
                      <span>Warnings: <strong className="text-amber-400">{activeDispute.freelancerWarnings}/3</strong></span>
                    </div>
                  </div>

                </div>

                {/* Submitted Files & Evidence Attachments */}
                <div className="p-6 rounded-3xl bg-surface border border-surface-border space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-muted uppercase font-bold">
                    <FolderGit2 className="w-4 h-4 text-moss" />
                    <span>Submitted Code & Evidence Attachments:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeDispute.evidenceFiles.map((f, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-background border border-surface-border text-xs font-mono text-foreground flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-moss" />
                        <span>{f}</span>
                        <ExternalLink className="w-3 h-3 text-muted cursor-pointer hover:text-moss" />
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: 5-Admin Voting Panel & Resolution Engine */}
              <div className="space-y-6">
                
                <div className="p-6 rounded-3xl bg-surface border border-surface-border space-y-6 shadow-xl">
                  
                  <div className="flex items-center justify-between border-b border-surface-border pb-4">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-moss" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                        Arbitration Voting
                      </h3>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        activeDispute.status.startsWith("RESOLVED")
                          ? "bg-moss/20 text-moss"
                          : "bg-amber-500/20 text-amber-400 animate-pulse"
                      }`}
                    >
                      {activeDispute.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Majority Vote Tally Meter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span>Tally Progress (3 Votes Required):</span>
                      <span className="font-bold text-foreground">{totalVotesCast} / 5 Votes Cast</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-3 rounded-xl bg-background border border-moss/40 text-center">
                        <span className="text-[10px] text-muted uppercase">Approve Freelancer</span>
                        <div className="text-2xl font-black text-moss">{approveCount} / 5</div>
                      </div>

                      <div className="p-3 rounded-xl bg-background border border-red-950/50 text-center">
                        <span className="text-[10px] text-muted uppercase">Side With Client</span>
                        <div className="text-2xl font-black text-red-400">{clientCount} / 5</div>
                      </div>
                    </div>
                  </div>

                  {/* Seat-by-Seat Voting Grid */}
                  <div className="space-y-2 pt-2 border-t border-surface-border">
                    <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                      Arbitrator Decisions:
                    </span>
                    <div className="space-y-1.5">
                      {adminTeam.map((adm, idx) => {
                        const vote = activeDispute.votes[adm.id];
                        return (
                          <div
                            key={adm.id || idx}
                            className="flex items-center justify-between p-2 rounded-xl bg-background border border-surface-border text-xs font-mono"
                          >
                            <span className="text-muted">
                              Seat {adm.seat_number || idx + 1}: {adm.name}
                            </span>
                            {vote ? (
                              <span
                                className={`text-[11px] font-bold ${
                                  vote === "APPROVE_FREELANCER" ? "text-moss" : "text-red-400"
                                }`}
                              >
                                {vote === "APPROVE_FREELANCER" ? "✓ APPROVE" : "✗ SIDE CLIENT"}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted italic">Awaiting Vote</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Current Admin's Voting Action */}
                  <div className="pt-4 border-t border-surface-border space-y-3">
                    <span className="text-xs font-semibold text-foreground">
                      Your Decision (Seat: {user.name})
                    </span>

                    {currentAdminVote ? (
                      <div className="p-3 rounded-xl bg-moss/10 border border-moss/30 text-xs font-mono text-moss flex items-center justify-between font-bold">
                        <span>YOUR VOTE RECORDED:</span>
                        <span>{currentAdminVote.replace("_", " ")}</span>
                      </div>
                    ) : activeDispute.status.startsWith("RESOLVED") ? (
                      <div className="p-3 rounded-xl bg-surface border border-surface-border text-xs text-muted text-center font-mono">
                        Dispute finalized by majority vote.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleCastVote("APPROVE_FREELANCER")}
                          className="py-3 px-3 rounded-xl bg-moss hover:bg-[#BEF264] text-background font-bold text-xs transition shadow-md shadow-[#84CC16]/20 flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve Talent</span>
                        </button>

                        <button
                          onClick={() => handleCastVote("SIDE_WITH_CLIENT")}
                          className="py-3 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 text-red-400 font-bold text-xs transition flex items-center justify-center gap-1"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span>Side Client</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: OVERVIEW & OPERATIONAL METRICS */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-6 rounded-3xl bg-surface border border-surface-border space-y-1">
                <span className="text-[10px] font-mono uppercase text-muted">Total Escrow Volume</span>
                <div className="text-3xl font-black font-mono text-foreground">$2,450,800</div>
                <span className="text-xs text-moss font-mono">+18.4% this month</span>
              </div>

              <div className="p-6 rounded-3xl bg-surface border border-surface-border space-y-1">
                <span className="text-[10px] font-mono uppercase text-muted">Total Released</span>
                <div className="text-3xl font-black font-mono text-[#22C55E]">$1,890,200</div>
                <span className="text-xs text-muted font-mono">1,890 Settled Contracts</span>
              </div>

              <div className="p-6 rounded-3xl bg-surface border border-surface-border space-y-1">
                <span className="text-[10px] font-mono uppercase text-muted">Active Disputes</span>
                <div className="text-3xl font-black font-mono text-amber-400">1 Open</div>
                <span className="text-xs text-amber-400 font-mono">Voting in Progress</span>
              </div>

              <div className="p-6 rounded-3xl bg-surface border border-surface-border space-y-1">
                <span className="text-[10px] font-mono uppercase text-muted">Arbitration Resolution Rate</span>
                <div className="text-3xl font-black font-mono text-moss">100%</div>
                <span className="text-xs text-muted font-mono">24/24 Cases Resolved</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-surface-border space-y-4">
              <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-foreground">
                Dispute Moderation Framework Rules
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted">
                <div className="p-4 rounded-xl bg-background border border-surface-border space-y-1.5">
                  <span className="font-bold text-foreground font-mono">1. Five Arbitrator Quorum</span>
                  <p>All platform disputes are evaluated by 5 verified team admins. Decisions require 3/5 majority.</p>
                </div>
                <div className="p-4 rounded-xl bg-background border border-surface-border space-y-1.5">
                  <span className="font-bold text-foreground font-mono">2. Warning System</span>
                  <p>Unsuccessful disputes against a freelancer add +1 warning. If warnings &gt; 3, rating decreases from 4.7 &rarr; 4.4.</p>
                </div>
                <div className="p-4 rounded-xl bg-background border border-surface-border space-y-1.5">
                  <span className="font-bold text-foreground font-mono">3. Account Restriction</span>
                  <p>Repeated poor dispute outcomes (5+ warnings) trigger automated account blocking to preserve marketplace trust.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: USERS & REPUTATION MANAGEMENT */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Platform Accounts & Warning Status</h3>
              <span className="text-xs font-mono text-muted">{platformUsers.length} Monitored Users</span>
            </div>

            <div className="rounded-3xl bg-surface border border-surface-border overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-background border-b border-surface-border font-mono text-muted uppercase text-[10px]">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Warnings</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4">Track Record</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border font-mono">
                  {platformUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-background/40 transition">
                      <td className="p-4">
                        <div className="font-bold text-foreground">{u.name}</div>
                        <div className="text-[11px] text-muted">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-surface border border-surface-border text-[10px]">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-foreground">{u.rating} ★</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            u.warnings === 0
                              ? "bg-moss/10 text-moss"
                              : u.warnings <= 3
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {u.warnings} / 3
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.status === "ACTIVE"
                              ? "bg-moss/20 text-moss"
                              : u.status === "RESTRICTED"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          ● {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted">{u.totalEarned} • {u.projectsCount} Projects</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: IMMUTABLE FINANCIAL AUDIT LOG */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Immutable Financial & Moderation Audit Trail</h3>
                <p className="text-xs text-muted">Complete provenance answering WHO, WHAT, WHEN, PROJECT, AMOUNT, and WHY.</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-surface border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-moss text-xs">{log.event}</span>
                      <span className="text-[10px] text-muted font-mono">• {log.timestamp}</span>
                    </div>
                    <p className="text-foreground text-xs">{log.details}</p>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-muted">
                      <span>Actor: <strong className="text-foreground">{log.actor}</strong></span>
                      <span>Project: <strong className="text-foreground">{log.project}</strong></span>
                    </div>
                  </div>

                  {log.amount && (
                    <div className="text-right font-mono flex-shrink-0">
                      <div className="font-bold text-foreground">{log.amount}</div>
                      <span className="text-[10px] text-muted">Escrow Volume</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
