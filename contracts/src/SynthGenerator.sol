// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "./Synth.sol";
import "./Ticket.sol";
import "./Constants.sol";
import "./interfaces/IERC6551Registry.sol";

contract SynthGenerator is ERC721, Pausable, Ownable {
    address public ticket;
    address public waves;
    address[] public synths;
    mapping(address => bool) attendeeClaimedSynth;

    using Counters for Counters.Counter;

    Counters.Counter private _synthIdCounter;

    constructor(address _ticket, address _waves, address _owner, string memory _eventName)
        ERC721(_eventName, "SYNTH")
    {
        ticket = _ticket;
        waves = _waves;

        transferOwnership(_owner);
    }

    // Used by Attendee to generate Synth (ERC-6551 & Gen Art token)
    function generateSynth() public whenNotPaused returns (address) {
        Ticket ticketContract = Ticket(ticket);

        require(ticketContract.balanceOf(msg.sender) > 0, "SynthGenerator: must own ticket");
        require(!attendeeClaimedSynth[msg.sender], "SynthGenerator: already claimed");

        attendeeClaimedSynth[msg.sender] = true;
        uint256 tokenId = _synthIdCounter.current();

        _synthIdCounter.increment();
        _safeMint(msg.sender, tokenId);

        IERC6551Registry erc6551Registry = IERC6551Registry(ERC6551_REGISTRY_ADDRESS);

        // bytes memory initCallData =
        //     abi.encodeWithSignature("initialize(address ticketAddrs, address wavesAddrs)", ticket, waves);

        address synth =
            erc6551Registry.createAccount(ERC6551_IMPLEMENTATION_ADDRESS, 0, address(this), tokenId, 0, "");

        synths.push(synth);

        return synth;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId);
    }
}
