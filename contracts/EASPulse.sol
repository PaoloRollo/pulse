import "@openzeppelin/contracts@5.0.0/access/Ownable.sol";
import { IEAS, AttestationRequest, AttestationRequestData } from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import { NO_EXPIRATION_TIME, EMPTY_UID } from "@ethereum-attestation-service/eas-contracts/contracts/Common.sol";

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PulseEAS is Ownable {

    error InvalidEAS();
    error InvalidUser();
    error InvalidTokenId();
    event NewAttestation(bytes32 schema, uint256 actionTimestamp, bool isSuperlike, uint256 action, address user);
    // The address of the global EAS contract.
    IEAS private immutable eas;

    constructor(address initialOwner, IEAS _eas)Ownable(initialOwner) { 
        if (address(_eas) == address(0)) {
            revert InvalidEAS();
        }
        eas = _eas;
    }

    function attestUint(bytes32 schema, address user, uint256 actionTimestamp, bool isSuperlike, uint256 action) external onlyOwner returns (bytes32) {

        bytes32 attestationResult = eas.attest(
            AttestationRequest({
                schema: schema,
                data: AttestationRequestData({
                recipient: user, 
                expirationTime: NO_EXPIRATION_TIME, // No expiration time
                revocable: false,
                refUID: EMPTY_UID, // No references UI
                data: abi.encode(actionTimestamp, isSuperlike, action), // Encode according to the schema params
                value: 0 // No value/ETH
            })
            })
        );
        // Check if the attestation was successful
        require(attestationResult != "0x", "Attestation failed");
        // If successful, emit the event
        emit NewAttestation(schema, actionTimestamp, isSuperlike, action, user);
        return attestationResult;
    }
}