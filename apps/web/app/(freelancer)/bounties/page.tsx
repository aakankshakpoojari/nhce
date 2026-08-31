"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BountyCard from "@/components/BountyCard";
import SuperFeed from "@/components/SuperFeed";
import EmptyState from "@/components/ui/EmptyState";
import { bounties } from "@/lib/mock-data";
import FilterBar, { type FilterState, defaultFilters } from "@/components/filters/FilterBar";

export default function BountiesPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

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
    <div className="flex flex-col lg:flex-row gap-12 max-w-[1600px] mx-auto w-full">
      {/* Main Feed (62%) - Asymmetric split */}
      <div className="flex-grow lg:w-[62%] space-y-8 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold tracking-tighter text-[#F5F5F4] mb-4">
              Marketplace
            </h1>
            
            <p className="text-[#A3A3A3] text-xl font-light">
              Discover and claim high-value Web3 tasks.
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
            <button className="px-6 py-2.5 bg-[#181D1A] border border-white/10 rounded-full text-sm font-medium hover:bg-[#84CC16]/10 hover:border-[#84CC16]/50 transition-all duration-500 interactive">
              Sort by: Latest
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
            className="grid gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {filteredBounties.map((bounty) => (
              <motion.div key={bounty.id} variants={itemVariants}>
                <BountyCard {...bounty} />
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
      </div>

      {/* Super Feed Sidebar (38%) */}
      <div className="lg:w-[38%] min-w-[320px] hidden lg:block">
        <div className="sticky top-32">
          <SuperFeed />
        </div>
      </div>
    </div>
  );
}
