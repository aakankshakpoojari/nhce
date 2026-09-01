"use client";

import { XMarkIcon, FunnelIcon } from "@heroicons/react/24/outline";

export type FilterState = {
  tags: string[];
  budgetMin: number | "";
  budgetMax: number | "";
  duration: string;
  status: string;
};

export const defaultFilters: FilterState = {
  tags: [],
  budgetMin: "",
  budgetMax: "",
  duration: "Any",
  status: "Any",
};

interface FilterBarProps {
  availableTags: string[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  showStatus?: boolean;
  resultCount: number;
  totalCount: number;
}

export default function FilterBar({
  availableTags,
  filters,
  onChange,
  showStatus = false,
  resultCount,
  totalCount,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.tags.length > 0 ||
    filters.budgetMin !== "" ||
    filters.budgetMax !== "" ||
    filters.duration !== "Any" ||
    (showStatus && filters.status !== "Any");

  const handleTagToggle = (tag: string) => {
    if (filters.tags.includes(tag)) {
      onChange({ ...filters, tags: filters.tags.filter((t) => t !== tag) });
    } else {
      onChange({ ...filters, tags: [...filters.tags, tag] });
    }
  };

  return (
    <div className="bg-surface rounded-3xl p-6 border border-white/5 shadow-lg mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5 text-muted" />
          <span>Filters</span>
        </h3>
        {hasActiveFilters && (
          <button
            onClick={() => onChange(defaultFilters)}
            className="text-sm font-medium text-muted hover:text-[#EF4444] transition-colors flex items-center space-x-1 interactive"
          >
            <XMarkIcon className="w-4 h-4" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Skills */}
        <div className="space-y-3 lg:col-span-2">
          <label className="text-sm font-semibold text-muted">Skills & Tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isActive = filters.tags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 interactive border ${
                    isActive
                      ? "bg-moss text-background border-moss shadow-[0_0_10px_rgba(132,204,22,0.3)]"
                      : "bg-white/5 text-muted border-white/10 hover:border-white/20 hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-muted">Budget Range ($)</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.budgetMin}
              onChange={(e) =>
                onChange({ ...filters, budgetMin: e.target.value ? Number(e.target.value) : "" })
              }
              className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-moss/50 transition-colors"
            />
            <span className="text-muted">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.budgetMax}
              onChange={(e) =>
                onChange({ ...filters, budgetMax: e.target.value ? Number(e.target.value) : "" })
              }
              className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-moss/50 transition-colors"
            />
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-muted">Duration</label>
          <select
            value={filters.duration}
            onChange={(e) => onChange({ ...filters, duration: e.target.value })}
            className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-moss/50 transition-colors appearance-none cursor-pointer interactive"
          >
            <option value="Any">Any</option>
            <option value="Under 1 week">Under 1 week</option>
            <option value="1-4 weeks">1-4 weeks</option>
            <option value="1-3 months">1-3 months</option>
            <option value="3+ months">3+ months</option>
          </select>
        </div>

        {/* Status (Optional) */}
        {showStatus && (
          <div className="space-y-3">
            <label className="text-sm font-semibold text-muted">Status</label>
            <select
              value={filters.status}
              onChange={(e) => onChange({ ...filters, status: e.target.value })}
              className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-moss/50 transition-colors appearance-none cursor-pointer interactive"
            >
              <option value="Any">Any</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 flex justify-end">
        <div className="text-sm font-medium text-muted">
          Showing <span className="text-foreground">{resultCount}</span> of{" "}
          <span className="text-foreground">{totalCount}</span> results
        </div>
      </div>
    </div>
  );
}
