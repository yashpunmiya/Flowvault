import { microToToken, tokenToMicro } from "flowvault-sdk";

export const LOCK_PERCENT = 80n;
export const LIQUID_PERCENT = 20n;
export const PERCENT_DENOMINATOR = 100n;
export const LOCK_DURATION_BLOCKS = 144;

export interface ParsedDepositAmount {
  microAmount: bigint;
  error: string | null;
}

export interface SavingsBreakdown {
  depositMicro: bigint;
  lockMicro: bigint;
  liquidMicro: bigint;
}

export interface SavingsStrategy extends SavingsBreakdown {
  lockUntilBlock: number;
  splitAmount: bigint;
  splitAddress: null;
}

export interface SavingsSuccessState {
  message: "Deposit successful";
  lockedMicro: bigint;
  liquidMicro: bigint;
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

export function calculateSavingsBreakdown(depositMicro: bigint): SavingsBreakdown {
  const lockMicro = (depositMicro * LOCK_PERCENT) / PERCENT_DENOMINATOR;
  const liquidMicro = depositMicro - lockMicro;

  return {
    depositMicro,
    lockMicro,
    liquidMicro,
  };
}

export function buildSavingsStrategy(
  depositMicro: bigint,
  currentBlock: number
): SavingsStrategy {
  if (!Number.isFinite(currentBlock) || !Number.isInteger(currentBlock) || currentBlock < 0) {
    throw new Error("Current block height is unavailable.");
  }

  const breakdown = calculateSavingsBreakdown(depositMicro);
  if (breakdown.lockMicro <= 0n) {
    throw new Error("Deposit amount is too small to create an 80% locked portion.");
  }

  return {
    ...breakdown,
    lockUntilBlock: currentBlock + LOCK_DURATION_BLOCKS,
    splitAmount: 0n,
    splitAddress: null,
  };
}

export function formatUsdcx(microAmount: bigint): string {
  return `${microToToken(microAmount.toString())} USDCx`;
}

export function buildSavingsSuccessState(params: {
  lockedMicro: bigint;
  liquidMicro: bigint;
  strategyTxId: string;
  depositTxId: string;
}): SavingsSuccessState {
  return {
    message: "Deposit successful",
    lockedMicro: params.lockedMicro,
    liquidMicro: params.liquidMicro,
    strategyTxId: params.strategyTxId,
    depositTxId: params.depositTxId,
  };
}
