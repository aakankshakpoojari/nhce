"use client";

import { detailedClients } from "@/lib/mock-data";
import { StarIcon, ShieldCheckIcon, DocumentTextIcon, CurrencyDollarIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useParams } from "next/navigation";
import EmptyState from "@/components/ui/EmptyState";

export default function ClientProfilePage() {
  const params = useParams();
  const clientId = params.id as string;
  const client = detailedClients[clientId];

  if (!client) {
    return (
      <main className="flex-1 w-full mx-auto px-6 py-8">
        <EmptyState 
          icon={DocumentTextIcon}
          title="Client Not Found"
          description="The client profile you are looking for does not exist or has been removed."
          action={{
            label: "Back to Dashboard",
            onClick: () => window.location.href = "/"
          }}
        />
      </main>
    );
  }

  return (
    <main className="flex-1 w-full mx-auto px-6 py-8 space-y-8">
      
      {/* Header Profile Section */}
      <div className="bg-surface border border-surface-border rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-moss/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-full bg-background border-2 border-surface-border flex items-center justify-center text-moss font-black text-3xl shrink-0">
            {client.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{client.name}</h1>
              <ShieldCheckIcon className="w-6 h-6 text-moss" title="Verified Client" />
            </div>
            <p className="text-muted font-mono text-sm mb-3">@{client.handle}</p>
            <div className="flex items-center gap-1 text-[#F59E0B]">
              <StarSolid className="w-4 h-4" />
              <span className="font-bold text-sm text-foreground">{client.rating.toFixed(1)}</span>
              <span className="text-muted text-xs ml-1 font-mono">({client.reviews.length} Reviews)</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full md:w-auto">
          <Link 
            href="/messages"
            className="px-6 py-2.5 bg-moss hover:bg-[#65A30D] rounded-xl text-background font-bold text-sm transition-colors text-center flex items-center justify-center gap-2"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            Message Client
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Info */}
        <div className="space-y-6">
          <div className="bg-surface border border-surface-border rounded-2xl p-6">
            <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Client Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <div className="flex items-center gap-2 text-muted">
                  <DocumentTextIcon className="w-4 h-4" />
                  <span className="text-xs">Total Bounties</span>
                </div>
                <span className="text-foreground font-mono font-bold">{client.totalBounties}</span>
              </div>
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <div className="flex items-center gap-2 text-muted">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  <span className="text-xs">Total Spent</span>
                </div>
                <span className="text-foreground font-mono font-bold">{client.totalSpent}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span className="text-xs">Member Since</span>
                </div>
                <span className="text-foreground font-mono font-bold text-xs">{client.memberSince}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-surface-border rounded-2xl p-6">
            <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">About</h3>
            <p className="text-muted text-sm leading-relaxed">
              {client.bio}
            </p>
          </div>
        </div>

        {/* Right Column: Reviews */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
            Freelancer Reviews
          </h2>
          
          {client.reviews.length === 0 ? (
            <EmptyState 
              icon={StarIcon}
              title="No Reviews Yet"
              description="This client hasn't received any reviews from freelancers yet."
            />
          ) : (
            <div className="space-y-4">
              {client.reviews.map((review) => (
                <div key={review.id} className="bg-surface border border-surface-border rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-bold text-foreground text-sm">{review.author}</span>
                      <div className="flex items-center gap-1 mt-1 text-[#F59E0B]">
                        {[...Array(5)].map((_, i) => (
                          i < review.rating ? (
                            <StarSolid key={i} className="w-3.5 h-3.5" />
                          ) : (
                            <StarIcon key={i} className="w-3.5 h-3.5 text-surface-border" />
                          )
                        ))}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-muted">{review.date}</span>
                  </div>
                  <p className="text-muted text-sm leading-relaxed">
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </main>
  );
}
