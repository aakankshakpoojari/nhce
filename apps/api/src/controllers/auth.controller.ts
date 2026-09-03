/**
 * @file auth.controller.ts
 * @description Authentication & Profile Management Controller.
 * Handles Email/Password registration, Login, JWT verification, and Profile management.
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.config';
import { env } from '../config/env.config';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * Fields safe to return to the client.
 * NEVER includes passwordHash or siweNonce, and avoids leaking internal columns.
 */
function toPublicProfile(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    walletAddress: user.walletAddress,
    bio: user.bio,
    location: user.location,
    rating: user.rating,
    portfolioLinks: user.portfolioLinks,
    jobsPostedCount: user.jobsPostedCount,
    jobsAppliedCount: user.jobsAppliedCount,
    createdAt: user.createdAt
  };
}

export class AuthController {
  /**
   * POST /api/auth/signup
   * Register new user with email, password, name, and role
   */
  public async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });

      if (existingUser) {
        res.status(400).json({ error: 'User with this email already exists' });
        return;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create new user
      const userRole = role === 'CLIENT' ? 'CLIENT' : 'FREELANCER';
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          name: name || normalizedEmail.split('@')[0],
          role: userRole,
          walletAddress: null,
          isPro: false,
          jobsPostedCount: 0,
          jobsAppliedCount: 0,
          portfolioLinks: []
        }
      });

      // Generate JWT Token
      const tokenPayload = {
        id: user.id,
        sub: user.id,
        email: user.email,
        role: user.role,
        isPro: user.isPro
      };

      const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
        expiresIn: '7d'
      });

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          walletAddress: user.walletAddress,
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
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Registration failed', message: error.message });
    }
  }

  /**
   * POST /api/auth/login
   * Authenticate user with email and password
   */
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const normalizedEmail = email.toLowerCase().trim();

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });

      if (!user || !user.passwordHash) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Generate JWT Token
      const tokenPayload = {
        id: user.id,
        sub: user.id,
        email: user.email,
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
          email: user.email,
          name: user.name,
          role: user.role,
          walletAddress: user.walletAddress,
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
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed', message: error.message });
    }
  }

  /**
   * GET /api/auth/me
   * Fetch authenticated user's profile from database
   */
  public async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
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

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        walletAddress: user.walletAddress,
        bio: user.bio,
        location: user.location,
        rating: user.rating,
        portfolioLinks: user.portfolioLinks,
        isPro: user.isPro,
        jobsPostedCount: user.jobsPostedCount,
        jobsAppliedCount: user.jobsAppliedCount
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch profile', message: error.message });
    }
  }

  /**
   * POST /api/auth/logout
   */
  public async logout(_req: Request, res: Response): Promise<void> {
    res.json({ message: 'Logged out successfully' });
  }

  /**
   * GET /api/auth/profile
   * Fetch current authenticated user's public profile fields.
   */
  public async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
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

      res.json({ user: toPublicProfile(user) });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch profile', message: error.message });
    }
  }

  /**
   * POST /api/auth/connect-wallet
   * Link a MetaMask (EVM) wallet address to the authenticated user's profile.
   * The address is unique platform-wide: linking one already held by another
   * account is rejected.
   */
  public async connectWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const raw = typeof req.body?.walletAddress === 'string' ? req.body.walletAddress.trim() : '';
      if (!raw) {
        res.status(400).json({ error: 'walletAddress is required' });
        return;
      }

      const walletAddress = raw.toLowerCase();
      if (!/^0x[a-f0-9]{40}$/.test(walletAddress)) {
        res.status(400).json({ error: 'Invalid Ethereum wallet address' });
        return;
      }

      const holder = await prisma.user.findUnique({ where: { walletAddress } });
      if (holder && holder.id !== req.user.id) {
        res.status(409).json({
          error: 'Wallet already linked',
          message: 'This wallet address is already linked to another account'
        });
        return;
      }

      try {
        const user = await prisma.user.update({
          where: { id: req.user.id },
          data: { walletAddress }
        });
        res.json(this.serializeUser(user));
      } catch (err: any) {
        if (err?.code === 'P2002') {
          res.status(409).json({
            error: 'Wallet already linked',
            message: 'This wallet address is already linked to another account'
          });
          return;
        }
        throw err;
      }
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to connect wallet', message: error.message });
    }
  }

  /**
   * POST /api/auth/disconnect-wallet
   * Remove the wallet address from the authenticated user's profile.
   */
  public async disconnectWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { walletAddress: null }
      });

      res.json(this.serializeUser(user));
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to disconnect wallet', message: error.message });
    }
  }

  /** Public-facing user shape, matching GET /api/auth/me. */
  private serializeUser(user: {
    id: string; email: string | null; name: string | null; role: string;
    walletAddress: string | null; bio: string | null; location: string | null;
    rating: number; portfolioLinks: string[]; isPro: boolean;
    jobsPostedCount: number; jobsAppliedCount: number;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      walletAddress: user.walletAddress,
      bio: user.bio,
      location: user.location,
      rating: user.rating,
      portfolioLinks: user.portfolioLinks,
      isPro: user.isPro,
      jobsPostedCount: user.jobsPostedCount,
      jobsAppliedCount: user.jobsAppliedCount
    };
  }

  /**
   * PUT /api/auth/profile
   * Update profile fields the user is allowed to edit: name, bio, location,
   * walletAddress, and portfolioLinks. Role/rating/counters are never editable
   * through this endpoint (role identity is assigned at signup).
   */
  public async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { name, bio, location, walletAddress, portfolioLinks } = req.body;

      const data: any = {};
      if (name !== undefined) {
        const trimmed = String(name).trim();
        data.name = trimmed || null;
      }
      if (bio !== undefined) {
        const trimmed = String(bio).trim();
        data.bio = trimmed || null;
      }
      if (location !== undefined) {
        const trimmed = String(location).trim();
        data.location = trimmed || null;
      }
      if (walletAddress !== undefined) {
        const trimmed = String(walletAddress).trim();
        if (trimmed) data.walletAddress = trimmed;
      }
      if (portfolioLinks !== undefined) {
        if (Array.isArray(portfolioLinks)) {
          data.portfolioLinks = portfolioLinks
            .map((link: any) => String(link).trim())
            .filter((link: string) => link.length > 0)
            .slice(0, 50);
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data
      });

      res.json({ message: 'Profile updated successfully', user: toPublicProfile(updatedUser) });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update profile', message: error.message });
    }
  }
}

export const authController = new AuthController();
