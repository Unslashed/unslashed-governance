## Introduction:

This repo contains the source for the Unslashed Finande Governance Token (USF) based on the COMP token as well as the Unslashed Finance DAO based on the Compound DAO.

## How to deploy:

- install node and npm: https://nodejs.org/en/download/
- clone this repo
- cd into governance
- execute `npm install`
- create a .env file based on .env.dist, with your mnemonic and infura id (or alternatively configure the network with your provider endpoint in `hardhat.config.js`)
- make sure you have enough ETH to pay for gas (the whole process should take about 9214622 gas)
- execute `npx hardhat deploy --network mainnet --index <n> --gasprice <g>` where **n** is the index of your account from the mnemonic (--index is optional, default is 0), **g** is gasprice in GWEI

About 9214622 gas is used for deplyoment and token transfers,\
at 100 GWEI that is 0.9214622 ETH,\
200 GWEI: 1.8429244 ETH,\
400 GWEI: 3.6858488 ETH

for ganache, omitting the `--network` option or using `--network ganache` does the trick and for testnets, goerli (`--network goerli`) and ropsten (`--network ropsten`) allow to deploy on both.

## Content

### Contracts

#### **USF**

Original:

[https://github.com/compound-finance/compound-protocol/blob/master/contracts/Governance/Comp.sol](https://github.com/compound-finance/compound-protocol/blob/master/contracts/Governance/Comp.sol)

The USF contract is what creates the USF token. It is an ERC20 compatible token with support for checkpoints. Checkpointing is a system by which you can check the token balance of any user at any particular point in history. This is important because when a vote comes up that users need to vote on, you don't want individuals buying or selling tokens specifically to change the outcome of the vote and then dumping straight after a vote closes. To avoid this, checkpoints are used. By the time someone creates a proposal and puts it up for a vote in the Compound ecosystem, the voting power of all token holders is already known, and fixed, at a point in the past. This way users can still buy or sell tokens, but their balances won't affect their voting power. 

#### **GovernorAlpha**

Original:

[https://github.com/compound-finance/compound-protocol/blob/master/contracts/Governance/GovernorAlpha.sol](https://github.com/compound-finance/compound-protocol/blob/master/contracts/Governance/GovernorAlpha.sol)

The GovernorAlpha contract is the contract that does the actual "governance" part of the ecosystem. There are a number of hard-coded parameters that decide the functionality of governance, and the contract itself is the tool by which proposals are proposed, voted upon, and transferred to a timelock to be executed. The logic for secure voting is handled here. 

#### **Timelock**

Original:

[https://github.com/compound-finance/compound-protocol/blob/master/contracts/Timelock.sol](https://github.com/compound-finance/compound-protocol/blob/master/contracts/Timelock.sol)

The final component of the system is a Timelock. Timelock contracts essentially "delay" the execution of transactions to give the community a chance for a "sanity check" to be  run over the outcome of a vote. It's important if a last minute bug is found in the system and it needs to be caught before a transaction is implemented.

All three of these components work together with their own sphere of influence. The COMP token essentially functions as a voter registration tool (and as a tradable ERC20 token), the GovernorAlpha acts as a polling location- the place where voting happens, and the Timelock acts as a loading bay that holds decision for a set amount of time before executing them on the network. 

### Scripts


#### **DeployMainnet.js** 

Governance system contract deplyoments

#### **DistributeTokensMainnet.js**

Sends tokens to multiple different accounts from deployer address
