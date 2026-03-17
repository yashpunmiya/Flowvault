/**
 * FlowVault SDK - Utility helpers
 */

import { validateStacksAddress, cvToValue, type ClarityValue } from "@stacks/transactions";
import {
  InvalidAddressError,
  InvalidAmountError,
  InvalidConfigurationError,
  ParsingError,
} from "./errors";
import {
  USDCX_DECIMALS,
  USDCX_MULTIPLIER_BIGINT,
} from "./constants";
import type { RoutingRules, VaultState, MicroAmount, TokenAmount } from "./types";

const MICRO_INT_PATTERN = /^\d+$/;
const TOKEN_DECIMAL_PATTERN = /^\d+(\.\d+)?$/;
const CONTRACT_NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]{0,39}$/;

// ---------------------------------------------------------------------------
// Address validation
// ---------------------------------------------------------------------------

/**
 * Assert that `address` is a syntactically valid Stacks address.
 * Throws {@link InvalidAddressError} on failure.
 */
export function assertValidAddress(address: string): void {
  if (!address || !validateStacksAddress(address)) {
    throw new InvalidAddressError(address);
  }
}

/**
 * Check whether `address` is a valid Stacks address without throwing.
 */
export function isValidAddress(address: string): boolean {
  try {
    return !!address && validateStacksAddress(address);
  } catch {
    return false;
  }
}

/**
 * Assert that a contract name is valid for Stacks.
 */
export function assertValidContractName(name: string, label = "contractName"): void {
  if (!name || !CONTRACT_NAME_PATTERN.test(name)) {
    throw new InvalidConfigurationError(`${label} is invalid: ${name}`);
  }
}

/**
 * Check whether a contract name is valid without throwing.
 */
export function isValidContractName(name: string): boolean {
  return !!name && CONTRACT_NAME_PATTERN.test(name);
}

// ---------------------------------------------------------------------------
// Amount parsing and validation
// ---------------------------------------------------------------------------

function parseMicroAmountValue(
  amount: MicroAmount,
  label: string,
  allowZero: boolean
): bigint {
  let value: bigint;

  if (typeof amount === "bigint") {
    value = amount;
  } else if (typeof amount === "number") {
    if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
      throw new InvalidAmountError(`${label} must be an integer.`);
    }
    if (!Number.isSafeInteger(amount)) {
      throw new InvalidAmountError(`${label} exceeds safe integer range.`);
    }
    value = BigInt(amount);
  } else if (typeof amount === "string") {
    const trimmed = amount.trim();
    if (!MICRO_INT_PATTERN.test(trimmed)) {
      throw new InvalidAmountError(`${label} must be a whole-number string.`);
    }
    value = BigInt(trimmed);
  } else {
    throw new InvalidAmountError(`${label} must be a bigint, number, or string.`);
  }

  if (value < 0n || (!allowZero && value === 0n)) {
    throw new InvalidAmountError(
      `${label} must be ${allowZero ? "non-negative" : "positive"}.`
    );
  }

  return value;
}

function parseTokenAmountValue(tokens: TokenAmount, label: string): bigint {
  if (typeof tokens === "bigint") {
    if (tokens < 0n) {
      throw new InvalidAmountError(`${label} must be non-negative.`);
    }
    return tokens * USDCX_MULTIPLIER_BIGINT;
  }

  const raw = typeof tokens === "number" ? String(tokens) : tokens;
  const trimmed = typeof raw === "string" ? raw.trim() : "";

  if (!TOKEN_DECIMAL_PATTERN.test(trimmed)) {
    throw new InvalidAmountError(
      `${label} must be a decimal string or bigint (example: "1.5").`
    );
  }

  const parts = trimmed.split(".");
  const whole = parts[0];
  const fraction = parts[1] ?? "";

  if (fraction.length > USDCX_DECIMALS) {
    throw new InvalidAmountError(
      `${label} supports up to ${USDCX_DECIMALS} decimal places.`
    );
  }

  const paddedFraction = fraction.padEnd(USDCX_DECIMALS, "0");
  return (
    BigInt(whole) * USDCX_MULTIPLIER_BIGINT +
    BigInt(paddedFraction === "" ? "0" : paddedFraction)
  );
}

/**
 * Parse a micro-unit amount into BigInt for deterministic handling.
 */
export function parseMicroAmount(
  amount: MicroAmount,
  label = "Amount",
  allowZero = false
): bigint {
  return parseMicroAmountValue(amount, label, allowZero);
}

/**
 * Assert that `amount` is a positive, integer micro-unit value.
 */
export function assertValidAmount(amount: MicroAmount, label = "Amount"): void {
  parseMicroAmountValue(amount, label, false);
}

/**
 * Assert that `amount` is a non-negative, integer micro-unit value.
 */
export function assertNonNegativeAmount(
  amount: MicroAmount,
  label = "Amount"
): void {
  parseMicroAmountValue(amount, label, true);
}

// ---------------------------------------------------------------------------
// Unit conversion
// ---------------------------------------------------------------------------

/**
 * Convert whole USDCx tokens to micro-units.
 * Use a string input to avoid float precision issues.
 */
export function tokenToMicro(tokens: TokenAmount): bigint {
  return parseTokenAmountValue(tokens, "Token amount");
}

/**
 * Convert micro-units to whole USDCx tokens (string).
 */
export function microToToken(micro: MicroAmount): string {
  const value = parseMicroAmountValue(micro, "Micro amount", true);
  const whole = value / USDCX_MULTIPLIER_BIGINT;
  const fraction = value % USDCX_MULTIPLIER_BIGINT;

  if (fraction === 0n) {
    return whole.toString();
  }

  const fractionText = fraction
    .toString()
    .padStart(USDCX_DECIMALS, "0")
    .replace(/0+$/, "");

  return `${whole.toString()}.${fractionText}`;
}

/**
 * Convert micro-units to a safe JS number.
 */
export function microToNumber(micro: MicroAmount): number {
  const value = parseMicroAmountValue(micro, "Micro amount", true);
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new InvalidAmountError("Micro amount exceeds safe integer range.");
  }
  return Number(value);
}

// ---------------------------------------------------------------------------
// Block comparison
// ---------------------------------------------------------------------------

/** Returns `true` if `targetBlock` is strictly after `currentBlock`. */
export function isBlockInFuture(
  targetBlock: number,
  currentBlock: number
): boolean {
  return targetBlock > currentBlock;
}

// ---------------------------------------------------------------------------
// Clarity value parsing
// ---------------------------------------------------------------------------

/**
 * Recursively unwrap a JS value that may contain nested `{ value: ... }`
 * wrappers produced by `cvToValue`.
 */
function unwrapValue(val: unknown): unknown {
  if (val === null || val === undefined) return val;
  if (
    typeof val === "object" &&
    val !== null &&
    "value" in (val as Record<string, unknown>)
  ) {
    return unwrapValue((val as Record<string, unknown>).value);
  }
  return val;
}

function expectRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object") {
    throw new ParsingError(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function expectField(
  record: Record<string, unknown>,
  field: string,
  label: string
): unknown {
  if (!(field in record)) {
    throw new ParsingError(`${label} is missing field "${field}".`);
  }
  return record[field];
}

function expectUint(value: unknown, label: string): number {
  const unwrapped = unwrapValue(value);

  if (typeof unwrapped === "bigint") {
    if (unwrapped < 0n) {
      throw new ParsingError(`${label} must be non-negative.`);
    }
    if (unwrapped > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new ParsingError(`${label} exceeds safe integer range.`);
    }
    return Number(unwrapped);
  }

  if (typeof unwrapped === "number") {
    if (!Number.isFinite(unwrapped) || !Number.isInteger(unwrapped) || unwrapped < 0) {
      throw new ParsingError(`${label} must be a non-negative integer.`);
    }
    return unwrapped;
  }

  if (typeof unwrapped === "string") {
    if (!MICRO_INT_PATTERN.test(unwrapped)) {
      throw new ParsingError(`${label} must be a numeric string.`);
    }
    const asBig = BigInt(unwrapped);
    if (asBig > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new ParsingError(`${label} exceeds safe integer range.`);
    }
    return Number(asBig);
  }

  throw new ParsingError(`${label} has an unexpected type.`);
}

function expectOptionalPrincipal(
  value: unknown,
  label: string
): string | null {
  const unwrapped = unwrapValue(value);
  if (unwrapped === null || unwrapped === undefined) return null;

  if (typeof unwrapped === "string") {
    if (unwrapped === "") return null;
    if (!validateStacksAddress(unwrapped)) {
      throw new ParsingError(`${label} is not a valid address.`);
    }
    return unwrapped;
  }

  if (typeof unwrapped === "object" && unwrapped !== null) {
    const record = unwrapped as Record<string, unknown>;
    if ("address" in record && typeof record.address === "string") {
      if (!validateStacksAddress(record.address)) {
        throw new ParsingError(`${label} is not a valid address.`);
      }
      return record.address;
    }
  }

  throw new ParsingError(`${label} has an unexpected shape.`);
}

function expectBool(value: unknown, label: string): boolean {
  const unwrapped = unwrapValue(value);
  if (typeof unwrapped === "boolean") return unwrapped;
  throw new ParsingError(`${label} must be boolean.`);
}

/** Safely extract a number from a Clarity value (throws on unexpected shapes). */
export function safeNumber(val: unknown): number {
  return expectUint(val, "Clarity number");
}

/** Safely extract a string from a Clarity value (throws on unexpected shapes). */
export function safeString(val: unknown): string | null {
  const unwrapped = unwrapValue(val);
  if (unwrapped === null || unwrapped === undefined) return null;
  if (typeof unwrapped === "string") return unwrapped || null;
  if (
    typeof unwrapped === "object" &&
    unwrapped !== null &&
    "address" in (unwrapped as Record<string, unknown>)
  ) {
    const address = (unwrapped as Record<string, unknown>).address;
    if (typeof address === "string") return address || null;
  }
  throw new ParsingError("Expected string value.");
}

// ---------------------------------------------------------------------------
// Contract response parsers
// ---------------------------------------------------------------------------

/**
 * Parse the Clarity value returned by `get-vault-state` into a typed
 * {@link VaultState} object.
 */
export function parseVaultState(cv: ClarityValue): VaultState {
  const raw = cvToValue(cv, true);
  if (raw === null || raw === undefined) {
    throw new ParsingError("Vault state is empty.");
  }

  const root = unwrapValue(raw);
  const record = expectRecord(root, "Vault state");

  const rulesValue = expectField(record, "routing-rules", "Vault state");
  const rulesRecord = expectRecord(unwrapValue(rulesValue), "Routing rules");

  return {
    totalBalance: expectUint(
      expectField(record, "total-balance", "Vault state"),
      "total-balance"
    ),
    lockedBalance: expectUint(
      expectField(record, "locked-balance", "Vault state"),
      "locked-balance"
    ),
    unlockedBalance: expectUint(
      expectField(record, "unlocked-balance", "Vault state"),
      "unlocked-balance"
    ),
    lockUntilBlock: expectUint(
      expectField(record, "lock-until-block", "Vault state"),
      "lock-until-block"
    ),
    currentBlock: expectUint(
      expectField(record, "current-block", "Vault state"),
      "current-block"
    ),
    routingRules: {
      lockAmount: expectUint(
        expectField(rulesRecord, "lock-amount", "Routing rules"),
        "lock-amount"
      ),
      lockUntilBlock: expectUint(
        expectField(rulesRecord, "lock-until-block", "Routing rules"),
        "lock-until-block"
      ),
      splitAddress: expectOptionalPrincipal(
        expectField(rulesRecord, "split-address", "Routing rules"),
        "split-address"
      ),
      splitAmount: expectUint(
        expectField(rulesRecord, "split-amount", "Routing rules"),
        "split-amount"
      ),
    },
  };
}

/**
 * Parse the optional tuple returned by `get-routing-rules`.
 * Returns `null` when the user has no rules configured.
 */
export function parseRoutingRules(cv: ClarityValue): RoutingRules | null {
  const raw = cvToValue(cv, true);
  if (raw === null || raw === undefined) return null;

  const root = unwrapValue(raw);
  if (root === null || root === undefined) return null;

  const record = expectRecord(root, "Routing rules");

  return {
    lockAmount: expectUint(
      expectField(record, "lock-amount", "Routing rules"),
      "lock-amount"
    ),
    lockUntilBlock: expectUint(
      expectField(record, "lock-until-block", "Routing rules"),
      "lock-until-block"
    ),
    splitAddress: expectOptionalPrincipal(
      expectField(record, "split-address", "Routing rules"),
      "split-address"
    ),
    splitAmount: expectUint(
      expectField(record, "split-amount", "Routing rules"),
      "split-amount"
    ),
  };
}

/**
 * Parse a Clarity boolean with strict validation.
 */
export function parseBool(cv: ClarityValue, label = "value"): boolean {
  return expectBool(cvToValue(cv), label);
}
