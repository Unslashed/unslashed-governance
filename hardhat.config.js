require("@nomiclabs/hardhat-ethers");
require('dotenv').config();

const Secrets = {
  mnemonic: process.env.MNEMONIC,
  infuraProjectId: process.env.INFURA_PROJECT_ID,
};

  task("deploy", "Deploys a COMPound style governance system")
  .addParam("gasprice", "gas price of the transactions in GWEI")
  .addOptionalParam("index", "account index of the mnemonic to be used").setAction(async taskArgs => {
    console.log("=== CONTRACT DEPLOYMENTS ===")
    const { deploy } = require("./scripts/DeployMainnet");
    await deploy(taskArgs.index, taskArgs.gasprice);
    console.log("=== TOKEN DISTRIBUTION ===")
    const { distributeTokens } = require("./scripts/DistributeTokensMainnet");
    await distributeTokens(taskArgs.index, taskArgs.gasprice);
  })

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "ganache",
  networks: {

    hardhat: {
    },
    ganache: {
      url: "http://127.0.0.1:9545",
      accounts: {
        mnemonic: Secrets.mnemonic,
        initialIndex: 0,
        count: 10,
      }
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${Secrets.infuraProjectId}`,
      accounts: {
        mnemonic: Secrets.mnemonic,
        initialIndex: 0,
        count: 10,
      }
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${Secrets.infuraProjectId}`,
      accounts: {
        mnemonic: Secrets.mnemonic,
        initialIndex: 0,
        count: 10,
      }
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${Secrets.infuraProjectId}`,
      accounts: {
        mnemonic: Secrets.mnemonic,
        initialIndex: 0,
        count: 10,
      }
    }
  },
  solidity: {
    compilers: [ 
      { version: "0.5.16" },
    ],
   },
};

