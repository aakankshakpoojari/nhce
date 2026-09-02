// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 */
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

/**
 * @title JobEscrow
 * @notice Individual milestone vault for a job supporting Native ETH & ERC20 tokens.
 * @dev Handles funds holding, milestone release, refunds, and dispute locking.
 */
contract JobEscrow is ReentrancyGuard {
    enum EscrowStatus { FUNDED, IN_PROGRESS, DISPUTED, COMPLETED, REFUNDED }

    bytes32 public immutable jobId;
    address public immutable client;
    address public immutable freelancer;
    address public immutable tokenAddress; // address(0) for native ETH
    address public immutable disputeGovernor;
    address public immutable factory;

    EscrowStatus public status;
    uint256 public totalFunded;
    uint256 public totalReleased;

    struct Milestone {
        uint256 amount;
        bool isReleased;
        bool isDisputed;
    }

    mapping(uint256 => Milestone) public milestones;
    uint256 public milestoneCount;

    // Events
    event MilestoneAdded(uint256 indexed milestoneId, uint256 amount);
    event MilestoneReleased(uint256 indexed milestoneId, address indexed recipient, uint256 amount);
    event DisputeRaised(uint256 indexed milestoneId, address indexed initiator);
    event DisputeResolved(uint256 indexed milestoneId, address recipient, uint256 amount);
    event EscrowRefunded(address indexed client, uint256 amount);

    modifier onlyClient() {
        require(msg.sender == client, "JobEscrow: Only client");
        _;
    }

    modifier onlyClientOrGovernor() {
        require(msg.sender == client || msg.sender == disputeGovernor, "JobEscrow: Unauthorized caller");
        _;
    }

    modifier onlyDisputeGovernor() {
        require(msg.sender == disputeGovernor, "JobEscrow: Only dispute governor");
        _;
    }

    constructor(
        bytes32 _jobId,
        address _client,
        address _freelancer,
        address _tokenAddress,
        address _disputeGovernor,
        address _factory
    ) {
        jobId = _jobId;
        client = _client;
        freelancer = _freelancer;
        tokenAddress = _tokenAddress;
        disputeGovernor = _disputeGovernor;
        factory = _factory;
        status = EscrowStatus.FUNDED;
    }

    /**
     * @notice Receive function to accept native ETH deposits
     */
    receive() external payable {
        require(tokenAddress == address(0), "JobEscrow: Vault expects ERC20 tokens, not native ETH");
        totalFunded += msg.value;
    }

    /**
     * @notice Add a milestone allocation to the vault
     */
    function addMilestone(uint256 milestoneId, uint256 amount) external onlyClient {
        require(milestones[milestoneId].amount == 0, "JobEscrow: Milestone already exists");
        milestones[milestoneId] = Milestone({
            amount: amount,
            isReleased: false,
            isDisputed: false
        });
        milestoneCount++;
        emit MilestoneAdded(milestoneId, amount);
    }

    /**
     * @notice Release milestone funds to freelancer
     * @param milestoneId Index of the milestone to release
     */
    function releaseMilestone(uint256 milestoneId) external onlyClientOrGovernor nonReentrant {
        Milestone storage m = milestones[milestoneId];
        require(m.amount > 0, "JobEscrow: Invalid milestone");
        require(!m.isReleased, "JobEscrow: Milestone already released");
        require(status != EscrowStatus.DISPUTED || msg.sender == disputeGovernor, "JobEscrow: Escrow in dispute");

        m.isReleased = true;
        totalReleased += m.amount;

        _safeTransfer(freelancer, m.amount);

        emit MilestoneReleased(milestoneId, freelancer, m.amount);
    }

    /**
     * @notice Raise a dispute for a specific milestone
     */
    function raiseDispute(uint256 milestoneId) external {
        require(msg.sender == client || msg.sender == freelancer, "JobEscrow: Only client or freelancer can dispute");
        Milestone storage m = milestones[milestoneId];
        require(!m.isReleased, "JobEscrow: Cannot dispute released milestone");

        m.isDisputed = true;
        status = EscrowStatus.DISPUTED;

        emit DisputeRaised(milestoneId, msg.sender);
    }

    /**
     * @notice Resolve dispute called by DisputeGovernor contract
     */
    function resolveDispute(uint256 milestoneId, address winner, uint256 amount) external onlyDisputeGovernor nonReentrant {
        Milestone storage m = milestones[milestoneId];
        require(m.isDisputed, "JobEscrow: Milestone not in dispute");
        require(!m.isReleased, "JobEscrow: Milestone already released");

        m.isReleased = true;
        totalReleased += amount;
        status = EscrowStatus.IN_PROGRESS;

        _safeTransfer(winner, amount);

        emit DisputeResolved(milestoneId, winner, amount);
    }

    /**
     * @notice Internal helper to perform ETH or ERC20 transfers
     */
    function _safeTransfer(address to, uint256 amount) internal {
        if (tokenAddress == address(0)) {
            (bool success, ) = to.call{value: amount}("");
            require(success, "JobEscrow: ETH transfer failed");
        } else {
            bool success = IERC20(tokenAddress).transfer(to, amount);
            require(success, "JobEscrow: ERC20 transfer failed");
        }
    }
}
