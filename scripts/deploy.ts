import { ethers, upgrades } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  const Renotion = await ethers.getContractFactory("RenotionToken");
  const renotion = await upgrades.deployProxy(Renotion, [
    signer.address,
    ethers.utils.parseEther("5")
  ]);

  await renotion.deployed();

  console.log(`Renotion is deployed at ${renotion.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
