
const hre = require("hardhat");
const ethers = hre.ethers;
const contractAddresses = require("../ContractAddresses.json"); //for some reason if I use require here, the gnosis address is not there yet...

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

  const liquidityMinersAddress = "0x0000000000000000000000000000000000000001"; //TODO real address  
  const liquidityMinersAmount = ethers.utils.parseEther("2700000"); //2.7 M

  const gnosisSafeIntermediateAddress = "0x0000000000000000000000000000000000000002"; //TODO real address  
  const gnosisSafeAmount = ethers.utils.parseEther("40300000").sub(deployersAmount); //(40.3 M = 43 M - 2.7 M) - deployersAmount

  const teamAndInvestorsAddress = "0x0000000000000000000000000000000000000003"; //TODO real address  
  
  let sumGasUsed = ethers.BigNumber.from(0);

  let tx;
  tx = await usfWithSigner0.transfer(liquidityMinersAddress, liquidityMinersAmount, { gasPrice: gasPriceWei, gasLimit: 150000 });
  const minedTx1 = await tx.wait();
  sumGasUsed = sumGasUsed.add(minedTx1.gasUsed);

  tx = await usfWithSigner0.transfer(gnosisSafeIntermediateAddress, gnosisSafeAmount, { gasPrice: gasPriceWei, gasLimit: 150000 });
  const minedTx2 = await tx.wait();
  sumGasUsed = sumGasUsed.add(minedTx2.gasUsed);

  const deployersRemainingBalace = await usf.balanceOf(addresses[accountIndex]);
  const teamAndInvestorsAmount = deployersRemainingBalace.sub(deployersAmount); //rest except deplyoers amount
  tx = await usfWithSigner0.transfer(teamAndInvestorsAddress, teamAndInvestorsAmount, { gasPrice: gasPriceWei, gasLimit: 150000 });
  const minedTx3 = await tx.wait();
  sumGasUsed = sumGasUsed.add(minedTx3.gasUsed);
  
  console.log(`liquidity miner's address: ${liquidityMinersAddress}`)
  console.log(`liquidity miner's address: ${await usf.balanceOf(liquidityMinersAddress)}`)

  console.log(`gnosis safe address: ${gnosisSafeIntermediateAddress}`)
  console.log(`gnosis safe balance: ${await usf.balanceOf(gnosisSafeIntermediateAddress)}`)

  console.log(`deplyoer's address: ${addresses[accountIndex]}`)
  console.log(`deplyoer's balance: ${await usf.balanceOf(addresses[accountIndex])}`)
  
  console.log(`team and investor's address: ${teamAndInvestorsAddress}`)
  console.log(`team and investor's balance: ${await usf.balanceOf(teamAndInvestorsAddress)}`)

  console.log("token transfers sum gas used: ", sumGasUsed.toString());
}

module.exports = {
  distributeTokens: main
}