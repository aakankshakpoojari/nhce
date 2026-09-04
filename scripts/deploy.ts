import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log(`====================================================`);
  console.log(`🚀 Starting Smart Contract Deployment on Network: ${network.name}`);
  console.log(`====================================================`);

  const signers = await ethers.getSigners();
  if (!signers || signers.length === 0) {
    console.error("⚠️  No valid deployer private key found in process.env.PRIVATE_KEY or apps/api/.env (DEPLOYER_PRIVATE_KEY).");
    console.error("👉  Please provide a 64-character hex private key with Sepolia testnet ETH to deploy to EVM Sepolia Devnet.");
    process.exit(1);
  }
  const deployer = signers[0];
  console.log(`📌 Deployer Address: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer Balance: ${ethers.formatEther(balance)} ETH`);

  // 1. Deploy DisputeGovernor
  console.log(`\n1️⃣  Deploying DisputeGovernor...`);
  const DisputeGovernorFactory = await ethers.getContractFactory("DisputeGovernor");
  const disputeGovernor = await DisputeGovernorFactory.deploy();
  await disputeGovernor.waitForDeployment();
  const disputeGovernorAddress = await disputeGovernor.getAddress();
  console.log(`✅ DisputeGovernor deployed at: ${disputeGovernorAddress}`);

  // 2. Deploy JobEscrowFactory
  console.log(`\n2️⃣  Deploying JobEscrowFactory...`);
  const JobEscrowFactoryFactory = await ethers.getContractFactory("JobEscrowFactory");
  const jobEscrowFactory = await JobEscrowFactoryFactory.deploy(disputeGovernorAddress);
  await jobEscrowFactory.waitForDeployment();
  const jobEscrowFactoryAddress = await jobEscrowFactory.getAddress();
  console.log(`✅ JobEscrowFactory deployed at: ${jobEscrowFactoryAddress}`);

  // 3. Export Contracts & ABIs to Express Backend (apps/api/src/config/contracts.json)
  console.log(`\n3️⃣  Exporting Contract Addresses & ABIs to Express backend...`);
  
  const artifactDirPath = path.join(__dirname, "../artifacts/contracts");
  
  const disputeGovernorArtifact = JSON.parse(
    fs.readFileSync(path.join(artifactDirPath, "DisputeGovernor.sol/DisputeGovernor.json"), "utf8")
  );
  const jobEscrowFactoryArtifact = JSON.parse(
    fs.readFileSync(path.join(artifactDirPath, "JobEscrowFactory.sol/JobEscrowFactory.json"), "utf8")
  );
  const jobEscrowArtifact = JSON.parse(
    fs.readFileSync(path.join(artifactDirPath, "JobEscrow.sol/JobEscrow.json"), "utf8")
  );

  const deploymentData = {
    network: network.name,
    chainId: network.config.chainId ?? 11155111,
    deployedAt: new Date().toISOString(),
    contracts: {
      DisputeGovernor: {
        address: disputeGovernorAddress,
        abi: disputeGovernorArtifact.abi,
      },
      JobEscrowFactory: {
        address: jobEscrowFactoryAddress,
        abi: jobEscrowFactoryArtifact.abi,
      },
      JobEscrow: {
        abi: jobEscrowArtifact.abi,
      },
    },
  };

  const outputDirApi = path.join(__dirname, "../apps/api/src/config");
  if (!fs.existsSync(outputDirApi)) {
    fs.mkdirSync(outputDirApi, { recursive: true });
  }
  const outputPathApi = path.join(outputDirApi, "contracts.json");
  fs.writeFileSync(outputPathApi, JSON.stringify(deploymentData, null, 2), "utf8");

  const outputDirWeb = path.join(__dirname, "../apps/web/config");
  if (!fs.existsSync(outputDirWeb)) {
    fs.mkdirSync(outputDirWeb, { recursive: true });
  }
  const outputPathWeb = path.join(outputDirWeb, "contracts.json");
  fs.writeFileSync(outputPathWeb, JSON.stringify(deploymentData, null, 2), "utf8");

  console.log(`📄 Dynamic contracts config exported successfully to apps/api and apps/web.`);

  // Update apps/api/.env with newly deployed contract addresses if file exists
  const envPath = path.join(__dirname, "../apps/api/.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    
    if (envContent.includes("ESCROW_FACTORY_ADDRESS=")) {
      envContent = envContent.replace(
        /ESCROW_FACTORY_ADDRESS=.*/,
        `ESCROW_FACTORY_ADDRESS="${jobEscrowFactoryAddress}"`
      );
    } else {
      envContent += `\nESCROW_FACTORY_ADDRESS="${jobEscrowFactoryAddress}"`;
    }

    if (envContent.includes("DISPUTE_GOVERNOR_ADDRESS=")) {
      envContent = envContent.replace(
        /DISPUTE_GOVERNOR_ADDRESS=.*/,
        `DISPUTE_GOVERNOR_ADDRESS="${disputeGovernorAddress}"`
      );
    } else {
      envContent += `\nDISPUTE_GOVERNOR_ADDRESS="${disputeGovernorAddress}"`;
    }

    fs.writeFileSync(envPath, envContent, "utf8");
    console.log(`📝 Updated apps/api/.env with new contract addresses.`);
  }

  console.log(`\n🎉 Smart Contract Deployment Complete!`);
  console.log(`====================================================`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
