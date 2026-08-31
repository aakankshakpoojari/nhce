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
    <header className="sticky top-0 z-40 px-6 py-3.5 border-b border-[#28332D] bg-[#181D1A]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Brand + Client Portal Identifier */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#101312] border border-[#28332D] flex items-center justify-center font-black text-sm">
              <span className="text-[#F5F5F4]">W</span>
              <span className="text-[#84CC16]">3</span>
            </div>
            <span className="font-extrabold text-lg text-[#F5F5F4] tracking-tight">
              W<span className="text-[#84CC16]">3</span>HIRE
            </span>
          </Link>

          <span className="text-[#28332D] font-mono">/</span>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#101312] border border-[#28332D] text-xs font-mono text-[#84CC16]">
            <Briefcase className="w-3.5 h-3.5" />
            <span>CLIENT WORKSPACE</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#A3A3A3]">
          <Link href="/client" className="text-[#F5F5F4] hover:text-[#84CC16] transition">
            Overview & Projects
          </Link>
          <Link href="/client/freelancers" className="hover:text-[#84CC16] transition">
            Browse Talent
          </Link>
          <Link href="/client/escrows" className="hover:text-[#84CC16] transition">
            Escrow Vaults
          </Link>
        </nav>

        {/* Right: Credits Badge, Notifications, Post Project & Wallet */}
        <div className="flex items-center gap-3">
          
          {/* Monthly Credits Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101312] border border-[#28332D] text-xs">
            <div className="flex items-center gap-1.5">
              <Zap className={`w-3.5 h-3.5 ${creditsRemaining > 0 ? "text-[#84CC16]" : "text-[#EF4444]"}`} />
              <span className="font-mono font-semibold text-[#F5F5F4]">
                {isPro ? "PRO Unlimited" : `${creditsRemaining}/${maxCredits} Free Credits`}
              </span>
            </div>
            {!isPro && (
              <button
                onClick={onUpgradeProClick}
                className="text-[11px] font-mono text-[#BEF264] hover:underline flex items-center gap-1 pl-1 border-l border-[#28332D]"
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
              className="relative p-2 rounded-xl bg-[#101312] hover:bg-[#222925] border border-[#28332D] text-[#F5F5F4] transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#84CC16] text-[#101312] font-mono font-bold text-[10px] flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#181D1A] border border-[#28332D] shadow-2xl p-4 z-50 text-[#F5F5F4]">
                <div className="flex items-center justify-between border-b border-[#28332D] pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-[#84CC16]" />
                    <span className="text-xs font-bold uppercase tracking-wider">Application Alerts</span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[#A3A3A3] hover:text-[#F5F5F4]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#A3A3A3]">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border text-xs space-y-1 transition ${
                          n.read
                            ? "bg-[#101312]/50 border-[#28332D]/50 text-[#A3A3A3]"
                            : "bg-[#101312] border-[#84CC16]/40 text-[#F5F5F4]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#84CC16]">{n.projectTitle}</span>
                          <span className="text-[10px] text-[#A3A3A3] font-mono">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[#A3A3A3]">{n.text}</p>
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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#84CC16] hover:bg-[#BEF264] text-[#101312] transition shadow-md shadow-[#84CC16]/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Post Work</span>
          </button>

          {/* Connected Wallet Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101312] border border-[#28332D] text-xs font-mono text-[#84CC16]">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span>0x71C...949A</span>
          </div>

        </div>
      </div>
    </header>
  );
}
