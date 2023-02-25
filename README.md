# Renotion Smart Contract

The smart contract is based on ERC-721. It allows to purchages a registration, which will hold a mapping from a domain to a Notion Page.

When mapping is established, the [Renotion Cloudflare Worker](https://github.com/renotion-xyz/cf-worker)
will proxy the Notion Page according to the blockchain state.

The contract is based on OpenZeppelin Upgradable ERC-721.

The web-app to interact with the contract: https://github.com/renotion-xyz/web3-app

## TODO
- [ ] Allow to store more metadata: SEO, custom scripts for analytics, etc

## Test

```sh
npx hardhat test
```

## Deploy

```sh
npx hardhat run scripts/deploy.ts --network poly
```
