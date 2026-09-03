import React from "react";

interface EmptyStateProps {
  icon?: any;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16 px-6 bg-surface border border-surface-border rounded-2xl">
      <div className="flex flex-col items-center text-center max-w-sm">
        {Icon && (
          <div className="w-12 h-12 rounded-full bg-background border border-surface-border flex items-center justify-center mb-6">
            <Icon className="h-6 w-6 text-muted" strokeWidth={1.5} />
          </div>
        )}
        
        <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-muted text-sm leading-relaxed mb-6">
          {description}
        </p>

        {action && (
          <button 
            onClick={action.onClick}
            className="px-6 py-2 bg-moss hover:bg-[#65A30D] rounded-md text-background font-bold text-sm transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
