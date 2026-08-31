"use client";

import Link from "next/link";
import { DocumentDuplicateIcon, FolderOpenIcon } from "@heroicons/react/24/outline";
import EmptyState from "@/components/ui/EmptyState";
import { motion, type Variants } from "framer-motion";

import { activeProjects } from "@/lib/mock-data";

export default function ProjectsPage() {
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
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="mb-16">
        <h1 className="text-6xl font-bold text-[#F5F5F4] mb-6 tracking-tighter">
          Active Contracts
        </h1>
        <p className="text-[#A3A3A3] text-xl font-light">
          Manage your ongoing freelance engagements and escrow milestones.
        </p>
      </div>

      {activeProjects.length === 0 ? (
        <EmptyState 
          icon={FolderOpenIcon}
          title="No active projects yet"
          description="You don't have any ongoing contracts. Head over to the Bounties board to find your next opportunity."
          action={{
            label: "Browse Bounties",
            onClick: () => (window.location.href = "/bounties")
          }}
        />
      ) : (
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {activeProjects.map((project, i) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="block">
              <motion.div 
                variants={itemVariants}
                className={`group relative bg-[#181D1A] border border-white/5 hover:border-white/10 rounded-[2rem] p-10 cursor-pointer transition-all duration-700 ease-[var(--ease-fluid)] hover:-translate-y-2 hover:shadow-2xl interactive ${i % 2 !== 0 ? 'lg:translate-y-12' : ''}`}
              >
                <div className="flex justify-between items-start mb-12">
                  <div className="space-y-3 pr-8">
                    <h3 className="text-3xl font-bold text-[#F5F5F4] group-hover:text-[#F5F5F4]/80 transition-colors tracking-tight line-clamp-2">
                      {project.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-[#A3A3A3] text-sm">
                      <span>Client:</span>
                      <span className="font-medium text-[#F5F5F4]">{project.clientName}</span>
                    </div>
                  </div>
                  
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border shrink-0 ${getStatusColor(project.status)}`}>
                    <span className={`w-2 h-2 rounded-full ${getStatusDot(project.status)}`}></span>
                    <span className="text-xs font-bold tracking-wider uppercase">
                      {project.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-end border-t border-white/5 pt-8">
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider">Next Milestone</div>
                    <div className="text-lg text-[#F5F5F4]">{project.nextMilestone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#22C55E] tracking-tight">{project.budget}</div>
                    <div className="text-xs text-[#A3A3A3] mt-1">Updated {project.lastUpdated}</div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  );
}
