const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const { abi, evm } = require("../compile");

let accounts;
let inbox;
const initialMessage = "Hi there!"

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();
  inbox = await new web3.eth.Contract(abi)
    .deploy({
      data: evm.bytecode.object,
      arguments: [initialMessage],
    })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("Inbox", () => {
  it("deploys a contract", () => {
    assert.ok(inbox.options.address);
  });

  it("initializes with message", async () => {
    const message = await inbox.methods.message().call()
    console.log(message);
    assert.equal(message, initialMessage)
  });

  it("updates a message", async () => {
    await inbox.methods.setMessage('Bye').send({ from: accounts[0] })
    const message = await inbox.methods.message().call()
    console.log(message);
    assert.equal(message, 'Bye')
  });
});
