/**
 * @file errorHandler.middleware.ts
 * @description Centralized Express Global Error Handler.
 * Catches unhandled promise rejections, Zod validation errors, and EVM contract errors.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Unhandled Exception]:', err);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      details: err.errors
    });
    return;
  }

  // Handle EVM revert errors or Ethers RPC errors gracefully
  if (err?.code === 'CALL_EXCEPTION' || err?.info?.error?.code) {
    res.status(400).json({
      error: 'Smart Contract Error',
      message: err.reason || err.message || 'Transaction reverted on-chain'
    });
    return;
  }

  res.status(err.status || 500).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected internal error occurred'
  });
}
