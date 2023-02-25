import { HardhatUserConfig } from "hardhat/config";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000
          }
        }
      },
    ]
  },
  networks: {
    hardhat: {},
    local: {
      url: "http://127.0.0.1:8545/"
    },
    dashboard: {
      url: "http://localhost:24012/rpc"
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com/"
    },
    poly: {
      url: "https://polygon-rpc.com/"
    }
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY
  }
};

export default config;
