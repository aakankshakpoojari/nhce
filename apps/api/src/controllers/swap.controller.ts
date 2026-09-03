/**
 * @file swap.controller.ts
 * @description Uniswap V3 Swap Routing Controller.
 * Provides exchange rate calculations, testnet liquidity fallback quotes, minimum amounts received, and transaction payload builders.
 */

import { Request, Response } from 'express';
import { swapService } from '../services/web3/swap.service';

export class SwapController {
  /**
   * GET /api/swap/quote
   * Compute live execution quote, minimum received amount considering slippage, and price impact
   */
  public async getSwapQuote(req: Request, res: Response): Promise<void> {
    try {
      const { tokenIn, tokenOut, amountIn, slippageTolerance, feeTier, recipient } = req.query;

      if (!amountIn) {
        res.status(400).json({ error: 'Missing required query parameter: amountIn' });
        return;
      }

      const quote = await swapService.getSwapQuote({
        tokenIn: (tokenIn as string) || 'ETH',
        tokenOut: (tokenOut as string) || 'USDC',
        amountIn: amountIn as string,
        slippageTolerance: slippageTolerance ? parseFloat(slippageTolerance as string) : 0.5,
        feeTier: feeTier ? parseInt(feeTier as string, 10) : 3000,
        recipient: recipient as string
      });

      res.json({
        success: true,
        data: quote
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to generate swap quote', message: error.message });
    }
  }

  /**
   * POST /api/swap/build-tx
   * Returns constructed calldata & payload for frontend (MetaMask) execution
   */
  public async buildSwapTx(req: Request, res: Response): Promise<void> {
    try {
      const { tokenIn, tokenOut, amountIn, slippageTolerance, recipient, feeTier } = req.body;

      if (!amountIn || !recipient) {
        res.status(400).json({ error: 'Missing required fields: amountIn and recipient are required' });
        return;
      }

      const txPayload = swapService.buildSwapTransaction({
        tokenIn: tokenIn || 'ETH',
        tokenOut: tokenOut || 'USDC',
        amountIn,
        slippageTolerance: slippageTolerance !== undefined ? parseFloat(slippageTolerance) : 0.5,
        recipient,
        feeTier: feeTier ? parseInt(feeTier, 10) : 3000
      });

      res.json({
        success: true,
        data: {
          txPayload
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to build swap transaction payload', message: error.message });
    }
  }
}

export const swapController = new SwapController();
