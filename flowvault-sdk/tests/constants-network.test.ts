/**
 * Tests for constants and network helpers
 */
import { describe, it, expect } from "vitest";
import { DEFAULT_CONTRACTS, errorMessageFromCode, USDCX_DECIMALS, USDCX_MULTIPLIER } from "../src/constants";
import { resolveNetwork, getRpcEndpoint } from "../src/network";
import { InvalidConfigurationError } from "../src/errors";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe("constants", () => {
  it("USDCX_DECIMALS should be 6", () => {
    expect(USDCX_DECIMALS).toBe(6);
  });

  it("USDCX_MULTIPLIER should be 1_000_000", () => {
    expect(USDCX_MULTIPLIER).toBe(1_000_000);
  });

  it("DEFAULT_CONTRACTS should have testnet entries", () => {
    expect(DEFAULT_CONTRACTS.testnet.contractAddress).toBe(
      "STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD"
    );
    expect(DEFAULT_CONTRACTS.testnet.contractName).toBe("flowvault");
    expect(DEFAULT_CONTRACTS.testnet.tokenContractName).toBe("usdcx");
  });

  it("errorMessageFromCode should resolve known codes", () => {
    expect(errorMessageFromCode(1001)).toContain("Invalid amount");
    expect(errorMessageFromCode(1003)).toContain("locked");
    expect(errorMessageFromCode(1008)).toContain("lock block");
  });

  it("errorMessageFromCode should return undefined for unknown codes", () => {
    expect(errorMessageFromCode(9999)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Network
// ---------------------------------------------------------------------------

describe("resolveNetwork", () => {
  it('should accept "testnet"', () => {
    expect(resolveNetwork("testnet")).toBe("testnet");
  });

  it('should accept "mainnet"', () => {
    expect(resolveNetwork("mainnet")).toBe("mainnet");
  });

  it("should reject unknown networks", () => {
    expect(() => resolveNetwork("devnet")).toThrow(InvalidConfigurationError);
    expect(() => resolveNetwork("")).toThrow(InvalidConfigurationError);
  });
});

describe("getRpcEndpoint", () => {
  it("should return Hiro testnet URL", () => {
    expect(getRpcEndpoint("testnet")).toBe("https://api.testnet.hiro.so");
  });

  it("should return Hiro mainnet URL", () => {
    expect(getRpcEndpoint("mainnet")).toBe("https://api.hiro.so");
  });
});
