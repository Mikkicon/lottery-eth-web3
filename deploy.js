const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require("web3")
const dotenv = require("dotenv");

const { abi, evm } = require("./compile");

const provider = new HDWalletProvider(
    process.env.RECOVERY_PHRASE,
    process.env.INFURA_URL
)

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts()

    console.log('Deploying from ', accounts[0]);

    const result = await new web3.eth.Contract(abi)
        .deploy({ data: ev.bytecode.object, arguments: ['Hi'] })
        .send({ gas: '1000000', from: accounts[0] });
    console.log('Deployed to ', result.options.address);
    provider.engine.stop()
}

deploy()