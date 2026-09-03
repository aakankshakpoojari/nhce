"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Loader2, AlertCircle, Users, Pencil, Send, CalendarDays, Eye, Briefcase } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchMyJobs,
  publishJob,
  getAuthToken,
  Job,
  JobStatus,
  JOB_STATUS_LABELS,
  formatBudget,
  formatDate,
  formatRelative,
  daysUntil,
} from "@/lib/api";
import { useApiFetch, apiErrorMessage } from "@/hooks/useApiFetch";

const STATUS_STYLES: Record<JobStatus, string> = {
  DRAFT: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
  PUBLISHED: "bg-moss/10 text-moss border-moss/30",
  FREELANCER_SELECTED: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30",
  OPEN: "bg-moss/10 text-moss border-moss/30",
  IN_PROGRESS: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30",
  COMPLETED: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30",
  DISPUTED: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30",
  CANCELLED: "bg-background text-muted border-surface-border",
};

export default function ClientJobsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const { data, isLoading, error, reload: load } = useApiFetch<Job[] | null>(
    async () => {
      const token = getAuthToken();
      if (!token) return null;
      const response = await fetchMyJobs(token);
      return response.jobs || [];
    },
    [authLoading]
  );
  const jobs = data ?? [];

  const handlePublish = async (jobId: string) => {
    setPublishingId(jobId);
    setPublishError(null);
    try {
      const token = getAuthToken();
      if (!token) return;
      await publishJob(token, jobId);
      load();
    } catch (e) {
      setPublishError(apiErrorMessage(e));
    } finally {
      setPublishingId(null);
    }
  };

  const notAuthorized = !authLoading && !user;
  const notClient = user && user.role !== "CLIENT";

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">My Jobs</h1>
          <p className="text-muted text-sm">Create, publish, and manage your job postings and applications.</p>
        </div>
        <Link
          href="/client/jobs/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-moss hover:bg-[#BEF264] text-background font-semibold text-xs uppercase tracking-wider transition shadow-md shadow-[#84CC16]/20"
        >
          <Plus className="w-4 h-4" />
          Create Job
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-moss" />
          <p className="text-sm font-mono">Loading your jobs…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 bg-surface border border-[#EF4444]/30 rounded-2xl space-y-4 px-6 text-center">
          <AlertCircle className="w-10 h-10 text-[#EF4444]" />
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">Could not load your jobs</h3>
            <p className="text-sm text-muted">{error}</p>
          </div>
          <button
            onClick={load}
            className="px-5 py-2.5 rounded-xl bg-moss hover:bg-[#BEF264] text-background font-semibold text-xs uppercase tracking-wider transition"
          >
            Try Again
          </button>
        </div>
      ) : notAuthorized ? (
        <EmptyState
          icon={AlertCircle}
          title="Sign in to view your jobs"
          description="Log in with your client account to manage your job postings."
          action={{ label: "Go to Marketplace", onClick: () => router.push("/bounties") }}
        />
      ) : notClient ? (
        <EmptyState
          icon={Briefcase}
          title="Clients only"
          description="Only client accounts can post and manage jobs. Freelancers can browse jobs and apply in the marketplace."
          action={{ label: "Browse Marketplace", onClick: () => router.push("/bounties") }}
        />
      ) : jobs.length > 0 ? (
        <>
          {publishError && (
            <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444]">{publishError}</div>
          )}
          <motion.div
            className="grid grid-cols-1 gap-4"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          >
            {jobs.map((job) => {
              const due = daysUntil(job.deadline);
              const count = job._count?.applications ?? 0;
              const isDraft = job.status === "DRAFT";
              const isEditable = job.status === "DRAFT" || job.status === "PUBLISHED";
              return (
                <motion.div
                  key={job.id}
                  variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] } } }}
                  className="p-6 rounded-2xl bg-surface border border-surface-border hover:border-moss/50 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Left */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold border ${STATUS_STYLES[job.status]}`}>
                          {JOB_STATUS_LABELS[job.status]}
                        </span>
                        <span className="text-[11px] text-muted font-mono">Created {formatRelative(job.createdAt)} · {formatDate(job.createdAt)}</span>
                      </div>
                      <h3 className="text-base font-bold text-foreground">{job.title}</h3>
                      <p className="text-xs text-muted line-clamp-2 max-w-xl">{job.description}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.skills.slice(0, 6).map((skill) => (
                          <span key={skill} className="px-2 py-0.5 rounded-md bg-background border border-surface-border text-[11px] font-mono text-muted">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: budget + deadline + actions */}
                    <div className="flex flex-col md:flex-row lg:flex-col items-start lg:items-end gap-4 shrink-0">
                      <div className="text-left lg:text-right">
                        <div className="text-lg font-extrabold font-mono text-foreground">{formatBudget(job)}</div>
                        {due !== null && (
                          <div className="text-[11px] text-muted font-mono flex items-center gap-1 lg:justify-end mt-0.5">
                            <CalendarDays className="w-3 h-3" />
                            {due <= 0 ? "Deadline passed" : `Due in ${due} days`}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/client/jobs/${job.id}`}
                          className="px-3.5 py-2 rounded-xl bg-background border border-surface-border hover:border-moss/50 text-foreground hover:text-moss text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Link>
                        {isEditable && (
                          <Link
                            href={`/client/jobs/${job.id}/edit`}
                            className="px-3.5 py-2 rounded-xl bg-background border border-surface-border hover:border-moss/50 text-foreground hover:text-moss text-xs font-semibold transition flex items-center gap-1.5"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            {isDraft ? "Edit Draft" : "Edit"}
                          </Link>
                        )}
                        {isDraft && (
                          <button
                            onClick={() => handlePublish(job.id)}
                            disabled={publishingId === job.id}
                            className="px-3.5 py-2 rounded-xl bg-moss hover:bg-[#BEF264] text-background text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-60"
                          >
                            {publishingId === job.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            {publishingId === job.id ? "Publishing…" : "Publish"}
                          </button>
                        )}
                        <Link
                          href={`/client/jobs/${job.id}`}
                          className="px-3.5 py-2 rounded-xl bg-background border border-surface-border hover:border-moss/50 text-foreground hover:text-moss text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          <Users className="w-3.5 h-3.5" />
                          {count} {count === 1 ? "Applicant" : "Applicants"}
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          description="Create your first job posting — save it as a draft or publish it straight to the marketplace."
          action={{ label: "Create a Job", onClick: () => router.push("/client/jobs/new") }}
        />
      )}
    </main>
  );
}