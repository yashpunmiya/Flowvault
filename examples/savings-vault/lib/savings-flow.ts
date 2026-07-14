import type { RoutingRules, TransactionOptions, TransactionResult } from "flowvault-sdk";
import { FLOWVAULT_API_BASE } from "@/lib/config";
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

type FetchLike = typeof fetch;

export interface TransactionWaitOptions {
  fetchImpl?: FetchLike;
  pollIntervalMs?: number;
  timeoutMs?: number;
}

export type TransactionWaiter = (txId: string) => Promise<void>;

function normalizeTxId(txId: string): string {
  return txId.startsWith("0x") ? txId : `0x${txId}`;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function transactionFailureMessage(txId: string, status: string, payload: unknown): string {
  if (payload && typeof payload === "object" && "tx_result" in payload) {
    const txResult = (payload as { tx_result?: { repr?: unknown } }).tx_result;
    if (typeof txResult?.repr === "string") {
      return `Strategy transaction ${normalizeTxId(txId)} failed with ${status}: ${txResult.repr}`;
    }
  }

  return `Strategy transaction ${normalizeTxId(txId)} failed with status ${status}.`;
}

export async function waitForTransactionSuccess(
  txId: string,
  options: TransactionWaitOptions = {}
): Promise<void> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const pollIntervalMs = options.pollIntervalMs ?? 10_000;
  const timeoutMs = options.timeoutMs ?? 20 * 60_000;
  const deadline = Date.now() + timeoutMs;
  const normalizedTxId = normalizeTxId(txId);

  while (Date.now() < deadline) {
    const response = await fetchImpl(`${FLOWVAULT_API_BASE}/extended/v1/tx/${normalizedTxId}`);

    if (response.status === 404) {
      await wait(pollIntervalMs);
      continue;
    }

    if (!response.ok) {
      throw new Error(`Could not check transaction ${normalizedTxId}: ${response.status}`);
    }

    const payload = (await response.json()) as { tx_status?: string };
    const status = payload.tx_status;

    if (status === "success") {
      return;
    }

    if (status && status !== "pending") {
      throw new Error(transactionFailureMessage(normalizedTxId, status, payload));
    }

    await wait(pollIntervalMs);
  }

  throw new Error(`Timed out waiting for strategy transaction ${normalizedTxId} to confirm.`);
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
  waitForStrategyConfirmation?: TransactionWaiter;
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

  await (params.waitForStrategyConfirmation ?? waitForTransactionSuccess)(created.txId);

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
