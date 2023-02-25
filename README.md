# Renotion Smart Contract

The smart contract is based on ERC-721. It allows to purchages a registration, which will hold a mapping from a domain to a Notion Page.

When mapping is established, the [Renotion Cloudflare Worker](https://github.com/renotion-xyz/cf-worker)
will proxy the Notion Page according to the blockchain state.

The contract is based on OpenZeppelin Upgradable ERC-721.

The web-app to interact with the contract: https://github.com/renotion-xyz/web3-app

## TODO
- [ ] Allow to store more metadata: SEO, custom scripts for analytics, etc

## Deployment

- Polygon Mainnet: [0xD189E333277a8dbd65244A97bE3ecBE4f7Bee5cf](https://polygonscan.com/address/0xD189E333277a8dbd65244A97bE3ecBE4f7Bee5cf)
- Polygon Mumbai testnet: [0x868d265ddada824efd8c129dfe4d4642aa13c7be](https://mumbai.polygonscan.com/address/0x868d265ddada824efd8c129dfe4d4642aa13c7be)

## Test

```sh
npx hardhat test
```

## Deploy

```sh
npx hardhat run scripts/deploy.ts --network poly
```
