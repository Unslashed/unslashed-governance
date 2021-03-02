
const hre = require("hardhat");
const ethers = hre.ethers;
const contractAddresses = require("../ContractAddresses.json");
async function main(accountIndex, gasPriceGWei) {

  const gasPriceWei = ethers.utils.parseUnits(gasPriceGWei, "gwei");

  if (accountIndex == null) {
    accountIndex = 0;
  }

  const accounts = await ethers.getSigners();
  const addresses = accounts.map(account => account.address);

  const usf = await ethers.getContractAt("USF", contractAddresses.USF);
  const usfWithSigner0 = usf.connect(accounts[accountIndex]);

  const deployersAmount = ethers.utils.parseEther("1000");

  const liquidityMinersAddress = "0x54796B776160b6B180Ed95dCE0459ddE9795922F";
  const liquidityMinersAmount = ethers.utils.parseEther("2700000"); //2.7 M

  const gnosisSafeIntermediateAddress = "0xf5bE8b4C82B8A681BAcF357cFB712AB9e9296Cb2";
  const gnosisSafeAmount = ethers.utils.parseEther("40300000").sub(deployersAmount); //(40.3 M = 43 M - 2.7 M) - deployersAmount

  const teamAndInvestorsAddress = "0xE8bB5f49990d16851E86698db621bCc8F834Ca1a";

  let sumGasUsed = ethers.BigNumber.from(0);

  let tx;
  tx = await usfWithSigner0.transfer(liquidityMinersAddress, liquidityMinersAmount, { gasPrice: gasPriceWei, gasLimit: 150000 });
  const minedTx1 = await tx.wait();
  sumGasUsed = sumGasUsed.add(minedTx1.gasUsed);

  tx = await usfWithSigner0.transfer(gnosisSafeIntermediateAddress, gnosisSafeAmount, { gasPrice: gasPriceWei, gasLimit: 150000 });
  const minedTx2 = await tx.wait();
  sumGasUsed = sumGasUsed.add(minedTx2.gasUsed);

  const deployersRemainingBalance = await usf.balanceOf(addresses[accountIndex]);
  const teamAndInvestorsAmount = deployersRemainingBalance.sub(deployersAmount); //rest except deplyoers amount
  tx = await usfWithSigner0.transfer(teamAndInvestorsAddress, teamAndInvestorsAmount, { gasPrice: gasPriceWei, gasLimit: 150000 });
  const minedTx3 = await tx.wait();
  sumGasUsed = sumGasUsed.add(minedTx3.gasUsed);

  console.log(`liquidity miner's address: ${liquidityMinersAddress}`)
  console.log(`liquidity miner's address: ${await usf.balanceOf(liquidityMinersAddress)}`)

  console.log(`gnosis safe address: ${gnosisSafeIntermediateAddress}`)
  console.log(`gnosis safe balance: ${await usf.balanceOf(gnosisSafeIntermediateAddress)}`)

  console.log(`deplyoer's address: ${addresses[accountIndex]}`)
  console.log(`deployer's balance: ${await usf.balanceOf(addresses[accountIndex])}`)

  console.log(`team and investor's address: ${teamAndInvestorsAddress}`)
  console.log(`team and investor's balance: ${await usf.balanceOf(teamAndInvestorsAddress)}`)

  //only setting lock contract on mainnet
  const networkId = (await ethers.provider.getNetwork()).chainId;
  if (networkId == 1) {
    const lockAddress = "0x9Be6730864163de13D7F566f391c12d3f8b2bc82";
    const lock = await ethers.getContractAt("Lock", lockAddress);
    const lockWithSigner0 = lock.connect(accounts[accountIndex]);
    tx = await lockWithSigner0.setLock({ gasPrice: gasPriceWei, gasLimit: 150000 });
    const minedTx4 = await tx.wait();
    sumGasUsed = sumGasUsed.add(minedTx4.gasUsed);
    console.log("Deployment lock set")
  }

  console.log("token transfers sum gas used: ", sumGasUsed.toString());
}

module.exports = {
  distributeTokens: main
}
