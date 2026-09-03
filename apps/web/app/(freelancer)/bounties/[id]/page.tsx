"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Send,
  Users,
  XCircle,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchJob,
  fetchMyApplications,
  applyToJob,
  getAuthToken,
  ApiError,
  Job,
  JobApplication,
  ApplicationStatus,
  formatBudget,
  formatDate,
  daysUntil,
  formatRelative,
} from "@/lib/api";
import { useApiFetch, apiErrorMessage } from "@/hooks/useApiFetch";

const APP_STATUS_UI: Record<ApplicationStatus, { label: string; className: string; icon: "check" | "x" | "clock" | "eye" }> = {
  SUBMITTED: { label: "Application Submitted", className: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30", icon: "clock" },
  UNDER_REVIEW: { label: "Application Under Review", className: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30", icon: "eye" },
  ACCEPTED: { label: "Application Accepted", className: "bg-moss/10 text-moss border-moss/30", icon: "check" },
  REJECTED: { label: "Application Rejected", className: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30", icon: "x" },
};

export default function BountyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [pitch, setPitch] = useState("");
  const [requestedRate, setRequestedRate] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const {
    data,
    isLoading,
    error: loadError,
    reload: load,
    setData,
  } = useApiFetch<{ job: Job; myApplication: JobApplication | null }>(async () => {
    const jobResponse = await fetchJob(id);
    let myApplication: JobApplication | null = null;
    const token = getAuthToken();
    if (token) {
      try {
        const appsResponse = await fetchMyApplications(token);
        myApplication = (appsResponse.applications || []).find((a) => a.jobId === id) || null;
      } catch {
        // Ignore auth failures — application state simply stays unknown.
      }
    }
    return { job: jobResponse.job, myApplication };
  }, [id]);

  const job = data?.job ?? null;
  const myApplication = data?.myApplication ?? null;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setApplyError(null);
    if (!pitch.trim()) {
      setApplyError("Your proposal is required.");
      return;
    }
    const rate = Number(requestedRate);
    const days = Number(deliveryDays);
    if (!rate || rate <= 0) {
      setApplyError("Proposed amount must be a positive number.");
      return;
    }
    if (!days || days <= 0) {
      setApplyError("Expected delivery days must be a positive number.");
      return;
    }

    setSubmitting(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setApplyError("You need to sign in to apply.");
        setSubmitting(false);
        return;
      }
      const res = await applyToJob(token, id, { pitch: pitch.trim(), requestedRate: rate, deliveryDays: days });
      setData((prev) => ({ job: prev?.job ?? job, myApplication: res.application }));
      setApplySuccess(true);
      setShowApplyForm(false);
      setPitch("");
      setRequestedRate("");
      setDeliveryDays("");
    } catch (err) {
      if (err instanceof ApiError) {
        setApplyError(err.message);
        if (err.status === 409) {
          // Duplicate or already applied — reflect the server state.
          load();
        }
      } else {
        setApplyError(apiErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resyncApplication = () => {
    load();
  };

  const due = job ? daysUntil(job.deadline) : null;

  if (isLoading) {
    return (
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center py-32 text-muted space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-moss" />
          <p className="text-sm font-mono">Loading job…</p>
        </div>
      </main>
    );
  }

  if (loadError || !job) {
    return (
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-20">
        <EmptyState
          icon={AlertCircle}
          title="Job Not Found"
          description={loadError || "We couldn't find the job you're looking for. It may have been removed or the link is incorrect."}
          action={{ label: "Back to Marketplace", onClick: () => router.push("/bounties") }}
        />
      </main>
    );
  }

  const isOwner = user?.role === "CLIENT" && user.id === job.clientId;

  const renderApplyArea = () => {
    // Not signed in
    if (!user) {
      return (
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="w-full px-6 py-3 bg-moss hover:bg-[#BEF264] text-background font-semibold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
        >
          Sign in to Apply
          <ArrowRight className="w-4 h-4" />
        </button>
      );
    }

    // Job owner (client viewing their own job)
    if (isOwner) {
      return (
        <Link
          href={`/client/jobs/${job.id}`}
          className="w-full px-6 py-3 bg-background border border-surface-border hover:border-moss/50 text-foreground hover:text-moss font-semibold text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Briefcase className="w-4 h-4" />
          View Applications
          <ArrowRight className="w-4 h-4" />
        </Link>
      );
    }

    // Client viewing someone else's job
    if (user.role === "CLIENT") {
      return (
        <div className="px-6 py-4 bg-background border border-surface-border rounded-xl text-xs text-muted text-center">
          Clients cannot apply to jobs. Switch to a freelancer account to apply.
        </div>
      );
    }

    // Freelancer: job no longer accepting applications
    if (job.status !== "PUBLISHED") {
      return (
        <div className="px-6 py-4 bg-background border border-surface-border rounded-xl text-xs text-muted text-center">
          This job is no longer accepting applications ({job.status.replace(/_/g, " ")}).
        </div>
      );
    }

    // Freelancer: already applied
    if (myApplication) {
      const ui = APP_STATUS_UI[myApplication.status];
      return (
        <div className={`px-6 py-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold ${ui.className}`}>
          {ui.icon === "check" && <CheckCircle2 className="w-5 h-5" />}
          {ui.icon === "x" && <XCircle className="w-5 h-5" />}
          {ui.icon === "clock" && <Clock className="w-5 h-5" />}
          {ui.label}
        </div>
      );
    }

    // Freelancer: apply
    if (!showApplyForm) {
      return (
        <button
          onClick={() => setShowApplyForm(true)}
          className="w-full px-6 py-3 bg-moss hover:bg-[#BEF264] text-background font-semibold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          Apply Now
        </button>
      );
    }

    return (
      <form onSubmit={handleApply} className="space-y-4">
        <div>
          <label className="block text-[11px] font-mono font-semibold uppercase text-muted mb-1.5">
            Proposal <span className="text-[#EF4444]">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="Introduce yourself, outline your approach, and explain why you're the right fit…"
            className="w-full bg-background border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-moss/60 transition-colors resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono font-semibold uppercase text-muted mb-1.5">
              Proposed Amount ({job.tokenSymbol})
            </label>
            <input
              type="number"
              min={1}
              value={requestedRate}
              onChange={(e) => setRequestedRate(e.target.value)}
              placeholder="450"
              className="w-full bg-background border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-moss/60 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono font-semibold uppercase text-muted mb-1.5">
              Delivery Days
            </label>
            <input
              type="number"
              min={1}
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
              placeholder="14"
              className="w-full bg-background border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-moss/60 transition-colors"
            />
          </div>
        </div>
        {applyError && (
          <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444]">{applyError}</div>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full px-6 py-3 bg-moss hover:bg-[#BEF264] text-background font-semibold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {submitting ? "Submitting…" : "Submit Application"}
        </button>
      </form>
    );
  };

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-8">
      {applySuccess && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-moss/10 border border-moss/30 flex items-center gap-3 text-sm text-moss"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>
            <strong>Application submitted!</strong> The client has been notified and will review your proposal.
          </span>
        </motion.div>
      )}

      <div>
        <Link
          href="/bounties"
          className="inline-flex items-center gap-2 text-muted hover:text-moss transition-colors duration-300 font-mono text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
      </div>

      {/* Header */}
      <div className="bg-surface border border-surface-border rounded-2xl p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold bg-moss/20 text-moss border border-moss/30">
                {job.status === "PUBLISHED" ? "Accepting Applications" : job.status.replace(/_/g, " ")}
              </span>
              <span className="text-[11px] text-muted font-mono">Posted {formatRelative(job.createdAt)}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight max-w-3xl">{job.title}</h1>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-extrabold text-foreground font-mono">{formatBudget(job)}</div>
            {due !== null && (
              <div className="text-xs text-muted font-mono mt-1 flex items-center justify-end gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                {due <= 0 ? "Deadline passed" : `Due in ${due} days`}
                {job.deadline && <span>({formatDate(job.deadline)})</span>}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 border-t border-surface-border pt-6">
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <span key={skill} className="px-2 py-0.5 rounded-md bg-background border border-surface-border text-[11px] font-mono text-muted">
                {skill}
              </span>
            ))}
            {job.skills.length === 0 && <span className="text-[11px] font-mono text-muted">No skills specified</span>}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted font-mono ml-auto">
            <Users className="w-4 h-4" />
            {job._count?.applications ?? 0} applications
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6 tracking-tight">Project Description</h3>
            <p className="text-muted leading-relaxed font-light whitespace-pre-line">{job.description}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface border border-surface-border rounded-2xl p-6">
            <h3 className="text-foreground font-bold text-base mb-6 tracking-tight">Client Info</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-background border border-surface-border rounded-full flex items-center justify-center text-moss font-bold text-lg">
                  {(job.client?.name || job.client?.email || "C").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-foreground text-sm">{job.client?.name || job.client?.email?.split("@")[0] || "Client"}</div>
                  <div className="text-xs text-muted">{job.client?.email || "—"}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-surface-border">
                <div>
                  <div className="text-xs font-mono text-muted mb-1 uppercase">Rating</div>
                  <div className="text-foreground font-semibold text-base flex items-center">
                    {job.client?.rating?.toFixed(1) ?? "5.0"} <span className="text-[#F59E0B] ml-1">★</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono text-muted mb-1 uppercase">Member Since</div>
                  <div className="text-foreground font-semibold text-base">{formatDate(job.client?.createdAt)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-surface-border rounded-2xl p-6 space-y-4">
            <h3 className="text-foreground font-bold text-base tracking-tight">Apply for this Project</h3>
            {renderApplyArea()}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signin"
        initialRole="FREELANCER"
        onSuccess={() => {
          resyncApplication();
        }}
      />
    </main>
  );
}