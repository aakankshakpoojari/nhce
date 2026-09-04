"use client";

/**
 * @file FloatingMessages.tsx
 * @description Portal-wide floating messaging widget. A small circular button is
 * fixed to the bottom-right of every authenticated page; clicking it opens a
 * compact panel (Instagram-web-style, as a UX reference only) that lists the
 * caller's recent conversations. All data comes from the existing messaging
 * backend via `lib/messagesApi` — no duplicate backend, no fake data. Clicking a
 * conversation (or "View all messages") routes to the existing Messages page.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useApiFetch } from "@/hooks/useApiFetch";
import { fetchConversations, type ConversationDTO } from "@/lib/messagesApi";
import { getSocket } from "@/lib/messagesSocket";

/* ------------------------------ helpers ------------------------------ */

function displayName(name: string | null, email: string | null): string {
  return name || email?.split("@")[0] || "Unknown";
}

function initials(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatListTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays < 2) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/* ------------------------------ component ------------------------------ */

export default function FloatingMessages() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token } = useAuth();

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const isClientPortal = pathname.startsWith("/client");
  const messagesHref = isClientPortal ? "/client/messages" : "/messages";

  // Hide on the full Messages page (redundant there and would cover the composer)
  // and for anyone who isn't a signed-in client/freelancer.
  const onMessagesPage = pathname === "/messages" || pathname === "/client/messages";
  const enabled = Boolean(user && token) && user?.role !== "ADMIN" && !onMessagesPage;

  // Recent conversations for both the unread badge and the panel body. Loads once
  // on mount and re-runs whenever `reload()` is called (panel open / realtime).
  const { data, isLoading, error, reload } = useApiFetch<ConversationDTO[]>(async () => {
    if (!enabled || !token) return [];
    const res = await fetchConversations(token);
    return [...(res.conversations ?? [])].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [enabled, token]);

  const conversations = useMemo(() => data ?? [], [data]);
  const unreadTotal = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [conversations]
  );

  // Keep the badge live off the same realtime events the Messages page uses.
  useEffect(() => {
    if (!enabled || !token) return;
    const socket = getSocket(token);
    const onNewMessage = (payload: { message?: { senderId?: string } }) => {
      if (payload?.message?.senderId !== user?.id) reload();
    };
    socket.on("message:new", onNewMessage);
    socket.on("conversation:read", reload);
    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("conversation:read", reload);
    };
  }, [enabled, token, user?.id, reload]);

  // Close on outside click / Escape while open.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!enabled) return null;

  const otherParticipant = (c: ConversationDTO) =>
    c.participants.find((p) => p.userId !== user?.id) ?? c.participants[0] ?? null;

  const conversationLabel = (c: ConversationDTO) => {
    const other = otherParticipant(c);
    return other ? displayName(other.name, other.email) : "Conversation";
  };

  const toggle = () => {
    if (!open) reload(); // refresh the list every time the panel is opened
    setOpen((v) => !v);
  };

  const goToConversation = (id: string) => {
    setOpen(false);
    router.push(`${messagesHref}?c=${id}`);
  };

  const goToAll = () => {
    setOpen(false);
    router.push(messagesHref);
  };

  return (
    <div ref={rootRef} className="fixed bottom-5 right-5 z-[60] select-none sm:bottom-8 sm:right-8">
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            role="dialog"
            aria-label="Messages"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute bottom-[4.25rem] right-0 flex h-[460px] max-h-[calc(100vh-7rem)] w-[calc(100vw-2.5rem)] max-w-[22rem] flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface/95 shadow-2xl backdrop-blur-xl sm:w-[22rem]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-moss" />
                <span className="text-sm font-bold tracking-tight text-foreground">Messages</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={goToAll}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-moss transition-colors hover:bg-surface-hover hover:text-[#BEF264]"
                >
                  View all messages
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close messages"
                  className="rounded-lg p-1 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Conversation list */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {isLoading && conversations.length === 0 ? (
                <p className="p-4 font-mono text-xs text-muted">Loading conversations…</p>
              ) : error ? (
                <div className="space-y-2 p-4">
                  <p className="text-xs text-[#EF4444]">Couldn&apos;t load conversations.</p>
                  <button
                    onClick={() => reload()}
                    className="text-xs font-semibold text-moss hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : conversations.length === 0 ? (
                <p className="p-4 text-xs text-muted">No conversations yet.</p>
              ) : (
                <ul>
                  {conversations.map((c) => {
                    const label = conversationLabel(c);
                    const unread = c.unreadCount > 0;
                    const preview = c.lastMessage
                      ? c.lastMessage.isDeleted
                        ? "Message deleted"
                        : c.lastMessage.content
                      : "No messages yet";
                    return (
                      <li key={c.id}>
                        <button
                          onClick={() => goToConversation(c.id)}
                          className="flex w-full items-center gap-3 border-b border-surface-border/60 px-4 py-3 text-left transition-colors hover:bg-surface-hover"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-surface-border bg-background text-[11px] font-bold text-foreground">
                            {initials(label)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2">
                              <span className="truncate text-sm font-semibold text-foreground">
                                {label}
                              </span>
                              <span className="shrink-0 font-mono text-[10px] text-muted">
                                {formatListTime(c.lastMessage?.createdAt ?? c.updatedAt)}
                              </span>
                            </span>
                            <span className="mt-0.5 flex items-center justify-between gap-2">
                              <span
                                className={`truncate text-xs ${
                                  unread ? "font-medium text-foreground" : "text-muted"
                                }`}
                              >
                                {preview}
                              </span>
                              {unread && (
                                <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-moss px-1 text-[10px] font-bold text-background">
                                  {c.unreadCount > 9 ? "9+" : c.unreadCount}
                                </span>
                              )}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <button
        onClick={toggle}
        aria-label={open ? "Close messages" : "Open messages"}
        aria-expanded={open}
        className="relative flex h-12 w-12 items-center justify-center rounded-full border border-moss/40 bg-surface/90 text-moss shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-200 hover:scale-105 hover:border-[#BEF264] hover:bg-moss hover:text-background active:scale-95 sm:h-14 sm:w-14"
      >
        {open ? (
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        ) : (
          <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
        )}
        {!open && unreadTotal > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-[#EF4444] px-1 text-[10px] font-black text-white">
            {unreadTotal > 99 ? "99+" : unreadTotal}
          </span>
        )}
      </button>
    </div>
  );
}
