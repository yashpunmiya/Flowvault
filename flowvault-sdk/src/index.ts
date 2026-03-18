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
  MicroAmount,
  TokenAmount,
  ContractCallRequest,
  ContractCallExecutor,
  RoutingRules,
  VaultState,
  TransactionResult,
  TransactionOptions,
  PostConditionModeLike,
  DepositResult,
  WithdrawResult,
} from "./types";

// Errors
export {
  FlowVaultError,
  InvalidAmountError,
  InvalidAddressError,
  InvalidConfigurationError,
  InvalidRoutingRuleError,
  NetworkConfigurationError,
  ContractCallError,
  NetworkError,
  ParsingError,
} from "./errors";

// Constants
export {
  DEFAULT_CONTRACTS,
  USDCX_DECIMALS,
  USDCX_MULTIPLIER,
  USDCX_MULTIPLIER_BIGINT,
  ERROR_CODE_MAP,
  errorMessageFromCode,
} from "./constants";

// Network helpers
export { resolveNetwork, getRpcEndpoint, RPC_ENDPOINTS } from "./network";

// Utilities
export {
  assertValidAddress,
  isValidAddress,
  assertValidContractName,
  isValidContractName,
  assertValidAmount,
  assertNonNegativeAmount,
  parseMicroAmount,
  tokenToMicro,
  microToToken,
  microToNumber,
  isBlockInFuture,
  parseVaultState,
  parseRoutingRules,
  parseBool,
  safeNumber,
  safeString,
} from "./utils";
