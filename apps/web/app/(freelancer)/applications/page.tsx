"use client";

import { motion } from "framer-motion";
import EmptyState from "@/components/ui/EmptyState";
import { useApplications } from "@/contexts/ApplicationContext";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ApplicationsPage() {
  const { applications } = useApplications();
  const router = useRouter();
  const [isPro, setIsPro] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedPro = localStorage.getItem("w3hire_is_pro");
    if (storedPro === "true") {
      setIsPro(true);
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] as const } }
  };

  if (!isClient) return null;

  if (!isPro) {
    return (
      <main className="flex-1 w-full mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col items-start mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
            My Applications
          </h1>
          <p className="text-xs text-muted">
            Track the status of your submitted applications.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-background p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#84CC16]/5 to-transparent pointer-events-none" />
          <svg className="w-16 h-16 text-moss mb-6 drop-shadow-[0_0_15px_rgba(132,204,22,0.3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">Pro Member Access Only</h3>
          <p className="text-muted max-w-md mx-auto mb-8 text-sm leading-relaxed">
            Unlimited applications and priority tracking is an exclusive feature for our verified Pro freelancers. Upgrade your account to unlock this directory.
          </p>
          <Link href="/pro" className="inline-flex items-center px-6 py-3 rounded-xl bg-moss hover:bg-[#65A30D] text-background font-bold text-sm transition-all shadow-[0_0_20px_rgba(132,204,22,0.2)] hover:shadow-[0_0_25px_rgba(132,204,22,0.4)]">
            Upgrade to Pro
            <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14m-7-7 7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-col items-start mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
          My Applications
        </h1>
        <p className="text-muted text-sm">
          Track the status of your submitted applications.
        </p>
      </div>

      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {applications.length > 0 ? applications.map(app => (
          <motion.div key={app.id} variants={itemVariants}>
            <Link href={`/bounties/${app.bountyId}`} className="block group">
              <div className="bg-surface border border-surface-border hover:border-moss/50 rounded-2xl p-6 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-moss transition-colors mb-1">{app.bountyTitle}</h3>
                    <p className="text-xs font-mono text-muted">Applied: {app.appliedAt}</p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                      app.status === "Accepted" ? "bg-moss/10 text-moss border-moss/30" :
                      app.status === "Pending Review" ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30" :
                      "bg-background text-muted border-surface-border"
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )) : (
          <EmptyState 
            title="No applications yet" 
            description="You haven't applied to any bounties. Head back to the marketplace to get started."
            action={{ label: "Browse Marketplace", onClick: () => router.push("/bounties") }}
          />
        )}
      </motion.div>
    </main>
  );
}
