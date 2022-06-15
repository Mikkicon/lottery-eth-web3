// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Lottery {
    address public manager;
    address[] public playersAddresses;
    event ChooseWinner(
        address indexed winner
    );

    constructor () payable {
        manager = msg.sender;
    }

    function enterCompetition() public payable {
        require(msg.value >= .0005 ether);
        playersAddresses.push(msg.sender);
    }

    function pickWinner() public managerOnly {
        uint index = _random() % playersAddresses.length;
        address winnerAddress = playersAddresses[index];
        payable(winnerAddress).transfer(address(this).balance);
        playersAddresses = new address[](0);
        emit ChooseWinner(winnerAddress);
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