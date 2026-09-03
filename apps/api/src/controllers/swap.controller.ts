/**
 * @file swap.controller.ts
 * @description Uniswap V3 Swap Routing Controller.
 * Provides exchange rate calculations, testnet liquidity fallback quotes, and transaction payload builders.
 */

import { Request, Response } from 'express';
import { swapService } from '../services/web3/swap.service';

export class SwapController {
  /**
   * GET /api/swap/quote
   * Compute token-to-stablecoin exchange rate and build transaction payload
   */
  public async getSwapQuote(req: Request, res: Response): Promise<void> {
    try {
      const { tokenIn, tokenOut, amountIn, feeTier } = req.query;

      if (!amountIn) {
        res.status(400).json({ error: 'Missing required query parameter: amountIn' });
        return;
      }

      const quote = await swapService.getSwapQuote({
        tokenIn: (tokenIn as string) || '',
        tokenOut: (tokenOut as string) || '',
        amountIn: amountIn as string,
        feeTier: feeTier ? parseInt(feeTier as string, 10) : 3000
      });

      res.json({ quote });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to generate swap quote', message: error.message });
    }
  }
}

export const swapController = new SwapController();
