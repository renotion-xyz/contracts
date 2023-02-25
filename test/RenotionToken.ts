import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("RenotionToken", function () {
  const HOSTNAME = "test.renotion.xyz";
  const TEST_DOMAIN = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(HOSTNAME)
  );
  const PAGE = "xxx-test-page-xxx";

  async function deployRenotionFixture() {
    const [owner, otherAccount, yetAnotherAccount] = await ethers.getSigners();

    const minPrice = ethers.utils.parseEther("0.01");
    const paymentReceiver = owner.address;

    const Renotion = await ethers.getContractFactory("RenotionToken");
    const renotion = await upgrades.deployProxy(Renotion, [
      paymentReceiver,
      minPrice
    ]);

    await renotion.deployed();

    return { renotion, minPrice, owner, otherAccount, yetAnotherAccount, paymentReceiver };
  }

  describe("Deployment", function () {
    it("Should set the right min price", async function () {
      const { renotion, minPrice } = await loadFixture(deployRenotionFixture);

      expect(await renotion.minPriceETH()).to.equal(minPrice);
    });

    it("Should set the right owner", async function () {
      const { renotion, owner } = await loadFixture(deployRenotionFixture);

      expect(await renotion.owner()).to.equal(owner.address);
    });
  });

  describe("Registations", function () {
    describe("Validations", function () {
      it("Should revert if value is not included", async function () {
        const { renotion, otherAccount } = await loadFixture(deployRenotionFixture);

        const register = renotion.connect(otherAccount)
          .register(TEST_DOMAIN, HOSTNAME, PAGE);

        await expect(register)
          .to.be.revertedWith(
            "Should include min reg price"
          );
      });

      it("Should revert if value is too small", async function () {
        const { renotion, otherAccount, minPrice } = await loadFixture(deployRenotionFixture);

        const register = renotion.connect(otherAccount)
          .register(TEST_DOMAIN, HOSTNAME, PAGE, { value: minPrice.sub(1) });

        await expect(register)
          .to.be.revertedWith(
            "Should include min reg price"
          );
      });

      it("Should revert if domain is already registered", async function () {
        const { renotion, otherAccount, minPrice, yetAnotherAccount } = await loadFixture(deployRenotionFixture);

        await renotion.connect(otherAccount)
          .register(TEST_DOMAIN, HOSTNAME, PAGE, { value: minPrice });

        const register = renotion.connect(yetAnotherAccount)
          .register(TEST_DOMAIN, HOSTNAME, PAGE, { value: minPrice });

        await expect(register)
          .to.be.revertedWith(
            "Address is already registered"
          );
      });

      it("Should revert if updating other's domain", async function () {
        const { renotion, otherAccount, minPrice, yetAnotherAccount } = await loadFixture(deployRenotionFixture);

        await renotion.connect(otherAccount)
          .register(TEST_DOMAIN, HOSTNAME, PAGE, { value: minPrice });

        const update = renotion.connect(yetAnotherAccount)
          .update(TEST_DOMAIN, "different-page");

        await expect(update)
          .to.be.revertedWith(
            "Should be owner"
          );
      });
    });

    describe("Events", function () {
      it("Should emit an event on registration", async function () {
        const { renotion, minPrice, otherAccount } = await loadFixture(deployRenotionFixture);

        const register = renotion.connect(otherAccount)
          .register(TEST_DOMAIN, HOSTNAME, PAGE, { value: minPrice });

        await expect(register)
          .to.emit(renotion, "DomainRegistered")
          .withArgs(otherAccount.address, TEST_DOMAIN, PAGE);
      });

      it("Should emit an event on update", async function () {
        const { renotion, minPrice, otherAccount } = await loadFixture(deployRenotionFixture);

        await renotion.connect(otherAccount)
          .register(TEST_DOMAIN, HOSTNAME, PAGE, { value: minPrice });

        const update = await renotion.connect(otherAccount)
          .update(TEST_DOMAIN, "different-page");

        await expect(update)
          .to.emit(renotion, "DomainUpdated")
          .withArgs(otherAccount.address, TEST_DOMAIN, "different-page");
      });
    });

    describe("Domains", function () {
      it("Should identify owner", async function () {
        const { renotion, minPrice, otherAccount } = await loadFixture(deployRenotionFixture);

        await renotion.connect(otherAccount)
          .register(TEST_DOMAIN, HOSTNAME, PAGE, { value: minPrice });

        expect(await renotion.ownerOf(TEST_DOMAIN)).to.equal(otherAccount.address);
      });

      it("Should identify page", async function () {
        const { renotion, minPrice, otherAccount } = await loadFixture(deployRenotionFixture);

        await renotion.connect(otherAccount)
          .register(TEST_DOMAIN, HOSTNAME, PAGE, { value: minPrice });

        const metadata = await renotion.metadataFor(TEST_DOMAIN);

        expect(metadata[0]).to.equal(HOSTNAME);
        expect(metadata[1]).to.equal(PAGE);
      });

      it("Should update page", async function () {
        const { renotion, minPrice, otherAccount } = await loadFixture(deployRenotionFixture);

        await renotion.connect(otherAccount)
          .register(TEST_DOMAIN, HOSTNAME, PAGE, { value: minPrice });

        let metadata = await renotion.metadataFor(TEST_DOMAIN);
        expect(metadata[0]).to.equal(HOSTNAME);
        expect(metadata[1]).to.equal(PAGE);

        await renotion.connect(otherAccount)
          .update(TEST_DOMAIN, "different-page");

        metadata = await renotion.metadataFor(TEST_DOMAIN);
        expect(metadata[0]).to.equal(HOSTNAME);
        expect(metadata[1]).to.equal("different-page");
      });

      it("Should forward full payment", async function () {
        const { renotion, minPrice, otherAccount, paymentReceiver } = await loadFixture(deployRenotionFixture);

        const value = minPrice.add(ethers.utils.parseEther("0.05"));

        const balanceBefore = await ethers.provider.getBalance(paymentReceiver);

        await renotion.connect(otherAccount)
          .register(TEST_DOMAIN, HOSTNAME, PAGE, { value });

        const balanceAfter = await ethers.provider.getBalance(paymentReceiver);

        expect(balanceAfter.sub(balanceBefore)).to.equal(value);
      });
    });

    describe("Settings", function () {
      it("Should revert on settings update if not owner", async function () {
        const { renotion, otherAccount, minPrice } = await loadFixture(deployRenotionFixture);

        const newMinPrice = ethers.utils.parseEther("0.13")

        const updateSettings = renotion.connect(otherAccount)
          .updateSettings(otherAccount.address, newMinPrice);

        await expect(updateSettings)
          .to.be.revertedWith(
            "Ownable: caller is not the owner"
          );

        expect(await renotion.minPriceETH()).to.not.equal(newMinPrice);
        expect(await renotion.minPriceETH()).to.equal(minPrice);
      });

      it("Should update settings if owner", async function () {
        const { renotion, owner, yetAnotherAccount } = await loadFixture(deployRenotionFixture);

        const newMinPrice = ethers.utils.parseEther("0.13");

        expect(await renotion.minPriceETH()).to.not.equal(newMinPrice);

        await renotion.connect(owner)
          .updateSettings(yetAnotherAccount.address, newMinPrice);

        expect(await renotion.minPriceETH()).to.equal(newMinPrice);
      });
    });
  });
});
