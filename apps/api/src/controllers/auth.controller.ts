/**
 * @file auth.controller.ts
 * @description Wallet-based Authentication & Profile Management Controller.
 * Handles Sign-In With Ethereum (SIWE) nonce generation, signature verification, JWT issuing, and profile management.
 */

import { Request, Response } from 'express';
import { generateNonce, SiweMessage } from 'siwe';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.config';
import { env } from '../config/env.config';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class AuthController {
  /**
   * GET /api/auth/nonce
   * Generate cryptographic SIWE nonce for wallet signature challenge
   */
  public async getNonce(req: Request, res: Response): Promise<void> {
    try {
      const nonce = generateNonce();
      res.json({ nonce });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to generate SIWE nonce', message: error.message });
    }
  }

  /**
   * POST /api/auth/verify
   * Verify SIWE message signature and issue JWT access token
   */
  public async verifySiweSignature(req: Request, res: Response): Promise<void> {
    try {
      const { message, signature } = req.body;

      if (!message || !signature) {
        res.status(400).json({ error: 'Missing required parameters: message and signature' });
        return;
      }

      const siweMessage = new SiweMessage(message);
      const fields = await siweMessage.verify({ signature });

      const walletAddress = fields.data.address.toLowerCase();

      // Upsert User in Database by Wallet Address
      let user = await prisma.user.findUnique({
        where: { walletAddress }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            walletAddress,
            role: 'FREELANCER',
            isPro: false,
            jobsPostedCount: 0,
            jobsAppliedCount: 0,
            portfolioLinks: []
          }
        });
      }

      // Generate JWT Token
      const tokenPayload = {
        id: user.id,
        walletAddress: user.walletAddress,
        role: user.role,
        isPro: user.isPro
      };

      const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
        expiresIn: '7d'
      });

      res.json({
        token,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          role: user.role,
          name: user.name,
          bio: user.bio,
          location: user.location,
          rating: user.rating,
          portfolioLinks: user.portfolioLinks,
          isPro: user.isPro,
          jobsPostedCount: user.jobsPostedCount,
          jobsAppliedCount: user.jobsAppliedCount
        }
      });
    } catch (error: any) {
      console.error('SIWE Verification error:', error);
      res.status(401).json({ error: 'Authentication failed', message: error.message });
    }
  }

  /**
   * GET /api/auth/profile
   * Fetch current authenticated user profile
   */
  public async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      if (!user) {
        res.status(404).json({ error: 'User profile not found' });
        return;
      }

      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch profile', message: error.message });
    }
  }

  /**
   * PUT /api/auth/profile
   * Update user profile details (role, name, bio, location, portfolio links)
   */
  public async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { name, bio, location, role, portfolioLinks } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(name && { name }),
          ...(bio && { bio }),
          ...(location && { location }),
          ...(role && { role }),
          ...(portfolioLinks && Array.isArray(portfolioLinks) && { portfolioLinks })
        }
      });

      res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update profile', message: error.message });
    }
  }
}

export const authController = new AuthController();
