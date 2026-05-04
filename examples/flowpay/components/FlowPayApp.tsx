"use client";

import { FlowPay } from "@/components/FlowPay";
import { WalletProvider } from "@/hooks/useStacksWallet";

export function FlowPayApp() {
  return (
    <WalletProvider>
      <FlowPay />
    </WalletProvider>
  );
}
