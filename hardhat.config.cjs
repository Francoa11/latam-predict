require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.ANTIGRAVITY_PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.28",
    networks: {
        sepolia: {
            url: "https://ethereum-sepolia-rpc.publicnode.com",
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        },
        antigravity: {
            url: "https://rpc.antigravity.network",
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        },
    },
};
