/**
 * @file subscriptionLimit.middleware.ts
 * @description Freemium tier enforcement middleware.
 * Checks usage counters:
 * - Clients posting more than 3 jobs on the free tier (isPro === false) are blocked with HTTP 403.
 * - Freelancers applying to more than 3 jobs on the free tier (isPro === false) are blocked with HTTP 403.
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { prisma } from '../config/db.config';

const FREE_TIER_LIMIT = 3;

/**
 * Middleware to restrict job postings for non-Pro Clients
 */
export async function checkJobPostingLimit(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User authentication required' });
      return;
    }

    // TODO: In production, fetch fresh user counts from Prisma database or Redis cache
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const isPro = user?.isPro ?? req.user.isPro;
    const jobsPostedCount = user?.jobsPostedCount ?? 0;

    if (!isPro && jobsPostedCount >= FREE_TIER_LIMIT) {
      res.status(403).json({
        error: 'Free tier limit reached',
        message: `Free clients can post a maximum of ${FREE_TIER_LIMIT} jobs. Please upgrade to Pro subscription for unlimited job postings.`,
        limit: FREE_TIER_LIMIT,
        currentUsage: jobsPostedCount,
        isPro: false
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error in subscriptionLimit middleware:', error);
    next(error);
  }
}

/**
 * Middleware to restrict job applications for non-Pro Freelancers
 */
export async function checkJobApplicationLimit(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User authentication required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const isPro = user?.isPro ?? req.user.isPro;
    const jobsAppliedCount = user?.jobsAppliedCount ?? 0;

    if (!isPro && jobsAppliedCount >= FREE_TIER_LIMIT) {
      res.status(403).json({
        error: 'Free tier limit reached',
        message: `Free freelancers can apply to a maximum of ${FREE_TIER_LIMIT} jobs. Please upgrade to Pro subscription for unlimited applications.`,
        limit: FREE_TIER_LIMIT,
        currentUsage: jobsAppliedCount,
        isPro: false
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error in checkJobApplicationLimit middleware:', error);
    next(error);
  }
}
