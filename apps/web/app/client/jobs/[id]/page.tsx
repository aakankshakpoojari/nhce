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
  Eye,
  Loader2,
  Pencil,
  Send,
  Star,
  Users,
  XCircle,
  AlertCircle,
  Clock,
  UserCheck,
  Trash2,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import {
  fetchJobApplications,
  selectFreelancer,
  rejectApplication,
  reviewApplication,
  publishJob,
  deleteJob,
  getAuthToken,
  ApiError,
  Job,
  JobApplication,
  ApplicationStatus,
  APPLICATION_STATUS_LABELS,
  JOB_STATUS_LABELS,
  formatBudget,
  formatDate,
  formatRelative,
  daysUntil,
} from "@/lib/api";
import { useApiFetch, apiErrorMessage } from "@/hooks/useApiFetch";

const APP_STATUS_STYLES: Record<ApplicationStatus, string> = {
  SUBMITTED: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
  UNDER_REVIEW: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
  ACCEPTED: "bg-moss/10 text-moss border-moss/30",
  REJECTED: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30",
};

export default function ClientJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    data,
    isLoading,
    error,
    reload: load,
  } = useApiFetch<{ job: Job; applications: JobApplication[] } | null>(async () => {
      const token = getAuthToken();
      if (!token) return null;
      const response = await fetchJobApplications(token, id);
      return { job: response.job, applications: response.applications || [] };
    }, [id]);

  const job = data?.job ?? null;
  const applications = data?.applications ?? [];

  const runAction = async (action: () => Promise<unknown>, actionIdValue: string, success: string) => {
    setActionId(actionIdValue);
    setActionError(null);
    setSuccessMessage(null);
    try {
      const token = getAuthToken();
      if (!token) throw new ApiError(401, "Not authenticated");
      await action();
      setSuccessMessage(success);
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : apiErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const requireToken = () => {
    const token = getAuthToken();
    if (!token) throw new ApiError(401, "Not authenticated");
    return token;
  };

  const handleSelect = (application: JobApplication) => {
    if (!window.confirm(`Select ${application.freelancer?.name || "this freelancer"} for this job?\nAll other applications will be rejected.`)) return;
    runAction(async () => {
      await selectFreelancer(requireToken(), id, application.id);
    }, application.id, "Freelancer selected. Other applications were rejected.");
  };

  const handleReject = (application: JobApplication) => {
    runAction(async () => {
      await rejectApplication(requireToken(), id, application.id);
    }, application.id, "Application rejected.");
  };

  const handleReview = (application: JobApplication) => {
    runAction(async () => {
      await reviewApplication(requireToken(), id, application.id);
    }, application.id, "Application marked as under review.");
  };

  const handlePublish = () => {
    runAction(async () => {
      await publishJob(requireToken(), id);
    }, "publish", "Job published to the marketplace.");
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this job? This action cannot be undone.")) return;
    setActionId("delete");
    setActionError(null);
    setSuccessMessage(null);
    try {
      await deleteJob(requireToken(), id);
      router.push("/client/jobs");
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : apiErrorMessage(err));
      setActionId(null);
    }
  };

  const due = job ? daysUntil(job.deadline) : null;
  const isDraft = job?.status === "DRAFT";
  const isEditable = job?.status === "DRAFT" || job?.status === "PUBLISHED";
  const isDeletable = job?.status === "DRAFT" || job?.status === "PUBLISHED" || job?.status === "OPEN";
  const selectionMade = job?.status === "FREELANCER_SELECTED";
  const selectedApp = selectionMade ? applications.find((a) => a.status === "ACCEPTED") : null;

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

  if (error || !job) {
    const needsAuth = !error && !job;
    return (
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-20">
        <EmptyState
          icon={AlertCircle}
          title={needsAuth ? "Sign in to manage this job" : "Job Not Found"}
          description={
            needsAuth
              ? "Log in with the client account that owns this job to review applications."
              : error || "This job could not be loaded. It may have been removed."
          }
          action={{ label: needsAuth ? "Go to Marketplace" : "Back to My Jobs", onClick: () => router.push(needsAuth ? "/bounties" : "/client/jobs") }}
        />
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-8">
      <div>
        <Link href="/client/jobs" className="inline-flex items-center gap-2 text-muted hover:text-moss transition-colors duration-300 font-mono text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to My Jobs
        </Link>
      </div>

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-moss/10 border border-moss/30 flex items-center gap-3 text-sm text-moss"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {successMessage}
        </motion.div>
      )}
      {actionError && (
        <div className="p-4 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center gap-3 text-sm text-[#EF4444]">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {actionError}
        </div>
      )}

      {/* Header */}
      <div className="bg-surface border border-surface-border rounded-2xl p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold border ${
                isDraft ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30" : "bg-moss/10 text-moss border-moss/30"
              }`}>
                {JOB_STATUS_LABELS[job.status]}
              </span>
              <span className="text-[11px] text-muted font-mono">Created {formatDate(job.createdAt)}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight max-w-3xl">{job.title}</h1>
          </div>
          <div className="text-right shrink-0 space-y-1">
            <div className="text-2xl font-extrabold text-foreground font-mono">{formatBudget(job)}</div>
            {due !== null && (
              <div className="text-xs text-muted font-mono flex items-center justify-end gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                {due <= 0 ? "Deadline passed" : `Due in ${due} days`}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-surface-border pt-6">
          <div className="flex flex-wrap gap-1.5 mr-auto">
            {job.skills.map((skill) => (
              <span key={skill} className="px-2 py-0.5 rounded-md bg-background border border-surface-border text-[11px] font-mono text-muted">
                {skill}
              </span>
            ))}
            {job.skills.length === 0 && <span className="text-[11px] font-mono text-muted">No skills specified</span>}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted font-mono px-3 py-1.5 rounded-lg bg-background border border-surface-border">
            <Users className="w-3.5 h-3.5" />
            {applications.length} {applications.length === 1 ? "application" : "applications"}
          </div>
          {isEditable && (
            <Link
              href={`/client/jobs/${job.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-background border border-surface-border hover:border-moss/50 text-foreground hover:text-moss text-xs font-semibold transition"
            >
              <Pencil className="w-3.5 h-3.5" />
              {isDraft ? "Edit Draft" : "Edit"}
            </Link>
          )}
          {isDraft && (
            <button
              onClick={handlePublish}
              disabled={actionId === "publish"}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-moss hover:bg-[#BEF264] text-background text-xs font-semibold transition disabled:opacity-60"
            >
              {actionId === "publish" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {actionId === "publish" ? "Publishing…" : "Publish"}
            </button>
          )}
          {isDeletable && (
            <button
              onClick={handleDelete}
              disabled={actionId === "delete"}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-background border border-surface-border hover:border-[#EF4444]/50 text-foreground hover:text-[#EF4444] text-xs font-semibold transition disabled:opacity-60"
            >
              {actionId === "delete" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              {actionId === "delete" ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
      </div>

      {/* Selected freelancer banner */}
      {selectionMade && (
        <div className="p-6 rounded-2xl bg-moss/10 border border-moss/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-moss text-background flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base font-extrabold text-foreground flex items-center gap-2">
                Freelancer Selected: <span className="text-moss">{selectedApp?.freelancer?.name || "Freelancer"}</span>
                {selectedApp?.freelancer && (
                  <span className="text-xs text-muted flex items-center gap-0.5 font-normal">
                    <Star className="w-3.5 h-3.5 text-[#F59E0B]" />
                    {selectedApp.freelancer.rating?.toFixed(1)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-0.5">
                The freelancer has been hired! Deploy a smart contract escrow vault on Sepolia Devnet to lock the project budget and initiate work.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            {selectedApp && (
              <div className="text-left sm:text-right">
                <div className="text-sm font-extrabold font-mono text-foreground">
                  {formatBudget({ budget: job.budget, tokenSymbol: job.tokenSymbol })}
                </div>
                <div className="text-xs text-muted">{selectedApp.deliveryDays} delivery {selectedApp.deliveryDays === 1 ? "day" : "days"}</div>
              </div>
            )}

            <Link
              href={`/client/create-escrow?jobId=${job.id}&title=${encodeURIComponent(job.title)}&freelancerAddress=${encodeURIComponent((selectedApp?.walletAddress && selectedApp.walletAddress.startsWith("0x")) ? selectedApp.walletAddress : "0x71C3a7F9B1E48574B40B62E3e74dB826500F949A")}&amountETH=${job.budget}`}
              className="px-5 py-3 rounded-xl bg-moss hover:bg-[#BEF264] text-background text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-[#84CC16]/20 flex items-center gap-2"
            >
              <span>Fund & Deploy Escrow Vault</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="bg-surface border border-surface-border rounded-2xl p-8">
        <h3 className="text-xl font-bold text-foreground mb-4 tracking-tight">Project Description</h3>
        <p className="text-muted leading-relaxed font-light whitespace-pre-line">{job.description}</p>
      </div>

      {/* Applications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">Applications</h2>
            <p className="text-xs text-muted">Review proposals, shortlist candidates, and select your freelancer.</p>
          </div>
          <span className="text-xs font-mono text-muted bg-surface border border-surface-border rounded-xl px-3 py-2">
            {applications.length} total
          </span>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            icon={Users}
            title={isDraft ? "Publish to start receiving applications" : "No applications yet"}
            description={
              isDraft
                ? "This job is still a draft. Publish it to make it visible in the marketplace."
                : "Freelancers haven't applied to this job yet. It's live in the marketplace — applications will appear here."
            }
            action={isDraft ? { label: "Publish Job", onClick: handlePublish } : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {applications.map((app) => {
              const canSelect = !selectionMade && (app.status === "SUBMITTED" || app.status === "UNDER_REVIEW");
              const busy = actionId === app.id;
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-surface border border-surface-border hover:border-moss/40 transition-all"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Freelancer info */}
                    <div className="md:w-56 shrink-0 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-background border border-surface-border flex items-center justify-center text-moss font-bold">
                          {(app.freelancer?.name || "F").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-sm">{app.freelancer?.name || "Freelancer"}</div>
                          <div className="text-xs text-muted flex items-center gap-1">
                            <Star className="w-3 h-3 text-[#F59E0B]" />
                            {app.freelancer?.rating?.toFixed(1) ?? "—"} rating
                          </div>
                        </div>
                      </div>
                      {app.freelancer?.bio && <p className="text-[11px] text-muted leading-relaxed">{app.freelancer.bio}</p>}
                      <div className="text-[11px] text-muted font-mono">Applied {formatRelative(app.createdAt)}</div>
                      <div>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider border ${APP_STATUS_STYLES[app.status]}`}>
                          {APPLICATION_STATUS_LABELS[app.status]}
                        </span>
                      </div>
                    </div>

                    {/* Proposal */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{app.pitch}</p>
                      <div className="flex flex-wrap gap-4 text-xs font-mono text-muted border-t border-surface-border pt-3">
                        <span className="font-semibold text-foreground">
                          {formatBudget({ budget: app.requestedRate, tokenSymbol: job.tokenSymbol })}
                          <span className="text-muted font-normal"> proposed</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {app.deliveryDays} {app.deliveryDays === 1 ? "day" : "days"} delivery
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2 md:items-end shrink-0">
                      {canSelect && (
                        <button
                          onClick={() => handleSelect(app)}
                          disabled={busy}
                          className="px-4 py-2.5 rounded-xl bg-moss hover:bg-[#BEF264] text-background text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 disabled:opacity-60"
                        >
                          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                          {busy ? "Selecting…" : "Select"}
                        </button>
                      )}
                      {!selectionMade && app.status !== "REJECTED" && (
                        <>
                          {app.status !== "UNDER_REVIEW" && (
                            <button
                              onClick={() => handleReview(app)}
                              disabled={busy}
                              className="px-4 py-2.5 rounded-xl bg-background border border-surface-border hover:border-[#F59E0B]/50 text-foreground hover:text-[#F59E0B] text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-60"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Review
                            </button>
                          )}
                          <button
                            onClick={() => handleReject(app)}
                            disabled={busy}
                            className="px-4 py-2.5 rounded-xl bg-background border border-surface-border hover:border-[#EF4444]/50 text-foreground hover:text-[#EF4444] text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-60"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                      {selectionMade && app.status === "ACCEPTED" && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-moss">
                          <CheckCircle2 className="w-4 h-4" />
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}