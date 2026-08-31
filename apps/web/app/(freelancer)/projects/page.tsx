"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FolderOpenIcon } from "@heroicons/react/24/outline";
import EmptyState from "@/components/ui/EmptyState";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import FilterBar, { type FilterState, defaultFilters } from "@/components/filters/FilterBar";

import { activeProjects } from "@/lib/mock-data";

export default function ProjectsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

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
      case "Awaiting Escrow Release": return "text-[#84CC16] bg-[#84CC16]/10 border-[#84CC16]/20";
      case "Milestone Review": return "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20";
      case "Completed": return "text-[#A3A3A3] bg-[#A3A3A3]/10 border-[#A3A3A3]/20";
      default: return "text-[#F5F5F4] bg-white/5 border-white/10";
    }
  };

  const getStatusDot = (status: string) => {
    switch(status) {
      case "In Progress": return "bg-[#22C55E]";
      case "Awaiting Escrow Release": return "bg-[#84CC16] animate-pulse";
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

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <h1 className="text-6xl font-bold text-[#F5F5F4] mb-6 tracking-tighter">
            Platform Projects
          </h1>
          <p className="text-[#A3A3A3] text-xl font-light">
            Explore ongoing platform projects and manage your own active contracts.
          </p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-2.5 border rounded-full text-sm font-medium transition-all duration-500 interactive ${
              showFilters || JSON.stringify(filters) !== JSON.stringify(defaultFilters)
                ? "bg-[#84CC16]/20 border-[#84CC16]/50 text-[#BEF264]" 
                : "bg-[#181D1A] border-white/10 text-white hover:bg-[#84CC16]/10 hover:border-[#84CC16]/50"
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
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredProjects.map((project, i) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="block">
              <motion.div 
                variants={itemVariants}
              className={`group relative bg-[#181D1A] border border-white/5 hover:border-white/10 rounded-[2rem] p-10 cursor-pointer transition-all duration-700 ease-[var(--ease-fluid)] hover:-translate-y-2 hover:shadow-2xl interactive flex flex-col h-full ${i % 2 !== 0 ? 'lg:translate-y-12' : ''}`}
            >
              <div className="flex justify-between items-start mb-12">
                <div className="space-y-4 pr-8">
                  <h3 className="text-3xl font-bold text-[#F5F5F4] group-hover:text-[#F5F5F4]/80 transition-colors tracking-tight line-clamp-2">
                    {project.title}
                  </h3>
                  {project.isMine ? (
                    <div className="flex items-center space-x-2 text-[#A3A3A3] text-sm">
                      <span>Client:</span>
                      <span className="font-medium text-[#F5F5F4]">{project.clientName}</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {project.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-[#A3A3A3]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="text-right flex-shrink-0">
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium ${
                    project.status === 'Completed' ? 'bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]' :
                    project.status === 'In Progress' ? 'bg-[#84CC16]/10 border-[#84CC16]/20 text-[#84CC16]' :
                    'bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    <span>{project.status}</span>
                  </div>
                </div>
              </div>

              {project.isMine ? (
                <div className="flex justify-between items-end border-t border-white/5 pt-8 mt-auto">
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider">Next Milestone</div>
                    <div className="text-lg text-[#F5F5F4]">{project.nextMilestone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#22C55E] tracking-tight">{project.budget}</div>
                    <div className="text-xs text-[#A3A3A3] mt-1">Updated {project.lastUpdated}</div>
                  </div>
                </div>
              ) : (
                <div className="border-t border-white/5 pt-6 mt-auto">
                  <p className="text-[#A3A3A3] text-sm line-clamp-2 leading-relaxed">
                    {project.description || "A platform project currently in progress."}
                  </p>
                  <div className="text-xs text-[#A3A3A3] mt-4 text-right">Updated {project.lastUpdated}</div>
                </div>
              )}
            </motion.div>
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  );
}
