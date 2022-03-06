pragma solidity >=0.4.22 <0.9.0;

contract Faucet {
    uint256 public numOfFunders;
    mapping(address => bool) private funders;
    mapping(uint256 => address) private lutFunders;

    receive() external payable {
        addFunds();
    }

    modifier limitWithdraw(uint256 withdrawAmount) {
        require(
            withdrawAmount <= (0.1 * 10 **18),
            "You can't withdraw up to this amount"
        );
        _;
    }

    function addFunds() public payable {
        address funder = msg.sender;

        if (!funders[funder]) {
            uint256 index = numOfFunders++;
            funders[funder] = true;
            lutFunders[index] = funder;
        }
    }

    function withdraw(uint256 withdrawAmount)
        external
        limitWithdraw(withdrawAmount)
    {
        // withdrawAmount will be transferred to the address calling it and 
        // throws an exception if transfer is not successful
        payable(msg.sender).transfer(withdrawAmount);
    }

    function getAllFunders() external view returns (address[] memory) {
        address[] memory _funders = new address[](numOfFunders);

        for (uint256 i = 0; i < numOfFunders; i++) {
            _funders[i] = lutFunders[i];
        }

        return _funders;
    }

    function getFunderAtIndex(uint8 index) external view returns (address) {
        return lutFunders[index];
    }

}

// const faucet = await Faucet.deployed()
// const accounts = await web3.eth.getAccounts()
// faucet.sendTransaction({from: accounts[0], value: web3.utils.toWei('1', 'ether')})