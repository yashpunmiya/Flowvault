import { describe, expect, it, vi } from "vitest";
import {
  buildDepositPostConditions,
  runFlowPayDeposit,
  waitForTransactionSuccess,
} from "@/lib/flowpay-flow";

const WALLET_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const RECIPIENT_ADDRESS = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";

describe("FlowPay deposit flow", () => {
  it("creates strategy first, then deposits the full amount", async () => {
    const sdk = {
      getCurrentBlockHeight: vi.fn().mockResolvedValue(10_000),
      createStrategy: vi.fn().mockResolvedValue({ txId: "0xstrategy", status: "success" }),
      deposit: vi.fn().mockResolvedValue({ txId: "0xdeposit", status: "success" }),
    };
    const waitForStrategyConfirmation = vi.fn().mockResolvedValue(undefined);

    const result = await runFlowPayDeposit({
      sdk,
      walletAddress: WALLET_ADDRESS,
      waitForStrategyConfirmation,
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
    expect(waitForStrategyConfirmation).toHaveBeenCalledWith("0xstrategy");
    expect(sdk.createStrategy.mock.invocationCallOrder[0]).toBeLessThan(
      waitForStrategyConfirmation.mock.invocationCallOrder[0]
    );
    expect(waitForStrategyConfirmation.mock.invocationCallOrder[0]).toBeLessThan(
      sdk.deposit.mock.invocationCallOrder[0]
    );
    expect(result.success.savedMicro).toBe(30_000_000n);
    expect(result.success.sentMicro).toBe(20_000_000n);
    expect(result.success.availableMicro).toBe(50_000_000n);
  });

  it("builds deny-mode upper-bound post-conditions for v2 routing", () => {
    const postConditions = buildDepositPostConditions({
      walletAddress: WALLET_ADDRESS,
      depositMicro: 100_000_000n,
    });

    expect(postConditions).toHaveLength(2);
    expect(postConditions[0]).toMatchObject({
      type: "ft-postcondition",
      address: WALLET_ADDRESS,
      condition: "lte",
      amount: "100000000",
      asset: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx::usdcx-token",
    });
    expect(postConditions[1]).toMatchObject({
      type: "ft-postcondition",
      condition: "lte",
      amount: "100000000",
      asset: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx::usdcx-token",
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

  it("does not deposit when strategy confirmation fails", async () => {
    const sdk = {
      getCurrentBlockHeight: vi.fn().mockResolvedValue(10_000),
      createStrategy: vi.fn().mockResolvedValue({ txId: "0xstrategy", status: "success" }),
      deposit: vi.fn(),
    };

    await expect(
      runFlowPayDeposit({
        sdk,
        walletAddress: WALLET_ADDRESS,
        waitForStrategyConfirmation: vi
          .fn()
          .mockRejectedValue(new Error("Strategy transaction failed.")),
        inputs: {
          depositAmount: "100",
          savingsPercent: "30",
          splitPercent: "20",
          recipientAddress: RECIPIENT_ADDRESS,
        },
      })
    ).rejects.toThrow("Strategy transaction failed.");

    expect(sdk.deposit).not.toHaveBeenCalled();
  });

  it("waits until a transaction reaches success", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ tx_status: "pending" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ tx_status: "success" }),
      });

    await expect(
      waitForTransactionSuccess("abc123", {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        pollIntervalMs: 0,
        timeoutMs: 1_000,
      })
    ).resolves.toBeUndefined();

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls[0][0]).toContain("/extended/v1/tx/0xabc123");
  });

  it("rejects when a transaction confirms with a failure status", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        tx_status: "abort_by_response",
        tx_result: { repr: "(err u1004)" },
      }),
    });

    await expect(
      waitForTransactionSuccess("0xabc123", {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        pollIntervalMs: 0,
        timeoutMs: 1_000,
      })
    ).rejects.toThrow("abort_by_response");
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
