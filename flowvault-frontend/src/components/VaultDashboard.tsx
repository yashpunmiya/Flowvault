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
  } = useFlowVault();

  const [usdcxBalance, setUsdcxBalance] = useState<number>(0);
  const [vaultState, setVaultState] = useState<VaultState | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form states
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
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

  if (!wallet.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1A1A1D] to-black border border-white/10 flex items-center justify-center relative z-10 shadow-2xl">
            <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <div className="max-w-md mx-auto space-y-3">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Connect Secure Wallet
          </h2>
          <p className="text-white/50 leading-relaxed text-sm">
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
      {(readError || validationError || error) && (
        <div className="animate-fade-in space-y-2">
          {readError && <div className="bg-orange-500/10 border border-orange-500/20 text-orange-200 px-6 py-4 rounded-xl backdrop-blur-md">{readError}</div>}
          {validationError && <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 px-6 py-4 rounded-xl backdrop-blur-md">{validationError}</div>}
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-xl backdrop-blur-md">{error}</div>}
        </div>
      )}

      {/* TOP ROW: Stats Cards - Made more compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Wallet Balance */}
        <div className="glass-card-strong p-5 rounded-[20px] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 blur-[40px] rounded-full group-hover:bg-green-500/20 transition-all duration-500" />
          <div className="flex flex-col gap-1 relative z-10">
            <div className="flex justify-between items-start">
              <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                Wallet
              </h3>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-white tracking-tight">{formatBalance(usdcxBalance)}</span>
              <span className="text-xs font-medium text-white/40">USDCx</span>
            </div>
          </div>
        </div>

        {/* Vault Total */}
        <div className="glass-card-strong p-5 rounded-[20px] relative overflow-hidden group border-primary/20 hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-[60px] rounded-full group-hover:bg-primary/20 transition-all duration-500" />
          <div className="flex flex-col gap-1 relative z-10">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(255,94,19,0.5)]"></span>
              Vault Assets
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white tracking-tight tabular-nums">{formatBalance(vaultState?.totalBalance || 0)}</span>
              <span className="text-xs font-medium text-white/40">USDCx</span>
            </div>
          </div>
        </div>

        {/* Liquidity Status */}
        <div className="glass-card-strong p-5 rounded-[20px] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-[50px] rounded-full group-hover:bg-secondary/20 transition-all duration-500" />
          <div className="flex flex-col gap-3 relative z-10">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Liquidity</h3>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] text-white/30 uppercase block mb-0.5">Unlocked</span>
                <span className="text-xl font-bold text-white">{formatBalance(vaultState?.unlockedBalance || 0)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-white/30 uppercase block mb-0.5">Locked</span>
                <span className="text-xl font-bold text-white/60">{formatBalance(vaultState?.lockedBalance || 0)}</span>
              </div>
            </div>
            {vaultState && vaultState.lockUntilBlock > vaultState.currentBlock && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-secondary/10 border border-secondary/20 w-fit">
                <span className="text-[10px] font-bold text-secondary-foreground">🔒 #{vaultState.lockUntilBlock}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Router Configuration (8 cols) */}
        <div className="lg:col-span-8 glass-card-strong p-6 rounded-[24px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-orange-500/10 border border-primary/20 flex items-center justify-center text-primary">⚙️</div>
              Vault Rules
            </h3>
            <div className="flex items-center gap-3 text-xs font-medium">
              <div className="px-3 py-1.5 rounded-full bg-black/40 border border-white/5 text-white/40 font-mono">
                Block #{vaultState?.currentBlock || "..."}
              </div>
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                title="Refresh"
              >
                ↻
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <div className="hidden md:block absolute top-0 bottom-0 left-[50%] w-px bg-white/5 -translate-x-1/2" />

            {/* Lock Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h4 className="text-sm font-bold text-white">Time Lock</h4>
              </div>
              <p className="text-[10px] text-white/40 leading-tight">Funds remain non-withdrawable until the specified block.</p>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/40 uppercase ml-1">Lock Amount</label>
                <div className="relative group">
                  <input
                    type="number"
                    value={lockAmount}
                    onChange={(e) => setLockAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-field pl-4 pr-16 bg-[#0F0F11] focus:bg-[#0A0A0B]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/20">USDCx</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/40 uppercase ml-1">Duration (Blocks)</label>
                <input
                  type="number"
                  value={lockBlocks}
                  onChange={(e) => setLockBlocks(e.target.value)}
                  placeholder="e.g. 144"
                  className="input-field bg-[#0F0F11] focus:bg-[#0A0A0B]"
                />
                <p className="text-[10px] text-white/30 ml-1">~{(Number(lockBlocks || 0) * 10) / 60} minutes</p>
              </div>
            </div>

            {/* Split Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                </div>
                <h4 className="text-sm font-bold text-white">Auto-Split</h4>
              </div>
              <p className="text-[10px] text-white/40 leading-tight">This amount is transferred immediately on deposit.</p>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/40 uppercase ml-1">Recipient Address</label>
                <input
                  type="text"
                  value={splitAddress}
                  onChange={(e) => setSplitAddress(e.target.value)}
                  placeholder="ST..."
                  className="input-field font-mono text-xs bg-[#0F0F11] focus:bg-[#0A0A0B]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/40 uppercase ml-1">Split Amount</label>
                <div className="relative group">
                  <input
                    type="number"
                    value={splitAmount}
                    onChange={(e) => setSplitAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-field pl-4 pr-16 bg-[#0F0F11] focus:bg-[#0A0A0B]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/20">USDCx</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex gap-3">
            <button
              onClick={handleSetRoutingRules}
              disabled={isLoading || !canSubmitRules}
              className="btn-primary flex-1 py-3.5"
            >
              {isLoading ? "Broadcasting..." : "Update Vault Rules"}
            </button>
            <button
              onClick={handleClearRules}
              disabled={isLoading}
              className="px-6 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
            >
              Reset
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Status & Manage Funds (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Manage Funds - Tabbed */}
          <div className="glass-card-strong p-6 rounded-[24px] relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Manage Funds</h3>
              <div className="flex bg-black/40 rounded-lg p-1 border border-white/5 backdrop-blur-sm">
                <button
                  onClick={() => setActiveTab('deposit')}
                  className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all ${activeTab === 'deposit' ? 'bg-[#00D67D]/10 text-[#00D67D] border border-[#00D67D]/20 shadow-lg shadow-[#00D67D]/5' : 'text-white/40 hover:text-white'}`}
                >Deposit</button>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all ${activeTab === 'withdraw' ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 shadow-lg shadow-[#3B82F6]/5' : 'text-white/40 hover:text-white'}`}
                >Withdraw</button>
              </div>
            </div>

            <div className="space-y-5 relative z-10">
              <div className="bg-[#0A0A0B] border border-white/5 rounded-2xl p-4 transition-colors hover:border-white/10">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white/40 font-medium">Amount</span>
                  <span className="text-white/40 font-mono text-[10px]">
                    Available: {activeTab === 'deposit' ? formatBalance(usdcxBalance) : formatBalance(vaultState?.unlockedBalance || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={activeTab === 'deposit' ? depositAmount : withdrawAmount}
                    onChange={(e) => activeTab === 'deposit' ? setDepositAmount(e.target.value) : setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-transparent text-2xl font-bold text-white placeholder-white/10 focus:outline-none w-full font-mono"
                  />
                  <button
                    onClick={() => activeTab === 'deposit' ? setDepositAmount(String(usdcxBalance / 1e6)) : setWithdrawAmount(String(vaultState?.unlockedBalance ? vaultState.unlockedBalance / 1e6 : 0))}
                    className="px-2 py-1 rounded bg-white/5 text-[10px] font-bold text-white/60 hover:text-white hover:bg-white/10 border border-white/5 transition-all uppercase"
                  >
                    Max
                  </button>
                </div>
              </div>

              <button
                onClick={activeTab === 'deposit' ? handleDeposit : handleWithdraw}
                disabled={isLoading || !(activeTab === 'deposit' ? depositAmount : withdrawAmount)}
                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg ${activeTab === 'deposit'
                  ? 'bg-[#00D67D] hover:bg-[#00BD6F] text-black shadow-green-500/20 disabled:bg-[#00D67D]/20'
                  : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-blue-500/20 disabled:bg-[#3B82F6]/20'
                  } disabled:opacity-50 disabled:scale-100 disabled:shadow-none`}
              >
                {isLoading ? 'Processing...' : (activeTab === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal')}
              </button>
            </div>
          </div>

          {/* Active Strategy Mini-Card - Cleaned up */}
          {vaultState && (
            <div className="glass-card-strong p-6 rounded-[24px] border-l-2 border-l-primary/50">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Active Rules</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center group">
                  <span className="text-sm text-white/60 group-hover:text-white transition-colors">Locked Amount</span>
                  <span className="text-sm font-mono font-bold text-white">{formatBalance(vaultState.routingRules.lockAmount)}</span>
                </div>
                <div className="w-full h-px bg-white/5" />
                <div className="flex justify-between items-center group">
                  <span className="text-sm text-white/60 group-hover:text-white transition-colors">Unlock Block</span>
                  <span className="text-sm font-mono font-bold text-secondary">{vaultState.routingRules.lockUntilBlock || "—"}</span>
                </div>
                <div className="w-full h-px bg-white/5" />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">Split Recipient</span>
                  </div>
                  {vaultState.routingRules.splitAddress ? (
                    <span className="text-xs font-mono text-white/80 bg-white/5 px-2 py-1 rounded border border-white/5">
                      {vaultState.routingRules.splitAddress.slice(0, 6)}...{vaultState.routingRules.splitAddress.slice(-4)}
                    </span>
                  ) : (
                    <span className="text-xs text-white/30">None</span>
                  )}
                </div>
              </div>
            </div>
          )}
          {vaultState && (
            <div className="mt-4 flex justify-center">
              <p className="text-[10px] text-white/20 font-medium tracking-tight">
                Interacting with <span className="text-primary/40">USDCx SIP-010</span> Protocol
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
