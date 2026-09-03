"use client";

/**
 * @file messagesApi.ts
 * @description Typed client for the messaging backend (/api/conversations).
 * Mirrors the conventions in lib/api.ts — every call takes the JWT explicitly and
 * returns the parsed JSON payload, throwing ApiError on non-2xx.
 */

import { apiFetch } from "./api";

export interface MessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  isDeleted: boolean;
}

export interface ConversationParticipantDTO {
  userId: string;
  name: string | null;
  email: string | null;
  role: string;
  rating: number;
  lastReadAt: string | null;
  joinedAt: string;
}

export interface ConversationJobDTO {
  id: string;
  title: string;
  status: string;
}

export interface ConversationDTO {
  id: string;
  jobId: string | null;
  job: ConversationJobDTO | null;
  participants: ConversationParticipantDTO[];
  lastMessage: MessageDTO | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export function fetchConversations(token: string): Promise<{ conversations: ConversationDTO[] }> {
  return apiFetch<{ conversations: ConversationDTO[] }>("/conversations", { token });
}

/**
 * Open (or get) the job-scoped thread between the job's client and one freelancer.
 * Idempotent per (job, freelancer) pair. A client must pass `freelancerId` to
 * target an applicant (or omit it to reach the selected freelancer); a freelancer
 * caller always resolves to their own thread and must have applied to the job.
 */
export function openConversation(
  token: string,
  jobId: string,
  freelancerId?: string
): Promise<{ conversation: ConversationDTO; created: boolean }> {
  return apiFetch<{ conversation: ConversationDTO; created: boolean }>("/conversations", {
    method: "POST",
    token,
    body: JSON.stringify(freelancerId ? { jobId, freelancerId } : { jobId }),
  });
}

export function fetchConversation(
  token: string,
  conversationId: string
): Promise<{ conversation: ConversationDTO }> {
  return apiFetch<{ conversation: ConversationDTO }>(`/conversations/${conversationId}`, { token });
}

export function fetchMessages(
  token: string,
  conversationId: string,
  opts: { limit?: number; before?: string } = {}
): Promise<{ messages: MessageDTO[] }> {
  const params = new URLSearchParams();
  if (opts.limit) params.set("limit", String(opts.limit));
  if (opts.before) params.set("before", opts.before);
  const qs = params.toString();
  return apiFetch<{ messages: MessageDTO[] }>(
    `/conversations/${conversationId}/messages${qs ? `?${qs}` : ""}`,
    { token }
  );
}

export function sendMessage(
  token: string,
  conversationId: string,
  content: string
): Promise<{ message: MessageDTO }> {
  return apiFetch<{ message: MessageDTO }>(`/conversations/${conversationId}/messages`, {
    method: "POST",
    token,
    body: JSON.stringify({ content }),
  });
}

export function markConversationRead(
  token: string,
  conversationId: string
): Promise<{ conversationId: string; lastReadAt: string }> {
  return apiFetch<{ conversationId: string; lastReadAt: string }>(
    `/conversations/${conversationId}/read`,
    { method: "POST", token }
  );
}

export function editMessage(
  token: string,
  conversationId: string,
  messageId: string,
  content: string
): Promise<{ message: MessageDTO }> {
  return apiFetch<{ message: MessageDTO }>(
    `/conversations/${conversationId}/messages/${messageId}`,
    { method: "PATCH", token, body: JSON.stringify({ content }) }
  );
}

export function deleteMessage(
  token: string,
  conversationId: string,
  messageId: string
): Promise<{ message: MessageDTO }> {
  return apiFetch<{ message: MessageDTO }>(
    `/conversations/${conversationId}/messages/${messageId}`,
    { method: "DELETE", token }
  );
}
