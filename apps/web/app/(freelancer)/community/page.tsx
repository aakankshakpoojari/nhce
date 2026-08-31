"use client";

import { ChatBubbleLeftRightIcon, HeartIcon } from "@heroicons/react/24/outline";
import EmptyState from "@/components/ui/EmptyState";
import { motion } from "framer-motion";

import { communityPosts } from "@/lib/mock-data";

export default function CommunityPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] as const } }
  };

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="mb-16">
        <h1 className="text-6xl font-bold text-[#F5F5F4] mb-6 tracking-tighter">
          Community
        </h1>
        <p className="text-[#A3A3A3] text-xl font-light">
          Discover incredible work and insights from top Web3 talent worldwide.
        </p>
      </div>

      {communityPosts.length === 0 ? (
        <EmptyState 
          icon={ChatBubbleLeftRightIcon}
          title="Nothing here yet"
          description="The feed is quiet. Follow other freelancers or post your own work to get the conversation started."
          action={{
            label: "Create a Post",
            onClick: () => console.log("Create post modal")
          }}
        />
      ) : (
        <motion.div 
          className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {communityPosts.map((post) => (
            <motion.div 
              key={post.id} 
              variants={itemVariants}
              className="group break-inside-avoid bg-[#181D1A] border border-white/5 hover:border-white/10 rounded-3xl p-8 flex flex-col cursor-pointer transition-all duration-700 ease-[var(--ease-fluid)] hover:-translate-y-2 hover:shadow-2xl interactive"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-12 w-12 bg-gradient-to-tr from-[#84CC16] to-[#BEF264] rounded-full flex items-center justify-center text-[#101312] font-bold text-lg">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <div className="text-[#F5F5F4] font-semibold">{post.author}</div>
                  <div className="text-[#A3A3A3] text-sm">{post.role}</div>
                </div>
              </div>
              
              <div className="flex-1 space-y-4 mb-8">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#101312] text-[#BEF264] border border-[#BEF264]/20 uppercase tracking-wide">
                  {post.projectTag}
                </span>
                <p className="text-[#F5F5F4] leading-relaxed font-light text-lg">
                  "{post.content}"
                </p>
              </div>
              
              <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-auto">
                <div className="flex items-center space-x-2 text-[#A3A3A3] group-hover:text-[#F59E0B] transition-colors">
                  <HeartIcon className="h-5 w-5" />
                  <span className="font-medium">{post.likes}</span>
                </div>
                <div className="text-sm text-[#A3A3A3]">
                  {post.postedAt}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
