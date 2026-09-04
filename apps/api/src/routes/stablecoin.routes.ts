/**
 * @file stablecoin.routes.ts
 * @description Cross-Border Stablecoin Intelligence API Routes.
 * Public market-data endpoints (no auth — market data is not user-private).
 */

import { Router } from 'express';
import { stablecoinController } from '../controllers/stablecoin.controller';

const router = Router();

// GET /api/stablecoins — live stablecoin market data with Dracarys metadata
router.get('/', (req, res) => stablecoinController.getMarkets(req, res));

export default router;