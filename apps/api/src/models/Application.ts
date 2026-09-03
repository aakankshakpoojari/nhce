/**
 * @file Application.ts
 * @description Job application model interface specifications.
 * A freelancer submits a proposal (pitch) with a requested rate and delivery timeline
 * against a published job. The client can review, accept (select), or reject applications.
 */

export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface ICreateApplicationDTO {
  pitch: string;
  requestedRate: number;
  deliveryDays: number;
  walletAddress?: string | null;
}

export interface IApplication {
  id: string;
  jobId: string;
  freelancerId: string;
  pitch: string;
  requestedRate: number;
  deliveryDays: number;
  walletAddress?: string | null;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}