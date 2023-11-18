// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts@5.0.0/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts@5.0.0/access/Ownable.sol";
import "@openzeppelin/contracts@5.0.0/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts@5.0.0/token/ERC1155/extensions/ERC1155URIStorage.sol";
import { IEAS, AttestationRequest, AttestationRequestData } from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import { NO_EXPIRATION_TIME, EMPTY_UID } from "@ethereum-attestation-service/eas-contracts/contracts/Common.sol";

contract PulseToken is ERC1155, Ownable, ERC1155Supply, ERC1155URIStorage {

    error InvalidEAS();
    error InvalidUser();
    error InvalidTokenId();
    event NewAttestation(uint256 content, address author, uint256 contentMintAmount);
    // The address of the global EAS contract.
    IEAS private immutable eas;
    bytes32 public schema; 
    uint256 public freeSuperlikesCounter;
    uint256 public superlikePrice;

    mapping(address=>bool) public authorizedUsers;
    mapping(uint256=>bool)public tokenIdsExist;
    mapping(address=>uint256)public freeSuperlikes;

    receive() external payable {}

    constructor(address initialOwner, IEAS _eas, bytes32 _schema) ERC1155("") Ownable(initialOwner) { 
        if (address(_eas) == address(0)) {
            revert InvalidEAS();
        }
        eas = _eas;
        schema = _schema;
        freeSuperlikesCounter = 3;
        superlikePrice = 0.001 ether;
    }

    function authorizeUser(address user, bool authorized) external onlyOwner {
        if (user == address(0)) {
            revert InvalidUser();
        }
        authorizedUsers[user] = authorized;
    }

    function setFreeSuperlikesCounter(uint256 newfreeSuperlikesCounter) external onlyOwner returns(uint256) {
        freeSuperlikesCounter = newfreeSuperlikesCounter;
        return(freeSuperlikesCounter);
    }

    function setSuperlikesPrice(uint256 newSuperlikesPrice) external onlyOwner returns(uint256) {
        superlikePrice = newSuperlikesPrice;
        return(superlikePrice);
    }

    function mintAndSetUri(address account, uint256 id, uint256 amount, bytes memory data, string memory newuri) public onlyOwner {
        _mint(account, id, amount, data);
        setURI(id, newuri);
        tokenIdsExist[id]=true;
    }

    function mint(address account, uint256 id, bytes memory data, bytes memory EASData) payable public {
        if (msg.sender != account) {
            revert InvalidUser();
        }
        bool isAuthorized = authorizedUsers[account];
        if (!isAuthorized) {
            revert InvalidUser();
        }
        bool tokenExist = tokenIdsExist[id];
        if (!tokenExist) {
            revert InvalidTokenId();
        }
        if(freeSuperlikes[account]>freeSuperlikesCounter) {
            require(msg.value == superlikePrice);
        }
        _mint(account, id, 1, data);
        freeSuperlikes[account] +=1;
        (bool mintEAS, uint256 contentMintAmount) = _checkEASEligibility(id);
        if (mintEAS) {
            (uint256 content, address author) = abi.decode(EASData, (uint256, address));
            _attestUint(content, author, contentMintAmount);
            emit NewAttestation(content, author, contentMintAmount);
        }
    }

    function uri(uint256 tokenId) public view override(ERC1155, ERC1155URIStorage) returns (string memory) {
        return ERC1155URIStorage.uri(tokenId);
    }
    
    function setURI(uint256 tokenId, string memory newuri) public onlyOwner {
        return ERC1155URIStorage._setURI(tokenId, newuri);
    }

    function _checkEASEligibility(uint256 id) internal view returns (bool isEligible, uint256 value) {
        uint256 currentSupply = totalSupply(id);

        // Check if currentSupply is one of the specified values
        if (currentSupply == 5 || currentSupply == 10 || currentSupply == 20 || currentSupply == 50 || currentSupply == 100) {
            isEligible = true;
            value = currentSupply;
        } else {
            isEligible = false;
            value = 0;
        }
        return (isEligible, value);
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }
    
    function _attestUint(uint256 content, address author, uint256 contentMintAmount) internal returns (bytes32) {
        return
            eas.attest(
            AttestationRequest({
                schema: schema,
                data: AttestationRequestData({
                recipient: author, 
                expirationTime: NO_EXPIRATION_TIME, // No expiration time
                revocable: false,
                refUID: EMPTY_UID, // No references UI
                data: abi.encode(content, author, contentMintAmount), // Encode according to the schema params
                value: 0 // No value/ETH
            })
            })
        );
    }
}