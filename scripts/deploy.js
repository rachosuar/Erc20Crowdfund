// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.

let _name = "EWOL";
let _simbol = "EWL";
let _goal = 1000;

const { ethers } = require("hardhat");

async function main() {
  const CrowfoundCreatorFactory = await ethers.getContractFactory("CrowdFund");
  const CrowfoundCreatorInstance = await CrowfoundCreatorFactory.deploy(
    _name,
    _simbol,
    _goal
  );

  await CrowfoundCreatorInstance.deployed();

  console.log(`contract deployed !!`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
