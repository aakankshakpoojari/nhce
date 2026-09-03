/**
 * @file User.ts
 * @description User profile & Authentication data structure interfaces.
 * Defines authentication fields, roles, ratings, and subscription tracking parameters.
 */

export enum UserRole {
  CLIENT = 'CLIENT',
  FREELANCER = 'FREELANCER',
  JUROR = 'JUROR'
}

export interface IUserProfile {
  id: string;
  email?: string | null;
  walletAddress?: string | null;
  siweNonce?: string | null;
  role: UserRole | string;
  name?: string | null;
  bio?: string | null;
  location?: string | null;
  rating: number;
  portfolioLinks: string[];
  isPro: boolean;
  jobsPostedCount: number;
  jobsAppliedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISignupDTO {
  name?: string;
  email: string;
  password: string;
  role?: 'CLIENT' | 'FREELANCER' | 'JUROR';
}

export interface ILoginDTO {
  email: string;
  password: string;
}

export interface IAuthResponse {
  token: string;
  user: IUserProfile;
}
