import Link from "next/link";
import { CheckBadgeIcon, ClockIcon } from "@heroicons/react/24/solid";

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
}

export default function BountyCard({ id, title, budget, tags, postedAt, clientStats }: BountyCardProps) {
  return (
    <Link href={`/bounties/${id}`} className="block">
      <div className="group relative bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-emerald)]/30 rounded-2xl p-6 cursor-pointer transition-all duration-700 ease-[var(--ease-fluid)] hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(34,197,94,0.15)] interactive">
        <div className="flex justify-between items-start mb-4">
          <div className="pr-4">
            <h3 className="text-xl font-bold text-[var(--color-off-white)] group-hover:text-[var(--color-lime)] transition-colors duration-300 mb-1">
              {title}
            </h3>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-[var(--color-muted)]">Posted by</span>
              <span className="font-medium text-[#F5F5F4]">{clientStats.name}</span>
              <span className="text-[#A3A3A3] text-xs">{clientStats.handle}</span>
            </div>
          </div>
          <div className="text-xl font-bold text-[var(--color-emerald)] shrink-0">
            {budget}
          </div>
        </div>
      
        <div className="flex flex-wrap gap-2 mb-6 mt-4">
          {tags.map((tag) => (
            <span 
              key={tag} 
              className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-charcoal)] text-[var(--color-muted)] border border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center space-x-2 text-xs font-medium">
            <CheckBadgeIcon className="h-4 w-4 text-[var(--color-moss)]" />
            <span className="text-[var(--color-moss)] tracking-wide">ESCROW GUARANTEED</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-[var(--color-muted)]">
            <ClockIcon className="h-4 w-4" />
            <span>{postedAt}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
