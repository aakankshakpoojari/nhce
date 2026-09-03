/**
 * @file subscription.controller.ts
 * @description Freemium & Pro Subscription Management Controller.
 * Manages tier checks, usage counters, and Pro subscription upgrades.
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../config/db.config';

export class SubscriptionController {
  /**
   * GET /api/subscription/status
   * Fetch current subscription tier and usage stats for authenticated user
   */
  public async getSubscriptionStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        isPro: user.isPro,
        role: user.role,
        jobsPostedCount: user.jobsPostedCount,
        jobsAppliedCount: user.jobsAppliedCount,
        freeLimit: 3,
        canPostJob: user.isPro || user.jobsPostedCount < 3,
        canApplyJob: user.isPro || user.jobsAppliedCount < 3
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch subscription status', message: error.message });
    }
  }

  /**
   * POST /api/subscription/upgrade
   * Upgrade user to Pro subscription tier
   */
  public async upgradeToPro(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { isPro: true }
      });

      res.json({
        message: 'Successfully upgraded to Pro Subscription',
        user: {
          id: updatedUser.id,
          walletAddress: updatedUser.walletAddress,
          isPro: updatedUser.isPro
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to upgrade subscription', message: error.message });
    }
  }
}

export const subscriptionController = new SubscriptionController();
