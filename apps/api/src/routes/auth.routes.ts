/**
 * @file auth.routes.ts
 * @description Authentication & Profile API Route Definitions.
 */

import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/nonce', (req, res) => authController.getNonce(req, res));
router.post('/verify', (req, res) => authController.verifySiweSignature(req, res));
router.get('/profile', authenticateToken, (req, res) => authController.getProfile(req, res));
router.put('/profile', authenticateToken, (req, res) => authController.updateProfile(req, res));

export default router;
