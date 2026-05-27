import { Pc } from "@stacks/transactions";
import type { PostCondition } from "@stacks/transactions";
import type { RoutingRules, TransactionOptions, TransactionResult } from "flowvault-sdk";
import {
  FLOWVAULT_API_BASE,
  FLOWVAULT_CONTRACTS,
  FLOWVAULT_TOKEN_ASSET_NAME,
} from "@/lib/config";
import {
  buildFlowPayStrategy,
  buildFlowPaySuccessState,
  parseDepositAmount,
  type FlowPayInputs,
  type FlowPayStrategy,
  type FlowPaySuccessState,
} from "@/lib/flowpay-strategy";

export interface FlowPayVaultSdk {
  getCurrentBlockHeight(senderAddress: string): Promise<number>;
  createStrategy(rules: RoutingRules, options?: TransactionOptions): Promise<TransactionResult>;
  deposit(amount: bigint, options?: TransactionOptions): Promise<TransactionResult>;
}

export interface FlowPayDepositResult {
  strategy: FlowPayStrategy;
  success: FlowPaySuccessState;
}

type FetchLike = typeof fetch;

export interface TransactionWaitOptions {
  fetchImpl?: FetchLike;
  pollIntervalMs?: number;
  timeoutMs?: number;
}

export type TransactionWaiter = (txId: string) => Promise<void>;

function tokenContractId(): `${string}.${string}` {
  return `${FLOWVAULT_CONTRACTS.tokenContractAddress}.${FLOWVAULT_CONTRACTS.tokenContractName}`;
}

function vaultContractId(): `${string}.${string}` {
  return `${FLOWVAULT_CONTRACTS.contractAddress}.${FLOWVAULT_CONTRACTS.contractName}`;
}

export function buildDepositPostConditions(params: {
  walletAddress: string;
  depositMicro: bigint;
}): PostCondition[] {
  const token = tokenContractId();

  return [
    Pc.principal(params.walletAddress)
      .willSendLte(params.depositMicro)
      .ft(token, FLOWVAULT_TOKEN_ASSET_NAME),
    Pc.principal(vaultContractId())
      .willSendLte(params.depositMicro)
      .ft(token, FLOWVAULT_TOKEN_ASSET_NAME),
  ];
}

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
  sdk: FlowPayVaultSdk;
  walletAddress: string;
  inputs: FlowPayInputs;
}): Promise<{ strategy: FlowPayStrategy; txId: string }> {
  const currentBlock = await params.sdk.getCurrentBlockHeight(params.walletAddress);
  const strategy = buildFlowPayStrategy(params.inputs, currentBlock);

  const transaction = await params.sdk.createStrategy(
    {
      lockAmount: strategy.savedMicro,
      lockUntilBlock: strategy.lockUntilBlock,
      splitAddress: strategy.splitAddress,
      splitAmount: strategy.sentMicro,
    },
    {
      postConditionMode: "deny",
      postConditions: [],
    }
  );

  return {
    strategy,
    txId: transaction.txId,
  };
}

export async function runFlowPayDeposit(params: {
  sdk: FlowPayVaultSdk;
  walletAddress: string | null;
  inputs: FlowPayInputs;
  waitForStrategyConfirmation?: TransactionWaiter;
}): Promise<FlowPayDepositResult> {
  if (!params.walletAddress) {
    throw new Error("Connect wallet before depositing.");
  }

  const parsed = parseDepositAmount(params.inputs.depositAmount);
  if (parsed.error) {
    throw new Error(parsed.error);
  }

  const created = await createStrategy({
    sdk: params.sdk,
    walletAddress: params.walletAddress,
    inputs: {
      ...params.inputs,
      walletAddress: params.walletAddress,
    },
  });

  await (params.waitForStrategyConfirmation ?? waitForTransactionSuccess)(created.txId);

  const depositTransaction = await params.sdk.deposit(created.strategy.depositMicro, {
    postConditionMode: "deny",
    postConditions: buildDepositPostConditions({
      walletAddress: params.walletAddress,
      depositMicro: created.strategy.depositMicro,
    }),
  });

  return {
    strategy: created.strategy,
    success: buildFlowPaySuccessState({
      savedMicro: created.strategy.savedMicro,
      sentMicro: created.strategy.sentMicro,
      availableMicro: created.strategy.availableMicro,
      lockUntilBlock: created.strategy.lockUntilBlock,
      strategyTxId: created.txId,
      depositTxId: depositTransaction.txId,
    }),
  };
}
