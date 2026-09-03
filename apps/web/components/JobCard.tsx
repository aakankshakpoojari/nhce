"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Users } from "lucide-react";
import { Job, formatBudget, daysUntil, formatRelative, JOB_STATUS_LABELS, JobStatus } from "@/lib/api";

function StatusPill({ status }: { status: JobStatus }) {
  const styles: Record<string, string> = {
    PUBLISHED: "bg-moss/20 text-moss border border-moss/30",
    OPEN: "bg-moss/20 text-moss border border-moss/30",
    DRAFT: "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30",
    FREELANCER_SELECTED: "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30",
    IN_PROGRESS: "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30",
    COMPLETED: "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30",
    DISPUTED: "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30",
    CANCELLED: "bg-background text-muted border border-surface-border",
  };
  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold ${styles[status] || styles.CANCELLED}`}>
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}

export default function JobCard({ job }: { job: Job }) {
  const due = daysUntil(job.deadline);
  const applications = job._count?.applications ?? 0;

  return (
    <Link href={`/bounties/${job.id}`} className="block group">
      <div className="p-6 rounded-2xl bg-surface border border-surface-border hover:border-moss/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 interactive">
        {/* Left Info */}
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusPill status={job.status} />
            <span className="text-[11px] text-muted font-mono">
              Posted {formatRelative(job.createdAt)} by {job.client?.name || job.client?.email?.split("@")[0] || "Client"}
            </span>
          </div>

          <h3 className="text-base font-bold text-foreground group-hover:text-moss transition-colors duration-300 truncate">
            {job.title}
          </h3>

          <p className="text-xs text-muted line-clamp-2 max-w-xl">{job.description}</p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {job.skills.slice(0, 8).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-md bg-background border border-surface-border text-[11px] font-mono text-muted"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Budget, Deadline, Applications & CTA */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-surface-border shrink-0">
          <div className="text-left md:text-right space-y-1">
            <div className="text-base font-extrabold font-mono text-foreground">
              {formatBudget(job)}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted font-mono md:justify-end">
              {due !== null && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {due <= 0 ? "Due now" : `Due in ${due} days`}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {applications} {applications === 1 ? "application" : "applications"}
              </span>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-background text-foreground border border-surface-border transition-all text-xs font-semibold flex items-center gap-2 shadow-sm group-hover:bg-moss group-hover:text-background group-hover:border-moss">
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export { StatusPill };