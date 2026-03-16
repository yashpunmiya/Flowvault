/**
 * FlowVault SDK — Main class
 *
 * Provides a clean, typed interface to every FlowVault contract function.
 */

import {
  makeContractCall,
  broadcastTransaction,
  fetchCallReadOnlyFunction,
  cvToValue,
  principalCV,
  contractPrincipalCV,
  uintCV,
  someCV,
  noneCV,
  type ClarityValue,
  getAddressFromPrivateKey,
  type PostConditionMode,
} from "@stacks/transactions";

import type {
  FlowVaultConfig,
  NetworkName,
  RoutingRules,
  TransactionResult,
  VaultState,
} from "./types";

import {
  InvalidConfigurationError,
  InvalidAmountError,
  InvalidAddressError,
  ContractCallError,
  NetworkError,
} from "./errors";

import { errorMessageFromCode } from "./constants";
import { resolveNetwork } from "./network";
import {
  assertValidAddress,
  assertValidAmount,
  assertNonNegativeAmount,
  parseVaultState,
  parseRoutingRules,
  safeNumber,
  isBlockInFuture,
} from "./utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a JS number to a Clarity `uint` value. */
function toUintCV(value: number) {
  const safe = Math.max(0, Math.trunc(value));
  return uintCV(BigInt(safe));
}

// ---------------------------------------------------------------------------
// FlowVault class
// ---------------------------------------------------------------------------

export class FlowVault {
  // -- Configuration --------------------------------------------------------

  private readonly network: NetworkName;
  private readonly contractAddress: string;
  private readonly contractName: string;
  private readonly tokenContractAddress: string;
  private readonly tokenContractName: string;
  private readonly senderKey?: string;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  /**
   * Create a new FlowVault SDK instance.
   *
   * @throws {InvalidConfigurationError} if required fields are missing or
   * the network value is invalid.
   */
  constructor(config: FlowVaultConfig) {
    // Validate required fields
    if (!config.contractAddress) {
      throw new InvalidConfigurationError("contractAddress is required.");
    }
    if (!config.contractName) {
      throw new InvalidConfigurationError("contractName is required.");
    }
    if (!config.tokenContractAddress) {
      throw new InvalidConfigurationError("tokenContractAddress is required.");
    }
    if (!config.tokenContractName) {
      throw new InvalidConfigurationError("tokenContractName is required.");
    }

    this.network = resolveNetwork(config.network);
    this.contractAddress = config.contractAddress;
    this.contractName = config.contractName;
    this.tokenContractAddress = config.tokenContractAddress;
    this.tokenContractName = config.tokenContractName;
    this.senderKey = config.senderKey;
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  /** Ensure a sender key is available; throw otherwise. */
  private requireSenderKey(): string {
    if (!this.senderKey) {
      throw new InvalidConfigurationError(
        "A senderKey is required for state-changing operations. " +
          "Pass it in the FlowVaultConfig constructor."
      );
    }
    return this.senderKey;
  }

  /** Derive the sender's Stacks address from the private key. */
  private getSenderAddress(): string {
    const key = this.requireSenderKey();
    // getAddressFromPrivateKey returns the Stacks address on the configured
    // network's version (testnet ↔ mainnet prefix).
    return getAddressFromPrivateKey(key, this.network);
  }

  /** Build and broadcast a contract-call transaction. */
  private async callPublic(
    functionName: string,
    functionArgs: ClarityValue[]
  ): Promise<TransactionResult> {
    const senderKey = this.requireSenderKey();

    try {
      const transaction = await makeContractCall({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName,
        functionArgs,
        senderKey,
        network: this.network,
        postConditionMode: "allow" as unknown as PostConditionMode,
      });

      const result = await broadcastTransaction({
        transaction,
        network: this.network,
      });

      // broadcastTransaction returns { txid } on success or { error, reason } on failure
      if ("error" in result && result.error) {
        const reason =
          typeof result.reason === "string" ? result.reason : JSON.stringify(result);
        throw new ContractCallError(`Broadcast failed: ${reason}`);
      }

      return {
        txId: (result as { txid: string }).txid,
        status: "success",
      };
    } catch (err) {
      if (err instanceof ContractCallError) throw err;
      if (err instanceof InvalidConfigurationError) throw err;

      // Try to extract a FlowVault error code from the rejection
      const msg = err instanceof Error ? err.message : String(err);
      const codeMatch = msg.match(/\bu(\d{4})\b/);
      if (codeMatch) {
        const code = parseInt(codeMatch[1], 10);
        const mapped = errorMessageFromCode(code);
        if (mapped) {
          throw new ContractCallError(mapped, code);
        }
      }

      throw new NetworkError(`Contract call "${functionName}" failed: ${msg}`, err);
    }
  }

  /** Execute a read-only contract call. */
  private async callReadOnly(
    functionName: string,
    functionArgs: ClarityValue[],
    senderAddress: string
  ): Promise<ClarityValue> {
    try {
      return await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName,
        functionArgs,
        senderAddress,
        network: this.network,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new NetworkError(
        `Read-only call "${functionName}" failed: ${msg}`,
        err
      );
    }
  }

  // -------------------------------------------------------------------------
  // Public — State-Changing Methods
  // -------------------------------------------------------------------------

  /**
   * Configure routing rules for the caller.
   *
   * Rules are stored on-chain and executed deterministically on the next
   * deposit.
   *
   * @param rules Routing rule parameters (amounts in micro-units).
   * @returns The broadcast transaction result.
   *
   * @throws {InvalidAmountError} if amounts are invalid.
   * @throws {InvalidAddressError} if `splitAddress` is not a valid principal.
   * @throws {ContractCallError} on on-chain rejection.
   */
  async setRoutingRules(rules: RoutingRules): Promise<TransactionResult> {
    // --- Validation ---
    assertNonNegativeAmount(rules.lockAmount, "lockAmount");
    assertNonNegativeAmount(rules.lockUntilBlock, "lockUntilBlock");
    assertNonNegativeAmount(rules.splitAmount, "splitAmount");

    if (rules.splitAmount > 0 && !rules.splitAddress) {
      throw new InvalidAddressError(
        "",
        "splitAddress is required when splitAmount > 0."
      );
    }

    if (rules.splitAddress) {
      assertValidAddress(rules.splitAddress);

      // Prevent split-to-self
      const sender = this.getSenderAddress();
      if (rules.splitAddress === sender) {
        throw new InvalidAddressError(
          rules.splitAddress,
          "splitAddress cannot be the same as the sender (split-to-self)."
        );
      }
    }

    // --- Build args ---
    const functionArgs: ClarityValue[] = [
      toUintCV(rules.lockAmount),
      toUintCV(rules.lockUntilBlock),
      rules.splitAddress
        ? someCV(principalCV(rules.splitAddress))
        : noneCV(),
      toUintCV(rules.splitAmount),
    ];

    return this.callPublic("set-routing-rules", functionArgs);
  }

  /**
   * Deposit USDCx into the vault.
   *
   * Routing rules (lock / split / hold) are applied automatically at
   * deposit time.
   *
   * @param amount Amount to deposit in micro-units.
   * @returns The broadcast transaction result.
   *
   * @throws {InvalidAmountError} if amount is not a positive integer.
   * @throws {ContractCallError} on on-chain rejection.
   */
  async deposit(amount: number): Promise<TransactionResult> {
    assertValidAmount(amount, "Deposit amount");

    const functionArgs: ClarityValue[] = [
      contractPrincipalCV(this.tokenContractAddress, this.tokenContractName),
      toUintCV(amount),
    ];

    return this.callPublic("deposit", functionArgs);
  }

  /**
   * Withdraw unlocked USDCx from the vault.
   *
   * Only the unlocked portion of the balance can be withdrawn. Locked funds
   * remain inaccessible until the lock block height is reached.
   *
   * @param amount Amount to withdraw in micro-units.
   * @returns The broadcast transaction result.
   *
   * @throws {InvalidAmountError} if amount is not a positive integer.
   * @throws {ContractCallError} on on-chain rejection (e.g. funds locked).
   */
  async withdraw(amount: number): Promise<TransactionResult> {
    assertValidAmount(amount, "Withdraw amount");

    const functionArgs: ClarityValue[] = [
      contractPrincipalCV(this.tokenContractAddress, this.tokenContractName),
      toUintCV(amount),
    ];

    return this.callPublic("withdraw", functionArgs);
  }

  /**
   * Clear all routing rules for the caller.
   *
   * After clearing, subsequent deposits will simply add to the unlocked
   * balance with no routing applied.
   *
   * @returns The broadcast transaction result.
   */
  async clearRoutingRules(): Promise<TransactionResult> {
    return this.callPublic("clear-routing-rules", []);
  }

  // -------------------------------------------------------------------------
  // Public — Read-Only Methods
  // -------------------------------------------------------------------------

  /**
   * Fetch the complete vault state for a given user.
   *
   * @param userAddress The Stacks address to query.
   * @returns Typed {@link VaultState} object.
   *
   * @throws {InvalidAddressError} if the address is invalid.
   * @throws {NetworkError} on RPC failure.
   */
  async getVaultState(userAddress: string): Promise<VaultState> {
    assertValidAddress(userAddress);

    const cv = await this.callReadOnly(
      "get-vault-state",
      [principalCV(userAddress)],
      userAddress
    );

    return parseVaultState(cv);
  }

  /**
   * Fetch routing rules for a given user.
   *
   * @returns The user's routing rules, or `null` if none are set.
   */
  async getRoutingRules(userAddress: string): Promise<RoutingRules | null> {
    assertValidAddress(userAddress);

    const cv = await this.callReadOnly(
      "get-routing-rules",
      [principalCV(userAddress)],
      userAddress
    );

    return parseRoutingRules(cv);
  }

  /**
   * Check whether a user currently has locked funds.
   *
   * @returns `true` if the user has a positive locked balance whose lock
   * has not yet expired.
   */
  async hasLockedFunds(userAddress: string): Promise<boolean> {
    assertValidAddress(userAddress);

    const cv = await this.callReadOnly(
      "has-locked-funds",
      [principalCV(userAddress)],
      userAddress
    );

    return !!cvToValue(cv);
  }

  /**
   * Get the current Stacks block height as reported by the contract.
   *
   * Useful for computing valid `lockUntilBlock` values.
   *
   * @param senderAddress Any valid Stacks address (used only as the
   * simulated `tx-sender` for the read-only call).
   */
  async getCurrentBlockHeight(senderAddress: string): Promise<number> {
    assertValidAddress(senderAddress);

    const cv = await this.callReadOnly(
      "get-current-block-height",
      [],
      senderAddress
    );

    return safeNumber(cvToValue(cv));
  }
}
