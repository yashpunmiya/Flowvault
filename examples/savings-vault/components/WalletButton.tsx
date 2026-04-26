"use client";

import { useStacksWallet } from "@/hooks/useStacksWallet";
import { truncateAddress } from "@/lib/wallet";

export function WalletButton() {
  const { address, isConnected, isConnecting, connectWallet, disconnectWallet } = useStacksWallet();

  if (isConnected && address) {
    return (
      <div className="wallet-row">
        <span className="connection-dot" aria-hidden="true" />
        <span className="address">{truncateAddress(address)}</span>
        <button className="secondary" type="button" onClick={disconnectWallet}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button className="primary" type="button" onClick={connectWallet} disabled={isConnecting}>
      <span className="button-icon" aria-hidden="true">+</span>
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
