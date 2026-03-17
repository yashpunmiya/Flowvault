"use client";

import { useEffect, useMemo, useState } from "react";
import { connect, disconnect, getLocalStorage, isConnected, request } from "@stacks/connect";
import {
  contractPrincipalCV,
  noneCV,
  principalCV,
  someCV,
  uintCV,
} from "@stacks/transactions";
import { extractStxAddress } from "@/lib/wallet";

interface VaultState {
  totalBalance: number;
  lockedBalance: number;
  unlockedBalance: number;
  lockUntilBlock: number;
  currentBlock: number;
  routingRules: {
    lockAmount: number;
    lockUntilBlock: number;
    splitAddress: string | null;
    splitAmount: number;
  };
}

interface ApiError {
  name?: string;
  message?: string;
  code?: unknown;
}

const DEFAULT_MODE = "allow" as const;
const MICRO_MULTIPLIER = 1_000_000n;

function tokenToMicroString(tokens: string): string {
  const trimmed = tokens.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error("Token amount must be a decimal string, example: 1.5");
  }

  const [whole, fraction = ""] = trimmed.split(".");
  if (fraction.length > 6) {
    throw new Error("Token amount supports up to 6 decimal places");
  }

  const padded = fraction.padEnd(6, "0");
  return (BigInt(whole) * MICRO_MULTIPLIER + BigInt(padded || "0")).toString();
}

function microToTokenString(micro: number): string {
  const value = BigInt(String(micro));
  const whole = value / MICRO_MULTIPLIER;
  const fraction = value % MICRO_MULTIPLIER;
  if (fraction === 0n) return whole.toString();

  return `${whole.toString()}.${fraction
    .toString()
    .padStart(6, "0")
    .replace(/0+$/, "")}`;
}

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

  useEffect(() => {
    if (!isConnected()) return;
    const stored = getLocalStorage();
    const address = extractStxAddress(stored?.addresses);
    setWalletAddress(address);
  }, []);

  async function callFlowVaultApi(action: string, payload: Record<string, unknown>) {
    const response = await fetch("/api/flowvault", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, payload }),
    });

    const data = (await response.json()) as {
      ok: boolean;
      data?: unknown;
      error?: ApiError;
    };

    if (!response.ok || !data.ok) {
      const errorMessage = data.error?.message ?? "Request failed";
      const errorName = data.error?.name;
      throw new Error(errorName ? `${errorName}: ${errorMessage}` : errorMessage);
    }

    return data.data;
  }

  async function handleConnect() {
    setError("");
    setStatus("");
    setIsConnecting(true);

    try {
      const response = await connect({ network, forceWalletSelect: true });
      const address = extractStxAddress(response.addresses);
      setWalletAddress(address);
      setStatus(address ? `Connected: ${address}` : "Connected");
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

    setIsBusy(true);

    try {
      const lockAmountMicro = tokenToMicroString(lockAmountTokens || "0");
      const splitAmountMicro = tokenToMicroString(splitAmountTokens || "0");
      const lockBlock = Number(lockUntilBlock);

      const splitAddressTrimmed = splitAddress.trim();

      const result = await request("stx_callContract", {
        contract: `${flowvaultAddress}.${flowvaultName}`,
        functionName: "set-routing-rules",
        functionArgs: [
          uintCV(BigInt(lockAmountMicro)),
          uintCV(BigInt(lockBlock)),
          splitAddressTrimmed.length > 0
            ? someCV(principalCV(splitAddressTrimmed))
            : noneCV(),
          uintCV(BigInt(splitAmountMicro)),
        ],
        network,
        postConditionMode,
      });

      const txid = extractTxId(result);
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

    setIsBusy(true);

    try {
      const amountMicro = tokenToMicroString(depositTokens || "0");

      const result = await request("stx_callContract", {
        contract: `${flowvaultAddress}.${flowvaultName}`,
        functionName: "deposit",
        functionArgs: [
          contractPrincipalCV(tokenAddress, tokenName),
          uintCV(BigInt(amountMicro)),
        ],
        network,
        postConditionMode,
      });

      const txid = extractTxId(result);
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

    setIsBusy(true);

    try {
      const amountMicro = tokenToMicroString(withdrawTokens || "0");

      const result = await request("stx_callContract", {
        contract: `${flowvaultAddress}.${flowvaultName}`,
        functionName: "withdraw",
        functionArgs: [
          contractPrincipalCV(tokenAddress, tokenName),
          uintCV(BigInt(amountMicro)),
        ],
        network,
        postConditionMode,
      });

      const txid = extractTxId(result);
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

    setIsBusy(true);

    try {
      const state = (await callFlowVaultApi("getVaultState", {
        userAddress: walletAddress,
      })) as VaultState;

      setVaultState(state);
      setStatus("Vault state loaded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vault state");
    } finally {
      setIsBusy(false);
    }
  }

  function formatMicro(micro: number): string {
    return `${microToTokenString(micro)} USDCx (${micro} micro)`;
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
            lockUntilBlock
            <input
              type="number"
              value={lockUntilBlock}
              onChange={(e) => setLockUntilBlock(e.target.value)}
              placeholder="210000"
            />
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
          Write actions are signed by the connected wallet. Read actions are fetched
          through the server API using flowvault-sdk read-only methods.
        </p>
      </section>
    </main>
  );
}
