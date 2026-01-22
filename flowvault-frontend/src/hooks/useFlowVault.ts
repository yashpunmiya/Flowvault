"use client";

import { useCallback, useState } from "react";
import { request } from "@stacks/connect";
import { Cl, cvToValue, fetchCallReadOnlyFunction, ClarityValue } from "@stacks/transactions";
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
    if (!Number.isFinite(value)) return Cl.uint(0);
    const safe = Math.max(0, Math.trunc(value));
    return Cl.uint(BigInt(safe));
  };

  // Get USDCx balance for an address
  const getUsdcxBalance = useCallback(async (address: string): Promise<number> => {
    const { address: contractAddr, name: contractName } = parseContractId(CURRENT_CONTRACTS.usdcx);
    
    try {
      const result: ClarityValue = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: "get-balance",
        functionArgs: [Cl.principal(address)],
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

  // Get vault state for an address
  const getVaultState = useCallback(async (address: string): Promise<VaultState | null> => {
    const { address: contractAddr, name: contractName } = parseContractId(CURRENT_CONTRACTS.flowvault);
    
    try {
      const result: ClarityValue = await fetchCallReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: "get-vault-state",
        functionArgs: [Cl.principal(address)],
        senderAddress: address,
        network: NETWORK,
      });
      
      const value = cvToValue(result, true);
      console.log("Vault state raw value:", JSON.stringify(value, null, 2));
      
      // Extract values from nested Clarity structure
      const totalBalance = Number(value["total-balance"]?.value || 0);
      const lockedBalance = Number(value["locked-balance"]?.value || 0);
      const unlockedBalance = Number(value["unlocked-balance"]?.value || 0);
      const lockUntilBlock = Number(value["lock-until-block"]?.value || 0);
      const currentBlock = Number(value["current-block"]?.value || 0);
      
      const rules = value["routing-rules"]?.value || {};
      const lockAmount = Number(rules["lock-amount"]?.value || 0);
      const lockUntilBlockRules = Number(rules["lock-until-block"]?.value || 0);
      const splitAddress = rules["split-address"]?.value || null;
      const splitAmount = Number(rules["split-amount"]?.value || 0);
      
      return {
        totalBalance,
        lockedBalance,
        unlockedBalance,
        lockUntilBlock,
        currentBlock,
        routingRules: {
          lockAmount,
          lockUntilBlock: lockUntilBlockRules,
          splitAddress,
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
          params.splitAddress ? Cl.some(Cl.principal(params.splitAddress)) : Cl.none(),
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
          Cl.contractPrincipal(tokenAddr, tokenName),
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
          Cl.contractPrincipal(tokenAddr, tokenName),
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
