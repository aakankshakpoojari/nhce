/**
 * @file web3.config.ts
 * @description EVM Devnet (Sepolia) Provider and Signer configuration module.
 * Initializes Ethers.js JsonRpcProvider and Admin Wallet for contract deployment & administrative escrow release.
 */

import { ethers } from 'ethers';
import { env } from './env.config';

// Ethers.js JsonRpcProvider connected to Sepolia Devnet
export const provider = new ethers.JsonRpcProvider(env.SEPOLIA_RPC_URL);

// Admin / Relayer wallet for automated triggers and cron transactions
export const wallet = new ethers.Wallet(env.DEPLOYER_PRIVATE_KEY, provider);

// Smart Contract Minimal ABIs
// TODO: Replace stubs below with full compiled Solidity ABIs from artifacts after Hardhat/Foundry compilation
export const JOB_ESCROW_FACTORY_ABI = [
  'function createEscrow(bytes32 jobId, address freelancer, address tokenAddress) external payable returns (address)',
  'function getEscrowByJobId(bytes32 jobId) external view returns (address)',
  'event EscrowCreated(bytes32 indexed jobId, address indexed escrowAddress, address indexed client, address freelancer, address tokenAddress)'
];

export const JOB_ESCROW_ABI = [
  'function addMilestone(uint256 milestoneId, uint256 amount) external',
  'function releaseMilestone(uint256 milestoneId) external',
  'function raiseDispute(uint256 milestoneId) external',
  'function status() external view returns (uint8)',
  'function milestones(uint256) external view returns (uint256 amount, bool isReleased, bool isDisputed)',
  'receive() external payable'
];

export const DISPUTE_GOVERNOR_ABI = [
  'function openDispute(bytes32 jobId, address escrowVault, uint256 milestoneId, address[] jurors) external payable returns (uint256)',
  'function castVote(uint256 disputeId, uint8 choice) external',
  'function finalizeDispute(uint256 disputeId) external',
  'function claimJurorReward(uint256 disputeId) external'
];

export const UNISWAP_QUOTER_V2_ABI = [
  'function quoteExactInputSingle(tuple(address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)',
  'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)'
];

export const UNISWAP_V3_SWAP_ROUTER_ABI = [
  'function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountOut)'
];

export const ERC20_ABI = [
  'function transfer(address recipient, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)'
];

