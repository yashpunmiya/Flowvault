/**
 * FlowVault SDK — Utility helpers
 */

import { validateStacksAddress, cvToValue, type ClarityValue } from "@stacks/transactions";
import { InvalidAddressError, InvalidAmountError } from "./errors";
import { USDCX_MULTIPLIER } from "./constants";
import type { RoutingRules, VaultState } from "./types";

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

// ---------------------------------------------------------------------------
// Amount validation
// ---------------------------------------------------------------------------

/**
 * Assert that `amount` is a positive, finite integer.
 * Throws {@link InvalidAmountError} on failure.
 */
export function assertValidAmount(amount: number, label = "Amount"): void {
  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount <= 0) {
    throw new InvalidAmountError(
      `${label} must be a positive integer, received: ${amount}`
    );
  }
}

/**
 * Assert that `amount` is a non-negative, finite integer (zero allowed).
 */
export function assertNonNegativeAmount(amount: number, label = "Amount"): void {
  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < 0) {
    throw new InvalidAmountError(
      `${label} must be a non-negative integer, received: ${amount}`
    );
  }
}

// ---------------------------------------------------------------------------
// Unit conversion
// ---------------------------------------------------------------------------

/**
 * Convert whole USDCx tokens to micro-units.
 *
 * Example: `tokenToMicro(1.5)` → `1500000`
 */
export function tokenToMicro(tokens: number): number {
  return Math.round(tokens * USDCX_MULTIPLIER);
}

/**
 * Convert micro-units to whole USDCx tokens.
 *
 * Example: `microToToken(1500000)` → `1.5`
 */
export function microToToken(micro: number): number {
  return micro / USDCX_MULTIPLIER;
}

// ---------------------------------------------------------------------------
// Block comparison
// ---------------------------------------------------------------------------

/** Returns `true` if `targetBlock` is strictly after `currentBlock`. */
export function isBlockInFuture(targetBlock: number, currentBlock: number): boolean {
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
  if (typeof val === "object" && val !== null && "value" in (val as Record<string, unknown>)) {
    return unwrapValue((val as Record<string, unknown>).value);
  }
  return val;
}

/** Safely extract a number from a potentially wrapped Clarity value. */
export function safeNumber(val: unknown): number {
  const v = unwrapValue(val);
  if (v === null || v === undefined) return 0;
  if (typeof v === "bigint" || typeof v === "number" || typeof v === "string") {
    return Number(v);
  }
  return 0;
}

/** Safely extract a string from a potentially wrapped Clarity value. */
export function safeString(val: unknown): string | null {
  const v = unwrapValue(val);
  if (v === null || v === undefined) return null;
  if (typeof v === "string") return v || null;
  if (typeof v === "object" && v !== null && "address" in (v as Record<string, unknown>)) {
    return safeString((v as Record<string, unknown>).address);
  }
  return String(v);
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
  // The outer tuple may itself be wrapped
  const root =
    raw && typeof raw === "object" && "value" in (raw as Record<string, unknown>)
      ? (raw as Record<string, unknown>).value
      : raw;

  const r = root as Record<string, unknown>;

  const rulesRaw = r["routing-rules"];
  const rules =
    rulesRaw && typeof rulesRaw === "object" && "value" in (rulesRaw as Record<string, unknown>)
      ? (rulesRaw as Record<string, unknown>).value
      : rulesRaw;
  const ru = (rules ?? {}) as Record<string, unknown>;

  let splitAddr = safeString(ru["split-address"]);
  if (splitAddr === "null" || splitAddr === "undefined" || splitAddr === "") {
    splitAddr = null;
  }

  return {
    totalBalance: safeNumber(r["total-balance"]),
    lockedBalance: safeNumber(r["locked-balance"]),
    unlockedBalance: safeNumber(r["unlocked-balance"]),
    lockUntilBlock: safeNumber(r["lock-until-block"]),
    currentBlock: safeNumber(r["current-block"]),
    routingRules: {
      lockAmount: safeNumber(ru["lock-amount"]),
      lockUntilBlock: safeNumber(ru["lock-until-block"]),
      splitAddress: splitAddr,
      splitAmount: safeNumber(ru["split-amount"]),
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

  const root =
    raw && typeof raw === "object" && "value" in (raw as Record<string, unknown>)
      ? (raw as Record<string, unknown>).value
      : raw;

  if (root === null || root === undefined) return null;

  const r = root as Record<string, unknown>;

  let splitAddr = safeString(r["split-address"]);
  if (splitAddr === "null" || splitAddr === "undefined" || splitAddr === "") {
    splitAddr = null;
  }

  return {
    lockAmount: safeNumber(r["lock-amount"]),
    lockUntilBlock: safeNumber(r["lock-until-block"]),
    splitAddress: splitAddr,
    splitAmount: safeNumber(r["split-amount"]),
  };
}
