"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Lock,
  ArrowRight,
  Briefcase,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import MetaMaskModal from "@/components/metamask-modal";

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedRole, setSelectedRole] = useState<"client" | "freelancer" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);

  // Intro spin state (scroll is locked until 360 spin finishes)
  const [isIntroSpinning, setIsIntroSpinning] = useState(true);
  const [introRotation, setIntroRotation] = useState(0);

  useEffect(() => {
    // 1. Initial 360-degree horizontal spin execution
    const startTime = performance.now();
    const duration = 1600; // 1.6 seconds for initial spin

    const animateIntroSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth ease-out curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentDeg = easeOut * 360;
      setIntroRotation(currentDeg);

      if (progress < 1) {
        requestAnimationFrame(animateIntroSpin);
      } else {
        setIsIntroSpinning(false);
      }
    };

    const animId = requestAnimationFrame(animateIntroSpin);

    // 2. Prevent user scrolling while intro is running
    const handleWheel = (e: WheelEvent) => {
      if (isIntroSpinning) {
        e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isIntroSpinning) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isIntroSpinning]);

  // Handle scroll and mouse parallax once unlocked
  useEffect(() => {
    const handleScroll = () => {
      if (!isIntroSpinning) {
        setScrollY(window.scrollY);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 16;
      const y = (e.clientY / innerHeight - 0.5) * -16;
      setMousePos({ x, y });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isIntroSpinning]);

  // Active rotation angle: intro animation value if spinning, or continuous scroll rotation afterwards
  const activeRotation = isIntroSpinning
    ? introRotation
    : (introRotation + scrollY * 0.9) % 360;

  const handleRoleSelect = (role: "client" | "freelancer") => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  return (
    <div
      className={`min-h-screen bg-transparent text-[#F5F5F4] flex flex-col justify-between selection:bg-[#84CC16] selection:text-[#101312] ${
        isIntroSpinning ? "overflow-hidden h-screen select-none" : "overflow-x-hidden"
      }`}
    >
      
      {/* Minimal Header */}
      <header
        className={`sticky top-0 z-40 px-6 py-4 flex items-center justify-between transition-all duration-300 ${
          scrollY > 20
            ? "border-b border-[#28332D] bg-[#101312]/95 backdrop-blur-xl shadow-xl shadow-black/40"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        {/* Brand Logo with 3D Spinning '3' */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#181D1A] border border-[#28332D] flex items-center justify-center group-hover:border-[#84CC16]/60 transition-colors shadow-md">
            <div className="flex items-center font-black text-lg">
              <span className="text-[#F5F5F4]">W</span>
              <div
                className="inline-block transform-style-3d text-[#84CC16] transition-transform duration-75"
                style={{ transform: `rotateY(${activeRotation}deg)` }}
              >
                3
              </div>
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#F5F5F4] flex items-center">
            W
            <span
              className="inline-block text-[#84CC16] transform-style-3d transition-transform duration-75 font-mono"
              style={{ transform: `rotateY(${activeRotation}deg)` }}
            >
              3
            </span>
            HIRE
          </span>
        </Link>

        {/* Minimal Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A3A3A3]">
          <a href="#portals" className="hover:text-[#84CC16] transition-colors">
            Get Started
          </a>
          <a href="#how-it-works" className="hover:text-[#84CC16] transition-colors">
            How It Works
          </a>
        </nav>

        {/* Single Wallet Action Button */}
        <div>
          {connectedAccount ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181D1A] border border-[#28332D] text-xs font-mono text-[#84CC16]">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span>{`${connectedAccount.slice(0, 6)}...${connectedAccount.slice(-4)}`}</span>
            </div>
          ) : (
            <button
              onClick={() => handleRoleSelect("client")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#181D1A] hover:bg-[#84CC16] text-[#F5F5F4] hover:text-[#101312] border border-[#28332D] hover:border-[#84CC16] transition-all shadow-md group"
            >
              <svg className="w-4 h-4" viewBox="0 0 318.6 318.6" fill="none">
                <path d="M274.1 35.5L174.6 109.4L193 65.8L274.1 35.5Z" fill="#E2761B" />
                <path d="M44.4 35.5L143.9 109.4L125.5 65.8L44.4 35.5Z" fill="#E4761B" />
                <path d="M159.3 190.1L144.1 164.6L140.6 230.9L159.3 221.7L177.9 230.9L174.5 164.6L159.3 190.1Z" fill="#E4751F" />
              </svg>
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center">
        <section className="w-full max-w-4xl mx-auto px-6 pt-20 pb-20 flex flex-col items-center text-center relative">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#84CC16]/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* 3D Spinning Brand Heading (Controlled by initial spin, then scroll) */}
          <div
            className="perspective-1000 my-2 transition-transform duration-150 ease-out"
            style={{
              transform: `rotateX(${mousePos.y * 0.4}deg) rotateY(${mousePos.x * 0.4}deg)`,
            }}
          >
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-[#F5F5F4] flex items-center justify-center select-none leading-none">
              <span>W</span>
              <span
                className="inline-block text-[#84CC16] transform-style-3d cursor-pointer mx-1 transition-transform duration-75"
                style={{
                  transform: `rotateY(${activeRotation}deg)`,
                  filter: "drop-shadow(0 0 35px rgba(132, 204, 22, 0.45))",
                }}
              >
                3
              </span>
              <span>HIRE</span>
            </h1>
          </div>

          <p className="mt-8 text-xl sm:text-2xl text-[#F5F5F4] font-medium max-w-xl leading-snug">
            Work on-chain. Get paid instantly. No middlemen.
          </p>

          {/* Status Prompt (Locked during intro spin, unlocked after 360 deg) */}
          <div className="mt-12">
            {isIntroSpinning ? (
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#84CC16] bg-[#181D1A] px-4 py-2 rounded-full border border-[#84CC16]/40 animate-pulse shadow-md">
                <span className="w-2 h-2 rounded-full bg-[#84CC16] animate-ping" />
                <span>Initializing W3HIRE Core...</span>
              </div>
            ) : (
              <a
                href="#portals"
                className="inline-flex items-center gap-2 text-xs font-mono text-[#A3A3A3] hover:text-[#84CC16] transition-colors bg-[#181D1A]/80 px-4 py-2 rounded-full border border-[#28332D]"
              >
                <span>Scroll to select role</span>
                <ChevronDown className="w-4 h-4 animate-bounce text-[#84CC16]" />
              </a>
            )}
          </div>
        </section>

        {/* 2 MAIN ROLE BOXES (MetaMask Inspired) */}
        <section id="portals" className="w-full max-w-4xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* BOX 1: CLIENT */}
            <div
              onClick={() => handleRoleSelect("client")}
              className="group cursor-pointer rounded-3xl bg-[#181D1A]/90 backdrop-blur-md border-2 border-[#28332D] hover:border-[#84CC16] transition-all duration-300 p-8 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_35px_rgba(132,204,22,0.18)] hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#101312] border border-[#28332D] group-hover:border-[#84CC16]/60 flex items-center justify-center text-[#84CC16] transition-colors">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#101312] border border-[#28332D] text-[#84CC16]">
                    HIRER
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-[#F5F5F4] group-hover:text-[#BEF264] transition-colors">
                    I want to hire
                  </h3>
                  <p className="text-xs text-[#A3A3A3] mt-1.5 leading-relaxed">
                    Post projects, receive applications, and hire talent with smart escrow protection.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <button className="w-full py-3 px-4 rounded-xl font-semibold bg-[#101312] group-hover:bg-[#84CC16] text-[#F5F5F4] group-hover:text-[#101312] border border-[#28332D] group-hover:border-[#84CC16] transition-all flex items-center justify-center gap-2 text-sm">
                  <span>Sign in as Client</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* BOX 2: FREELANCER */}
            <div
              onClick={() => handleRoleSelect("freelancer")}
              className="group cursor-pointer rounded-3xl bg-[#181D1A]/90 backdrop-blur-md border-2 border-[#28332D] hover:border-[#22C55E] transition-all duration-300 p-8 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_35px_rgba(34,197,94,0.18)] hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#101312] border border-[#28332D] group-hover:border-[#22C55E]/60 flex items-center justify-center text-[#22C55E] transition-colors">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#101312] border border-[#28332D] text-[#22C55E]">
                    TALENT
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-[#F5F5F4] group-hover:text-[#22C55E] transition-colors">
                    I want to work
                  </h3>
                  <p className="text-xs text-[#A3A3A3] mt-1.5 leading-relaxed">
                    Apply to verified client projects and earn with instant, guaranteed escrow releases.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <button className="w-full py-3 px-4 rounded-xl font-semibold bg-[#84CC16] group-hover:bg-[#BEF264] text-[#101312] transition-all flex items-center justify-center gap-2 text-sm shadow-md">
                  <span>Sign in as Freelancer</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* HOW CLIENT & FREELANCER WORK */}
        <section id="how-it-works" className="w-full max-w-4xl mx-auto px-6 py-16 border-t border-[#28332D]/70">
          <div className="text-center max-w-lg mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#84CC16]">
              Platform Mechanics
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F4] mt-2">
              How It Works for Clients & Freelancers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* CLIENT WORKFLOW CARD */}
            <div className="rounded-2xl bg-[#181D1A]/90 backdrop-blur-md border border-[#28332D] p-6 space-y-5">
              <div className="flex items-center gap-2 text-[#84CC16] font-mono text-xs uppercase tracking-wider font-semibold border-b border-[#28332D] pb-3">
                <Briefcase className="w-4 h-4" />
                <span>For Clients</span>
              </div>

              <div className="space-y-4 text-xs text-[#A3A3A3]">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#101312] border border-[#28332D] text-[#84CC16] flex items-center justify-center font-mono font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <span className="text-[#F5F5F4] font-semibold block">3 Free Monthly Project Credits</span>
                    Post up to 3 projects every month for free. Specify budget in both USD and INR. Need more? Upgrade anytime to Pro.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#101312] border border-[#28332D] text-[#84CC16] flex items-center justify-center font-mono font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <span className="text-[#F5F5F4] font-semibold block">Instant Application Alerts</span>
                    Get notified every time a freelancer applies to your project with real-time applicant feeds.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#101312] border border-[#28332D] text-[#84CC16] flex items-center justify-center font-mono font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <span className="text-[#F5F5F4] font-semibold block">Smart Filter & Escrow Lock</span>
                    Filter candidates by skill sets, Pro badge status, and ratings. Choose the best builder and lock escrow safely.
                  </div>
                </div>
              </div>
            </div>

            {/* FREELANCER WORKFLOW CARD */}
            <div className="rounded-2xl bg-[#181D1A]/90 backdrop-blur-md border border-[#28332D] p-6 space-y-5">
              <div className="flex items-center gap-2 text-[#22C55E] font-mono text-xs uppercase tracking-wider font-semibold border-b border-[#28332D] pb-3">
                <UserCheck className="w-4 h-4" />
                <span>For Freelancers</span>
              </div>

              <div className="space-y-4 text-xs text-[#A3A3A3]">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#101312] border border-[#28332D] text-[#22C55E] flex items-center justify-center font-mono font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <span className="text-[#F5F5F4] font-semibold block">3 Free Monthly Job Takes</span>
                    Apply to and take on up to 3 projects per month at zero cost.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#101312] border border-[#28332D] text-[#22C55E] flex items-center justify-center font-mono font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <span className="text-[#F5F5F4] font-semibold block">Earn the PRO Badge</span>
                    Qualify for Pro subscription by maintaining a minimum 4.0/5.0 rating, verified skills, and flawless delivery on past work.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#101312] border border-[#28332D] text-[#22C55E] flex items-center justify-center font-mono font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <span className="text-[#F5F5F4] font-semibold block">Instant Escrow Release</span>
                    Deliver milestones with 100% peace of mind. Funds release straight to your wallet with no remittance cuts.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#28332D] py-8 px-6 bg-[#181D1A]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A3A3A3]">
          <div className="flex items-center gap-2 font-bold text-[#F5F5F4]">
            <span>W<span className="text-[#84CC16]">3</span>HIRE</span>
          </div>
          <div className="font-mono text-[11px]">
            © 2026 W3HIRE Protocol
          </div>
        </div>
      </footer>

      {/* MetaMask Auth Modal */}
      <MetaMaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        role={selectedRole}
        onSuccess={(acc) => setConnectedAccount(acc)}
      />
    </div>
  );
}
