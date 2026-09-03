"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Bell,
  Sparkles,
  Zap,
  Plus,
  Layers,
  ShieldCheck,
  CheckCircle2,
  X,
  CreditCard,
  UserCheck,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface ClientNavbarProps {
  creditsRemaining: number;
  maxCredits: number;
  isPro: boolean;
  onPostProjectClick: () => void;
  onUpgradeProClick: () => void;
  notifications: Array<{ id: string; text: string; time: string; read: boolean; projectTitle: string }>;
  onMarkNotificationsRead: () => void;
}

export default function ClientNavbar({
  creditsRemaining,
  maxCredits,
  isPro,
  onPostProjectClick,
  onUpgradeProClick,
  notifications,
  onMarkNotificationsRead,
}: ClientNavbarProps) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const morphSequence = ["3", "E", "$"];
  const [morphIndex, setMorphIndex] = useState(0);

  useEffect(() => {
    const morphTimer = setInterval(() => {
      setMorphIndex((prev) => (prev + 1) % morphSequence.length);
    }, 1000);
    return () => clearInterval(morphTimer);
  }, []);

  const currentMorphChar = morphSequence[morphIndex];

  return (
    <nav className="sticky top-0 z-50 w-full h-20 backdrop-blur-xl bg-background/70 border-b border-surface flex items-center justify-between px-6 sm:px-8">
        
        {/* Left: Brand + Client Portal Identifier + Freelancer Switcher */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link href="/" className="text-2xl font-bold tracking-tight text-foreground interactive flex items-center group">
            <span>W{currentMorphChar}</span>
            <span className="flex overflow-hidden max-w-0 group-hover:max-w-[100px] transition-all duration-500 ease-in-out">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-[50ms]">H</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-[100ms]">I</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-[150ms]">R</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-[200ms]">E</span>
            </span>
          </Link>

          <Link
            href="/bounties"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface hover:bg-surface-hover border border-surface-border text-xs font-semibold text-moss transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Switch to Freelancer Portal</span>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center justify-center space-x-8 flex-1">
          <Link href="/client" className="text-[var(--color-muted)] font-medium transition-all duration-300 var(--ease-fluid) hover:text-[#BEF264] hover:drop-shadow-[0_0_8px_rgba(190,242,100,0.4)] interactive relative flex items-center">
            Overview & Projects
          </Link>
          <Link href="/client/freelancers" className="text-[var(--color-muted)] font-medium transition-all duration-300 var(--ease-fluid) hover:text-[#BEF264] hover:drop-shadow-[0_0_8px_rgba(190,242,100,0.4)] interactive relative flex items-center">
            Browse Talent
          </Link>
          <Link href="/client/escrows" className="text-[var(--color-muted)] font-medium transition-all duration-300 var(--ease-fluid) hover:text-[#BEF264] hover:drop-shadow-[0_0_8px_rgba(190,242,100,0.4)] interactive relative flex items-center">
            Escrow Vaults
          </Link>
        </nav>

        {/* Right: Credits Badge, Notifications, Post Project & Wallet */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
          
          <ThemeToggle />

          {/* Monthly Credits Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <Zap className={`w-3.5 h-3.5 ${creditsRemaining > 0 ? "text-[#BEF264]" : "text-[#EF4444]"}`} />
              <span className="font-mono text-foreground">
                {isPro ? "PRO Unlimited" : `${creditsRemaining}/${maxCredits} Credits`}
              </span>
            </div>
            {!isPro && (
              <button
                onClick={onUpgradeProClick}
                className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#BEF264]/10 text-[#BEF264] border border-[#BEF264]/20 hover:bg-[#BEF264]/20 transition-colors ml-1"
              >
                Upgrade
              </button>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (unreadCount > 0) onMarkNotificationsRead();
              }}
              className="relative p-2 text-[var(--color-muted)] hover:text-[#BEF264] transition-colors duration-300 interactive"
              title="Notifications"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface border border-surface-border shadow-2xl p-4 z-50 text-foreground">
                <div className="flex items-center justify-between border-b border-surface-border pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-moss" />
                    <span className="text-xs font-bold uppercase tracking-wider">Application Alerts</span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-muted hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border text-xs space-y-1 transition ${
                          n.read
                            ? "bg-background/50 border-surface-border/50 text-muted"
                            : "bg-background border-moss/40 text-foreground"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-moss">{n.projectTitle}</span>
                          <span className="text-[10px] text-muted font-mono">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-muted">{n.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-surface-border">
            {/* User Profile Pill */}
            {user && (
              <Link href="/client/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-xs font-semibold transition-colors cursor-pointer">
                <UserIcon className="w-3.5 h-3.5 text-moss" />
                <span className="hidden lg:inline font-mono">{user.name || user.email.split("@")[0]}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-moss/10 text-moss border border-moss/20">
                  CLIENT
                </span>
              </Link>
            )}

            {/* Connected Wallet Pill */}
            {user?.walletAddress ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#BEF264] shadow-[0_0_6px_rgba(190,242,100,0.8)]" />
                <span className="font-mono">{`${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>No Wallet</span>
              </div>
            )}

            {/* Post New Project Button */}
            <button
              onClick={onPostProjectClick}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-moss hover:bg-[#BEF264] text-background transition shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Post Work</span>
            </button>
          </div>

        </div>
      </nav>
  );
}

