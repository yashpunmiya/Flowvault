import { Pc } from "@stacks/transactions";
import type { PostCondition } from "@stacks/transactions";
import type { RoutingRules, TransactionOptions, TransactionResult } from "flowvault-sdk";
import { FLOWVAULT_CONTRACTS } from "@/lib/config";
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

function tokenContractId(): `${string}.${string}` {
  return `${FLOWVAULT_CONTRACTS.tokenContractAddress}.${FLOWVAULT_CONTRACTS.tokenContractName}`;
}

function vaultContractId(): `${string}.${string}` {
  return `${FLOWVAULT_CONTRACTS.contractAddress}.${FLOWVAULT_CONTRACTS.contractName}`;
}

export function buildDepositPostConditions(params: {
  walletAddress: string;
  depositMicro: bigint;
  sentMicro: bigint;
}): PostCondition[] {
  const token = tokenContractId();

  return [
    Pc.principal(params.walletAddress).willSendEq(params.depositMicro).ft(token, FLOWVAULT_CONTRACTS.tokenContractName),
    Pc.principal(vaultContractId()).willSendEq(params.sentMicro).ft(token, FLOWVAULT_CONTRACTS.tokenContractName),
  ];
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

  const depositTransaction = await params.sdk.deposit(created.strategy.depositMicro, {
    postConditionMode: "deny",
    postConditions: buildDepositPostConditions({
      walletAddress: params.walletAddress,
      depositMicro: created.strategy.depositMicro,
      sentMicro: created.strategy.sentMicro,
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
