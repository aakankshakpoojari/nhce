"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Plus,
  Users,
  Lock,
  CheckCircle2,
  Sparkles,
  Zap,
  Star,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  Clock,
  Award,
  AlertCircle,
} from "lucide-react";
import ClientNavbar from "./components/ClientNavbar";
import PostProjectModal from "./components/PostProjectModal";
import UpgradeProModal from "./components/UpgradeProModal";
import ApplicantsModal, { Applicant } from "./components/ApplicantsModal";
import EscrowCard, { EscrowItem } from "./components/EscrowCard";

export interface Project {
  id: string;
  title: string;
  description: string;
  skills: string[];
  budgetUSD: number;
  budgetINR: number;
  duration: string;
  status: "open" | "in_progress" | "completed";
  createdAt: string;
  applicants: Applicant[];
}

export default function ClientDashboardPage() {
  const router = useRouter();
  const [creditsRemaining, setCreditsRemaining] = useState(3);
  const [isPro, setIsPro] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [activeProjectForApplicants, setActiveProjectForApplicants] = useState<Project | null>(null);
  const [roleConflictWarning, setRoleConflictWarning] = useState<string | null>(null);

  // Dynamic state: initially empty (no hardcoded projects)
  const [projects, setProjects] = useState<Project[]>([]);
  const [escrows, setEscrows] = useState<EscrowItem[]>([]);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    projectTitle: string;
    text: string;
    time: string;
    read: boolean;
  }>>([]);

  // Load persisted projects & check role authentication
  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeAddress = (localStorage.getItem("w3hire_active_address") || "0x71C3a7F9B1E48574B40B62E3e74dB826500F949A").toLowerCase();
      const savedRole = localStorage.getItem(`w3hire_wallet_role_${activeAddress}`);

      if (savedRole && savedRole === "freelancer") {
        setRoleConflictWarning(`Your active wallet (${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}) is registered as a Freelancer. You cannot use the Client dashboard with this account.`);
      }

      // Load saved projects
      const savedProjects = localStorage.getItem("w3hire_client_projects");
      if (savedProjects) {
        try {
          setProjects(JSON.parse(savedProjects));
        } catch (e) {
          console.error(e);
        }
      }

      // Load saved escrows
      const savedEscrows = localStorage.getItem("w3hire_client_escrows");
      if (savedEscrows) {
        try {
          setEscrows(JSON.parse(savedEscrows));
        } catch (e) {
          console.error(e);
        }
      }

      // Load saved credits
      const savedCredits = localStorage.getItem("w3hire_client_credits");
      if (savedCredits !== null) {
        setCreditsRemaining(Number(savedCredits));
      }

      // Load saved pro status
      const savedPro = localStorage.getItem("w3hire_client_is_pro");
      if (savedPro === "true") {
        setIsPro(true);
      }
    }
  }, []);

  // Save projects on update
  const saveProjectsToStorage = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    if (typeof window !== "undefined") {
      localStorage.setItem("w3hire_client_projects", JSON.stringify(updatedProjects));
    }
  };

  // Save escrows on update
  const saveEscrowsToStorage = (updatedEscrows: EscrowItem[]) => {
    setEscrows(updatedEscrows);
    if (typeof window !== "undefined") {
      localStorage.setItem("w3hire_client_escrows", JSON.stringify(updatedEscrows));
    }
  };

  // Handle Project Creation
  const handleCreateProject = (newProjectData: {
    title: string;
    description: string;
    skills: string[];
    budgetUSD: number;
    budgetINR: number;
    duration: string;
  }) => {
    if (!isPro && creditsRemaining > 0) {
      const newCredits = creditsRemaining - 1;
      setCreditsRemaining(newCredits);
      if (typeof window !== "undefined") {
        localStorage.setItem("w3hire_client_credits", String(newCredits));
      }
    }

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      ...newProjectData,
      status: "open",
      createdAt: "Just now",
      applicants: [],
    };

    const updated = [newProj, ...projects];
    saveProjectsToStorage(updated);

    // Simulate incoming applicants notification after a few seconds
    setTimeout(() => {
      const applicantName = "Vikram Sharma";
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          projectTitle: newProj.title,
          text: `${applicantName} (⭐ 4.9 PRO) applied to your project.`,
          time: "Just now",
          read: false,
        },
        ...prev,
      ]);

      // Add sample incoming candidate to the project
      setProjects((currentProjects) => {
        const next = currentProjects.map((p) =>
          p.id === newProj.id
            ? {
                ...p,
                applicants: [
                  {
                    id: `app-${Date.now()}`,
                    name: applicantName,
                    avatar: "VS",
                    role: "Senior Smart Contract Engineer",
                    rating: 4.9,
                    completedJobs: 18,
                    isPro: true,
                    skills: newProj.skills.length > 0 ? newProj.skills : ["Solidity", "Security"],
                    proposedUSD: newProj.budgetUSD,
                    proposedINR: newProj.budgetINR,
                    proposal:
                      "I have extensive experience in this exact domain. Ready to begin immediately and commit milestone deliveries on-chain.",
                    githubUrl: "https://github.com",
                    portfolioUrl: "https://portfolio.dev",
                  },
                ],
              }
            : p
        );
        if (typeof window !== "undefined") {
          localStorage.setItem("w3hire_client_projects", JSON.stringify(next));
        }
        return next;
      });
    }, 2500);
  };

  // Handle Hiring & Escrow Creation
  const handleHireApplicant = (applicant: Applicant) => {
    if (!activeProjectForApplicants) return;

    const newEscrow: EscrowItem = {
      id: `esc-${Date.now()}`,
      projectTitle: activeProjectForApplicants.title,
      freelancerName: applicant.name,
      freelancerAvatar: applicant.avatar,
      amountUSD: applicant.proposedUSD,
      amountINR: applicant.proposedINR,
      status: "locked",
      createdAt: "Just now",
      txHash: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 6)}`,
    };

    saveEscrowsToStorage([newEscrow, ...escrows]);

    // Update project status to in_progress
    const updated = projects.map((p) =>
      p.id === activeProjectForApplicants.id ? { ...p, status: "in_progress" as const } : p
    );
    saveProjectsToStorage(updated);
  };

  const handleReleaseEscrow = (id: string) => {
    const updated = escrows.map((e) => (e.id === id ? { ...e, status: "released" as const } : e));
    saveEscrowsToStorage(updated);
  };

  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleActivatePro = () => {
    setIsPro(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("w3hire_client_is_pro", "true");
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F5F5F4] flex flex-col selection:bg-[#84CC16] selection:text-[#101312]">
      
      {/* Top Client Navbar */}
      <ClientNavbar
        creditsRemaining={creditsRemaining}
        maxCredits={3}
        isPro={isPro}
        onPostProjectClick={() => setIsPostModalOpen(true)}
        onUpgradeProClick={() => setIsProModalOpen(true)}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
      />

      {/* Role Conflict Warning Banner (if user is logged in as freelancer) */}
      {roleConflictWarning && (
        <div className="bg-[#EF4444]/20 border-b border-[#EF4444]/40 px-6 py-3 text-xs text-[#EF4444] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{roleConflictWarning}</span>
          </div>
          <Link
            href="/freelancer"
            className="px-3 py-1 rounded-lg bg-[#EF4444] text-white font-bold hover:bg-red-600 transition"
          >
            Go to Freelancer Portal →
          </Link>
        </div>
      )}

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Monthly Credits & Pro Banner */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Credit Status Card */}
          <div className="p-6 rounded-2xl bg-[#181D1A] border border-[#28332D] flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#A3A3A3] uppercase">Monthly Free Allowance</span>
                <span className="w-2 h-2 rounded-full bg-[#84CC16]" />
              </div>
              <div className="text-2xl font-black text-[#F5F5F4] font-mono">
                {isPro ? (
                  <span className="text-[#84CC16]">PRO UNLIMITED</span>
                ) : (
                  <span>{creditsRemaining} / 3 <span className="text-xs text-[#A3A3A3] font-normal">Credits Left</span></span>
                )}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#28332D] text-xs text-[#A3A3A3] flex justify-between items-center">
              <span>{isPro ? "Unlimited Postings" : "Free Plan (3 free posts/month)"}</span>
              {!isPro && (
                <button
                  onClick={() => setIsProModalOpen(true)}
                  className="text-[#84CC16] font-bold hover:underline"
                >
                  Buy Pro →
                </button>
              )}
            </div>
          </div>

          {/* Active Escrow TVL */}
          <div className="p-6 rounded-2xl bg-[#181D1A] border border-[#28332D] flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#A3A3A3] uppercase">Locked Escrow Vaults</span>
              <div className="text-2xl font-black text-[#F5F5F4] font-mono">
                ${escrows.reduce((acc, curr) => acc + (curr.status !== "released" ? curr.amountUSD : 0), 0).toLocaleString()}
                <span className="text-xs text-[#22C55E] ml-2 font-normal font-sans">USDC</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#28332D] text-xs text-[#A3A3A3] flex justify-between">
              <span>{escrows.filter((e) => e.status !== "released").length} Active Milestones</span>
              <span className="text-[#22C55E]">100% Non-Custodial</span>
            </div>
          </div>

          {/* Quick Post Action Box */}
          <div className="p-6 rounded-2xl bg-[#181D1A] border border-[#28332D] flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#84CC16] uppercase">Instant Milestone Hiring</span>
              <div className="text-lg font-bold text-[#F5F5F4]">
                Post a Project & Hire
              </div>
            </div>
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="mt-4 py-2.5 px-4 rounded-xl bg-[#84CC16] hover:bg-[#BEF264] text-[#101312] font-semibold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-md shadow-[#84CC16]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Work (USD & INR)</span>
            </button>
          </div>

        </section>

        {/* Section: Posted Works */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-[#F5F5F4] tracking-tight">
                Your Posted Projects
              </h2>
              <p className="text-xs text-[#A3A3A3]">
                Review applications, filter talent by skills and ratings, and initiate smart contract escrows.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {projects.length === 0 ? (
              /* Clean Empty State */
              <div className="p-12 rounded-2xl bg-[#181D1A] border border-[#28332D] text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#101312] border border-[#28332D] flex items-center justify-center mx-auto text-[#84CC16]">
                  <Briefcase className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#F5F5F4]">No projects posted yet</h3>
                  <p className="text-xs text-[#A3A3A3] max-w-sm mx-auto">
                    You have <span className="text-[#84CC16] font-bold">{creditsRemaining} free credits</span> available this month. Post your first project to receive proposals.
                  </p>
                </div>
                <button
                  onClick={() => setIsPostModalOpen(true)}
                  className="py-2.5 px-5 rounded-xl bg-[#84CC16] hover:bg-[#BEF264] text-[#101312] font-semibold text-xs transition shadow-md inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Project for Free</span>
                </button>
              </div>
            ) : (
              projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-6 rounded-2xl bg-[#181D1A] border border-[#28332D] hover:border-[#84CC16]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  {/* Left Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold ${
                          proj.status === "open"
                            ? "bg-[#84CC16]/20 text-[#84CC16] border border-[#84CC16]/30"
                            : "bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30"
                        }`}
                      >
                        {proj.status === "open" ? "Accepting Proposals" : "In Progress (Escrow Locked)"}
                      </span>
                      <span className="text-[11px] text-[#A3A3A3] font-mono">Posted {proj.createdAt}</span>
                    </div>

                    <h3 className="text-base font-bold text-[#F5F5F4]">{proj.title}</h3>
                    <p className="text-xs text-[#A3A3A3] line-clamp-2">{proj.description}</p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#101312] border border-[#28332D] text-[11px] font-mono text-[#A3A3A3]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Budget & Applicant CTA */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-[#28332D]">
                    <div className="text-left md:text-right">
                      <div className="text-base font-extrabold text-[#F5F5F4] font-mono">
                        ${proj.budgetUSD}
                      </div>
                      <div className="text-xs text-[#A3A3A3] font-mono">
                        ₹{proj.budgetINR.toLocaleString("en-IN")}
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveProjectForApplicants(proj)}
                      className="px-4 py-2.5 rounded-xl bg-[#101312] hover:bg-[#84CC16] text-[#F5F5F4] hover:text-[#101312] border border-[#28332D] hover:border-[#84CC16] transition-all text-xs font-semibold flex items-center gap-2 shadow-sm"
                    >
                      <Users className="w-3.5 h-3.5 text-[#84CC16] group-hover:text-[#101312]" />
                      <span>
                        {proj.applicants.length}{" "}
                        {proj.applicants.length === 1 ? "Applicant" : "Applicants"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section: Active Smart Contract Escrows */}
        {escrows.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-[#28332D]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-[#F5F5F4] tracking-tight">
                  Active Escrow Vaults
                </h2>
                <p className="text-xs text-[#A3A3A3]">
                  Funds locked in multisig contracts. Release upon reviewing freelancer milestone deliveries.
                </p>
              </div>
              <Link
                href="/client/escrows"
                className="text-xs text-[#84CC16] hover:underline font-mono"
              >
                View All Escrows →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {escrows.map((escrow) => (
                <EscrowCard
                  key={escrow.id}
                  escrow={escrow}
                  onRelease={handleReleaseEscrow}
                />
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Modals */}
      <PostProjectModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        creditsRemaining={creditsRemaining}
        isPro={isPro}
        onSubmit={handleCreateProject}
        onUpgradePro={() => {
          setIsPostModalOpen(false);
          setIsProModalOpen(true);
        }}
      />

      <UpgradeProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        onConfirmPro={handleActivatePro}
      />

      {activeProjectForApplicants && (
        <ApplicantsModal
          isOpen={!!activeProjectForApplicants}
          onClose={() => setActiveProjectForApplicants(null)}
          projectTitle={activeProjectForApplicants.title}
          budgetUSD={activeProjectForApplicants.budgetUSD}
          budgetINR={activeProjectForApplicants.budgetINR}
          applicants={activeProjectForApplicants.applicants}
          onHire={handleHireApplicant}
        />
      )}
    </div>
  );
}
