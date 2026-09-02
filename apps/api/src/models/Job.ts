/**
 * @file Job.ts
 * @description Job listing & budget model interface specifications.
 */

import { IMilestoneDeliverable } from './Milestone';

export enum JobStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED'
}

export interface ICreateJobDTO {
  title: string;
  description: string;
  budget: number;
  tokenSymbol?: string;
  milestones: Array<{
    title: string;
    description: string;
    amount: number;
    deadline?: string;
  }>;
}

export interface IJob {
  id: string;
  title: string;
  description: string;
  budget: number;
  tokenSymbol: string;
  escrowAddress?: string;
  status: JobStatus;
  clientId: string;
  freelancerId?: string;
  milestones?: IMilestoneDeliverable[];
  createdAt: Date;
  updatedAt: Date;
}
