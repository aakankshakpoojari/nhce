"use client";

import { useEffect, useState, useRef } from "react";
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
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import MetaMaskModal from "@/components/metamask-modal";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import KineticTiltCard from "@/components/ui/KineticTiltCard";
import LiveFeedMarquee from "@/components/ui/LiveFeedMarquee";
import MechanicsScrollShowcase, { MechanicsStep } from "@/components/mechanics/MechanicsScrollShowcase";
import OutroWordmark from "@/components/ui/OutroWordmark";
import MagneticBackground from "@/components/ui/MagneticBackground";

const MECHANICS_STEPS: MechanicsStep[] = [
  {
    id: "step-1",
    eyebrow: "STEP 01",
    title: "Client Locks Funds",
    description: "The project budget is deposited into a secure, neutral digital escrow before any work begins. This ensures 100% payment guarantee for the freelancer, eliminating default risk.",
    features: []
  },
  {
    id: "step-2",
    eyebrow: "STEP 02",
    title: "Talent Delivers",
    description: "The freelancer completes the agreed-upon milestones with absolute certainty that the money is guaranteed. Code, design, or audit deliverables are submitted on-chain or off-chain.",
    features: []
  },
  {
    id: "step-3",
    eyebrow: "STEP 03",
    title: "Protocol Pays Instantly",
    description: "Upon client approval or successful dispute resolution, the smart contract automatically releases funds directly to the freelancer's wallet. Zero banking delays.",
    features: []
  }
];

const FadeInCard = ({ children, index, fromLeft }: { children: React.ReactNode, index: number, fromLeft: boolean }) => (
  <motion.div
    initial={{ opacity: 0, x: fromLeft ? -120 : 120, scale: 0.85 }}
    whileInView={{ opacity: 1, x: 0, scale: 1 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ type: "spring", stiffness: 90, damping: 12, mass: 0.9, delay: index * 0.1 }}
    className="h-full"
  >
    {children}
  </motion.div>
);

/**
 * Award-Winning Lusion.co & Active Theory Inspired Interactive Landing Page
 * W3HIRE Protocol Architecture
 */
export default function LandingPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Modal & Auth state
  const [selectedRole, setSelectedRole] = useState<"client" | "freelancer" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState<"CLIENT" | "FREELANCER">("FREELANCER");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [hasEntered, setHasEntered] = useState(false);

  // 1. CHARACTER MORPHING LOOP STATE:
  // Cycles E ➔ (1s) ➔ 3 ➔ (1s) ➔ $ ➔ (1s) ➔ E
  const morphSequence = ["E", "3", "$"];
  const [morphIndex, setMorphIndex] = useState(0);
  const [isHoveringMorphChar, setIsHoveringMorphChar] = useState(false);

  // Intro spin state (scroll is locked until 360 spin finishes)
  const [isIntroSpinning, setIsIntroSpinning] = useState(true);
  const [introRotation, setIntroRotation] = useState(0);

  // 1s Character Morphing Interval Loop
  useEffect(() => {
    const morphTimer = setInterval(() => {
      setMorphIndex((prev) => (prev + 1) % morphSequence.length);
    }, 1000);
    return () => clearInterval(morphTimer);
  }, []);

  // Set hasEntered after initial stagger finishes
  useEffect(() => {
    const t = setTimeout(() => setHasEntered(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Intro rotation effect
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

  // Handle scroll and mouse parallax
  useEffect(() => {
    const handleScroll = () => {
      if (!isIntroSpinning) {
        setScrollY(window.scrollY);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20;
      const y = (e.clientY / innerHeight - 0.5) * -20;
      setMousePos({ x, y });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isIntroSpinning]);

  // Active rotation angle
  const activeRotation = isIntroSpinning
    ? introRotation
    : (introRotation + scrollY * 0.8) % 360;

  // Active morphing character (overridden to $ if explicitly hovered)
  const currentMorphChar = isHoveringMorphChar ? "$" : morphSequence[morphIndex];

  // SCROLL-TRIGGERED KINETIC SCATTER VECTORS FOR "WE HIRE":
  // As scrollY increases (0 to 350px), characters explode/scatter outwards with staggered velocity
  const scrollProgress = Math.min(scrollY / 1100, 1);
  const isScattered = scrollProgress > 0.15;

  // Staggered particle scatter offsets
  const charScatterOffsets = [
    { x: -scrollProgress * 320, y: -scrollProgress * 120, rotate: -scrollProgress * 45, opacity: 1 - scrollProgress * 0.4 }, // W
    { x: -scrollProgress * 220, y: -scrollProgress * 160, rotate: scrollProgress * 35, opacity: 1 - scrollProgress * 0.4 },  // E / 3 / $
    { x: scrollProgress * 140, y: -scrollProgress * 120, rotate: -scrollProgress * 30, opacity: 1 - scrollProgress * 0.4 },  // H
    { x: scrollProgress * 220, y: -scrollProgress * 160, rotate: scrollProgress * 40, opacity: 1 - scrollProgress * 0.4 },   // I
    { x: scrollProgress * 300, y: -scrollProgress * 140, rotate: -scrollProgress * 35, opacity: 1 - scrollProgress * 0.4 },  // R
    { x: scrollProgress * 380, y: -scrollProgress * 180, rotate: scrollProgress * 50, opacity: 1 - scrollProgress * 0.4 },   // E
  ];

  const getLetterProps = (index: number) => {
    const isEven = index % 2 === 0;
    const initialConfig = { opacity: 0, x: isEven ? -100 : 100, y: 100, rotate: isEven ? -45 : 45, scale: 0.5 };
    const delay = (index + 1) * 0.15;

    return {
      initial: initialConfig,
      animate: hasEntered
        ? {
          x: charScatterOffsets[index].x,
          y: charScatterOffsets[index].y,
          rotate: charScatterOffsets[index].rotate,
          opacity: charScatterOffsets[index].opacity,
          scale: 1,
        }
        : { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 },
      transition: {
        type: "spring",
        stiffness: 90,
        damping: 12,
        mass: 0.9,
        delay: hasEntered ? 0 : delay,
      } as any
    };
  };

  const handleRoleAuth = (role: "client" | "freelancer") => {
    setAuthInitialRole(role === "client" ? "CLIENT" : "FREELANCER");
    setAuthMode("signin");
    setIsAuthModalOpen(true);
  };



  // FAQ List
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
      q: "What is Decentralized Identity (DID) and how does it protect my account?",
      a: "Decentralized Identity (DID) is a cryptographically signed reputation badge tied to your account. It verifies your delivered milestones, client ratings, and technical credentials on-chain, creating a zero-fraud ecosystem immune to fake profiles or manipulated reviews.",
    },
  ];

  return (
    <div
      className={`min-h-screen bg-transparent text-foreground flex flex-col justify-between selection:bg-moss selection:text-background ${isIntroSpinning ? "overflow-hidden h-screen select-none" : "overflow-x-hidden"
        }`}
    >
      <MagneticBackground />
      {/* Sticky Navbar (Docked Segment Target) */}
      <header
        className={`sticky top-0 z-40 px-6 py-4 flex items-center justify-between transition-all duration-300 ${scrollY > 20
          ? "border-b border-surface-border bg-background/90 backdrop-blur-xl shadow-2xl shadow-black/40"
          : "border-b border-transparent bg-transparent"
          }`}
      >
        {/* Docked Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-surface border border-surface-border flex items-center justify-center group-hover:border-moss/60 transition-colors shadow-md">
            <div className="flex items-center font-black text-lg">
              <span className="text-foreground">W</span>
              <div
                onMouseEnter={() => setIsHoveringMorphChar(true)}
                onMouseLeave={() => setIsHoveringMorphChar(false)}
                className="inline-block transform-style-3d text-moss transition-transform duration-75 cursor-pointer font-mono"
                style={{ transform: `rotateY(${activeRotation}deg)` }}
              >
                {currentMorphChar}
              </div>
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-foreground flex items-center">
            W
            <span
              onMouseEnter={() => setIsHoveringMorphChar(true)}
              onMouseLeave={() => setIsHoveringMorphChar(false)}
              className="inline-block text-moss transform-style-3d transition-transform duration-75 font-mono cursor-pointer mx-0.5"
              style={{ transform: `rotateY(${activeRotation}deg)` }}
            >
              {currentMorphChar}
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

        {/* Auth Controls */}
        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={user.role === "CLIENT" ? "/client/profile" : "/profile"}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface hover:bg-surface-hover transition-colors border border-surface-border text-xs font-mono text-moss cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{user.name || user.email.split("@")[0]}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-moss/10 border border-moss/20 text-moss uppercase">
                  {user.role}
                </span>
              </Link>
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

        {/* SECTION 1: HERO & SCROLL-TRIGGERED KINETIC SCATTER ANIMATION */}
        <section className="w-full px-6 pt-12 pb-24 flex flex-col items-center text-center relative overflow-hidden min-h-[100svh] justify-center">

          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-moss/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

          {/* MASSIVE VIEWPORT-FILLING HEADLINE: "WE HIRE" / "W3 HIRE" */}
          <div
            className="perspective-1000 my-4 transition-transform duration-150 ease-out select-none"
            style={{
              transform: `rotateX(${mousePos.y * 0.25}deg) rotateY(${mousePos.x * 0.25}deg)`,
            }}
          >
            <h1 className="text-7xl sm:text-9xl md:text-[11rem] font-black tracking-tighter text-foreground flex items-center justify-center leading-none gap-3 sm:gap-6">
              {/* SEGMENT 1: W */}
              <motion.span
                {...getLetterProps(0)}
                className="inline-block"
              >
                W
              </motion.span>

              {/* SEGMENT 2: E ➔ 3 ➔ $ ➔ E CHARACTER MORPHING LOOP */}
              <motion.span
                {...getLetterProps(1)}
                onMouseEnter={() => setIsHoveringMorphChar(true)}
                onMouseLeave={() => setIsHoveringMorphChar(false)}
                className="inline-block text-moss transform-style-3d cursor-pointer font-mono mx-1 filter drop-shadow-[0_0_40px_rgba(132,204,22,0.6)]"
                style={{ transform: `rotateY(${activeRotation}deg)` }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentMorphChar}
                    initial={{ rotateX: 90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    exit={{ rotateX: -90, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="inline-block"
                  >
                    {currentMorphChar}
                  </motion.span>
                </AnimatePresence>
              </motion.span>

              {/* SPACE */}
              <span className="w-4 sm:w-10 inline-block" />

              {/* SEGMENT 3: H */}
              <motion.span
                {...getLetterProps(2)}
                className="inline-block"
              >
                H
              </motion.span>

              {/* SEGMENT 4: I */}
              <motion.span
                {...getLetterProps(3)}
                className="inline-block"
              >
                I
              </motion.span>

              {/* SEGMENT 5: R */}
              <motion.span
                {...getLetterProps(4)}
                className="inline-block"
              >
                R
              </motion.span>

              {/* SEGMENT 6: E */}
              <motion.span
                {...getLetterProps(5)}
                className="inline-block"
              >
                E
              </motion.span>
            </h1>
          </div>

          {/* SUBHEADLINE & HERO CTAS REVEAL (Replaces scattered text smoothly) */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{
              opacity: isScattered ? 1 : 0.85,
              y: isScattered ? 0 : 10,
              scale: isScattered ? 1 : 0.98,
            }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="mt-6 flex flex-col items-center space-y-8"
          >
            <p className="text-xl sm:text-2xl md:text-3xl text-foreground font-semibold max-w-3xl leading-snug tracking-tight text-center">
              Replace hope with mathematical certainty. Global freelance payments, secured and settled in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
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
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <div className="mt-12">
            <a
              href="#ticker"
              className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-moss transition-colors bg-surface/80 px-4 py-2 rounded-full border border-surface-border shadow-sm"
            >
              <span>Scroll down to experience live mechanics</span>
              <ChevronDown className="w-4 h-4 animate-bounce text-moss" />
            </a>
          </div>
        </section>

        {/* SECTION 2: LIVE ACTIVITY & SOCIAL PROOF (SUPERTEAM STYLE) */}
        <section id="ticker" className="w-full max-w-6xl mx-auto px-6 py-12 border-t border-surface-border">

          {/* Glassmorphic Counter Modules with Rolling Digits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">

            <FadeInCard index={0} fromLeft={true}>
              <KineticTiltCard className="p-6 h-full">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Total Escrow Volume</span>
                <div className="text-3xl font-black text-foreground tracking-tight">$2,450,800+</div>
                <div className="text-xs text-moss font-mono flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+18.4% this month</span>
                </div>
              </KineticTiltCard>
            </FadeInCard>

            <FadeInCard index={1} fromLeft={false}>
              <KineticTiltCard className="p-6 h-full">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Active Bounties</span>
                <div className="text-3xl font-black text-foreground tracking-tight">142 Open</div>
                <div className="text-xs text-moss font-mono flex items-center gap-1 mt-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Live Marketplace</span>
                </div>
              </KineticTiltCard>
            </FadeInCard>

            <FadeInCard index={2} fromLeft={true}>
              <KineticTiltCard className="p-6 h-full">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Contracts Settled</span>
                <div className="text-3xl font-black text-foreground tracking-tight">1,890 Jobs</div>
                <div className="text-xs text-moss font-mono flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>100% Zero Default</span>
                </div>
              </KineticTiltCard>
            </FadeInCard>

            <FadeInCard index={3} fromLeft={false}>
              <KineticTiltCard className="p-6 h-full">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Avg. Settlement</span>
                <div className="text-3xl font-black text-[#22C55E] tracking-tight">2.4 Seconds</div>
                <div className="text-xs text-muted font-mono flex items-center gap-1 mt-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Instant Payout</span>
                </div>
              </KineticTiltCard>
            </FadeInCard>

          </div>

        </section>

        {/* LiveFeedMarquee - Full Width */}
        <LiveFeedMarquee />

        {/* SECTION 3: THE CORE CONFLICT (FIVERR VS W3HIRE CONTRAST MATRIX) */}
        <section id="contrast" className="w-full max-w-6xl mx-auto px-6 py-16 border-t border-surface-border">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-moss font-semibold">
              The Core Conflict
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Traditional Platforms vs. W3HIRE
            </h2>
            <p className="text-sm text-muted">
              Why top global builders and high-growth clients are switching to trustless escrow infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* TRADITIONAL PLATFORMS (The Problem) */}
            <FadeInCard index={0} fromLeft={true}>
              <KineticTiltCard className="p-8 border-2 border-red-950/40 shadow-xl h-full" glowColor="rgba(239, 68, 68, 0.15)">
                <div className="flex items-center justify-between border-b border-surface-border pb-4 mb-6">
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
                    <span className="text-xs font-mono text-red-400 font-bold uppercase">5% to 10% Intermediary Fees</span>
                    <p className="text-xs text-muted">
                      High commissions taken directly from talent payouts and added to client invoices.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-background border border-surface-border space-y-1">
                    <span className="text-xs font-mono text-red-400 font-bold uppercase">3 to 5 Business Day Delays</span>
                    <p className="text-xs text-muted">
                      Manual bank clearances, pending holds, and foreign wire remittance wait times.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-background border border-surface-border space-y-1">
                    <span className="text-xs font-mono text-red-400 font-bold uppercase">Dispute & Chargeback Risks</span>
                    <p className="text-xs text-muted">
                      Freelancers face reversed payments, unverified clients, and arbitrary account suspensions.
                    </p>
                  </div>
                </div>
              </KineticTiltCard>
            </FadeInCard>

            {/* W3HIRE (The Solution) */}
            <FadeInCard index={1} fromLeft={false}>
              <KineticTiltCard className="p-8 border-2 border-moss/60 shadow-2xl shadow-moss/10 h-full" glowColor="rgba(132, 204, 22, 0.3)">
                <div className="flex items-center justify-between border-b border-surface-border pb-4 mb-6">
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
              </KineticTiltCard>
            </FadeInCard>

          </div>
        </section>


        {/* SECTION 4: THE MECHANICS (3-STEP SMART CONTRACTS) */}
        <MechanicsScrollShowcase
          steps={[
            {
              id: "step-1",
              eyebrow: "STEP 1",
              title: "Client Locks Funds",
              description: "The project budget is deposited into a secure, neutral digital escrow before any work begins. This ensures 100% payment guarantee for the freelancer, eliminating default risk.",
            },
            {
              id: "step-2",
              eyebrow: "STEP 2",
              title: "Talent Delivers",
              description: "The freelancer completes the agreed-upon milestones with absolute certainty that the money is guaranteed. Code, design, or audit deliverables are submitted on-chain or off-chain.",
            },
            {
              id: "step-3",
              eyebrow: "STEP 3",
              title: "Protocol Pays Instantly",
              description: "Upon client approval or successful dispute resolution, the smart contract automatically releases funds directly to the freelancer's wallet. Zero banking delays.",
            },
          ]}
        />

        {/* SECTION 5: KEY PLATFORM FEATURES (LUSION CARD GRID) */}
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
            <FadeInCard index={0} fromLeft={true}>
              <KineticTiltCard className="p-8 space-y-4 h-full">
                <div className="w-12 h-12 rounded-2xl bg-background border border-surface-border text-moss flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Multi-Currency Wallets</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Hold, swap, and withdraw in preferred currencies (USD, EUR, INR, Crypto) without hidden banking conversion spreads.
                </p>
              </KineticTiltCard>
            </FadeInCard>

            {/* FEATURE 2 */}
            <FadeInCard index={1} fromLeft={false}>
              <KineticTiltCard className="p-8 space-y-4 h-full">
                <div className="w-12 h-12 rounded-2xl bg-background border border-surface-border text-moss flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Decentralized Identity (DID)</h3>
                <p className="text-xs text-muted leading-relaxed">
                  A closed, zero-fraud ecosystem where every client and freelancer profile is cryptographically verified.
                </p>
              </KineticTiltCard>
            </FadeInCard>

            {/* FEATURE 3 */}
            <FadeInCard index={2} fromLeft={true}>
              <KineticTiltCard className="p-8 space-y-4 h-full">
                <div className="w-12 h-12 rounded-2xl bg-background border border-surface-border text-moss flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Borderless Compliance</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Built-in, automated legal checks (KYC/GDPR) to ensure global regulatory alignment across jurisdictions.
                </p>
              </KineticTiltCard>
            </FadeInCard>

          </div>
        </section>

        {/* SECTION 6: INTERACTIVE FAQ SECTION (LUSION-STYLE ELASTIC EXPANDERS) */}
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
                  onMouseEnter={() => setOpenFaq(index)}
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

        {/* SECTION 7: FOOTER CTA */}
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
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold bg-moss hover:bg-[#BEF264] text-background transition-all shadow-xl shadow-[#84CC16]/25 text-base flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Connect Wallet / Create DID Profile</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* SECTION 6: Outro Wordmark */}
      <OutroWordmark />

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
