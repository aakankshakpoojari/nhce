import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface MockClientStats {
  name: string;
  handle: string;
  rating: number;
  totalBounties: number;
}

interface BountyCardProps {
  id: string;
  title: string;
  budget: string;
  tags: string[];
  postedAt: string;
  clientStats: MockClientStats;
  proOnly?: boolean;
  isProUser?: boolean;
}

export default function BountyCard({ id, title, budget, tags, postedAt, clientStats, proOnly, isProUser }: BountyCardProps) {
  const parseBudget = (budgetStr: string) => {
    return Number(budgetStr.replace(/[^0-9.-]+/g, ""));
  };
  const numericBudget = parseBudget(budget);
  const budgetINR = numericBudget * 83; // approx conversion

  const isLocked = proOnly && !isProUser;

  return (
    <Link href={`/bounties/${id}`} className="block group">
      <div className={`p-6 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 interactive ${
        isLocked 
          ? "bg-surface/50 border-surface-border/50 opacity-75" 
          : "bg-surface border-surface-border hover:border-moss/50"
      }`}>
        
        {/* Left Info */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            {proOnly && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold bg-moss/20 text-moss border border-moss/30">
                PRO ONLY
              </span>
            )}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold bg-[#28332D]/50 text-muted border border-surface-border">
              Escrow Guaranteed
            </span>
            <span className="text-[11px] text-muted font-mono">
              Posted {postedAt} by {clientStats.name} ({clientStats.handle})
            </span>
          </div>

          <h3 className={`text-base font-bold transition-colors duration-300 ${
            isLocked ? "text-muted" : "text-foreground group-hover:text-moss"
          }`}>
            {title}
          </h3>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <span 
                key={tag} 
                className="px-2 py-0.5 rounded-md bg-background border border-surface-border text-[11px] font-mono text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Budget & Apply CTA */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-surface-border">
          <div className="text-left md:text-right">
            <div className={`text-base font-extrabold font-mono ${isLocked ? "text-muted" : "text-foreground"}`}>
              {budget}
            </div>
            {numericBudget > 0 && (
              <div className="text-xs text-muted font-mono">
                ≈ ₹{budgetINR.toLocaleString("en-IN")}
              </div>
            )}
          </div>
          
          {isLocked ? (
             <div className="px-4 py-2.5 rounded-xl bg-[#28332D]/30 text-muted border border-surface-border/50 transition-all text-xs font-semibold flex items-center gap-2 group-hover:border-moss/50 group-hover:text-moss">
               <span>Locked (Requires Pro)</span>
               <ArrowRight className="w-3.5 h-3.5" />
             </div>
          ) : (
            <div className="px-4 py-2.5 rounded-xl bg-background text-foreground border border-surface-border transition-all text-xs font-semibold flex items-center gap-2 shadow-sm group-hover:bg-moss group-hover:text-background group-hover:border-moss">
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

      </div>
    </Link>
  );
}
