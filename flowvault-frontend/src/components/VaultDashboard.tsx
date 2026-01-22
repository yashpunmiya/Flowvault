"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/context/WalletContext";
import { useFlowVault, VaultState } from "@/hooks/useFlowVault";

export function VaultDashboard() {
  const { wallet } = useWallet();
  const {
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
  } = useFlowVault();

  const [usdcxBalance, setUsdcxBalance] = useState<number>(0);
  const [vaultState, setVaultState] = useState<VaultState | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form states
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [lockAmount, setLockAmount] = useState("");
  const [lockBlocks, setLockBlocks] = useState("");
  const [splitAddress, setSplitAddress] = useState("");
  const [splitAmount, setSplitAmount] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const parseUsdcxAmount = (value: string) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return 0;
    return Math.max(0, Math.round(num * 1e6));
  };

  const parseBlocks = (value: string) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return 0;
    return Math.max(0, Math.floor(num));
  };

  const refreshData = useCallback(async () => {
    if (wallet.stxAddress) {
      const [balance, state] = await Promise.all([
        getUsdcxBalance(wallet.stxAddress),
        getVaultState(wallet.stxAddress),
      ]);
      setUsdcxBalance(balance);
      setVaultState(state);
    }
  }, [wallet.stxAddress, getUsdcxBalance, getVaultState]);

  useEffect(() => {
    refreshData();
  }, [refreshData, refreshKey]);

  const handleSetRoutingRules = async () => {
    setValidationError(null);
    const lockAmountValue = parseUsdcxAmount(lockAmount);
    const splitAmountValue = parseUsdcxAmount(splitAmount);
    const lockBlocksValue = parseBlocks(lockBlocks);
    if (lockAmountValue > 0 && lockBlocksValue <= 0) {
      setValidationError("Lock duration must be greater than 0 when lock amount is set.");
      return;
    }
    if (splitAmountValue > 0 && !splitAddress) {
      setValidationError("Split address is required when split amount is greater than 0.");
      return;
    }
    if (!wallet.stxAddress) {
      setValidationError("Wallet address not available. Please reconnect your wallet.");
      return;
    }
    const currentBlock = await getCurrentBlockHeight(wallet.stxAddress);
    if (currentBlock === null) {
      setValidationError("Unable to fetch current block height. Please try again in a moment.");
      return;
    }
    const success = await setRoutingRules({
      lockAmount: lockAmountValue,
      lockUntilBlock: currentBlock + lockBlocksValue,
      splitAddress: splitAddress || null,
      splitAmount: splitAmountValue,
    });
    if (success) {
      setLockAmount("");
      setLockBlocks("");
      setSplitAddress("");
      setSplitAmount("");
      setTimeout(() => setRefreshKey((k) => k + 1), 2000);
    }
  };

  const handleDeposit = async () => {
    const success = await deposit(parseUsdcxAmount(depositAmount));
    if (success) {
      setDepositAmount("");
      setTimeout(() => setRefreshKey((k) => k + 1), 2000);
    }
  };

  const handleWithdraw = async () => {
    const success = await withdraw(parseUsdcxAmount(withdrawAmount));
    if (success) {
      setWithdrawAmount("");
      setTimeout(() => setRefreshKey((k) => k + 1), 2000);
    }
  };

  const handleClearRules = async () => {
    const success = await clearRoutingRules();
    if (success) {
      setTimeout(() => setRefreshKey((k) => k + 1), 2000);
    }
  };

  const handleFaucet = async () => {
    const success = await requestFaucet(1000 * 1e6); // 1000 USDCx
    if (success) {
      setTimeout(() => setRefreshKey((k) => k + 1), 2000);
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-300 mb-4">
          Connect your wallet to get started
        </h2>
        <p className="text-gray-500">
          FlowVault requires a Stacks wallet to interact with the contracts
        </p>
      </div>
    );
  }

  const formatBalance = (amount: number) => (amount / 1e6).toFixed(2);
  const lockAmountValue = parseUsdcxAmount(lockAmount);
  const splitAmountValue = parseUsdcxAmount(splitAmount);
  const lockBlocksValue = parseBlocks(lockBlocks);
  const canSubmitRules =
    !!vaultState &&
    (lockAmountValue === 0 || lockBlocksValue > 0) &&
    (splitAmountValue === 0 || !!splitAddress);

  return (
    <div className="space-y-8">
      {readError && (
        <div className="bg-orange-900/50 border border-orange-500 text-orange-100 px-4 py-3 rounded-lg">
          {readError}
        </div>
      )}
      {validationError && (
        <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-100 px-4 py-3 rounded-lg">
          {validationError}
        </div>
      )}
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl p-6 border border-green-700/50">
          <h3 className="text-sm font-medium text-green-400 uppercase tracking-wide">
            Wallet USDCx
          </h3>
          <p className="text-3xl font-bold text-white mt-2">
            {formatBalance(usdcxBalance)}
          </p>
          <button
            onClick={handleFaucet}
            disabled={isLoading}
            className="mt-4 text-sm text-green-400 hover:text-green-300 underline"
          >
            Get Test Tokens
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-6 border border-blue-700/50">
          <h3 className="text-sm font-medium text-blue-400 uppercase tracking-wide">
            Total in Vault
          </h3>
          <p className="text-3xl font-bold text-white mt-2">
            {formatBalance(vaultState?.totalBalance || 0)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl p-6 border border-purple-700/50">
          <h3 className="text-sm font-medium text-purple-400 uppercase tracking-wide">
            Unlocked / Locked
          </h3>
          <p className="text-3xl font-bold text-white mt-2">
            {formatBalance(vaultState?.unlockedBalance || 0)} /{" "}
            {formatBalance(vaultState?.lockedBalance || 0)}
          </p>
          {vaultState && vaultState.lockUntilBlock > vaultState.currentBlock && (
            <p className="text-sm text-purple-400 mt-2">
              Locked until block #{vaultState.lockUntilBlock}
            </p>
          )}
        </div>
      </div>

      {/* Current Block Info */}
      <div className="bg-gray-800/50 rounded-lg px-4 py-3 text-sm text-gray-400">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            Current Block:{" "}
            <span className="text-white font-mono">
              {vaultState?.currentBlock || "..."}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Active wallet:{" "}
            <span className="text-white font-mono">
              {wallet.stxAddress || "..."}
            </span>
          </div>
        </div>
      </div>

      {/* Routing Rules Configuration */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-6">
          Configure Routing Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lock Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-400 uppercase">
              Lock Settings
            </h4>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Lock Amount (USDCx)
              </label>
              <input
                type="number"
                value={lockAmount}
                onChange={(e) => setLockAmount(e.target.value)}
                placeholder="0.00"
                step="0.000001"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Lock Duration (blocks)
              </label>
              <input
                type="number"
                value={lockBlocks}
                onChange={(e) => setLockBlocks(e.target.value)}
                placeholder="e.g., 100"
                step="1"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
              {vaultState?.currentBlock && lockBlocksValue > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Will lock until block #{vaultState.currentBlock + lockBlocksValue}
                </p>
              )}
              {lockAmountValue > 0 && lockBlocksValue <= 0 && (
                <p className="text-xs text-yellow-400 mt-1">
                  Lock duration must be greater than 0 when lock amount is set.
                </p>
              )}
            </div>
          </div>

          {/* Split Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-400 uppercase">
              Split Settings
            </h4>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Split To Address
              </label>
              <input
                type="text"
                value={splitAddress}
                onChange={(e) => setSplitAddress(e.target.value)}
                placeholder="ST..."
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white font-mono text-sm focus:border-purple-500 focus:outline-none"
              />
              {splitAmountValue > 0 && !splitAddress && (
                <p className="text-xs text-yellow-400 mt-1">
                  Split address is required when split amount is greater than 0.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Split Amount (USDCx)
              </label>
              <input
                type="number"
                value={splitAmount}
                onChange={(e) => setSplitAmount(e.target.value)}
                placeholder="0.00"
                step="0.000001"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSetRoutingRules}
            disabled={isLoading || !canSubmitRules}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? "Setting Rules..." : "Set Routing Rules"}
          </button>
          <button
            onClick={handleClearRules}
            disabled={isLoading}
            className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            Clear Rules
          </button>
        </div>
      </div>

      {/* Current Routing Rules */}
      {vaultState && (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">
            Current Routing Rules
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Lock Amount:</span>
              <p className="text-white font-medium">
                {formatBalance(vaultState.routingRules.lockAmount)} USDCx
              </p>
            </div>
            <div>
              <span className="text-gray-400">Lock Until Block:</span>
              <p className="text-white font-medium">
                {vaultState.routingRules.lockUntilBlock || "Not set"}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Split To:</span>
              <p className="text-white font-medium font-mono text-xs">
                {vaultState.routingRules.splitAddress
                  ? `${vaultState.routingRules.splitAddress.slice(0, 8)}...`
                  : "Not set"}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Split Amount:</span>
              <p className="text-white font-medium">
                {formatBalance(vaultState.routingRules.splitAmount)} USDCx
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Deposit / Withdraw */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Deposit</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Amount (USDCx)
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
                step="0.000001"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleDeposit}
              disabled={isLoading || !depositAmount}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Deposit to Vault"}
            </button>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Withdraw</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Amount (USDCx)
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                step="0.000001"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {formatBalance(vaultState?.unlockedBalance || 0)} USDCx
              </p>
            </div>
            <button
              onClick={handleWithdraw}
              disabled={isLoading || !withdrawAmount}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Withdraw from Vault"}
            </button>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="text-gray-400 hover:text-white text-sm underline"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}
