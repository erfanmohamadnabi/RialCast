const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy SpinGame
  console.log("\nDeploying SpinGame...");
  const SpinGame = await ethers.getContractFactory("SpinGame");
  const spinGame = await SpinGame.deploy();
  await spinGame.waitForDeployment();
  const spinAddress = await spinGame.getAddress();
  console.log("SpinGame deployed to:", spinAddress);

  // Deploy BetGame
  console.log("\nDeploying BetGame...");
  const BetGame = await ethers.getContractFactory("BetGame");
  const betGame = await BetGame.deploy();
  await betGame.waitForDeployment();
  const betAddress = await betGame.getAddress();
  console.log("BetGame deployed to:", betAddress);

  // Update ABI file with addresses
  const abiPath = path.join(__dirname, "contracts_abi.json");
  const abiData = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  abiData.SpinGame.address = spinAddress;
  abiData.BetGame.address = betAddress;
  fs.writeFileSync(abiPath, JSON.stringify(abiData, null, 2));

  // Copy updated ABI to frontend
  const frontendAbiPath = path.join(__dirname, "../frontend/src/utils/contracts_abi.json");
  fs.writeFileSync(frontendAbiPath, JSON.stringify(abiData, null, 2));

  console.log("\n=== Deployment Complete ===");
  console.log("SpinGame:", spinAddress);
  console.log("BetGame:", betAddress);
  console.log("\nUpdate your .env files:");
  console.log(`SPIN_CONTRACT_ADDRESS=${spinAddress}`);
  console.log(`BET_CONTRACT_ADDRESS=${betAddress}`);
  console.log(`REACT_APP_SPIN_CONTRACT_ADDRESS=${spinAddress}`);
  console.log(`REACT_APP_BET_CONTRACT_ADDRESS=${betAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
