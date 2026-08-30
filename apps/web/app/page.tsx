"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#060B08] text-emerald-50 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-black">
      {/* Sticky Navigation Header */}
      <header
        className={`sticky top-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300 border-b ${
          scrolled
            ? "border-emerald-900/40 bg-[#060B08]/90 backdrop-blur-md shadow-lg shadow-emerald-950/20"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Logo Placeholder */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-700 flex items-center justify-center text-black font-black text-xs shadow-md shadow-emerald-500/20">
            W3
          </div>

          {/* Dynamic Scroll Brand Name */}
          <span className="font-extrabold text-2xl tracking-tight transition-all duration-300">
            {scrolled ? (
              <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-200 bg-clip-text text-transparent">
                w<span className="text-emerald-400 animate-pulse">3</span>hire
              </span>
            ) : (
              <span className="text-white">
                w<span className="text-emerald-500">E</span>hire
              </span>
            )}
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-emerald-200/70">
          <a href="#features" className="hover:text-emerald-400 transition-colors">
            Cross-Border Escrow
          </a>
          <a href="#identity" className="hover:text-emerald-400 transition-colors">
            DID & Compliance
          </a>
          <a href="#docs" className="hover:text-emerald-400 transition-colors">
            Smart Contracts
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/client/dashboard"
            className="text-sm px-4 py-2 rounded-lg font-semibold text-emerald-300 hover:text-white hover:bg-emerald-950/50 border border-emerald-800/40 transition"
          >
            Client Portal
          </Link>
          <Link
            href="/freelancer/dashboard"
            className="text-sm px-4 py-2 rounded-lg font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 shadow-lg shadow-emerald-500/20 transition"
          >
            Launch App
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center justify-center">
        

        {/* Brand Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          not the actual landing page
        </h1>

        <p className="mt-6 text-lg text-emerald-200/60 max-w-2xl leading-relaxed">
          Powered by smart contract escrows, zero-knowledge compliance, and real-time FX conversions for seamless international payroll.
        </p>

        {/* Dual Portal Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-14 w-full max-w-3xl">
          {/* Client Portal Card (YOUR RESPONSIBILITY) */}
          <Link
            href="/client/dashboard"
            className="group relative p-8 rounded-2xl bg-[#0B130E] border border-emerald-900/50 hover:border-emerald-500/60 transition-all duration-300 text-left hover:shadow-xl hover:shadow-emerald-500/10"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Clients & Hirers
              </span>
              <span className="text-emerald-500 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
              Client Portal
            </h2>
            <p className="text-sm text-emerald-200/60 leading-relaxed">
              Lock funds in smart contract escrows, hire talent verified via Decentralized Identity (DID), and process instant multi-currency conversions.
            </p>
          </Link>

          {/* Freelancer Portal Card (YOUR FRIEND'S RESPONSIBILITY) */}
          <Link
            href="/freelancer/dashboard"
            className="group relative p-8 rounded-2xl bg-[#0B130E] border border-emerald-900/50 hover:border-emerald-500/60 transition-all duration-300 text-left hover:shadow-xl hover:shadow-emerald-500/10"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-green-400 uppercase tracking-widest">
                Gig Economy Talent
              </span>
              <span className="text-green-500 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
              Freelancer Portal
            </h2>
            <p className="text-sm text-emerald-200/60 leading-relaxed">
              Withdraw earnings with near-zero remittance fees (&lt;1%), manage multi-currency balances (USD, EUR, INR), and build on-chain proof of work.
            </p>
          </Link>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-emerald-950 py-6 px-6 text-center text-xs text-emerald-400/50">
        w3hire Platform • Powered by Polygon & Ethereum • Low-Fee Smart Contract Escrow
      </footer>
    </div>
  );
}