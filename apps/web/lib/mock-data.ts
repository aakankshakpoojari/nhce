export type BountyStatus = "Open" | "In Review" | "In Progress" | "Completed";

export interface MockClientStats {
  name: string;
  handle: string;
  rating: number;
  totalBounties: number;
}

export interface MockBounty {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  budget: string;
  tags: string[];
  postedAt: string;
  clientStats: MockClientStats;
  status?: BountyStatus;
  applicantCount?: number;
  durationWeeks?: number;
  proOnly?: boolean;
}

export const bounties: MockBounty[] = [
  {
    id: "1",
    title: "Build a ZK-Rollup Bridge Interface",
    description: "We are looking for a senior frontend developer to create a seamless UI for our new ZK-Rollup bridge. Must have experience with ethers.js, React, and complex state management.",
    fullDescription: "We are looking for a senior frontend developer to create a seamless UI for our new ZK-Rollup bridge. Must have experience with ethers.js, React, and complex state management. The project involves bridging tokens across L1 and L2 securely, displaying real-time fee estimates, and handling complex edge cases when transactions revert.",
    budget: "$5,000",
    tags: ["Frontend", "React", "Web3", "Ethers.js"],
    postedAt: "2 hours ago",
    clientStats: {
      name: "Layer2DAO",
      handle: "@layer2dao",
      rating: 4.8,
      totalBounties: 12
    },
    durationWeeks: 4
  },
  {
    id: "2",
    title: "Smart Contract Audit for DeFi Protocol",
    description: "Require a comprehensive security audit for our lending and borrowing smart contracts. The protocol is a fork of Aave V3 with custom modifications for yield farming.",
    fullDescription: "Require a comprehensive security audit for our lending and borrowing smart contracts. The protocol is a fork of Aave V3 with custom modifications for yield farming. You must be able to identify reentrancy attacks, flash loan vulnerabilities, and oracle manipulation vectors. A full report with mitigation strategies is required.",
    budget: "$12,000",
    tags: ["Security", "Solidity", "Audit", "DeFi"],
    postedAt: "5 hours ago",
    clientStats: {
      name: "Yield Protocol",
      handle: "@yield_protocol",
      rating: 5.0,
      totalBounties: 3
    },
    durationWeeks: 2,
    proOnly: true
  },
  {
    id: "3",
    title: "Design System for NFT Marketplace",
    description: "Create a modern, sleek design system and component library for an upcoming NFT marketplace on Solana. Figma files should be fully prototyped with micro-interactions.",
    fullDescription: "Create a modern, sleek design system and component library for an upcoming NFT marketplace on Solana. Figma files should be fully prototyped with micro-interactions. The aesthetic should be premium, editorial, and weightless, utilizing dark modes, subtle glows, and fluid motion. Hand-off ready components are required.",
    budget: "$3,500",
    tags: ["Design", "Figma", "UI/UX", "System"],
    postedAt: "1 day ago",
    clientStats: {
      name: "ArtBlocks",
      handle: "@artblocks",
      rating: 4.9,
      totalBounties: 24
    },
    durationWeeks: 8
  },
  {
    id: "4",
    title: "Rust Developer for Solana Program",
    description: "Looking for an experienced Rust developer to write a custom Solana program that handles token vesting and distribution schedules with cliff periods.",
    fullDescription: "Looking for an experienced Rust developer to write a custom Solana program that handles token vesting and distribution schedules with cliff periods. Must handle SPL token transfers securely and include rigorous integration tests using Anchor framework. We expect highly optimized compute units.",
    budget: "$8,000",
    tags: ["Rust", "Solana", "Smart Contracts", "Backend"],
    postedAt: "2 days ago",
    clientStats: {
      name: "MEV Labs",
      handle: "@mev_labs",
      rating: 4.5,
      totalBounties: 8
    },
    durationWeeks: 16,
    proOnly: true
  }
];



export interface MockMilestone {
  id: string;
  name: string;
  title?: string;
  amount: string;
  status: "Completed" | "In Progress" | "Pending";
}

export interface MockProject {
  id: string;
  title: string;
  clientName: string;
  client?: MockClientStats;
  budget: string;
  status: string;
  tags?: string[];
  nextMilestone: string;
  startedAt?: string;
  lastUpdated: string;
  milestones: MockMilestone[];
  durationWeeks?: number;
  isMine?: boolean;
  description?: string;
}

export const activeProjects: MockProject[] = [
  {
    id: "p1",
    title: "DeFi Yield Aggregator Frontend",
    clientName: "0x88...11aB",
    client: {
      name: "0x88...11aB",
      handle: "@yield_agg",
      rating: 4.9,
      totalBounties: 5,
    },
    startedAt: "2 weeks ago",
    budget: "$8,500",
    status: "In Progress",
    tags: ["Frontend", "React", "DeFi"],
    nextMilestone: "Component Library Handoff",
    lastUpdated: "2 days ago",
    milestones: [
      { id: "m1", name: "Initial Wireframes", amount: "$1,500", status: "Completed" },
      { id: "m2", name: "Component Library Handoff", amount: "$3,000", status: "In Progress" },
      { id: "m3", name: "Final Integration", amount: "$4,000", status: "Pending" }
    ],
    isMine: true
  },
  {
    id: "p2",
    title: "Solana MEV Bot Optimization",
    clientName: "MEV Labs",
    client: {
      name: "MEV Labs",
      handle: "@mev_labs",
      rating: 4.5,
      totalBounties: 8,
    },
    startedAt: "1 month ago",
    budget: "$20,000",
    status: "Awaiting Escrow Release",
    tags: ["Rust", "Solana", "MEV"],
    nextMilestone: "Final Review",
    lastUpdated: "5 hours ago",
    milestones: [
      { id: "m1", name: "Architecture Audit", amount: "$5,000", status: "Completed" },
      { id: "m2", name: "Optimization Implementation", amount: "$10,000", status: "Completed" },
      { id: "m3", name: "Final Review", amount: "$5,000", status: "In Progress" }
    ],
    isMine: true
  },
  {
    id: "p3",
    title: "Tokenomics Paper Translation (JP)",
    clientName: "Sakura Finance",
    client: {
      name: "Sakura Finance",
      handle: "@sakura",
      rating: 5.0,
      totalBounties: 2,
    },
    startedAt: "3 days ago",
    budget: "$500",
    status: "Milestone Review",
    tags: ["Translation", "Tokenomics", "Writing"],
    nextMilestone: "Chapter 1-3 Review",
    lastUpdated: "1 day ago",
    milestones: [
      { id: "m1", name: "Chapter 1-3 Review", amount: "$250", status: "In Progress" },
      { id: "m2", name: "Final Document", amount: "$250", status: "Pending" }
    ],
    isMine: true
  },
  {
    id: "p4",
    title: "NFT Marketplace Smart Contracts",
    clientName: "ArtBlocks",
    client: {
      name: "ArtBlocks",
      handle: "@artblocks",
      rating: 4.9,
      totalBounties: 24,
    },
    startedAt: "3 weeks ago",
    budget: "$15,000",
    status: "Completed",
    tags: ["Solidity", "Smart Contracts", "Audit"],
    nextMilestone: "N/A",
    lastUpdated: "1 week ago",
    milestones: [
      { id: "m1", name: "Contract Architecture", amount: "$5,000", status: "Completed" },
      { id: "m2", name: "Test Suite", amount: "$5,000", status: "Completed" },
      { id: "m3", name: "Final Audit Prep", amount: "$5,000", status: "Completed" }
    ],
    isMine: true
  },
  {
    id: "p5",
    title: "ZK-Rollup Bridge Interface",
    clientName: "Layer2DAO",
    client: {
      name: "Layer2DAO",
      handle: "@layer2dao",
      rating: 4.8,
      totalBounties: 12,
    },
    startedAt: "5 days ago",
    budget: "$5,000",
    status: "In Progress",
    tags: ["Frontend", "ZK", "Web3"],
    nextMilestone: "Initial Wireframes",
    lastUpdated: "3 days ago",
    milestones: [
      { id: "m1", name: "Initial Wireframes", amount: "$1,500", status: "In Progress" },
      { id: "m2", name: "Prototyping", amount: "$2,000", status: "Pending" },
      { id: "m3", name: "Final Build", amount: "$1,500", status: "Pending" }
    ],
    isMine: true
  },
  {
    id: "p6",
    title: "Rust Smart Contract for DEX",
    clientName: "SwapProtocol",
    budget: "$12,000",
    status: "Completed",
    tags: ["Rust", "Solana", "DEX"],
    nextMilestone: "N/A",
    lastUpdated: "2 weeks ago",
    milestones: [],
    isMine: false,
    description: "Built a fully functional AMM smart contract on Solana using Anchor. Includes concentrated liquidity and limit orders."
  },
  {
    id: "p7",
    title: "Web3 Wallet Extension UI",
    clientName: "NextGen Wallet",
    budget: "$9,000",
    status: "In Progress",
    tags: ["Frontend", "React", "Extension"],
    nextMilestone: "Beta Release",
    lastUpdated: "1 day ago",
    milestones: [],
    isMine: false,
    description: "Developing the user interface for a new non-custodial browser wallet extension with multi-chain support."
  }
];

export const communityPosts = [
  {
    id: "c1",
    author: "Elena R.",
    role: "Senior UI/UX Designer",
    content: "Just wrapped up the design system for the new ZK-Rollup bridge. The most challenging part was mapping complex states without overwhelming the user.",
    projectTag: "Design Systems",
    likes: 124,
    postedAt: "2 hours ago",
  },
  {
    id: "c2",
    author: "Marcus T.",
    role: "Rust Developer",
    content: "Pro tip for Solana devs: Always structure your program accounts thoughtfully. Reallocating space later is a nightmare. Learn from my weekend.",
    projectTag: "Solana",
    likes: 89,
    postedAt: "4 hours ago",
  },
  {
    id: "c3",
    author: "Sarah M.",
    role: "Frontend Engineer",
    content: "Is anyone else feeling the fatigue of building endless 'dashboard' looking apps? I've been experimenting with more organic, asymmetric layouts.",
    projectTag: "Discussion",
    likes: 342,
    postedAt: "1 day ago",
  },
  {
    id: "c4",
    author: "David J.",
    role: "Smart Contract Dev",
    content: "Just published an open-source template for ERC-4337 Account Abstraction paymasters. Feel free to use it in your next bounty!",
    projectTag: "Open Source",
    likes: 215,
    postedAt: "1 day ago",
  },
  {
    id: "c5",
    author: "Alex K.",
    role: "Fullstack Eng",
    content: "Landed my first $10k bounty on W3HIRE today! The escrow system makes it so much easier to focus on building instead of worrying about getting paid.",
    projectTag: "Milestone",
    likes: 560,
    postedAt: "2 days ago",
  },
  {
    id: "c6",
    author: "Priya S.",
    role: "Tokenomics Expert",
    content: "Drafting a whitepaper is 20% math, 80% storytelling. If people don't understand *why* the token exists, the emission schedule doesn't matter.",
    projectTag: "Writing",
    likes: 145,
    postedAt: "3 days ago",
  }
];

export const transactions = [
  {
    id: "tx1",
    type: "Payment Released",
    amount: "+$8,500.00",
    counterparty: "0x88...11aB",
    date: "Oct 24, 2023",
    status: "Completed",
    incoming: true
  },
  {
    id: "tx2",
    type: "Escrow Funded",
    amount: "+$4,000.00",
    counterparty: "Layer2DAO",
    date: "Oct 21, 2023",
    status: "Locked",
    incoming: true
  },
  {
    id: "tx3",
    type: "Withdrawal",
    amount: "-$2,000.00",
    counterparty: "External Wallet (0x3F...9a1)",
    date: "Oct 15, 2023",
    status: "Completed",
    incoming: false
  },
  {
    id: "tx4",
    type: "Payment Released",
    amount: "+$5,000.00",
    counterparty: "ArtBlocks",
    date: "Oct 10, 2023",
    status: "Completed",
    incoming: true
  },
  {
    id: "tx5",
    type: "Withdrawal",
    amount: "-$500.00",
    counterparty: "External Wallet (0x3F...9a1)",
    date: "Oct 05, 2023",
    status: "Failed",
    incoming: false
  },
  {
    id: "tx6",
    type: "Deposit",
    amount: "+$1,500.00",
    counterparty: "External Wallet (0x3F...9a1)",
    date: "Sep 28, 2023",
    status: "Completed",
    incoming: true
  }
];

export interface MockNotification {
  id: string;
  type: string;
  message: string;
  time: string;
  isRead: boolean;
  href?: string;
}

export const initialNotifications: MockNotification[] = [
  {
    id: "n1",
    type: "milestone",
    message: "Escrow payment released for DeFi Yield Aggregator",
    time: "2m ago",
    isRead: false,
    href: "/projects/p1"
  },
  {
    id: "n2",
    type: "proposal",
    message: "New proposal received on ZK-Rollup Bridge Interface",
    time: "1h ago",
    isRead: false,
    href: "/bounties/1"
  },
  {
    id: "n3",
    type: "system",
    message: "Your withdrawal of $2,000.00 has been processed",
    time: "4h ago",
    isRead: true,
    href: "/wallet"
  },
  {
    id: "n4",
    type: "message",
    message: "Client sent a message regarding Solana MEV Bot",
    time: "1d ago",
    isRead: true,
    href: "/projects/p2"
  },
  {
    id: "n5",
    type: "proposal",
    message: "Your proposal for Smart Contract Audit was accepted!",
    time: "2d ago",
    isRead: true,
    href: "/bounties/2"
  }
];

export interface MockApplication {
  id: string;
  bountyId: string;
  bountyTitle: string;
  appliedAt: string;
  status: "Pending Review" | "Accepted" | "Rejected";
}

export const myApplications: MockApplication[] = [
  {
    id: "app-1",
    bountyId: "1",
    bountyTitle: "DeFi Dashboard UI Refresh",
    appliedAt: "2 days ago",
    status: "Accepted"
  },
  {
    id: "app-2",
    bountyId: "2",
    bountyTitle: "Smart Contract Audit for DEX",
    appliedAt: "1 week ago",
    status: "Rejected"
  },
  {
    id: "app-3",
    bountyId: "4",
    bountyTitle: "Zero-Knowledge Proof Implementation",
    appliedAt: "3 hours ago",
    status: "Pending Review"
  }
];


export interface MockReview {
  id: string;
  author: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export const freelancerStats = {
  rating: 4.8,
  completedProjects: 27,
  reviewsCount: 19,
  reviews: [
    {
      id: "rev-1",
      author: "Defi Labs",
      rating: 5,
      comment: "Excellent work on the DEX UI. Delivered ahead of schedule and the code was exceptionally clean.",
      date: "2 weeks ago"
    },
    {
      id: "rev-2",
      author: "ZK Systems",
      rating: 4,
      comment: "Great communication. The ZK integration was complex but they handled it well.",
      date: "1 month ago"
    },
    {
      id: "rev-3",
      author: "NFT World",
      rating: 5,
      comment: "Incredible attention to detail on the smart contract audits. Will definitely hire again.",
      date: "2 months ago"
    }
  ] as MockReview[]
};

export interface MockMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface MockConversation {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  projectTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: MockMessage[];
}

export const conversations: MockConversation[] = [
  {
    id: "conv1",
    clientId: "c1",
    clientName: "Layer2DAO",
    clientAvatar: "L",
    projectTitle: "ZK-Rollup Bridge Interface",
    lastMessage: "Could you clarify the milestone schedule?",
    lastMessageTime: "10:30 AM",
    unreadCount: 2,
    messages: [
      {
        id: "m1",
        senderId: "c1",
        senderName: "Layer2DAO",
        text: "Hi there! We loved your proposal for the ZK-Rollup Bridge.",
        timestamp: "Yesterday, 4:00 PM",
        isRead: true,
      },
      {
        id: "m2",
        senderId: "me",
        senderName: "Me",
        text: "Thanks! I'm really excited about the architecture you guys are using.",
        timestamp: "Yesterday, 4:15 PM",
        isRead: true,
      },
      {
        id: "m3",
        senderId: "c1",
        senderName: "Layer2DAO",
        text: "Before we lock the escrow, could you clarify the milestone schedule? Specifically for the second phase.",
        timestamp: "10:30 AM",
        isRead: false,
      }
    ]
  },
  {
    id: "conv2",
    clientId: "c2",
    clientName: "MEV Labs",
    clientAvatar: "M",
    projectTitle: "Solana MEV Bot Optimization",
    lastMessage: "The transaction speeds look great on devnet.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    messages: [
      {
        id: "m4",
        senderId: "c2",
        senderName: "MEV Labs",
        text: "The transaction speeds look great on devnet. Are we ready for mainnet?",
        timestamp: "Yesterday, 2:00 PM",
        isRead: true,
      },
      {
        id: "m5",
        senderId: "me",
        senderName: "Me",
        text: "Yes, I'm just running the final Jito bundle tests now.",
        timestamp: "Yesterday, 2:30 PM",
        isRead: true,
      }
    ]
  },
  {
    id: "conv3",
    clientId: "c3",
    clientName: "ArtBlocks",
    clientAvatar: "A",
    projectTitle: "Design System for NFT Marketplace",
    lastMessage: "I've attached the brand guidelines.",
    lastMessageTime: "2 days ago",
    unreadCount: 0,
    messages: [
      {
        id: "m6",
        senderId: "c3",
        senderName: "ArtBlocks",
        text: "Looking forward to working with you. I've attached the brand guidelines.",
        timestamp: "2 days ago",
        isRead: true,
      }
    ]
  }
];

export interface DetailedClientProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  rating: number;
  totalBounties: number;
  totalSpent: string;
  memberSince: string;
  bio: string;
  reviews: MockReview[];
}

export const detailedClients: Record<string, DetailedClientProfile> = {
  "layer2dao": {
    id: "c1",
    name: "Layer2DAO",
    handle: "layer2dao",
    avatar: "L",
    rating: 4.8,
    totalBounties: 12,
    totalSpent: "$145,000",
    memberSince: "Jan 2022",
    bio: "We build open-source infrastructure for ZK-Rollups and Ethereum scaling solutions. Looking for high-quality Web3 talent to accelerate our roadmap.",
    reviews: [
      {
        id: "r1",
        author: "Alex K.",
        rating: 5,
        comment: "Great client! Very clear requirements and they escrowed the funds immediately.",
        date: "1 month ago"
      },
      {
        id: "r2",
        author: "Sarah M.",
        rating: 4,
        comment: "Good communication, though the project scope expanded slightly midway. Still a pleasant experience.",
        date: "3 months ago"
      }
    ]
  },
  "mev_labs": {
    id: "c2",
    name: "MEV Labs",
    handle: "mev_labs",
    avatar: "M",
    rating: 4.5,
    totalBounties: 8,
    totalSpent: "$210,000",
    memberSince: "Mar 2023",
    bio: "Research and engineering firm specializing in Maximum Extractable Value and algorithmic trading on Solana.",
    reviews: [
      {
        id: "r3",
        author: "Marcus T.",
        rating: 5,
        comment: "Extremely technical team. They know what they want and pay top dollar for optimized Rust code.",
        date: "2 weeks ago"
      }
    ]
  },
  "artblocks": {
    id: "c3",
    name: "ArtBlocks",
    handle: "artblocks",
    avatar: "A",
    rating: 4.9,
    totalBounties: 24,
    totalSpent: "$50,000",
    memberSince: "Jul 2021",
    bio: "Curated generative art platform. We frequently hire designers and frontend devs to build bespoke gallery experiences.",
    reviews: [
      {
        id: "r4",
        author: "Elena R.",
        rating: 5,
        comment: "A dream to design for. They value aesthetics and give you creative freedom.",
        date: "5 months ago"
      }
    ]
  }
};

export interface MockFreelancer {
  id: string;
  name: string;
  avatar: string;
  role: string;
  rating: number;
  completedJobs: number;
  isPro: boolean;
  hourlyUSD: number;
  hourlyINR: number;
  skills: string[];
  bio: string;
  didVerified: boolean;
}

export const freelancersList: MockFreelancer[] = [
  {
    id: "tal-1",
    name: "Vikram Sharma",
    avatar: "VS",
    role: "Senior Solidity & Security Architect",
    rating: 4.95,
    completedJobs: 28,
    isPro: true,
    hourlyUSD: 95,
    hourlyINR: 7900,
    skills: ["Solidity", "Foundry", "Security Auditing", "Arbitrum", "DeFi"],
    bio: "Ex-Consensys contributor specializing in EVM smart contract audits, multisig architecture, and zero-knowledge escrow proofs.",
    didVerified: true,
  },
  {
    id: "tal-2",
    name: "Elena Rostova",
    avatar: "ER",
    role: "Web3 Frontend & UX Specialist",
    rating: 4.88,
    completedJobs: 19,
    isPro: true,
    hourlyUSD: 75,
    hourlyINR: 6240,
    skills: ["Next.js", "TypeScript", "Tailwind CSS", "Wagmi", "Ethers.js"],
    bio: "Crafting beautiful, high-converting crypto interfaces and dApp experiences with seamless MetaMask and WalletConnect integration.",
    didVerified: true,
  },
  {
    id: "tal-3",
    name: "Aakash Patel",
    avatar: "AP",
    role: "Rust & Solana Protocol Engineer",
    rating: 4.92,
    completedJobs: 22,
    isPro: true,
    hourlyUSD: 90,
    hourlyINR: 7490,
    skills: ["Rust", "Solana", "Anchor", "Smart Escrow"],
    bio: "High-performance protocol engineering, decentralized orderbooks, and cross-chain messaging contracts.",
    didVerified: true,
  },
  {
    id: "tal-4",
    name: "Samira Khan",
    avatar: "SK",
    role: "Junior Smart Contract Developer",
    rating: 3.9,
    completedJobs: 4,
    isPro: false,
    hourlyUSD: 45,
    hourlyINR: 3740,
    skills: ["Solidity", "Hardhat", "React"],
    bio: "Building test suites, token contracts, and basic NFT staking mechanics.",
    didVerified: false,
  },
];
