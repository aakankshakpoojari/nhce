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
   * Freelancer submits deliverable work proofs (githubPrUrl, deploymentUrl, completion notes / deliverableLink)
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

      res.json({
        message: 'Milestone deliverable submitted successfully',
        milestone: updatedMilestone
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to submit milestone deliverable', message: error.message });
    }
  }

  /**
   * POST /api/milestones/:id/verify
   * Trigger 3-tier automated verification pipeline (GitHub Oracle + Deployment Oracle + Gemini AI)
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

      // 1. GitHub Oracle Check (if GitHub PR URL provided)
      let githubResult = null;
      if (milestone.githubPrUrl) {
        githubResult = await githubOracle.verifyPullRequest(milestone.githubPrUrl);
      }

      // 2. Deployment Oracle Check (if Live URL provided)
      let deploymentResult = null;
      if (milestone.deploymentUrl) {
        deploymentResult = await deploymentOracle.verifyDeployment(milestone.deploymentUrl);
      }

      // 3. Gemini AI Code Reviewer
      const taskRequirements = `${milestone.job.title} - ${milestone.title}: ${milestone.description}`;
      const deliverableSummary = `GitHub PR: ${milestone.githubPrUrl || 'N/A'}, Deployment: ${milestone.deploymentUrl || 'N/A'}, Notes: ${milestone.deliverableLink || 'N/A'}`;

      const aiReviewResult = await codeReviewerAI.evaluateDeliverable(taskRequirements, deliverableSummary);

      const isApproved = aiReviewResult.passed && (githubResult ? githubResult.isMerged : true) && (deploymentResult ? deploymentResult.isLive : true);
      const newStatus = isApproved ? MilestoneStatus.APPROVED : MilestoneStatus.SUBMITTED;

      // Update milestone DB record with verification score and status
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
        verificationScore: aiReviewResult.score,
        aiSummary: aiReviewResult.summary,
        status: newStatus,
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
   * Client approves milestone deliverable and triggers on-chain escrow payout for JobEscrow.sol on Sepolia
   */
  public async releaseMilestone(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const escrowAddress = milestone.job.escrowAddress || '0x' + '1'.repeat(40);

      // Trigger Smart Contract Release call on Sepolia Devnet
      const releaseResult = await escrowService.releaseMilestonePayment(escrowAddress, 1);

      // Update DB Status to RELEASED
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
