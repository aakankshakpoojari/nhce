/**
 * @file notification.routes.ts
 * @description In-app notification routes. All require a valid Bearer JWT.
 */

import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, (req, res) => notificationController.list(req, res));
router.post('/read-all', authenticateToken, (req, res) => notificationController.markAllRead(req, res));
router.post('/:id/read', authenticateToken, (req, res) => notificationController.markRead(req, res));

export default router;
