/**
 * @file subscription.routes.ts
 * @description Freemium & Pro Subscription Tier API Route Definitions.
 */

import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/status', authenticateToken, (req, res) => subscriptionController.getSubscriptionStatus(req, res));
router.post('/upgrade', authenticateToken, (req, res) => subscriptionController.upgradeToPro(req, res));

export default router;
