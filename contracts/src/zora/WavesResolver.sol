// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {IEAS, Attestation} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import {SchemaResolver} from "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";

/// @title WavesResolver
/// @notice A sample schema resolver that logs a uint256 input.
contract WavesResolver is SchemaResolver {
    /// @notice Emitted to log a uint256 value.
    /// @param value The attested value.
    event Log(uint256 value);

    constructor(IEAS eas) SchemaResolver(eas) {}

    function onAttest(Attestation calldata attestation, uint256 /*value*/ ) internal override returns (bool) {
        uint256 value = abi.decode(attestation.data, (uint256));

        emit Log(value);

        // Mint Wave token if attestation is valid

        return true;
    }

    function onRevoke(Attestation calldata, /*attestation*/ uint256 /*value*/ ) internal pure override returns (bool) {
        // Burn token if minted for attestation
        return true;
    }
}
