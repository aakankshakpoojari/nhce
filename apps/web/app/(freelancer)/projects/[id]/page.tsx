"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeftIcon, 
  FolderOpenIcon, 
  CheckCircleIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { activeProjects } from "@/lib/mock-data";
import EmptyState from "@/components/ui/EmptyState";
import { motion } from "framer-motion";

export default function ProjectDetailPage() {
  const { id } = useParams();

  // Find the project
  const project = activeProjects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="max-w-3xl mx-auto py-20">
        <EmptyState 
          icon={FolderOpenIcon}
          title="Project Not Found"
          description="We couldn't find the contract you're looking for. It may have been completed or closed."
          action={{
            label: "Back to Contracts",
            onClick: () => window.location.href = "/projects"
          }}
        />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } }
  };

  return (
    <motion.div 
      className="max-w-[1000px] mx-auto w-full pb-32"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="mb-12">
        <Link 
          href="/projects" 
          className="inline-flex items-center space-x-2 text-[var(--color-muted)] hover:text-[#BEF264] transition-colors duration-300 group font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Contracts</span>
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <div className="text-[#84CC16] font-medium text-sm tracking-widest uppercase mb-3 flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#84CC16] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#84CC16]"></span>
              </span>
              <span>{project.status}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-[#F5F5F4] tracking-tighter leading-tight max-w-3xl">
              {project.title}
            </h1>
          </div>
          <div className="text-4xl md:text-5xl font-bold text-[#F5F5F4] tracking-tight shrink-0">
            {project.budget}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center space-x-2 text-sm text-[#A3A3A3]">
            <ClockIcon className="h-5 w-5" />
            <span>Started {project.startedAt}</span>
          </div>
          <div className="h-6 w-px bg-white/10 hidden md:block"></div>
          <div className="flex items-center space-x-2 text-sm font-medium text-[#F5F5F4]">
            Client: {project.client}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content: Milestones */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-12">
          <div className="bg-[#181D1A] border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
             {/* Subtle noise */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-[#F5F5F4] mb-8 tracking-tight flex items-center justify-between">
                Escrow Milestones
                <span className="text-[#A3A3A3] text-sm font-normal bg-white/5 px-3 py-1 rounded-full">
                  Total: {project.budget}
                </span>
              </h3>
              
              <div className="space-y-6">
                {project.milestones?.map((milestone, idx) => (
                  <div key={milestone.id} className="relative pl-8 border-l-2 border-white/10 last:border-transparent pb-6 last:pb-0">
                    {/* Timeline Node */}
                    <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-[#181D1A] ${
                      milestone.status === 'Completed' ? 'bg-[#84CC16]' : 
                      milestone.status === 'In Progress' ? 'bg-[#F59E0B]' : 'bg-white/20'
                    }`}></div>
                    
                    <div className="bg-[#101312] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors interactive">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-lg text-[#F5F5F4]">
                          {milestone.title}
                        </div>
                        <div className="font-bold text-[#22C55E]">
                          {milestone.amount}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end mt-4">
                        <div className={`text-xs font-semibold uppercase tracking-wider ${
                          milestone.status === 'Completed' ? 'text-[#84CC16]' : 
                          milestone.status === 'In Progress' ? 'text-[#F59E0B]' : 'text-[#A3A3A3]'
                        }`}>
                          {milestone.status}
                        </div>
                        {milestone.status === 'In Progress' && (
                          <button className="text-xs font-semibold text-[#101312] bg-[#BEF264] px-4 py-2 rounded-full hover:bg-[#84CC16] transition-colors interactive">
                            Submit Work
                          </button>
                        )}
                        {milestone.status === 'Completed' && (
                          <div className="flex items-center space-x-1 text-[#84CC16]">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span className="text-xs">Funds Released</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar Info */}
        <motion.div variants={itemVariants} className="space-y-8">
          <div className="bg-[#181D1A] border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
            <h3 className="text-[#F5F5F4] font-bold text-xl mb-6 tracking-tight relative z-10">Smart Contract</h3>
            
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <div className="text-sm text-[#A3A3A3]">Contract Address</div>
                <div className="font-mono text-sm text-[#BEF264] break-all bg-[#101312] p-3 rounded-xl border border-white/5">
                  0x71C...892A
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-[#A3A3A3]">Network</div>
                <div className="text-[#F5F5F4] font-medium flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#84CC16]"></div>
                  <span>Base Mainnet</span>
                </div>
              </div>
              <div className="pt-6 border-t border-white/5">
                <a href="#" className="text-sm font-semibold text-[#84CC16] hover:text-[#BEF264] transition-colors flex items-center justify-between group/link">
                  View on Block Explorer
                  <ArrowLeftIcon className="w-4 h-4 rotate-135 group-hover/link:rotate-[135deg] group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
