/**
 * FlowVault SDK — Constants
 */

import type { NetworkName } from "./types";

// ---------------------------------------------------------------------------
// Default contract addresses (can be overridden via FlowVaultConfig)
// ---------------------------------------------------------------------------

export const DEFAULT_CONTRACTS: Record<
  NetworkName,
  {
    contractAddress: string;
    contractName: string;
    tokenContractAddress: string;
    tokenContractName: string;
  }
> = {
  testnet: {
    contractAddress: "STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD",
    contractName: "flowvault",
    tokenContractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    tokenContractName: "usdcx",
  },
  mainnet: {
    contractAddress: "",
    contractName: "flowvault",
    tokenContractAddress: "",
    tokenContractName: "usdcx",
  },
};

// ---------------------------------------------------------------------------
// USDCx decimals
// ---------------------------------------------------------------------------

/** USDCx uses 6 decimal places (same as USDC). */
export const USDCX_DECIMALS = 6;

/** Multiplier to convert whole tokens → micro-units. */
export const USDCX_MULTIPLIER = 10 ** USDCX_DECIMALS; // 1_000_000

// ---------------------------------------------------------------------------
// Contract error code → human-readable message
// ---------------------------------------------------------------------------

export const ERROR_CODE_MAP: Record<number, string> = {
  1000: "Not authorized",
  1001: "Invalid amount — must be greater than zero",
  1002: "Insufficient balance",
  1003: "Funds are currently locked",
  1004: "Routing amounts exceed the deposit amount",
  1005: "Token transfer failed",
  1006: "No vault configuration found for this user",
  1007: "Invalid split address — split address is required when split amount > 0",
  1008: "Invalid lock block — must be a future block height",
  1009: "Arithmetic overflow",
  1010: "Lock amount exceeds the hold amount (deposit minus split)",
  1011: "Cannot split to yourself",
};

/**
 * Resolve a contract error code to a descriptive message.
 * Returns `undefined` if the code is not a known FlowVault error.
 */
export function errorMessageFromCode(code: number): string | undefined {
  return ERROR_CODE_MAP[code];
}
