"use client";

import { WalletProvider } from "@/hooks/useStacksWallet";
import { SavingsVault } from "@/components/SavingsVault";

export function SavingsVaultApp() {
  return (
    <WalletProvider>
      <SavingsVault />
    </WalletProvider>
  );
}
