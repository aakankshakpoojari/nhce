"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckBadgeIcon, ClockIcon, ArrowLeftIcon, DocumentMagnifyingGlassIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { bounties } from "@/lib/mock-data";
import EmptyState from "@/components/ui/EmptyState";
import { motion, type Variants } from "framer-motion";
import { useApplications } from "@/contexts/ApplicationContext";

export default function BountyDetailPage() {
  const { id } = useParams();
  const { applyToBounty, hasApplied } = useApplications();
  const [isProUser, setIsProUser] = useState(false);

  useEffect(() => {
    setIsProUser(localStorage.getItem("w3hire_is_pro") === "true");
  }, []);

  const bounty = bounties.find(b => b.id === id);

  if (!bounty) {
    return (
      <div className="max-w-3xl mx-auto py-20">
        <EmptyState
          icon={DocumentMagnifyingGlassIcon}
          title="Bounty Not Found"
          description="We couldn't find the bounty you're looking for. It may have been removed, filled, or you might have an incorrect link."
          action={{
            label: "Back to Bounties",
            onClick: () => (window.location.href = "/bounties"),
          }}
        />
      </div>
    );
  }


  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] as const }
    }
  };

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-8">
      <motion.div variants={itemVariants} className="mb-6">
        <Link
          href="/bounties"
          className="inline-flex items-center space-x-2 text-muted hover:text-moss transition-colors duration-300 font-mono text-sm"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-surface border border-surface-border rounded-2xl p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight max-w-3xl">
            {bounty.title}
          </h1>
          <div className="text-right shrink-0">
            <div className="text-2xl font-extrabold text-foreground font-mono">
              {bounty.budget}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 border-t border-surface-border pt-6">
          <div className="flex flex-wrap gap-2">
            {bounty.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-background border border-surface-border text-[11px] font-mono text-muted"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold bg-moss/20 text-moss border border-moss/30">
            <CheckBadgeIcon className="h-3 w-3" />
            <span>Escrow Guaranteed</span>
          </div>

          <div className="flex items-center space-x-1 text-xs text-muted font-mono">
            <ClockIcon className="h-4 w-4" />
            <span>Posted {bounty.postedAt}</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-12">
          <div className="prose dark:prose-invert prose-lg max-w-none">
            <h3 className="text-2xl font-bold text-foreground mb-6 tracking-tight">Project Description</h3>
            <p className="text-muted leading-relaxed font-light">
              {bounty.fullDescription}
            </p>
          </div>

          <div className="pt-8 border-t border-surface-border">
            {bounty.proOnly && !isProUser ? (
              <Link
                href="/pro"
                className="w-full md:w-auto px-8 py-4 bg-surface-border/30 text-muted border border-surface-border hover:border-moss/50 hover:text-moss font-bold rounded-full transition-all inline-flex items-center justify-center gap-2 text-lg"
              >
                <LockClosedIcon className="w-5 h-5" />
                Upgrade to Pro to Apply
              </Link>
            ) : hasApplied(bounty.id) ? (
              <div className="inline-flex items-center space-x-2 px-8 py-4 bg-surface-hover text-muted font-bold rounded-full cursor-not-allowed">
                <CheckBadgeIcon className="w-6 h-6 text-moss" />
                <span>Application Submitted</span>
              </div>
            ) : (
              <button
                onClick={() => applyToBounty(bounty.id, bounty.title)}
                className="w-full md:w-auto px-8 py-4 bg-moss hover:bg-[#bef264] text-background font-bold rounded-full transition-colors duration-300 shadow-[0_0_20px_rgba(132,204,22,0.3)] hover:shadow-[0_0_30px_rgba(190,242,100,0.5)] interactive text-lg"
              >
                Apply Now
              </button>
            )}
          </div>
        </motion.div>

        {/* Sidebar Info */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-surface border border-surface-border rounded-2xl p-6">
            <h3 className="text-foreground font-bold text-base mb-6 tracking-tight">Client Info</h3>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-background border border-surface-border rounded-full flex items-center justify-center text-moss font-bold text-lg">
                  {bounty.clientStats?.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-foreground text-sm">{bounty.clientStats?.name}</div>
                  <div className="text-xs text-muted">{bounty.clientStats?.handle}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-surface-border">
                <div>
                  <div className="text-xs font-mono text-muted mb-1 uppercase">Rating</div>
                  <div className="text-foreground font-semibold text-base flex items-center">
                    {bounty.clientStats?.rating} <span className="text-[#F59E0B] ml-1">★</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono text-muted mb-1 uppercase">Total Bounties</div>
                  <div className="text-foreground font-semibold text-base">{bounty.clientStats?.totalBounties}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-surface-border rounded-2xl p-6">
            {bounty.proOnly && !isProUser ? (
              <Link
                href="/pro"
                className="w-full px-6 py-3 bg-surface-border/30 text-muted border border-surface-border hover:border-moss/50 hover:text-moss font-semibold text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 text-center block"
              >
                <LockClosedIcon className="w-4 h-4" />
                Requires Pro
              </Link>
            ) : hasApplied(bounty.id) ? (
              <div className="flex items-center justify-center space-x-2 px-6 py-3 bg-background border border-surface-border text-moss font-semibold text-sm rounded-xl cursor-not-allowed">
                <CheckBadgeIcon className="w-5 h-5" />
                <span>Application Submitted</span>
              </div>
            ) : (
              <button
                onClick={() => applyToBounty(bounty.id, bounty.title)}
                className="w-full px-6 py-3 bg-moss hover:bg-[#BEF264] text-background font-semibold text-sm uppercase tracking-wider rounded-xl transition-all shadow-sm"
              >
                Apply for Project
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}