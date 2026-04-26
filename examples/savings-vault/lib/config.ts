import { DEFAULT_CONTRACTS, type NetworkName } from "flowvault-sdk";

function readNetwork(): NetworkName {
  const value = process.env.NEXT_PUBLIC_FLOWVAULT_NETWORK;
  return value === "mainnet" ? "mainnet" : "testnet";
}

export const FLOWVAULT_NETWORK = readNetwork();

export const FLOWVAULT_CONTRACTS = {
  contractAddress:
    process.env.NEXT_PUBLIC_FLOWVAULT_CONTRACT_ADDRESS ??
    DEFAULT_CONTRACTS[FLOWVAULT_NETWORK].contractAddress,
  contractName:
    process.env.NEXT_PUBLIC_FLOWVAULT_CONTRACT_NAME ??
    DEFAULT_CONTRACTS[FLOWVAULT_NETWORK].contractName,
  tokenContractAddress:
    process.env.NEXT_PUBLIC_FLOWVAULT_TOKEN_CONTRACT_ADDRESS ??
    DEFAULT_CONTRACTS[FLOWVAULT_NETWORK].tokenContractAddress,
  tokenContractName:
    process.env.NEXT_PUBLIC_FLOWVAULT_TOKEN_CONTRACT_NAME ??
    DEFAULT_CONTRACTS[FLOWVAULT_NETWORK].tokenContractName,
};
