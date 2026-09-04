import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import * as path from "path";

// Load root .env and apps/api/.env if available
dotenv.config();
dotenv.config({ path: path.join(__dirname, "apps/api/.env") });

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const rawPrivateKey = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY || "";

// Ensure valid 32-byte hex private key (excluding dummy mock keys)
const isValidKey = rawPrivateKey.length === 66 &&
  /^0x[0-9a-fA-F]{64}$/.test(rawPrivateKey) &&
  !rawPrivateKey.includes("000000000000000000000000000000000000000000000000000000000000000");

const accounts = isValidKey ? [rawPrivateKey] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: accounts,
      chainId: 11155111,
    },
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
