import { describe, expect, it } from "vitest";
import {
  LOCK_DURATION_BLOCKS,
  buildSavingsStrategy,
  buildSavingsSuccessState,
  calculateSavingsBreakdown,
  parseDepositAmount,
} from "@/lib/strategy";

describe("savings strategy", () => {
  it("locks 80% and keeps 20% liquid", () => {
    const result = calculateSavingsBreakdown(100_000_000n);

    expect(result.lockMicro).toBe(80_000_000n);
    expect(result.liquidMicro).toBe(20_000_000n);
  });

  it("builds a 144 block lock strategy with no split", () => {
    const strategy = buildSavingsStrategy(10_000_000n, 5000);

    expect(strategy.lockMicro).toBe(8_000_000n);
    expect(strategy.liquidMicro).toBe(2_000_000n);
    expect(strategy.lockUntilBlock).toBe(5000 + LOCK_DURATION_BLOCKS);
    expect(strategy.splitAmount).toBe(0n);
    expect(strategy.splitAddress).toBeNull();
  });

  it("rejects invalid deposit input without crashing", () => {
    expect(parseDepositAmount("").error).toBe("Enter a deposit amount.");
    expect(parseDepositAmount("-1").error).toContain("greater than 0");
    expect(parseDepositAmount("1.1234567").error).toContain("up to 6 decimal places");
  });

  it("creates the success state shown by the UI after transaction submission", () => {
    const success = buildSavingsSuccessState({
      lockedMicro: 80_000_000n,
      liquidMicro: 20_000_000n,
      strategyTxId: "0xstrategy",
      depositTxId: "0xdeposit",
    });

    expect(success.message).toBe("Deposit successful");
    expect(success.lockedMicro).toBe(80_000_000n);
    expect(success.liquidMicro).toBe(20_000_000n);
  });
});
