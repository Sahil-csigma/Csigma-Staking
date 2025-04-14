require("dotenv").config();
const { ethers } = require("ethers");

const ABI = [
  "event Deposit(address indexed user, uint amount)",
  "function getUnfundedRewardAmount(address[] calldata stakeHolders) external view returns (uint)",
];

const stakingContractAddress = "0xF10bdCCB81a6831af2066f498200fE7cfEE4361e";
const startBlock = 8116676;

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const contract = new ethers.Contract(stakingContractAddress, ABI, provider);

  const endBlock = await provider.getBlockNumber();

  console.log(`Scanning from block ${startBlock} to ${endBlock}...`);

  // 1. Fetch Deposit events to find stakers
  const filter = contract.filters.Deposit();
  const events = await contract.queryFilter(filter, startBlock, endBlock);

  const uniqueUsers = new Set();
  events.forEach((event) => {
    uniqueUsers.add(event.args.user.toLowerCase());
  });

  const stakers = Array.from(uniqueUsers);
  console.log(`Found ${stakers.length} unique stakers.`);

  // 2. Call getUnfundedRewardAmount()
  const totalRewards = await contract.getUnfundedRewardAmount(stakers);
  const formatted = ethers.utils.formatUnits(totalRewards, 18); // token has 18 decimals

  console.log(`Total pending rewards: ${formatted}`);
}

main().catch((err) => {
  console.error("Error:", err);
});
