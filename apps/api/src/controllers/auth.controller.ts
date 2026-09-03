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
   * Fetch current authenticated user profile
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
      if (!req.user || !req.user.id) {
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
