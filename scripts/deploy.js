// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { n18 } = require("../test/helpers");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  await hre.run("compile");

  const sigmaToken = await hre.ethers.getContractFactory("Token");
  const sigmaTokenAddress = process.env.TOKEN_ADDRESS
  const sigmaTokenInstance = await sigmaToken.attach(sigmaTokenAddress);

  const StakingPlatform = await hre.ethers.getContractFactory(
    "StakingPlatform"
  );

  const stakingPool = await StakingPlatform.deploy(
    sigmaTokenAddress,
    25,
    365,
    0,
    n18("20000000")
  );
  await stakingPool.deployed();
  console.log("Staking platform -- Staking Pool deployed to:", stakingPool.address);

  await stakingPool.startStaking();
  console.log("Staking has been started");

  await sigmaTokenInstance.transfer(stakingPool.address, n18("5000000"));
  console.log("Initial rewards funded to the staking contract.");

  await hre.run("verify:verify", {
    address: stakingPool.address,
    constructorArguments: [sigmaTokenAddress, 25, 365, 0, n18("20000000")],
    contract: "contracts/staking/StakingPlatform.sol:StakingPlatform",
  });

  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
