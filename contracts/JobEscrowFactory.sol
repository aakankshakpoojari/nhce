// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./JobEscrow.sol";

/**
 * @title JobEscrowFactory
 * @notice Factory contract to deploy standalone JobEscrow vault instances on EVM Devnet (Sepolia).
 * @dev Tracks all deployed escrow vaults associated with job IDs and client addresses.
 */
contract JobEscrowFactory {
    // Events
    event EscrowCreated(
        bytes32 indexed jobId,
        address indexed escrowAddress,
        address indexed client,
        address freelancer,
        address tokenAddress
    );

    // State Variables
    address public owner;
    address public disputeGovernor;

    // Mapping from Job ID to Escrow Vault Address
    mapping(bytes32 => address) public getEscrowByJobId;
    address[] public allEscrows;

    modifier onlyOwner() {
        require(msg.sender == owner, "JobEscrowFactory: Only owner");
        _;
    }

    constructor(address _disputeGovernor) {
        owner = msg.sender;
        disputeGovernor = _disputeGovernor;
    }

    function setDisputeGovernor(address _disputeGovernor) external onlyOwner {
        disputeGovernor = _disputeGovernor;
    }

    /**
     * @notice Deploy a new JobEscrow contract for a specific job
     * @param jobId Unique identifier for the job
     * @param freelancer Address of the freelancer
     * @param tokenAddress ERC20 token address or address(0) for native ETH
     * @return escrowAddress Address of the newly deployed JobEscrow vault contract
     */
    function createEscrow(
        bytes32 jobId,
        address freelancer,
        address tokenAddress
    ) external payable returns (address escrowAddress) {
        require(getEscrowByJobId[jobId] == address(0), "JobEscrowFactory: Escrow already exists for job");
        require(freelancer != address(0), "JobEscrowFactory: Invalid freelancer address");

        // Deploy new JobEscrow vault
        JobEscrow newEscrow = new JobEscrow(
            jobId,
            msg.sender, // Client
            freelancer,
            tokenAddress,
            disputeGovernor,
            address(this) // Factory
        );

        escrowAddress = address(newEscrow);
        getEscrowByJobId[jobId] = escrowAddress;
        allEscrows.push(escrowAddress);

        // If native ETH sent, transfer to the new escrow contract
        if (tokenAddress == address(0) && msg.value > 0) {
            (bool success, ) = escrowAddress.call{value: msg.value}("");
            require(success, "JobEscrowFactory: ETH transfer failed");
        }

        emit EscrowCreated(jobId, escrowAddress, msg.sender, freelancer, tokenAddress);
    }

    function getAllEscrowsCount() external view returns (uint256) {
        return allEscrows.length;
    }
}
