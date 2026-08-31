"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { FolderOpenIcon } from "@heroicons/react/24/outline";
import EmptyState from "@/components/ui/EmptyState";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import FilterBar, { type FilterState, defaultFilters } from "@/components/filters/FilterBar";

import { activeProjects } from "@/lib/mock-data";

export default function ProjectsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isPro, setIsPro] = useState<boolean | null>(null);

  useEffect(() => {
    const storedPro = localStorage.getItem("w3hire_is_pro");
    setIsPro(storedPro === "true");
  }, []);

  const availableTags = useMemo(() => {
    return Array.from(new Set(activeProjects.flatMap(p => p.tags || [])));
  }, []);

  const parseBudget = (budgetStr: string) => {
    return Number(budgetStr.replace(/[^0-9.-]+/g, ""));
  };

  const filteredProjects = useMemo(() => {
    return activeProjects.filter((project) => {
      // Tags match
      if (filters.tags.length > 0) {
        const pTags = project.tags || [];
        const hasAllTags = filters.tags.every(t => pTags.includes(t));
        if (!hasAllTags) return false;
      }

      // Budget match
      const pBudget = parseBudget(project.budget);
      if (filters.budgetMin !== "" && pBudget < filters.budgetMin) return false;
      if (filters.budgetMax !== "" && pBudget > filters.budgetMax) return false;

      // Duration match
      if (filters.duration !== "Any") {
        const weeks = project.durationWeeks || 0;
        if (filters.duration === "Under 1 week" && weeks >= 1) return false;
        if (filters.duration === "1-4 weeks" && (weeks < 1 || weeks > 4)) return false;
        if (filters.duration === "1-3 months" && (weeks <= 4 || weeks > 12)) return false;
        if (filters.duration === "3+ months" && weeks <= 12) return false;
      }

      // Status match
      if (filters.status !== "Any" && project.status !== filters.status) return false;

      return true;
    });
  }, [filters]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "In Progress": return "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20";
      case "Awaiting Escrow Release": return "text-moss bg-moss/10 border-moss/20";
      case "Milestone Review": return "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20";
      case "Completed": return "text-muted bg-[#A3A3A3]/10 border-[#A3A3A3]/20";
      default: return "text-foreground bg-white/5 border-white/10";
    }
  };

  const getStatusDot = (status: string) => {
    switch(status) {
      case "In Progress": return "bg-[#22C55E]";
      case "Awaiting Escrow Release": return "bg-moss animate-pulse";
      case "Milestone Review": return "bg-[#F59E0B]";
      case "Completed": return "bg-[#A3A3A3]";
      default: return "bg-white";
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] as const } }
  };

  if (isPro === null) return null; // Hydration gap

  if (!isPro) {
    return (
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-xl font-extrabold text-foreground tracking-tight mb-2">
            Platform Projects
          </h1>
          <p className="text-xs text-muted">
            Explore ongoing platform projects and manage your own active contracts.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-background p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#84CC16]/5 to-transparent pointer-events-none" />
          <svg className="w-16 h-16 text-moss mb-6 drop-shadow-[0_0_15px_rgba(132,204,22,0.3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">Pro Member Access Only</h3>
          <p className="text-muted max-w-md mx-auto mb-8 text-sm leading-relaxed">
            Viewing and managing active platform projects is an exclusive feature for our verified Pro freelancers. Upgrade your account to unlock this directory.
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
    <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-foreground tracking-tight">
            Platform Projects
          </h1>
          <p className="text-xs text-muted">
            Explore ongoing platform projects and manage your own active contracts.
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
              showStatus={true}
              resultCount={filteredProjects.length}
              totalCount={activeProjects.length}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {filteredProjects.length === 0 ? (
        <EmptyState 
          icon={FolderOpenIcon}
          title="No projects found"
          description="Try adjusting your filters to find more projects."
          action={{
            label: "Clear Filters",
            onClick: () => setFilters(defaultFilters)
          }}
        />
      ) : (
        <motion.div 
          className="grid grid-cols-1 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredProjects.map((project, i) => {
            const numericBudget = parseBudget(project.budget);
            const budgetINR = numericBudget * 83; // approx conversion

            return (
              <Link key={project.id} href={`/projects/${project.id}`} className="block group">
                <motion.div 
                  variants={itemVariants}
                  className="p-6 rounded-2xl bg-surface border border-surface-border hover:border-moss/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 interactive"
                >
                  
                  {/* Left Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold border ${
                        project.status === 'Completed' ? 'bg-[#A3A3A3]/20 text-muted border-[#A3A3A3]/30' :
                        project.status === 'In Progress' ? 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30' :
                        project.status === 'Awaiting Escrow Release' ? 'bg-moss/20 text-moss border-moss/30' :
                        'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30'
                      }`}>
                        {project.status}
                      </span>
                      {project.isMine && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold bg-white/10 text-foreground border border-white/20">
                          My Contract
                        </span>
                      )}
                      <span className="text-[11px] text-muted font-mono">
                        Updated {project.lastUpdated}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground group-hover:text-moss transition-colors duration-300">
                      {project.title}
                    </h3>

                    {project.isMine ? (
                      <div className="text-xs text-muted">
                        Client: <span className="font-medium text-foreground">{project.clientName}</span>
                        {project.nextMilestone && (
                          <span className="ml-2 pl-2 border-l border-surface-border">
                            Next Milestone: <span className="text-foreground">{project.nextMilestone}</span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.tags?.map((tag) => (
                          <span 
                            key={tag} 
                            className="px-2 py-0.5 rounded-md bg-background border border-surface-border text-[11px] font-mono text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Budget & Apply CTA */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-surface-border">
                    <div className="text-left md:text-right">
                      <div className="text-base font-extrabold text-foreground font-mono">
                        {project.budget}
                      </div>
                      {numericBudget > 0 && (
                        <div className="text-xs text-muted font-mono">
                          ≈ ₹{budgetINR.toLocaleString("en-IN")}
                        </div>
                      )}
                    </div>
                    
                    <div className="px-4 py-2.5 rounded-xl bg-background text-foreground border border-surface-border transition-all text-xs font-semibold flex items-center gap-2 shadow-sm group-hover:bg-moss group-hover:text-background group-hover:border-moss">
                      <span>View Details</span>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14m-7-7 7 7-7 7"/>
                      </svg>
                    </div>
                  </div>

                </motion.div>
              </Link>
            );
          })}
        </motion.div>
      )}
    </main>
  );
}
