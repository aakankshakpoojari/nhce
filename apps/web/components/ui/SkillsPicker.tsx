"use client";

/**
 * @file SkillsPicker.tsx
 * @description Reusable multi-skill input: click a suggested chip to add it, or
 * type a custom one and press Enter / comma / the + button. Selected skills show
 * as removable chips. Used by freelancer onboarding and the client job form.
 */

import { useState } from "react";
import { Plus, X } from "lucide-react";

export const SKILL_SUGGESTIONS = [
  "Solidity",
  "Smart Contracts",
  "Rust",
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "The Graph",
  "Foundry",
  "Hardhat",
  "Ethers.js",
  "wagmi / viem",
  "Web3.js",
  "DeFi",
  "NFT",
  "Tokenomics",
  "Security Auditing",
  "ZK / Circuits",
  "Subgraph",
  "IPFS",
  "Chainlink",
  "Uniswap",
  "Go",
  "Python",
  "DevOps",
  "UI/UX Design",
  "Technical Writing",
  "Product Management",
];

interface SkillsPickerProps {
  value: string[];
  onChange: (skills: string[]) => void;
  label?: string;
  required?: boolean;
  suggestions?: string[];
  max?: number;
  error?: string;
}

export default function SkillsPicker({
  value,
  onChange,
  label = "Skills",
  required,
  suggestions = SKILL_SUGGESTIONS,
  max = 30,
  error,
}: SkillsPickerProps) {
  const [input, setInput] = useState("");

  const add = (raw: string) => {
    const skill = raw.trim().replace(/,+$/, "").trim();
    if (!skill) return;
    if (value.length >= max) return;
    if (value.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      setInput("");
      return;
    }
    onChange([...value, skill]);
    setInput("");
  };

  const remove = (skill: string) => onChange(value.filter((s) => s !== skill));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(input);
    } else if (e.key === "Backspace" && !input && value.length) {
      remove(value[value.length - 1]);
    }
  };

  const remainingSuggestions = suggestions.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())
  );

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-[11px] font-mono font-semibold uppercase text-muted">
            {label}
          </label>
          <span
            className={`text-[10px] font-mono uppercase ${
              required ? "text-moss" : "text-muted/60"
            }`}
          >
            {required ? "Required" : "Optional"}
          </span>
        </div>
      )}

      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 rounded-md bg-moss/10 border border-moss/30 text-[11px] font-mono text-moss flex items-center gap-1.5"
            >
              {skill}
              <button
                type="button"
                onClick={() => remove(skill)}
                className="text-moss/70 hover:text-[#EF4444] transition"
                aria-label={`Remove ${skill}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Free-text add */}
      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => input.trim() && add(input)}
          placeholder="Type a skill, press Enter"
          className="w-full bg-background border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-moss/60 transition-colors"
        />
        <button
          type="button"
          onClick={() => add(input)}
          className="px-3 py-2.5 rounded-xl bg-surface border border-surface-border text-muted hover:text-moss hover:border-moss/50 transition flex items-center shrink-0"
          aria-label="Add skill"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Suggestions */}
      {remainingSuggestions.length > 0 && value.length < max && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {remainingSuggestions.slice(0, 18).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="px-2.5 py-1 rounded-md bg-background border border-surface-border text-[11px] font-mono text-muted hover:text-moss hover:border-moss/40 transition flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              {s}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
