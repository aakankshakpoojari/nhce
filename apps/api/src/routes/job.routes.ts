/**
 * @file job.routes.ts
 * @description Job & Escrow API Route Definitions.
 */

import { Router } from 'express';
import { jobController } from '../controllers/job.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { checkJobPostingLimit } from '../middlewares/subscriptionLimit.middleware';

const router = Router();

router.get('/', (req, res) => jobController.getJobs(req, res));
router.get('/:id', (req, res) => jobController.getJobById(req, res));
router.post('/', authenticateToken, checkJobPostingLimit, (req, res) => jobController.createJob(req, res));
router.post('/:id/fund', authenticateToken, (req, res) => jobController.fundJobEscrow(req, res));

export default router;
