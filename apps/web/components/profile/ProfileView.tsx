"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Save,
  Send,
  Star,
  UserRound,
  Wallet,
} from "lucide-react";
import { getProfile, updateProfile, Profile, formatDate, getAuthToken, ApiError } from "@/lib/api";

const ROLE_LABELS: Record<string, string> = {
  CLIENT: "Client",
  FREELANCER: "Freelancer",
  ADMIN: "Admin",
  JUROR: "Juror",
};

export default function ProfileView() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [portfolioText, setPortfolioText] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  // Load the profile. All state updates happen after an await, so the effect
  // never renders synchronously (mirrors hooks/useApiFetch).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = getAuthToken();
        if (!token) throw new ApiError(401, "Not authenticated");
        const { user } = await getProfile(token);
        if (cancelled) return;
        setProfile(user);
        setName(user.name ?? "");
        setBio(user.bio ?? "");
        setLocation(user.location ?? "");
        setWalletAddress(user.walletAddress ?? "");
        setPortfolioText((user.portfolioLinks ?? []).join(", "));
        setLoadError(null);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof ApiError ? e.message : "Could not load your profile. Please try again.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const token = getAuthToken();
      if (!token) throw new ApiError(401, "Not authenticated");
      const portfolioLinks = portfolioText
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const { user } = await updateProfile(token, {
        name: name.trim(),
        bio: bio.trim(),
        location: location.trim(),
        walletAddress: walletAddress.trim(),
        portfolioLinks,
      });
      setProfile(user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-moss" />
        <p className="text-sm font-mono">Loading profile…</p>
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-surface border border-[#EF4444]/30 rounded-2xl space-y-4 px-6 text-center">
        <AlertCircle className="w-10 h-10 text-[#EF4444]" />
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">Could not load your profile</h3>
          <p className="text-sm text-muted">{loadError || "Profile data is unavailable."}</p>
        </div>
        <button
          onClick={() => {
            setIsLoading(true);
            setReloadTick((t) => t + 1);
          }}
          className="px-5 py-2.5 rounded-xl bg-moss hover:bg-[#BEF264] text-background font-semibold text-xs uppercase tracking-wider transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const roleLabel = ROLE_LABELS[profile.role] || profile.role;
  const initials = (profile.name || profile.email || "U")
    .split(/\s+/)
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="flex-1 w-full mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-col items-start">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">My Profile</h1>
        <p className="text-muted text-sm">
          Manage your profile details, portfolio links, and payout wallet.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-moss/10 border border-moss/30 flex items-center gap-3 text-sm text-moss">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          Profile saved successfully.
        </div>
      )}
      {saveError && (
        <div className="p-4 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center gap-3 text-sm text-[#EF4444]">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {saveError}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Identity header */}
        <div className="bg-surface border border-surface-border rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-8 mb-8 border-b border-surface-border">
            <div className="h-20 w-20 rounded-full bg-background border-4 border-surface-border flex items-center justify-center text-moss text-xl font-extrabold shrink-0">
              {initials}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl font-extrabold tracking-tight text-foreground">{profile.name || "Unnamed"}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-1 rounded-full bg-moss/10 text-moss border border-moss/20">
                  {roleLabel}
                </span>
              </div>
              <div className="text-xs text-muted font-mono">{profile.email}</div>
              <div className="flex items-center gap-4 text-xs text-muted font-mono pt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-[#F59E0B]" />
                  {profile.rating.toFixed(1)} rating
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  {profile.jobsPostedCount} jobs posted
                </span>
                <span className="flex items-center gap-1">
                  <Send className="w-3.5 h-3.5" />
                  {profile.jobsAppliedCount} applications
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Joined {formatDate(profile.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="profile-name" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <UserRound className="w-3.5 h-3.5 text-moss" /> Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl bg-background border border-surface-border focus:border-moss text-sm text-foreground placeholder:text-muted/50 focus:outline-none transition"
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Mail className="w-3.5 h-3.5 text-moss" /> Email
              </label>
              <div className="px-4 py-3 rounded-xl bg-background border border-surface-border text-sm text-muted font-mono opacity-70 cursor-not-allowed">
                {profile.email}
              </div>
              <p className="text-[11px] text-muted">Email is used for sign-in and cannot be changed here.</p>
            </div>

            {/* Role (read-only) */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Briefcase className="w-3.5 h-3.5 text-moss" /> Role
              </label>
              <div className="px-4 py-3 rounded-xl bg-background border border-surface-border text-sm text-foreground opacity-70 cursor-not-allowed">
                {roleLabel} account
              </div>
            </div>

            {/* Wallet address */}
            <div className="space-y-2">
              <label htmlFor="profile-wallet" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Wallet className="w-3.5 h-3.5 text-moss" /> Wallet Address
              </label>
              <input
                id="profile-wallet"
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 rounded-xl bg-background border border-surface-border focus:border-moss text-sm text-foreground placeholder:text-muted/50 focus:outline-none transition font-mono"
              />
              <p className="text-[11px] text-muted">This address is used for marketplace payouts and escrow.</p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label htmlFor="profile-location" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <MapPin className="w-3.5 h-3.5 text-moss" /> Location
              </label>
              <input
                id="profile-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full px-4 py-3 rounded-xl bg-background border border-surface-border focus:border-moss text-sm text-foreground placeholder:text-muted/50 focus:outline-none transition"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label htmlFor="profile-bio" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <UserRound className="w-3.5 h-3.5 text-moss" /> Bio
              </label>
              <textarea
                id="profile-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Tell clients about your experience, specialties, or what you're looking for…"
                className="w-full px-4 py-3 rounded-xl bg-background border border-surface-border focus:border-moss text-sm text-foreground placeholder:text-muted/50 focus:outline-none transition resize-none"
              />
            </div>

            {/* Portfolio links */}
            <div className="space-y-2">
              <label htmlFor="profile-portfolio" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Link2 className="w-3.5 h-3.5 text-moss" /> Portfolio Links
              </label>
              <textarea
                id="profile-portfolio"
                value={portfolioText}
                onChange={(e) => setPortfolioText(e.target.value)}
                rows={2}
                placeholder="https://github.com/you, https://your-site.dev"
                className="w-full px-4 py-3 rounded-xl bg-background border border-surface-border focus:border-moss text-sm text-foreground placeholder:text-muted/50 focus:outline-none transition resize-none font-mono"
              />
              <p className="text-[11px] text-muted">Separate multiple links with commas.</p>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-moss hover:bg-[#BEF264] text-background font-semibold text-xs uppercase tracking-wider transition shadow-md shadow-[#84CC16]/20 disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}
