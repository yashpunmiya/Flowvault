/**
 * FlowVault SDK — Error Classes
 *
 * Standardised, descriptive error hierarchy so consumers can catch and
 * handle failures precisely.
 */

// ---------------------------------------------------------------------------
// Base
// ---------------------------------------------------------------------------

/** Base error for all FlowVault SDK errors. */
export class FlowVaultError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FlowVaultError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

/** Thrown when a numeric amount is invalid (negative, NaN, non-integer …). */
export class InvalidAmountError extends FlowVaultError {
  constructor(message = "Amount must be a positive integer.") {
    super(message);
    this.name = "InvalidAmountError";
  }
}

/** Thrown when a Stacks address fails validation. */
export class InvalidAddressError extends FlowVaultError {
  public readonly address: string;

  constructor(address: string, message?: string) {
    super(message ?? `Invalid Stacks address: ${address}`);
    this.name = "InvalidAddressError";
    this.address = address;
  }
}

/** Thrown when routing rule constraints are invalid or unsafe. */
export class InvalidRoutingRuleError extends FlowVaultError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRoutingRuleError";
  }
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Thrown when FlowVault is constructed with bad configuration. */
export class InvalidConfigurationError extends FlowVaultError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidConfigurationError";
  }
}

/** Thrown when network selection or network config is invalid. */
export class NetworkConfigurationError extends FlowVaultError {
  constructor(message: string) {
    super(message);
    this.name = "NetworkConfigurationError";
  }
}

// ---------------------------------------------------------------------------
// Contract interaction
// ---------------------------------------------------------------------------

/**
 * Thrown when a contract call fails.
 *
 * If the failure originated from a known FlowVault error code the `code`
 * property is populated.
 */
export class ContractCallError extends FlowVaultError {
  /** FlowVault contract error code (e.g. `1001`), if applicable. */
  public readonly code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.name = "ContractCallError";
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Network
// ---------------------------------------------------------------------------

/** Thrown on network-level failures (RPC unreachable, timeouts, …). */
export class NetworkError extends FlowVaultError {
  public readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "NetworkError";
    this.cause = cause;
  }
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/** Thrown when a contract response cannot be parsed safely. */
export class ParsingError extends FlowVaultError {
  public readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "ParsingError";
    this.cause = cause;
  }
}
