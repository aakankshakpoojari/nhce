"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  ArrowRight,
  Briefcase,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Zap,
  Globe,
  DollarSign,
  TrendingUp,
  Award,
  Layers,
  HelpCircle,
  X,
  CreditCard,
  Building2,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MetaMaskModal from "@/components/metamask-modal";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

export default function LandingPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedRole, setSelectedRole] = useState<"client" | "freelancer" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState<"CLIENT" | "FREELANCER">("FREELANCER");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [isThreeHovered, setIsThreeHovered] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Intro spin state (scroll is locked until initial 360 spin finishes)
  const [isIntroSpinning, setIsIntroSpinning] = useState(true);
  const [introRotation, setIntroRotation] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 1400; // 1.4 seconds for initial spin

    const animateIntroSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
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

    const handleWheel = (e: WheelEvent) => {
      if (isIntroSpinning) e.preventDefault();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isIntroSpinning) e.preventDefault();
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isIntroSpinning]);

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

  // Rotation math for interactive 3D text
  const activeRotation = isIntroSpinning
    ? introRotation
    : (introRotation + scrollY * 0.8) % 360;

  // Compute scroll offset for W3 (moves top-left) & HIRE (moves top-right)
  const scrollOffset = Math.min(scrollY / 250, 1);
  const w3X = -scrollOffset * 180;
  const w3Y = -scrollOffset * 40;
  const hireX = scrollOffset * 180;
  const hireY = -scrollOffset * 40;

  const handleRoleAuth = (role: "client" | "freelancer") => {
    setAuthInitialRole(role === "client" ? "CLIENT" : "FREELANCER");
    setAuthMode("signin");
    setIsAuthModalOpen(true);
  };

  const handleRoleSelect = (role: "client" | "freelancer") => {
    setSelectedRole(role);
    setAuthInitialRole(role === "client" ? "CLIENT" : "FREELANCER");
    setAuthMode("signin");
    setIsAuthModalOpen(true);
  };

  // Recent Live Bounties Feed Data
  const recentBounties = [
    { title: "Frontend Developer Needed", amount: "$1,200", status: "Escrowed", tag: "React / Next.js", time: "2m ago" },
    { title: "Smart Contract Audit", amount: "$3,500", status: "Settled in 2.4s", tag: "Solidity", time: "8m ago" },
    { title: "Solana Rust Architect", amount: "$4,500", status: "Escrowed", tag: "Rust / Anchor", time: "14m ago" },
    { title: "UI/UX Mobile Redesign", amount: "$1,850", status: "Settled in 1.9s", tag: "Figma", time: "22m ago" },
    { title: "Zero Knowledge Circuit Dev", amount: "$6,000", status: "Escrowed", tag: "Circom / ZK", time: "35m ago" },
  ];

  // FAQ Items
  const faqList = [
    {
      q: "How does automated smart contract escrow work?",
      a: "When a client posts a bounty or hires talent, the project funds are deposited directly into a neutral, code-enforced smart contract. The funds remain locked safely until work is completed and approved. Neither party can unilaterally tamper with or revoke locked escrow funds.",
    },
    {
      q: "Can I explore W3HIRE without connecting a Web3 wallet initially?",
      a: "Yes! You can sign up or sign in using standard email and password via JWT, browse both Client and Freelancer portals, manage applications, and review bounties. You can link your Web3 wallet address anytime in your profile to execute on-chain escrow releases.",
    },
    {
      q: "How does W3HIRE eliminate 15-20% platform fees?",
      a: "Traditional platforms rely on heavy human payment intermediaries and banking remittance networks. W3HIRE operates on decentralized smart contract rails, charging less than 1% gas-only protocol fees, allowing freelancers to keep 99%+ of their earnings.",
    },
    {
      q: "What multi-currency options are supported?",
      a: "W3HIRE natively supports multi-currency view and settlements in USD, EUR, INR, as well as major crypto assets (USDC, USDT, ETH, SOL) with zero hidden banking conversion spreads.",
    },
    {
      q: "What is Decentralized Identity (DID) and how does it prevent fraud?",
      a: "Decentralized Identity (DID) is a cryptographically signed reputation badge tied to your account. It verifies your delivered milestones, client ratings, and technical credentials on-chain, creating a zero-fraud ecosystem immune to fake profiles or manipulated reviews.",
    },
  ];

  return (
    <div
      className={`min-h-screen bg-transparent text-foreground flex flex-col justify-between selection:bg-moss selection:text-background ${
        isIntroSpinning ? "overflow-hidden h-screen select-none" : "overflow-x-hidden"
      }`}
    >
      {/* Sticky Top Header */}
      <header
        className={`sticky top-0 z-40 px-6 py-4 flex items-center justify-between transition-all duration-300 ${
          scrollY > 20
            ? "border-b border-surface-border bg-background/90 backdrop-blur-xl shadow-2xl shadow-black/40"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        {/* Brand Logo with Interactive '3' or '$' on hover */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-surface border border-surface-border flex items-center justify-center group-hover:border-moss/60 transition-colors shadow-md">
            <div className="flex items-center font-black text-lg">
              <span className="text-foreground">W</span>
              <div
                onMouseEnter={() => setIsThreeHovered(true)}
                onMouseLeave={() => setIsThreeHovered(false)}
                className="inline-block transform-style-3d text-moss transition-transform duration-75 cursor-pointer"
                style={{ transform: `rotateY(${activeRotation}deg)` }}
              >
                {isThreeHovered ? "$" : "3"}
              </div>
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-foreground flex items-center">
            W
            <span
              onMouseEnter={() => setIsThreeHovered(true)}
              onMouseLeave={() => setIsThreeHovered(false)}
              className="inline-block text-moss transform-style-3d transition-transform duration-75 font-mono cursor-pointer"
              style={{ transform: `rotateY(${activeRotation}deg)` }}
            >
              {isThreeHovered ? "$" : "3"}
            </span>
            HIRE
          </span>
        </Link>

        {/* Minimal Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
          <Link href="/bounties" className="hover:text-moss transition-colors">
            Freelancer Portal
          </Link>
          <Link href="/client" className="hover:text-moss transition-colors">
            Client Workspace
          </Link>
          <a href="#how-it-works" className="hover:text-moss transition-colors">
            Mechanics
          </a>
          <a href="#contrast" className="hover:text-moss transition-colors">
            Why W3HIRE
          </a>
          <a href="#features" className="hover:text-moss transition-colors">
            Features
          </a>
          <a href="#faq" className="hover:text-moss transition-colors">
            FAQ
          </a>
        </nav>

        {/* Auth / Account Controls */}
        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-surface-border text-xs font-mono text-moss">
                <UserIcon className="w-3.5 h-3.5" />
                <span>{user.name || user.email.split("@")[0]}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-moss/10 border border-moss/20 text-moss uppercase">
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-full bg-surface hover:bg-surface-hover text-muted hover:text-foreground border border-surface-border transition"
                title="Sign Out"
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
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-surface hover:bg-surface-hover text-foreground border border-surface-border transition shadow-md"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode("signup");
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-moss hover:bg-[#BEF264] text-background transition shadow-md shadow-[#84CC16]/20"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center">
        <section className="w-full max-w-5xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center text-center relative overflow-hidden">
          
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-moss/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Hero Headline with Scroll-triggered Splitting Animation (W3 moves left, HIRE moves right) */}
          <div
            className="perspective-1000 my-4 transition-transform duration-150 ease-out"
            style={{
              transform: `rotateX(${mousePos.y * 0.3}deg) rotateY(${mousePos.x * 0.3}deg)`,
            }}
          >
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-foreground flex items-center justify-center select-none leading-none gap-2 sm:gap-4">
              {/* Left Segment: W3 */}
              <motion.div
                style={{
                  x: w3X,
                  y: w3Y,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="flex items-center"
              >
                <span>W</span>
                <span
                  onMouseEnter={() => setIsThreeHovered(true)}
                  onMouseLeave={() => setIsThreeHovered(false)}
                  className="inline-block text-moss transform-style-3d cursor-pointer mx-1 transition-all duration-150 hover:scale-110"
                  style={{
                    transform: `rotateY(${activeRotation}deg)`,
                    filter: "drop-shadow(0 0 35px rgba(132, 204, 22, 0.5))",
                  }}
                >
                  {isThreeHovered ? "$" : "3"}
                </span>
              </motion.div>

              {/* Right Segment: HIRE */}
              <motion.div
                style={{
                  x: hireX,
                  y: hireY,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                <span>HIRE</span>
              </motion.div>
            </h1>
          </div>

          {/* Subheadline (Appears smoothly as user scrolls) */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8 text-xl sm:text-2xl md:text-3xl text-foreground font-semibold max-w-2xl leading-snug tracking-tight"
          >
            Replace hope with mathematical certainty. Global freelance payments, secured and settled in seconds.
          </motion.p>

          {/* Primary & Secondary Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link
              href="/client"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold bg-moss hover:bg-[#BEF264] text-background transition-all shadow-xl shadow-[#84CC16]/25 hover:shadow-[#84CC16]/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
            >
              <Briefcase className="w-5 h-5" />
              <span>Post a Bounty</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/bounties"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold bg-surface hover:bg-surface-hover text-foreground border border-surface-border transition-all shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
            >
              <UserCheck className="w-5 h-5 text-moss" />
              <span>Earn in Web3</span>
              <ArrowUpRight className="w-5 h-5 text-muted" />
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          <div className="mt-12">
            <a
              href="#ticker"
              className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-moss transition-colors bg-surface/80 px-4 py-2 rounded-full border border-surface-border shadow-sm"
            >
              <span>Scroll to explore mechanics</span>
              <ChevronDown className="w-4 h-4 animate-bounce text-moss" />
            </a>
          </div>
        </section>

        {/* Live Activity & Ticker Stats (Superteam-Style) */}
        <section id="ticker" className="w-full max-w-6xl mx-auto px-6 py-12 border-t border-surface-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            
            <div className="p-6 rounded-2xl bg-surface/90 border border-surface-border backdrop-blur-md space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Total Escrow Volume</span>
              <div className="text-3xl font-black text-foreground tracking-tight">$2,450,800+</div>
              <div className="text-xs text-moss font-mono flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18.4% this month</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface/90 border border-surface-border backdrop-blur-md space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Active Bounties</span>
              <div className="text-3xl font-black text-foreground tracking-tight">142 Open</div>
              <div className="text-xs text-moss font-mono flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Live Marketplace</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface/90 border border-surface-border backdrop-blur-md space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Contracts Settled</span>
              <div className="text-3xl font-black text-foreground tracking-tight">1,890 Jobs</div>
              <div className="text-xs text-moss font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>100% Zero Default</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface/90 border border-surface-border backdrop-blur-md space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Avg. Settlement</span>
              <div className="text-3xl font-black text-[#22C55E] tracking-tight">2.4 Seconds</div>
              <div className="text-xs text-muted font-mono flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Instant Global Payout</span>
              </div>
            </div>

          </div>

          {/* Recent Bounties Feed (Superteam-Style Live Ticker) */}
          <div className="rounded-3xl bg-surface border border-surface-border p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-moss animate-pulse" />
                <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-foreground">
                  Live Network Feed • Recent Bounties & Escrow Claims
                </h3>
              </div>
              <Link href="/bounties" className="text-xs font-mono text-moss hover:underline flex items-center gap-1">
                <span>View All Marketplace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentBounties.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-background border border-surface-border hover:border-moss/50 transition-all space-y-2 group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono text-moss px-2 py-0.5 rounded bg-moss/10 border border-moss/20 font-semibold">
                      {item.tag}
                    </span>
                    <span className="text-[10px] text-muted font-mono">{item.time}</span>
                  </div>

                  <h4 className="text-sm font-bold text-foreground group-hover:text-moss transition-colors">
                    {item.title}
                  </h4>

                  <div className="flex justify-between items-center pt-1 text-xs border-t border-surface-border/60">
                    <span className="font-mono text-muted">{item.status}</span>
                    <span className="font-bold text-[#22C55E] font-mono">{item.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Core Conflict (Fiverr-Style Contrast Table) */}
        <section id="contrast" className="w-full max-w-6xl mx-auto px-6 py-16 border-t border-surface-border">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-moss font-semibold">
              The Paradigm Shift
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Traditional Platforms vs. W3HIRE
            </h2>
            <p className="text-sm text-muted">
              Compare why top global talent and high-growth Web3 teams are switching to trustless payment infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* TRADITIONAL PLATFORMS (The Problem) */}
            <div className="rounded-3xl bg-surface/80 border-2 border-red-950/30 p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-surface-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-800/40 text-red-400 flex items-center justify-center font-bold">
                    <X className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-foreground">Traditional Platforms</h3>
                    <span className="text-xs text-muted font-mono">Fiverr, Upwork, Web2 Banks</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-sm text-muted">
                <div className="p-4 rounded-xl bg-background border border-surface-border space-y-1">
                  <span className="text-xs font-mono text-red-400 font-bold uppercase">5% to 20% Intermediary Fees</span>
                  <p className="text-xs text-muted">
                    Hefty commission cuts taken directly from talent payouts and added to client invoices.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-background border border-surface-border space-y-1">
                  <span className="text-xs font-mono text-red-400 font-bold uppercase">3 to 14 Business Day Delays</span>
                  <p className="text-xs text-muted">
                    Manual bank clearances, pending holds, and foreign wire remittance wait times.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-background border border-surface-border space-y-1">
                  <span className="text-xs font-mono text-red-400 font-bold uppercase">Dispute & Chargeback Risks</span>
                  <p className="text-xs text-muted">
                    Freelancers face reversed payments and arbitrary platform account suspensions.
                  </p>
                </div>
              </div>
            </div>

            {/* W3HIRE (The Solution) */}
            <div className="rounded-3xl bg-surface border-2 border-moss/50 p-8 space-y-6 shadow-2xl shadow-moss/10 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-surface-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-moss/10 border border-moss/30 text-moss flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-foreground">W3HIRE Protocol</h3>
                    <span className="text-xs text-moss font-mono font-bold">Trustless Smart Contracts</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-moss text-background font-bold">
                  RECOMMENDED
                </span>
              </div>

              <div className="space-y-4 text-sm text-muted">
                <div className="p-4 rounded-xl bg-background border border-moss/30 space-y-1">
                  <span className="text-xs font-mono text-moss font-bold uppercase">Less than 1% Protocol Fee</span>
                  <p className="text-xs text-muted">
                    Direct peer-to-peer settlements. Freelancers keep 99%+ of every dollar earned.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-background border border-moss/30 space-y-1">
                  <span className="text-xs font-mono text-moss font-bold uppercase">Instant Payout Release</span>
                  <p className="text-xs text-muted">
                    Smart contracts release funds straight to your wallet in seconds upon approval.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-background border border-moss/30 space-y-1">
                  <span className="text-xs font-mono text-moss font-bold uppercase">Automated Escrow Lock</span>
                  <p className="text-xs text-muted">
                    Funds are deposited into neutral escrow before work starts. Zero payment default risk.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* The Mechanics (Simplified 3-Step Smart Contracts) */}
        <section id="how-it-works" className="w-full max-w-6xl mx-auto px-6 py-16 border-t border-surface-border">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-moss font-semibold">
              Simplified Escrow Protocol
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              How W3HIRE Works in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* STEP 1 */}
            <div className="p-8 rounded-3xl bg-surface border border-surface-border space-y-4 relative group hover:border-moss/60 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-background border border-surface-border text-moss font-mono text-xl font-bold flex items-center justify-center shadow-inner">
                1
              </div>
              <h3 className="text-xl font-bold text-foreground group-hover:text-moss transition-colors">
                Step 1: Client Locks Funds
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                The project budget is deposited into a secure, neutral digital escrow before any work begins.
              </p>
            </div>

            {/* STEP 2 */}
            <div className="p-8 rounded-3xl bg-surface border border-surface-border space-y-4 relative group hover:border-moss/60 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-background border border-surface-border text-moss font-mono text-xl font-bold flex items-center justify-center shadow-inner">
                2
              </div>
              <h3 className="text-xl font-bold text-foreground group-hover:text-moss transition-colors">
                Step 2: Talent Delivers
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                The freelancer completes the agreed-upon milestones with absolute certainty that the money is guaranteed.
              </p>
            </div>

            {/* STEP 3 */}
            <div className="p-8 rounded-3xl bg-surface border border-surface-border space-y-4 relative group hover:border-moss/60 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-background border border-surface-border text-[#22C55E] font-mono text-xl font-bold flex items-center justify-center shadow-inner">
                3
              </div>
              <h3 className="text-xl font-bold text-foreground group-hover:text-[#22C55E] transition-colors">
                Step 3: Protocol Pays Instantly
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Upon approval, the smart contract automatically releases funds directly to the freelancer.
              </p>
            </div>

          </div>
        </section>

        {/* Key Platform Features (Lusion.co Inspired Dynamic Grid) */}
        <section id="features" className="w-full max-w-6xl mx-auto px-6 py-16 border-t border-surface-border">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-moss font-semibold">
              Platform Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Engineered for Modern Web3 Workflows
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* FEATURE 1 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-3xl bg-surface border border-surface-border hover:border-moss/60 transition-all space-y-4 shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-background border border-surface-border text-moss flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Multi-Currency Wallets</h3>
              <p className="text-xs text-muted leading-relaxed">
                Hold, swap, and withdraw in preferred currencies (USD, EUR, INR, Crypto) without hidden banking conversion spreads.
              </p>
            </motion.div>

            {/* FEATURE 2 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-3xl bg-surface border border-surface-border hover:border-moss/60 transition-all space-y-4 shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-background border border-surface-border text-moss flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Decentralized Identity (DID)</h3>
              <p className="text-xs text-muted leading-relaxed">
                A closed, zero-fraud ecosystem where every client and freelancer profile is cryptographically verified.
              </p>
            </motion.div>

            {/* FEATURE 3 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-3xl bg-surface border border-surface-border hover:border-moss/60 transition-all space-y-4 shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-background border border-surface-border text-moss flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Borderless Compliance</h3>
              <p className="text-xs text-muted leading-relaxed">
                Built-in, automated legal checks (KYC/GDPR) to ensure global regulatory alignment across jurisdictions.
              </p>
            </motion.div>

          </div>
        </section>

        {/* FAQ Section (Lusion.co Inspired Accordion) */}
        <section id="faq" className="w-full max-w-4xl mx-auto px-6 py-16 border-t border-surface-border">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-moss font-semibold">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-black text-foreground tracking-tight">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-4">
            {faqList.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-surface border border-surface-border overflow-hidden transition-all shadow-md"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-foreground hover:text-moss transition-colors cursor-pointer"
                  >
                    <span className="text-base sm:text-lg">{item.q}</span>
                    <div className="w-8 h-8 rounded-full bg-background border border-surface-border flex items-center justify-center shrink-0 text-moss">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-6 pb-6 text-xs sm:text-sm text-muted leading-relaxed border-t border-surface-border/50 pt-4"
                      >
                        {item.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Final Conversion (Footer CTA) */}
        <section className="w-full max-w-5xl mx-auto px-6 py-20">
          <div className="rounded-3xl bg-gradient-to-b from-surface via-surface to-background border-2 border-moss/40 p-10 sm:p-14 text-center space-y-8 shadow-2xl shadow-moss/10 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-moss/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl mx-auto space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-moss font-bold px-3 py-1 rounded-full bg-moss/10 border border-moss/30 inline-block">
                Start Now
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
                The future of work is trustless. Start earning or hiring globally today.
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => {
                  setAuthMode("signup");
                  setIsAuthModalOpen(true);
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold bg-moss hover:bg-[#BEF264] text-background transition-all shadow-xl shadow-[#84CC16]/25 text-base flex items-center justify-center gap-2"
              >
                <span>Connect Wallet / Create DID Profile</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border py-8 px-6 bg-surface/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <span>W<span className="text-moss">3</span>HIRE</span>
            <span className="font-mono text-[10px] text-muted">v1.0 Protocol</span>
          </div>
          <div className="font-mono text-[11px]">
            © 2026 W3HIRE Protocol. All rights reserved.
          </div>
        </div>
      </footer>

      {/* MetaMask Auth Modal */}
      <MetaMaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        role={selectedRole}
      />

      {/* JWT Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialRole={authInitialRole}
        initialMode={authMode}
      />
    </div>
  );
}
