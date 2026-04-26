"use client";

import { useMemo, useState } from "react";
import { createFlowVaultSdk } from "@/lib/flowvault";
import { createStrategy } from "@/lib/savings-flow";
import {
  buildSavingsSuccessState,
  parseDepositAmount,
  type SavingsSuccessState,
} from "@/lib/strategy";

type DepositStep = "idle" | "strategy" | "deposit";

export function useSavingsVault(walletAddress: string | null) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<DepositStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SavingsSuccessState | null>(null);

  const sdk = useMemo(
    () => (walletAddress ? createFlowVaultSdk(walletAddress) : null),
    [walletAddress]
  );

  async function deposit(depositAmount: string) {
    setError(null);
    setSuccess(null);

    const parsed = parseDepositAmount(depositAmount);
    if (parsed.error) {
      setError(parsed.error);
      return;
    }

    if (!walletAddress || !sdk) {
      setError("Connect wallet before depositing.");
      return;
    }

    setIsSubmitting(true);

    try {
      setStep("strategy");
      const created = await createStrategy({
        sdk,
        walletAddress,
        depositMicro: parsed.microAmount,
      });

      setStep("deposit");
      const depositTransaction = await sdk.deposit(parsed.microAmount, {
        postConditionMode: "allow",
      });

      setSuccess(
        buildSavingsSuccessState({
          lockedMicro: created.strategy.lockMicro,
          liquidMicro: created.strategy.liquidMicro,
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
