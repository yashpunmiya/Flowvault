import { isValidAddress, microToToken, tokenToMicro } from "flowvault-sdk";

export const LOCK_DURATION_BLOCKS = 144;
export const PERCENT_DENOMINATOR = 100n;

export interface ParsedDepositAmount {
  microAmount: bigint;
  error: string | null;
}

export interface ParsedPercent {
  percent: number;
  microPercent: bigint;
  error: string | null;
}

export interface FlowPayInputs {
  depositAmount: string;
  savingsPercent: string;
  splitPercent: string;
  recipientAddress: string;
  walletAddress?: string | null;
}

export interface FlowPayBreakdown {
  depositMicro: bigint;
  savedMicro: bigint;
  sentMicro: bigint;
  availableMicro: bigint;
  savingsPercent: number;
  splitPercent: number;
}

export interface FlowPayStrategy extends FlowPayBreakdown {
  lockUntilBlock: number;
  splitAddress: string;
}

export interface FlowPaySuccessState {
  message: "FlowPay deposit complete";
  savedMicro: bigint;
  sentMicro: bigint;
  availableMicro: bigint;
  lockUntilBlock: number;
  strategyTxId: string;
  depositTxId: string;
}

export function parseDepositAmount(input: string): ParsedDepositAmount {
  const trimmed = input.trim();

  if (!trimmed) {
    return { microAmount: 0n, error: "Enter a deposit amount." };
  }

  if (trimmed.startsWith("-")) {
    return { microAmount: 0n, error: "Deposit amount must be greater than 0." };
  }

  try {
    const microAmount = tokenToMicro(trimmed);
    if (microAmount <= 0n) {
      return { microAmount: 0n, error: "Deposit amount must be greater than 0." };
    }
    return { microAmount, error: null };
  } catch (err) {
    return {
      microAmount: 0n,
      error: err instanceof Error ? err.message : "Enter a valid USDCx amount.",
    };
  }
}

export function parsePercent(input: string, label: string): ParsedPercent {
  const trimmed = input.trim();

  if (!trimmed) {
    return { percent: 0, microPercent: 0n, error: `Enter a ${label}.` };
  }

  const percent = Number(trimmed);
  if (!Number.isFinite(percent)) {
    return { percent: 0, microPercent: 0n, error: `${label} must be a number.` };
  }

  if (percent < 0 || percent > 100) {
    return { percent: 0, microPercent: 0n, error: `${label} must be between 0 and 100.` };
  }

  const rounded = Math.round(percent * 100);
  return {
    percent,
    microPercent: BigInt(rounded),
    error: null,
  };
}

export function calculateFlowPayBreakdown(params: {
  depositMicro: bigint;
  savingsPercent: number;
  splitPercent: number;
}): FlowPayBreakdown {
  const savingsBasisPoints = BigInt(Math.round(params.savingsPercent * 100));
  const splitBasisPoints = BigInt(Math.round(params.splitPercent * 100));
  const basisPointDenominator = 10_000n;

  const savedMicro = (params.depositMicro * savingsBasisPoints) / basisPointDenominator;
  const sentMicro = (params.depositMicro * splitBasisPoints) / basisPointDenominator;
  const availableMicro = params.depositMicro - savedMicro - sentMicro;

  return {
    depositMicro: params.depositMicro,
    savedMicro,
    sentMicro,
    availableMicro,
    savingsPercent: params.savingsPercent,
    splitPercent: params.splitPercent,
  };
}

export function validateFlowPayInputs(inputs: FlowPayInputs): {
  parsedDeposit: ParsedDepositAmount;
  parsedSavingsPercent: ParsedPercent;
  parsedSplitPercent: ParsedPercent;
  recipientAddress: string;
  error: string | null;
} {
  const parsedDeposit = parseDepositAmount(inputs.depositAmount);
  const parsedSavingsPercent = parsePercent(inputs.savingsPercent, "savings percentage");
  const parsedSplitPercent = parsePercent(inputs.splitPercent, "recipient split percentage");
  const recipientAddress = inputs.recipientAddress.trim();

  const firstParseError =
    parsedDeposit.error ?? parsedSavingsPercent.error ?? parsedSplitPercent.error;
  if (firstParseError) {
    return {
      parsedDeposit,
      parsedSavingsPercent,
      parsedSplitPercent,
      recipientAddress,
      error: firstParseError,
    };
  }

  if (parsedSavingsPercent.percent <= 0) {
    return {
      parsedDeposit,
      parsedSavingsPercent,
      parsedSplitPercent,
      recipientAddress,
      error: "Savings percentage must be greater than 0.",
    };
  }

  if (parsedSplitPercent.percent <= 0) {
    return {
      parsedDeposit,
      parsedSavingsPercent,
      parsedSplitPercent,
      recipientAddress,
      error: "Recipient split percentage must be greater than 0.",
    };
  }

  if (parsedSavingsPercent.percent + parsedSplitPercent.percent > 100) {
    return {
      parsedDeposit,
      parsedSavingsPercent,
      parsedSplitPercent,
      recipientAddress,
      error: "Savings plus recipient split cannot exceed 100%.",
    };
  }

  if (!recipientAddress) {
    return {
      parsedDeposit,
      parsedSavingsPercent,
      parsedSplitPercent,
      recipientAddress,
      error: "Enter the recipient Stacks address.",
    };
  }

  if (!isValidAddress(recipientAddress)) {
    return {
      parsedDeposit,
      parsedSavingsPercent,
      parsedSplitPercent,
      recipientAddress,
      error: "Enter a valid Stacks testnet recipient address.",
    };
  }

  if (inputs.walletAddress && recipientAddress === inputs.walletAddress) {
    return {
      parsedDeposit,
      parsedSavingsPercent,
      parsedSplitPercent,
      recipientAddress,
      error: "Recipient cannot be the connected wallet.",
    };
  }

  const breakdown = calculateFlowPayBreakdown({
    depositMicro: parsedDeposit.microAmount,
    savingsPercent: parsedSavingsPercent.percent,
    splitPercent: parsedSplitPercent.percent,
  });

  if (breakdown.savedMicro <= 0n) {
    return {
      parsedDeposit,
      parsedSavingsPercent,
      parsedSplitPercent,
      recipientAddress,
      error: "Deposit is too small for the selected savings percentage.",
    };
  }

  if (breakdown.sentMicro <= 0n) {
    return {
      parsedDeposit,
      parsedSavingsPercent,
      parsedSplitPercent,
      recipientAddress,
      error: "Deposit is too small for the selected recipient split.",
    };
  }

  return {
    parsedDeposit,
    parsedSavingsPercent,
    parsedSplitPercent,
    recipientAddress,
    error: null,
  };
}

export function buildFlowPayStrategy(
  inputs: FlowPayInputs,
  currentBlock: number
): FlowPayStrategy {
  if (!Number.isFinite(currentBlock) || !Number.isInteger(currentBlock) || currentBlock < 0) {
    throw new Error("Current block height is unavailable.");
  }

  const validation = validateFlowPayInputs(inputs);
  if (validation.error) {
    throw new Error(validation.error);
  }

  const breakdown = calculateFlowPayBreakdown({
    depositMicro: validation.parsedDeposit.microAmount,
    savingsPercent: validation.parsedSavingsPercent.percent,
    splitPercent: validation.parsedSplitPercent.percent,
  });

  return {
    ...breakdown,
    lockUntilBlock: currentBlock + LOCK_DURATION_BLOCKS,
    splitAddress: validation.recipientAddress,
  };
}

export function buildFlowPaySuccessState(params: {
  savedMicro: bigint;
  sentMicro: bigint;
  availableMicro: bigint;
  lockUntilBlock: number;
  strategyTxId: string;
  depositTxId: string;
}): FlowPaySuccessState {
  return {
    message: "FlowPay deposit complete",
    savedMicro: params.savedMicro,
    sentMicro: params.sentMicro,
    availableMicro: params.availableMicro,
    lockUntilBlock: params.lockUntilBlock,
    strategyTxId: params.strategyTxId,
    depositTxId: params.depositTxId,
  };
}

export function formatUsdcx(microAmount: bigint): string {
  return `${microToToken(microAmount.toString())} USDCx`;
}

export function formatPercent(percent: number): string {
  return `${Number.isInteger(percent) ? percent.toFixed(0) : percent.toFixed(2)}%`;
}
