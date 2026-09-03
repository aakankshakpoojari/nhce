"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import WalletNoticeBanner from "@/components/ui/WalletNoticeBanner";

const DISMISS_KEY = "w3hire_wallet_banner_dismissed";

/**
 * Session-dismissible "connect your wallet" prompt shown under the navbar on
 * every authenticated page for users who have not linked a wallet yet.
 * Hides once a wallet is linked (from `/auth/me`) or the user dismisses it.
 */
export default function GlobalWalletBanner({ className = "" }: { className?: string }) {
  const { user, isLoading } = useAuth();
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      /* sessionStorage unavailable — keep showing the banner */
    }
    setReady(true);
  }, []);

  if (!ready || isLoading) return null;
  if (!user || user.role === "ADMIN") return null;
  if (user.walletAddress) return null;
  if (dismissed) return null;

  return (
    <div className={`mb-6 ${className}`}>
      <WalletNoticeBanner
        role={user.role === "CLIENT" ? "client" : "freelancer"}
        onDismiss={() => {
          try {
            sessionStorage.setItem(DISMISS_KEY, "1");
          } catch {
            /* ignore */
          }
          setDismissed(true);
        }}
      />
    </div>
  );
}
