/**
 * Tests for utility functions — validation, conversion, block comparison
 */
import { describe, it, expect } from "vitest";
import {
  assertValidAddress,
  isValidAddress,
  assertValidAmount,
  assertNonNegativeAmount,
  tokenToMicro,
  microToToken,
  microToNumber,
  isBlockInFuture,
  safeNumber,
  safeString,
} from "../src/utils";
import { InvalidAmountError, InvalidAddressError } from "../src/errors";

// ---------------------------------------------------------------------------
// Address validation
// ---------------------------------------------------------------------------

describe("isValidAddress", () => {
  it("should accept valid testnet standard addresses", () => {
    // ST prefix = testnet standard
    expect(isValidAddress("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM")).toBe(true);
    expect(isValidAddress("STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD")).toBe(true);
  });

  it("should reject empty and garbage strings", () => {
    expect(isValidAddress("")).toBe(false);
    expect(isValidAddress("not-an-address")).toBe(false);
    expect(isValidAddress("12345")).toBe(false);
  });
});

describe("assertValidAddress", () => {
  it("should not throw for a valid address", () => {
    expect(() =>
      assertValidAddress("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM")
    ).not.toThrow();
  });

  it("should throw InvalidAddressError for an invalid address", () => {
    expect(() => assertValidAddress("bad")).toThrow(InvalidAddressError);
  });

  it("should throw for empty string", () => {
    expect(() => assertValidAddress("")).toThrow(InvalidAddressError);
  });
});

// ---------------------------------------------------------------------------
// Amount validation
// ---------------------------------------------------------------------------

describe("assertValidAmount", () => {
  it("should pass for positive integers", () => {
    expect(() => assertValidAmount(1)).not.toThrow();
    expect(() => assertValidAmount(1000000)).not.toThrow();
  });

  it("should reject zero", () => {
    expect(() => assertValidAmount(0)).toThrow(InvalidAmountError);
  });

  it("should reject negatives", () => {
    expect(() => assertValidAmount(-5)).toThrow(InvalidAmountError);
  });

  it("should reject NaN / Infinity", () => {
    expect(() => assertValidAmount(NaN)).toThrow(InvalidAmountError);
    expect(() => assertValidAmount(Infinity)).toThrow(InvalidAmountError);
    expect(() => assertValidAmount(-Infinity)).toThrow(InvalidAmountError);
  });

  it("should reject floating-point values", () => {
    expect(() => assertValidAmount(1.5)).toThrow(InvalidAmountError);
  });

  it("should include a custom label in the error message", () => {
    expect(() => assertValidAmount(-1, "Deposit")).toThrow(/Deposit/);
  });
});

describe("assertNonNegativeAmount", () => {
  it("should pass for zero", () => {
    expect(() => assertNonNegativeAmount(0)).not.toThrow();
  });

  it("should pass for positive integers", () => {
    expect(() => assertNonNegativeAmount(42)).not.toThrow();
  });

  it("should reject negatives", () => {
    expect(() => assertNonNegativeAmount(-1)).toThrow(InvalidAmountError);
  });

  it("should reject non-integers", () => {
    expect(() => assertNonNegativeAmount(0.5)).toThrow(InvalidAmountError);
  });
});

// ---------------------------------------------------------------------------
// Unit conversion
// ---------------------------------------------------------------------------

describe("tokenToMicro / microToToken", () => {
  it("should convert 1 token to 1_000_000 micro", () => {
    expect(tokenToMicro("1")).toBe(1_000_000n);
  });

  it("should convert 1.5 tokens", () => {
    expect(tokenToMicro("1.5")).toBe(1_500_000n);
  });

  it("should convert 0 tokens", () => {
    expect(tokenToMicro("0")).toBe(0n);
  });

  it("should round-trip", () => {
    const micro = tokenToMicro("3.14159");
    expect(microToToken(micro)).toBe("3.14159");
  });

  it("should convert micro back to tokens", () => {
    expect(microToToken(2_500_000)).toBe("2.5");
  });

  it("microToNumber should return a safe number", () => {
    expect(microToNumber(2_500_000)).toBe(2_500_000);
  });
});

// ---------------------------------------------------------------------------
// Block comparison
// ---------------------------------------------------------------------------

describe("isBlockInFuture", () => {
  it("should return true when target > current", () => {
    expect(isBlockInFuture(200000, 190000)).toBe(true);
  });

  it("should return false when target == current", () => {
    expect(isBlockInFuture(190000, 190000)).toBe(false);
  });

  it("should return false when target < current", () => {
    expect(isBlockInFuture(180000, 190000)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Safe value extractors
// ---------------------------------------------------------------------------

describe("safeNumber", () => {
  it("should extract plain numbers", () => {
    expect(safeNumber(42)).toBe(42);
  });

  it("should extract bigint", () => {
    expect(safeNumber(BigInt(999))).toBe(999);
  });

  it("should extract numeric strings", () => {
    expect(safeNumber("100")).toBe(100);
  });

  it("should unwrap nested { value } objects", () => {
    expect(safeNumber({ value: { value: 50 } })).toBe(50);
  });

  it("should throw for null / undefined", () => {
    expect(() => safeNumber(null)).toThrow();
    expect(() => safeNumber(undefined)).toThrow();
  });
});

describe("safeString", () => {
  it("should extract plain strings", () => {
    expect(safeString("hello")).toBe("hello");
  });

  it("should unwrap nested { value } objects", () => {
    expect(safeString({ value: "ST123" })).toBe("ST123");
  });

  it("should return null for null / undefined", () => {
    expect(safeString(null)).toBeNull();
    expect(safeString(undefined)).toBeNull();
  });

  it("should return null for empty string", () => {
    expect(safeString("")).toBeNull();
  });

  it("should throw on unexpected types", () => {
    expect(() => safeString(123 as unknown as string)).toThrow();
  });
});
