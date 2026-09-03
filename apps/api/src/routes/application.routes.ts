/**
 * @file application.routes.ts
 * @description Freelancer Application API Route Definitions.
 */

import { Router } from 'express';
import { applicationController } from '../controllers/application.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Authenticated freelancer's own applications
router.get('/my', authenticateToken, (req, res) => applicationController.getMyApplications(req, res));

export default router;