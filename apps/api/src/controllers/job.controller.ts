/**
 * @file job.controller.ts
 * @description Job & Escrow Management Controller.
 * Handles job registration with milestone breakdowns, job listings, freelancer application triggers, and escrow funding.
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

      if (!title || !description || !budget || !Array.isArray(milestones) || milestones.length === 0) {
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

      // Increment Client's posted job counter
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
   * Get all active jobs
   */
  public async getJobs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const jobs = await prisma.job.findMany({
        include: { client: true, milestones: true },
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
        include: { client: true, freelancer: true, milestones: true, disputes: true }
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
   * POST /api/jobs/:id/fund
   * Fund job and deploy smart contract Escrow Vault on Devnet
   */
  public async fundJobEscrow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const id = String(req.params.id);
      const { freelancerAddress, tokenAddress = '0x0000000000000000000000000000000000000000' } = req.body;

      const job = await prisma.job.findUnique({ where: { id } });
      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      // Call Escrow Service to deploy JobEscrow vault on Sepolia Devnet
      const fundingWei = (job.budget * 1e18).toString();
      const vaultResult = await escrowService.createJobEscrowVault(job.id, freelancerAddress, tokenAddress, fundingWei);

      // Update Job status and escrow address in DB
      const updatedJob = await prisma.job.update({
        where: { id },
        data: {
          escrowAddress: vaultResult.escrowAddress,
          status: JobStatus.IN_PROGRESS
        }
      });

      res.json({
        message: 'Job escrow vault created and funded successfully',
        job: updatedJob,
        vault: vaultResult
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Escrow funding failed', message: error.message });
    }
  }
}

export const jobController = new JobController();
