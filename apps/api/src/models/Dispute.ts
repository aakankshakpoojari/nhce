/**
 * @file Dispute.ts
 * @description Decentralized dispute case & juror voting model interfaces.
 */

export enum DisputeStatus {
  OPEN = 'OPEN',
  VOTING = 'VOTING',
  RESOLVED = 'RESOLVED'
}

export enum VoteChoice {
  FREELANCER_FAVOR = 'FREELANCER_FAVOR',
  CLIENT_FAVOR = 'CLIENT_FAVOR'
}

export interface IJurorVote {
  id: string;
  disputeId: string;
  jurorAddress: string;
  vote: VoteChoice;
  rewardClaimed: boolean;
  createdAt: Date;
}

export interface IDisputeCase {
  id: string;
  jobId: string;
  milestoneId: string;
  initiatorId: string;
  reason: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  votes?: IJurorVote[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IOpenDisputeDTO {
  jobId: string;
  milestoneId: string;
  reason: string;
  evidenceUrls?: string[];
}

export interface ICastVoteDTO {
  disputeId: string;
  choice: VoteChoice;
}
