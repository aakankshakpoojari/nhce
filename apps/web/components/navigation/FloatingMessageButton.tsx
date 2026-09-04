"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchConversations, type ConversationDTO } from "@/lib/messagesApi";
import { getSocket } from "@/lib/messagesSocket";

export default function FloatingMessageButton() {
  const pathname = usePathname();
  const { user, token } = useAuth();
  const [unreadTotal, setUnreadTotal] = useState<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  // Determine whether the user is in the client portal or freelancer portal
  const isClientPortal = pathname.startsWith("/client");
  const targetHref = isClientPortal ? "/client/messages" : "/messages";
  const portalLabel = isClientPortal ? "Client Messages" : "Messages";

  // Hide when already on the messages page so it doesn't obstruct chat input
  const isOnMessagesPage = pathname === "/messages" || pathname === "/client/messages";

  // Fetch unread count if authenticated
  useEffect(() => {
    if (!token || isOnMessagesPage) return;

    let cancelled = false;

    fetchConversations(token)
      .then((res) => {
        if (!cancelled && res?.conversations) {
          const total = res.conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
          setUnreadTotal(total);
        }
      })
      .catch(() => {});

    // Listen for realtime message events to bump unread badge
    const socket = getSocket(token);

    const handleNewMessage = (payload: { message: { senderId: string } }) => {
      if (payload?.message?.senderId !== user?.id) {
        setUnreadTotal((prev) => prev + 1);
      }
    };

    const handleRead = () => {
      // Re-fetch conversations to keep accurate count
      fetchConversations(token)
        .then((res) => {
          if (!cancelled && res?.conversations) {
            const total = res.conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
            setUnreadTotal(total);
          }
        })
        .catch(() => {});
    };

    socket.on("message:new", handleNewMessage);
    socket.on("conversation:read", handleRead);

    return () => {
      cancelled = true;
      socket.off("message:new", handleNewMessage);
      socket.off("conversation:read", handleRead);
    };
  }, [token, user?.id, isOnMessagesPage]);

  if (isOnMessagesPage) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8 flex items-center gap-3 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Tooltip Label */}
      <div
        className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface/90 backdrop-blur-md border border-surface-border text-xs font-semibold text-foreground shadow-lg transition-all duration-300 pointer-events-none ${
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-moss animate-pulse" />
        <span>{portalLabel}</span>
      </div>

      {/* Main Floating Message Action Button */}
      <Link
        href={targetHref}
        aria-label={portalLabel}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-surface/85 backdrop-blur-xl border-2 border-moss/50 hover:border-[#BEF264] text-moss hover:text-background hover:bg-moss shadow-[0_8px_32px_rgba(0,0,0,0.45)] hover:shadow-[0_0_28px_rgba(190,242,100,0.55)] transition-all duration-300 hover:scale-105 active:scale-95"
      >
        {/* Subtle Ambient Pulse Ring */}
        <span className="absolute -inset-1 rounded-full bg-moss/20 group-hover:bg-moss/30 blur-sm transition-all duration-500 animate-pulse pointer-events-none" />

        {/* Message Logo Icon */}
        <MessageSquare className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:scale-110" />

        {/* Unread Message Notification Badge */}
        {unreadTotal > 0 && (
          <span className="absolute -top-1 -right-1 z-20 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1.5 text-[10px] font-black text-white shadow-[0_0_10px_rgba(239,68,68,0.75)] border-2 border-background">
            {unreadTotal > 99 ? "99+" : unreadTotal}
          </span>
        )}
      </Link>
    </div>
  );
}
