require("@nomiclabs/hardhat-waffle");
const fs = require('fs')

const privateKey = fs.readFileSync('.secret').toString().trim();



module.exports = {
    networks: {
        hardhat: {
            chainId: 1337,
        },
        goerli: {
            url: 'https://eth-goerli.g.alchemy.com/v2/IBEIe-QQgiK-iWlrHief67VcOzHFzOeU',
            accounts: ['1787d362c5926ce8ea90f36497396d627f5045881db891487af8013916f94a04'],
        },
    },
    solidity: "0.8.4",

};