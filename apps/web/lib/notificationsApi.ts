"use client";

/**
 * @file notificationsApi.ts
 * @description Typed client for /api/notifications. Mirrors lib/api.ts conventions.
 */

import { apiFetch } from "./api";

export type NotificationType = "JOB_POSTED" | "APPLICATION_RECEIVED" | "APPLICATION_ACCEPTED";

export interface NotificationDTO {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  jobId: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export function fetchNotifications(
  token: string
): Promise<{ notifications: NotificationDTO[]; unreadCount: number }> {
  return apiFetch<{ notifications: NotificationDTO[]; unreadCount: number }>("/notifications", {
    token,
  });
}

export function markNotificationRead(token: string, id: string): Promise<{ updated: number }> {
  return apiFetch<{ updated: number }>(`/notifications/${id}/read`, { method: "POST", token });
}

export function markAllNotificationsRead(token: string): Promise<{ updated: number }> {
  return apiFetch<{ updated: number }>("/notifications/read-all", { method: "POST", token });
}
