"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import { AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Briefcase, LogOut, User as UserIcon } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const navLinks = [
    { name: "Marketplace", href: "/bounties" },
    { name: "Applications", href: "/applications" },
    { name: "Projects", href: "/projects" },
    { name: "Messages", href: "/messages" },
    { name: "Community", href: "/community" },
    { name: "Swap", href: "/swap" },
    { name: "Wallet", href: "/wallet" },
  ];

  // A route is active when the current pathname is exactly the link href or a child of it.
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Helper to determine where the profile pill should navigate based on role
  const getProfileRoute = (role: string) => {
    if (role === "CLIENT") return "/client/profile";
    if (role === "ADMIN") return "/admin/dashboard";
    return "/profile"; // Default for FREELANCER
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full h-20 backdrop-blur-xl bg-background/70 border-b border-surface flex items-center justify-between px-6 sm:px-8">
        {/* Left: Logo */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link href="/" className="text-2xl font-bold tracking-tight text-foreground flex items-center group border-none outline-none">
            <span>W3</span>
            <span className="flex overflow-hidden max-w-0 group-hover:max-w-[100px] transition-all duration-500 ease-in-out">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-[50ms]">H</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-[100ms]">I</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-[150ms]">R</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-[200ms]">E</span>
            </span>
          </Link>

          {/* Quick Portal Switcher */}
          <Link
            href="/client"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface hover:bg-surface-hover border border-surface-border text-xs font-semibold text-moss transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Switch to Client Portal</span>
          </Link>
        </div>

        {/* Center: Routing */}
        <div className="hidden lg:flex items-center justify-center space-x-8 flex-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-[var(--color-muted)] font-medium transition-all duration-300 var(--ease-fluid) hover:text-[#BEF264] hover:drop-shadow-[0_0_8px_rgba(190,242,100,0.4)] interactive relative flex items-center ${
                  active ? "text-[#BEF264] drop-shadow-[0_0_8px_rgba(190,242,100,0.4)]" : ""
                }`}
              >
                {link.name}
                {active && (
                  <span className="absolute inset-x-0 -bottom-1.5 h-0.5 rounded-full bg-[#BEF264] shadow-[0_0_8px_rgba(190,242,100,0.8)]"></span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Notifications & User Auth */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-[var(--color-muted)] hover:text-[#BEF264] transition-colors duration-300 interactive"
            >
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            </button>

            <AnimatePresence>
              {showNotifications && (
                <NotificationPanel onClose={() => setShowNotifications(false)} />
              )}
            </AnimatePresence>
          </div>

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-surface-border">
              <Link
                href={getProfileRoute(user.role)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-xs font-semibold transition-colors cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-moss" />
                <span className="hidden sm:inline font-mono">{user.name || user.email.split("@")[0]}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-moss/10 text-moss border border-moss/20">
                  {user.role}
                </span>
              </Link>
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
                  setAuthMode("signin"); // Modal handles the UI to toggle between Sign In / Sign Up
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-moss hover:bg-[#BEF264] text-background transition shadow-sm"
              >
                Sign In / Sign Up
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