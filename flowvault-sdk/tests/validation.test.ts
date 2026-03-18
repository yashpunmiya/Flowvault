/**
 * Tests for input validation at the FlowVault class level
 */
import { describe, it, expect, vi } from "vitest";

import { FlowVault } from "../src/FlowVault";
import {
  InvalidConfigurationError,
  InvalidAmountError,
  InvalidAddressError,
  InvalidRoutingRuleError,
  NetworkConfigurationError,
} from "../src/errors";

// ---------------------------------------------------------------------------
// Helpers – a valid config to reuse
// ---------------------------------------------------------------------------

function makeConfig(overrides: Record<string, unknown> = {}) {
  return {
    network: "testnet" as const,
    contractAddress: "STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD",
    contractName: "flowvault",
    tokenContractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    tokenContractName: "usdcx",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Constructor validation
// ---------------------------------------------------------------------------

describe("FlowVault constructor", () => {
  it("should create an instance with valid config", () => {
    const vault = new FlowVault(makeConfig());
    expect(vault).toBeInstanceOf(FlowVault);
  });

  it("should throw on missing contractAddress", () => {
    expect(() => new FlowVault(makeConfig({ contractAddress: "" }))).toThrow(
      InvalidConfigurationError
    );
  });

  it("should throw on missing contractName", () => {
    expect(() => new FlowVault(makeConfig({ contractName: "" }))).toThrow(
      InvalidConfigurationError
    );
  });

  it("should throw on missing tokenContractAddress", () => {
    expect(() =>
      new FlowVault(makeConfig({ tokenContractAddress: "" }))
    ).toThrow(InvalidConfigurationError);
  });

  it("should throw on missing tokenContractName", () => {
    expect(() =>
      new FlowVault(makeConfig({ tokenContractName: "" }))
    ).toThrow(InvalidConfigurationError);
  });

  it("should throw on invalid network", () => {
    expect(() =>
      new FlowVault(makeConfig({ network: "devnet" as any }))
    ).toThrow(NetworkConfigurationError);
  });

  it("should throw on invalid contract name", () => {
    expect(() =>
      new FlowVault(makeConfig({ contractName: "invalid name" }))
    ).toThrow(InvalidConfigurationError);
  });

  it("should throw on invalid senderAddress", () => {
    expect(() =>
      new FlowVault(makeConfig({ senderAddress: "bad-address" }))
    ).toThrow(InvalidAddressError);
  });
});

// ---------------------------------------------------------------------------
// Method-level input validation (no network calls needed)
// ---------------------------------------------------------------------------

describe("FlowVault input validation", () => {
  // For state-changing methods we need a senderKey.
  // We use a dummy hex key – validation will fail BEFORE any network call.
  const vault = new FlowVault(
    makeConfig({
      senderKey:
        "753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601",
    })
  );

  // -- deposit --
  it("deposit rejects zero amount", async () => {
    await expect(vault.deposit(0)).rejects.toThrow(InvalidAmountError);
  });

  it("deposit rejects negative amount", async () => {
    await expect(vault.deposit(-100)).rejects.toThrow(InvalidAmountError);
  });

  it("deposit rejects float amount", async () => {
    await expect(vault.deposit(1.5)).rejects.toThrow(InvalidAmountError);
  });

  // -- withdraw --
  it("withdraw rejects zero amount", async () => {
    await expect(vault.withdraw(0)).rejects.toThrow(InvalidAmountError);
  });

  it("withdraw rejects negative amount", async () => {
    await expect(vault.withdraw(-1)).rejects.toThrow(InvalidAmountError);
  });

  // -- setRoutingRules --
  it("setRoutingRules rejects negative lockAmount", async () => {
    await expect(
      vault.setRoutingRules({
        lockAmount: -1,
        lockUntilBlock: 200000,
        splitAddress: null,
        splitAmount: 0,
      })
    ).rejects.toThrow(InvalidAmountError);
  });

  it("setRoutingRules rejects splitAmount > 0 without splitAddress", async () => {
    await expect(
      vault.setRoutingRules({
        lockAmount: 0,
        lockUntilBlock: 0,
        splitAddress: null,
        splitAmount: 500,
      })
    ).rejects.toThrow(InvalidRoutingRuleError);
  });

  it("setRoutingRules rejects invalid splitAddress", async () => {
    await expect(
      vault.setRoutingRules({
        lockAmount: 0,
        lockUntilBlock: 0,
        splitAddress: "not-a-real-address",
        splitAmount: 500,
      })
    ).rejects.toThrow(InvalidAddressError);
  });

  it("setRoutingRules rejects past lockUntilBlock", async () => {
    const spy = vi
      .spyOn(FlowVault.prototype, "getCurrentBlockHeight")
      .mockResolvedValue(200000);

    await expect(
      vault.setRoutingRules({
        lockAmount: 1000,
        lockUntilBlock: 199999,
        splitAddress: null,
        splitAmount: 0,
      })
    ).rejects.toThrow(InvalidRoutingRuleError);

    spy.mockRestore();
  });

  // -- read-only with bad address --
  it("getVaultState rejects invalid address", async () => {
    await expect(vault.getVaultState("bad")).rejects.toThrow(
      InvalidAddressError
    );
  });

  it("getRoutingRules rejects invalid address", async () => {
    await expect(vault.getRoutingRules("bad")).rejects.toThrow(
      InvalidAddressError
    );
  });

  it("hasLockedFunds rejects invalid address", async () => {
    await expect(vault.hasLockedFunds("bad")).rejects.toThrow(
      InvalidAddressError
    );
  });

  it("getCurrentBlockHeight rejects invalid address", async () => {
    await expect(vault.getCurrentBlockHeight("bad")).rejects.toThrow(
      InvalidAddressError
    );
  });

  // -- state-changing without senderKey --
  it("deposit throws when senderKey is missing", async () => {
    const readOnlyVault = new FlowVault(makeConfig());
    await expect(readOnlyVault.deposit(1000)).rejects.toThrow(
      InvalidConfigurationError
    );
  });

  it("withdraw throws when senderKey is missing", async () => {
    const readOnlyVault = new FlowVault(makeConfig());
    await expect(readOnlyVault.withdraw(1000)).rejects.toThrow(
      InvalidConfigurationError
    );
  });

  it("clearRoutingRules throws when senderKey is missing", async () => {
    const readOnlyVault = new FlowVault(makeConfig());
    await expect(readOnlyVault.clearRoutingRules()).rejects.toThrow(
      InvalidConfigurationError
    );
  });

  it("deposit works without senderKey when contractCallExecutor is provided", async () => {
    const walletVault = new FlowVault(
      makeConfig({
        senderAddress: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
        contractCallExecutor: vi.fn().mockResolvedValue({ txid: "0xwallet" }),
      })
    );

    await expect(walletVault.deposit(1000)).resolves.toEqual({
      txId: "0xwallet",
      status: "success",
    });
  });
});
