// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract RenotionToken is Initializable, ERC721Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    struct DomainInfo {
        string hostname;
        string page;
    }

    event DomainRegistered(address indexed owner, bytes32 indexed domain, string page);
    event DomainUpdated(address indexed owner, bytes32 indexed domain, string page);

    mapping (bytes32 => DomainInfo) private _domainMapping;
    address private _paymentReceiver;
    uint256 private _minPriceETH;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address paymentReceiver_,
        uint256 minPriceETH_
    ) initializer public {
        __ERC721_init("Renotion", "RNT");
        __Ownable_init();
        __UUPSUpgradeable_init();

        _minPriceETH = minPriceETH_;
        _paymentReceiver = paymentReceiver_;
    }

    function register(bytes32 domain_, string calldata hostname_, string calldata page_)
        external
        payable
    {
        uint256 tokenId = uint256(domain_);

        require(msg.value >= _minPriceETH, "Should include min reg price");
        require(_ownerOf(tokenId) == address(0), "Address is already registered");

        (bool success, ) = _paymentReceiver.call{ value: msg.value }("");
        require(success, "Cannot forward the payment");

        _safeMint(_msgSender(), tokenId);
        _domainMapping[domain_] = DomainInfo(hostname_, page_);

        emit DomainRegistered(_msgSender(), domain_, page_);
    }

    function update(bytes32 domain_, string calldata page_)
        external
    {
        uint256 tokenId = uint256(domain_);
        require(_ownerOf(tokenId) == _msgSender(), "Should be owner");

        DomainInfo storage data = _domainMapping[domain_];
        data.page = page_;

        emit DomainUpdated(_msgSender(), domain_, page_);
    }

    function metadataFor(bytes32 domain_)
        public
        view
        returns (DomainInfo memory)
    {
        return _domainMapping[domain_];
    }

    function minPriceETH()
        public
        view
        returns (uint256)
    {
        return _minPriceETH;
    }

    function updateSettings(
        address paymentReceiver_,
        uint256 minPriceETH_
    )
        external
        onlyOwner
    {
        _paymentReceiver = paymentReceiver_;
        _minPriceETH = minPriceETH_;
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    uint256[50] private __gap;
}
