import type { RoutingRules, TransactionOptions, TransactionResult } from "flowvault-sdk";
import {
  buildSavingsStrategy,
  buildSavingsSuccessState,
  parseDepositAmount,
  type SavingsStrategy,
  type SavingsSuccessState,
} from "@/lib/strategy";

export interface SavingsVaultSdk {
  getCurrentBlockHeight(senderAddress: string): Promise<number>;
  setRoutingRules(rules: RoutingRules, options?: TransactionOptions): Promise<TransactionResult>;
  deposit(amount: bigint, options?: TransactionOptions): Promise<TransactionResult>;
}

export interface SavingsDepositResult {
  strategy: SavingsStrategy;
  success: SavingsSuccessState;
}

export async function createStrategy(params: {
  sdk: SavingsVaultSdk;
  walletAddress: string;
  depositMicro: bigint;
}): Promise<{ strategy: SavingsStrategy; txId: string }> {
  const currentBlock = await params.sdk.getCurrentBlockHeight(params.walletAddress);
  const strategy = buildSavingsStrategy(params.depositMicro, currentBlock);

  const transaction = await params.sdk.setRoutingRules(
    {
      lockAmount: strategy.lockMicro,
      lockUntilBlock: strategy.lockUntilBlock,
      splitAddress: strategy.splitAddress,
      splitAmount: strategy.splitAmount,
    },
    { postConditionMode: "allow" }
  );

  return {
    strategy,
    txId: transaction.txId,
  };
}

export async function runSavingsDeposit(params: {
  sdk: SavingsVaultSdk;
  walletAddress: string | null;
  depositAmount: string;
}): Promise<SavingsDepositResult> {
  if (!params.walletAddress) {
    throw new Error("Connect wallet before depositing.");
  }

  const parsed = parseDepositAmount(params.depositAmount);
  if (parsed.error) {
    throw new Error(parsed.error);
  }

  const created = await createStrategy({
    sdk: params.sdk,
    walletAddress: params.walletAddress,
    depositMicro: parsed.microAmount,
  });

  const depositTransaction = await params.sdk.deposit(parsed.microAmount, {
    postConditionMode: "allow",
  });

  return {
    strategy: created.strategy,
    success: buildSavingsSuccessState({
      lockedMicro: created.strategy.lockMicro,
      liquidMicro: created.strategy.liquidMicro,
      strategyTxId: created.txId,
      depositTxId: depositTransaction.txId,
    }),
  };
}
