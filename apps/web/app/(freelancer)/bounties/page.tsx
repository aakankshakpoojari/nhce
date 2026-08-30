"use client";

import { motion } from "framer-motion";
import { FolderOpenIcon } from "@heroicons/react/24/outline";
import BountyCard from "@/components/BountyCard";
import ClientBountyCard from "@/components/ClientBountyCard";
import SuperFeed from "@/components/SuperFeed";
import EmptyState from "@/components/ui/EmptyState";
import { useRole } from "@/contexts/RoleContext";
import { dummyBounties, clientBounties } from "@/lib/mock-data";

export default function BountiesPage() {
  const { isClient } = useRole();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] } }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 max-w-[1600px] mx-auto w-full">
      {/* Main Feed (62%) - Asymmetric split */}
      <div className="flex-grow lg:w-[62%] space-y-8 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-6xl font-bold text-[#F5F5F4] mb-4 tracking-tighter">
              {isClient ? "My Posted Bounties" : "Open Bounties"}
            </h1>
            <p className="text-[#A3A3A3] text-xl font-light">
              {isClient ? "Manage your active listings and review proposals." : "Discover and claim high-value Web3 tasks."}
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button className="px-6 py-2.5 bg-[#181D1A] border border-white/10 rounded-full text-sm font-medium hover:bg-[#84CC16]/10 hover:border-[#84CC16]/50 transition-all duration-500 interactive">
              Filter
            </button>
            <button className="px-6 py-2.5 bg-[#181D1A] border border-white/10 rounded-full text-sm font-medium hover:bg-[#84CC16]/10 hover:border-[#84CC16]/50 transition-all duration-500 interactive">
              Sort by: Latest
            </button>
          </div>
        </div>

        <motion.div 
          className="grid gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          key={isClient ? "client" : "freelancer"} // Force re-render animation on toggle
        >
          {isClient ? (
            clientBounties.length === 0 ? (
              <EmptyState 
                icon={FolderOpenIcon}
                title="No posted bounties yet"
                description="You haven't posted any bounties. Create your first listing to start receiving proposals from top talent."
                action={{
                  label: "Post a Bounty",
                  onClick: () => console.log("Post bounty modal")
                }}
              />
            ) : (
              clientBounties.map((bounty) => (
                <motion.div key={bounty.id} variants={itemVariants}>
                  <ClientBountyCard {...bounty} />
                </motion.div>
              ))
            )
          ) : (
            dummyBounties.map((bounty) => (
              <motion.div key={bounty.id} variants={itemVariants}>
                <BountyCard {...bounty} />
              </motion.div>
            ))
          )}
        </motion.div>
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
