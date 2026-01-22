"use client";

import { useWallet } from "@/context/WalletContext";

export function WalletConnect() {
  const { wallet, connectWallet, disconnectWallet, isLoading } = useWallet();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (wallet.isConnected && wallet.stxAddress) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-gray-800 rounded-lg text-sm font-mono text-green-400">
          {truncateAddress(wallet.stxAddress)}
        </div>
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isLoading}
      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
