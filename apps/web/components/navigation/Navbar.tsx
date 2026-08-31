"use client";

import { useState } from "react";
import Link from "next/link";
import { BellIcon } from "@heroicons/react/24/outline";

import NotificationPanel from "@/components/notifications/NotificationPanel";
import { AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);

  const navLinks = [
    { name: "Marketplace", href: "/bounties" },
    { name: "Applications", href: "/applications" },
    { name: "Projects", href: "/projects" },
    { name: "Community", href: "/community" },
    { name: "Wallet", href: "/wallet" },
    { name: "Profile", href: "/profile" },
    { name: "Pro", href: "/pro", isPremium: true },
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
            className={`text-[var(--color-muted)] font-medium transition-all duration-300 var(--ease-fluid) hover:text-[#BEF264] hover:drop-shadow-[0_0_8px_rgba(190,242,100,0.4)] interactive relative flex items-center ${
              link.isPremium ? "text-[#BEF264]" : ""
            }`}
          >
            {link.name}
            {link.isPremium && (
              <span className="ml-1.5 h-2 w-2 rounded-full bg-[#BEF264] shadow-[0_0_6px_rgba(190,242,100,0.8)]"></span>
            )}
          </Link>
        ))}
      </div>

      {/* Right: Notifications & Role Toggle */}
      <div className="flex items-center space-x-8 flex-shrink-0">


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
