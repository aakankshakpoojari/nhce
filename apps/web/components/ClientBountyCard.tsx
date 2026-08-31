import Link from "next/link";
import { UsersIcon, CheckCircleIcon, DocumentTextIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

type BountyStatus = "Open" | "In Review" | "In Progress" | "Completed";

interface ClientBountyCardProps {
  id: string;
  title: string;
  budget: string;
  tags: string[];
  status: BountyStatus;
  applicantCount: number;
}

export default function ClientBountyCard({ id, title, budget, tags, status, applicantCount }: ClientBountyCardProps) {
  
  // Status mapping
  const statusStyles: Record<BountyStatus, { bg: string, text: string, border: string }> = {
    "Open": { bg: "bg-[#84CC16]/10", text: "text-[#84CC16]", border: "border-[#84CC16]/20" },
    "In Review": { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]", border: "border-[#F59E0B]/20" },
    "In Progress": { bg: "bg-[#22C55E]/10", text: "text-[#22C55E]", border: "border-[#22C55E]/20" },
    "Completed": { bg: "bg-[#A3A3A3]/10", text: "text-[#A3A3A3]", border: "border-[#A3A3A3]/20" },
  };

  const currentStatusStyle = statusStyles[status];

  // Action mapping
  const getAction = (status: BountyStatus) => {
    switch(status) {
      case "Open":
      case "In Review":
        return { label: "Review Proposals", icon: UsersIcon };
      case "In Progress":
        return { label: "View Contract", icon: DocumentTextIcon };
      case "Completed":
        return { label: "View Receipt", icon: CheckCircleIcon };
    }
  };

  const action = getAction(status);
  const ActionIcon = action.icon;

  return (
    <Link href={`/bounties/${id}`} className="block">
      <div className="group relative bg-[#181D1A] border border-white/5 hover:border-white/10 rounded-3xl p-8 cursor-pointer transition-all duration-700 ease-[var(--ease-fluid)] hover:-translate-y-2 hover:shadow-xl interactive">
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col space-y-3">
          <div className={`w-fit px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${currentStatusStyle.bg} ${currentStatusStyle.text} ${currentStatusStyle.border}`}>
            {status}
          </div>
          <h3 className="text-2xl font-bold text-[#F5F5F4] group-hover:text-[#F5F5F4]/80 transition-colors duration-300">
            {title}
          </h3>
        </div>
        <div className="text-2xl font-bold text-[#22C55E] shrink-0 ml-4">
          {budget}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-8">
        {tags.map((tag) => (
          <span 
            key={tag} 
            className="px-3 py-1 rounded-full text-xs font-medium bg-[#101312] text-[#A3A3A3] border border-white/5"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-6">
        <div className="flex items-center space-x-2 text-[#A3A3A3]">
          <UsersIcon className="h-5 w-5" />
          <span className="font-medium">{applicantCount} {applicantCount === 1 ? 'proposal' : 'proposals'}</span>
        </div>
        
        <button className="flex items-center space-x-2 text-[#BEF264] hover:text-[#84CC16] font-semibold transition-colors duration-300 group/btn">
          <span>{action.label}</span>
          <ArrowRightIcon className="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
      </div>
    </Link>
  );
}
