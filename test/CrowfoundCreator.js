const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { Contract } = require("ethers");
const { ethers } = require("hardhat");
const signers = {};

let crowContractFactory;
let crowContractInstance;
let closedCrowContractInstance;

describe("Deploy", function () {
  it("Should deploy the contract", async function () {
    const [deployer, firstUser, secondUser] = await ethers.getSigners();
    signers.deployer = deployer;
    signers.firstUser = firstUser;
    signers.secondUser = secondUser;
    crowContractFactory = await ethers.getContractFactory(
      "CrowdFund",
      deployer
    );
    crowContractInstance = await crowContractFactory.deploy(
      "CrowFound",
      "EWC",
      1000
    );

    await crowContractInstance.deployed();
    crowContractAddr = crowContractInstance.address;
  });
});
describe("Launch", function () {
  it("Should be launched only by owner ", async function () {
    let contracInstanceforFirstUser = crowContractInstance.connect(
      signers.firstUser
    );
    const setLaunch = contracInstanceforFirstUser.launch(
      Math.trunc(Date.now() / 1000),
      Math.trunc(Date.now() / 1000) + 100
    );
    expect(setLaunch).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
describe("Buy Tokens", function () {
  it("Should allow user to buy tokens only after project is launched", async function () {
    const buyToken = crowContractInstance.buyTokens();
    expect(buyToken).to.be.revertedWith("Project isn't launched yet");
  });
  it("Should allow user to buy tokens while project is running if they pay with te correct amount", async function () {
    let launching = await crowContractInstance.launch(
      Math.trunc(Date.now() / 1000),
      Math.trunc(Date.now() / 1000) + 1000
    );
    let buyTokenTx = await crowContractInstance.buyTokens(5, {
      value: ethers.utils.parseUnits("50.0", "gwei"),
    });

    expect(
      (await crowContractInstance.balanceOf(crowContractAddr)).toNumber()
    ).to.equal(995);
    expect(
      await crowContractInstance.balanceOf(signers.deployer.address)
    ).to.equal(5);
    let buyTokenTxwrong = crowContractInstance.buyTokens(5, {
      value: ethers.utils.parseUnits("20.0", "gwei"),
    });
    expect(buyTokenTxwrong).to.be.revertedWith("Wrong Amount");
  });
});
describe("Claim Founds", function () {
  it("Should allow user to claim their tokens", async function () {
    await crowContractInstance.launch(
      Math.trunc(Date.now() / 1000) - 2000,
      Math.trunc(Date.now() / 1000) - 1000
    );

    let contracInstanceforFirstUser = crowContractInstance.connect(
      signers.firstUser
    );

    await contracInstanceforFirstUser.transferFounds(100, {
      value: ethers.utils.parseUnits("1000.0", "gwei"),
    });

    let claim = await contracInstanceforFirstUser.claimFounds();
    claim.wait();
    expect(
      await contracInstanceforFirstUser.balanceOf(signers.firstUser.address)
    ).to.equal(0);
  });
  it("Should reject if user has no balance", async function () {
    let contracInstanceforFirstUser = crowContractInstance.connect(
      signers.firstUser
    );

    let claim = contracInstanceforFirstUser.claimFounds();
    expect(claim).to.be.revertedWith("This address has nothing to claim");
  });
});
