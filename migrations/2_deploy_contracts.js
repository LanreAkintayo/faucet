// The purpose of using this file is that it enables us to deploy our all our smart contract to the block chain.

const Faucet = artifacts.require("Faucet");

module.exports = async function(deployer) {
    await deployer.deploy(Faucet); 
    
};