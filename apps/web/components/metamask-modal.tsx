"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle2, AlertCircle, ArrowRight, X, Loader2, UserCheck, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MetaMaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: "client" | "freelancer" | null;
  onSuccess?: (account: string) => void;
}

export default function MetaMaskModal({
  isOpen,
  onClose,
  role,
  onSuccess,
}: MetaMaskModalProps) {
  const router = useRouter();
  const { user, connectWallet } = useAuth();
  const [step, setStep] = useState<"connect" | "signing" | "success" | "role_conflict" | "error">("connect");
  const [account, setAccount] = useState<string | null>(null);
  const [existingRole, setExistingRole] = useState<"client" | "freelancer" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [hasExtension, setHasExtension] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      setHasExtension(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStep("connect");
      setErrorMessage("");
      setExistingRole(null);
    }
  }, [isOpen]);

  if (!isOpen || !role) return null;

  const roleTitle = role === "client" ? "Client" : "Freelancer";
  const targetRoute = role === "client" ? "/client" : "/bounties";

  const handleConnectWallet = async () => {
    try {
      setStep("signing");
      setErrorMessage("");

      let userAddress = "0x71C3a7F9B1E48574B40B62E3e74dB826500F949A";

      if (typeof window !== "undefined" && (window as any).ethereum) {
        const eth = (window as any).ethereum;
        const accounts = await eth.request({ method: "eth_requestAccounts" });
        if (accounts && accounts.length > 0) {
          userAddress = accounts[0];
        }
      } else {
        // Simulated connection delay for dev testing
        await new Promise((res) => setTimeout(res, 600));
      }

      const normalizedAddress = userAddress.toLowerCase();

      // Validate wallet connection & role uniqueness via AuthContext
      const res = await connectWallet(normalizedAddress);

      if (!res.success) {
        setAccount(userAddress);
        setErrorMessage(res.error || "Wallet is already linked to another account or role conflict detected.");
        setExistingRole(role === "client" ? "freelancer" : "client");
        setStep("role_conflict");
        return;
      }

      // Optional signature for real MetaMask
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const eth = (window as any).ethereum;
        const message = `Welcome to W3HIRE!\n\nAuthenticate as: ${roleTitle}\nWallet: ${userAddress}\nRole binding: permanent 1-account-1-role policy.\nNonce: ${Math.floor(Math.random() * 1000000)}`;
        try {
          await eth.request({
            method: "personal_sign",
            params: [message, userAddress],
          });
        } catch (signErr: any) {
          console.warn("Signature skipped:", signErr);
        }
      }

      setAccount(userAddress);
      setStep("success");

      if (onSuccess) {
        onSuccess(userAddress);
      }

      setTimeout(() => {
        router.push(targetRoute);
      }, 900);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to connect MetaMask");
      setStep("error");
    }
  };


  const handleRedirectToExistingRole = () => {
    if (!existingRole) return;
    const dest = existingRole === "client" ? "/client" : "/bounties";
    router.push(dest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 shadow-2xl text-foreground">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted hover:text-foreground p-1 rounded-lg hover:bg-background transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* MetaMask Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-background border border-surface-border flex items-center justify-center mb-4 shadow-inner">
            <svg className="w-10 h-10" viewBox="0 0 318.6 318.6" fill="none">
              <path d="M274.1 35.5L174.6 109.4L193 65.8L274.1 35.5Z" fill="#E2761B" stroke="#E2761B" strokeWidth="2" />
              <path d="M44.4 35.5L143.9 109.4L125.5 65.8L44.4 35.5Z" fill="#E4761B" stroke="#E4761B" strokeWidth="2" />
              <path d="M238.3 206.8L211.8 247.4L268.5 263L284.8 207.7L238.3 206.8Z" fill="#E4761B" stroke="#E4761B" strokeWidth="2" />
              <path d="M33.9 207.7L50.1 263L106.8 247.4L80.3 206.8L33.9 207.7Z" fill="#E4761B" stroke="#E4761B" strokeWidth="2" />
              <path d="M103.6 138.2L87.8 162.1L144.1 164.6L142.3 104.1L103.6 138.2Z" fill="#E4761B" stroke="#E4761B" strokeWidth="2" />
              <path d="M214.9 138.2L175.7 103.6L174.5 164.6L230.8 162.1L214.9 138.2Z" fill="#E4761B" stroke="#E4761B" strokeWidth="2" />
              <path d="M106.8 247.4L140.6 230.9L111.4 208.1L106.8 247.4Z" fill="#D7C1B3" stroke="#D7C1B3" strokeWidth="2" />
              <path d="M177.9 230.9L211.8 247.4L207.1 208.1L177.9 230.9Z" fill="#D7C1B3" stroke="#D7C1B3" strokeWidth="2" />
              <path d="M211.8 247.4L177.9 230.9L180.6 253L180.3 262.3L211.8 247.4Z" fill="#233447" stroke="#233447" strokeWidth="2" />
              <path d="M106.8 247.4L138.3 262.3L138 253L140.6 230.9L106.8 247.4Z" fill="#233447" stroke="#233447" strokeWidth="2" />
              <path d="M159.3 190.1L159.3 118.8L143.9 109.4L144.1 164.6L159.3 190.1Z" fill="#CD6116" stroke="#CD6116" strokeWidth="2" />
              <path d="M159.3 190.1L174.5 164.6L174.6 109.4L159.3 118.8L159.3 190.1Z" fill="#CD6116" stroke="#CD6116" strokeWidth="2" />
              <path d="M140.6 230.9L159.3 221.7L177.9 230.9L174.5 164.6L159.3 190.1L144.1 164.6L140.6 230.9Z" fill="#E4751F" stroke="#E4751F" strokeWidth="2" />
            </svg>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-surface-border text-moss text-xs font-mono mb-2">
            <Lock className="w-3 h-3" /> Web3 Identity
          </div>

          <h3 className="text-xl font-bold text-foreground">
            {step === "role_conflict" ? "Role Conflict Detected" : `Sign in as ${roleTitle}`}
          </h3>
          <p className="text-xs text-muted mt-1 max-w-xs">
            {step === "role_conflict"
              ? "Each wallet ID can only be registered as either a Client or a Freelancer."
              : "Connect your MetaMask wallet to authenticate your account."}
          </p>
        </div>

        {/* Content Body */}
        <div className="mt-6 space-y-4">
          {step === "connect" && (
            <>
              <div className="p-3.5 rounded-xl bg-background border border-surface-border text-xs text-muted space-y-2">
                <div className="flex justify-between items-center text-foreground">
                  <span>Target Role:</span>
                  <span className="font-mono text-moss font-semibold">{roleTitle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Policy:</span>
                  <span className="font-mono text-muted">1 Role per Wallet ID</span>
                </div>
              </div>

              <button
                onClick={handleConnectWallet}
                className="w-full py-3.5 px-4 rounded-xl font-semibold bg-moss hover:bg-[#BEF264] text-background transition shadow-lg shadow-[#84CC16]/20 flex items-center justify-center gap-2 text-sm"
              >
                <span>Connect MetaMask</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === "signing" && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-moss animate-spin" />
              <div className="text-sm font-semibold text-foreground">
                Checking Wallet Identity...
              </div>
              <p className="text-xs text-muted max-w-xs">
                Verifying single-role policy for this wallet address.
              </p>
            </div>
          )}

          {/* ROLE CONFLICT SCREEN */}
          {step === "role_conflict" && (
            <div className="p-4 rounded-2xl bg-background border border-[#EF4444]/40 text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] flex items-center justify-center mx-auto">
                <AlertCircle className="w-5 h-5" />
              </div>
              
              <div className="space-y-1">
                <div className="text-xs font-mono text-[#EF4444] font-bold">
                  Wallet Already Registered
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Address <span className="text-foreground font-mono font-bold">{account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ""}</span> is already permanently assigned as a{" "}
                  <span className="text-moss font-bold uppercase">{existingRole}</span>. A wallet cannot be both.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={handleRedirectToExistingRole}
                  className="w-full py-3 px-4 rounded-xl font-bold bg-moss hover:bg-[#BEF264] text-background text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Go to {existingRole === "client" ? "Client" : "Freelancer"} Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    // Reset to connect state and advise switching account in MetaMask
                    setStep("connect");
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-xs text-muted hover:text-foreground transition"
                >
                  Switch Wallet in MetaMask & Retry
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-foreground">
                Authenticated as {roleTitle}!
              </div>
              <div className="text-xs font-mono text-moss bg-background px-3 py-1 rounded-md border border-surface-border">
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connected"}
              </div>
              <p className="text-xs text-muted">
                Opening {roleTitle} Workspace...
              </p>
            </div>
          )}

          {step === "error" && (
            <div className="py-4 space-y-4 text-center">
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-xs text-red-300 flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage || "Connection failed"}</span>
              </div>
              <button
                onClick={handleConnectWallet}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-background hover:bg-moss text-foreground hover:text-background border border-surface-border hover:border-moss transition text-sm"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
