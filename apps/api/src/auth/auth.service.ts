import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto, LoginDto, ConnectWalletDto } from './dto/auth.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email and password are required.');
    }

    const emailLower = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const roleUpper = dto.role ? dto.role.toUpperCase() : 'FREELANCER';
    const userRole = roleUpper === 'CLIENT' ? Role.CLIENT : Role.FREELANCER;

    try {
      const user = await this.prisma.user.create({
        data: {
          email: emailLower,
          passwordHash,
          name: dto.name?.trim() || emailLower.split('@')[0],
          role: userRole,
        },
      });

      const token = this.generateToken(user.id, user.email, user.role);

      const { passwordHash: _, ...result } = user;
      return {
        token,
        user: result,
      };
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new ConflictException('An account with this email already exists.');
      }
      throw err;
    }
  }

  async login(dto: LoginDto) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email and password are required.');
    }

    const emailLower = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = this.generateToken(user.id, user.email, user.role);

    const { passwordHash: _, ...result } = user;
    return {
      token,
      user: result,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async connectWallet(userId: string, dto: ConnectWalletDto) {
    if (!dto.walletAddress) {
      throw new BadRequestException('Wallet address is required.');
    }

    const normalizedAddress = dto.walletAddress.toLowerCase().trim();

    // Check if wallet address is already bound to ANY other user account
    const existingWalletOwner = await this.prisma.user.findFirst({
      where: {
        walletAddress: normalizedAddress,
      },
    });

    if (existingWalletOwner && existingWalletOwner.id !== userId) {
      throw new ConflictException(
        `Wallet address ${normalizedAddress.slice(0, 6)}...${normalizedAddress.slice(-4)} is already connected to another ${existingWalletOwner.role} account. A wallet address can only be linked to a single account.`,
      );
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { walletAddress: normalizedAddress },
      });

      const { passwordHash: _, ...result } = updatedUser;
      return result;
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new ConflictException(
          `Wallet address ${normalizedAddress.slice(0, 6)}...${normalizedAddress.slice(-4)} is already connected to another account.`,
        );
      }
      throw err;
    }
  }

  async disconnectWallet(userId: string) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { walletAddress: null },
    });

    const { passwordHash: _, ...result } = updatedUser;
    return result;
  }

  private generateToken(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role: role.toString() };
    return this.jwtService.sign(payload);
  }
}
