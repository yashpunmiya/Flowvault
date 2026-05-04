"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { connect, disconnect, getLocalStorage, isConnected } from "@stacks/connect";
import { extractStxAddress, requireStxAddress } from "@/lib/wallet";
import { FLOWVAULT_NETWORK } from "@/lib/config";

interface WalletContextValue {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected()) return;
    const stored = getLocalStorage();
    setAddress(extractStxAddress(stored?.addresses));
  }, []);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const response = await connect({
        network: FLOWVAULT_NETWORK,
        forceWalletSelect: true,
      });
      setAddress(requireStxAddress(response.addresses));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    disconnect();
    setAddress(null);
    setError(null);
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      isConnected: Boolean(address),
      isConnecting,
      error,
      connectWallet,
      disconnectWallet,
    }),
    [address, connectWallet, disconnectWallet, error, isConnecting]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useStacksWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useStacksWallet must be used within WalletProvider.");
  }
  return context;
}
