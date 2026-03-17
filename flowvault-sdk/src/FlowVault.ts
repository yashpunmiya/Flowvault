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
  PostConditionMode,
  type PostCondition,
} from "@stacks/transactions";

import type {
  FlowVaultConfig,
  NetworkName,
  MicroAmount,
  RoutingRules,
  TransactionResult,
  TransactionOptions,
  VaultState,
  PostConditionModeLike,
} from "./types";

import {
  InvalidConfigurationError,
  InvalidRoutingRuleError,
  ContractCallError,
  NetworkError,
} from "./errors";

import { errorMessageFromCode } from "./constants";
import { resolveNetwork } from "./network";
import {
  assertValidAddress,
  assertValidContractName,
  parseMicroAmount,
  parseVaultState,
  parseRoutingRules,
  safeNumber,
  isBlockInFuture,
  parseBool,
} from "./utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a micro-unit amount into a Clarity `uint`. */
function toUintCVFromMicro(
  amount: MicroAmount,
  label: string,
  allowZero: boolean
): ClarityValue {
  const value = parseMicroAmount(amount, label, allowZero);
  return uintCV(value);
}

/** Convert a block height into a Clarity `uint`. */
function toUintCVFromBlock(height: number, label: string): ClarityValue {
  if (!Number.isFinite(height) || !Number.isInteger(height) || height < 0) {
    throw new InvalidRoutingRuleError(`${label} must be a non-negative integer.`);
  }
  return uintCV(BigInt(height));
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
  private readonly postConditions?: PostCondition[];
  private readonly postConditionMode?: PostConditionModeLike;

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

    assertValidAddress(config.contractAddress);
    assertValidAddress(config.tokenContractAddress);
    assertValidContractName(config.contractName, "contractName");
    assertValidContractName(config.tokenContractName, "tokenContractName");

    this.network = resolveNetwork(config.network);
    this.contractAddress = config.contractAddress;
    this.contractName = config.contractName;
    this.tokenContractAddress = config.tokenContractAddress;
    this.tokenContractName = config.tokenContractName;
    this.senderKey = config.senderKey;
    this.postConditions = config.postConditions;
    this.postConditionMode = config.postConditionMode;
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

  /** Resolve a post-condition mode input to the enum value. */
  private resolvePostConditionMode(
    mode?: PostConditionModeLike
  ): PostConditionMode {
    if (!mode) return PostConditionMode.Allow;
    if (mode === "allow") return PostConditionMode.Allow;
    if (mode === "deny") return PostConditionMode.Deny;
    return mode;
  }

  /** Resolve post-conditions and mode for a state-changing call. */
  private resolvePostConditions(options?: TransactionOptions): {
    postConditions?: PostCondition[];
    postConditionMode: PostConditionMode;
  } {
    return {
      postConditions: options?.postConditions ?? this.postConditions,
      postConditionMode: this.resolvePostConditionMode(
        options?.postConditionMode ?? this.postConditionMode
      ),
    };
  }

  /** Build and broadcast a contract-call transaction. */
  private async callPublic(
    functionName: string,
    functionArgs: ClarityValue[],
    options?: TransactionOptions
  ): Promise<TransactionResult> {
    const senderKey = this.requireSenderKey();
    const { postConditions, postConditionMode } =
      this.resolvePostConditions(options);

    try {
      const transaction = await makeContractCall({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName,
        functionArgs,
        senderKey,
        network: this.network,
        postConditions,
        postConditionMode,
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
  * @param options Optional transaction options (post-conditions).
   * @returns The broadcast transaction result.
   *
   * @throws {InvalidAmountError} if amounts are invalid.
   * @throws {InvalidAddressError} if `splitAddress` is not a valid principal.
   * @throws {ContractCallError} on on-chain rejection.
   */
  async setRoutingRules(
    rules: RoutingRules,
    options?: TransactionOptions
  ): Promise<TransactionResult> {
    // --- Validation ---
    const lockAmount = parseMicroAmount(rules.lockAmount, "lockAmount", true);
    const splitAmount = parseMicroAmount(rules.splitAmount, "splitAmount", true);

    if (!Number.isFinite(rules.lockUntilBlock) ||
      !Number.isInteger(rules.lockUntilBlock) ||
      rules.lockUntilBlock < 0) {
      throw new InvalidRoutingRuleError(
        "lockUntilBlock must be a non-negative integer."
      );
    }

    if (splitAmount > 0n && !rules.splitAddress) {
      throw new InvalidRoutingRuleError(
        "splitAddress is required when splitAmount > 0."
      );
    }

    if (rules.splitAddress) {
      assertValidAddress(rules.splitAddress);

      // Prevent split-to-self
      const sender = this.getSenderAddress();
      if (rules.splitAddress === sender) {
        throw new InvalidRoutingRuleError(
          "splitAddress cannot be the same as the sender (split-to-self)."
        );
      }
    }

    if (lockAmount > 0n) {
      const currentBlock = await this.getCurrentBlockHeight(
        this.getSenderAddress()
      );
      if (!isBlockInFuture(rules.lockUntilBlock, currentBlock)) {
        throw new InvalidRoutingRuleError(
          "lockUntilBlock must be in the future relative to current block."
        );
      }
    }

    // --- Build args ---
    const functionArgs: ClarityValue[] = [
      uintCV(lockAmount),
      toUintCVFromBlock(rules.lockUntilBlock, "lockUntilBlock"),
      rules.splitAddress
        ? someCV(principalCV(rules.splitAddress))
        : noneCV(),
      uintCV(splitAmount),
    ];

    return this.callPublic("set-routing-rules", functionArgs, options);
  }

  /**
   * Deposit USDCx into the vault.
   *
   * Routing rules (lock / split / hold) are applied automatically at
   * deposit time.
   *
  * @param amount Amount to deposit in micro-units.
  * @param options Optional transaction options (post-conditions).
   * @returns The broadcast transaction result.
   *
   * @throws {InvalidAmountError} if amount is not a positive integer.
   * @throws {ContractCallError} on on-chain rejection.
   */
  async deposit(
    amount: MicroAmount,
    options?: TransactionOptions
  ): Promise<TransactionResult> {
    const functionArgs: ClarityValue[] = [
      contractPrincipalCV(this.tokenContractAddress, this.tokenContractName),
      toUintCVFromMicro(amount, "Deposit amount", false),
    ];

    return this.callPublic("deposit", functionArgs, options);
  }

  /**
   * Withdraw unlocked USDCx from the vault.
   *
   * Only the unlocked portion of the balance can be withdrawn. Locked funds
   * remain inaccessible until the lock block height is reached.
   *
  * @param amount Amount to withdraw in micro-units.
  * @param options Optional transaction options (post-conditions).
  * @returns The broadcast transaction result.
   *
   * @throws {InvalidAmountError} if amount is not a positive integer.
   * @throws {ContractCallError} on on-chain rejection (e.g. funds locked).
   */
  async withdraw(
    amount: MicroAmount,
    options?: TransactionOptions
  ): Promise<TransactionResult> {
    const functionArgs: ClarityValue[] = [
      contractPrincipalCV(this.tokenContractAddress, this.tokenContractName),
      toUintCVFromMicro(amount, "Withdraw amount", false),
    ];

    return this.callPublic("withdraw", functionArgs, options);
  }

  /**
   * Clear all routing rules for the caller.
   *
   * After clearing, subsequent deposits will simply add to the unlocked
   * balance with no routing applied.
   *
   * @returns The broadcast transaction result.
   */
  async clearRoutingRules(
    options?: TransactionOptions
  ): Promise<TransactionResult> {
    return this.callPublic("clear-routing-rules", [], options);
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

    return parseBool(cv, "has-locked-funds");
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
