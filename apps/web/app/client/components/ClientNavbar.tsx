"use client";

import { useState } from "react";
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
} from "lucide-react";

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
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 px-6 py-3.5 border-b border-surface-border bg-surface/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Brand + Client Portal Identifier */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-background border border-surface-border flex items-center justify-center font-black text-sm">
              <span className="text-foreground">W</span>
              <span className="text-moss">3</span>
            </div>
            <span className="font-extrabold text-lg text-foreground tracking-tight">
              W<span className="text-moss">3</span>HIRE
            </span>
          </Link>

          <span className="text-surface-border font-mono">/</span>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-background border border-surface-border text-xs font-mono text-moss">
            <Briefcase className="w-3.5 h-3.5" />
            <span>CLIENT WORKSPACE</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted">
          <Link href="/client" className="text-foreground hover:text-moss transition">
            Overview & Projects
          </Link>
          <Link href="/client/freelancers" className="hover:text-moss transition">
            Browse Talent
          </Link>
          <Link href="/client/escrows" className="hover:text-moss transition">
            Escrow Vaults
          </Link>
        </nav>

        {/* Right: Credits Badge, Notifications, Post Project & Wallet */}
        <div className="flex items-center gap-3">
          
          <ThemeToggle />

          {/* Monthly Credits Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background border border-surface-border text-xs">
            <div className="flex items-center gap-1.5">
              <Zap className={`w-3.5 h-3.5 ${creditsRemaining > 0 ? "text-moss" : "text-[#EF4444]"}`} />
              <span className="font-mono font-semibold text-foreground">
                {isPro ? "PRO Unlimited" : `${creditsRemaining}/${maxCredits} Free Credits`}
              </span>
            </div>
            {!isPro && (
              <button
                onClick={onUpgradeProClick}
                className="text-[11px] font-mono text-[#BEF264] hover:underline flex items-center gap-1 pl-1 border-l border-surface-border"
              >
                Upgrade Pro
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
              className="relative p-2 rounded-xl bg-background hover:bg-surface-hover border border-surface-border text-foreground transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-moss text-background font-mono font-bold text-[10px] flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
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

          {/* Post New Project Button */}
          <button
            onClick={onPostProjectClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-moss hover:bg-[#BEF264] text-background transition shadow-md shadow-[#84CC16]/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Post Work</span>
          </button>

          {/* Connected Wallet Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background border border-surface-border text-xs font-mono text-moss">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span>0x71C...949A</span>
          </div>

        </div>
      </div>
    </header>
  );
}
