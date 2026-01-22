"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { connect, disconnect, isConnected, getLocalStorage } from "@stacks/connect";

interface WalletAddress {
  address: string;
  type: string;
}

interface WalletState {
  isConnected: boolean;
  addresses: WalletAddress[];
  stxAddress: string | null;
}

interface WalletContextType {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

// Helper to extract STX address from various storage formats
function extractStxAddress(addresses: unknown): string | null {
  if (!addresses) return null;
  
  // Handle new format: { stx: [...], btc: [...] }
  if (typeof addresses === "object" && "stx" in (addresses as object)) {
    const stxAddrs = (addresses as { stx: Array<{ address: string }> }).stx;
    if (Array.isArray(stxAddrs) && stxAddrs.length > 0) {
      return stxAddrs[0].address;
    }
  }
  
  // Handle old format: array of { address, type }
  if (Array.isArray(addresses)) {
    const stxAddr = addresses.find(
      (a: { type?: string }) => a.type === "stx" || a.type === "p2pkh"
    );
    if (stxAddr) return stxAddr.address;
    // Fallback to index 2 (commonly STX address)
    if (addresses.length > 2) return addresses[2].address;
  }
  
  return null;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    addresses: [],
    stxAddress: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (isConnected()) {
        const stored = getLocalStorage();
        if (stored?.addresses) {
          const stxAddress = extractStxAddress(stored.addresses);
          setWallet({
            isConnected: true,
            addresses: [],
            stxAddress,
          });
        }
      }
    };
    checkConnection();
  }, []);

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await connect();
      if (response && response.addresses) {
        const stxAddress = extractStxAddress(response.addresses);
        
        setWallet({
          isConnected: true,
          addresses: [],
          stxAddress,
        });
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    disconnect();
    setWallet({
      isConnected: false,
      addresses: [],
      stxAddress: null,
    });
  }, []);

  return (
    <WalletContext.Provider
      value={{ wallet, connectWallet, disconnectWallet, isLoading }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
