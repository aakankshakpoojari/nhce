"use client";

import { motion } from "framer-motion";
import EmptyState from "@/components/ui/EmptyState";
import { useApplications } from "@/contexts/ApplicationContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ApplicationsPage() {
  const { applications } = useApplications();
  const router = useRouter();

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
    <div className="flex flex-col gap-12 max-w-[1000px] mx-auto w-full pb-20">
      <div className="flex flex-col items-start mb-6">
        <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold tracking-tighter text-[#F5F5F4] mb-4">
          My Applications
        </h1>
        <p className="text-[#A3A3A3] text-xl font-light">
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
              <div className="bg-[#181D1A] border border-white/5 hover:border-white/10 rounded-3xl p-6 md:p-8 transition-colors relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-[#F5F5F4] group-hover:text-[#BEF264] transition-colors mb-2">{app.bountyTitle}</h3>
                    <p className="text-sm text-[#A3A3A3]">Applied: {app.appliedAt}</p>
                  </div>
                  <div>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
                      app.status === "Accepted" ? "bg-[#22C55E]/10 text-[#22C55E]" :
                      app.status === "Pending Review" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                      "bg-white/5 text-[#A3A3A3]"
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
    </div>
  );
}
