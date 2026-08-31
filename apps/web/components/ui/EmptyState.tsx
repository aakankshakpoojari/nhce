import React from "react";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-24 px-8 bg-[#181D1A]/50 border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
      {/* Subtle background noise texture & glow */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#84CC16]/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-[#84CC16]/20 transition-colors duration-1000"></div>

      <div className="relative flex flex-col items-center text-center z-10 max-w-md">
        <div className="w-20 h-20 rounded-full bg-[#101312] border border-white/5 flex items-center justify-center mb-8 shadow-xl">
          <Icon className="h-8 w-8 text-[#A3A3A3]" strokeWidth={1.5} />
        </div>
        
        <h3 className="text-3xl font-bold text-[#F5F5F4] mb-4 tracking-tight">
          {title}
        </h3>
        <p className="text-[#A3A3A3] text-lg font-light leading-relaxed mb-8">
          {description}
        </p>

        {action && (
          <button 
            onClick={action.onClick}
            className="px-8 py-3 bg-[#181D1A] border border-white/10 rounded-full text-[#F5F5F4] font-medium hover:text-[#101312] hover:bg-[#84CC16] hover:border-[#84CC16] transition-all duration-500 var(--ease-fluid) shadow-lg interactive"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
