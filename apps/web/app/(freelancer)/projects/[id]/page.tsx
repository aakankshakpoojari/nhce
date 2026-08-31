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
import { motion, type Variants } from "framer-motion";

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
            onClick: () => (window.location.href = "/projects")
          }}
        />
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] as const } }
  };

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-8">
      <motion.div variants={itemVariants} className="mb-6">
        <Link 
          href="/projects" 
          className="inline-flex items-center space-x-2 text-muted hover:text-moss transition-colors duration-300 font-mono text-sm"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Contracts</span>
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-surface border border-surface-border rounded-2xl p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
          <div>
            <div className="text-moss font-mono text-[10px] uppercase font-semibold mb-3 flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-moss opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-moss"></span>
              </span>
              <span>{project.status}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight max-w-3xl">
              {project.title}
            </h1>
          </div>
          {project.isMine && (
            <div className="text-right shrink-0">
              <div className="text-2xl font-extrabold text-foreground font-mono">
                {project.budget}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-6 border-t border-surface-border pt-6">
          <div className="flex items-center space-x-2 text-xs font-mono text-muted">
            <ClockIcon className="h-4 w-4" />
            <span>Updated {project.lastUpdated}</span>
          </div>
          {project.isMine && (
            <>
              <div className="h-4 w-px bg-surface-border hidden md:block"></div>
              <div className="flex items-center space-x-2 text-xs font-mono text-foreground">
                <span className="text-muted">Client:</span>
                <span>{project.clientName}</span>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {project.isMine ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content: Milestones */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-surface-border rounded-2xl p-8 relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-base font-bold text-foreground mb-8 tracking-tight flex items-center justify-between">
                  Escrow Milestones
                  <span className="text-muted text-xs font-mono font-normal bg-background border border-surface-border px-3 py-1 rounded-full">
                    Total: {project.budget}
                  </span>
                </h3>
                
                <div className="space-y-6">
                  {project.milestones?.map((milestone, idx) => (
                    <div key={milestone.id} className="relative pl-8 border-l-2 border-surface-border last:border-transparent pb-6 last:pb-0">
                      {/* Timeline Node */}
                      <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-surface ${
                        milestone.status === 'Completed' ? 'bg-moss' : 
                        milestone.status === 'In Progress' ? 'bg-warning' : 'bg-surface-border'
                      }`}></div>
                      
                      <div className="bg-background border border-surface-border rounded-2xl p-6">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold text-sm text-foreground">
                            {milestone.name}
                          </div>
                          <div className="font-mono text-sm font-semibold text-foreground">
                            {milestone.amount}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-end mt-4 pt-4 border-t border-surface-border">
                          <div className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${
                            milestone.status === 'Completed' ? 'text-moss' : 
                            milestone.status === 'In Progress' ? 'text-[#F59E0B]' : 'text-muted'
                          }`}>
                            {milestone.status}
                          </div>
                          {milestone.status === 'In Progress' && (
                            <button className="text-xs font-semibold text-background bg-[#BEF264] px-4 py-2 rounded-xl hover:bg-moss transition-colors uppercase tracking-wider">
                              Submit Work
                            </button>
                          )}
                          {milestone.status === 'Completed' && (
                            <div className="flex items-center space-x-1 text-moss bg-moss/10 px-2 py-1 rounded-md">
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-mono uppercase font-semibold">Funds Released</span>
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
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-surface border border-surface-border rounded-2xl p-6">
              <h3 className="text-foreground font-bold text-base mb-6 tracking-tight">Smart Contract</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-xs font-mono text-muted uppercase">Contract Address</div>
                  <div className="font-mono text-xs text-[#BEF264] break-all bg-background p-3 rounded-lg border border-surface-border">
                    0x71C...892A
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-mono text-muted uppercase">Network</div>
                  <div className="text-foreground text-sm font-medium flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-moss"></div>
                    <span>Base Mainnet</span>
                  </div>
                </div>
                <div className="pt-6 border-t border-surface-border">
                  <a href="#" className="text-xs font-semibold uppercase tracking-wider text-moss hover:text-[#BEF264] transition-colors flex items-center justify-between group/link">
                    View on Block Explorer
                    <ArrowLeftIcon className="w-4 h-4 rotate-135 group-hover/link:rotate-[135deg] transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div variants={itemVariants} className="max-w-3xl">
          <div className="bg-surface border border-surface-border rounded-2xl p-8">
            <h3 className="text-base font-bold text-foreground mb-4 tracking-tight">Project Overview</h3>
            <p className="text-muted text-sm leading-relaxed mb-6">
              {project.description || "A platform project currently in progress."}
            </p>
            
            <div className="pt-6 border-t border-surface-border">
               <p className="text-[11px] font-mono text-muted uppercase tracking-wide">
                 This contract belongs to another freelancer. Budget, milestones, and client details are private.
               </p>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}
