/**
 * @file swap.routes.ts
 * @description Uniswap V3 Swap Quotes & Payload Generator API Route Definitions.
 */

import { Router } from 'express';
import { swapController } from '../controllers/swap.controller';

const router = Router();

router.get('/quote', (req, res) => swapController.getSwapQuote(req, res));
router.post('/build-tx', (req, res) => swapController.buildSwapTx(req, res));

export default router;
