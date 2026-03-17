/**
 * Tests for error classes
 */
import { describe, it, expect } from "vitest";
import {
  FlowVaultError,
  InvalidAmountError,
  InvalidAddressError,
  InvalidConfigurationError,
  InvalidRoutingRuleError,
  NetworkConfigurationError,
  ContractCallError,
  NetworkError,
  ParsingError,
} from "../src/errors";

describe("FlowVaultError (base)", () => {
  it("should set name and message", () => {
    const err = new FlowVaultError("something broke");
    expect(err.name).toBe("FlowVaultError");
    expect(err.message).toBe("something broke");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(FlowVaultError);
  });
});

describe("InvalidAmountError", () => {
  it("should have a default message", () => {
    const err = new InvalidAmountError();
    expect(err.name).toBe("InvalidAmountError");
    expect(err.message).toBe("Amount must be a positive integer.");
    expect(err).toBeInstanceOf(FlowVaultError);
  });

  it("should accept a custom message", () => {
    const err = new InvalidAmountError("Deposit too small");
    expect(err.message).toBe("Deposit too small");
  });
});

describe("InvalidAddressError", () => {
  it("should include the address in the message", () => {
    const err = new InvalidAddressError("NOTREAL");
    expect(err.name).toBe("InvalidAddressError");
    expect(err.address).toBe("NOTREAL");
    expect(err.message).toContain("NOTREAL");
    expect(err).toBeInstanceOf(FlowVaultError);
  });

  it("should accept a custom message", () => {
    const err = new InvalidAddressError("NOTREAL", "split address bad");
    expect(err.message).toBe("split address bad");
    expect(err.address).toBe("NOTREAL");
  });
});

describe("InvalidConfigurationError", () => {
  it("should carry the message", () => {
    const err = new InvalidConfigurationError("missing key");
    expect(err.name).toBe("InvalidConfigurationError");
    expect(err.message).toBe("missing key");
    expect(err).toBeInstanceOf(FlowVaultError);
  });
});

describe("InvalidRoutingRuleError", () => {
  it("should carry the message", () => {
    const err = new InvalidRoutingRuleError("bad routing rule");
    expect(err.name).toBe("InvalidRoutingRuleError");
    expect(err.message).toBe("bad routing rule");
    expect(err).toBeInstanceOf(FlowVaultError);
  });
});

describe("NetworkConfigurationError", () => {
  it("should carry the message", () => {
    const err = new NetworkConfigurationError("bad network");
    expect(err.name).toBe("NetworkConfigurationError");
    expect(err.message).toBe("bad network");
    expect(err).toBeInstanceOf(FlowVaultError);
  });
});

describe("ContractCallError", () => {
  it("should carry message and optional code", () => {
    const err = new ContractCallError("funds locked", 1003);
    expect(err.name).toBe("ContractCallError");
    expect(err.message).toBe("funds locked");
    expect(err.code).toBe(1003);
    expect(err).toBeInstanceOf(FlowVaultError);
  });

  it("should work without a code", () => {
    const err = new ContractCallError("unknown");
    expect(err.code).toBeUndefined();
  });
});

describe("NetworkError", () => {
  it("should carry message and cause", () => {
    const inner = new Error("timeout");
    const err = new NetworkError("RPC down", inner);
    expect(err.name).toBe("NetworkError");
    expect(err.message).toBe("RPC down");
    expect(err.cause).toBe(inner);
    expect(err).toBeInstanceOf(FlowVaultError);
  });
});

describe("ParsingError", () => {
  it("should carry message and cause", () => {
    const inner = new Error("bad tuple");
    const err = new ParsingError("Parse failed", inner);
    expect(err.name).toBe("ParsingError");
    expect(err.message).toBe("Parse failed");
    expect(err.cause).toBe(inner);
    expect(err).toBeInstanceOf(FlowVaultError);
  });
});
