import { describe, expect, it, vi } from "vitest";
import { runSavingsDeposit } from "@/lib/savings-flow";

describe("savings deposit flow", () => {
  it("creates strategy first, then deposits the full amount", async () => {
    const sdk = {
      getCurrentBlockHeight: vi.fn().mockResolvedValue(10_000),
      setRoutingRules: vi.fn().mockResolvedValue({ txId: "0xstrategy", status: "success" }),
      deposit: vi.fn().mockResolvedValue({ txId: "0xdeposit", status: "success" }),
    };

    const result = await runSavingsDeposit({
      sdk,
      walletAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      depositAmount: "100",
    });

    expect(sdk.getCurrentBlockHeight).toHaveBeenCalledWith(
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    );
    expect(sdk.setRoutingRules).toHaveBeenCalledWith(
      {
        lockAmount: 80_000_000n,
        lockUntilBlock: 10_144,
        splitAddress: null,
        splitAmount: 0n,
      },
      { postConditionMode: "allow" }
    );
    expect(sdk.deposit).toHaveBeenCalledWith(100_000_000n, {
      postConditionMode: "allow",
    });
    expect(sdk.setRoutingRules.mock.invocationCallOrder[0]).toBeLessThan(
      sdk.deposit.mock.invocationCallOrder[0]
    );
    expect(result.success.message).toBe("Deposit successful");
    expect(result.success.lockedMicro).toBe(80_000_000n);
    expect(result.success.liquidMicro).toBe(20_000_000n);
  });

  it("rejects wallet-not-connected before SDK calls", async () => {
    const sdk = {
      getCurrentBlockHeight: vi.fn(),
      setRoutingRules: vi.fn(),
      deposit: vi.fn(),
    };

    await expect(
      runSavingsDeposit({ sdk, walletAddress: null, depositAmount: "100" })
    ).rejects.toThrow("Connect wallet before depositing.");

    expect(sdk.getCurrentBlockHeight).not.toHaveBeenCalled();
    expect(sdk.setRoutingRules).not.toHaveBeenCalled();
    expect(sdk.deposit).not.toHaveBeenCalled();
  });

  it("does not call the SDK for invalid amounts", async () => {
    const sdk = {
      getCurrentBlockHeight: vi.fn(),
      setRoutingRules: vi.fn(),
      deposit: vi.fn(),
    };

    await expect(
      runSavingsDeposit({
        sdk,
        walletAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        depositAmount: "0",
      })
    ).rejects.toThrow("Deposit amount must be greater than 0.");

    expect(sdk.setRoutingRules).not.toHaveBeenCalled();
    expect(sdk.deposit).not.toHaveBeenCalled();
  });
});
