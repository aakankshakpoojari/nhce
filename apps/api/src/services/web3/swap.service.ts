/**
 * @file swap.service.ts
 * @description Token Swap Service wrapping Uniswap V3 SDK / Quoter on Sepolia Devnet.
 * Computes exchange rates, fallback token pair quotes (WETH <-> USDC / USDT),
 * minimum received amounts with slippage tolerance, and SwapRouter02 transaction payload builders.
 */

import { ethers } from 'ethers';
import { env } from '../../config/env.config';
import { provider, UNISWAP_QUOTER_V2_ABI, UNISWAP_V3_SWAP_ROUTER_ABI } from '../../config/web3.config';

export interface ISwapQuoteRequest {
  tokenIn: string;
  tokenOut: string;
  amountIn: string; // Human readable string, e.g. "1.0"
  slippageTolerance?: number; // Percentage, e.g. 0.5 for 0.5%
  feeTier?: number; // Uniswap V3 fee tier (e.g. 3000 = 0.3%, 500 = 0.05%)
  recipient?: string;
}

export interface ISwapQuoteResponse {
  tokenIn: string;
  tokenInAddress: string;
  tokenOut: string;
  tokenOutAddress: string;
  amountIn: string;
  expectedAmountOut: string;
  minimumReceived: string;
  slippageTolerance: number;
  priceImpact: string;
  feeTier: number;
  gasEstimate: string;
  routerAddress: string;
  txPayload: {
    to: string;
    data: string;
    value: string;
    gasLimit: string;
  };
  isFallbackQuote: boolean;
}

export interface IBuildSwapTxRequest {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippageTolerance?: number;
  recipient: string;
  feeTier?: number;
}

export interface IResolvedToken {
  symbol: string;
  address: string;
  decimals: number;
  isNative: boolean;
}

export class SwapService {
  /**
   * Helper to resolve token symbol or address to Sepolia configuration
   */
  public resolveToken(token: string): IResolvedToken {
    if (!token) {
      return { symbol: 'ETH', address: ethers.getAddress(env.WETH_SEPOLIA_ADDRESS.toLowerCase()), decimals: 18, isNative: true };
    }
    const upper = token.trim().toUpperCase();
    const tokenLower = token.toLowerCase();
    const isWethMatch = tokenLower === env.WETH_SEPOLIA_ADDRESS.toLowerCase() ||
                        tokenLower === env.CANONICAL_SEPOLIA_WETH_ADDRESS.toLowerCase();

    if (upper === 'ETH' || token === ethers.ZeroAddress || token === '0x0') {
      return { symbol: 'ETH', address: ethers.getAddress(env.WETH_SEPOLIA_ADDRESS.toLowerCase()), decimals: 18, isNative: true };
    }
    if (upper === 'WETH' || isWethMatch) {
      return { symbol: 'WETH', address: ethers.getAddress(tokenLower === env.CANONICAL_SEPOLIA_WETH_ADDRESS.toLowerCase() ? env.CANONICAL_SEPOLIA_WETH_ADDRESS.toLowerCase() : env.WETH_SEPOLIA_ADDRESS.toLowerCase()), decimals: 18, isNative: false };
    }
    if (upper === 'USDC' || tokenLower === env.USDC_SEPOLIA_ADDRESS.toLowerCase()) {
      return { symbol: 'USDC', address: ethers.getAddress(env.USDC_SEPOLIA_ADDRESS.toLowerCase()), decimals: 6, isNative: false };
    }
    if (upper === 'USDT' || tokenLower === env.USDT_SEPOLIA_ADDRESS.toLowerCase()) {
      return { symbol: 'USDT', address: ethers.getAddress(env.USDT_SEPOLIA_ADDRESS.toLowerCase()), decimals: 6, isNative: false };
    }
    
    // Default for hex addresses
    return { symbol: upper.slice(0, 6), address: ethers.getAddress(token.toLowerCase()), decimals: 18, isNative: false };
  }

  /**
   * Calculate live exchange quote on Uniswap V3 on Sepolia Devnet
   */
  public async getSwapQuote(params: ISwapQuoteRequest): Promise<ISwapQuoteResponse> {
    const feeTier = params.feeTier || 3000; // default 0.3%
    const slippageTolerance = params.slippageTolerance !== undefined ? params.slippageTolerance : 0.5; // default 0.5%
    const recipient = params.recipient && ethers.isAddress(params.recipient)
      ? params.recipient
      : ethers.ZeroAddress;

    const resolvedIn = this.resolveToken(params.tokenIn);
    const resolvedOut = this.resolveToken(params.tokenOut);

    const amountInWei = ethers.parseUnits(params.amountIn || '1.0', resolvedIn.decimals);

    let expectedAmountOutStr = '0';
    let minimumReceivedStr = '0';
    let gasEstimateStr = '150000';
    let isFallbackQuote = false;
    let priceImpactStr = '0.05%';

    try {
      const quoterAddress = ethers.getAddress(env.UNISWAP_V3_QUOTER_ADDRESS.toLowerCase());
      const quoterContract = new ethers.Contract(quoterAddress, UNISWAP_QUOTER_V2_ABI, provider);

      // Attempt live contract call to Uniswap V3 Quoter
      let quoteResult: any;
      try {
        quoteResult = await quoterContract.quoteExactInputSingle.staticCall({
          tokenIn: ethers.getAddress(resolvedIn.address.toLowerCase()),
          tokenOut: ethers.getAddress(resolvedOut.address.toLowerCase()),
          amountIn: amountInWei,
          fee: feeTier,
          sqrtPriceLimitX96: 0
        });
      } catch (structErr) {
        // Fallback for Quoter V1 single arg method if V2 struct method reverts
        quoteResult = await quoterContract['quoteExactInputSingle(address,address,uint24,uint256,uint160)'].staticCall(
          ethers.getAddress(resolvedIn.address.toLowerCase()),
          ethers.getAddress(resolvedOut.address.toLowerCase()),
          feeTier,
          amountInWei,
          0
        );
      }

      const amountOutRaw = typeof quoteResult === 'object' && quoteResult.amountOut ? quoteResult.amountOut : quoteResult;
      const gasEst = typeof quoteResult === 'object' && quoteResult.gasEstimate ? quoteResult.gasEstimate.toString() : '150000';

      const amountOutFormatted = ethers.formatUnits(amountOutRaw, resolvedOut.decimals);
      expectedAmountOutStr = parseFloat(amountOutFormatted).toFixed(6);
      gasEstimateStr = gasEst;

    } catch (error: any) {
      console.warn(`[SwapService] Uniswap V3 Quoter live call skipped/failed on Sepolia (${error.message}). Using standard devnet rate calculation.`);
      isFallbackQuote = true;
      
      // Fallback devnet market rates:
      // 1 ETH / WETH = 2600.00 USDC / USDT
      // 1 USDC = 1.00 USDT
      const inSym = resolvedIn.symbol.toUpperCase();
      const outSym = resolvedOut.symbol.toUpperCase();

      let rate = 1.0;
      if ((inSym === 'ETH' || inSym === 'WETH') && (outSym === 'USDC' || outSym === 'USDT')) {
        rate = 2600.0;
      } else if ((inSym === 'USDC' || inSym === 'USDT') && (outSym === 'ETH' || outSym === 'WETH')) {
        rate = 1 / 2600.0;
      } else if (inSym === outSym || (inSym === 'USDC' && outSym === 'USDT') || (inSym === 'USDT' && outSym === 'USDC')) {
        rate = 1.0;
      } else {
        rate = 2600.0;
      }

      const amountInNum = parseFloat(params.amountIn || '1.0');
      expectedAmountOutStr = (amountInNum * rate).toFixed(resolvedOut.decimals === 6 ? 2 : 6);
      priceImpactStr = '0.01%';
    }

    // Calculate minimum received amount considering slippage
    const expectedOutNum = parseFloat(expectedAmountOutStr);
    const minRecNum = expectedOutNum * (1 - slippageTolerance / 100);
    minimumReceivedStr = minRecNum.toFixed(resolvedOut.decimals === 6 ? 2 : 6);

    // Build tx payload for router call execution
    const txPayload = this.buildSwapTransactionPayload({
      tokenIn: resolvedIn.address,
      tokenOut: resolvedOut.address,
      amountInWei,
      minimumReceivedWei: ethers.parseUnits(minimumReceivedStr, resolvedOut.decimals),
      recipient,
      feeTier,
      isNativeIn: resolvedIn.isNative
    });

    return {
      tokenIn: resolvedIn.symbol,
      tokenInAddress: resolvedIn.address,
      tokenOut: resolvedOut.symbol,
      tokenOutAddress: resolvedOut.address,
      amountIn: params.amountIn,
      expectedAmountOut: expectedAmountOutStr,
      minimumReceived: minimumReceivedStr,
      slippageTolerance,
      priceImpact: priceImpactStr,
      feeTier,
      gasEstimate: gasEstimateStr,
      routerAddress: env.UNISWAP_V3_SWAP_ROUTER_ADDRESS,
      txPayload,
      isFallbackQuote
    };
  }

  /**
   * Build unsigned SwapRouter transaction payload for frontend (MetaMask) signing
   */
  public buildSwapTransaction(params: IBuildSwapTxRequest) {
    const resolvedIn = this.resolveToken(params.tokenIn);
    const resolvedOut = this.resolveToken(params.tokenOut);

    const feeTier = params.feeTier || 3000;
    const slippageTolerance = params.slippageTolerance !== undefined ? params.slippageTolerance : 0.5;

    const amountInWei = ethers.parseUnits(params.amountIn, resolvedIn.decimals);
    
    // Estimate minimum received based on slippage if not provided
    // For buildSwapTransaction, we calculate min amount out
    const defaultRate = (resolvedIn.symbol === 'ETH' || resolvedIn.symbol === 'WETH') ? 2600.0 : 1.0;
    const expectedOut = parseFloat(params.amountIn) * defaultRate;
    const minOut = expectedOut * (1 - slippageTolerance / 100);
    const minimumReceivedWei = ethers.parseUnits(minOut.toFixed(resolvedOut.decimals === 6 ? 2 : 6), resolvedOut.decimals);

    return this.buildSwapTransactionPayload({
      tokenIn: resolvedIn.address,
      tokenOut: resolvedOut.address,
      amountInWei,
      minimumReceivedWei,
      recipient: params.recipient,
      feeTier,
      isNativeIn: resolvedIn.isNative
    });
  }

  /**
   * Encodes SwapRouter02 exactInputSingle function call payload
   */
  private buildSwapTransactionPayload(opts: {
    tokenIn: string;
    tokenOut: string;
    amountInWei: bigint;
    minimumReceivedWei: bigint;
    recipient: string;
    feeTier: number;
    isNativeIn: boolean;
  }): { to: string; data: string; value: string; gasLimit: string } {
    const routerInterface = new ethers.Interface(UNISWAP_V3_SWAP_ROUTER_ABI);
    const routerAddress = ethers.getAddress(env.UNISWAP_V3_SWAP_ROUTER_ADDRESS);

    const exactInputSingleParams = {
      tokenIn: ethers.getAddress(opts.tokenIn),
      tokenOut: ethers.getAddress(opts.tokenOut),
      fee: opts.feeTier,
      recipient: opts.recipient && ethers.isAddress(opts.recipient) ? ethers.getAddress(opts.recipient) : ethers.ZeroAddress,
      amountIn: opts.amountInWei,
      amountOutMinimum: opts.minimumReceivedWei,
      sqrtPriceLimitX96: 0
    };

    const data = routerInterface.encodeFunctionData('exactInputSingle', [exactInputSingleParams]);

    return {
      to: routerAddress,
      data,
      value: opts.isNativeIn ? opts.amountInWei.toString() : '0',
      gasLimit: '210000'
    };
  }
}

export const swapService = new SwapService();
