"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon } from "@heroicons/react/24/outline";
import {
  UserCheck,
  LogOut,
  User as UserIcon,
  Zap,
  Plus,
  X,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

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
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const clientNavLinks = [
    { name: "Overview & Projects", href: "/client" },
    { name: "Browse Talent", href: "/client/freelancers" },
    { name: "Escrow Vaults", href: "/client#escrows" },
    { name: "Marketplace", href: "/bounties" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full h-20 backdrop-blur-xl bg-background/70 border-b border-surface flex items-center justify-between px-6 sm:px-8">
        {/* Left: Brand + Quick Switcher */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link href="/" className="text-2xl font-bold tracking-tight text-foreground interactive">
            W3HIRE
          </Link>

          {/* Quick Portal Switcher to Freelancer Portal */}
          <Link
            href="/bounties"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface hover:bg-surface-hover border border-surface-border text-xs font-semibold text-moss transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Switch to Freelancer Portal</span>
          </Link>
        </div>

        {/* Center: Routing Links */}
        <div className="hidden lg:flex items-center justify-center space-x-8 flex-1">
          {clientNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-[var(--color-muted)] font-medium transition-all duration-300 var(--ease-fluid) hover:text-[#BEF264] hover:drop-shadow-[0_0_8px_rgba(190,242,100,0.4)] interactive relative flex items-center ${
                  isActive ? "text-[#BEF264]" : ""
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="ml-1.5 h-2 w-2 rounded-full bg-[#BEF264] shadow-[0_0_6px_rgba(190,242,100,0.8)]"></span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Actions, Credits, Notifications, User Auth */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
          <ThemeToggle />

          {/* Credits Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs">
            <Zap className={`w-3.5 h-3.5 ${creditsRemaining > 0 ? "text-moss" : "text-[#EF4444]"}`} />
            <span className="font-mono font-semibold text-foreground">
              {isPro ? "PRO" : `${creditsRemaining}/${maxCredits} Credits`}
            </span>
            {!isPro && (
              <button
                onClick={onUpgradeProClick}
                className="text-[11px] font-mono text-[#BEF264] hover:underline pl-1.5 border-l border-surface-border"
              >
                Upgrade
              </button>
            )}
          </div>

          {/* Post Work CTA */}
          <button
            onClick={onPostProjectClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-moss hover:bg-[#BEF264] text-background transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Work</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && unreadCount > 0) {
                  onMarkNotificationsRead();
                }
              }}
              className="relative p-2 text-[var(--color-muted)] hover:text-[#BEF264] transition-colors duration-300 interactive"
              title="Notifications"
            >
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-surface border border-surface-border shadow-2xl p-4 z-50 text-foreground backdrop-blur-3xl"
                >
                  <div className="flex items-center justify-between border-b border-surface-border pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase font-mono tracking-wider text-moss">
                        Client Alerts
                      </span>
                      {unreadCount > 0 && (
                        <span className="bg-moss/20 text-moss text-[10px] font-mono px-1.5 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-muted hover:text-foreground p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
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
                              ? "bg-background/40 border-surface-border/50 text-muted"
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-surface-border">
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="px-2.5 py-1 rounded-xl bg-purple-950/50 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold hover:bg-purple-900/60 transition"
                >
                  Admin Console
                </Link>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs font-semibold">
                <UserIcon className="w-3.5 h-3.5 text-moss" />
                <span className="hidden sm:inline font-mono">{user.name || user.email.split("@")[0]}</span>
                <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                  user.role === "ADMIN"
                    ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                    : "bg-moss/10 text-moss border-moss/20"
                }`}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl bg-surface hover:bg-red-950/30 text-muted hover:text-red-400 border border-surface-border transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthMode("signin");
                  setIsAuthModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-surface hover:bg-surface-hover text-foreground border border-surface-border transition"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode("signup");
                  setIsAuthModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-moss hover:bg-[#BEF264] text-background transition shadow-sm"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}
