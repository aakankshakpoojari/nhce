/**
 * @file withdrawal.controller.ts
 * @description Controller for Token Withdrawal & Currency Selection API.
 */

import { Request, Response } from 'express';
import { withdrawalService } from '../services/withdrawal.service';

export class WithdrawalController {
  /**
   * POST /api/withdrawal/prepare
   * Prepares withdrawal options breakdown (Direct transfer vs Uniswap V3 Auto-Swap route)
   * and builds unsigned transaction execution payload.
   */
  public async prepareWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const { userWallet, sourceAmount, sourceToken, requestedTargetToken, slippageTolerance } = req.body;

      if (!userWallet || !sourceAmount) {
        res.status(400).json({
          error: 'Missing required parameters',
          message: 'userWallet and sourceAmount are required'
        });
        return;
      }

      const preparation = await withdrawalService.prepareWithdrawal({
        userWallet,
        sourceAmount,
        sourceToken: sourceToken || 'ETH',
        requestedTargetToken: requestedTargetToken || 'ETH',
        slippageTolerance: slippageTolerance !== undefined ? parseFloat(slippageTolerance) : 0.5
      });

      res.json({
        success: true,
        data: preparation
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to prepare withdrawal transaction',
        message: error.message
      });
    }
  }
}

export const withdrawalController = new WithdrawalController();
