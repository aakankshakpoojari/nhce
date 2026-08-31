"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckBadgeIcon, ClockIcon, ArrowLeftIcon, DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRole } from "@/contexts/RoleContext";
import { dummyBounties, clientBounties } from "@/lib/mock-data";
import EmptyState from "@/components/ui/EmptyState";
<<<<<<< HEAD
import { motion, type Variants } from "framer-motion";
=======
import { motion } from "framer-motion";
>>>>>>> e426b110b6f256e467c4ec253fd89b8d19d88212

export default function BountyDetailPage() {
  const { id } = useParams();
  const { isClient } = useRole();

  // Find the bounty
  // In a real app, this would be an API fetch that returns the specific bounty,
  // potentially different payloads based on auth role.
<<<<<<< HEAD
  const bounty = isClient
=======
  const bounty = isClient 
>>>>>>> e426b110b6f256e467c4ec253fd89b8d19d88212
    ? clientBounties.find(b => b.id === id)
    : dummyBounties.find(b => b.id === id);

  if (!bounty) {
    return (
      <div className="max-w-3xl mx-auto py-20">
<<<<<<< HEAD
        <EmptyState
=======
        <EmptyState 
>>>>>>> e426b110b6f256e467c4ec253fd89b8d19d88212
          icon={DocumentMagnifyingGlassIcon}
          title="Bounty Not Found"
          description="We couldn't find the bounty you're looking for. It may have been removed, filled, or you might have an incorrect link."
          action={{
            label: "Back to Bounties",
            onClick: () => window.location.href = "/bounties"
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
<<<<<<< HEAD
    <motion.div
=======
    <motion.div 
>>>>>>> e426b110b6f256e467c4ec253fd89b8d19d88212
      className="max-w-[1000px] mx-auto w-full pb-32"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="mb-12">
<<<<<<< HEAD
        <Link
          href="/bounties"
=======
        <Link 
          href="/bounties" 
>>>>>>> e426b110b6f256e467c4ec253fd89b8d19d88212
          className="inline-flex items-center space-x-2 text-[var(--color-muted)] hover:text-[#BEF264] transition-colors duration-300 group font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Marketplace</span>
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-[#F5F5F4] tracking-tighter leading-tight max-w-3xl">
            {bounty.title}
          </h1>
          <div className="text-4xl md:text-5xl font-bold text-[#22C55E] tracking-tight shrink-0">
            {bounty.budget}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-wrap gap-2">
            {bounty.tags.map((tag) => (
<<<<<<< HEAD
              <span
                key={tag}
=======
              <span 
                key={tag} 
>>>>>>> e426b110b6f256e467c4ec253fd89b8d19d88212
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-[#181D1A] text-[#A3A3A3] border border-white/5"
              >
                {tag}
              </span>
            ))}
          </div>
<<<<<<< HEAD

          <div className="h-6 w-px bg-white/10 hidden md:block"></div>

=======
          
          <div className="h-6 w-px bg-white/10 hidden md:block"></div>
          
>>>>>>> e426b110b6f256e467c4ec253fd89b8d19d88212
          <div className="flex items-center space-x-2 text-sm font-medium">
            <CheckBadgeIcon className="h-5 w-5 text-[#84CC16]" />
            <span className="text-[#84CC16] tracking-wide">ESCROW GUARANTEED</span>
          </div>

          <div className="h-6 w-px bg-white/10 hidden md:block"></div>

          <div className="flex items-center space-x-1 text-sm text-[#A3A3A3]">
            <ClockIcon className="h-5 w-5" />
            <span>Posted {bounty.postedAt}</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-12">
          <div className="prose prose-invert prose-lg max-w-none">
            <h3 className="text-2xl font-bold text-[#F5F5F4] mb-6 tracking-tight">Project Description</h3>
            <p className="text-[#A3A3A3] leading-relaxed font-light">
              {bounty.fullDescription}
            </p>
          </div>
<<<<<<< HEAD

          {!isClient && (
            <div className="pt-8 border-t border-white/5">
              <button
=======
          
          {!isClient && (
            <div className="pt-8 border-t border-white/5">
              <button 
>>>>>>> e426b110b6f256e467c4ec253fd89b8d19d88212
                onClick={() => alert("Mock Proposal Submitted!")}
                className="w-full md:w-auto px-8 py-4 bg-[#84CC16] hover:bg-[#bef264] text-[#101312] font-bold rounded-full transition-colors duration-300 shadow-[0_0_20px_rgba(132,204,22,0.3)] hover:shadow-[0_0_30px_rgba(190,242,100,0.5)] interactive text-lg"
              >
                Submit Proposal
              </button>
            </div>
          )}

          {isClient && (
            <div className="pt-8 border-t border-white/5">
              <h3 className="text-2xl font-bold text-[#F5F5F4] mb-8 tracking-tight">Proposals Received ({bounty.applicantCount})</h3>
              <div className="space-y-4">
                {/* Mocking a couple of proposals for the client view */}
                {[1, 2, 3].slice(0, bounty.applicantCount || 0).map(i => (
                  <div key={i} className="bg-[#181D1A] border border-white/5 rounded-2xl p-6 flex justify-between items-center interactive cursor-pointer hover:border-[#84CC16]/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center font-bold text-[#F5F5F4]">
                        D{i}
                      </div>
                      <div>
                        <div className="font-semibold text-[#F5F5F4]">Developer {i}</div>
                        <div className="text-sm text-[#A3A3A3]">Top Rated • 5 Jobs</div>
                      </div>
                    </div>
                    <button className="text-sm font-semibold text-[#BEF264]">Review</button>
                  </div>
                ))}
                {(bounty.applicantCount || 0) > 3 && (
                  <button className="w-full py-4 text-[#A3A3A3] hover:text-[#F5F5F4] font-medium transition-colors text-sm">
                    View all {bounty.applicantCount} proposals
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Sidebar Info */}
        <motion.div variants={itemVariants} className="space-y-8">
          <div className="bg-[#181D1A] border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
<<<<<<< HEAD
            {/* Subtle noise */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>

            <h3 className="text-[#F5F5F4] font-bold text-xl mb-6 tracking-tight relative z-10">Client Info</h3>

=======
             {/* Subtle noise */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>
            
            <h3 className="text-[#F5F5F4] font-bold text-xl mb-6 tracking-tight relative z-10">Client Info</h3>
            
>>>>>>> e426b110b6f256e467c4ec253fd89b8d19d88212
            <div className="space-y-6 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-tr from-[#101312] to-[#22C55E]/20 border border-[#22C55E]/20 rounded-full flex items-center justify-center text-[#22C55E] font-bold text-xl">
                  {bounty.clientStats?.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-[#F5F5F4] text-lg">{bounty.clientStats?.name}</div>
                  <div className="text-sm text-[#A3A3A3]">{bounty.clientStats?.handle}</div>
                </div>
              </div>
<<<<<<< HEAD

=======
              
>>>>>>> e426b110b6f256e467c4ec253fd89b8d19d88212
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                <div>
                  <div className="text-sm text-[#A3A3A3] mb-1">Rating</div>
                  <div className="text-[#F5F5F4] font-semibold text-lg flex items-center">
                    {bounty.clientStats?.rating} <span className="text-[#F59E0B] ml-1">★</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[#A3A3A3] mb-1">Total Bounties</div>
                  <div className="text-[#F5F5F4] font-semibold text-lg">{bounty.clientStats?.totalBounties}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
