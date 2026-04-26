import { describe, expect, it } from "vitest";
import {
  applyStrategyTemplate,
  buildStrategyExplanation,
  buildTransactionPreview,
  getExplorerTxUrl,
  isValidStacksAddress,
  parseBlocksInput,
  parseUsdcxInput,
  toFriendlyFlowVaultError,
} from "./playground";

describe("playground strategy templates", () => {
  it("applies Smart Savings template as 80% lock", () => {
    const result = applyStrategyTemplate("smart-savings", 200);
    expect(result.lockAmount).toBe("160.00");
    expect(result.splitAmount).toBe("0.00");
    expect(result.lockBlocks).toBe("144");
  });

  it("applies Auto Split Payments template as 50% split", () => {
    const result = applyStrategyTemplate("auto-split-payments", 120);
    expect(result.lockAmount).toBe("0.00");
    expect(result.splitAmount).toBe("60.00");
  });

  it("falls back to default basis when deposit basis is invalid", () => {
    const result = applyStrategyTemplate("payroll-distribution", 0);
    expect(result.lockAmount).toBe("20.00");
    expect(result.splitAmount).toBe("30.00");
  });
});

describe("playground preview", () => {
  it("calculates preview output correctly", () => {
    const preview = buildTransactionPreview({
      depositMicro: 100_000_000,
      lockMicro: 20_000_000,
      splitMicro: 30_000_000,
      splitAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      lockBlocks: 144,
      currentBlock: 5000,
    });

    expect(preview.availableMicro).toBe(50_000_000);
    expect(preview.lockUntilBlock).toBe(5144);
    expect(preview.isValid).toBe(true);
  });

  it("handles zero values as an edge case", () => {
    const preview = buildTransactionPreview({
      depositMicro: 0,
      lockMicro: 0,
      splitMicro: 0,
      splitAddress: "",
      lockBlocks: 0,
      currentBlock: null,
    });

    expect(preview.errors).toHaveLength(0);
    expect(preview.warnings.length).toBeGreaterThan(0);
    expect(preview.availableMicro).toBe(0);
  });

  it("supports high/max-style values without overflow", () => {
    const preview = buildTransactionPreview({
      depositMicro: 1_000_000_000_000,
      lockMicro: 300_000_000_000,
      splitMicro: 200_000_000_000,
      splitAddress: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
      lockBlocks: 288,
      currentBlock: 100,
    });

    expect(preview.availableMicro).toBe(500_000_000_000);
    expect(preview.isValid).toBe(true);
  });

  it("returns errors for invalid config values", () => {
    const preview = buildTransactionPreview({
      depositMicro: 100_000_000,
      lockMicro: 70_000_000,
      splitMicro: 40_000_000,
      splitAddress: "invalid-address",
      lockBlocks: 0,
      currentBlock: 100,
    });

    expect(preview.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("valid Stacks address"),
        expect.stringContaining("Savings duration"),
        expect.stringContaining("cannot exceed deposit amount"),
      ]),
    );
    expect(preview.isValid).toBe(false);
  });

  it("requires a recipient when split amount is configured", () => {
    const preview = buildTransactionPreview({
      depositMicro: 100_000_000,
      lockMicro: 0,
      splitMicro: 50_000_000,
      splitAddress: "",
      lockBlocks: 0,
      currentBlock: 100,
    });

    expect(preview.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("recipient address")]),
    );
    expect(preview.isValid).toBe(false);
  });

  it("builds human-readable strategy explanation", () => {
    const explanation = buildStrategyExplanation({
      depositMicro: 100_000_000,
      lockMicro: 80_000_000,
      splitMicro: 0,
      availableMicro: 20_000_000,
      lockBlocks: 144,
      lockUntilBlock: 5144,
    });

    expect(explanation.lockPercent).toBe(80);
    expect(explanation.keepPercent).toBe(20);
    expect(explanation.lockUntilBlockText).toBe("block #5144");
  });
});

describe("input validation", () => {
  it("flags negative values", () => {
    expect(parseUsdcxInput("-1").hasError).toBe(true);
    expect(parseBlocksInput("-5").hasError).toBe(true);
  });

  it("accepts valid stacks addresses", () => {
    expect(isValidStacksAddress("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM")).toBe(true);
    expect(isValidStacksAddress("STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD.flowvault")).toBe(true);
  });

  it("rejects invalid stacks addresses", () => {
    expect(isValidStacksAddress("abc123")).toBe(false);
    expect(isValidStacksAddress("ST1BAD")).toBe(false);
  });

  it("creates Hiro explorer transaction links", () => {
    expect(getExplorerTxUrl("abc123")).toBe("https://explorer.hiro.so/txid/0xabc123?chain=testnet");
  });

  it("maps raw contract and wallet errors to user-friendly messages", () => {
    expect(toFriendlyFlowVaultError("Contract failed with u1007")).toContain("recipient");
    expect(toFriendlyFlowVaultError("User rejected request")).toContain("cancelled");
  });
});
