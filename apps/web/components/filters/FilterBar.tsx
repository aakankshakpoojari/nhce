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
    <div className="bg-[#181D1A] rounded-3xl p-6 border border-white/5 shadow-lg mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-[#F5F5F4] flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5 text-[#A3A3A3]" />
          <span>Filters</span>
        </h3>
        {hasActiveFilters && (
          <button
            onClick={() => onChange(defaultFilters)}
            className="text-sm font-medium text-[#A3A3A3] hover:text-[#EF4444] transition-colors flex items-center space-x-1 interactive"
          >
            <XMarkIcon className="w-4 h-4" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Skills */}
        <div className="space-y-3 lg:col-span-2">
          <label className="text-sm font-semibold text-[#A3A3A3]">Skills & Tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isActive = filters.tags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 interactive border ${
                    isActive
                      ? "bg-[#84CC16] text-[#101312] border-[#84CC16] shadow-[0_0_10px_rgba(132,204,22,0.3)]"
                      : "bg-white/5 text-[#A3A3A3] border-white/10 hover:border-white/20 hover:text-[#F5F5F4]"
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
          <label className="text-sm font-semibold text-[#A3A3A3]">Budget Range ($)</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.budgetMin}
              onChange={(e) =>
                onChange({ ...filters, budgetMin: e.target.value ? Number(e.target.value) : "" })
              }
              className="w-full bg-[#101312] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F5F5F4] focus:outline-none focus:border-[#84CC16]/50 transition-colors"
            />
            <span className="text-[#A3A3A3]">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.budgetMax}
              onChange={(e) =>
                onChange({ ...filters, budgetMax: e.target.value ? Number(e.target.value) : "" })
              }
              className="w-full bg-[#101312] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F5F5F4] focus:outline-none focus:border-[#84CC16]/50 transition-colors"
            />
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-[#A3A3A3]">Duration</label>
          <select
            value={filters.duration}
            onChange={(e) => onChange({ ...filters, duration: e.target.value })}
            className="w-full bg-[#101312] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F5F5F4] focus:outline-none focus:border-[#84CC16]/50 transition-colors appearance-none cursor-pointer interactive"
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
            <label className="text-sm font-semibold text-[#A3A3A3]">Status</label>
            <select
              value={filters.status}
              onChange={(e) => onChange({ ...filters, status: e.target.value })}
              className="w-full bg-[#101312] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F5F5F4] focus:outline-none focus:border-[#84CC16]/50 transition-colors appearance-none cursor-pointer interactive"
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
        <div className="text-sm font-medium text-[#A3A3A3]">
          Showing <span className="text-[#F5F5F4]">{resultCount}</span> of{" "}
          <span className="text-[#F5F5F4]">{totalCount}</span> results
        </div>
      </div>
    </div>
  );
}
