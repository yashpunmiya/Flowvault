import { describe, expect, it } from "vitest";
import {
  LOCK_DURATION_BLOCKS,
  buildFlowPayStrategy,
  buildFlowPaySuccessState,
  calculateFlowPayBreakdown,
  parseDepositAmount,
  parsePercent,
  validateFlowPayInputs,
} from "@/lib/flowpay-strategy";

const WALLET_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const RECIPIENT_ADDRESS = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";

describe("FlowPay strategy", () => {
  it("splits a deposit into saved, sent, and available amounts", () => {
    const result = calculateFlowPayBreakdown({
      depositMicro: 100_000_000n,
      savingsPercent: 30,
      splitPercent: 20,
    });

    expect(result.savedMicro).toBe(30_000_000n);
    expect(result.sentMicro).toBe(20_000_000n);
    expect(result.availableMicro).toBe(50_000_000n);
  });

  it("builds a real FlowVault strategy with lock and split fields", () => {
    const strategy = buildFlowPayStrategy(
      {
        depositAmount: "100",
        savingsPercent: "30",
        splitPercent: "20",
        recipientAddress: RECIPIENT_ADDRESS,
        walletAddress: WALLET_ADDRESS,
      },
      5000
    );

    expect(strategy.savedMicro).toBe(30_000_000n);
    expect(strategy.sentMicro).toBe(20_000_000n);
    expect(strategy.availableMicro).toBe(50_000_000n);
    expect(strategy.lockUntilBlock).toBe(5000 + LOCK_DURATION_BLOCKS);
    expect(strategy.splitAddress).toBe(RECIPIENT_ADDRESS);
  });

  it("rejects invalid deposit and percent inputs", () => {
    expect(parseDepositAmount("").error).toBe("Enter a deposit amount.");
    expect(parseDepositAmount("-1").error).toContain("greater than 0");
    expect(parseDepositAmount("1.1234567").error).toContain("up to 6 decimal places");
    expect(parsePercent("101", "savings percentage").error).toContain("between 0 and 100");
  });

  it("rejects routes that cannot execute on-chain", () => {
    const tooLarge = validateFlowPayInputs({
      depositAmount: "100",
      savingsPercent: "70",
      splitPercent: "40",
      recipientAddress: RECIPIENT_ADDRESS,
      walletAddress: WALLET_ADDRESS,
    });

    const splitToSelf = validateFlowPayInputs({
      depositAmount: "100",
      savingsPercent: "30",
      splitPercent: "20",
      recipientAddress: WALLET_ADDRESS,
      walletAddress: WALLET_ADDRESS,
    });

    expect(tooLarge.error).toBe("Savings plus recipient split cannot exceed 100%.");
    expect(splitToSelf.error).toBe("Recipient cannot be the connected wallet.");
  });

  it("creates the success state shown by the output screen", () => {
    const success = buildFlowPaySuccessState({
      savedMicro: 30_000_000n,
      sentMicro: 20_000_000n,
      availableMicro: 50_000_000n,
      lockUntilBlock: 5144,
      strategyTxId: "0xstrategy",
      depositTxId: "0xdeposit",
    });

    expect(success.message).toBe("FlowPay deposit complete");
    expect(success.savedMicro).toBe(30_000_000n);
    expect(success.sentMicro).toBe(20_000_000n);
    expect(success.availableMicro).toBe(50_000_000n);
  });
});
