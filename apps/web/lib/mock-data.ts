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
}

export const dummyBounties: MockBounty[] = [
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
    }
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
    }
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
    }
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
    }
  }
];

export const clientBounties: MockBounty[] = [
  {
    id: "c1",
    title: "NFT Marketplace Smart Contracts",
    description: "Build robust and secure ERC721 and ERC1155 smart contracts for a new art platform.",
    fullDescription: "Build robust and secure ERC721 and ERC1155 smart contracts for a new art platform. Needs to support lazy minting, royalty enforcement (EIP-2981), and multiple currency types for purchases. A full suite of tests via Hardhat/Foundry is required.",
    budget: "$15,000",
    tags: ["Solidity", "ERC721", "Audit"],
    postedAt: "1 week ago",
    status: "Open",
    applicantCount: 14,
    clientStats: {
      name: "You",
      handle: "@you",
      rating: 5.0,
      totalBounties: 4
    }
  },
  {
    id: "c2",
    title: "DeFi Yield Aggregator Frontend",
    description: "Frontend interface for our multi-chain yield aggregator using React and Tailwind.",
    fullDescription: "Frontend interface for our multi-chain yield aggregator using React and Tailwind. Users should be able to connect wallets (WalletConnect, MetaMask), view aggregated APY metrics, and deposit/withdraw funds seamlessly. Real-time chart integration (e.g., lightweight-charts) is a major plus.",
    budget: "$8,500",
    tags: ["React", "Web3.js", "Tailwind"],
    postedAt: "2 weeks ago",
    status: "In Review",
    applicantCount: 22,
    clientStats: {
      name: "You",
      handle: "@you",
      rating: 5.0,
      totalBounties: 4
    }
  },
  {
    id: "c3",
    title: "Solana MEV Bot Optimization",
    description: "Optimize an existing MEV bot written in Rust for lower latency execution.",
    fullDescription: "Optimize an existing MEV bot written in Rust for lower latency execution. Focus on minimizing serialization/deserialization overhead and network roundtrips. We need a detailed benchmark report before and after optimizations.",
    budget: "$20,000",
    tags: ["Rust", "Solana", "MEV"],
    postedAt: "1 month ago",
    status: "In Progress",
    applicantCount: 3,
    clientStats: {
      name: "You",
      handle: "@you",
      rating: 5.0,
      totalBounties: 4
    }
  },
  {
    id: "c4",
    title: "Tokenomics Paper Translation (JP)",
    description: "Translate a 20-page tokenomics technical paper from English to Japanese.",
    fullDescription: "Translate a 20-page tokenomics technical paper from English to Japanese. The translator MUST be fluent in both languages and possess a deep understanding of crypto and DeFi terminology in Japanese to ensure accurate localization.",
    budget: "$500",
    tags: ["Translation", "Japanese"],
    postedAt: "2 months ago",
    status: "Completed",
    applicantCount: 8,
    clientStats: {
      name: "You",
      handle: "@you",
      rating: 5.0,
      totalBounties: 4
    }
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
  nextMilestone: string;
  startedAt?: string;
  lastUpdated: string;
  milestones: MockMilestone[];
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
    nextMilestone: "Component Library Handoff",
    lastUpdated: "2 days ago",
    milestones: [
      { id: "m1", name: "Initial Wireframes", title: "Initial Wireframes", amount: "$1,500", status: "Completed" },
      { id: "m2", name: "Component Library Handoff", title: "Component Library Handoff", amount: "$3,000", status: "In Progress" },
      { id: "m3", name: "Final Integration", title: "Final Integration", amount: "$4,000", status: "Pending" }
    ]
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
    nextMilestone: "Final Review",
    lastUpdated: "5 hours ago",
    milestones: [
      { id: "m1", name: "Architecture Audit", title: "Architecture Audit", amount: "$5,000", status: "Completed" },
      { id: "m2", name: "Optimization Implementation", title: "Optimization Implementation", amount: "$10,000", status: "Completed" },
      { id: "m3", name: "Final Review", title: "Final Review", amount: "$5,000", status: "In Progress" }
    ]
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
    nextMilestone: "Chapter 1-3 Review",
    lastUpdated: "1 day ago",
    milestones: [
      { id: "m1", name: "Chapter 1-3 Review", title: "Chapter 1-3 Review", amount: "$250", status: "In Progress" },
      { id: "m2", name: "Final Document", title: "Final Document", amount: "$250", status: "Pending" }
    ]
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
    nextMilestone: "N/A",
    lastUpdated: "1 week ago",
    milestones: [
      { id: "m1", name: "Contract Architecture", title: "Contract Architecture", amount: "$5,000", status: "Completed" },
      { id: "m2", name: "Test Suite", title: "Test Suite", amount: "$5,000", status: "Completed" },
      { id: "m3", name: "Final Audit Prep", title: "Final Audit Prep", amount: "$5,000", status: "Completed" }
    ]
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
    nextMilestone: "Initial Wireframes",
    lastUpdated: "3 days ago",
    milestones: [
      { id: "m1", name: "Initial Wireframes", title: "Initial Wireframes", amount: "$1,500", status: "In Progress" },
      { id: "m2", name: "Prototyping", title: "Prototyping", amount: "$2,000", status: "Pending" },
      { id: "m3", name: "Final Build", title: "Final Build", amount: "$1,500", status: "Pending" }
    ]
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
