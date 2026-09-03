/**
 * @file subscriptionLimit.middleware.ts
 * @description Subscription limit middleware.
 * Refactored to allow unlimited job postings for clients and applications for freelancers.
 * Bypasses quota limits for all authenticated users.
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

/**
 * Middleware to allow unlimited job postings for clients
 */
export async function checkJobPostingLimit(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: User authentication required' });
    return;
  }
  // Subscription limits removed: unlimited job postings allowed
  next();
}

/**
 * Middleware to allow unlimited job applications for freelancers
 */
export async function checkJobApplicationLimit(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: User authentication required' });
    return;
  }
  // Subscription limits removed: unlimited job applications allowed
  next();
}
