/**
 * @file stablecoin.controller.ts
 * @description Cross-Border Stablecoin Intelligence controller.
 * Serves normalized stablecoin market data from the stablecoin service.
 */

import { Request, Response } from 'express';
import { stablecoinService } from '../services/stablecoin.service';

export class StablecoinController {
  /**
   * GET /api/stablecoins
   * Returns stablecoin market data (LIVE / CACHED / FALLBACK) with
   * Dracarys settlement metadata. Public endpoint — market data is not
   * user-private, mirroring the public marketplace browse routes.
   */
  public async getMarkets(_req: Request, res: Response): Promise<void> {
    try {
      const data = await stablecoinService.getStablecoinMarkets();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch stablecoin market data', message: error.message });
    }
  }
}

export const stablecoinController = new StablecoinController();