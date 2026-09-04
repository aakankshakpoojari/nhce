"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Plus,
  X,
  Menu,
  User as UserIcon,
  LogOut
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Post Work", href: "/client/jobs/new" },
  { name: "My Jobs", href: "/client/jobs" },
  { name: "My Projects", href: "/projects" },
  { name: "Browse Talent", href: "/client/freelancers" },
  { name: "Escrow Vaults", href: "/client/escrows" },
  { name: "Swap", href: "/swap" },
  { name: "Wallet", href: "/wallet" },
];

export default function ClientNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const notif = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  // Close the mobile drawer on navigation (render-phase reset on pathname change).
  const [navPrevPath, setNavPrevPath] = useState(pathname);
  if (navPrevPath !== pathname) {
    setNavPrevPath(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  useEffect(() => {
    if (!showNotifications) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowNotifications(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNotifications]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/client" && pathname.startsWith(`${href}/`));

  return (
    <nav className="sticky top-0 z-50 w-full h-20 backdrop-blur-xl bg-background/70 border-b border-surface flex items-center justify-between px-6 sm:px-8">
      {/* Left: Brand */}
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
      </div>

      {/* Navigation Tabs */}
      <nav className="hidden lg:flex items-center justify-center space-x-7 flex-1">
        {NAV_LINKS.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`text-xs font-semibold uppercase tracking-wider transition-all duration-300 hover:text-[#BEF264] relative flex items-center ${
                active ? "text-[#BEF264]" : "text-muted"
              }`}
            >
              {link.name}
              {active && (
                <span className="absolute inset-x-0 -bottom-1.5 h-0.5 rounded-full bg-[#BEF264] shadow-[0_0_8px_rgba(190,242,100,0.8)]"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Right: Notifications, Post Work & Account */}
      <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
        <ThemeToggle />

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="lg:hidden p-2 rounded-xl bg-surface border border-surface-border text-foreground"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        {user && (
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="relative p-2 text-muted hover:text-moss transition-colors duration-300"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notif.unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[#F59E0B] text-[9px] font-bold text-background shadow-[0_0_8px_rgba(245,158,11,0.8)]">
                  {notif.unreadCount > 9 ? "9+" : notif.unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <NotificationPanel
                  notifications={notif.notifications}
                  unreadCount={notif.unreadCount}
                  onMarkRead={notif.markRead}
                  onMarkAllRead={notif.markAllRead}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex items-center gap-2 pl-2 border-l border-surface-border">
          {user && (
            <div className="flex items-center gap-2">
              <Link href="/client/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-xs font-semibold transition-colors cursor-pointer">
                <UserIcon className="w-3.5 h-3.5 text-moss" />
                <span className="hidden lg:inline font-mono">{user.name || user.email?.split("@")[0]}</span>
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
          )}

          <Link
            href="/client/jobs/new"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-moss hover:bg-[#BEF264] text-background transition shadow-sm flex items-center gap-1.5 ml-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Post Work</span>
          </Link>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="lg:hidden absolute top-full inset-x-0 mx-4 mt-2 rounded-2xl border border-surface-border bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/40 p-3 z-50"
          >
            <nav className="flex flex-col">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`py-2.5 px-2 text-sm font-semibold uppercase tracking-wider border-b border-surface-border/60 last:border-0 transition-colors ${
                      active ? "text-[#BEF264]" : "text-muted hover:text-foreground"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
