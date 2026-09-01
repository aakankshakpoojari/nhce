/**
 * @file milestone.controller.ts
 * @description Milestone Submission & Automated Verification Pipeline Controller.
 * Manages deliverable submissions, triggers GitHub + Deployment Oracles & Gemini AI Code Reviewer, and initiates on-chain payouts.
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../config/db.config';
import { githubOracle } from '../services/oracle/github.oracle';
import { deploymentOracle } from '../services/oracle/deployment.oracle';
import { codeReviewerAI } from '../services/ai/codeReviewer.ai';
import { escrowService } from '../services/web3/escrow.service';
import { MilestoneStatus } from '@prisma/client';

export class MilestoneController {
  /**
   * POST /api/milestones/:id/submit
   * Freelancer submits deliverable links for milestone evaluation
   */
  public async submitMilestone(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const id = String(req.params.id);
      const { deliverableLink, githubPrUrl, deploymentUrl } = req.body;

      const milestone = await prisma.milestone.findUnique({ where: { id } });
      if (!milestone) {
        res.status(404).json({ error: 'Milestone not found' });
        return;
      }

      const updatedMilestone = await prisma.milestone.update({
        where: { id },
        data: {
          deliverableLink,
          githubPrUrl,
          deploymentUrl,
          status: MilestoneStatus.SUBMITTED,
          submittedAt: new Date()
        }
      });

      res.json({ message: 'Milestone deliverable submitted successfully', milestone: updatedMilestone });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to submit milestone deliverable', message: error.message });
    }
  }

  /**
   * POST /api/milestones/:id/verify
   * Trigger automated multi-stage verification pipeline (GitHub Oracle + Deployment Oracle + Gemini AI)
   */
  public async verifyMilestone(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);

      const milestone = await prisma.milestone.findUnique({
        where: { id },
        include: { job: true }
      });

      if (!milestone) {
        res.status(404).json({ error: 'Milestone not found' });
        return;
      }

      // Update status to VERIFYING
      await prisma.milestone.update({
        where: { id },
        data: { status: MilestoneStatus.VERIFYING }
      });

      // 1. Run GitHub Oracle Check (if GitHub PR URL provided)
      let githubResult = null;
      if (milestone.githubPrUrl) {
        githubResult = await githubOracle.verifyPullRequest(milestone.githubPrUrl);
      }

      // 2. Run Deployment Oracle Check (if Live URL provided)
      let deploymentResult = null;
      if (milestone.deploymentUrl) {
        deploymentResult = await deploymentOracle.verifyDeployment(milestone.deploymentUrl);
      }

      // 3. Run Gemini AI Code Reviewer
      const taskRequirements = `${milestone.job.title} - ${milestone.title}: ${milestone.description}`;
      const deliverableSummary = `GitHub PR: ${milestone.githubPrUrl || 'N/A'}, Deployment: ${milestone.deploymentUrl || 'N/A'}, Notes: ${milestone.deliverableLink || 'N/A'}`;

      const aiReviewResult = await codeReviewerAI.evaluateDeliverable(taskRequirements, deliverableSummary);

      const isApproved = aiReviewResult.passed && (githubResult ? githubResult.isMerged : true);
      const newStatus = isApproved ? MilestoneStatus.APPROVED : MilestoneStatus.SUBMITTED;

      // Update milestone DB record with verification results
      const verifiedMilestone = await prisma.milestone.update({
        where: { id },
        data: {
          aiReviewScore: aiReviewResult.score,
          status: newStatus
        },
        include: { job: true }
      });

      res.json({
        message: 'Milestone verification pipeline completed',
        milestone: verifiedMilestone,
        pipelineResults: {
          githubOracle: githubResult,
          deploymentOracle: deploymentResult,
          aiReviewer: aiReviewResult
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Verification pipeline failed', message: error.message });
    }
  }

  /**
   * POST /api/milestones/:id/release
   * Client approves milestone deliverable and triggers on-chain escrow payout
   */
  public async releaseMilestone(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);

      const milestone = await prisma.milestone.findUnique({
        where: { id },
        include: { job: true }
      });

      if (!milestone || !milestone.job.escrowAddress) {
        res.status(404).json({ error: 'Milestone or valid Escrow Vault address not found' });
        return;
      }

      // Trigger Smart Contract Release
      const releaseResult = await escrowService.releaseMilestonePayment(milestone.job.escrowAddress, 1);

      // Update DB Status
      const releasedMilestone = await prisma.milestone.update({
        where: { id },
        data: { status: MilestoneStatus.RELEASED },
        include: { job: true }
      });

      res.json({
        message: 'Milestone payout released on-chain successfully',
        milestone: releasedMilestone,
        txHash: releaseResult.txHash
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to release milestone payout', message: error.message });
    }
  }
}

export const milestoneController = new MilestoneController();
