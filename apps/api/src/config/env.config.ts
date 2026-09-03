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
  DIRECT_URL: z.string().optional(),
  JWT_SECRET: z.string().default('dev-super-secret-key-change-in-production-32chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SEPOLIA_RPC_URL: z.string().default('https://ethereum-sepolia-rpc.publicnode.com'),
  CHAIN_ID: z.string().or(z.number()).default(11155111).transform((val) => typeof val === 'string' ? parseInt(val, 10) : val),
  DEPLOYER_PRIVATE_KEY: z.string().default('0x0000000000000000000000000000000000000000000000000000000000000001'),
  ESCROW_FACTORY_ADDRESS: z.string().default('0x0000000000000000000000000000000000000000'),
  DISPUTE_GOVERNOR_ADDRESS: z.string().default('0x0000000000000000000000000000000000000000'),
  UNISWAP_V3_SWAP_ROUTER_ADDRESS: z.string().default('0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E'),
  UNISWAP_V3_ROUTER_ADDRESS: z.string().default('0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E'),
  UNISWAP_V3_QUOTER_ADDRESS: z.string().default('0xEd1f6473345F6817537A6733026f119738B4e372'),
  WETH_SEPOLIA_ADDRESS: z.string().default('0xfff9976782d46cc05630d1f6ebab18b2324d6b14'),
  SEPOLIA_WETH_ADDRESS: z.string().default('0xfff9976782d46cc05630d1f6ebab18b2324d6b14'),
  CANONICAL_SEPOLIA_WETH_ADDRESS: z.string().default('0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9'),
  USDC_SEPOLIA_ADDRESS: z.string().default('0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'),
  SEPOLIA_USDC_ADDRESS: z.string().default('0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'),
  USDT_SEPOLIA_ADDRESS: z.string().default('0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0'),
  GITHUB_ACCESS_TOKEN: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export const env: EnvConfig = envSchema.parse(process.env);
