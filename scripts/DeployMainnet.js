const hre = require("hardhat");
const ethers = hre.ethers;
const { saveContractAddress, clearContractAddress} = require('./utils/SaveContractAddress');

async function main(accountIndex, gasPriceGWei) {

    const gasPriceWei = ethers.utils.parseUnits(gasPriceGWei, "gwei");


    // Compile our Contracts, just in case
    await hre.run('compile');

    const networkId = (await ethers.provider.getNetwork()).chainId;
    //only checking lock contract on mainnet
    if(networkId == 1 ){
        const lockAddress = "0x9Be6730864163de13D7F566f391c12d3f8b2bc82";
        const lock = await ethers.getContractAt("Lock", lockAddress);
    
        if (await lock.lock()){
            console.log("Someone else already deplyoed the governance aready");
            process.exit();
        }
    }

    
    await clearContractAddress();

    const accounts = await ethers.getSigners();

    if (accountIndex == null) {
        accountIndex = 0;
    }
    
    console.log("accountIndex: ", accountIndex);

    let sumGasUsed = ethers.BigNumber.from(0);

    const tokenRecipient = accounts[accountIndex].address;
    const timeLockAdmin = "0xE4AcDB790f4e9E4F6fD7831011D44afA3ddFfef8";
    const guardian = "0x3fDbA971a35e238cea1602f50824E296BaD85980";

    console.log("token recipient: ", tokenRecipient)
    // This gets the contract from 
    const Token = await ethers.getContractFactory("USF", accounts[accountIndex]);
    const token = await Token.deploy(tokenRecipient, { gasPrice: gasPriceWei });
    await token.deployed();
    const minedTx1 = await token.deployTransaction.wait();
    sumGasUsed = sumGasUsed.add(minedTx1.gasUsed);
    await saveContractAddress("USF", token.address)

    // Deploy Timelock
    const day = 60 * 60 * 24;
    const delay = 2 * day;
    const Timelock = await ethers.getContractFactory("Timelock", accounts[accountIndex]);
    const timelock = await Timelock.deploy(timeLockAdmin, delay, { gasPrice: gasPriceWei });
    await timelock.deployed();
    const minedTx2 = await timelock.deployTransaction.wait();
    sumGasUsed = sumGasUsed.add(minedTx2.gasUsed);
    await saveContractAddress("Timelock", timelock.address)

    // Deploy Governance
    const Gov = await ethers.getContractFactory("GovernorAlpha", accounts[accountIndex]);
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
