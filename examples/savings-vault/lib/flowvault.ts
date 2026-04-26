"use client";

import { request } from "@stacks/connect";
import { FlowVault, type ContractCallRequest, type PostConditionModeLike } from "flowvault-sdk";
import { FLOWVAULT_CONTRACTS, FLOWVAULT_NETWORK } from "@/lib/config";

function toWalletPostConditionMode(mode: PostConditionModeLike | undefined): "allow" | "deny" {
  return String(mode ?? "allow").toLowerCase().includes("deny") ? "deny" : "allow";
}

async function executeWalletContractCall(call: ContractCallRequest): Promise<unknown> {
  return request("stx_callContract", {
    contract: `${call.contractAddress}.${call.contractName}`,
    functionName: call.functionName,
    functionArgs: call.functionArgs,
    network: call.network,
    postConditionMode: toWalletPostConditionMode(call.postConditionMode),
    postConditions: call.postConditions,
  });
}

export function createFlowVaultSdk(senderAddress: string): FlowVault {
  return new FlowVault({
    network: FLOWVAULT_NETWORK,
    ...FLOWVAULT_CONTRACTS,
    senderAddress,
    contractCallExecutor: executeWalletContractCall,
  });
}
