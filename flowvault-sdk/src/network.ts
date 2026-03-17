/**
 * FlowVault SDK — Network helpers
 *
 * Thin wrapper around @stacks/network that keeps network selection simple.
 */

import type { NetworkName } from "./types";
import { NetworkConfigurationError } from "./errors";

// ---------------------------------------------------------------------------
// RPC endpoints
// ---------------------------------------------------------------------------

export const RPC_ENDPOINTS: Record<NetworkName, string> = {
  testnet: "https://api.testnet.hiro.so",
  mainnet: "https://api.hiro.so",
};

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

/**
 * Validate and return the network name string.
 *
 * `@stacks/transactions` v7 accepts the plain strings `"testnet"` and
 * `"mainnet"` wherever a network parameter is expected, so the SDK simply
 * passes these through after validation.
 */
export function resolveNetwork(network: string): NetworkName {
  if (network === "testnet" || network === "mainnet") {
    return network;
  }
  throw new NetworkConfigurationError(
    `Unsupported network "${network}". Use "testnet" or "mainnet".`
  );
}

/**
 * Return the Hiro RPC endpoint for the given network.
 */
export function getRpcEndpoint(network: NetworkName): string {
  return RPC_ENDPOINTS[network];
}
