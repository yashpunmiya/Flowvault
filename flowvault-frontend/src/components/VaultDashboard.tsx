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
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1A1A1D] to-black border border-white/10 flex items-center justify-center relative z-10 shadow-2xl">
            <svg className="w-10 h-10 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <div className="max-w-md mx-auto space-y-3">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Connect Secure Wallet
          </h2>
          <p className="text-white/50 leading-relaxed">
            FlowVault requires a Stacks wallet connection to authenticate and interact with your on-chain vault.
          </p>
        </div>
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
    <div className="space-y-6 animate-slide-up">
      {/* Error/Notice Banners - Absolute positioned or fixed logic would be better but keeping inline for simplicity */}
      {(readError || validationError || error) && (
        <div className="animate-fade-in space-y-2">
          {readError && <div className="bg-orange-500/10 border border-orange-500/20 text-orange-200 px-6 py-4 rounded-xl backdrop-blur-md">{readError}</div>}
          {validationError && <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 px-6 py-4 rounded-xl backdrop-blur-md">{validationError}</div>}
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-xl backdrop-blur-md">{error}</div>}
        </div>
      )}

      {/* TOP ROW: Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Wallet Balance (Smaller) */}
        <div className="md:col-span-4 glass-card-strong p-6 rounded-[20px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 blur-[40px] rounded-full group-hover:bg-green-500/20 transition-all duration-500" />
          <div className="flex flex-col h-full justify-between gap-4">
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Wallet Balance
              </h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white tracking-tight">{formatBalance(usdcxBalance)}</span>
                <span className="text-sm font-medium text-white/40">USDCx</span>
              </div>
            </div>
            <button
              onClick={handleFaucet}
              disabled={isLoading}
              className="self-start px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs font-medium text-green-400 hover:bg-green-500/20 transition-colors"
            >
              Request Test Tokens
            </button>
          </div>
        </div>

        {/* Vault Total (Highlighted) */}
        <div className="md:col-span-4 glass-card-strong p-6 rounded-[20px] relative overflow-hidden group border-primary/20">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-[60px] rounded-full group-hover:bg-primary/20 transition-all duration-500" />
          <div className="flex flex-col h-full justify-center">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Total Vault Assets
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white tracking-tight tabular-nums">{formatBalance(vaultState?.totalBalance || 0)}</span>
              <span className="text-sm font-medium text-white/40">USDCx</span>
            </div>
          </div>
        </div>

        {/* Locked Status */}
        <div className="md:col-span-4 glass-card-strong p-6 rounded-[20px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-[50px] rounded-full group-hover:bg-secondary/20 transition-all duration-500" />
          <div>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Liquidity Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-white/30 uppercase block mb-1">Unlocked</span>
                <span className="text-xl font-bold text-white">{formatBalance(vaultState?.unlockedBalance || 0)}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/30 uppercase block mb-1">Locked</span>
                <span className="text-xl font-bold text-white/60">{formatBalance(vaultState?.lockedBalance || 0)}</span>
              </div>
            </div>
            {vaultState && vaultState.lockUntilBlock > vaultState.currentBlock && (
              <div className="mt-4 flex items-center gap-2 px-2 py-1 rounded bg-secondary/10 border border-secondary/20 w-fit">
                <span className="text-[10px] font-medium text-secondary-foreground">🔒 Locked until #{vaultState.lockUntilBlock}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Router Configuration (8 cols) */}
        <div className="lg:col-span-8 glass-card-strong p-8 rounded-[24px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/10 border border-primary/20 flex items-center justify-center text-primary">⚙️</span>
              Routing Strategy
            </h3>

            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="px-3 py-1.5 rounded-full bg-black/40 border border-white/5 text-white/40 font-mono">
                Block #{vaultState?.currentBlock || "..."}
              </div>
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="text-white/40 hover:text-white transition-colors flex items-center gap-1"
              >
                REFRESH ↻
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            {/* Vertical divider for large screens */}
            <div className="hidden md:block absolute top-0 bottom-0 left-[50%] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent transfor -translate-x-1/2" />

            {/* Lock Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-purple-500/20 text-purple-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>
                <h4 className="text-sm font-semibold text-white/80">Time Lock</h4>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-white/40 ml-1">Lock Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={lockAmount}
                    onChange={(e) => setLockAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-field pl-4 pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-white/30">USDCx</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-white/40 ml-1">Duration (Blocks)</label>
                <input
                  type="number"
                  value={lockBlocks}
                  onChange={(e) => setLockBlocks(e.target.value)}
                  placeholder="e.g. 144"
                  className="input-field"
                />
                <p className="text-[10px] text-white/30 ml-1">
                  ~{(Number(lockBlocks || 0) * 10) / 60} minutes at current block time
                </p>
              </div>
            </div>

            {/* Split Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-blue-500/20 text-blue-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></div>
                <h4 className="text-sm font-semibold text-white/80">Auto-Split</h4>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-white/40 ml-1">Recipient Address</label>
                <input
                  type="text"
                  value={splitAddress}
                  onChange={(e) => setSplitAddress(e.target.value)}
                  placeholder="ST..."
                  className="input-field font-mono text-xs"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-white/40 ml-1">Split Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={splitAmount}
                    onChange={(e) => setSplitAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-field pl-4 pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-white/30">USDCx</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
            <button
              onClick={handleSetRoutingRules}
              disabled={isLoading || !canSubmitRules}
              className="btn-primary flex-1 shadow-lg shadow-primary/20"
            >
              {isLoading ? "Broadcasting..." : "Update Vault Strategy"}
            </button>
            <button
              onClick={handleClearRules}
              disabled={isLoading}
              className="btn-secondary px-8 text-white/60 hover:text-white"
            >
              Reset Default
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Status & Quick Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Active Strategy Mini-Card */}
          {vaultState && (
            <div className="glass-card-strong p-6 rounded-[24px] border-l-2 border-l-primary/50">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Active Strategy</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">Locked Amount</span>
                  <span className="text-sm font-mono font-bold text-white">{formatBalance(vaultState.routingRules.lockAmount)}</span>
                </div>
                <div className="w-full h-px bg-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">Unlock Block</span>
                  <span className="text-sm font-mono font-bold text-secondary">{vaultState.routingRules.lockUntilBlock || "—"}</span>
                </div>
                <div className="w-full h-px bg-white/5" />
                <div>
                  <span className="text-xs text-white/60 block mb-1">Split Recipient</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500/50"></div>
                    <span className="text-xs font-mono text-white/80 truncate">
                      {vaultState.routingRules.splitAddress ? `${vaultState.routingRules.splitAddress.slice(0, 8)}...` : "None"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="glass-card-strong p-6 rounded-[24px]">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Manage Funds</h3>
            <div className="space-y-4">
              {/* Deposit Group */}
              <div className="space-y-2">
                <label className="text-[10px] text-white/30 uppercase font-semibold ml-1">Inflow</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-field py-2.5 text-sm"
                  />
                  <button
                    onClick={handleDeposit}
                    disabled={isLoading || !depositAmount}
                    className="bg-[#00D67D] hover:bg-[#00BD6F] text-black font-bold px-4 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    Deposit
                  </button>
                </div>
              </div>

              <div className="w-full h-px bg-white/5 my-2" />

              {/* Withdraw Group */}
              <div className="space-y-2">
                <label className="text-[10px] text-white/30 uppercase font-semibold ml-1">Outflow</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-field py-2.5 text-sm"
                  />
                  <button
                    onClick={handleWithdraw}
                    disabled={isLoading || !withdrawAmount}
                    className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold px-4 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
