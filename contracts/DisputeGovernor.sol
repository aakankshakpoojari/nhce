// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DisputeGovernor
 * @notice Decentralized dispute resolution governor smart contract for Web3 freelancing platform.
 * @dev Manages juror assignments, voting, micro-rewards, and resolution triggers to JobEscrow.
 */
contract DisputeGovernor {
    enum VoteOption { PENDING, FREELANCER_FAVOR, CLIENT_FAVOR }
    enum DisputeState { ACTIVE, RESOLVED }

    struct DisputeCase {
        bytes32 jobId;
        address escrowVault;
        uint256 milestoneId;
        DisputeState state;
        uint256 votesForFreelancer;
        uint256 votesForClient;
        uint256 deadline;
        uint256 jurorRewardPool;
    }

    struct JurorVote {
        bool hasVoted;
        VoteOption choice;
        bool rewardClaimed;
    }

    // Storage
    uint256 public disputeCounter;
    mapping(uint256 => DisputeCase) public disputeCases;
    mapping(uint256 => mapping(address => JurorVote)) public jurorVotes;
    mapping(uint256 => address[]) public assignedJurors;

    // Events
    event DisputeOpened(uint256 indexed disputeId, bytes32 indexed jobId, address escrowVault, uint256 milestoneId);
    event VoteCast(uint256 indexed disputeId, address indexed juror, VoteOption choice);
    event DisputeResolved(uint256 indexed disputeId, VoteOption winningOutcome, address winner);
    event RewardClaimed(uint256 indexed disputeId, address indexed juror, uint256 rewardAmount);

    /**
     * @notice Open a new dispute case for a milestone
     */
    function openDispute(
        bytes32 jobId,
        address escrowVault,
        uint256 milestoneId,
        address[] calldata jurors
    ) external payable returns (uint256 disputeId) {
        disputeCounter++;
        disputeId = disputeCounter;

        disputeCases[disputeId] = DisputeCase({
            jobId: jobId,
            escrowVault: escrowVault,
            milestoneId: milestoneId,
            state: DisputeState.ACTIVE,
            votesForFreelancer: 0,
            votesForClient: 0,
            deadline: block.timestamp + 3 days,
            jurorRewardPool: msg.value
        });

        for (uint256 i = 0; i < jurors.length; i++) {
            assignedJurors[disputeId].push(jurors[i]);
        }

        emit DisputeOpened(disputeId, jobId, escrowVault, milestoneId);
    }

    /**
     * @notice Submit vote by an assigned juror
     */
    function castVote(uint256 disputeId, VoteOption choice) external {
        DisputeCase storage dCase = disputeCases[disputeId];
        require(dCase.state == DisputeState.ACTIVE, "DisputeGovernor: Case not active");
        require(block.timestamp <= dCase.deadline, "DisputeGovernor: Voting period ended");
        require(choice == VoteOption.FREELANCER_FAVOR || choice == VoteOption.CLIENT_FAVOR, "DisputeGovernor: Invalid vote choice");

        JurorVote storage jVote = jurorVotes[disputeId][msg.sender];
        require(!jVote.hasVoted, "DisputeGovernor: Juror already voted");

        jVote.hasVoted = true;
        jVote.choice = choice;

        if (choice == VoteOption.FREELANCER_FAVOR) {
            dCase.votesForFreelancer++;
        } else {
            dCase.votesForClient++;
        }

        emit VoteCast(disputeId, msg.sender, choice);
    }

    /**
     * @notice Finalize dispute resolution after voting period or quorum reached
     */
    function finalizeDispute(uint256 disputeId) external {
        DisputeCase storage dCase = disputeCases[disputeId];
        require(dCase.state == DisputeState.ACTIVE, "DisputeGovernor: Case already resolved");
        require(
            block.timestamp > dCase.deadline ||
            (dCase.votesForFreelancer + dCase.votesForClient >= assignedJurors[disputeId].length),
            "DisputeGovernor: Voting still ongoing"
        );

        dCase.state = DisputeState.RESOLVED;

        VoteOption winnerOption = dCase.votesForFreelancer >= dCase.votesForClient
            ? VoteOption.FREELANCER_FAVOR
            : VoteOption.CLIENT_FAVOR;

        emit DisputeResolved(disputeId, winnerOption, address(0));
    }

    /**
     * @notice Claim juror micro-reward for participating in dispute voting
     */
    function claimJurorReward(uint256 disputeId) external {
        DisputeCase storage dCase = disputeCases[disputeId];
        require(dCase.state == DisputeState.RESOLVED, "DisputeGovernor: Case not resolved yet");

        JurorVote storage jVote = jurorVotes[disputeId][msg.sender];
        require(jVote.hasVoted, "DisputeGovernor: Did not vote");
        require(!jVote.rewardClaimed, "DisputeGovernor: Reward already claimed");

        jVote.rewardClaimed = true;
        uint256 totalVoters = dCase.votesForFreelancer + dCase.votesForClient;
        require(totalVoters > 0, "DisputeGovernor: No voters");

        uint256 rewardShare = dCase.jurorRewardPool / totalVoters;
        if (rewardShare > 0) {
            (bool success, ) = msg.sender.call{value: rewardShare}("");
            require(success, "DisputeGovernor: Reward payout failed");
            emit RewardClaimed(disputeId, msg.sender, rewardShare);
        }
    }
}
