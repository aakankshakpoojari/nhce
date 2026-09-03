/**
 * @file env.config.ts
 * @description Centralized environment configuration module.
 * Parses and validates process.env parameters using Zod schemas.
 * Ensures all required environment variables, Web3 RPC endpoints, and API keys are strictly typed.
 */

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/web3_freelance'),
  JWT_SECRET: z.string().default('dev-super-secret-key-change-in-production-32chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SEPOLIA_RPC_URL: z.string().default('https://ethereum-sepolia-rpc.publicnode.com'),
  DEPLOYER_PRIVATE_KEY: z.string().default('0x0000000000000000000000000000000000000000000000000000000000000001'),
  ESCROW_FACTORY_ADDRESS: z.string().default('0x0000000000000000000000000000000000000000'),
  DISPUTE_GOVERNOR_ADDRESS: z.string().default('0x0000000000000000000000000000000000000000'),
  UNISWAP_V3_ROUTER_ADDRESS: z.string().default('0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD'),
  UNISWAP_V3_QUOTER_ADDRESS: z.string().default('0x61fFE014bA17989E743c5F6cB21bF9697540B21e'),
  SEPOLIA_WETH_ADDRESS: z.string().default('0xfff9976782d46cc05630d1f6ebab18b2324d6b14'),
  SEPOLIA_USDC_ADDRESS: z.string().default('0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'),
  GITHUB_ACCESS_TOKEN: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export const env: EnvConfig = envSchema.parse(process.env);
