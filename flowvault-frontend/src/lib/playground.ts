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

export interface StrategyExplanationModel {
  lockPercent: number;
  splitPercent: number;
  keepPercent: number;
  lockAmountText: string;
  splitAmountText: string;
  keepAmountText: string;
  lockDurationText: string;
  lockUntilBlockText: string;
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
  const value = microAmount / USDCX_DECIMALS;
  if (!Number.isFinite(value)) return "0.00";
  if (value === 0) return "0.00";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
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
    errors.push("Add a recipient address for the auto payment.");
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

export function getExplorerTxUrl(txId: string, network = "testnet"): string {
  const clean = txId.startsWith("0x") ? txId : `0x${txId}`;
  return `https://explorer.hiro.so/txid/${clean}?chain=${network}`;
}

export function buildStrategyExplanation(params: {
  depositMicro: number;
  lockMicro: number;
  splitMicro: number;
  availableMicro: number;
  lockBlocks: number;
  lockUntilBlock: number | null;
}): StrategyExplanationModel {
  const { depositMicro, lockMicro, splitMicro, availableMicro, lockBlocks, lockUntilBlock } = params;
  const percent = (amount: number) =>
    depositMicro > 0 ? Math.round((amount / depositMicro) * 100) : 0;

  return {
    lockPercent: percent(lockMicro),
    splitPercent: percent(splitMicro),
    keepPercent: percent(availableMicro),
    lockAmountText: formatMicroToUsdcx(lockMicro),
    splitAmountText: formatMicroToUsdcx(splitMicro),
    keepAmountText: formatMicroToUsdcx(availableMicro),
    lockDurationText: lockBlocks > 0 ? `${lockBlocks} blocks` : "no lock",
    lockUntilBlockText: lockUntilBlock ? `block #${lockUntilBlock}` : "not scheduled",
  };
}

export function describeActivityStatus(params: {
  type: "deposit" | "withdraw";
  lockedMicro: number;
  unlockBlock: number | null;
  currentBlock: number | null;
}): "locked" | "unlocked" | "submitted" {
  if (params.type === "withdraw") return "submitted";
  if (!params.unlockBlock || params.lockedMicro <= 0) return "unlocked";
  if (params.currentBlock !== null && params.currentBlock >= params.unlockBlock) {
    return "unlocked";
  }
  return "locked";
}

export function toFriendlyFlowVaultError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("user rejected") || lower.includes("cancel")) {
    return "Transaction cancelled in your wallet.";
  }
  if (message.includes("u1001") || lower.includes("invalid amount")) {
    return "Enter an amount greater than 0.";
  }
  if (message.includes("u1002") || lower.includes("insufficient balance")) {
    return "You do not have enough USDCx for this action.";
  }
  if (message.includes("u1003") || lower.includes("locked")) {
    return "That amount is still locked and cannot be withdrawn yet.";
  }
  if (message.includes("u1004") || lower.includes("routing")) {
    return "Your lock and auto payment amounts exceed the deposit amount.";
  }
  if (message.includes("u1007") || lower.includes("split address")) {
    return "Add a recipient address for the auto payment.";
  }
  if (message.includes("u1008") || lower.includes("lock block")) {
    return "Choose a lock duration that ends at a future Stacks block.";
  }
  if (message.includes("u1010")) {
    return "The locked amount cannot exceed what remains after auto payment.";
  }
  if (message.includes("u1011") || lower.includes("split-to-self")) {
    return "Auto payment recipient cannot be your connected wallet.";
  }

  return "The transaction could not be submitted. Check your wallet and try again.";
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
