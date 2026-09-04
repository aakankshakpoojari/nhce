"use client";

/**
 * @file OnboardingWizard.tsx
 * @description Post-verification profile setup. A short, role-aware, multi-step
 * flow over fields that already exist on the User model (name, location, bio,
 * portfolioLinks). Every "Continue" persists that step through the real
 * PUT /auth/profile endpoint, so a half-finished session resumes from the
 * server on the next visit. The final step calls POST /auth/onboarding/complete.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SkillsPicker from "@/components/ui/SkillsPicker";
import {
  getProfile,
  updateProfile,
  completeOnboarding,
  getAuthToken,
  ApiError,
} from "@/lib/api";

type FieldKey = "name" | "location" | "bio" | "links" | "skills";

interface FieldDef {
  key: FieldKey;
  type: "text" | "textarea" | "links" | "skills";
  label: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  maxLength?: number;
}

interface StepDef {
  title: string;
  subtitle: string;
  fields: FieldDef[];
}

const IDENTITY_STEP = (nameLabel: string): StepDef => ({
  title: "Set up your profile",
  subtitle: "This is what other people on W3HIRE see first.",
  fields: [
    { key: "name", type: "text", label: nameLabel, required: true, maxLength: 80, placeholder: "Satoshi Nakamoto" },
    { key: "location", type: "text", label: "Country / location", maxLength: 120, placeholder: "Berlin, Germany" },
  ],
});

const STEPS_BY_ROLE: Record<"FREELANCER" | "CLIENT" | "JUROR", StepDef[]> = {
  FREELANCER: [
    IDENTITY_STEP("Display name"),
    {
      title: "Tell clients about you",
      subtitle: "A short intro goes a long way when you apply to work.",
      fields: [
        {
          key: "bio",
          type: "textarea",
          label: "Short bio",
          maxLength: 1000,
          placeholder: "Full-stack + Solidity. 5 years shipping DeFi frontends and audited contracts.",
        },
      ],
    },
    {
      title: "What are you great at?",
      subtitle: "Pick from the list or add your own — this is how clients find you.",
      fields: [
        {
          key: "skills",
          type: "skills",
          label: "Your skills",
          hint: "Tap a suggestion to add it, or type your own and press Enter",
        },
      ],
    },
    {
      title: "Show your work",
      subtitle: "Add links to anything that proves what you can do.",
      fields: [
        {
          key: "links",
          type: "links",
          label: "Portfolio & profile links",
          hint: "GitHub, LinkedIn, personal site, Dribbble — add as many as you like",
        },
      ],
    },
  ],
  CLIENT: [
    IDENTITY_STEP("Your name"),
    {
      title: "About you or your company",
      subtitle: "Optional, but it helps freelancers trust your posts.",
      fields: [
        {
          key: "bio",
          type: "textarea",
          label: "About",
          maxLength: 1000,
          placeholder: "Seed-stage L2 team building tooling for on-chain governance.",
        },
      ],
    },
    {
      title: "Relevant links",
      subtitle: "Company site, LinkedIn, docs — whatever gives context.",
      fields: [{ key: "links", type: "links", label: "Links", hint: "Add as many as you like" }],
    },
  ],
  JUROR: [
    IDENTITY_STEP("Display name"),
    {
      title: "Your background",
      subtitle: "Helps route disputes to reviewers with the right expertise.",
      fields: [
        {
          key: "bio",
          type: "textarea",
          label: "Areas of expertise",
          maxLength: 1000,
          placeholder: "Smart-contract security and dispute resolution. 8 years across audits and arbitration.",
        },
      ],
    },
  ],
};

function dashboardFor(role?: string) {
  if (role === "CLIENT") return "/client";
  if (role === "ADMIN") return "/admin";
  return "/bounties";
}

function normalizeUrl(raw: string): string {
  const v = raw.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

function isValidUrl(raw: string): boolean {
  try {
    const u = new URL(normalizeUrl(raw));
    return !!u.hostname && u.hostname.includes(".");
  } catch {
    return false;
  }
}

interface FormState {
  name: string;
  location: string;
  bio: string;
  links: string[];
  skills: string[];
}

export default function OnboardingWizard() {
  const router = useRouter();
  const { user, isLoading, refreshUser } = useAuth();

  const role = (user?.role === "CLIENT" || user?.role === "JUROR" ? user.role : "FREELANCER") as
    | "FREELANCER"
    | "CLIENT"
    | "JUROR";

  const steps = useMemo(() => STEPS_BY_ROLE[role], [role]);
  const totalSteps = steps.length + 1; // + review

  const [ready, setReady] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>({
    name: "",
    location: "",
    bio: "",
    links: [""],
    skills: [],
  });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  // Route guards + prefill from the server (the source of truth for resume).
  useEffect(() => {
    if (isLoading || loadedRef.current) return;
    loadedRef.current = true;

    if (!user) {
      router.replace("/");
      return;
    }
    if (user.role === "ADMIN") {
      router.replace("/admin");
      return;
    }
    if (user.onboardingCompleted) {
      router.replace(dashboardFor(user.role));
      return;
    }

    const token = getAuthToken();
    if (!token) {
      router.replace("/");
      return;
    }

    (async () => {
      try {
        const { user: profile } = await getProfile(token);
        setForm({
          name: profile.name ?? user.name ?? "",
          location: profile.location ?? "",
          bio: profile.bio ?? "",
          links: profile.portfolioLinks?.length ? [...profile.portfolioLinks] : [""],
          skills: profile.skills ?? [],
        });
      } catch {
        setForm((f) => ({ ...f, name: f.name || user.name || "" }));
      } finally {
        setReady(true);
      }
    })();
  }, [isLoading, user, router]);

  const setField = useCallback((key: "name" | "location" | "bio", value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }, []);

  const setSkills = useCallback((skills: string[]) => {
    setForm((f) => ({ ...f, skills }));
    setErrors((e) => ({ ...e, skills: undefined }));
  }, []);

  const setLink = (i: number, value: string) => {
    setForm((f) => ({ ...f, links: f.links.map((l, idx) => (idx === i ? value : l)) }));
    setErrors((e) => ({ ...e, links: undefined }));
  };
  const addLink = () => setForm((f) => ({ ...f, links: [...f.links, ""] }));
  const removeLink = (i: number) =>
    setForm((f) => ({ ...f, links: f.links.filter((_, idx) => idx !== i).length ? f.links.filter((_, idx) => idx !== i) : [""] }));

  const cleanedLinks = () => form.links.map((l) => l.trim()).filter(Boolean).map(normalizeUrl);

  /** Validate the fields shown on `step`. Returns true when it's safe to advance. */
  const validateStep = (step: StepDef): boolean => {
    const next: Partial<Record<FieldKey, string>> = {};
    for (const field of step.fields) {
      if (field.key === "name") {
        if (!form.name.trim()) next.name = "Please enter a name.";
        else if (form.name.trim().length > 80) next.name = "Keep it under 80 characters.";
      }
      if (field.key === "location" && form.location.trim().length > 120) {
        next.location = "Keep it under 120 characters.";
      }
      if (field.key === "bio" && form.bio.trim().length > 1000) {
        next.bio = "Keep it under 1000 characters.";
      }
      if (field.key === "links") {
        const bad = form.links.map((l) => l.trim()).filter(Boolean).find((l) => !isValidUrl(l));
        if (bad) next.links = `"${bad}" doesn't look like a valid URL.`;
      }
      if (field.key === "skills" && form.skills.length > 30) {
        next.skills = "Pick up to 30 skills.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /** Persist just the fields owned by `step` (partial update = resumable). */
  const persistStep = async (step: StepDef) => {
    const token = getAuthToken();
    if (!token) throw new ApiError(401, "Not authenticated");
    const payload: Record<string, unknown> = {};
    for (const field of step.fields) {
      if (field.key === "name") payload.name = form.name.trim();
      if (field.key === "location") payload.location = form.location.trim();
      if (field.key === "bio") payload.bio = form.bio.trim();
      if (field.key === "links") payload.portfolioLinks = cleanedLinks();
      if (field.key === "skills") payload.skills = form.skills;
    }
    if (Object.keys(payload).length > 0) {
      await updateProfile(token, payload as never);
    }
  };

  const goNext = async () => {
    setSaveError(null);
    const onReview = stepIndex >= steps.length;

    if (!onReview) {
      const step = steps[stepIndex];
      if (!validateStep(step)) return;
      setSaving(true);
      try {
        await persistStep(step);
        setStepIndex((i) => i + 1);
      } catch (e) {
        setSaveError(e instanceof ApiError ? e.message : "Couldn't save. Check your connection and retry.");
      } finally {
        setSaving(false);
      }
      return;
    }

    // Review step → finish
    setSaving(true);
    try {
      const token = getAuthToken();
      if (!token) throw new ApiError(401, "Not authenticated");
      await completeOnboarding(token, {
        name: form.name.trim(),
        location: form.location.trim(),
        bio: form.bio.trim(),
        portfolioLinks: cleanedLinks(),
        skills: form.skills,
      });
      await refreshUser();
      router.replace(dashboardFor(user?.role));
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : "Couldn't finish onboarding. Please retry.");
      setSaving(false);
    }
  };

  const goBack = () => {
    setSaveError(null);
    setErrors({});
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const skipStep = async () => {
    // Optional steps only — behaves like Continue but never blocks on empty values.
    const step = steps[stepIndex];
    if (step.fields.some((f) => f.required)) return;
    setSaving(true);
    setSaveError(null);
    try {
      await persistStep(step);
    } catch {
      /* skipping is best-effort; data is still in local state for the review step */
    } finally {
      setSaving(false);
      setStepIndex((i) => i + 1);
    }
  };

  if (isLoading || !ready) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 text-muted">
        <Loader2 className="w-8 h-8 animate-spin text-moss" />
        <p className="text-sm font-mono">Loading your profile…</p>
      </div>
    );
  }

  const onReview = stepIndex >= steps.length;
  const step = onReview ? null : steps[stepIndex];
  const stepOptional = step ? !step.fields.some((f) => f.required) : false;
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 shadow-2xl text-foreground">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted mb-2">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-moss" />
              {role.charAt(0) + role.slice(1).toLowerCase()} onboarding
            </span>
            <span>
              Step {Math.min(stepIndex + 1, totalSteps)} of {totalSteps}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-background overflow-hidden">
            <div
              className="h-full rounded-full bg-moss transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {onReview ? (
          <ReviewStep role={role} form={form} cleanedLinks={cleanedLinks()} />
        ) : (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-bold tracking-tight">{step!.title}</h1>
              <p className="text-xs text-muted mt-1">{step!.subtitle}</p>
            </div>

            {step!.fields.map((field) => (
              <FieldRenderer
                key={field.key}
                field={field}
                form={form}
                error={errors[field.key]}
                onText={setField}
                onLink={setLink}
                onAddLink={addLink}
                onRemoveLink={removeLink}
                onSkills={setSkills}
              />
            ))}
          </div>
        )}

        {saveError && (
          <div className="mt-5 p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-xs text-red-300">
            {saveError}
          </div>
        )}

        {/* Actions */}
        <div className="mt-7 flex items-center justify-between gap-3">
          <button
            onClick={goBack}
            disabled={stepIndex === 0 || saving}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-background border border-surface-border text-xs font-semibold text-muted hover:text-foreground transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          <div className="flex items-center gap-2">
            {!onReview && stepOptional && (
              <button
                onClick={skipStep}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-foreground transition disabled:opacity-40"
              >
                Skip
              </button>
            )}
            <button
              onClick={goNext}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-moss hover:bg-[#BEF264] text-background text-sm transition shadow-lg shadow-[#84CC16]/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : onReview ? (
                <>
                  <Check className="w-4 h-4" />
                  Finish & go to dashboard
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ pieces ------------------------------ */

function LabelRow({ label, required }: { label: string; required?: boolean }) {
  return (
    <div className="flex items-center justify-between mb-1">
      <label className="block text-[11px] font-mono font-semibold uppercase text-muted">{label}</label>
      <span
        className={`text-[10px] font-mono uppercase ${
          required ? "text-moss" : "text-muted/60"
        }`}
      >
        {required ? "Required" : "Optional"}
      </span>
    </div>
  );
}

function FieldRenderer({
  field,
  form,
  error,
  onText,
  onLink,
  onAddLink,
  onRemoveLink,
  onSkills,
}: {
  field: FieldDef;
  form: FormState;
  error?: string;
  onText: (key: "name" | "location" | "bio", value: string) => void;
  onLink: (i: number, value: string) => void;
  onAddLink: () => void;
  onRemoveLink: (i: number) => void;
  onSkills: (skills: string[]) => void;
}) {
  const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl bg-background border border-surface-border text-sm text-foreground focus:outline-none focus:border-moss transition";

  if (field.type === "skills") {
    return (
      <div>
        <SkillsPicker label={field.label} value={form.skills} onChange={onSkills} error={error} />
        {field.hint && !error && <p className="mt-1 text-[11px] text-muted">{field.hint}</p>}
      </div>
    );
  }

  return (
    <div>
      <LabelRow label={field.label} required={field.required} />

      {field.type === "text" && (
        <input
          type="text"
          value={form[field.key as "name" | "location"]}
          maxLength={field.maxLength}
          onChange={(e) => onText(field.key as "name" | "location", e.target.value)}
          placeholder={field.placeholder}
          className={inputCls}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          rows={4}
          value={form.bio}
          maxLength={field.maxLength}
          onChange={(e) => onText("bio", e.target.value)}
          placeholder={field.placeholder}
          className={`${inputCls} resize-none`}
        />
      )}

      {field.type === "links" && (
        <div className="space-y-2">
          {form.links.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="url"
                inputMode="url"
                value={link}
                onChange={(e) => onLink(i, e.target.value)}
                placeholder="github.com/you"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => onRemoveLink(i)}
                className="shrink-0 p-2 rounded-lg text-muted hover:text-red-400 hover:bg-background transition"
                aria-label="Remove link"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onAddLink}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-moss hover:text-[#BEF264] transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add another link
          </button>
        </div>
      )}

      {field.hint && !error && <p className="mt-1 text-[11px] text-muted">{field.hint}</p>}
      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

function ReviewStep({
  role,
  form,
  cleanedLinks,
}: {
  role: string;
  form: FormState;
  cleanedLinks: string[];
}) {
  const rows: { label: string; value: string | string[] }[] = [
    { label: "Name", value: form.name.trim() || "—" },
    { label: "Location", value: form.location.trim() || "—" },
    { label: "Bio", value: form.bio.trim() || "—" },
  ];
  if (role === "FREELANCER") {
    rows.push({ label: "Skills", value: form.skills.length ? form.skills : "—" });
  }
  if (role !== "JUROR") rows.push({ label: "Links", value: cleanedLinks.length ? cleanedLinks : "—" });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Looks good?</h1>
        <p className="text-xs text-muted mt-1">
          You can change any of this later from your profile.
        </p>
      </div>
      <div className="rounded-2xl border border-surface-border bg-background divide-y divide-surface-border">
        {rows.map((row) => (
          <div key={row.label} className="p-3.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted mb-1">
              {row.label}
            </div>
            {Array.isArray(row.value) ? (
              <ul className="space-y-1">
                {row.value.map((v) => (
                  <li key={v} className="text-sm text-foreground break-all">
                    {v}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-foreground whitespace-pre-wrap break-words">{row.value}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
