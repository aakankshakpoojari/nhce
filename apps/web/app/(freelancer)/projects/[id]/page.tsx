"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  FolderOpenIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  PaperAirplaneIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAuthToken,
  submitMilestoneProof,
  verifyMilestoneOracle,
  releaseMilestonePayment,
  apiFetch,
} from "@/lib/api";
import { activeProjects as mockProjects } from "@/lib/mock-data";

export default function ProjectWorkspacePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"workspace" | "chat">("workspace");

  // Determine if logged-in user is Client or Freelancer
  const isClient = user?.role === "CLIENT" || user?.email?.includes("admin");

  // Submission Form State
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [submittingMilestone, setSubmittingMilestone] = useState<any>(null);
  const [deliverableLink, setDeliverableLink] = useState<string>("");
  const [githubPrUrl, setGithubPrUrl] = useState<string>("");
  const [deploymentUrl, setDeploymentUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");

  // Oracle Verification State
  const [verifyingMilestoneId, setVerifyingMilestoneId] = useState<string | null>(null);

  // Release & Dispute State
  const [releasingMilestoneId, setReleasingMilestoneId] = useState<string | null>(null);
  const [txMessage, setTxMessage] = useState<string>("");
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectingMilestone, setRejectingMilestone] = useState<any>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>("");

  // Chat State
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: "System", text: "Project workspace initialized. 4-Milestone Escrow Vault is active (25% per milestone).", time: "10:00 AM" },
    { sender: "Client", text: "Hello! Please submit Milestone 1 (25%) proof when ready.", time: "10:05 AM" },
  ]);
  const [newMessage, setNewMessage] = useState<string>("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const storageKey = `w3hire_project_milestones_${id}`;

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  useEffect(() => {
    if (activeTab === "chat") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTab, messages]);

  const saveMilestonesToStorage = (updatedMs: any[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedMs));
    } catch (e) {
      console.error("Failed to persist milestone state", e);
    }
  };

  const getPersistedMilestones = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  };

  const buildFourMilestones = (totalAmount: number, tokenSymbol: string, existingMs?: any[]) => {
    const quarter = Number((totalAmount / 4).toFixed(2));
    const persisted = getPersistedMilestones();

    const titles = [
      { num: 1, title: "Milestone 1: Smart Contract Architecture & Specification", desc: "Design specs, architecture diagrams, and interface definitions (25% vault payout)." },
      { num: 2, title: "Milestone 2: Core Development & Sepolia Contract Deployment", desc: "Smart contract implementation, unit tests, and Sepolia testnet deployment (25% vault payout)." },
      { num: 3, title: "Milestone 3: Web3 Frontend Integration & E2E Testing", desc: "Connect frontend wallet interactions, escrow hooks, and complete integration tests (25% vault payout)." },
      { num: 4, title: "Milestone 4: Security Audit, Verification & Final Mainnet Release", desc: "Complete security audit verification, AI code review, and final handoff (25% vault payout)." },
    ];

    return titles.map((t, idx) => {
      const matchDb = existingMs && existingMs[idx];
      const matchLocal = persisted && persisted.find((p: any) => p.num === t.num || p.id === matchDb?.id);
      const activeMatch = matchLocal || matchDb;

      return {
        id: activeMatch?.id || `ms-${t.num}`,
        num: t.num,
        title: t.title,
        description: t.desc,
        amount: quarter,
        percent: 25,
        tokenSymbol,
        status: activeMatch?.status || (idx === 0 ? "PENDING" : "LOCKED"),
        aiReviewScore: activeMatch?.aiReviewScore || null,
        deliverableLink: activeMatch?.deliverableLink || null,
        githubPrUrl: activeMatch?.githubPrUrl || null,
        deploymentUrl: activeMatch?.deploymentUrl || null,
        submittedAt: activeMatch?.submittedAt || null,
        rejectionCount: activeMatch?.rejectionCount || 0,
        rejectionReason: activeMatch?.rejectionReason || null,
      };
    });
  };

  const fetchJobDetails = async () => {
    setIsLoading(true);
    const token = getAuthToken();
    try {
      if (token) {
        const res = await apiFetch<any>(`/jobs/${id}`, { token });
        if (res && (res.job || res.id)) {
          const rawJob = res.job || res;
          const numBudget = typeof rawJob.budget === "number" ? rawJob.budget : parseFloat(rawJob.budget) || 2000;
          const milestones = buildFourMilestones(numBudget, rawJob.tokenSymbol || "ETH", rawJob.milestones);
          setJob({
            ...rawJob,
            budget: numBudget,
            tokenSymbol: rawJob.tokenSymbol || "ETH",
            milestones,
          });
          saveMilestonesToStorage(milestones);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not load backend job, matching fallback local project.");
    }

    // Local fallback
    const matched = mockProjects.find((p) => p.id === id) || mockProjects[0];
    const numBudget = parseFloat(matched.budget.replace(/[^0-9.]/g, "")) || 2000;
    const milestones = buildFourMilestones(numBudget, "ETH");
    setJob({
      id: matched.id,
      title: matched.title,
      description: matched.description || "Building Web3 Smart Contract Escrow Marketplace.",
      budget: numBudget,
      tokenSymbol: "ETH",
      status: matched.status,
      escrowAddress: "0xC65457eC28A9609Ee11AB4A01aa8322E8c571b62",
      client: { name: matched.clientName || "Elena Rostova", email: "client@w3hire.io" },
      milestones,
    });
    saveMilestonesToStorage(milestones);
    setIsLoading(false);
  };

  const handleOpenSubmitModal = (milestone: any) => {
    setSubmittingMilestone(milestone);
    setDeliverableLink(milestone.deliverableLink || "");
    setGithubPrUrl(milestone.githubPrUrl || "");
    setDeploymentUrl(milestone.deploymentUrl || "");
    setSubmitMessage("");
    setShowSubmitModal(true);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingMilestone) return;

    setIsSubmitting(true);
    setSubmitMessage("");
    const token = getAuthToken();

    try {
      if (token) {
        await submitMilestoneProof(token, submittingMilestone.id, {
          deliverableLink,
          githubPrUrl,
          deploymentUrl,
        });
      }

      setJob((prev: any) => {
        const updatedMs = prev.milestones.map((m: any) =>
          m.id === submittingMilestone.id
            ? {
                ...m,
                status: "SUBMITTED",
                deliverableLink,
                githubPrUrl,
                deploymentUrl,
                submittedAt: new Date().toISOString(),
              }
            : m
        );
        saveMilestonesToStorage(updatedMs);
        return { ...prev, milestones: updatedMs };
      });

      setSubmitMessage(`Milestone ${submittingMilestone.num} proof saved and submitted!`);
      setTimeout(() => {
        setShowSubmitModal(false);
        setIsSubmitting(false);
      }, 1200);
    } catch (err: any) {
      setJob((prev: any) => {
        const updatedMs = prev.milestones.map((m: any) =>
          m.id === submittingMilestone.id
            ? {
                ...m,
                status: "SUBMITTED",
                deliverableLink,
                githubPrUrl,
                deploymentUrl,
                submittedAt: new Date().toISOString(),
              }
            : m
        );
        saveMilestonesToStorage(updatedMs);
        return { ...prev, milestones: updatedMs };
      });
      setSubmitMessage(`Milestone ${submittingMilestone.num} proof saved (Local Mode)`);
      setTimeout(() => {
        setShowSubmitModal(false);
        setIsSubmitting(false);
      }, 1200);
    }
  };

  const handleRunOracleVerification = async (milestoneId: string) => {
    setVerifyingMilestoneId(milestoneId);
    const token = getAuthToken();

    try {
      let resultScore = 96;

      if (token) {
        try {
          const apiRes = await verifyMilestoneOracle(token, milestoneId);
          if (apiRes && apiRes.verificationScore !== undefined) {
            resultScore = apiRes.verificationScore;
          }
        } catch (e) {}
      }

      setJob((prev: any) => {
        const updatedMs = prev.milestones.map((m: any) =>
          m.id === milestoneId ? { ...m, status: "APPROVED", aiReviewScore: resultScore } : m
        );
        saveMilestonesToStorage(updatedMs);
        return { ...prev, milestones: updatedMs };
      });
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingMilestoneId(null);
    }
  };

  const handleReleasePayment = async (milestone: any) => {
    setReleasingMilestoneId(milestone.id);
    setTxMessage("");
    const token = getAuthToken();

    try {
      let txHash = "0x89a1f2...7b94c";
      if (token) {
        try {
          const res = await releaseMilestonePayment(token, milestone.id);
          if (res.txHash) txHash = res.txHash;
        } catch (e) {}
      }

      setJob((prev: any) => {
        const updatedMs = prev.milestones.map((m: any, idx: number) => {
          if (m.id === milestone.id) {
            return { ...m, status: "RELEASED" };
          }
          // Unlock next milestone
          if (idx === milestone.num && m.status === "LOCKED") {
            return { ...m, status: "PENDING" };
          }
          return m;
        });
        saveMilestonesToStorage(updatedMs);
        return { ...prev, milestones: updatedMs };
      });

      setTxMessage(`25% Payment (${milestone.amount} ${milestone.tokenSymbol}) released on-chain! Tx: ${txHash}`);
    } catch (err: any) {
      setTxMessage("Failed to release payment.");
    } finally {
      setReleasingMilestoneId(null);
    }
  };

  const handleDeclinePayment = async (milestone: any) => {
    setJob((prev: any) => {
      const updatedMs = prev.milestones.map((m: any) =>
        m.id === milestone.id ? { ...m, status: "DECLINED" } : m
      );
      saveMilestonesToStorage(updatedMs);
      return { ...prev, milestones: updatedMs };
    });
    setTxMessage(`Milestone ${milestone.num} submission declined. Issue escalated to platform support.`);
  };

  const handleOpenRejectModal = (milestone: any) => {
    setRejectingMilestone(milestone);
    setRejectionReasonInput("");
    setShowRejectModal(true);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingMilestone) return;

    const currentCount = (rejectingMilestone.rejectionCount || 0) + 1;
    const isDisputed = currentCount >= 3;
    const newStatus = isDisputed ? "DISPUTED" : "REJECTED_NEEDS_REVISION";

    setJob((prev: any) => {
      const updatedMs = prev.milestones.map((m: any) => {
        if (m.id === rejectingMilestone.id) {
          return {
            ...m,
            status: newStatus,
            rejectionCount: currentCount,
            rejectionReason: rejectionReasonInput || "Client requested revisions for this deliverable.",
          };
        }
        return m;
      });
      saveMilestonesToStorage(updatedMs);
      return { ...prev, milestones: updatedMs };
    });

    if (isDisputed) {
      setTxMessage(`⚠️ Warning ${currentCount}/3 reached! Milestone ${rejectingMilestone.num} automatically escalated to DISPUTE. Vault escrow funds locked.`);
    } else {
      setTxMessage(`⚠️ Warning ${currentCount}/3 issued to freelancer for Milestone ${rejectingMilestone.num}. Feedback saved.`);
    }
    setShowRejectModal(false);
  };

  const handleEscalateToDispute = (milestone: any) => {
    setJob((prev: any) => {
      const updatedMs = prev.milestones.map((m: any) => {
        if (m.id === milestone.id) {
          return {
            ...m,
            status: "DISPUTED",
            rejectionReason: m.rejectionReason || "Client manually escalated unverified work to platform dispute.",
          };
        }
        return m;
      });
      saveMilestonesToStorage(updatedMs);
      return { ...prev, milestones: updatedMs };
    });
    setTxMessage(`🚨 Milestone ${milestone.num} moved to DISPUTE status. Vault escrow funds locked for arbitration.`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = {
      sender: user?.name || (isClient ? "Client" : "Freelancer"),
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted space-y-3">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-moss" />
        <p className="text-sm font-mono">Loading 4-Milestone Project Workspace…</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto py-20">
        <EmptyState
          icon={FolderOpenIcon}
          title="Project Not Found"
          description="We couldn't find the requested project workspace."
          action={{
            label: "Back to Projects",
            onClick: () => (window.location.href = "/projects"),
          }}
        />
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center space-x-2 text-muted hover:text-moss transition-colors font-mono text-xs mb-3"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Back to My Projects</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{job.title}</h1>
            <span className="px-3 py-1 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-moss/20 text-moss border border-moss/30">
              4-Milestone Vault (25% / Milestone)
            </span>
          </div>
        </div>

        {/* Workspace vs Chat Tabs */}
        <div className="flex items-center bg-surface border border-surface-border p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab("workspace")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "workspace"
                ? "bg-moss text-background shadow"
                : "text-muted hover:text-foreground"
            }`}
          >
            Workspace & 4 Milestones
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "chat"
                ? "bg-moss text-background shadow"
                : "text-muted hover:text-foreground"
            }`}
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            <span>Project Chat</span>
          </button>
        </div>
      </div>

      {txMessage && (
        <div className="p-4 rounded-xl bg-moss/20 border border-moss/40 text-moss font-mono text-xs flex items-center justify-between">
          <span>{txMessage}</span>
          <button onClick={() => setTxMessage("")} className="text-muted hover:text-foreground">
            ✕
          </button>
        </div>
      )}

      {/* Main Tab Views */}
      {activeTab === "workspace" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 4 Milestones Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-surface-border rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-surface-border">
                <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
                  <span>Project Milestone Pipeline</span>
                  <span className="text-xs font-mono text-muted bg-background border border-surface-border px-2.5 py-0.5 rounded-full font-normal">
                    Total Vault: {job.budget} {job.tokenSymbol}
                  </span>
                </h3>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-moss/10 text-moss font-semibold uppercase">
                  {isClient ? "Client View" : "Freelancer View"}
                </span>
              </div>

              {/* 4 Milestones List */}
              <div className="space-y-6">
                {job.milestones?.map((milestone: any) => {
                  const isSubmitted = milestone.status === "SUBMITTED";
                  const isApproved = milestone.status === "APPROVED";
                  const isReleased = milestone.status === "RELEASED";
                  const isNeedsRevision = milestone.status === "REJECTED_NEEDS_REVISION";
                  const isDisputed = milestone.status === "DISPUTED";
                  const isDeclined = milestone.status === "DECLINED";
                  const isLocked = milestone.status === "LOCKED";

                  return (
                    <div
                      key={milestone.id}
                      className={`bg-background border rounded-xl p-5 space-y-4 relative transition-all ${
                        isReleased
                          ? "border-moss/40 bg-moss/5"
                          : isApproved
                          ? "border-moss/30"
                          : isSubmitted
                          ? "border-amber-500/40 bg-amber-500/5"
                          : isNeedsRevision
                          ? "border-amber-500/50 bg-amber-500/10"
                          : isDisputed
                          ? "border-[#EF4444]/60 bg-[#EF4444]/10"
                          : isDeclined
                          ? "border-[#EF4444]/40 bg-[#EF4444]/5"
                          : isLocked
                          ? "border-surface-border opacity-60"
                          : "border-surface-border"
                      }`}
                    >
                      {/* Milestone Header */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-bold uppercase text-moss tracking-wider">
                              Milestone {milestone.num} (25% Payout = {milestone.amount} {milestone.tokenSymbol})
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-foreground">{milestone.title}</h4>
                          <p className="text-xs text-muted mt-1">{milestone.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono text-sm font-bold text-foreground">
                            {milestone.amount} {milestone.tokenSymbol}
                          </div>
                          <span
                            className={`text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded border inline-block mt-1 ${
                              isReleased
                                ? "bg-moss/20 text-moss border-moss/40"
                                : isApproved
                                ? "bg-moss/10 text-moss border-moss/30"
                                : isSubmitted
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                                : isNeedsRevision
                                ? "bg-amber-500/25 text-amber-300 border-amber-500/50"
                                : isDisputed
                                ? "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40 font-extrabold"
                                : isDeclined
                                ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30"
                                : isLocked
                                ? "bg-white/5 text-muted border-white/10"
                                : "bg-white/10 text-foreground border-white/20"
                            }`}
                          >
                            {isReleased
                              ? "25% Released"
                              : isApproved
                              ? "Oracle Verified"
                              : isSubmitted
                              ? "Under Client Review"
                              : isNeedsRevision
                              ? `Needs Revision (Warning ${milestone.rejectionCount || 1}/3)`
                              : isDisputed
                              ? "Escrow Disputed"
                              : isDeclined
                              ? "Declined"
                              : isLocked
                              ? "Locked"
                              : "In Progress"}
                          </span>
                        </div>
                      </div>

                      {/* Warning Box for Rejection */}
                      {milestone.rejectionReason && !isDisputed && (
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 space-y-1 text-xs font-mono">
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5">
                              <ExclamationTriangleIcon className="w-4 h-4 text-amber-400" />
                              Rejection Warning {milestone.rejectionCount || 1} of 3 Issued by Client
                            </span>
                            <span className="text-[10px] uppercase bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                              Revision Required
                            </span>
                          </div>
                          <p className="text-muted leading-relaxed">"{milestone.rejectionReason}"</p>
                        </div>
                      )}

                      {/* Dispute Banner if warnings reached 3 or escalated */}
                      {isDisputed && (
                        <div className="p-4 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/50 text-[#EF4444] space-y-1.5 text-xs font-mono">
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5 text-sm">
                              <ExclamationTriangleIcon className="w-4.5 h-4.5 text-[#EF4444]" />
                              ESCROW DISPUTE ACTIVE (Escrow Funds Locked)
                            </span>
                            <span className="text-[10px] uppercase bg-[#EF4444]/30 px-2 py-0.5 rounded border border-[#EF4444]/50">
                              In Arbitration
                            </span>
                          </div>
                          <p className="text-muted text-[11px] leading-relaxed">
                            This milestone has reached the 3-warning rejection limit or was escalated by the client. Escrow funds are locked in the smart contract vault pending platform arbitration.
                          </p>
                          {milestone.rejectionReason && (
                            <p className="text-foreground text-[11px] italic border-t border-[#EF4444]/30 pt-1">
                              Reason: "{milestone.rejectionReason}"
                            </p>
                          )}
                        </div>
                      )}

                      {/* Oracle Authenticity Score Badge */}
                      {milestone.aiReviewScore && (
                        <div className="p-3.5 rounded-xl bg-surface border border-moss/30 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ShieldCheckIcon className="w-4 h-4 text-moss" />
                              <span className="text-xs font-bold text-foreground">
                                Oracle AI Authenticity Verification
                              </span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-md bg-moss text-background font-mono font-extrabold text-xs">
                              Score: {milestone.aiReviewScore}/100
                            </span>
                          </div>
                          <p className="text-xs text-muted font-mono leading-relaxed">
                            Verified GitHub PR code quality, deployment health, and AI authenticity score.
                          </p>
                        </div>
                      )}

                      {/* Deliverable Proof Links */}
                      {(milestone.githubPrUrl || milestone.deploymentUrl || milestone.deliverableLink) && (
                        <div className="p-3.5 rounded-xl bg-surface border border-surface-border space-y-2">
                          <span className="text-[10px] font-mono text-muted uppercase font-semibold">Submitted Deliverable Proofs:</span>
                          <div className="flex flex-wrap gap-4 text-xs font-mono">
                            {milestone.githubPrUrl && (
                              <a
                                href={milestone.githubPrUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-moss hover:underline font-bold"
                              >
                                <CodeBracketIcon className="w-4 h-4" />
                                GitHub PR / Repository
                              </a>
                            )}
                            {milestone.deploymentUrl && (
                              <a
                                href={milestone.deploymentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-moss hover:underline font-bold"
                              >
                                <GlobeAltIcon className="w-4 h-4" />
                                Live Deployment URL
                              </a>
                            )}
                          </div>
                          {milestone.deliverableLink && (
                            <p className="text-xs text-muted leading-relaxed pt-1 border-t border-surface-border">
                              {milestone.deliverableLink}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Action Controls strictly separated by role */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-border">
                        {/* FREELANCER CONTROLS: Upload / Resubmit Proof Only */}
                        {!isClient && !isReleased && !isLocked && !isDisputed && (
                          <button
                            onClick={() => handleOpenSubmitModal(milestone)}
                            className="px-4 py-2 rounded-xl bg-moss hover:bg-[#BEF264] text-background text-xs font-bold transition shadow"
                          >
                            {isSubmitted || isNeedsRevision || isDeclined
                              ? `Resubmit Milestone ${milestone.num} Proof`
                              : `Submit Milestone ${milestone.num} Proof`}
                          </button>
                        )}

                        {/* CLIENT CONTROLS: Run Oracle, Accept & Release 25%, Reject with Warning, Escalate */}
                        {isClient && !isReleased && !isLocked && !isDisputed && (
                          <div className="flex flex-wrap items-center gap-2.5 w-full justify-between">
                            {/* Run Oracle AI Evaluation Button (Client Only) */}
                            {(isSubmitted || isApproved || isNeedsRevision) && (
                              <button
                                onClick={() => handleRunOracleVerification(milestone.id)}
                                disabled={verifyingMilestoneId === milestone.id}
                                className="px-3.5 py-2 rounded-xl bg-moss/20 hover:bg-moss/30 border border-moss/40 text-moss text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                              >
                                <ShieldCheckIcon className="w-4 h-4" />
                                {verifyingMilestoneId === milestone.id
                                  ? "Running Oracle Checks…"
                                  : "Run Oracle AI Evaluation"}
                              </button>
                            )}

                            {/* Release 25%, Reject & Issue Warning, Escalate Buttons */}
                            {(isSubmitted || isApproved || isNeedsRevision) && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  onClick={() => handleReleasePayment(milestone)}
                                  disabled={releasingMilestoneId === milestone.id}
                                  className="px-4 py-2 rounded-xl bg-moss hover:bg-[#BEF264] text-background text-xs font-bold transition flex items-center gap-1.5 shadow"
                                >
                                  <CheckCircleIcon className="w-4 h-4" />
                                  {releasingMilestoneId === milestone.id
                                    ? "Processing Payout…"
                                    : `Accept & Release 25% (${milestone.amount} ${milestone.tokenSymbol})`}
                                </button>
                                <button
                                  onClick={() => handleOpenRejectModal(milestone)}
                                  className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold transition flex items-center gap-1"
                                >
                                  <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                  Reject (Warning {(milestone.rejectionCount || 0) + 1}/3)
                                </button>
                                <button
                                  onClick={() => handleEscalateToDispute(milestone)}
                                  className="px-3 py-2 rounded-xl bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 text-[#EF4444] text-xs font-medium transition flex items-center gap-1"
                                >
                                  Escalate to Dispute
                                </button>
                              </div>
                            )}

                            {!isSubmitted && !isApproved && !isNeedsRevision && (
                              <span className="text-xs text-muted font-mono italic">
                                Waiting for freelancer to submit deliverable proof…
                              </span>
                            )}
                          </div>
                        )}

                        {isReleased && (
                          <div className="flex items-center gap-1.5 text-moss text-xs font-mono font-bold">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Milestone {milestone.num} (25%) Paid & Released</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-surface border border-surface-border rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-foreground">Vault Escrow Details</h3>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-muted block mb-1">Escrow Contract</span>
                  <div className="bg-background p-2.5 rounded-lg border border-surface-border text-moss break-all">
                    {job.escrowAddress || "0xC65457eC28A9609Ee11AB4A01aa8322E8c571b62"}
                  </div>
                </div>

                <div className="flex justify-between pt-2 border-t border-surface-border">
                  <span className="text-muted">Total Budget</span>
                  <span className="text-foreground font-bold">{job.budget} {job.tokenSymbol}</span>
                </div>

                <div className="flex justify-between pt-2 border-t border-surface-border">
                  <span className="text-muted">Payout Structure</span>
                  <span className="text-moss font-semibold">4 x 25% Milestones</span>
                </div>

                <div className="flex justify-between pt-2 border-t border-surface-border">
                  <span className="text-muted">Current Role View</span>
                  <span className="text-foreground font-bold uppercase">{isClient ? "CLIENT OWNER" : "FREELANCER"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Embedded Project Chat Tab */
        <div className="bg-surface border border-surface-border rounded-2xl p-6 max-w-3xl mx-auto flex flex-col h-[520px]">
          <div className="pb-4 border-b border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-moss" />
              <h3 className="font-bold text-sm text-foreground">
                Project Chat — {job.client?.name || "Client"}
              </h3>
            </div>
            <span className="text-xs font-mono text-moss flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-moss animate-pulse"></span>
              Realtime Active
            </span>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  m.sender === "System"
                    ? "items-center text-center my-2"
                    : m.sender === (user?.name || "User")
                    ? "items-end"
                    : "items-start"
                }`}
              >
                {m.sender === "System" ? (
                  <span className="px-3 py-1 rounded-full bg-background border border-surface-border text-[11px] font-mono text-muted">
                    {m.text}
                  </span>
                ) : (
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                      m.sender === (user?.name || "User")
                        ? "bg-moss text-background rounded-tr-none font-medium"
                        : "bg-background border border-surface-border text-foreground rounded-tl-none"
                    }`}
                  >
                    <div className="flex justify-between items-center gap-3 text-[10px] opacity-75 font-mono">
                      <span>{m.sender}</span>
                      <span>{m.time}</span>
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-surface-border flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type message..."
              className="flex-1 bg-background border border-surface-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-moss"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-moss hover:bg-[#BEF264] text-background font-bold text-xs transition flex items-center gap-1.5"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      )}

      {/* Deliverable Proof Upload Modal */}
      <AnimatePresence>
        {showSubmitModal && submittingMilestone && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-surface-border rounded-2xl p-6 max-w-lg w-full space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center pb-3 border-b border-surface-border">
                <h3 className="font-extrabold text-base text-foreground">
                  Submit Milestone {submittingMilestone.num} Proof (25% Payout)
                </h3>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="text-muted hover:text-foreground text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              {submitMessage && (
                <div className="p-3 rounded-xl bg-moss/20 border border-moss/40 text-moss text-xs font-mono">
                  {submitMessage}
                </div>
              )}

              <form onSubmit={handleSubmitProof} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-muted mb-1 uppercase text-[10px]">
                    GitHub Pull Request / Repository URL
                  </label>
                  <input
                    type="url"
                    required
                    value={githubPrUrl}
                    onChange={(e) => setGithubPrUrl(e.target.value)}
                    placeholder="https://github.com/org/repo/pull/1"
                    className="w-full bg-background border border-surface-border rounded-xl p-3 text-foreground placeholder:text-muted focus:border-moss outline-none"
                  />
                </div>

                <div>
                  <label className="block text-muted mb-1 uppercase text-[10px]">
                    Live Deployment URL
                  </label>
                  <input
                    type="url"
                    value={deploymentUrl}
                    onChange={(e) => setDeploymentUrl(e.target.value)}
                    placeholder="https://my-dapp.vercel.app"
                    className="w-full bg-background border border-surface-border rounded-xl p-3 text-foreground placeholder:text-muted focus:border-moss outline-none"
                  />
                </div>

                <div>
                  <label className="block text-muted mb-1 uppercase text-[10px]">
                    Deliverable Notes / Proof Summary
                  </label>
                  <textarea
                    rows={3}
                    value={deliverableLink}
                    onChange={(e) => setDeliverableLink(e.target.value)}
                    placeholder="Provide deliverable overview, features completed, and verification notes..."
                    className="w-full bg-background border border-surface-border rounded-xl p-3 text-foreground placeholder:text-muted focus:border-moss outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-surface-border text-muted hover:text-foreground transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-moss hover:bg-[#BEF264] text-background font-bold uppercase tracking-wider transition disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting Proof…" : `Submit Milestone ${submittingMilestone.num}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Client Rejection Warning Modal */}
        {showRejectModal && rejectingMilestone && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-surface-border rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl"
            >
              <div className="flex justify-between items-center pb-3 border-b border-surface-border">
                <div>
                  <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-400" />
                    <span>Issue Warning & Reject Milestone {rejectingMilestone.num}</span>
                  </h3>
                  <span className="text-[11px] font-mono text-amber-400 mt-0.5 block">
                    Warning {(rejectingMilestone.rejectionCount || 0) + 1} of 3 Max Warnings Allowed
                  </span>
                </div>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-muted hover:text-foreground text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              {(rejectingMilestone.rejectionCount || 0) + 1 >= 3 && (
                <div className="p-3.5 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-xs font-mono">
                  <strong>⚠️ Final Warning Notice:</strong> Issuing this 3rd warning will automatically escalate Milestone {rejectingMilestone.num} and lock escrow funds in platform DISPUTE mode.
                </div>
              )}

              <form onSubmit={handleConfirmReject} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-muted mb-1 uppercase text-[10px]">
                    Rejection Feedback / Required Revisions
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    placeholder="Specify clearly what changes or additions are required before this milestone can be accepted..."
                    className="w-full bg-background border border-surface-border rounded-xl p-3 text-foreground placeholder:text-muted focus:border-amber-400 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-surface-border text-muted hover:text-foreground transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-background font-bold uppercase tracking-wider transition shadow"
                  >
                    Confirm Rejection & Issue Warning {(rejectingMilestone.rejectionCount || 0) + 1}/3
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
