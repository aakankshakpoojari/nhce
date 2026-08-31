"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award, Star, ExternalLink, Zap, ShieldCheck, MessageSquare } from "lucide-react";
import { freelancersList } from "@/lib/mock-data";

export default function FreelancerDetailsPage() {
  const { id } = useParams();
  const freelancer = freelancersList.find(f => f.id === id);

  if (!freelancer) {
    return (
      <div className="min-h-screen bg-transparent text-foreground flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Freelancer Not Found</h1>
        <Link href="/client/freelancers" className="text-moss hover:underline">
          Return to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col selection:bg-moss selection:text-background">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 px-6 py-3.5 border-b border-surface-border bg-surface/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/client/freelancers" className="flex items-center gap-2 text-xs text-muted hover:text-foreground transition">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Directory</span>
            </Link>
          </div>
          <span className="text-xs font-mono text-moss">FREELANCER PROFILE</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-8">
        
        {/* Profile Header */}
        <section className="p-8 rounded-3xl bg-surface border border-surface-border flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-background border border-surface-border flex items-center justify-center font-bold text-3xl text-moss">
              {freelancer.avatar}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-foreground tracking-tight">{freelancer.name}</h1>
                {freelancer.isPro && (
                  <span className="px-2.5 py-1 rounded-md bg-moss/20 border border-moss/40 text-moss font-mono text-xs font-bold flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> PRO
                  </span>
                )}
                {freelancer.didVerified && (
                  <span className="px-2.5 py-1 rounded-md bg-blue-500/20 border border-blue-500/40 text-blue-400 font-mono text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> DID VERIFIED
                  </span>
                )}
              </div>
              <p className="text-muted font-medium text-lg">{freelancer.role}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <button className="px-6 py-3.5 rounded-xl bg-moss hover:bg-[#BEF264] text-background font-bold text-sm transition-all shadow-[0_0_20px_rgba(132,204,22,0.15)] hover:shadow-[0_0_25px_rgba(190,242,100,0.3)] flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              Invite to Project
            </button>
            <button className="px-6 py-3.5 rounded-xl bg-background hover:bg-surface-border text-foreground border border-surface-border font-bold text-sm transition-all flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Send Message
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Info Column */}
          <div className="md:col-span-2 space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">About</h2>
              <div className="p-6 rounded-2xl bg-surface border border-surface-border">
                <p className="text-muted leading-relaxed">
                  {freelancer.bio}
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Skills & Expertise</h2>
              <div className="p-6 rounded-2xl bg-surface border border-surface-border flex flex-wrap gap-2.5">
                {freelancer.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-background border border-surface-border text-sm font-mono text-foreground hover:border-moss/50 transition-colors cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-6">
              <div>
                <span className="text-xs font-mono text-muted uppercase block mb-1">Hourly Rate</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-foreground font-mono">${freelancer.hourlyUSD}</span>
                  <span className="text-muted text-sm">/ hr</span>
                </div>
                <span className="text-xs text-muted font-mono block mt-1">≈ ₹{freelancer.hourlyINR.toLocaleString("en-IN")} / hr</span>
              </div>

              <div className="pt-6 border-t border-surface-border">
                <span className="text-xs font-mono text-muted uppercase block mb-1">Rating</span>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-[#84CC16] text-moss" />
                  <span className="text-xl font-bold text-foreground">{freelancer.rating.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-surface-border">
                <span className="text-xs font-mono text-muted uppercase block mb-1">Projects Completed</span>
                <div className="text-xl font-bold text-foreground">{freelancer.completedJobs}</div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
