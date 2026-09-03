"use client";

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { TOKEN_OPTIONS } from "@/lib/api";

export interface JobFormValues {
  title: string;
  description: string;
  skills: string[];
  budget: string;
  tokenSymbol: string;
  deadline: string;
}

interface JobFormProps {
  initialValues?: Partial<JobFormValues>;
  submitLabel?: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (status: "DRAFT" | "PUBLISHED", values: JobFormValues) => void;
}

const EMPTY: JobFormValues = {
  title: "",
  description: "",
  skills: [],
  budget: "",
  tokenSymbol: "USDC",
  deadline: "",
};

export default function JobForm({ initialValues, submitLabel = "Create Job", isSubmitting, error, onSubmit }: JobFormProps) {
  const [values, setValues] = useState<JobFormValues>({ ...EMPTY, ...initialValues });
  const [skillInput, setSkillInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const set = <K extends keyof JobFormValues>(key: K, value: JobFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const addSkill = (raw: string) => {
    const skill = raw.trim().replace(/,$/, "");
    if (!skill) return;
    if (values.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      setSkillInput("");
      return;
    }
    set("skills", [...values.skills, skill]);
    setSkillInput("");
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const validate = (): string | null => {
    if (!values.title.trim()) return "Title is required.";
    if (!values.description.trim()) return "Description is required.";
    if (!values.budget || Number(values.budget) <= 0) return "Budget must be a positive number.";
    if (values.deadline && isNaN(new Date(values.deadline).getTime())) return "Deadline is not a valid date.";
    return null;
  };

  const handleSubmit = (status: "DRAFT" | "PUBLISHED") => {
    const err = validate();
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    onSubmit(status, {
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
      budget: String(Number(values.budget)),
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          <div>
            <label className="block text-[11px] font-mono font-semibold uppercase text-muted mb-1.5">
              Title <span className="text-[#EF4444]">*</span>
            </label>
            <input
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Build a React Dashboard"
              className="w-full bg-background border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-moss/60 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-semibold uppercase text-muted mb-1.5">
              Description <span className="text-[#EF4444]">*</span>
            </label>
            <textarea
              rows={6}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Need a responsive analytics dashboard with charts and real-time updates…"
              className="w-full bg-background border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-moss/60 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-semibold uppercase text-muted mb-1.5">Skills</label>
            <div className="flex items-center gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                onBlur={() => skillInput.trim() && addSkill(skillInput)}
                placeholder="Type a skill and press Enter (e.g. React)"
                className="w-full bg-background border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-moss/60 transition-colors"
              />
              <button
                type="button"
                onClick={() => addSkill(skillInput)}
                className="px-3 py-2.5 rounded-xl bg-surface border border-surface-border text-muted hover:text-moss hover:border-moss/50 transition flex items-center shrink-0"
                title="Add skill"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {values.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {values.skills.map((skill) => (
                  <span key={skill} className="px-2.5 py-1 rounded-md bg-background border border-surface-border text-[11px] font-mono text-muted flex items-center gap-1.5">
                    {skill}
                    <button type="button" onClick={() => set("skills", values.skills.filter((s) => s !== skill))} className="text-muted hover:text-[#EF4444] transition">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase text-muted mb-1.5">
                Budget <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={values.budget}
                onChange={(e) => set("budget", e.target.value)}
                placeholder="500"
                className="w-full bg-background border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-moss/60 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase text-muted mb-1.5">Token / Currency</label>
              <select
                value={values.tokenSymbol}
                onChange={(e) => set("tokenSymbol", e.target.value)}
                className="w-full bg-background border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-moss/60 transition-colors appearance-none cursor-pointer"
              >
                {TOKEN_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-semibold uppercase text-muted mb-1.5">Deadline</label>
            <input
              type="date"
              value={values.deadline}
              onChange={(e) => set("deadline", e.target.value)}
              className="w-full bg-background border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-moss/60 transition-colors"
            />
            <p className="text-[11px] text-muted mt-1">Optional — when the job should be delivered by.</p>
          </div>

          <div className="rounded-2xl bg-background border border-surface-border p-4 text-xs text-muted space-y-2">
            <div className="font-mono text-moss uppercase text-[10px] font-semibold tracking-wider">Tips</div>
            <ul className="space-y-1 list-disc pl-4">
              <li>Drafts are private — only you can see them.</li>
              <li>Publishing makes the job visible to freelancers in the marketplace.</li>
              <li>You can edit a draft or published job until a freelancer is selected.</li>
            </ul>
          </div>
        </div>
      </div>

      {(validationError || error) && (
        <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444]">
          {validationError || error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-surface-border">
        <button
          type="button"
          onClick={() => handleSubmit("DRAFT")}
          disabled={isSubmitting}
          className="px-6 py-3 rounded-xl bg-background border border-surface-border hover:border-moss/50 text-foreground font-semibold text-xs uppercase tracking-wider transition disabled:opacity-60"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={() => handleSubmit("PUBLISHED")}
          disabled={isSubmitting}
          className="px-6 py-3 rounded-xl bg-moss hover:bg-[#BEF264] text-background font-semibold text-xs uppercase tracking-wider transition shadow-md shadow-[#84CC16]/20 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isSubmitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </div>
  );
}