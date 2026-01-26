"use client";

import { useCallback, useState } from "react";
import { request } from "@stacks/connect";
import {
  cvToValue,
  fetchCallReadOnlyFunction,
  ClarityValue,
  uintCV,
  principalCV,
  contractPrincipalCV,
  someCV,
  noneCV,
} from "@stacks/transactions";
import { NETWORK, CURRENT_CONTRACTS, parseContractId } from "@/lib/contracts";

export interface VaultState {
  totalBalance: number;
  lockedBalance: number;
  unlockedBalance: number;
  lockUntilBlock: number;
  currentBlock: number;
  routingRules: {
    lockAmount: number;
    lockUntilBlock: number;
    splitAddress: string | null;
    splitAmount: number;
  };
}

export interface RoutingRulesParams {
  lockAmount: number;
  lockUntilBlock: number;
  splitAddress: string | null;
  splitAmount: number;
}

export function useFlowVault() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readError, setReadError] = useState<string | null>(null);

  const toUint = (value: number) => {
    if (!Number.isFinite(value)) return uintCV(0);
    const safe = Math.max(0, Math.trunc(value));
    return uintCV(BigInt(safe));
  };

  // Get USDCx balance for an address
  const getUsdcxBalance = useCallback(async (address: string): Promise<number> => {
    const { address: contractAddr, name: contractName } = parseContractId(CURRENT_CONTRACTS.usdcx);

    try {
      const result: ClarityValue = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: "get-balance",
        functionArgs: [principalCV(address)],
        senderAddress: address,
        network: NETWORK,
      });

      const value = cvToValue(result);
      // SIP-010 get-balance returns (response uint uint) - extract the value
      if (typeof value === "object" && "value" in value) {
        return Number(value.value);
      }
      return Number(value) || 0;
    } catch (err) {
      console.error("Error fetching balance:", err);
      setReadError(`Failed to fetch USDCx balance: ${err instanceof Error ? err.message : String(err)}`);
      return 0;
    }
  }, []);

  // Helper to safely extract values from potential Clarity value wrappers or direct values
  const safeNumber = (val: any): number => {
    if (val === undefined || val === null) return 0;
    if (typeof val === "bigint" || typeof val === "number") return Number(val);
    if (typeof val === "string") return Number(val);
    if (typeof val === "object") {
      if ("value" in val) return safeNumber(val.value); // Recursive unwrap
    }
    return 0;
  };

  const safeString = (val: any): string | null => {
    if (val === undefined || val === null) return null;
    if (typeof val === "string") return val;
    if (typeof val === "object") {
      if ("value" in val) return safeString(val.value); // Recursive unwrap
      // Handle potential Principal object structure if different
      if ("address" in val) return safeString(val.address);
    }
    return String(val); // Fallback stringify
  };

  // Get vault state for an address
  const getVaultState = useCallback(async (address: string): Promise<VaultState | null> => {
    const { address: contractAddr, name: contractName } = parseContractId(CURRENT_CONTRACTS.flowvault);

    try {
      const result: ClarityValue = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: "get-vault-state",
        functionArgs: [principalCV(address)],
        senderAddress: address,
        network: NETWORK,
      });

      // Use cvToValue to convert Clarity types to JS types
      const value = cvToValue(result, true);
      // console.log("Vault state raw value:", JSON.stringify(value, null, 2));

      // Safely extract values handling both direct values and potential CV wrappers
      // Depending on the version/environment, cvToValue might return nested objects or primitives

      // Handle the case where the tuple itself is wrapped
      const root = (value && typeof value === 'object' && 'value' in value) ? value.value : value;

      const totalBalance = safeNumber(root["total-balance"]);
      const lockedBalance = safeNumber(root["locked-balance"]);
      const unlockedBalance = safeNumber(root["unlocked-balance"]);
      const lockUntilBlock = safeNumber(root["lock-until-block"]);
      const currentBlock = safeNumber(root["current-block"]);

      const rulesRaw = root["routing-rules"];
      const rules = (rulesRaw && typeof rulesRaw === 'object' && 'value' in rulesRaw) ? rulesRaw.value : (rulesRaw || {});

      const lockAmount = safeNumber(rules["lock-amount"]);
      const lockUntilBlockRules = safeNumber(rules["lock-until-block"]);

      let splitAddress = safeString(rules["split-address"]);
      // Extra safety: ensure it looks like a principal if possible, or just non-empty string properly
      if (splitAddress === "null" || splitAddress === "undefined") splitAddress = null;

      const splitAmount = safeNumber(rules["split-amount"]);

      return {
        totalBalance,
        lockedBalance,
        unlockedBalance,
        lockUntilBlock,
        currentBlock,
        routingRules: {
          lockAmount,
          lockUntilBlock: lockUntilBlockRules,
          splitAddress, // This will be string or null
          splitAmount,
        },
      };
    } catch (err) {
      console.error("Error fetching vault state:", err);
      setReadError(`Failed to fetch vault state: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }, []);

  // Get current block height from chain (read-only)
  const getCurrentBlockHeight = useCallback(async (address: string): Promise<number | null> => {
    const { address: contractAddr, name: contractName } = parseContractId(CURRENT_CONTRACTS.flowvault);

    try {
      const result: ClarityValue = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: "get-current-block-height",
        functionArgs: [],
        senderAddress: address,
        network: NETWORK,
      });

      const value = cvToValue(result);
      console.log("Current block height:", value);
      return Number(value);
    } catch (err) {
      console.error("Error fetching current block height:", err);
      setReadError(`Failed to fetch block height: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }, []);

  // Set routing rules
  const setRoutingRules = useCallback(async (params: RoutingRulesParams): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { address, name } = parseContractId(CURRENT_CONTRACTS.flowvault);

      await request("stx_callContract", {
        contract: `${address}.${name}`,
        functionName: "set-routing-rules",
        functionArgs: [
          toUint(params.lockAmount),
          toUint(params.lockUntilBlock),
          params.splitAddress ? someCV(principalCV(params.splitAddress)) : noneCV(),
          toUint(params.splitAmount),
        ],
        network: "testnet",
        postConditionMode: "allow",
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set routing rules");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Deposit USDCx to vault
  const deposit = useCallback(async (amount: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { address: vaultAddr, name: vaultName } = parseContractId(CURRENT_CONTRACTS.flowvault);
      const { address: tokenAddr, name: tokenName } = parseContractId(CURRENT_CONTRACTS.usdcx);

      await request("stx_callContract", {
        contract: `${vaultAddr}.${vaultName}`,
        functionName: "deposit",
        functionArgs: [
          contractPrincipalCV(tokenAddr, tokenName),
          toUint(amount),
        ],
        network: "testnet",
        postConditionMode: "allow",
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deposit");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Withdraw from vault
  const withdraw = useCallback(async (amount: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { address: vaultAddr, name: vaultName } = parseContractId(CURRENT_CONTRACTS.flowvault);
      const { address: tokenAddr, name: tokenName } = parseContractId(CURRENT_CONTRACTS.usdcx);

      await request("stx_callContract", {
        contract: `${vaultAddr}.${vaultName}`,
        functionName: "withdraw",
        functionArgs: [
          contractPrincipalCV(tokenAddr, tokenName),
          toUint(amount),
        ],
        network: "testnet",
        postConditionMode: "allow",
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to withdraw");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear routing rules
  const clearRoutingRules = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { address, name } = parseContractId(CURRENT_CONTRACTS.flowvault);

      await request("stx_callContract", {
        contract: `${address}.${name}`,
        functionName: "clear-routing-rules",
        functionArgs: [],
        network: "testnet",
        postConditionMode: "allow",
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear routing rules");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request tokens from faucet (for testing)
  const requestFaucet = useCallback(async (amount: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { address, name } = parseContractId(CURRENT_CONTRACTS.usdcx);

      await request("stx_callContract", {
        contract: `${address}.${name}`,
        functionName: "faucet",
        functionArgs: [toUint(amount)],
        network: "testnet",
        postConditionMode: "allow",
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request from faucet");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    readError,
    getUsdcxBalance,
    getVaultState,
    getCurrentBlockHeight,
    setRoutingRules,
    deposit,
    withdraw,
    clearRoutingRules,
    requestFaucet,
  };
}
