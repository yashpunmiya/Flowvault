import { describe, expect, it, vi } from "vitest";
import { buildDepositPostConditions, runFlowPayDeposit } from "@/lib/flowpay-flow";

const WALLET_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const RECIPIENT_ADDRESS = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";

describe("FlowPay deposit flow", () => {
  it("creates strategy first, then deposits the full amount", async () => {
    const sdk = {
      getCurrentBlockHeight: vi.fn().mockResolvedValue(10_000),
      createStrategy: vi.fn().mockResolvedValue({ txId: "0xstrategy", status: "success" }),
      deposit: vi.fn().mockResolvedValue({ txId: "0xdeposit", status: "success" }),
    };

    const result = await runFlowPayDeposit({
      sdk,
      walletAddress: WALLET_ADDRESS,
      inputs: {
        depositAmount: "100",
        savingsPercent: "30",
        splitPercent: "20",
        recipientAddress: RECIPIENT_ADDRESS,
      },
    });

    expect(sdk.getCurrentBlockHeight).toHaveBeenCalledWith(WALLET_ADDRESS);
    expect(sdk.createStrategy).toHaveBeenCalledWith(
      {
        lockAmount: 30_000_000n,
        lockUntilBlock: 10_144,
        splitAddress: RECIPIENT_ADDRESS,
        splitAmount: 20_000_000n,
      },
      {
        postConditionMode: "deny",
        postConditions: [],
      }
    );
    expect(sdk.deposit).toHaveBeenCalledWith(100_000_000n, {
      postConditionMode: "deny",
      postConditions: expect.any(Array),
    });
    expect(sdk.createStrategy.mock.invocationCallOrder[0]).toBeLessThan(
      sdk.deposit.mock.invocationCallOrder[0]
    );
    expect(result.success.savedMicro).toBe(30_000_000n);
    expect(result.success.sentMicro).toBe(20_000_000n);
    expect(result.success.availableMicro).toBe(50_000_000n);
  });

  it("builds post-conditions for sender deposit and contract split", () => {
    const postConditions = buildDepositPostConditions({
      walletAddress: WALLET_ADDRESS,
      depositMicro: 100_000_000n,
      sentMicro: 20_000_000n,
    });

    expect(postConditions).toHaveLength(2);
    expect(postConditions[0]).toMatchObject({
      type: "ft-postcondition",
      address: WALLET_ADDRESS,
      condition: "eq",
      amount: "100000000",
    });
    expect(postConditions[1]).toMatchObject({
      type: "ft-postcondition",
      condition: "eq",
      amount: "20000000",
    });
  });

  it("rejects wallet-not-connected before SDK calls", async () => {
    const sdk = {
      getCurrentBlockHeight: vi.fn(),
      createStrategy: vi.fn(),
      deposit: vi.fn(),
    };

    await expect(
      runFlowPayDeposit({
        sdk,
        walletAddress: null,
        inputs: {
          depositAmount: "100",
          savingsPercent: "30",
          splitPercent: "20",
          recipientAddress: RECIPIENT_ADDRESS,
        },
      })
    ).rejects.toThrow("Connect wallet before depositing.");

    expect(sdk.getCurrentBlockHeight).not.toHaveBeenCalled();
    expect(sdk.createStrategy).not.toHaveBeenCalled();
    expect(sdk.deposit).not.toHaveBeenCalled();
  });

  it("does not call the SDK for invalid routes", async () => {
    const sdk = {
      getCurrentBlockHeight: vi.fn().mockResolvedValue(10_000),
      createStrategy: vi.fn(),
      deposit: vi.fn(),
    };

    await expect(
      runFlowPayDeposit({
        sdk,
        walletAddress: WALLET_ADDRESS,
        inputs: {
          depositAmount: "100",
          savingsPercent: "80",
          splitPercent: "30",
          recipientAddress: RECIPIENT_ADDRESS,
        },
      })
    ).rejects.toThrow("Savings plus recipient split cannot exceed 100%.");

    expect(sdk.createStrategy).not.toHaveBeenCalled();
    expect(sdk.deposit).not.toHaveBeenCalled();
  });
});
