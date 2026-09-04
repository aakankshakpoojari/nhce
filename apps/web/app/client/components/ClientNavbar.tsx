"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Plus,
  X,
  User as UserIcon,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface ClientNavbarProps {
  notifications: Array<{ id: string; text: string; time: string; read: boolean; projectTitle: string }>;
  onMarkNotificationsRead: () => void;
}

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Post Work", href: "/client/jobs/new" },
  { name: "My Jobs", href: "/client/jobs" },
  { name: "My Projects", href: "/projects" },
  { name: "Browse Talent", href: "/client/freelancers" },
  { name: "Escrow Vaults", href: "/client/escrows" },
  { name: "Swap", href: "/swap" },
  { name: "Stablecoins", href: "/stablecoins" },
  { name: "Wallet", href: "/wallet" },
];

export default function ClientNavbar({
  notifications,
  onMarkNotificationsRead,
}: ClientNavbarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const notificationRef = useRef<HTMLDivElement | null>(null);

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
      <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (unreadCount > 0) onMarkNotificationsRead();
            }}
            className="relative p-2 text-muted hover:text-moss transition-colors duration-300"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
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
    </nav>
  );
}
