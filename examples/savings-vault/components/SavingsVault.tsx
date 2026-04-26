"use client";

import { useMemo, useState } from "react";
import { WalletButton } from "@/components/WalletButton";
import { useSavingsVault } from "@/hooks/useSavingsVault";
import { useStacksWallet } from "@/hooks/useStacksWallet";
import {
  LOCK_DURATION_BLOCKS,
  calculateSavingsBreakdown,
  formatUsdcx,
  parseDepositAmount,
} from "@/lib/strategy";
import { FLOWVAULT_NETWORK } from "@/lib/config";

export function SavingsVault() {
  const [depositAmount, setDepositAmount] = useState("");
  const wallet = useStacksWallet();
  const savingsVault = useSavingsVault(wallet.address);

  const parsedAmount = useMemo(() => parseDepositAmount(depositAmount), [depositAmount]);
  const preview = useMemo(
    () =>
      parsedAmount.error
        ? calculateSavingsBreakdown(0n)
        : calculateSavingsBreakdown(parsedAmount.microAmount),
    [parsedAmount.error, parsedAmount.microAmount]
  );

  const pendingMessage =
    savingsVault.step === "strategy"
      ? "Creating savings strategy in wallet..."
      : savingsVault.step === "deposit"
        ? "Submitting deposit in wallet..."
        : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await savingsVault.deposit(depositAmount);
  }

  return (
    <main className="page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="grid-surface" />
      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <div className="mark">
              <img src="/logo.png" alt="FlowVault logo" />
            </div>
            <div>
              <p className="brand-title">FlowVault</p>
              <p className="network">Stacks {FLOWVAULT_NETWORK}</p>
            </div>
          </div>
          <WalletButton />
        </header>

        <section className="app-grid" aria-labelledby="vault-title">
          <div className="left-stack">
            <div className="intro">
              <h1 id="vault-title">Smart Savings Vault</h1>
              <p className="copy">
                Deposit USDCx into FlowVault with one transaction flow. The app locks 80% for 144 blocks and keeps 20% liquid.
              </p>
              <div className="metric-strip">
                <div>
                  <span>80%</span>
                  <small>Locked</small>
                </div>
                <div>
                  <span>20%</span>
                  <small>Liquid</small>
                </div>
                <div>
                  <span>{LOCK_DURATION_BLOCKS}</span>
                  <small>Blocks</small>
                </div>
              </div>
            </div>

            <form className="form panel action-panel" onSubmit={handleSubmit}>
              <div className="panel-heading">
                <div>
                  <h2>Deposit USDCx</h2>
                  <p>Approve strategy creation, then approve the deposit.</p>
                </div>
                <span className="token-badge">USDCx</span>
              </div>

              <div className="field">
                <label htmlFor="deposit-amount">Deposit Amount</label>
                <div className="amount-shell">
                  <input
                    id="deposit-amount"
                    className="amount-input"
                    type="number"
                    min="0"
                    step="0.000001"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(event) => setDepositAmount(event.target.value)}
                  />
                  <span>USDCx</span>
                </div>
              </div>

              <div className="strategy-grid" aria-live="polite">
                <div className="stat stat-locked">
                  <p className="stat-label">80% will be locked</p>
                  <p className="stat-value">{formatUsdcx(preview.lockMicro)}</p>
                  <div className="stat-bar">
                    <span style={{ width: "80%" }} />
                  </div>
                </div>
                <div className="stat stat-liquid">
                  <p className="stat-label">20% will remain liquid</p>
                  <p className="stat-value">{formatUsdcx(preview.liquidMicro)}</p>
                  <div className="stat-bar">
                    <span style={{ width: "20%" }} />
                  </div>
                </div>
              </div>

              {wallet.error && <div className="status error">{wallet.error}</div>}
              {savingsVault.error && <div className="status error">{savingsVault.error}</div>}
              {pendingMessage && <div className="status pending">{pendingMessage}</div>}

              {savingsVault.success && (
                <div className="status success">
                  <div className="success-lines">
                    <strong>{savingsVault.success.message}</strong>
                    <span>{formatUsdcx(savingsVault.success.lockedMicro)} locked</span>
                    <span>{formatUsdcx(savingsVault.success.liquidMicro)} available</span>
                    <span className="tx-line">Strategy tx: {savingsVault.success.strategyTxId}</span>
                    <span className="tx-line">Deposit tx: {savingsVault.success.depositTxId}</span>
                  </div>
                </div>
              )}

              <button
                className="primary deposit-button"
                type="submit"
                disabled={savingsVault.isSubmitting}
              >
                <span className="button-icon" aria-hidden="true">{"->"}</span>
                {savingsVault.isSubmitting ? "Processing..." : "Deposit"}
              </button>
            </form>
          </div>

          <div className="right-stack">
            <section className="panel route-panel" aria-label="Deposit route">
              <div className="panel-heading">
                <div>
                  <h2>Deposit Route</h2>
                  <p>Every deposit is routed by the same savings rule.</p>
                </div>
              </div>

              <div className="route-flow">
                <div className="route-node route-source">
                  <span>Deposit</span>
                  <strong>{depositAmount.trim() ? `${depositAmount} USDCx` : "USDCx"}</strong>
                </div>
                <div className="route-split" aria-hidden="true">
                  <span />
                </div>
                <div className="route-results">
                  <div className="route-node route-locked">
                    <span>Locked</span>
                    <strong>{formatUsdcx(preview.lockMicro)}</strong>
                  </div>
                  <div className="route-node route-liquid">
                    <span>Liquid</span>
                    <strong>{formatUsdcx(preview.liquidMicro)}</strong>
                  </div>
                </div>
              </div>

              <div className="route-note">
                <span>Lock window</span>
                <strong>{LOCK_DURATION_BLOCKS} blocks</strong>
              </div>
            </section>

            <div className="panel strategy-panel">
              <div className="panel-heading">
                <div>
                  <h2>Strategy</h2>
                  <p>Fixed savings allocation for every deposit.</p>
                </div>
              </div>

              <div className="allocation">
                <div className="allocation-track">
                  <span className="allocation-lock" />
                  <span className="allocation-liquid" />
                </div>
                <div className="allocation-labels">
                  <span>Locked</span>
                  <span>Liquid</span>
                </div>
              </div>

              <div className="meta">
                <div className="meta-item">
                  <p className="meta-label">Lock duration</p>
                  <p className="meta-value">{LOCK_DURATION_BLOCKS} blocks</p>
                </div>
                <div className="meta-item">
                  <p className="meta-label">Split amount</p>
                  <p className="meta-value">0 USDCx</p>
                </div>
                <div className="meta-item">
                  <p className="meta-label">SDK sequence</p>
                  <p className="meta-value">{"Strategy -> Deposit"}</p>
                </div>
              </div>

              <div className="timeline">
                <div className={savingsVault.step === "strategy" ? "timeline-step active" : "timeline-step"}>
                  <span>1</span>
                  <p>Create strategy</p>
                </div>
                <div className={savingsVault.step === "deposit" ? "timeline-step active" : "timeline-step"}>
                  <span>2</span>
                  <p>Deposit funds</p>
                </div>
                <div className={savingsVault.success ? "timeline-step active" : "timeline-step"}>
                  <span>3</span>
                  <p>Vault updated</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
