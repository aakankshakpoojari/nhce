/**
 * @file User.ts
 * @description User profile & Authentication data structure interfaces.
 * Defines wallet-based SIWE fields, roles, ratings, and subscription tracking parameters.
 */

export enum UserRole {
  CLIENT = 'CLIENT',
  FREELANCER = 'FREELANCER',
  JUROR = 'JUROR'
}

export interface IUserProfile {
  id: string;
  email?: string;
  walletAddress: string;
  siweNonce?: string;
  role: UserRole;
  name?: string;
  bio?: string;
  location?: string;
  rating: number;
  portfolioLinks: string[];
  isPro: boolean;
  jobsPostedCount: number;
  jobsAppliedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISiweVerifyRequest {
  message: string;
  signature: string;
}

export interface IAuthResponse {
  token: string;
  user: IUserProfile;
}
