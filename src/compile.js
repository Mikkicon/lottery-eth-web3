require("dotenv/config");
const { getSource } = require("./util");
const solc = require("solc");

const getInput = (sources) => ({
  language: "Solidity",
  sources,
  settings: { outputSelection: { "*": { "*": ["*"] } } },
});

const compile = (filename, contractName) => {
  const filesource = getSource(filename);
  const sources = { [filename]: { content: filesource } };
  const input = getInput(sources);
  const compiled = JSON.parse(solc.compile(JSON.stringify(input)));
  if (compiled.errors) throw new Error(compiled.errors);
  else return compiled.contracts[filename][contractName];
};

module.exports = compile;
