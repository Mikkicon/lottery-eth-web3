require('dotenv/config')
const path = require("path");
const fs = require("fs");
const solc = require("solc");

const inboxContractFileName = 'Inbox.sol';
const inboxPath = path.resolve(__dirname, "contracts", inboxContractFileName);
const source = fs.readFileSync(inboxPath, "utf8");

const input = {
  language: 'Solidity',
  sources: {
    [inboxContractFileName]: {
      content: source,
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      }
    }
  }
}

module.exports = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
  inboxContractFileName
].Inbox;
