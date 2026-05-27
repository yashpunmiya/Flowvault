"use client";

import { useMemo, useState } from "react";
import { createFlowVaultSdk } from "@/lib/flowvault";
import {
  buildDepositPostConditions,
  createStrategy,
  waitForTransactionSuccess,
} from "@/lib/flowpay-flow";
import {
  buildFlowPaySuccessState,
  validateFlowPayInputs,
  type FlowPayInputs,
  type FlowPaySuccessState,
} from "@/lib/flowpay-strategy";

type DepositStep = "idle" | "strategy" | "confirming" | "deposit";

export function useFlowPay(walletAddress: string | null) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<DepositStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<FlowPaySuccessState | null>(null);

  const sdk = useMemo(
    () => (walletAddress ? createFlowVaultSdk(walletAddress) : null),
    [walletAddress]
  );

  async function deposit(inputs: FlowPayInputs) {
    setError(null);
    setSuccess(null);

    if (!walletAddress || !sdk) {
      setError("Connect wallet before depositing.");
      return;
    }

    const validation = validateFlowPayInputs({
      ...inputs,
      walletAddress,
    });
    if (validation.error) {
      setError(validation.error);
      return;
    }

    setIsSubmitting(true);

    try {
      setStep("strategy");
      const created = await createStrategy({
        sdk,
        walletAddress,
        inputs: {
          ...inputs,
          walletAddress,
        },
      });

      setStep("confirming");
      await waitForTransactionSuccess(created.txId);

      setStep("deposit");
      const depositTransaction = await sdk.deposit(created.strategy.depositMicro, {
        postConditionMode: "deny",
        postConditions: buildDepositPostConditions({
          walletAddress,
          depositMicro: created.strategy.depositMicro,
        }),
      });

      setSuccess(
        buildFlowPaySuccessState({
          savedMicro: created.strategy.savedMicro,
          sentMicro: created.strategy.sentMicro,
          availableMicro: created.strategy.availableMicro,
          lockUntilBlock: created.strategy.lockUntilBlock,
          strategyTxId: created.txId,
          depositTxId: depositTransaction.txId,
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setIsSubmitting(false);
      setStep("idle");
    }
  }

  return {
    isSubmitting,
    step,
    error,
    success,
    deposit,
  };
}
