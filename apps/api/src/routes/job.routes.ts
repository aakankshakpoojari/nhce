/**
 * @file job.routes.ts
 * @description Job, Application & Escrow API Route Definitions.
 */

import { Router } from 'express';
import { jobController } from '../controllers/job.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { checkJobPostingLimit, checkJobApplicationLimit } from '../middlewares/subscriptionLimit.middleware';

const router = Router();

// Marketplace discovery (public browse)
router.get('/', (req, res) => jobController.getJobs(req, res));

// Authenticated collections (registered before /:id)
router.get('/my', authenticateToken, (req, res) => jobController.getMyJobs(req, res));

// Job details
router.get('/:id', (req, res) => jobController.getJobById(req, res));

// Job creation & management (client only — enforced inside the controller)
router.post('/', authenticateToken, checkJobPostingLimit, (req, res) => jobController.createJob(req, res));
router.patch('/:id', authenticateToken, (req, res) => jobController.updateJob(req, res));
router.post('/:id/publish', authenticateToken, (req, res) => jobController.publishJob(req, res));

// Applications
router.get('/:id/applications', authenticateToken, (req, res) => jobController.getJobApplications(req, res));
router.post('/:id/applications', authenticateToken, checkJobApplicationLimit, (req, res) => jobController.applyToJob(req, res));
router.post('/:id/apply', authenticateToken, checkJobApplicationLimit, (req, res) => jobController.applyToJob(req, res));
router.post('/:id/applications/:applicationId/review', authenticateToken, (req, res) => jobController.reviewApplication(req, res));
router.post('/:id/applications/:applicationId/reject', authenticateToken, (req, res) => jobController.rejectApplication(req, res));

// Freelancer selection (client only — enforced inside the controller)
router.post('/:id/select', authenticateToken, (req, res) => jobController.selectFreelancer(req, res));
router.post('/:id/select-freelancer', authenticateToken, (req, res) => jobController.selectFreelancer(req, res));

// Escrow funding (later lifecycle phase)
router.post('/:id/fund', authenticateToken, (req, res) => jobController.fundJobEscrow(req, res));

export default router;
