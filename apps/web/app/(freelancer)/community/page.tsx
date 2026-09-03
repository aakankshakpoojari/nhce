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
    <main className="flex-1 w-full mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-col items-start mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
          Community
        </h1>
        <p className="text-muted text-sm">
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {communityPosts.map((post) => (
            <motion.div 
              key={post.id} 
              variants={itemVariants}
              className="group bg-surface border border-surface-border hover:border-moss/50 rounded-2xl p-6 flex flex-col cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 bg-background border border-surface-border rounded-full flex items-center justify-center text-moss font-bold text-base">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <div className="text-foreground font-bold text-sm">{post.author}</div>
                  <div className="text-muted text-xs font-mono">{post.role}</div>
                </div>
              </div>
              
              <div className="flex-1 space-y-3 mb-6">
                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-moss/10 text-moss border border-moss/30 uppercase tracking-wider">
                  {post.projectTag}
                </span>
                <p className="text-muted leading-relaxed text-sm">
                  &ldquo;{post.content}&rdquo;
                </p>
              </div>
              
              <div className="flex items-center justify-between border-t border-surface-border pt-4 mt-auto">
                <div className="flex items-center space-x-1 text-muted group-hover:text-[#F59E0B] transition-colors">
                  <HeartIcon className="h-4 w-4" />
                  <span className="font-mono text-xs font-semibold">{post.likes}</span>
                </div>
                <div className="text-xs font-mono text-muted">
                  {post.postedAt}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
}
