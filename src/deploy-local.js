const ganache = require("ganache");
const Web3 = require("web3");
const dotenv = require("dotenv");

const compile = require("./compile");

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const deploy = async () => {
  const compiled = compile("Lottery.sol", "Lottery");
  if (!compiled) return;
  const { abi, evm } = compiled;

  const accounts = await web3.eth.getAccounts();

  console.log("Deploying from ", accounts[0]);
  web3.eth.getBalance(accounts[0]).then(console.log);

  const result = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ gas: "1000000", from: accounts[0] });

  console.log(JSON.stringify(abi));
  console.log("Deployed to ", result.options.address);
};

deploy();
