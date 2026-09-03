"use client";

import { detailedClients } from "@/lib/mock-data";
import { StarIcon } from "@heroicons/react/20/solid";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

export default function ClientProfilePage() {
  const clientStats = detailedClients["layer2dao"];

  return (
    <main className="flex-1 w-full mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-col items-start mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
          Client Profile
        </h1>
        <p className="text-muted text-sm">
          Manage your client identity and view your activity.
        </p>
      </div>

      <div className="bg-surface border border-surface-border rounded-2xl p-8 space-y-8 text-left">
        <div className="flex items-center space-x-8 mb-8 pb-8 border-b border-surface-border">
          <div className="h-24 w-24 rounded-full bg-background border-4 border-surface-border flex items-center justify-center text-moss">
            <span className="text-2xl font-bold">{clientStats.avatar}</span>
          </div>
          
          <div className="flex items-center space-x-8 text-foreground">
            <div>
              <div className="text-2xl font-bold tracking-tight">{clientStats.totalBounties}</div>
              <div className="text-[10px] font-mono text-muted uppercase tracking-wider">Total Bounties</div>
            </div>
            <div className="h-10 w-px bg-surface-border"></div>
            <div>
              <div className="text-2xl font-bold tracking-tight">{clientStats.totalSpent}</div>
              <div className="text-[10px] font-mono text-muted uppercase tracking-wider">Total Spent</div>
            </div>
            <div className="h-10 w-px bg-surface-border"></div>
            <div>
              <div className="text-2xl font-bold tracking-tight flex items-center">
                {clientStats.rating} 
                <StarIcon className="w-5 h-5 text-[#F59E0B] ml-1" />
              </div>
              <div className="text-[10px] font-mono text-muted uppercase tracking-wider">{clientStats.reviews.length} Reviews</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-semibold text-muted uppercase tracking-wider">Display Name</label>
            <div className="h-12 w-full bg-background rounded-lg border border-surface-border px-4 flex items-center">
              <span className="text-foreground text-sm opacity-50">{clientStats.name}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-semibold text-muted uppercase tracking-wider">Company Bio</label>
            <div className="h-24 w-full bg-background rounded-lg border border-surface-border px-4 py-3 flex items-start">
              <span className="text-foreground text-sm opacity-50">{clientStats.bio}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-mono font-semibold text-muted uppercase tracking-wider">Wallet Address</label>
            <div className="h-12 w-full bg-background rounded-lg border border-surface-border px-4 flex items-center">
              <span className="text-foreground font-mono text-sm opacity-50">0x...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-surface border border-surface-border rounded-2xl p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-surface-border pb-6">
          <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center">
            <CheckBadgeIcon className="w-6 h-6 text-moss mr-2" />
            Freelancer Reviews
          </h2>
          <div className="text-muted text-[10px] font-mono uppercase bg-background border border-surface-border px-3 py-1 rounded-md">
            Showing recent
          </div>
        </div>

        <div className="space-y-4">
          {clientStats.reviews.map((review) => (
            <div key={review.id} className="bg-background border border-surface-border rounded-xl p-6 hover:border-moss/50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-sm font-bold text-foreground">{review.author}</h4>
                  <span className="text-xs font-mono text-muted">{review.date}</span>
                </div>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon 
                      key={i} 
                      className={`w-4 h-4 ${i < review.rating ? "text-[#F59E0B]" : "text-surface-border"}`} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-muted text-sm leading-relaxed">
                "{review.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
