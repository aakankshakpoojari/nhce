"use client";

import { useState } from "react";
import Link from "next/link";
import { BellIcon } from "@heroicons/react/24/outline";
import { useRole } from "@/contexts/RoleContext";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import { AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { isClient, setIsClient } = useRole();
  const [showNotifications, setShowNotifications] = useState(false);

  const navLinks = [
    { name: "Bounties", href: "/bounties" },
    { name: "Projects", href: "/projects" },
    { name: "Community", href: "/community" },
    { name: "Wallet", href: "/wallet" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full h-20 backdrop-blur-xl bg-[#101312]/70 border-b border-[#181D1A] flex items-center justify-between px-8">
      {/* Left: Logo */}
      <div className="flex-shrink-0">
        <Link href="/" className="text-2xl font-bold tracking-tight text-[#F5F5F4] interactive">
          W3HIRE
        </Link>
      </div>

      {/* Center: Routing */}
      <div className="hidden md:flex items-center justify-center space-x-10 flex-1">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="text-[var(--color-muted)] font-medium transition-all duration-300 var(--ease-fluid) hover:text-[#BEF264] hover:drop-shadow-[0_0_8px_rgba(190,242,100,0.4)] interactive"
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Right: Notifications & Role Toggle */}
      <div className="flex items-center space-x-8 flex-shrink-0">
        {/* Role Toggle Switch */}
        <div className="flex items-center space-x-2 bg-[#181D1A] p-1.5 rounded-full border border-white/5 shadow-inner">
          <button
            onClick={() => setIsClient(false)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-500 var(--ease-fluid) interactive ${
              !isClient 
                ? "bg-[#84CC16] text-[#101312] shadow-[0_0_15px_rgba(132,204,22,0.5)]" 
                : "text-[var(--color-muted)] hover:text-[#F5F5F4]"
            }`}
          >
            Freelancer
          </button>
          <button
            onClick={() => setIsClient(true)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-500 var(--ease-fluid) interactive ${
              isClient 
                ? "bg-[#84CC16] text-[#101312] shadow-[0_0_15px_rgba(132,204,22,0.5)]" 
                : "text-[var(--color-muted)] hover:text-[#F5F5F4]"
            }`}
          >
            Client
          </button>
        </div>

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
      </div>
    </nav>
  );
}
