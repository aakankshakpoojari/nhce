"use client";

/**
 * @file useNotifications.ts
 * @description Loads the signed-in user's in-app notifications and keeps them
 * live off the existing Socket.IO `notification:new` event. Read/write goes
 * through /api/notifications. Synthetic admin / offline-mock sessions are
 * skipped (their tokens aren't real JWTs).
 */

import { useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApiFetch } from "@/hooks/useApiFetch";
import { getSocket } from "@/lib/messagesSocket";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationDTO,
} from "@/lib/notificationsApi";

const isRealToken = (t: string | null) =>
  !!t && !t.startsWith("admin_auth_jwt_") && !t.startsWith("mock_jwt_token_");

export function useNotifications() {
  const { token } = useAuth();
  const enabled = isRealToken(token);

  const { data, isLoading, error, reload, setData } = useApiFetch<NotificationDTO[]>(async () => {
    if (!enabled || !token) return [];
    const res = await fetchNotifications(token);
    return res.notifications ?? [];
  }, [enabled, token]);

  const notifications = useMemo(() => data ?? [], [data]);
  const unreadCount = notifications.reduce((n, x) => n + (x.read ? 0 : 1), 0);

  // Live updates.
  useEffect(() => {
    if (!enabled || !token) return;
    const socket = getSocket(token);
    const onNew = (payload: { notification: NotificationDTO }) => {
      if (!payload?.notification) return;
      setData((prev) => {
        const list = prev ?? [];
        return list.some((n) => n.id === payload.notification.id)
          ? list
          : [payload.notification, ...list].slice(0, 50);
      });
    };
    socket.on("notification:new", onNew);
    return () => {
      socket.off("notification:new", onNew);
    };
  }, [enabled, token, setData]);

  const markRead = useCallback(
    async (id: string) => {
      setData((prev) => (prev ?? []).map((n) => (n.id === id ? { ...n, read: true } : n)));
      if (token && isRealToken(token)) {
        try {
          await markNotificationRead(token, id);
        } catch {
          /* optimistic — the next reload reconciles */
        }
      }
    },
    [token, setData]
  );

  const markAllRead = useCallback(async () => {
    setData((prev) => (prev ?? []).map((n) => ({ ...n, read: true })));
    if (token && isRealToken(token)) {
      try {
        await markAllNotificationsRead(token);
      } catch {
        /* optimistic */
      }
    }
  }, [token, setData]);

  return { notifications, unreadCount, loading: isLoading, error, reload, markRead, markAllRead };
}
