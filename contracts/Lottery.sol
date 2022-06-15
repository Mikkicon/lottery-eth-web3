// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Lottery {
    address public manager;
    address[] public playersAddresses;

    constructor () payable {
        manager = msg.sender;
    }

    function enterCompetition() public payable {
        require(msg.value >= .0005 ether);
        playersAddresses.push(msg.sender);
    }

    function pickWinner() public managerOnly {
        uint index = _random() % playersAddresses.length;
        payable(playersAddresses[index]).transfer(address(this).balance);
        playersAddresses = new address[](0);
    }
 
    function _random() private view returns (uint){
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, playersAddresses)));
    }

    modifier managerOnly(){
        require(msg.sender == manager);
        _;
    }

    function getPlayers() public view returns (address[] memory){
        return playersAddresses;
    }

}