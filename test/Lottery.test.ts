import assert = require("assert");
import ganache from "ganache";
import Web3 from "web3";
import { Contract, ContractSendMethod } from "web3-eth-contract";
import compile = require("../src/compile");
const web3 = new Web3(ganache.provider());
const { abi, evm } = compile("Lottery.sol", "Lottery");

type Address = string;

const ETH_0005 = web3.utils.toWei("0.0005", "ether");
let manager: Address;
let accounts: Address[];
let contract: Contract;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  manager = accounts[0];
  contract = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ from: manager, gas: 1000000 });
});

describe("Lottery", () => {
  it("deploys contract", () => {
    assert.ok(contract.options.address);
  });

  it("initializes manager", async () => {
    const contractManager = await contract.methods.manager().call();
    assert.equal(contractManager, manager);
  });

  it("enter competition with not enough eth should fail", (done) => {
    const enterMethod: ContractSendMethod = contract.methods.enterCompetition();
    enterMethod
      .send({ from: accounts[1], value: 0 })
      .catch(assert.ok)
      .finally(done);
  });

  it("enter competition with enough eth should succeed", async () => {
    const enterMethod: ContractSendMethod = contract.methods.enterCompetition();
    await enterMethod.send({ from: accounts[1], value: ETH_0005 });
    const players = await contract.methods.getPlayers().call();
    assert.equal(players[0], accounts[1]);
  });

  it("should be able to get players", async () => {
    const enterMethod: ContractSendMethod = contract.methods.enterCompetition();
    await enterMethod.send({ from: accounts[1], value: ETH_0005 });
    await enterMethod.send({ from: accounts[2], value: ETH_0005 });
    const players = await contract.methods.getPlayers().call();
    assert.equal(players[0], accounts[1]);
    assert.equal(players[1], accounts[2]);
  });

  it("should fail if non-manager picks a winner", async () => {
    const enterMethod: ContractSendMethod = contract.methods.enterCompetition();
    const pickWinnerMethod: ContractSendMethod = contract.methods.pickWinner();
    const [manager, firstPlayer, secondPlayer] = accounts;

    await enterMethod.send({ from: firstPlayer, value: ETH_0005 });
    await enterMethod.send({ from: secondPlayer, value: ETH_0005 });

    const enrolledPlayers = await contract.methods.getPlayers().call();
    assert.equal(enrolledPlayers.length, 2);

    try {
      await pickWinnerMethod.call();
      assert.fail("Should have catched error.");
    } catch (error) {
      assert.ok(error, "Cathed error as expected!");
    }
  });

  it("should succeed if manager picks winner and send price to one of participants", async () => {
    const enterMethod: ContractSendMethod = contract.methods.enterCompetition();
    const pickWinnerMethod: ContractSendMethod = contract.methods.pickWinner();
    const [manager, firstPlayer, secondPlayer] = accounts;

    const firstPlayerInitialBalance = await web3.eth.getBalance(firstPlayer);
    const secondPlayerInitialBalance = await web3.eth.getBalance(secondPlayer);

    await enterMethod.send({ from: firstPlayer, value: ETH_0005 });
    await enterMethod.send({ from: secondPlayer, value: ETH_0005 });

    const enrolledPlayers = await contract.methods.getPlayers().call();
    assert.equal(enrolledPlayers.length, 2);

    await pickWinnerMethod.send({ from: manager }).catch((error) => {
      console.warn("pickWinnerMethod.send", error);
    });

    const playersAfterPickWinner = await contract.methods.getPlayers().call();
    assert.equal(playersAfterPickWinner.length, 0);

    const firstPlayerFinalBalance = await web3.eth.getBalance(firstPlayer);
    const secondPlayerFinalBalance = await web3.eth.getBalance(secondPlayer);

    const hasFirstWon =
      BigInt(firstPlayerFinalBalance) > BigInt(firstPlayerInitialBalance);
    const hasSecondWon =
      BigInt(secondPlayerFinalBalance) > BigInt(secondPlayerInitialBalance);

    assert.ok(hasFirstWon || hasSecondWon);
  });
});
