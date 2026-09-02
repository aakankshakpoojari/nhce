/**
 * @file webhook.routes.ts
 * @description Webhook Event Listener API Route Definitions.
 */

import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';

const router = Router();

router.post('/github', (req, res) => webhookController.handleGitHubWebhook(req, res));

export default router;
