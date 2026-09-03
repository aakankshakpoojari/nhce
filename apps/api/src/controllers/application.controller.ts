/**
 * @file application.controller.ts
 * @description Freelancer Application Management Controller.
 * Exposes the authenticated freelancer's own applications.
 * Job-scoped client actions (review/reject/select) live in the JobController.
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../config/db.config';

export class ApplicationController {
  /**
   * GET /api/applications/my
   * Get the authenticated freelancer's applications with job details.
   */
  public async getMyApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const applications = await prisma.jobApplication.findMany({
        where: { freelancerId: req.user.id },
        include: {
          job: {
            include: {
              client: { select: { id: true, name: true, email: true, rating: true } },
              _count: { select: { applications: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ applications });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch applications', message: error.message });
    }
  }
}

export const applicationController = new ApplicationController();