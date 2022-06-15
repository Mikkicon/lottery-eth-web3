
const fs = require("fs");
const path = require("path");

function getSource(contractFileName) {
    const inboxPath = path.resolve(__dirname, "contracts", contractFileName);
    const source = fs.readFileSync(inboxPath, "utf8");
    return source;
}

module.exports = {
    getSource,
}