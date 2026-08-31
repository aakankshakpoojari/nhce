"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import BountyCard from "@/components/BountyCard";
import EmptyState from "@/components/ui/EmptyState";
import { bounties } from "@/lib/mock-data";
import FilterBar, { type FilterState, defaultFilters } from "@/components/filters/FilterBar";

export default function BountiesPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isPro, setIsPro] = useState(false);

  const recentEarners = [
    { name: "0xSam...", amount: "$4,500", project: "DeFi Auditing" },
    { name: "Elena R.", amount: "$2,100", project: "Frontend UI" },
    { name: "Aakash", amount: "$8,500", project: "Solana Contract" }
  ];

  const recentActivity = [
    { action: "New Bounty Posted", title: "ZK Proof Circuits", time: "5m ago" },
    { action: "Escrow Funded", title: "Smart Contract Audit", time: "1h ago" },
    { action: "Freelancer Hired", title: "Rust Developer", time: "2h ago" }
  ];

  useEffect(() => {
    setIsPro(localStorage.getItem("w3hire_is_pro") === "true");
  }, []);

  const availableTags = useMemo(() => {
    return Array.from(new Set(bounties.flatMap(b => b.tags)));
  }, []);

  const parseBudget = (budgetStr: string) => {
    return Number(budgetStr.replace(/[^0-9.-]+/g, ""));
  };

  const filteredBounties = useMemo(() => {
    return bounties.filter((bounty) => {
      // Tags match (must have ALL selected tags)
      if (filters.tags.length > 0) {
        const hasAllTags = filters.tags.every(t => bounty.tags.includes(t));
        if (!hasAllTags) return false;
      }

      // Budget match
      const bountyBudget = parseBudget(bounty.budget);
      if (filters.budgetMin !== "" && bountyBudget < filters.budgetMin) return false;
      if (filters.budgetMax !== "" && bountyBudget > filters.budgetMax) return false;

      // Duration match
      if (filters.duration !== "Any") {
        const weeks = bounty.durationWeeks || 0;
        if (filters.duration === "Under 1 week" && weeks >= 1) return false;
        if (filters.duration === "1-4 weeks" && (weeks < 1 || weeks > 4)) return false;
        if (filters.duration === "1-3 months" && (weeks <= 4 || weeks > 12)) return false;
        if (filters.duration === "3+ months" && weeks <= 12) return false;
      }

      return true;
    });
  }, [filters]);

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

  return (
    <main className="flex-1 w-full mx-auto px-6 py-8 space-y-8">
      {/* Stats Banner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-surface border border-surface-border flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-muted uppercase">Available Bounties</span>
            <div className="text-2xl font-black text-foreground font-mono">
              {bounties.length}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-surface-border text-xs text-muted">
            Across various tech stacks
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-surface-border flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-muted uppercase">Total Value Locked</span>
            <div className="text-2xl font-black text-foreground font-mono">
              $145,000+
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-surface-border text-xs text-[#22C55E]">
            100% Non-Custodial
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-surface-border flex flex-col justify-between">
          <div className="space-y-1">
            <span className={`text-xs font-mono uppercase ${isPro ? "text-moss" : "text-muted"}`}>Freelancer Tier</span>
            <div className="text-lg font-bold text-foreground">
              {isPro ? "Pro Member" : "Standard Member"}
            </div>
          </div>
          <Link href="/pro" className="mt-4 py-2.5 px-4 rounded-xl bg-moss hover:bg-[#BEF264] text-background font-semibold text-xs uppercase tracking-wider transition text-center block w-full">
            {isPro ? "View Benefits" : "Upgrade to Pro"}
          </Link>
        </div>
      </section>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-4">
        {/* Main Feed */}
        <section className="lg:col-span-3 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">
              Marketplace
            </h1>
            <p className="text-xs text-muted">
              Discover and claim high-value Web3 tasks.
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                showFilters || JSON.stringify(filters) !== JSON.stringify(defaultFilters)
                  ? "bg-moss/20 border-moss/50 text-[#BEF264]" 
                  : "bg-surface border-surface-border text-foreground hover:bg-moss/10 hover:border-moss/50 hover:text-moss"
              }`}
            >
              Filter {JSON.stringify(filters) !== JSON.stringify(defaultFilters) && " (Active)"}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <FilterBar 
                availableTags={availableTags}
                filters={filters}
                onChange={setFilters}
                resultCount={filteredBounties.length}
                totalCount={bounties.length}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {filteredBounties.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {filteredBounties.map((bounty) => (
              <motion.div key={bounty.id} variants={itemVariants}>
                <BountyCard {...bounty} isProUser={isPro} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState 
            title="No bounties found" 
            description="Try adjusting your filters to find more opportunities."
            action={{ label: "Clear Filters", onClick: () => setFilters(defaultFilters) }}
          />
        )}
        </section>

        {/* Right Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Recent Earners */}
          <div className="bg-surface border border-surface-border rounded-2xl p-6 overflow-hidden flex flex-col h-[250px]">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono mb-4 shrink-0">Top Earners Today</h3>
            <div className="flex-1 overflow-hidden relative group">
              {/* Fade masks */}
              <div className="absolute top-0 left-0 right-0 h-8 z-10 pointer-events-none" style={{ background: "linear-gradient(to bottom, var(--bg-surface) 0%, var(--bg-surface-transparent) 100%)" }}></div>
              <div className="absolute bottom-0 left-0 right-0 h-8 z-10 pointer-events-none" style={{ background: "linear-gradient(to top, var(--bg-surface) 0%, var(--bg-surface-transparent) 100%)" }}></div>
              
              <motion.div 
                className="space-y-4"
                animate={{ y: [0, -150] }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear", repeatType: "loop" }}
              >
                {/* Double the list for seamless loop */}
                {[...recentEarners, ...recentEarners].map((earner, i) => (
                  <div key={i} className="flex justify-between items-center pb-4 border-b border-surface-border">
                    <div>
                      <div className="text-xs text-foreground font-bold">{earner.name}</div>
                      <div className="text-[10px] text-muted font-mono">{earner.project}</div>
                    </div>
                    <div className="text-xs font-mono font-bold text-moss">
                      {earner.amount}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-surface border border-surface-border rounded-2xl p-6 overflow-hidden flex flex-col h-[300px]">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono mb-4 shrink-0">Live Activity</h3>
            <div className="flex-1 overflow-hidden relative group">
              {/* Fade masks */}
              <div className="absolute top-0 left-0 right-0 h-8 z-10 pointer-events-none" style={{ background: "linear-gradient(to bottom, var(--bg-surface) 0%, var(--bg-surface-transparent) 100%)" }}></div>
              <div className="absolute bottom-0 left-0 right-0 h-8 z-10 pointer-events-none" style={{ background: "linear-gradient(to top, var(--bg-surface) 0%, var(--bg-surface-transparent) 100%)" }}></div>

              <motion.div 
                className="space-y-4"
                animate={{ y: [0, -180] }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear", repeatType: "loop" }}
              >
                {/* Double the list for seamless loop */}
                {[...recentActivity, ...recentActivity].map((activity, i) => (
                  <div key={i} className="flex gap-3 relative pb-4 border-b border-surface-border">
                    <div className="mt-1 h-2 w-2 rounded-full bg-moss shadow-[0_0_6px_rgba(132,204,22,0.8)] shrink-0"></div>
                    <div>
                      <div className="text-[11px] font-mono text-foreground uppercase mb-0.5">{activity.action}</div>
                      <div className="text-xs text-muted">{activity.title}</div>
                      <div className="text-[10px] text-muted/60 mt-1">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

