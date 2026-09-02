/**
 * @file webhook.controller.ts
 * @description Asynchronous Webhook Controller.
 * Listens for incoming GitHub Pull Request events (merged/closed) to update milestone status automatically.
 */

import { Request, Response } from 'express';
import { prisma } from '../config/db.config';
import { MilestoneStatus } from '@prisma/client';

export class WebhookController {
  /**
   * POST /api/webhooks/github
   * Process GitHub webhook events (e.g. pull_request merged)
   */
  public async handleGitHubWebhook(req: Request, res: Response): Promise<void> {
    try {
      const eventType = req.headers['x-github-event'];
      const payload = req.body;

      if (eventType === 'pull_request') {
        const action = payload.action;
        const prUrl = payload.pull_request?.html_url;
        const isMerged = payload.pull_request?.merged || false;

        console.log(`[GitHubWebhook] Received pull_request event. Action: ${action}, Merged: ${isMerged}, URL: ${prUrl}`);

        if (prUrl && (action === 'closed' && isMerged)) {
          // Find matching milestone by githubPrUrl
          const milestone = await prisma.milestone.findFirst({
            where: { githubPrUrl: prUrl }
          });

          if (milestone) {
            await prisma.milestone.update({
              where: { id: milestone.id },
              data: { status: MilestoneStatus.APPROVED }
            });

            console.log(`[GitHubWebhook] Milestone ${milestone.id} automatically marked APPROVED via PR merge webhook.`);
          }
        }
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('[GitHubWebhook] Error handling webhook payload:', error);
      res.status(500).json({ error: 'Webhook processing failed', message: error.message });
    }
  }
}

export const webhookController = new WebhookController();
