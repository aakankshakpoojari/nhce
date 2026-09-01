/**
 * @file dispute.routes.ts
 * @description Decentralized Dispute Resolution & Juror Voting API Route Definitions.
 */

import { Router } from 'express';
import { disputeController } from '../controllers/dispute.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:id', authenticateToken, (req, res) => disputeController.getDisputeById(req, res));
router.post('/open', authenticateToken, (req, res) => disputeController.openDispute(req, res));
router.post('/:id/vote', authenticateToken, (req, res) => disputeController.castVote(req, res));
router.post('/:id/claim-reward', authenticateToken, (req, res) => disputeController.claimReward(req, res));

export default router;
