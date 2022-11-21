require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
const dotenv = require("dotenv");
const { task } = require("hardhat/config");

dotenv.config();
//this is the private key of the account that will deploy the contract
//https://docs.ethers.io/v5/api/signer/#Signer--properties

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.3",
  defaultNetwork: "mumbai",
  networks: {
    hardhat: {},
    "hardhat-local": {
      url: "http://127.0.0.1:8545",
      accounts: [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      ],
    },
    mumbai: {
      url: process.env.POLYGON_MUMBAI,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.API_KEY,
    },
  },
};
