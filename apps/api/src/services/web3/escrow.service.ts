/**
 * @file escrow.service.ts
 * @description Web3 Escrow service interacting with JobEscrowFactory & JobEscrow smart contracts on Sepolia Devnet.
 * Handles on-chain vault deployment, funding confirmation, milestone payment releases, and dispute locks.
 */

import { ethers } from 'ethers';
import { env } from '../../config/env.config';
import { wallet, provider, JOB_ESCROW_FACTORY_ABI, JOB_ESCROW_ABI } from '../../config/web3.config';

export class EscrowService {
  /**
   * Deploy a new JobEscrow Vault via JobEscrowFactory contract
   * @param jobId Unique UUID or bytes32 identifier of the job
   * @param freelancerAddress EVM address of the assigned freelancer
   * @param tokenAddress Address of ERC20 token or address(0) for native ETH
   * @param fundingAmount Total job budget amount in wei / token units
   */
  public async createJobEscrowVault(
    jobId: string,
    freelancerAddress: string,
    tokenAddress: string = ethers.ZeroAddress,
    fundingAmount: string
  ): Promise<{ escrowAddress: string; txHash: string }> {
    // TODO: Ensure ESCROW_FACTORY_ADDRESS in env is deployed on Sepolia Devnet
    if (env.ESCROW_FACTORY_ADDRESS === ethers.ZeroAddress) {
      console.warn('ESCROW_FACTORY_ADDRESS not configured. Returning mocked vault deployment details.');
      return {
        escrowAddress: '0x' + '1'.repeat(40),
        txHash: '0x' + 'a'.repeat(64)
      };
    }

    const factoryContract = new ethers.Contract(env.ESCROW_FACTORY_ADDRESS, JOB_ESCROW_FACTORY_ABI, wallet);
    const bytes32JobId = ethers.id(jobId);

    const isNativeETH = tokenAddress === ethers.ZeroAddress;
    const txOptions = isNativeETH ? { value: fundingAmount } : {};

    // TODO: Perform ERC20 approval transaction prior to createEscrow if using ERC20 tokens
    const tx = await factoryContract.createEscrow(bytes32JobId, freelancerAddress, tokenAddress, txOptions);
    const receipt = await tx.wait();

    // Query deployed escrow contract address
    const escrowAddress = await factoryContract.getEscrowByJobId(bytes32JobId);

    return {
      escrowAddress,
      txHash: receipt.hash
    };
  }

  /**
   * Release milestone funds from Escrow Vault to Freelancer
   * @param escrowAddress Address of the deployed JobEscrow vault
   * @param milestoneId Numeric index of the milestone
   */
  public async releaseMilestonePayment(
    escrowAddress: string,
    milestoneId: number
  ): Promise<{ success: boolean; txHash: string }> {
    // TODO: Verify client or dispute governor signatures before broadcasting release transaction
    if (!escrowAddress || escrowAddress === '0x' + '1'.repeat(40)) {
      console.warn('Mock Escrow Vault release executed for milestone:', milestoneId);
      return { success: true, txHash: '0x' + 'b'.repeat(64) };
    }

    const escrowContract = new ethers.Contract(escrowAddress, JOB_ESCROW_ABI, wallet);
    const tx = await escrowContract.releaseMilestone(milestoneId);
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash
    };
  }

  /**
   * Raise a dispute on-chain for a specific milestone
   * @param escrowAddress Address of the deployed JobEscrow vault
   * @param milestoneId Numeric index of the milestone
   */
  public async raiseEscrowDispute(
    escrowAddress: string,
    milestoneId: number
  ): Promise<{ success: boolean; txHash: string }> {
    if (!escrowAddress || escrowAddress === '0x' + '1'.repeat(40)) {
      return { success: true, txHash: '0x' + 'c'.repeat(64) };
    }

    const escrowContract = new ethers.Contract(escrowAddress, JOB_ESCROW_ABI, wallet);
    const tx = await escrowContract.raiseDispute(milestoneId);
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash
    };
  }
}

export const escrowService = new EscrowService();
