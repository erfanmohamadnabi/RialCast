// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SpinGame {
    address public owner;
    uint256 public spinFee = 0.001 ether;

    event Spun(address indexed player, uint256 result, uint256 timestamp);
    event FeeUpdated(uint256 newFee);
    event Withdrawn(address owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function spin() external payable returns (uint256) {
        require(msg.value >= spinFee, "Insufficient fee");

        // Pseudo-random result (1-8 segments)
        uint256 result = (uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    block.number
                )
            )
        ) % 8) + 1;

        emit Spun(msg.sender, result, block.timestamp);
        return result;
    }

    function setSpinFee(uint256 _fee) external onlyOwner {
        spinFee = _fee;
        emit FeeUpdated(_fee);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Nothing to withdraw");
        payable(owner).transfer(balance);
        emit Withdrawn(owner, balance);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
