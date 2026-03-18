"use client";

import { useEffect, useMemo, useState } from "react";
import { connect, disconnect, getLocalStorage, isConnected, request } from "@stacks/connect";
import { FlowVault, microToToken, tokenToMicro, type VaultState } from "flowvault-sdk";
import { extractStxAddress } from "@/lib/wallet";

const DEFAULT_MODE = "allow" as const;

function extractTxId(result: unknown): string | null {
  if (!result || typeof result !== "object") return null;
  const value = result as Record<string, unknown>;
  if (typeof value.txid === "string") return value.txid;
  if (typeof value.txId === "string") return value.txId;
  if (typeof value.id === "string") return value.id;
  return null;
}

export function FlowVaultDemo() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [isRefreshingBlock, setIsRefreshingBlock] = useState(false);
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);

  const [lockAmountTokens, setLockAmountTokens] = useState("0");
  const [lockUntilBlock, setLockUntilBlock] = useState("");
  const [splitAddress, setSplitAddress] = useState("");
  const [splitAmountTokens, setSplitAmountTokens] = useState("0");

  const [depositTokens, setDepositTokens] = useState("1");
  const [withdrawTokens, setWithdrawTokens] = useState("1");
  const [postConditionMode, setPostConditionMode] =
    useState<typeof DEFAULT_MODE | "deny">(DEFAULT_MODE);

  const [vaultState, setVaultState] = useState<VaultState | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const network = useMemo(() => {
    return (process.env.NEXT_PUBLIC_FLOWVAULT_NETWORK ?? "testnet") as
      | "testnet"
      | "mainnet";
  }, []);

  const flowvaultAddress = process.env.NEXT_PUBLIC_FLOWVAULT_CONTRACT_ADDRESS ?? "";
  const flowvaultName = process.env.NEXT_PUBLIC_FLOWVAULT_CONTRACT_NAME ?? "flowvault";
  const tokenAddress = process.env.NEXT_PUBLIC_FLOWVAULT_TOKEN_CONTRACT_ADDRESS ?? "";
  const tokenName = process.env.NEXT_PUBLIC_FLOWVAULT_TOKEN_CONTRACT_NAME ?? "usdcx";

  const canWrite =
    flowvaultAddress.length > 0 &&
    flowvaultName.length > 0 &&
    tokenAddress.length > 0 &&
    tokenName.length > 0;

  const flowVault = useMemo(() => {
    if (!canWrite) return null;

    return new FlowVault({
      network,
      contractAddress: flowvaultAddress,
      contractName: flowvaultName,
      tokenContractAddress: tokenAddress,
      tokenContractName: tokenName,
      senderAddress: walletAddress ?? undefined,
      contractCallExecutor: async (call) => {
        const postConditionMode = String(call.postConditionMode ?? "allow")
          .toLowerCase()
          .includes("deny")
          ? "deny"
          : "allow";

        return request("stx_callContract", {
          contract: `${call.contractAddress}.${call.contractName}`,
          functionName: call.functionName,
          functionArgs: call.functionArgs,
          network: call.network,
          postConditionMode,
          postConditions: call.postConditions,
        });
      },
    });
  }, [
    canWrite,
    flowvaultAddress,
    flowvaultName,
    network,
    tokenAddress,
    tokenName,
    walletAddress,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentBlock() {
      if (!walletAddress || !flowVault) {
        setCurrentBlock(null);
        return;
      }

      setIsRefreshingBlock(true);

      try {
        const height = await flowVault.getCurrentBlockHeight(walletAddress);
        if (!cancelled) {
          setCurrentBlock(height);
        }
      } catch {
        if (!cancelled) {
          setCurrentBlock(null);
        }
      } finally {
        if (!cancelled) {
          setIsRefreshingBlock(false);
        }
      }
    }

    void loadCurrentBlock();

    return () => {
      cancelled = true;
    };
  }, [walletAddress, flowVault]);

  async function handleRefreshCurrentBlock() {
    setError("");
    setStatus("");

    if (!walletAddress || !flowVault) {
      setError("Connect wallet first.");
      return;
    }

    setIsRefreshingBlock(true);

    try {
      const height = await flowVault.getCurrentBlockHeight(walletAddress);
      setCurrentBlock(height);
      setStatus(`Current block: ${height}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch current block");
    } finally {
      setIsRefreshingBlock(false);
    }
  }

  useEffect(() => {
    if (!isConnected()) return;
    const stored = getLocalStorage();
    const address = extractStxAddress(stored?.addresses);
    setWalletAddress(address);
  }, []);

  async function handleConnect() {
    setError("");
    setStatus("");
    setIsConnecting(true);

    try {
      const response = await connect({ network, forceWalletSelect: true });
      const address = extractStxAddress(response.addresses);
      if (!address) {
        throw new Error(
          "Connected wallet did not return a Stacks address. Please select an STX account in your wallet."
        );
      }
      setWalletAddress(address);
      setStatus(`Connected: ${address}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }

  function handleDisconnect() {
    disconnect();
    setWalletAddress(null);
    setVaultState(null);
    setStatus("Disconnected");
    setError("");
  }

  async function handleSetRoutingRules(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!walletAddress) {
      setError("Connect wallet first.");
      return;
    }
    if (!canWrite) {
      setError("Missing NEXT_PUBLIC contract config in .env.local.");
      return;
    }
    if (!flowVault) {
      setError("Failed to initialize FlowVault SDK.");
      return;
    }

    setIsBusy(true);

    try {
      const lockAmountMicro = tokenToMicro(lockAmountTokens || "0");
      const splitAmountMicro = tokenToMicro(splitAmountTokens || "0");
      const lockInput = Number(lockUntilBlock);
      let lockBlock = 0;

      if (lockAmountMicro > 0n) {
        if (!Number.isFinite(lockInput) || !Number.isInteger(lockInput) || lockInput <= 0) {
          throw new Error(
            "When lockAmount > 0, enter a positive number for lockUntilBlock (duration in blocks or absolute height)."
          );
        }

        const latestBlock = await flowVault.getCurrentBlockHeight(walletAddress);
        setCurrentBlock(latestBlock);

        // Keep compatibility with the original app: small values are treated as duration blocks.
        lockBlock = lockInput > latestBlock ? lockInput : latestBlock + lockInput;
      } else {
        if (!Number.isFinite(lockInput) || !Number.isInteger(lockInput) || lockInput < 0) {
          throw new Error("lockUntilBlock must be a non-negative integer.");
        }
        lockBlock = lockInput;
      }

      const splitAddressTrimmed = splitAddress.trim();

      const result = await flowVault.setRoutingRules(
        {
          lockAmount: lockAmountMicro,
          lockUntilBlock: lockBlock,
          splitAddress:
            splitAddressTrimmed.length > 0 ? splitAddressTrimmed : null,
          splitAmount: splitAmountMicro,
        },
        {
          postConditionMode,
        }
      );

      const txid = extractTxId(result.txId);
      setStatus(
        txid
          ? `Routing rules transaction submitted: ${txid}`
          : "Routing rules transaction submitted in wallet"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set routing rules");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!walletAddress) {
      setError("Connect wallet first.");
      return;
    }
    if (!canWrite) {
      setError("Missing NEXT_PUBLIC contract config in .env.local.");
      return;
    }
    if (!flowVault) {
      setError("Failed to initialize FlowVault SDK.");
      return;
    }

    setIsBusy(true);

    try {
      const amountMicro = tokenToMicro(depositTokens || "0");

      const result = await flowVault.deposit(amountMicro, {
        postConditionMode,
      });

      const txid = extractTxId(result.txId);
      setStatus(
        txid
          ? `Deposit transaction submitted: ${txid}`
          : "Deposit transaction submitted in wallet"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deposit");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!walletAddress) {
      setError("Connect wallet first.");
      return;
    }
    if (!canWrite) {
      setError("Missing NEXT_PUBLIC contract config in .env.local.");
      return;
    }
    if (!flowVault) {
      setError("Failed to initialize FlowVault SDK.");
      return;
    }

    setIsBusy(true);

    try {
      const amountMicro = tokenToMicro(withdrawTokens || "0");

      const result = await flowVault.withdraw(amountMicro, {
        postConditionMode,
      });

      const txid = extractTxId(result.txId);
      setStatus(
        txid
          ? `Withdraw transaction submitted: ${txid}`
          : "Withdraw transaction submitted in wallet"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to withdraw");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleFetchVaultState() {
    setError("");
    setStatus("");

    if (!walletAddress) {
      setError("Connect wallet first so the app knows which address to query.");
      return;
    }
    if (!flowVault) {
      setError("Failed to initialize FlowVault SDK.");
      return;
    }

    setIsBusy(true);

    try {
      const state = await flowVault.getVaultState(walletAddress);

      setVaultState(state);
      setStatus("Vault state loaded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vault state");
    } finally {
      setIsBusy(false);
    }
  }

  function formatMicro(micro: number): string {
    return `${microToToken(String(micro))} USDCx (${micro} micro)`;
  }

  return (
    <main className="container">
      <h1>FlowVault SDK Demo</h1>
      <p className="subtitle">
        Minimal official example for wallet connection and FlowVault SDK calls.
      </p>

      <section className="card">
        <h2>1) Wallet</h2>
        {!walletAddress ? (
          <button disabled={isConnecting || isBusy} onClick={handleConnect}>
            {isConnecting ? "Connecting..." : "Connect Leather / Hiro"}
          </button>
        ) : (
          <div className="row">
            <span className="mono">{walletAddress}</span>
            <button disabled={isBusy} onClick={handleDisconnect}>
              Disconnect
            </button>
          </div>
        )}
      </section>

      <section className="card">
        <h2>2) Transaction Options</h2>
        <label>
          Post condition mode
          <select
            value={postConditionMode}
            onChange={(e) => setPostConditionMode(e.target.value as "allow" | "deny")}
          >
            <option value="allow">allow</option>
            <option value="deny">deny</option>
          </select>
        </label>
      </section>

      <section className="card">
        <h2>3) Set Routing Rules</h2>
        <form onSubmit={handleSetRoutingRules} className="form">
          <label>
            lockAmount (tokens)
            <input
              value={lockAmountTokens}
              onChange={(e) => setLockAmountTokens(e.target.value)}
              placeholder="100"
            />
          </label>

          <label>
            lockUntilBlock (duration or absolute)
            <input
              type="number"
              value={lockUntilBlock}
              onChange={(e) => setLockUntilBlock(e.target.value)}
              placeholder="144 or 3902000"
            />
            <small className="hint">
              {currentBlock === null
                ? "Enter duration (e.g. 144) or absolute block."
                : `Current block: ${currentBlock}. If value is <= current block, it is treated as duration.`}
            </small>
            <div className="row">
              <button
                disabled={isBusy || isRefreshingBlock || !walletAddress}
                onClick={handleRefreshCurrentBlock}
                type="button"
              >
                {isRefreshingBlock ? "Refreshing..." : "Refresh current block"}
              </button>
            </div>
          </label>

          <label>
            splitAddress (optional)
            <input
              value={splitAddress}
              onChange={(e) => setSplitAddress(e.target.value)}
              placeholder="ST..."
            />
          </label>

          <label>
            splitAmount (tokens)
            <input
              value={splitAmountTokens}
              onChange={(e) => setSplitAmountTokens(e.target.value)}
              placeholder="50"
            />
          </label>

          <button disabled={isBusy || !walletAddress || !canWrite} type="submit">
            Set routing rules
          </button>
        </form>
      </section>

      <section className="card">
        <h2>4) Deposit</h2>
        <form onSubmit={handleDeposit} className="inline-form">
          <input
            value={depositTokens}
            onChange={(e) => setDepositTokens(e.target.value)}
            placeholder="500"
          />
          <button disabled={isBusy || !walletAddress || !canWrite} type="submit">
            Deposit
          </button>
        </form>
      </section>

      <section className="card">
        <h2>5) Read Vault State</h2>
        <button disabled={isBusy || !walletAddress} onClick={handleFetchVaultState}>
          Fetch vault state for connected address
        </button>

        {vaultState && (
          <div className="state">
            <p>Total: {formatMicro(vaultState.totalBalance)}</p>
            <p>Locked: {formatMicro(vaultState.lockedBalance)}</p>
            <p>Unlocked: {formatMicro(vaultState.unlockedBalance)}</p>
            <p>Lock expiry block: {vaultState.lockUntilBlock}</p>
            <p>Current block: {vaultState.currentBlock}</p>
            <p>Rule lockAmount: {formatMicro(Number(vaultState.routingRules.lockAmount))}</p>
            <p>Rule splitAmount: {formatMicro(Number(vaultState.routingRules.splitAmount))}</p>
            <p>Rule splitAddress: {vaultState.routingRules.splitAddress ?? "none"}</p>
          </div>
        )}
      </section>

      <section className="card">
        <h2>6) Withdraw</h2>
        <form onSubmit={handleWithdraw} className="inline-form">
          <input
            value={withdrawTokens}
            onChange={(e) => setWithdrawTokens(e.target.value)}
            placeholder="200"
          />
          <button disabled={isBusy || !walletAddress || !canWrite} type="submit">
            Withdraw
          </button>
        </form>
      </section>

      {status && <p className="ok">{status}</p>}
      {error && <p className="error">{error}</p>}

      <section className="card note">
        <p>
          This demo uses FlowVault SDK directly for both write and read actions.
          Writes are delegated to the connected wallet via contractCallExecutor.
        </p>
      </section>
    </main>
  );
}
