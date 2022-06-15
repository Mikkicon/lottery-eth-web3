// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract CampaignFactory {
    address[] public contracts;

    function createContract(uint256 minContribution) public {
        Campaign deployedContract = new Campaign(minContribution, msg.sender);
        contracts.push(address(deployedContract));
    }

    function getContracts() public view returns (address[] memory) {
        return contracts;
    }
}

contract Campaign {
    enum Status {
        pending,
        finalized
    }

    struct Request {
        uint256 id;
        uint256 amount;
        address payable destination;
        Status status;
        mapping(address => bool) approved;
        uint256 amountApproved;
    }
    address public manager;
    uint256 public minimumContribution;
    uint256 amountApprovers;
    mapping(address => bool) public approvers;
    Request[] public requests;

    modifier managerOnly() {
        require(msg.sender == manager);
        _;
    }

    modifier contributorOnly() {
        require(approvers[msg.sender]);
        _;
    }

    constructor(uint256 minContribution, address creator) {
        manager = creator;
        minimumContribution = minContribution;
    }

    function contribute() public payable {
        require(msg.sender != manager);

        if (
            msg.value >= minimumContribution && approvers[msg.sender] == false
        ) {
            approvers[msg.sender] = true;
            amountApprovers += 1;
        }
    }

    function createRequest(
        uint256 requestAmount,
        address payable requestDestination
    ) public managerOnly {
        Request storage newRequest = requests.push();
        newRequest.id = requests.length;
        newRequest.amount = requestAmount;
        newRequest.destination = requestDestination;
        newRequest.status = Status.pending;
        newRequest.amountApproved = 0;
    }

    function approveRequest(uint256 requestId) public contributorOnly {
        require(requests[requestId].status == Status.pending);
        require(requests[requestId].approved[msg.sender] == false);

        requests[requestId].approved[msg.sender] = true;
        requests[requestId].amountApproved += 1;
    }

    function finalizeRequest(uint256 requestId) public managerOnly {
        require(address(this).balance >= requests[requestId].amount);

        uint256 amountApproved = requests[requestId].amountApproved;
        uint256 percentApproved = (amountApproved / amountApprovers) * 100;
        require(percentApproved > 80);

        requests[requestId].destination.transfer(requests[requestId].amount);
        requests[requestId].status = Status.finalized;
    }
}
