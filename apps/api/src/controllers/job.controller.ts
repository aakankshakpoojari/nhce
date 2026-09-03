/**
 * @file job.controller.ts
 * @description Job & Escrow Management Controller.
 * Handles job registration with milestone breakdowns, job listings with filters,
 * freelancer application triggers, freelancer selection, and escrow vault funding.
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../config/db.config';
import { escrowService } from '../services/web3/escrow.service';
import { JobStatus, MilestoneStatus } from '@prisma/client';

export class JobController {
  /**
   * POST /api/jobs
   * Create a new job posting with milestone allocations
   */
  public async createJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { title, description, budget, tokenSymbol = 'ETH', milestones } = req.body;

      if (!title || !description || budget === undefined || !Array.isArray(milestones) || milestones.length === 0) {
        res.status(400).json({ error: 'Invalid input payload: title, description, budget, and milestones are required' });
        return;
      }

      // Create Job and Milestones in Prisma
      const newJob = await prisma.job.create({
        data: {
          title,
          description,
          budget: parseFloat(budget),
          tokenSymbol,
          clientId: req.user.id,
          status: JobStatus.OPEN,
          milestones: {
            create: milestones.map((m: any) => ({
              title: m.title,
              description: m.description,
              amount: parseFloat(m.amount),
              status: MilestoneStatus.PENDING
            }))
          }
        },
        include: { milestones: true }
      });

      // Increment Client's posted job counter (for metrics)
      await prisma.user.update({
        where: { id: req.user.id },
        data: { jobsPostedCount: { increment: 1 } }
      });

      res.status(201).json({ message: 'Job created successfully', job: newJob });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create job', message: error.message });
    }
  }

  /**
   * GET /api/jobs
   * Get all active jobs with optional status filter (e.g. ?status=OPEN, IN_PROGRESS, COMPLETED, DISPUTED)
   */
  public async getJobs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      const whereClause: any = {};

      if (status && Object.values(JobStatus).includes(status as JobStatus)) {
        whereClause.status = status as JobStatus;
      }

      const jobs = await prisma.job.findMany({
        where: whereClause,
        include: {
          client: true,
          freelancer: true,
          milestones: true,
          applications: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ jobs });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch jobs', message: error.message });
    }
  }

  /**
   * GET /api/jobs/:id
   * Get specific job details
   */
  public async getJobById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const job = await prisma.job.findUnique({
        where: { id },
        include: {
          client: true,
          freelancer: true,
          milestones: true,
          applications: { include: { freelancer: true } },
          disputes: true
        }
      });

      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      res.json({ job });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch job details', message: error.message });
    }
  }

  /**
   * POST /api/jobs/:id/apply
   * Freelancer applies to a job with pitch, requested rate, and wallet address
   */
  public async applyToJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const jobId = String(req.params.id);
      const { pitch, requestedRate, walletAddress } = req.body;

      if (!pitch || requestedRate === undefined) {
        res.status(400).json({ error: 'Invalid input payload: pitch and requestedRate are required' });
        return;
      }

      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      if (job.status !== JobStatus.OPEN) {
        res.status(400).json({ error: 'Job is not open for applications' });
        return;
      }

      const applicantWallet = walletAddress || req.user.walletAddress;

      // Upsert Job Application
      const application = await prisma.jobApplication.upsert({
        where: {
          jobId_freelancerId: {
            jobId,
            freelancerId: req.user.id
          }
        },
        update: {
          pitch,
          requestedRate: parseFloat(requestedRate),
          walletAddress: applicantWallet
        },
        create: {
          jobId,
          freelancerId: req.user.id,
          pitch,
          requestedRate: parseFloat(requestedRate),
          walletAddress: applicantWallet
        }
      });

      // Increment Freelancer's applied jobs counter (for metrics)
      await prisma.user.update({
        where: { id: req.user.id },
        data: { jobsAppliedCount: { increment: 1 } }
      });

      res.status(201).json({
        message: 'Application submitted successfully',
        application
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to submit application', message: error.message });
    }
  }

  /**
   * POST /api/jobs/:id/select-freelancer
   * Client selects a freelancer and locks job state to IN_PROGRESS
   */
  public async selectFreelancer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const id = String(req.params.id);
      const { freelancerId, freelancerAddress } = req.body;

      const job = await prisma.job.findUnique({ where: { id } });
      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      if (job.clientId !== req.user.id) {
        res.status(403).json({ error: 'Forbidden: Only the client who posted the job can select a freelancer' });
        return;
      }

      let selectedFreelancerId = freelancerId;

      if (!selectedFreelancerId && freelancerAddress) {
        const freelancerUser = await prisma.user.findUnique({
          where: { walletAddress: freelancerAddress }
        });
        if (freelancerUser) {
          selectedFreelancerId = freelancerUser.id;
        }
      }

      if (!selectedFreelancerId) {
        res.status(400).json({ error: 'Valid freelancerId or freelancerAddress is required' });
        return;
      }

      const updatedJob = await prisma.job.update({
        where: { id },
        data: {
          freelancerId: selectedFreelancerId,
          status: JobStatus.IN_PROGRESS
        },
        include: { client: true, freelancer: true, milestones: true }
      });

      res.json({
        message: 'Freelancer selected successfully. Contract status set to IN_PROGRESS.',
        job: updatedJob
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to select freelancer', message: error.message });
    }
  }

  /**
   * POST /api/jobs/:id/fund
   * Client links deployed JobEscrow vault contract address from Sepolia Devnet or deploys new vault
   */
  public async fundJobEscrow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const id = String(req.params.id);
      const { escrowAddress, freelancerAddress, tokenAddress = '0x0000000000000000000000000000000000000000' } = req.body;

      const job = await prisma.job.findUnique({
        where: { id },
        include: { freelancer: true }
      });

      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      let finalEscrowAddress = escrowAddress;
      let vaultResult: { escrowAddress: string; txHash: string } | null = null;

      // If client provides a pre-deployed escrowAddress from Sepolia Devnet, link directly
      if (!finalEscrowAddress) {
        const targetFreelancerAddr = freelancerAddress || job.freelancer?.walletAddress || '0x0000000000000000000000000000000000000000';
        const fundingWei = BigInt(Math.floor(job.budget * 1e18)).toString();
        vaultResult = await escrowService.createJobEscrowVault(job.id, targetFreelancerAddr, tokenAddress, fundingWei);
        finalEscrowAddress = vaultResult.escrowAddress;
      }

      // Update Job status and escrow address in DB
      const updatedJob = await prisma.job.update({
        where: { id },
        data: {
          escrowAddress: finalEscrowAddress,
          status: JobStatus.IN_PROGRESS
        },
        include: { client: true, freelancer: true, milestones: true }
      });

      res.json({
        message: 'Job escrow vault linked and funded successfully',
        job: updatedJob,
        vault: vaultResult || { escrowAddress: finalEscrowAddress }
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Escrow funding failed', message: error.message });
    }
  }
}

export const jobController = new JobController();
