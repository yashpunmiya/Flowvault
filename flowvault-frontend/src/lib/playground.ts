export type StrategyMode = "beginner" | "advanced";

export type StrategyTemplateId =
  | "smart-savings"
  | "auto-split-payments"
  | "payroll-distribution";

export interface StrategyTemplate {
  id: StrategyTemplateId;
  title: string;
  description: string;
  lockPercent: number;
  splitPercent: number;
  defaultLockBlocks: number;
  requiresSplitAddress: boolean;
}

export interface ParsedUsdcxInput {
  microAmount: number;
  hasError: boolean;
  error: string | null;
}

export interface ParsedBlocksInput {
  blocks: number;
  hasError: boolean;
  error: string | null;
}

export interface TemplateApplication {
  lockAmount: string;
  splitAmount: string;
  lockBlocks: string;
}

export interface TransactionPreviewModel {
  depositMicro: number;
  lockMicro: number;
  splitMicro: number;
  availableMicro: number;
  lockUntilBlock: number | null;
  splitAddress: string | null;
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

export const USDCX_DECIMALS = 1_000_000;
export const DEFAULT_TEMPLATE_DEPOSIT_USDCX = 100;

export const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    id: "smart-savings",
    title: "Smart Savings",
    description:
      "Automatically lock a portion of your deposits while keeping some liquid",
    lockPercent: 80,
    splitPercent: 0,
    defaultLockBlocks: 144,
    requiresSplitAddress: false,
  },
  {
    id: "auto-split-payments",
    title: "Auto Split Payments",
    description: "Split incoming funds between multiple wallets automatically",
    lockPercent: 0,
    splitPercent: 50,
    defaultLockBlocks: 0,
    requiresSplitAddress: true,
  },
  {
    id: "payroll-distribution",
    title: "Payroll / Distribution",
    description: "Distribute funds between multiple parties and savings",
    lockPercent: 20,
    splitPercent: 30,
    defaultLockBlocks: 144,
    requiresSplitAddress: true,
  },
];

export function formatMicroToUsdcx(microAmount: number): string {
  return (microAmount / USDCX_DECIMALS).toFixed(2);
}

export function parseUsdcxInput(value: string): ParsedUsdcxInput {
  const trimmed = value.trim();

  if (!trimmed) {
    return { microAmount: 0, hasError: false, error: null };
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return { microAmount: 0, hasError: true, error: "Enter a valid number." };
  }

  if (parsed < 0) {
    return { microAmount: 0, hasError: true, error: "Value cannot be negative." };
  }

  return {
    microAmount: Math.round(parsed * USDCX_DECIMALS),
    hasError: false,
    error: null,
  };
}

export function parseBlocksInput(value: string): ParsedBlocksInput {
  const trimmed = value.trim();

  if (!trimmed) {
    return { blocks: 0, hasError: false, error: null };
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return { blocks: 0, hasError: true, error: "Enter a valid block number." };
  }

  if (parsed < 0) {
    return { blocks: 0, hasError: true, error: "Blocks cannot be negative." };
  }

  if (!Number.isInteger(parsed)) {
    return { blocks: 0, hasError: true, error: "Use a whole number of blocks." };
  }

  return {
    blocks: parsed,
    hasError: false,
    error: null,
  };
}

export function isValidStacksAddress(address: string): boolean {
  const trimmed = address.trim();
  if (!trimmed) return false;

  const standardPrincipal = /^S[PTMN][A-HJ-NP-Z0-9]{38,40}$/;
  const contractPrincipal = /^S[PTMN][A-HJ-NP-Z0-9]{38,40}\.[a-zA-Z]([a-zA-Z0-9_-]{0,39})$/;

  return standardPrincipal.test(trimmed) || contractPrincipal.test(trimmed);
}

export function applyStrategyTemplate(
  templateId: StrategyTemplateId,
  depositBasisUsdcx: number,
): TemplateApplication {
  const template = STRATEGY_TEMPLATES.find((item) => item.id === templateId);
  if (!template) {
    return { lockAmount: "0", splitAmount: "0", lockBlocks: "0" };
  }

  const safeBasis = Number.isFinite(depositBasisUsdcx) && depositBasisUsdcx > 0
    ? depositBasisUsdcx
    : DEFAULT_TEMPLATE_DEPOSIT_USDCX;

  const lockAmount = ((safeBasis * template.lockPercent) / 100).toFixed(2);
  const splitAmount = ((safeBasis * template.splitPercent) / 100).toFixed(2);

  return {
    lockAmount,
    splitAmount,
    lockBlocks: template.defaultLockBlocks > 0 ? String(template.defaultLockBlocks) : "",
  };
}

export function buildTransactionPreview(params: {
  depositMicro: number;
  lockMicro: number;
  splitMicro: number;
  splitAddress: string;
  lockBlocks: number;
  currentBlock: number | null;
}): TransactionPreviewModel {
  const { depositMicro, lockMicro, splitMicro, splitAddress, lockBlocks, currentBlock } = params;

  const errors: string[] = [];
  const warnings: string[] = [];

  if (splitMicro > 0 && !splitAddress.trim()) {
    errors.push("Auto payment recipient is required when auto payment is set.");
  }

  if (splitAddress.trim() && !isValidStacksAddress(splitAddress.trim())) {
    errors.push("Auto payment recipient must be a valid Stacks address.");
  }

  if (lockMicro > 0 && lockBlocks <= 0) {
    errors.push("Savings duration must be greater than 0 when savings lock is set.");
  }

  if (splitMicro + lockMicro > depositMicro) {
    errors.push("Savings lock + auto payment cannot exceed deposit amount.");
  }

  const holdAfterSplit = Math.max(0, depositMicro - splitMicro);
  if (lockMicro > holdAfterSplit) {
    errors.push("Savings lock cannot exceed remaining amount after auto payment.");
  }

  if (depositMicro === 0) {
    warnings.push("Enter a deposit amount to preview strategy outcomes.");
  }

  const availableMicro = Math.max(0, depositMicro - splitMicro - lockMicro);
  const lockUntilBlock = lockMicro > 0 && currentBlock !== null && lockBlocks > 0
    ? currentBlock + lockBlocks
    : null;

  return {
    depositMicro,
    lockMicro,
    splitMicro,
    availableMicro,
    lockUntilBlock,
    splitAddress: splitAddress.trim() || null,
    errors,
    warnings,
    isValid: errors.length === 0,
  };
}

export function buildDeveloperPreviewSnippet(params: {
  lockAmountMicro: number;
  lockDurationBlocks: number;
  splitAmountMicro: number;
  splitAddress: string;
}): string {
  const { lockAmountMicro, lockDurationBlocks, splitAmountMicro, splitAddress } = params;

  const splitAddressValue = splitAddress.trim() ? `"${splitAddress.trim()}"` : "undefined";

  return `import { FlowVault } from "flowvault-sdk";

const flowvault = new FlowVault({ network: "testnet" });

await flowvault.createStrategy({
  lockAmount: ${lockAmountMicro},
  lockDuration: ${lockDurationBlocks},
  split: {
    address: ${splitAddressValue},
    amount: ${splitAmountMicro}
  }
});`;
}
