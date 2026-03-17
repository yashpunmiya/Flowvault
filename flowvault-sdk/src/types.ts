/**
 * FlowVault SDK — Type Definitions
 *
 * All numeric amounts are in **micro-units** unless explicitly noted.
 * 1 USDCx = 1,000,000 micro-units (6 decimals).
 */

import type { PostCondition, PostConditionMode } from "@stacks/transactions";

// ---------------------------------------------------------------------------
// Amount types
// ---------------------------------------------------------------------------

/** Acceptable amount inputs for micro-unit values. */
export type MicroAmount = bigint | number | string;

/** Acceptable amount inputs for whole-token values (string recommended). */
export type TokenAmount = bigint | number | string;

/** Post-condition mode input for configuration and call options. */
export type PostConditionModeLike = PostConditionMode | "allow" | "deny";

/** Transaction options for state-changing calls. */
export interface TransactionOptions {
  /** Optional post-conditions to attach to the transaction. */
  postConditions?: PostCondition[];

  /** Optional post-condition mode override. */
  postConditionMode?: PostConditionModeLike;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Supported network identifiers. */
export type NetworkName = "testnet" | "mainnet";

/**
 * Configuration required to initialise a {@link FlowVault} instance.
 *
 * `senderKey` is only required for state-changing operations (deposit,
 * withdraw, set / clear routing rules).  Read-only calls can be made without
 * it by supplying a `senderAddress` to the relevant method.
 */
export interface FlowVaultConfig {
  /** The Stacks network to interact with. */
  network: NetworkName;

  /** The deployer address of the FlowVault contract. */
  contractAddress: string;

  /** The name of the FlowVault contract (e.g. `"flowvault"`). */
  contractName: string;

  /**
   * Private key used for signing transactions.
   * Required for state-changing operations.
   */
  senderKey?: string;

  /** The deployer address of the USDCx token contract. */
  tokenContractAddress: string;

  /** The name of the USDCx token contract (e.g. `"usdcx"`). */
  tokenContractName: string;

  /** Optional default post-conditions for state-changing calls. */
  postConditions?: PostCondition[];

  /** Optional default post-condition mode for state-changing calls. */
  postConditionMode?: PostConditionModeLike;
}

// ---------------------------------------------------------------------------
// Routing Rules
// ---------------------------------------------------------------------------

/**
 * Routing rule configuration as accepted by `set-routing-rules`.
 *
 * All amounts are in micro-units.
 */
export interface RoutingRules {
  /** Amount to lock in the vault (micro-units). */
  lockAmount: MicroAmount;

  /** Block height until which the locked funds remain inaccessible. */
  lockUntilBlock: number;

  /**
   * Stacks principal that receives the split portion.
   * Must be `null` (or omitted) when `splitAmount` is `0`.
   */
  splitAddress: string | null;

  /** Amount to split / forward to `splitAddress` (micro-units). */
  splitAmount: MicroAmount;
}

// ---------------------------------------------------------------------------
// Vault State
// ---------------------------------------------------------------------------

/**
 * Complete vault state for a given user as returned by `get-vault-state`.
 */
export interface VaultState {
  /** Total balance held in the vault (micro-units). */
  totalBalance: number;

  /** Currently locked balance (micro-units; 0 if lock expired). */
  lockedBalance: number;

  /** Available (unlocked) balance (micro-units). */
  unlockedBalance: number;

  /** Block height at which the lock expires. */
  lockUntilBlock: number;

  /** Current Stacks block height at query time. */
  currentBlock: number;

  /** The user's active routing rules (if any). */
  routingRules: RoutingRules;
}

// ---------------------------------------------------------------------------
// Transaction Results
// ---------------------------------------------------------------------------

/** Generic transaction result returned after broadcasting. */
export interface TransactionResult {
  /** The on-chain transaction ID (hex string). */
  txId: string;

  /**
   * Broadcast status.
   * `"success"` means the transaction was accepted into the mempool.
   */
  status: "success" | "error";
}

/** Parsed result of a successful `deposit` call. */
export interface DepositResult {
  deposited: number;
  held: number;
  split: number;
  locked: number;
}

/** Parsed result of a successful `withdraw` call. */
export interface WithdrawResult {
  withdrawn: number;
  remaining: number;
}
