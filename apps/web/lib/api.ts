"use client";

/**
 * @file api.ts
 * @description Typed API client for the Dracarys marketplace backend.
 * Attaches the JWT from AuthContext's localStorage and normalizes errors.
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "") + "/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface ApiRequestOptions extends RequestInit {
  token?: string | null;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("w3hire_auth_token");
}

export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.error || data?.message || `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }
  return data as T;
}

/* ------------------------------ Types ------------------------------ */

export type JobStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "FREELANCER_SELECTED"
  | "OPEN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DISPUTED"
  | "CANCELLED";

export type ApplicationStatus = "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";

export interface UserSummary {
  id: string;
  name: string | null;
  email: string | null;
  rating: number;
  bio?: string | null;
  location?: string | null;
  portfolioLinks?: string[];
  createdAt?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  tokenSymbol: string;
  skills: string[];
  deadline: string | null;
  escrowAddress: string | null;
  status: JobStatus;
  clientId: string;
  freelancerId: string | null;
  createdAt: string;
  updatedAt: string;
  client?: UserSummary;
  freelancer?: UserSummary | null;
  milestones?: unknown[];
  _count?: { applications: number };
}

export interface JobApplication {
  id: string;
  jobId: string;
  freelancerId: string;
  pitch: string;
  requestedRate: number;
  deliveryDays: number;
  walletAddress: string | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  job?: Job;
  freelancer?: UserSummary;
}

export interface JobListResponse {
  jobs: Job[];
}

export interface ApplicationListResponse {
  applications: JobApplication[];
}

export type UserRole = "CLIENT" | "FREELANCER" | "JUROR" | "ADMIN";

export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  walletAddress: string | null;
  bio: string | null;
  location: string | null;
  rating: number;
  portfolioLinks: string[];
  jobsPostedCount: number;
  jobsAppliedCount: number;
  createdAt: string;
}

/* ------------------------------ API calls ------------------------------ */

export function fetchJobs(params: Record<string, string | number | undefined> = {}): Promise<JobListResponse> {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") search.set(k, String(v));
  });
  const qs = search.toString();
  return apiFetch<JobListResponse>(`/jobs${qs ? `?${qs}` : ""}`);
}

export function fetchJob(id: string, token?: string | null): Promise<{ job: Job }> {
  return apiFetch<{ job: Job }>(`/jobs/${id}`, token ? { token } : {});
}

export function fetchMyJobs(token: string): Promise<JobListResponse> {
  return apiFetch<JobListResponse>("/jobs/my", { token });
}

export function fetchMyApplications(token: string): Promise<ApplicationListResponse> {
  return apiFetch<ApplicationListResponse>("/applications/my", { token });
}

export function fetchJobApplications(token: string, jobId: string): Promise<{ job: Job; applications: JobApplication[] }> {
  return apiFetch<{ job: Job; applications: JobApplication[] }>(`/jobs/${jobId}/applications`, { token });
}

export function createJob(token: string, body: Record<string, unknown>): Promise<{ message: string; job: Job }> {
  return apiFetch<{ message: string; job: Job }>("/jobs", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

export function updateJob(token: string, id: string, body: Record<string, unknown>): Promise<{ message: string; job: Job }> {
  return apiFetch<{ message: string; job: Job }>(`/jobs/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(body),
  });
}

export function deleteJob(token: string, id: string): Promise<{ message: string; id: string }> {
  return apiFetch<{ message: string; id: string }>(`/jobs/${id}`, {
    method: "DELETE",
    token,
  });
}

export function publishJob(token: string, id: string): Promise<{ message: string; job: Job }> {
  return apiFetch<{ message: string; job: Job }>(`/jobs/${id}/publish`, { method: "POST", token });
}

export function applyToJob(
  token: string,
  jobId: string,
  body: { pitch: string; requestedRate: number; deliveryDays: number }
): Promise<{ message: string; application: JobApplication }> {
  return apiFetch<{ message: string; application: JobApplication }>(`/jobs/${jobId}/applications`, {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

export function reviewApplication(token: string, jobId: string, applicationId: string): Promise<{ message: string; application: JobApplication }> {
  return apiFetch<{ message: string; application: JobApplication }>(`/jobs/${jobId}/applications/${applicationId}/review`, {
    method: "POST",
    token,
  });
}

export function rejectApplication(token: string, jobId: string, applicationId: string): Promise<{ message: string; application: JobApplication }> {
  return apiFetch<{ message: string; application: JobApplication }>(`/jobs/${jobId}/applications/${applicationId}/reject`, {
    method: "POST",
    token,
  });
}

export function selectFreelancer(token: string, jobId: string, applicationId: string): Promise<{ message: string; job: Job }> {
  return apiFetch<{ message: string; job: Job }>(`/jobs/${jobId}/select`, {
    method: "POST",
    token,
    body: JSON.stringify({ applicationId }),
  });
}

/* ------------------------------ Profile ------------------------------ */

export function getProfile(token: string): Promise<{ user: Profile }> {
  return apiFetch<{ user: Profile }>("/auth/profile", { token });
}

export function updateProfile(
  token: string,
  body: Partial<Pick<Profile, "name" | "bio" | "location" | "walletAddress" | "portfolioLinks">>
): Promise<{ message: string; user: Profile }> {
  return apiFetch<{ message: string; user: Profile }>("/auth/profile", {
    method: "PUT",
    token,
    body: JSON.stringify(body),
  });
}

/* ------------------------------ Formatting helpers ------------------------------ */

export const TOKEN_OPTIONS = ["USDC", "USDT", "ETH", "SOL", "DAI", "INR", "USD"];

export function formatBudget(job: Pick<Job, "budget" | "tokenSymbol">): string {
  return `${job.budget.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${job.tokenSymbol}`;
}

export function daysUntil(date: string | null): number | null {
  if (!date) return null;
  const ms = new Date(date).getTime() - Date.now();
  return Math.ceil(ms / 86400000);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function formatRelative(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  FREELANCER_SELECTED: "Freelancer Selected",
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  DISPUTED: "Disputed",
  CANCELLED: "Cancelled",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};