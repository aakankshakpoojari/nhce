"use client";

import { motion } from "framer-motion";
import { Loader2, AlertCircle, ArrowRight, CalendarDays, Clock, Send } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchMyApplications,
  getAuthToken,
  JobApplication,
  ApplicationStatus,
  APPLICATION_STATUS_LABELS,
  formatBudget,
  formatDate,
  formatRelative,
} from "@/lib/api";
import { useApiFetch } from "@/hooks/useApiFetch";

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  SUBMITTED: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
  UNDER_REVIEW: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
  ACCEPTED: "bg-moss/10 text-moss border-moss/30",
  REJECTED: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30",
};

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const { data, isLoading, error, reload: load } = useApiFetch<JobApplication[] | null>(
    async () => {
      const token = getAuthToken();
      if (!token) return null;
      const response = await fetchMyApplications(token);
      return response.applications || [];
    },
    [authLoading]
  );
  const applications = data ?? [];

  return (
    <main className="flex-1 w-full mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-col items-start mb-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">My Applications</h1>
        <p className="text-muted text-sm">Track the status of your submitted applications.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-moss" />
          <p className="text-sm font-mono">Loading applications…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 bg-surface border border-[#EF4444]/30 rounded-2xl space-y-4 px-6 text-center">
          <AlertCircle className="w-10 h-10 text-[#EF4444]" />
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">Could not load your applications</h3>
            <p className="text-sm text-muted">{error}</p>
          </div>
          <button
            onClick={load}
            className="px-5 py-2.5 rounded-xl bg-moss hover:bg-[#BEF264] text-background font-semibold text-xs uppercase tracking-wider transition"
          >
            Try Again
          </button>
        </div>
      ) : !user ? (
        <EmptyState
          icon={AlertCircle}
          title="Sign in to view your applications"
          description="Log in with your freelancer account to track the proposals you've submitted."
          action={{ label: "Go to Marketplace", onClick: () => router.push("/bounties") }}
        />
      ) : applications.length > 0 ? (
        <motion.div
          className="space-y-6"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {applications.map((app) => {
            const isAccepted = app.status === "ACCEPTED";
            const isVaultFunded = app.job?.escrowAddress || app.job?.status === "IN_PROGRESS";

            return (
              <motion.div
                key={app.id}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } } }}
              >
                <div
                  onClick={() => {
                    if (isAccepted && isVaultFunded) {
                      router.push(`/projects/${app.jobId}`);
                    } else {
                      router.push(`/bounties/${app.jobId}`);
                    }
                  }}
                  className="bg-surface border border-surface-border hover:border-moss/50 rounded-2xl p-6 transition-all cursor-pointer group hover:shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left: Job info + proposal */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider border ${STATUS_STYLES[app.status]}`}>
                          {APPLICATION_STATUS_LABELS[app.status]}
                        </span>

                        {isAccepted && !isVaultFunded && (
                          <span className="px-3 py-1 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
                            Awaiting Client Vault Funding
                          </span>
                        )}

                        {isAccepted && isVaultFunded && (
                          <span className="px-3 py-1 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-moss/20 text-moss border border-moss/40 animate-pulse">
                            Vault Funded · Active Project
                          </span>
                        )}

                        <span className="text-[11px] text-muted font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Applied {formatRelative(app.createdAt)} · {formatDate(app.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-foreground group-hover:text-moss transition-colors">
                          {app.job?.title || "Job Application"}
                        </h2>
                        <ArrowRight className="w-4 h-4 text-muted group-hover:text-moss group-hover:translate-x-1 transition-all" />
                      </div>

                      <p className="text-xs text-muted line-clamp-3 max-w-2xl">{app.pitch}</p>

                      <div className="flex flex-wrap gap-4 pt-1 text-xs font-mono text-muted">
                        <span className="flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 text-moss" />
                          {formatBudget({ budget: app.requestedRate, tokenSymbol: app.job?.tokenSymbol || "" })} proposed
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-moss" />
                          {app.deliveryDays} delivery {app.deliveryDays === 1 ? "day" : "days"}
                        </span>
                      </div>
                    </div>

                    {/* Right: Job budget & Open action */}
                    {app.job && (
                      <div className="text-left md:text-right shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-surface-border flex flex-col justify-between items-start md:items-end gap-3">
                        <div>
                          <div className="text-xs font-mono text-muted uppercase">Job Budget</div>
                          <div className="text-lg font-extrabold font-mono text-foreground">{formatBudget(app.job)}</div>
                          <div className="text-[11px] text-muted font-mono mt-0.5">
                            {app.job.client?.name || "Client"} · {app.job._count?.applications ?? 0} applicants
                          </div>
                        </div>
                        {isAccepted && isVaultFunded ? (
                          <span className="px-3.5 py-1.5 rounded-xl bg-moss text-background font-semibold text-xs transition-colors flex items-center gap-1">
                            Go to Active Workspace <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="px-3.5 py-1.5 rounded-xl bg-moss/10 group-hover:bg-moss group-hover:text-background text-moss font-semibold text-xs transition-colors flex items-center gap-1">
                            Open Job <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <EmptyState
          icon={Send}
          title="No applications yet"
          description="You haven't applied to any jobs yet. Head to the marketplace to find your next project."
          action={{ label: "Browse Marketplace", onClick: () => router.push("/bounties") }}
        />
      )}
    </main>
  );
}