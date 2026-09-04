"use client";

/**
 * @file ToastContext.tsx
 * @description App-wide popup toasts. Anything can call `useToast().push(...)`;
 * this file only owns the stack's state + visuals. The actual realtime wiring
 * (turning a socket event into a toast) lives in NotificationToastBridge so
 * this stays a dumb, reusable UI primitive.
 */

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Briefcase, UserCheck, CheckCheck, X, Bell } from "lucide-react";

export type ToastKind = "message" | "notification";
export type ToastNotificationType = "JOB_POSTED" | "APPLICATION_RECEIVED" | "APPLICATION_ACCEPTED";

export interface ToastInput {
  kind: ToastKind;
  notifType?: ToastNotificationType;
  title: string;
  body: string;
  link?: string | null;
}

interface ToastItem extends ToastInput {
  id: string;
}

const MAX_VISIBLE = 4;
const AUTO_DISMISS_MS = 6000;

const ToastCtx = createContext<{ push: (t: ToastInput) => void } | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

function toastIcon(t: ToastItem) {
  if (t.kind === "message") return <MessageSquare className="w-4 h-4" />;
  switch (t.notifType) {
    case "APPLICATION_ACCEPTED":
      return <CheckCheck className="w-4 h-4" />;
    case "APPLICATION_RECEIVED":
      return <UserCheck className="w-4 h-4" />;
    case "JOB_POSTED":
      return <Briefcase className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((input: ToastInput) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), { ...input, id }]);
  }, []);

  const openToast = useCallback(
    (t: ToastItem) => {
      dismiss(t.id);
      if (t.link) router.push(t.link);
    },
    [dismiss, router]
  );

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}

      <div className="fixed top-24 right-4 sm:right-6 z-[70] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} onOpen={openToast} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

function ToastCard({
  toast,
  onOpen,
  onDismiss,
}: {
  toast: ToastItem;
  onOpen: (t: ToastItem) => void;
  onDismiss: (id: string) => void;
}) {
  // One auto-dismiss timer per toast instance — stable deps so it fires once,
  // regardless of how often the stack around it re-renders.
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="pointer-events-auto"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(toast)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onOpen(toast);
        }}
        className="w-full text-left flex items-start gap-3 p-3.5 rounded-2xl border border-surface-border bg-surface/95 backdrop-blur-xl shadow-2xl shadow-black/20 hover:border-moss/50 transition-colors cursor-pointer"
      >
        <span className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-moss/10 border border-moss/30 text-moss flex items-center justify-center">
          {toastIcon(toast)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground truncate">{toast.title}</span>
          <span className="block text-xs text-muted mt-0.5 line-clamp-2">{toast.body}</span>
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(toast.id);
          }}
          className="shrink-0 -mt-1 -mr-1 p-1 rounded-lg text-muted hover:text-foreground hover:bg-background transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
