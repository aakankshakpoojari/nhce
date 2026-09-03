"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import { Lock, Loader2, ShieldCheck, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("CLIENT" | "FREELANCER")[];
  requiredRole?: "CLIENT" | "FREELANCER";
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // If role requirement is specified
  const effectiveRoles = allowedRoles || (requiredRole ? [requiredRole] : undefined);

  useEffect(() => {
    if (!isLoading && !user) {
      setIsAuthModalOpen(true);
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-surface border border-surface-border flex items-center justify-center text-moss shadow-inner animate-pulse">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <div className="text-xs font-mono uppercase tracking-wider text-muted">
          Verifying Session & Authentication...
        </div>
      </div>
    );
  }

  // If user is not authenticated, show Access Restricted fallback with Auth Trigger
  if (!user) {
    const initialRole = requiredRole || "FREELANCER";
    return (
      <>
        <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-surface border border-surface-border rounded-3xl p-8 shadow-2xl space-y-6 backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-background border border-surface-border text-moss flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-surface-border text-moss text-xs font-mono mb-3">
                <ShieldCheck className="w-3.5 h-3.5" /> PROTECTED ROUTE
              </div>
              <h2 className="text-2xl font-extrabold text-foreground">
                Authentication Required
              </h2>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                Please sign in to access your dashboard, manage escrows, and interact with projects.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl font-bold bg-moss hover:bg-[#BEF264] text-background transition shadow-lg shadow-[#84CC16]/20 flex items-center justify-center gap-2 text-sm"
              >
                <span>Sign In / Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-background hover:bg-surface border border-surface-border text-muted hover:text-foreground text-xs font-semibold transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialRole={initialRole}
          initialMode="signin"
        />
      </>
    );
  }

  // If role check fails (e.g. freelancer trying to access client dashboard or vice versa)
  if (effectiveRoles && !effectiveRoles.includes(user.role as "CLIENT" | "FREELANCER")) {
    const isClientAccessingFreelancer = user.role === "CLIENT";
    const dest = isClientAccessingFreelancer ? "/client" : "/bounties";
    const destName = isClientAccessingFreelancer ? "Client Workspace" : "Freelancer Portal";

    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-surface border border-surface-border rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-surface-border text-amber-400 text-xs font-mono mb-3">
              ROLE POLICY RESTRICTION
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">
              {user.role} Account Active
            </h2>
            <p className="text-xs text-muted mt-2 leading-relaxed">
              This area is restricted to {effectiveRoles.join(" & ")} accounts. Your account is registered as a <span className="text-moss font-bold uppercase">{user.role}</span>.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href={dest}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-bold bg-moss hover:bg-[#BEF264] text-background transition text-sm shadow-md"
            >
              <span>Go to {destName}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-background hover:bg-surface border border-surface-border text-muted hover:text-foreground text-xs font-semibold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated & authorized
  return <>{children}</>;
}
