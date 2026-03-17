/**
 * Integration-style tests for FlowVault class (mocked network)
 *
 * These tests mock `fetchCallReadOnlyFunction`, `makeContractCall`, and
 * `broadcastTransaction` so we can validate the full flow without hitting
 * a real network.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  tupleCV,
  uintCV,
  noneCV,
  someCV,
  principalCV,
  trueCV,
  PostConditionMode,
} from "@stacks/transactions";

// We must mock @stacks/transactions before importing FlowVault
vi.mock("@stacks/transactions", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    fetchCallReadOnlyFunction: vi.fn(),
    makeContractCall: vi.fn(),
    broadcastTransaction: vi.fn(),
    getAddressFromPrivateKey: vi.fn(
      () => "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    ),
  };
});

import {
  fetchCallReadOnlyFunction,
  makeContractCall,
  broadcastTransaction,
} from "@stacks/transactions";
import { FlowVault } from "../src/FlowVault";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_ADDRESS = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";
const SPLIT_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

function makeVault() {
  return new FlowVault({
    network: "testnet",
    contractAddress: "STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD",
    contractName: "flowvault",
    tokenContractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    tokenContractName: "usdcx",
    senderKey:
      "753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601",
  });
}

function mockVaultStateCv() {
  return tupleCV({
    "total-balance": uintCV(5000000),
    "locked-balance": uintCV(1000000),
    "unlocked-balance": uintCV(4000000),
    "lock-until-block": uintCV(200000),
    "current-block": uintCV(190000),
    "routing-rules": tupleCV({
      "lock-amount": uintCV(1000000),
      "lock-until-block": uintCV(200000),
      "split-address": noneCV(),
      "split-amount": uintCV(0),
    }),
  });
}

// ---------------------------------------------------------------------------
// Read-only tests
// ---------------------------------------------------------------------------

describe("FlowVault read-only methods (mocked)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getVaultState should return parsed VaultState", async () => {
    (fetchCallReadOnlyFunction as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockVaultStateCv()
    );

    const vault = makeVault();
    const state = await vault.getVaultState(VALID_ADDRESS);

    expect(state.totalBalance).toBe(5000000);
    expect(state.lockedBalance).toBe(1000000);
    expect(state.unlockedBalance).toBe(4000000);
    expect(state.lockUntilBlock).toBe(200000);
    expect(state.currentBlock).toBe(190000);
    expect(state.routingRules.lockAmount).toBe(1000000);
    expect(fetchCallReadOnlyFunction).toHaveBeenCalledOnce();
  });

  it("getRoutingRules should return null when none set", async () => {
    (fetchCallReadOnlyFunction as ReturnType<typeof vi.fn>).mockResolvedValue(
      noneCV()
    );

    const vault = makeVault();
    const rules = await vault.getRoutingRules(VALID_ADDRESS);
    expect(rules).toBeNull();
  });

  it("hasLockedFunds should return boolean", async () => {
    (fetchCallReadOnlyFunction as ReturnType<typeof vi.fn>).mockResolvedValue(
      trueCV()
    );

    const vault = makeVault();
    const locked = await vault.hasLockedFunds(VALID_ADDRESS);
    expect(locked).toBe(true);
  });

  it("getCurrentBlockHeight should return a number", async () => {
    (fetchCallReadOnlyFunction as ReturnType<typeof vi.fn>).mockResolvedValue(
      uintCV(190042)
    );

    const vault = makeVault();
    const height = await vault.getCurrentBlockHeight(VALID_ADDRESS);
    expect(height).toBe(190042);
  });
});

// ---------------------------------------------------------------------------
// State-changing tests (mocked broadcast)
// ---------------------------------------------------------------------------

describe("FlowVault state-changing methods (mocked)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock: makeContractCall returns a fake transaction object,
    // broadcastTransaction returns a successful result.
    (makeContractCall as ReturnType<typeof vi.fn>).mockResolvedValue({
      /* fake tx */
    });
    (broadcastTransaction as ReturnType<typeof vi.fn>).mockResolvedValue({
      txid: "0xabc123",
    });
    (fetchCallReadOnlyFunction as ReturnType<typeof vi.fn>).mockResolvedValue(
      uintCV(190000)
    );
  });

  it("deposit should broadcast and return txId", async () => {
    const vault = makeVault();
    const result = await vault.deposit(1000000);

    expect(result.status).toBe("success");
    expect(result.txId).toBe("0xabc123");
    expect(makeContractCall).toHaveBeenCalledOnce();
    expect(broadcastTransaction).toHaveBeenCalledOnce();
  });

  it("withdraw should broadcast and return txId", async () => {
    const vault = makeVault();
    const result = await vault.withdraw(500000);

    expect(result.status).toBe("success");
    expect(result.txId).toBe("0xabc123");
  });

  it("setRoutingRules should broadcast with correct args", async () => {
    const vault = makeVault();
    const result = await vault.setRoutingRules({
      lockAmount: 1000000,
      lockUntilBlock: 200000,
      splitAddress: SPLIT_ADDRESS,
      splitAmount: 500000,
    });

    expect(result.status).toBe("success");
    expect(makeContractCall).toHaveBeenCalledOnce();

    // Check function name passed to makeContractCall
    const callArgs = (makeContractCall as ReturnType<typeof vi.fn>).mock
      .calls[0][0];
    expect(callArgs.functionName).toBe("set-routing-rules");
  });

  it("deposit should pass post-conditions when provided", async () => {
    const vault = makeVault();
    const postConditions = [{} as any];

    await vault.deposit(1000000, {
      postConditions,
      postConditionMode: "deny",
    });

    const callArgs = (makeContractCall as ReturnType<typeof vi.fn>).mock
      .calls[0][0];
    expect(callArgs.postConditions).toBe(postConditions);
    expect(callArgs.postConditionMode).toBe(PostConditionMode.Deny);
  });

  it("clearRoutingRules should broadcast", async () => {
    const vault = makeVault();
    const result = await vault.clearRoutingRules();

    expect(result.status).toBe("success");
    const callArgs = (makeContractCall as ReturnType<typeof vi.fn>).mock
      .calls[0][0];
    expect(callArgs.functionName).toBe("clear-routing-rules");
    expect(callArgs.functionArgs).toHaveLength(0);
  });

  it("should handle broadcast error", async () => {
    (broadcastTransaction as ReturnType<typeof vi.fn>).mockResolvedValue({
      error: "ConflictingNonceInMempool",
      reason: "Nonce conflict",
    });

    const vault = makeVault();
    await expect(vault.deposit(1000000)).rejects.toThrow(/Broadcast failed/);
  });
});
