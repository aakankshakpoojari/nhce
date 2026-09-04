"use client";

/**
 * @file NotificationToastBridge.tsx
 * @description Renders nothing — it just turns the two realtime channels that
 * already exist (Socket.IO `notification:new` and `message:new`, both used
 * elsewhere for badge counts) into popup toasts via ToastContext, so a new
 * message or notification is visible the instant it arrives instead of only
 * after opening the bell / messages panel.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { getSocket } from "@/lib/messagesSocket";
import { fetchConversation, type MessageDTO } from "@/lib/messagesApi";
import type { NotificationDTO } from "@/lib/notificationsApi";

const isRealToken = (t: string | null) =>
  !!t && !t.startsWith("admin_auth_jwt_") && !t.startsWith("mock_jwt_token_");

export default function NotificationToastBridge() {
  const { user, token } = useAuth();
  const { push } = useToast();
  const pathname = usePathname();

  // Read inside the handlers without forcing the socket subscription to
  // re-run (and the listener to flap) on every navigation.
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);
  const conversationLabelCache = useRef(new Map<string, string>());

  const enabled = Boolean(user && token) && isRealToken(token) && user?.role !== "ADMIN";

  useEffect(() => {
    if (!enabled || !token) return;
    const socket = getSocket(token);

    const onNotification = (payload: { notification?: NotificationDTO }) => {
      const n = payload?.notification;
      if (!n) return;
      push({
        kind: "notification",
        notifType: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
      });
    };

    const onMessage = (payload: { conversationId?: string; message?: MessageDTO }) => {
      const { conversationId, message } = payload || {};
      if (!conversationId || !message || message.senderId === user?.id) return;

      // Already looking at the conversation list — the page itself shows it live.
      const onMessagesPage =
        pathnameRef.current === "/messages" || pathnameRef.current === "/client/messages";
      if (onMessagesPage) return;

      const messagesHref = pathnameRef.current.startsWith("/client") ? "/client/messages" : "/messages";
      const link = `${messagesHref}?c=${conversationId}`;
      const preview = message.isDeleted ? "Message deleted" : message.content;

      const cached = conversationLabelCache.current.get(conversationId);
      if (cached) {
        push({ kind: "message", title: cached, body: preview, link });
        return;
      }

      fetchConversation(token, conversationId)
        .then(({ conversation }) => {
          const other =
            conversation.participants.find((p) => p.userId !== user?.id) ?? conversation.participants[0];
          const label = other ? other.name || other.email?.split("@")[0] || "New message" : "New message";
          conversationLabelCache.current.set(conversationId, label);
          push({ kind: "message", title: label, body: preview, link });
        })
        .catch(() => {
          push({ kind: "message", title: "New message", body: preview, link });
        });
    };

    socket.on("notification:new", onNotification);
    socket.on("message:new", onMessage);
    return () => {
      socket.off("notification:new", onNotification);
      socket.off("message:new", onMessage);
    };
  }, [enabled, token, user?.id, push]);

  return null;
}
