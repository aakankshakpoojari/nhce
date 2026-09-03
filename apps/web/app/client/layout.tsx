"use client";

import React, { useState, useEffect } from "react";
import CustomCursor from "@/components/animations/CustomCursor";
import ClientNavbar from "./components/ClientNavbar";
import GlobalWalletBanner from "@/components/ui/GlobalWalletBanner";
import PostProjectModal from "./components/PostProjectModal";
import UpgradeProModal from "./components/UpgradeProModal";
import { Project } from "./page";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [creditsRemaining, setCreditsRemaining] = useState(3);
  const [isPro, setIsPro] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCredits = localStorage.getItem("w3hire_client_credits");
      if (savedCredits !== null) setCreditsRemaining(Number(savedCredits));
      
      const savedPro = localStorage.getItem("w3hire_client_is_pro");
      if (savedPro === "true") setIsPro(true);

      const handleUpdate = () => {
        const c = localStorage.getItem("w3hire_client_credits");
        if (c !== null) setCreditsRemaining(Number(c));
        const p = localStorage.getItem("w3hire_client_is_pro");
        if (p === "true") setIsPro(true);
      };

      window.addEventListener("client_state_updated", handleUpdate);
      return () => window.removeEventListener("client_state_updated", handleUpdate);
    }
  }, []);

  const handleCreateProject = (newProjectData: any) => {
    if (!isPro && creditsRemaining > 0) {
      const newCredits = creditsRemaining - 1;
      setCreditsRemaining(newCredits);
      localStorage.setItem("w3hire_client_credits", String(newCredits));
    }

    const newProj = {
      id: `proj-${Date.now()}`,
      ...newProjectData,
      status: "open",
      createdAt: "Just now",
      applicants: [],
    };

    const savedProjects = localStorage.getItem("w3hire_client_projects");
    const projects = savedProjects ? JSON.parse(savedProjects) : [];
    const updated = [newProj, ...projects];
    localStorage.setItem("w3hire_client_projects", JSON.stringify(updated));

    window.dispatchEvent(new Event("w3hire_projects_updated"));
    window.dispatchEvent(new Event("client_state_updated"));

    setTimeout(() => {
      const applicantName = "Vikram Sharma";
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          projectTitle: newProj.title,
          text: `${applicantName} (⭐ 4.9 PRO) applied to your project.`,
          time: "Just now",
          read: false,
        },
        ...prev,
      ]);

      const currentSaved = localStorage.getItem("w3hire_client_projects");
      if (currentSaved) {
        const currentProjects = JSON.parse(currentSaved);
        const next = currentProjects.map((p: any) =>
          p.id === newProj.id
            ? {
                ...p,
                applicants: [
                  ...p.applicants,
                  {
                    id: `app-${Date.now()}`,
                    name: applicantName,
                    avatar: "VS",
                    role: "Senior Smart Contract Engineer",
                    rating: 4.9,
                    completedJobs: 18,
                    isPro: true,
                    skills: newProj.skills.length > 0 ? newProj.skills : ["Solidity", "Security"],
                    proposedUSD: newProj.budgetUSD,
                    proposedINR: newProj.budgetINR,
                    proposal: "I specialize in high-throughput Web3 protocols and escrow smart contracts. Ready to start immediately.",
                    githubUrl: "https://github.com",
                    portfolioUrl: "https://portfolio.dev",
                  },
                ],
              }
            : p
        );
        localStorage.setItem("w3hire_client_projects", JSON.stringify(next));
        window.dispatchEvent(new Event("w3hire_projects_updated"));
      }
    }, 2500);
  };

  const handleActivatePro = () => {
    setIsPro(true);
    localStorage.setItem("w3hire_client_is_pro", "true");
    window.dispatchEvent(new Event("client_state_updated"));
  };

  // Smooth mouse tracking with spring-damped inertia
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 60, damping: 20, mass: 0.8 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Subtle ambient parallax offsets (-15px to +15px)
  const backgroundX = useTransform(smoothX, [-1, 1], [-18, 18]);
  const backgroundY = useTransform(smoothY, [-1, 1], [-18, 18]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const normalizedX = (e.clientX / innerWidth) * 2 - 1;
      const normalizedY = (e.clientY / innerHeight) * 2 - 1;
      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative min-h-screen bg-transparent text-foreground flex flex-col selection:bg-moss selection:text-background font-sans overflow-x-hidden">
      {/* Shared Interactive Custom Cursor */}
      <CustomCursor />

      {/* Subtle Inertial Background Atmosphere */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{
          x: backgroundX,
          y: backgroundY,
        }}
      >
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-moss/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-[#22C55E]/5 rounded-full blur-[120px]" />
      </motion.div>

      <ClientNavbar
        creditsRemaining={creditsRemaining}
        maxCredits={3}
        isPro={isPro}
        onPostProjectClick={() => setIsPostModalOpen(true)}
        onUpgradeProClick={() => setIsProModalOpen(true)}
        notifications={notifications}
        onMarkNotificationsRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
      />

      {/* Page Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        <GlobalWalletBanner className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-8" />
        {children}
      </div>

      <PostProjectModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        creditsRemaining={creditsRemaining}
        isPro={isPro}
        onSubmit={handleCreateProject}
        onUpgradePro={() => {
          setIsPostModalOpen(false);
          setIsProModalOpen(true);
        }}
      />

      <UpgradeProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        onConfirmPro={handleActivatePro}
      />
    </div>
  );
}
