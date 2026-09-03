/**
 * @file Job.ts
 * @description Job listing & budget model interface specifications.
 */

import { IMilestoneDeliverable } from './Milestone';

export enum JobStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  FREELANCER_SELECTED = 'FREELANCER_SELECTED',
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED'
}

export type JobCreationStatus = 'DRAFT' | 'PUBLISHED' | 'OPEN';

export interface ICreateJobDTO {
  title: string;
  description: string;
  budget: number;
  tokenSymbol?: string;
  skills?: string[];
  deadline?: string;
  status?: JobCreationStatus;
  milestones?: Array<{
    title: string;
    description: string;
    amount: number;
    deadline?: string;
  }>;
}

export interface IUpdateJobDTO {
  title?: string;
  description?: string;
  budget?: number;
  tokenSymbol?: string;
  skills?: string[];
  deadline?: string | null;
  status?: JobStatus;
}

export interface IJob {
  id: string;
  title: string;
  description: string;
  budget: number;
  tokenSymbol: string;
  skills: string[];
  deadline?: Date | null;
  escrowAddress?: string;
  status: JobStatus;
  clientId: string;
  freelancerId?: string;
  milestones?: IMilestoneDeliverable[];
  createdAt: Date;
  updatedAt: Date;
}