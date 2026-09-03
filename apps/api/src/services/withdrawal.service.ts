/**
 * @file withdrawal.service.ts
 * @description Currency Selection & Withdrawal Pipeline Service.
 * Evaluates requested target withdrawal token (ETH, USDC, USDT) against escrow source balances.
 * Generates direct EVM transfer payloads for same-currency withdrawals or auto-converts via Uniswap V3 swap route.
 */

import { ethers } from 'ethers';
import { swapService } from './web3/swap.service';
import { ERC20_ABI } from '../config/web3.config';

export interface IWithdrawalPrepareRequest {
  userWallet: string;
  sourceAmount: string;
  sourceToken: string; // e.g. "ETH", "USDC", "USDT"
  requestedTargetToken: string; // e.g. "ETH", "USDC", "USDT"
  slippageTolerance?: number;
}

export interface IWithdrawalPrepareResponse {
  userWallet: string;
  withdrawalType: 'DIRECT' | 'SWAP';
  sourceToken: string;
  sourceAmount: string;
  targetToken: string;
  expectedTargetAmount: string;
  minimumReceived?: string;
  slippageTolerance?: number;
  conversionRoute: string;
  txPayload: {
    to: string;
    data: string;
    value: string;
    gasLimit: string;
  };
  isFallbackQuote?: boolean;
}

export class WithdrawalService {
  /**
   * Prepare withdrawal options & build unsigned execution payload
   */
  public async prepareWithdrawal(params: IWithdrawalPrepareRequest): Promise<IWithdrawalPrepareResponse> {
    const { userWallet, sourceAmount, sourceToken, requestedTargetToken, slippageTolerance } = params;

    if (!userWallet || !ethers.isAddress(userWallet)) {
      throw new Error('Invalid userWallet address provided');
    }

    if (!sourceAmount || parseFloat(sourceAmount) <= 0) {
      throw new Error('sourceAmount must be a positive number');
    }

    const resolvedSource = swapService.resolveToken(sourceToken || 'ETH');
    const resolvedTarget = swapService.resolveToken(requestedTargetToken || 'ETH');

    // Case 1 (Same Token): If sourceToken == requestedTargetToken or same resolved token symbol
    const isSameToken = resolvedSource.symbol === resolvedTarget.symbol ||
      (resolvedSource.isNative && resolvedTarget.isNative) ||
      (resolvedSource.address.toLowerCase() === resolvedTarget.address.toLowerCase() && !resolvedSource.isNative && !resolvedTarget.isNative);

    if (isSameToken) {
      if (resolvedSource.isNative) {
        // Direct Native ETH Transfer payload
        const amountWei = ethers.parseEther(sourceAmount);
        return {
          userWallet,
          withdrawalType: 'DIRECT',
          sourceToken: 'ETH',
          sourceAmount,
          targetToken: 'ETH',
          expectedTargetAmount: sourceAmount,
          conversionRoute: 'DIRECT_TRANSFER',
          txPayload: {
            to: userWallet,
            data: '0x',
            value: amountWei.toString(),
            gasLimit: '21000'
          }
        };
      } else {
        // Direct ERC20 Transfer payload (USDC / USDT)
        const erc20Interface = new ethers.Interface(ERC20_ABI);
        const amountWei = ethers.parseUnits(sourceAmount, resolvedSource.decimals);
        const transferData = erc20Interface.encodeFunctionData('transfer', [userWallet, amountWei]);

        return {
          userWallet,
          withdrawalType: 'DIRECT',
          sourceToken: resolvedSource.symbol,
          sourceAmount,
          targetToken: resolvedTarget.symbol,
          expectedTargetAmount: sourceAmount,
          conversionRoute: 'DIRECT_TRANSFER',
          txPayload: {
            to: resolvedSource.address,
            data: transferData,
            value: '0',
            gasLimit: '65000'
          }
        };
      }
    }

    // Case 2 (Different Token): Auto-Swap via Uniswap V3 Pipeline
    const quote = await swapService.getSwapQuote({
      tokenIn: resolvedSource.symbol,
      tokenOut: resolvedTarget.symbol,
      amountIn: sourceAmount,
      slippageTolerance: slippageTolerance !== undefined ? slippageTolerance : 0.5,
      recipient: userWallet
    });

    return {
      userWallet,
      withdrawalType: 'SWAP',
      sourceToken: resolvedSource.symbol,
      sourceAmount,
      targetToken: resolvedTarget.symbol,
      expectedTargetAmount: quote.expectedAmountOut,
      minimumReceived: quote.minimumReceived,
      slippageTolerance: quote.slippageTolerance,
      conversionRoute: 'UNISWAP_V3_SWAP',
      txPayload: quote.txPayload,
      isFallbackQuote: quote.isFallbackQuote
    };
  }
}

export const withdrawalService = new WithdrawalService();
