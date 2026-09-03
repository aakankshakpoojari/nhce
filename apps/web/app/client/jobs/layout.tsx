"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, LogOut, Plus, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { name: "Dashboard", href: "/client" },
  { name: "My Jobs", href: "/client/jobs" },
  { name: "Marketplace", href: "/bounties" },
];

export default function ClientJobsLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 w-full h-20 backdrop-blur-xl bg-background/70 border-b border-surface flex items-center justify-between px-6 sm:px-8">
        {/* Left: Brand + portal switcher */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link href="/client" className="text-2xl font-bold tracking-tight text-foreground interactive">
            W3HIRE
          </Link>
          <Link
            href="/bounties"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface hover:bg-surface-hover border border-surface-border text-xs font-semibold text-moss transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Switch to Freelancer Portal</span>
          </Link>
        </div>

        {/* Center: routing */}
        <nav className="hidden lg:flex items-center justify-center space-x-8 flex-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href === "/client/jobs" && pathname.startsWith("/client/jobs"));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-[var(--color-muted)] font-medium transition-all duration-300 hover:text-[#BEF264] hover:drop-shadow-[0_0_8px_rgba(190,242,100,0.4)] interactive flex items-center ${
                  isActive ? "text-[#BEF264]" : ""
                }`}
              >
                {link.name}
                {isActive && <span className="ml-1.5 h-2 w-2 rounded-full bg-[#BEF264] shadow-[0_0_6px_rgba(190,242,100,0.8)]" />}
              </Link>
            );
          })}
        </nav>

        {/* Right: actions + user */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
          <ThemeToggle />
          <Link
            href="/client/jobs/new"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-moss hover:bg-[#BEF264] text-background transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Job</span>
          </Link>
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-surface-border">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs font-semibold">
                <UserIcon className="w-3.5 h-3.5 text-moss" />
                <span className="hidden sm:inline font-mono">{user.name || user.email.split("@")[0]}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border bg-moss/10 text-moss border-moss/20">
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
            <Link
              href="/bounties"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-surface hover:bg-surface-hover text-foreground border border-surface-border transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>
      {children}
    </>
  );
}