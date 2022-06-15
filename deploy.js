const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require("web3")
const dotenv = require("dotenv");
const { interface, bytecode } = require("./compile");

const provider = new HDWalletProvider(
    process.env.RECOVERY_PHRASE,
    process.env.INFURA_URL
)

const web3 = new Web3(provider);

(async () => {
    const accounts = await web3.eth.getAccounts()

    console.log('Deploying from ', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: ['Hi'] })
        .send({ gas: '1000000', from: accounts[0] });
    console.log('Deployed to ', result.options.address);

})()

