const hre = require("hardhat");
const ethers = hre.ethers;
const { saveContractAddress, clearContractAddress} = require('./utils/SaveContractAddress');

async function main(accountIndex, gasPriceGWei) {

    const gasPriceWei = ethers.utils.parseUnits(gasPriceGWei, "gwei");


    // Compile our Contracts, just in case
    await hre.run('compile');

    await clearContractAddress();

    const accounts = await ethers.getSigners();

    if (accountIndex == null) {
        accountIndex = 0;
    }
    
    console.log("accountIndex: ", accountIndex);
    
    const tokenRecipient = accounts[accountIndex].address;
    const timeLockAdmin = "0x98f8c93cC2EA65FEDEe9d02c1D3b12d728f54A1A; //TODO real address: our admin address
    const guardian = "0xfBE57d9a3A02b629C2940f0d281EA7ddae0B47bd"; //TODO real address: our admin address

    console.log("token recipient: ", tokenRecipient)
    let sumGasUsed = ethers.BigNumber.from(0);
    // This gets the contract from 
    const Token = await ethers.getContractFactory("USF");
    const token = await Token.deploy(tokenRecipient, { gasPrice: gasPriceWei });
    await token.deployed();
    const minedTx1 = await token.deployTransaction.wait();
    sumGasUsed = sumGasUsed.add(minedTx1.gasUsed);
    await saveContractAddress("USF", token.address)

    // Deploy Timelock
    const day = 60 * 60 * 24;
    const delay = 2 * day;
    const Timelock = await ethers.getContractFactory("Timelock");
    const timelock = await Timelock.deploy(timeLockAdmin, delay, { gasPrice: gasPriceWei });
    await timelock.deployed();
    const minedTx2 = await timelock.deployTransaction.wait();
    sumGasUsed = sumGasUsed.add(minedTx2.gasUsed);
    await saveContractAddress("Timelock", timelock.address)

    // Deploy Governance
    const Gov = await ethers.getContractFactory("GovernorAlpha");
    const gov = await Gov.deploy(timelock.address, token.address, guardian, { gasPrice: gasPriceWei });
    await gov.deployed();
    const minedTx3 = await gov.deployTransaction.wait();
    sumGasUsed = sumGasUsed.add(minedTx3.gasUsed);
    await saveContractAddress("GovernorAlpha", gov.address)

    console.log(`Token deployed to: ${token.address}`);
    console.log(`TimeLock deployed to: ${timelock.address}`);
    console.log(`GovernorAlpha deployed to: ${gov.address}`)

    const initialBalance = await token.balanceOf(tokenRecipient);
    console.log(`${initialBalance / 1e18} tokens transfered to ${tokenRecipient}`);
    console.log("deployments sum gas used: ", sumGasUsed.toString());
}

module.exports = {
    deploy: main
}