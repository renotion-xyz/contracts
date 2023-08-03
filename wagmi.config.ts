import { defineConfig } from '@wagmi/cli';
import { react, hardhat } from '@wagmi/cli/plugins';

export default defineConfig({
  out: '../web3-app/src/web3/contracts.ts',
  contracts: [],
  plugins: [
    react({
      useContractEvent: false,
      useContractItemEvent: false,
    }),
    hardhat({
      project: '.',
      include: [
        '*/RenotionToken.sol/**'
      ],
    }),
  ],
})
