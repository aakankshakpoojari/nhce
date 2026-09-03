/**
 * @file withdrawal.routes.ts
 * @description Currency Selection & Withdrawal API Route Definitions.
 */

import { Router } from 'express';
import { withdrawalController } from '../controllers/withdrawal.controller';

const router = Router();

router.post('/prepare', (req, res) => withdrawalController.prepareWithdrawal(req, res));

export default router;
