/**
 * FlowVault SDK — Public API
 *
 * @packageDocumentation
 */

// Main class
export { FlowVault } from "./FlowVault";

// Types
export type {
  FlowVaultConfig,
  NetworkName,
  RoutingRules,
  VaultState,
  TransactionResult,
  DepositResult,
  WithdrawResult,
} from "./types";

// Errors
export {
  FlowVaultError,
  InvalidAmountError,
  InvalidAddressError,
  InvalidConfigurationError,
  ContractCallError,
  NetworkError,
} from "./errors";

// Constants
export {
  DEFAULT_CONTRACTS,
  USDCX_DECIMALS,
  USDCX_MULTIPLIER,
  ERROR_CODE_MAP,
  errorMessageFromCode,
} from "./constants";

// Network helpers
export { resolveNetwork, getRpcEndpoint, RPC_ENDPOINTS } from "./network";

// Utilities
export {
  assertValidAddress,
  isValidAddress,
  assertValidAmount,
  assertNonNegativeAmount,
  tokenToMicro,
  microToToken,
  isBlockInFuture,
  parseVaultState,
  parseRoutingRules,
  safeNumber,
  safeString,
} from "./utils";
